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
  { value: "Road and Pothole", label: "Road & Pothole Damage", icon: "road" },
  { value: "Sanitation and Waste", label: "Sanitation & Solid Waste", icon: "trash" },
  { value: "Electricity", label: "Electricity & Utility Poles", icon: "zap" },
  { value: "Public Healthcare", label: "Public Healthcare Impact", icon: "activity" },
  { value: "Water Supply", label: "Water Supply & Sewerage", icon: "droplet" },
  { value: "Fire and Emergency", label: "Fire & Structural Emergency", icon: "flame" },
  { value: "Other Public Issue", label: "General Municipal Concern", icon: "building" },
];

function RecenterLocationMap({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (latitude === null || longitude === null) {
      return;
    }

    map.setView([latitude, longitude], 17, {
      animate: true,
    });
  }, [latitude, longitude, map]);

  return null;
}

function calculateDistanceMeters(firstLat, firstLng, secondLat, secondLng) {
  const earthRadius = 6371000;
  const toRadians = (value) => (value * Math.PI) / 180;

  const lat1 = toRadians(firstLat);
  const lat2 = toRadians(secondLat);
  const deltaLat = toRadians(secondLat - firstLat);
  const deltaLng = toRadians(secondLng - firstLng);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

function buildReadableAddress(data) {
  const address = data?.address || {};

  const parts = [
    address.road || address.pedestrian || address.footway,
    address.neighbourhood || address.quarter,
    address.suburb,
    address.city || address.town || address.village || address.municipality,
    address.state,
    address.postcode,
  ].filter(Boolean);

  const uniqueParts = [...new Set(parts)];

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
  const [selectedCategory, setSelectedCategory] = useState("Road and Pothole");
  const [locationStatus, setLocationStatus] = useState("");
  const [complaintId, setComplaintId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [locationUpdatedAt, setLocationUpdatedAt] = useState(null);
  const [isLookingUpAddress, setIsLookingUpAddress] = useState(false);

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

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setSubmitError("Only JPG, PNG, and WebP evidence photographs are supported.");
      event.target.value = "";
      setEvidenceFile(null);
      setPreview("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Evidence file size must be within 5 MB.");
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
    message = "Live location locked. Coordinates will attach to this complaint."
  ) {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = null;
    setIsTrackingLocation(false);

    if (message) {
      setLocationStatus(message);
    }
  }

  async function reverseGeocodeLocation(lat, lng, force = false) {
    const previous = lastGeocodedLocationRef.current;
    const now = Date.now();
    const hasPrevious = previous.latitude !== null && previous.longitude !== null;

    const movedMeters = hasPrevious
      ? calculateDistanceMeters(previous.latitude, previous.longitude, lat, lng)
      : 999;

    const elapsedMs = now - previous.time;

    if (!force && hasPrevious && movedMeters < 35 && elapsedMs < 25000) {
      return;
    }

    setIsLookingUpAddress(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Geocoding failed");
      }

      const data = await response.json();
      const resolvedAddress = buildReadableAddress(data);

      if (resolvedAddress) {
        setLocation(resolvedAddress);
        lastGeocodedLocationRef.current = {
          latitude: lat,
          longitude: lng,
          time: Date.now(),
        };
      }
    } catch {
      // Fall back to coordinate string if lookup fails
      if (!location) {
        setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } finally {
      setIsLookingUpAddress(false);
    }
  }

  function handleLivePosition(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const acc = position.coords.accuracy;

    setLatitude(lat);
    setLongitude(lng);
    setLocationAccuracy(acc);
    setLocationUpdatedAt(new Date());

    reverseGeocodeLocation(lat, lng);
    setLocationStatus(`GPS Locked (accuracy ±${Math.round(acc)}m)`);
  }

  function startLiveLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }

    if (isTrackingLocation) {
      stopLiveLocation();
      return;
    }

    setSubmitError("");
    setLocationStatus("Acquiring high-accuracy GPS fix…");
    setIsTrackingLocation(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleLivePosition,
      (error) => {
        setIsTrackingLocation(false);
        watchIdRef.current = null;

        if (error.code === 1) {
          setLocationStatus("Location permission was denied. Please enter the address manually.");
        } else {
          setLocationStatus("Unable to acquire live satellite fix. Please enter address manually.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  function handleManualLocationChange(event) {
    if (isTrackingLocation) {
      stopLiveLocation("");
    }

    setLocation(event.target.value);
    setLatitude(null);
    setLongitude(null);
    setLocationAccuracy(null);
    setLocationUpdatedAt(null);
    setLocationStatus("Manual address recorded.");
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    if (isTrackingLocation) {
      stopLiveLocation("Live location finalized.");
    }

    const formData = new FormData(event.currentTarget);
    const complaintData = new FormData();

    complaintData.append("title", formData.get("title"));
    complaintData.append("category", selectedCategory);
    complaintData.append("description", formData.get("description"));
    complaintData.append("location", formData.get("location"));

    if (latitude !== null) {
      complaintData.append("latitude", String(latitude));
    }
    if (longitude !== null) {
      complaintData.append("longitude", String(longitude));
    }
    if (evidenceFile) {
      complaintData.append("evidence", evidenceFile);
    }

    try {
      const response = await submitComplaint(complaintData);
      setComplaintId(response.complaint.id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (String(error.message || "").toLowerCase().includes("authentication")) {
        clearCitizenSession();
        navigate("/login", { replace: true });
        return;
      }
      setSubmitError(error.message || "Unable to submit grievance. Verify backend connectivity.");
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
    setSubmitError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!citizenToken) {
    return <Navigate to="/login" replace />;
  }

  if (submitted) {
    return (
      <div className="report-page">
        <header className="report-navbar">
          <Link to="/" className="report-brand">
            <span className="brand-text">NagarSwar</span>
            <span className="brand-badge">CivicOS</span>
          </Link>
        </header>

        <main className="success-container">
          <section className="submission-success-card">
            <div className="success-icon-wrap">
              <Icon name="check-circle" size={42} />
            </div>

            <span className="success-badge">INCIDENT LOGGED IN MUNICIPAL REGISTER</span>
            <h1>Grievance Record Successfully Filed</h1>
            <p className="success-subtitle">
              Your report has entered the autonomous triage pipeline and is undergoing AI evidence verification.
            </p>

            <div className="reference-pill-box">
              <span className="ref-label">SYSTEM REFERENCE IDENTIFIER</span>
              <strong className="ref-code">{complaintId}</strong>
            </div>

            <div className="success-actions">
              <Link to="/track" className="btn-primary">
                <Icon name="file" size={18} />
                <span>Track Resolution Lifecycle</span>
              </Link>

              <button
                type="button"
                className="btn-secondary"
                onClick={reportAnotherIssue}
              >
                <Icon name="plus" size={18} />
                <span>File Another Report</span>
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
        <div className="report-nav-content">
          <Link to="/" className="report-brand">
            <span className="brand-text">NagarSwar</span>
            <span className="brand-badge">Intake</span>
          </Link>

          <div className="nav-user-area">
            {citizenUser && (
              <span className="user-indicator">
                <Icon name="user" size={15} />
                <span>{citizenUser.firstName} {citizenUser.lastName || ""}</span>
              </span>
            )}

            <Link to="/" className="btn-back">
              <Icon name="arrow-right" size={15} style={{ transform: "rotate(180deg)" }} />
              <span>Back to Portal</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="report-main-grid">
        {/* Left Informational Sidebar */}
        <aside className="report-sidebar">
          <div className="sidebar-pill">
            <Icon name="report" size={14} />
            <span>INCIDENT INTAKE PROTOCOL</span>
          </div>

          <h1>Submit an Infrastructure or Safety Grievance</h1>
          <p className="sidebar-desc">
            Provide precise location, descriptive details, and photographic evidence. NagarSwar AI will automatically authenticate evidence validity, identify duplicate clusters, and route the incident to field authorities.
          </p>

          <div className="protocol-card">
            <div className="protocol-heading">
              <Icon name="shield-check" size={18} />
              <h3>Submission Guidelines</h3>
            </div>
            <ul className="protocol-list">
              <li>
                <Icon name="check" size={14} />
                <span>Report exactly one civic defect per submission.</span>
              </li>
              <li>
                <Icon name="check" size={14} />
                <span>Attach authentic, unedited on-site photographs.</span>
              </li>
              <li>
                <Icon name="check" size={14} />
                <span>Allow GPS tracking for accurate geofence mapping.</span>
              </li>
              <li>
                <Icon name="check" size={14} />
                <span>Verify voice-dictated summaries prior to submit.</span>
              </li>
              <li>
                <Icon name="check" size={14} />
                <span>Refrain from uploading private citizen identity cards.</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Right Form Card */}
        <section className="form-card-container">
          <div className="form-card-header">
            <div className="form-step-badge">
              <Icon name="file" size={16} />
              <span>Form 01 • Incident Specification</span>
            </div>
            <span className="required-notice">* Mandatory municipal fields</span>
          </div>

          <form onSubmit={handleSubmit} className="intake-form">
            {/* Title */}
            <div className="input-group">
              <label htmlFor="complaint-title">
                Incident Title *
              </label>
              <input
                id="complaint-title"
                type="text"
                name="title"
                placeholder="e.g. Hazardous electrical transformer sparking near hospital gate"
                required
                className="form-input"
              />
            </div>

            {/* Category Grid */}
            <div className="input-group">
              <label>Municipal Category *</label>
              <div className="category-selection-grid">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.value;
                  return (
                    <button
                      type="button"
                      key={cat.value}
                      className={`category-tile ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedCategory(cat.value)}
                    >
                      <div className="tile-icon-box">
                        <Icon name={cat.icon} size={18} />
                      </div>
                      <span className="tile-label">{cat.label}</span>
                      {isSelected && <Icon name="check" size={14} className="tile-check" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description & Voice Input */}
            <div className="input-group">
              <label htmlFor="complaint-description">
                Incident Description & Context *
              </label>

              <VoiceInput onTranscript={handleVoiceTranscript} />

              <textarea
                id="complaint-description"
                name="description"
                rows="5"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Detail the civic condition, immediate risks, and landmarks. You may use speech-to-text above..."
                required
                className="form-textarea"
              />
            </div>

            {/* Evidence Photograph */}
            <div className="input-group">
              <label>Photographic Evidence (AI-Verified)</label>
              <div className="evidence-dropzone">
                <input
                  type="file"
                  id="evidence-input"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="file-input-hidden"
                />

                {preview ? (
                  <div className="evidence-preview-wrapper">
                    <img src={preview} alt="Evidence preview" className="evidence-img" />
                    <div className="evidence-overlay">
                      <label htmlFor="evidence-input" className="replace-btn">
                        <Icon name="camera" size={15} />
                        <span>Change Photo</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="evidence-input" className="dropzone-label">
                    <div className="upload-icon-circle">
                      <Icon name="upload" size={24} />
                    </div>
                    <strong>Select or Drop Evidence Photograph</strong>
                    <p>PNG, JPG, or WebP up to 5 MB • Analyzed by Google Gemini Vision</p>
                  </label>
                )}
              </div>
            </div>

            {/* Location Section */}
            <div className="input-group">
              <label htmlFor="issue-location">Location & Geolocation Coordinates *</label>
              <div className="location-control-row">
                <div className="location-input-wrap">
                  <Icon name="pin" size={18} className="input-pin-icon" />
                  <input
                    id="issue-location"
                    type="text"
                    name="location"
                    value={location}
                    onChange={handleManualLocationChange}
                    placeholder="Physical address, landmark, or street name..."
                    required
                    className="form-input with-icon"
                  />
                </div>

                <button
                  type="button"
                  onClick={startLiveLocation}
                  className={`btn-gps ${isTrackingLocation ? "active" : ""}`}
                >
                  <Icon name="pin" size={16} />
                  <span>{isTrackingLocation ? "Stop GPS" : "Acquire GPS"}</span>
                </button>
              </div>

              {locationStatus && (
                <div className="location-status-bar">
                  <Icon name={isLookingUpAddress ? "refresh-cw" : "pin"} size={14} />
                  <span>{isLookingUpAddress ? "Reverse geocoding address… " : ""}{locationStatus}</span>
                </div>
              )}

              {latitude !== null && longitude !== null && (
                <div className="map-preview-panel">
                  <div className="map-header">
                    <div>
                      <span className="map-tag">GIS COORDINATES CONFIRMED</span>
                      <h4>Target Geofence</h4>
                    </div>
                    <div className="locked-pill">
                      <Icon name="check" size={13} />
                      <span>{isTrackingLocation ? "Active Fix" : "Position Locked"}</span>
                    </div>
                  </div>

                  <div className="map-container-frame">
                    <MapContainer
                      center={[latitude, longitude]}
                      zoom={17}
                      scrollWheelZoom={false}
                      className="report-leaflet-map"
                    >
                      <TileLayer
                        attribution="© OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <RecenterLocationMap latitude={latitude} longitude={longitude} />
                      <CircleMarker
                        center={[latitude, longitude]}
                        radius={10}
                        pathOptions={{
                          color: "#ffffff",
                          weight: 3,
                          fillColor: "#10b981",
                          fillOpacity: 1,
                        }}
                      >
                        <Popup>Reported incident coordinate</Popup>
                      </CircleMarker>
                    </MapContainer>
                  </div>

                  <div className="coords-meta-row">
                    <div className="meta-col">
                      <span>COORDINATES</span>
                      <strong>{latitude.toFixed(6)}, {longitude.toFixed(6)}</strong>
                    </div>
                    <div className="meta-col">
                      <span>ACCURACY</span>
                      <strong>{locationAccuracy !== null ? `±${Math.round(locationAccuracy)} m` : "Estimating…"}</strong>
                    </div>
                    <div className="meta-col">
                      <span>TIMESTAMP</span>
                      <strong>{locationUpdatedAt ? locationUpdatedAt.toLocaleTimeString("en-IN") : "Recorded"}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Legal Confirmation */}
            <label className="checkbox-agreement">
              <input type="checkbox" required className="form-checkbox" />
              <span>
                I certify that this public grievance report and attached photographic evidence represent a truthful civic condition within municipal jurisdiction.
              </span>
            </label>

            {/* Error Banner */}
            {submitError && (
              <div className="form-error-banner">
                <Icon name="alert-triangle" size={18} />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-submit-complaint"
              disabled={isSubmitting}
            >
              <Icon name={isSubmitting ? "refresh-cw" : "report"} size={18} className={isSubmitting ? "spinning" : ""} />
              <span>{isSubmitting ? "Authenticating & Submitting…" : "Transmit Municipal Grievance"}</span>
              {!isSubmitting && <Icon name="arrow-right" size={16} />}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default ReportComplaint;