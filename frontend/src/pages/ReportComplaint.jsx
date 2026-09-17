import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Icon from "../components/Icons";
import VoiceInput from "../components/VoiceInput";
import {
  clearCitizenSession,
  getCitizenToken,
  getCitizenUser,
  submitComplaint,
} from "../services/api";
import "./ReportComplaint.css";

const categories = [
  "Road and Pothole",
  "Sanitation and Waste",
  "Electricity",
  "Public Healthcare",
  "Water Supply",
  "Fire and Emergency",
  "Other Public Issue",
];


function RecenterLocationMap({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (
      latitude === null ||
      longitude === null
    ) {
      return;
    }

    map.setView(
      [latitude, longitude],
      17,
      {
        animate: true,
      }
    );
  }, [latitude, longitude, map]);

  return null;
}

function calculateDistanceMeters(
  firstLat,
  firstLng,
  secondLat,
  secondLng
) {
  const earthRadius = 6371000;

  const toRadians = (value) =>
    (value * Math.PI) / 180;

  const lat1 = toRadians(firstLat);
  const lat2 = toRadians(secondLat);
  const deltaLat = toRadians(
    secondLat - firstLat
  );
  const deltaLng = toRadians(
    secondLng - firstLng
  );

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadius * c;
}

function buildReadableAddress(data) {
  const address = data?.address || {};

  const parts = [
    address.road ||
      address.pedestrian ||
      address.footway,
    address.neighbourhood ||
      address.quarter,
    address.suburb,
    address.city ||
      address.town ||
      address.village ||
      address.municipality,
    address.state,
    address.postcode,
  ].filter(Boolean);

  const uniqueParts = [
    ...new Set(parts),
  ];

  return (
    uniqueParts.join(", ") ||
    data?.display_name ||
    ""
  );
}

function ReportComplaint() {
  const navigate = useNavigate();
  const citizenToken = getCitizenToken();
  const citizenUser = getCitizenUser();

  const [preview, setPreview] = useState("");
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [complaintId, setComplaintId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [isTrackingLocation, setIsTrackingLocation] =
    useState(false);

  const [locationAccuracy, setLocationAccuracy] =
    useState(null);

  const [locationUpdatedAt, setLocationUpdatedAt] =
    useState(null);

  const [isLookingUpAddress, setIsLookingUpAddress] =
    useState(false);

  const watchIdRef = useRef(null);

  const lastGeocodedLocationRef = useRef({
    latitude: null,
    longitude: null,
    time: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) {
      setEvidenceFile(null);
      setPreview("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSubmitError(
        "Please select a JPG, PNG or WebP evidence image."
      );
      event.target.value = "";
      setEvidenceFile(null);
      setPreview("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError(
        "Evidence image must be 5 MB or smaller."
      );
      event.target.value = "";
      setEvidenceFile(null);
      setPreview("");
      return;
    }

    setSubmitError("");
    setEvidenceFile(file);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(file));
  }

  function handleVoiceTranscript(spokenText) {
    setDescription((currentDescription) => {
      if (!currentDescription.trim()) {
        return spokenText;
      }

      return `${currentDescription.trim()} ${spokenText}`;
    });
  }

  function stopLiveLocation(
    message = "Live location locked. This issue location will be saved when you submit."
  ) {
    if (
      watchIdRef.current !== null &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(
        watchIdRef.current
      );
    }

    watchIdRef.current = null;
    setIsTrackingLocation(false);

    if (message) {
      setLocationStatus(message);
    }
  }

  async function reverseGeocodeLocation(
    lat,
    lng,
    force = false
  ) {
    const previous =
      lastGeocodedLocationRef.current;

    const now = Date.now();

    const hasPrevious =
      previous.latitude !== null &&
      previous.longitude !== null;

    const movedMeters = hasPrevious
      ? calculateDistanceMeters(
          previous.latitude,
          previous.longitude,
          lat,
          lng
        )
      : Infinity;

    const enoughTimePassed =
      now - previous.time >= 12000;

    if (
      !force &&
      hasPrevious &&
      movedMeters < 25 &&
      !enoughTimePassed
    ) {
      return;
    }

    lastGeocodedLocationRef.current = {
      latitude: lat,
      longitude: lng,
      time: now,
    };

    setIsLookingUpAddress(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          lat
        )}&lon=${encodeURIComponent(
          lng
        )}&zoom=18&addressdetails=1&accept-language=en`
      );

      if (!response.ok) {
        throw new Error(
          "Address lookup failed."
        );
      }

      const data = await response.json();

      const readableAddress =
        buildReadableAddress(data);

      if (readableAddress) {
        setLocation(readableAddress);
      }

      setLocationStatus(
        isTrackingLocation
          ? "Live GPS active. Address and coordinates are updating."
          : "Location captured successfully."
      );
    } catch (error) {
      console.error(
        "Reverse geocoding failed:",
        error
      );

      setLocationStatus(
        "GPS captured. Address lookup is temporarily unavailable, but the coordinates are ready."
      );
    } finally {
      setIsLookingUpAddress(false);
    }
  }

  function handleLivePosition(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy =
      position.coords.accuracy;

    setLatitude(lat);
    setLongitude(lng);

    setLocationAccuracy(
      Number.isFinite(accuracy)
        ? accuracy
        : null
    );

    setLocationUpdatedAt(
      new Date()
    );

    setLocation(
      `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    );

    setLocationStatus(
      "Live GPS active. Finding the nearest address..."
    );

    reverseGeocodeLocation(
      lat,
      lng
    );
  }

  function startLiveLocation() {
    if (!navigator.geolocation) {
      setLocationStatus(
        "Location is not supported by this browser."
      );
      return;
    }

    if (isTrackingLocation) {
      stopLiveLocation();
      return;
    }

    setSubmitError("");
    setLocationStatus(
      "Starting live GPS. Please allow location permission..."
    );
    setIsTrackingLocation(true);

    watchIdRef.current =
      navigator.geolocation.watchPosition(
        handleLivePosition,
        (error) => {
          console.error(
            "Location error:",
            error
          );

          setIsTrackingLocation(false);
          watchIdRef.current = null;

          if (error.code === 1) {
            setLocationStatus(
              "Location permission was denied. Please allow location access or enter the address manually."
            );
          } else {
            setLocationStatus(
              "Unable to detect your location. Please try again or enter it manually."
            );
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
  }

  function handleManualLocationChange(
    event
  ) {
    if (isTrackingLocation) {
      stopLiveLocation("");
    }

    setLocation(event.target.value);

    setLatitude(null);
    setLongitude(null);
    setLocationAccuracy(null);
    setLocationUpdatedAt(null);
    setLocationStatus(
      "Manual address entered. GPS coordinates are not attached unless you use Live Location."
    );
  }

  useEffect(() => {
    return () => {
      if (
        watchIdRef.current !== null &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );
      }
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitError("");
    setIsSubmitting(true);

    if (isTrackingLocation) {
      stopLiveLocation(
        "Live location locked for this complaint."
      );
    }

    const formData = new FormData(event.currentTarget);

    const complaintData = new FormData();

    complaintData.append(
      "title",
      formData.get("title")
    );

    complaintData.append(
      "category",
      formData.get("category")
    );

    complaintData.append(
      "description",
      formData.get("description")
    );

    complaintData.append(
      "location",
      formData.get("location")
    );

    if (latitude !== null) {
      complaintData.append(
        "latitude",
        String(latitude)
      );
    }

    if (longitude !== null) {
      complaintData.append(
        "longitude",
        String(longitude)
      );
    }

    if (evidenceFile) {
      complaintData.append(
        "evidence",
        evidenceFile
      );
    }

    try {
      const response = await submitComplaint(complaintData);

      const savedComplaint = response.complaint;

      setComplaintId(savedComplaint.id);

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(error);

      if (
        String(error.message || "")
          .toLowerCase()
          .includes("authentication")
      ) {
        clearCitizenSession();
        navigate("/login", {
          replace: true,
        });
        return;
      }

      setSubmitError(
        error.message ||
          "Unable to submit complaint. Please make sure the NagarSwar backend is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function reportAnotherIssue() {
    setSubmitted(false);

    setComplaintId("");

    setDescription("");

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview("");

    setEvidenceFile(null);

    setLocation("");

    setLocationStatus("");

    setLatitude(null);

    setLongitude(null);

    setLocationAccuracy(null);

    setLocationUpdatedAt(null);

    setIsLookingUpAddress(false);

    lastGeocodedLocationRef.current = {
      latitude: null,
      longitude: null,
      time: 0,
    };

    setSubmitError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (!citizenToken) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (submitted) {
    return (
      <div className="report-page">
        <header className="report-navbar">
          <Link to="/" className="report-logo">
            NagarSwar <span>AI</span>
          </Link>
        </header>

        <main className="success-container">
          <section className="submission-success">
            <span className="success-icon">
              <Icon name="check" size={48} />
            </span>

            <p className="success-label">COMPLAINT RECEIVED</p>

            <h1>Your complaint has been submitted.</h1>

            <p>Your complaint reference number is:</p>

            <strong className="complaint-reference">
              {complaintId}
            </strong>

            <p className="demo-notice">
              Your complaint and any attached evidence have been
              successfully saved to the NagarSwar AI backend.
            </p>

            <div className="success-actions">
              <Link to="/track" className="home-button">
                Track Complaint
              </Link>

              <button
                type="button"
                className="another-button"
                onClick={reportAnotherIssue}
              >
                Report Another Issue
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="report-page">
      <header className="report-navbar">
        <Link to="/" className="report-logo">
          NagarSwar <span>AI</span>
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {citizenUser && (
            <span
              style={{
                color: "#315b53",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              👤 {citizenUser.firstName}
            </span>
          )}

          <Link to="/" className="back-home">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="report-main">
        <section className="report-introduction">
          <p className="report-label">
            NEW CIVIC COMPLAINT
          </p>

          <h1>Tell us what needs attention.</h1>

          <p>
            Provide clear information, evidence and location.
            NagarSwar AI will help identify the correct
            department and priority.
          </p>

          <div className="report-information">
            <h2>Before submitting</h2>

            <ul>
              <li>
                Describe only one issue per complaint.
              </li>

              <li>
                Upload clear and recent evidence.
              </li>

              <li>
                Provide the correct issue location.
              </li>

              <li>
                Review voice-generated text before submitting.
              </li>

              <li>
                Do not include private or sensitive information.
              </li>
            </ul>
          </div>
        </section>

        <section className="complaint-form-card">
          <div className="form-heading">
            <span>01</span>

            <div>
              <h2>Complaint details</h2>

              <p>
                Fields marked with * are required.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Complaint title *

                <input
                  type="text"
                  name="title"
                  placeholder="Example: Large pothole near college"
                  required
                />
              </label>

              <label>
                Issue category *

                <select
                  name="category"
                  required
                  defaultValue=""
                >
                  <option
                    value=""
                    disabled
                  >
                    Select a category
                  </option>

                  {categories.map((category) => (
                    <option
                      value={category}
                      key={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="description-section">
              <label htmlFor="complaint-description">
                Describe the problem *
              </label>

              <VoiceInput
                onTranscript={handleVoiceTranscript}
              />

              <textarea
                id="complaint-description"
                name="description"
                rows="5"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Type your complaint or use the microphone above..."
                required
              />
            </div>

            <label>
              Evidence photograph

              <div className="evidence-upload">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                />

                {preview ? (
                  <img
                    src={preview}
                    alt="Selected complaint evidence"
                  />
                ) : (
                  <div className="upload-placeholder">
                    <Icon
                      name="file"
                      size={35}
                    />

                    <p>
                      Select a JPG, PNG or WebP image
                    </p>

                    <small>
                      Maximum recommended size: 5 MB
                    </small>
                  </div>
                )}
              </div>
            </label>

            <div className="location-section">
              <label htmlFor="issue-location">
                Issue location *
              </label>

              <div className="location-control">
                <input
                  id="issue-location"
                  type="text"
                  name="location"
                  value={location}
                  onChange={
                    handleManualLocationChange
                  }
                  placeholder="Enter address or use live GPS"
                  required
                />

                <button
                  type="button"
                  onClick={startLiveLocation}
                  className={
                    isTrackingLocation
                      ? "location-stop-button"
                      : ""
                  }
                >
                  <Icon
                    name="pin"
                    size={19}
                  />

                  {isTrackingLocation
                    ? "Stop Live Location"
                    : "Use Live Location"}
                </button>
              </div>

              {locationStatus && (
                <span className="location-status">
                  {isLookingUpAddress
                    ? "Finding address... "
                    : ""}
                  {locationStatus}
                </span>
              )}

              {latitude !== null &&
                longitude !== null && (
                  <div className="live-location-panel">
                    <div className="live-location-heading">
                      <div>
                        <span>
                          LOCATION PREVIEW
                        </span>

                        <h3>
                          Confirm the issue location
                        </h3>
                      </div>

                      <span
                        className={`location-live-badge ${
                          isTrackingLocation
                            ? "active"
                            : "locked"
                        }`}
                      >
                        {isTrackingLocation
                          ? "● Live"
                          : "✓ Locked"}
                      </span>
                    </div>

                    <MapContainer
                      center={[
                        latitude,
                        longitude,
                      ]}
                      zoom={17}
                      scrollWheelZoom={false}
                      className="report-location-map"
                    >
                      <TileLayer
                        attribution="© OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      <RecenterLocationMap
                        latitude={latitude}
                        longitude={longitude}
                      />

                      <CircleMarker
                        center={[
                          latitude,
                          longitude,
                        ]}
                        radius={11}
                        pathOptions={{
                          color: "#ffffff",
                          weight: 3,
                          fillColor: "#0aa370",
                          fillOpacity: 1,
                        }}
                      >
                        <Popup>
                          Complaint location
                        </Popup>
                      </CircleMarker>
                    </MapContainer>

                    <div className="location-meta-grid">
                      <div>
                        <span>
                          GPS COORDINATES
                        </span>

                        <strong>
                          {latitude.toFixed(6)}
                          ,{" "}
                          {longitude.toFixed(6)}
                        </strong>
                      </div>

                      <div>
                        <span>
                          GPS ACCURACY
                        </span>

                        <strong>
                          {locationAccuracy !==
                          null
                            ? `±${Math.round(
                                locationAccuracy
                              )} m`
                            : "Checking..."}
                        </strong>
                      </div>

                      <div>
                        <span>
                          LAST UPDATE
                        </span>

                        <strong>
                          {locationUpdatedAt
                            ? locationUpdatedAt.toLocaleTimeString(
                                "en-IN",
                                {
                                  hour:
                                    "2-digit",
                                  minute:
                                    "2-digit",
                                  second:
                                    "2-digit",
                                }
                              )
                            : "Waiting..."}
                        </strong>
                      </div>
                    </div>

                    <p className="location-tracking-note">
                      Your live position is used
                      only while choosing the
                      complaint location. Tracking
                      stops when you press Stop or
                      submit the complaint; the
                      saved issue location then
                      remains fixed.
                    </p>
                  </div>
                )}
            </div>

            <label className="confirmation-check">
              <input
                type="checkbox"
                required
              />

              <span>
                I confirm that the information provided
                is accurate to the best of my knowledge.
              </span>
            </label>

            {submitError && (
              <div
                style={{
                  padding: "12px 14px",
                  marginBottom: "15px",
                  color: "#a5281d",
                  background: "#ffe5e1",
                  border: "1px solid #efb4ac",
                  borderRadius: "10px",
                  fontWeight: "700",
                }}
              >
                ⚠️ {submitError}
              </div>
            )}

            <button
              type="submit"
              className="submit-complaint"
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              <Icon
                name="report"
                size={21}
              />

              {isSubmitting
                ? "Submitting..."
                : "Submit Complaint"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default ReportComplaint;