import { useEffect, useState } from "react";
import { Link } from "react-router";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { getAllComplaints } from "../services/api";
import Icon from "../components/Icons";
import RadarSweep from "../components/ui/amicro/RadarSweep";

import "./LiveMap.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(
  /\/api\/?$/,
  ""
);

const DEFAULT_CENTER = [
  20.2961,
  85.8245,
];

function getEvidenceUrl(evidenceUrl) {
  if (!evidenceUrl) {
    return "";
  }

  if (
    evidenceUrl.startsWith("http://") ||
    evidenceUrl.startsWith("https://")
  ) {
    return evidenceUrl;
  }

  const normalizedPath =
    evidenceUrl.startsWith("/")
      ? evidenceUrl
      : `/${evidenceUrl}`;

  return `${BACKEND_URL}${normalizedPath}`;
}

function getCategoryColor(category) {
  const normalizedCategory =
    String(category || "")
      .toLowerCase()
      .trim();

  if (
    normalizedCategory.includes("road") ||
    normalizedCategory.includes("pothole")
  ) {
    return "#ff625c";
  }

  if (
    normalizedCategory.includes("water")
  ) {
    return "#318dff";
  }

  if (
    normalizedCategory.includes("sanitation") ||
    normalizedCategory.includes("waste")
  ) {
    return "#9a62f5";
  }

  if (
    normalizedCategory.includes("electric")
  ) {
    return "#f5b42c";
  }

  if (
    normalizedCategory.includes("health")
  ) {
    return "#ec5f9c";
  }

  if (
    normalizedCategory.includes("fire") ||
    normalizedCategory.includes("emergency")
  ) {
    return "#ff3838";
  }

  return "#26bb76";
}

function getPriorityClass(priority) {
  const normalizedPriority =
    String(priority || "")
      .toLowerCase();

  if (
    normalizedPriority === "critical"
  ) {
    return "map-priority-critical";
  }

  if (
    normalizedPriority === "high"
  ) {
    return "map-priority-high";
  }

  if (
    normalizedPriority === "medium"
  ) {
    return "map-priority-medium";
  }

  return "map-priority-low";
}

function FitMapToComplaints({
  complaints,
}) {
  const map = useMap();

  useEffect(() => {
    if (!complaints.length) {
      return;
    }

    const positions =
      complaints.map((complaint) => [
        Number(complaint.latitude),
        Number(complaint.longitude),
      ]);

    if (positions.length === 1) {
      map.setView(
        positions[0],
        15
      );

      return;
    }

    map.fitBounds(positions, {
      padding: [45, 45],
      maxZoom: 15,
    });
  }, [complaints, map]);

  return null;
}

function LiveMap() {
  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    setLoading(true);
    setError("");

    try {
      const response =
        await getAllComplaints();

      const allComplaints =
        Array.isArray(
          response.complaints
        )
          ? response.complaints
          : [];

      const complaintsWithLocation =
        allComplaints.filter(
          (complaint) => {
            const latitude =
              Number(
                complaint.latitude
              );

            const longitude =
              Number(
                complaint.longitude
              );

            return (
              Number.isFinite(latitude) &&
              Number.isFinite(longitude) &&
              latitude >= -90 &&
              latitude <= 90 &&
              longitude >= -180 &&
              longitude <= 180
            );
          }
        );

      setComplaints(
        complaintsWithLocation
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load complaint locations. Make sure the NagarSwar backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="live-map-page">
      <header className="live-map-navbar flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="live-map-logo"
          >
            NagarSwar <span>AI</span>
          </Link>

          <RadarSweep size="sm" label="GIS Radar Active" />
        </div>

        <Link
          to="/"
          className="live-map-back"
        >
          ← Back to Home
        </Link>
      </header>

      <main className="live-map-main">
        <section className="live-map-heading">
          <div>
            <p className="live-map-label">
              LIVE CIVIC MONITORING
            </p>

            <h1>
              Live City Map
            </h1>

            <p className="live-map-description">
              Explore real reported civic
              issues with GPS locations
              across the city.
            </p>
          </div>

          <div className="live-map-heading-actions">
            <div className="live-map-counter">
              <strong>
                {complaints.length}
              </strong>

              <span>
                mapped complaints
              </span>
            </div>

            <Link
              to="/report"
              className="live-map-report-button"
            >
              + Report New Issue
            </Link>
          </div>
        </section>

        <section className="live-map-legend">
          <span>
            <Icon name="road" size={14} style={{ color: "#f59e0b" }} />
            Road
          </span>

          <span>
            <Icon name="droplet" size={14} style={{ color: "#38bdf8" }} />
            Water
          </span>

          <span>
            <Icon name="trash" size={14} style={{ color: "#10b981" }} />
            Sanitation
          </span>

          <span>
            <Icon name="zap" size={14} style={{ color: "#eab308" }} />
            Electricity
          </span>

          <span>
            <Icon name="activity" size={14} style={{ color: "#06b6d4" }} />
            Healthcare
          </span>

          <span>
            <Icon name="flame" size={14} style={{ color: "#f43f5e" }} />
            Emergency
          </span>

          <span>
            <Icon name="building" size={14} style={{ color: "#94a3b8" }} />
            Other
          </span>
        </section>

        {loading ? (
          <section className="live-map-message">
            <Icon name="loader" size={38} className="spin-slow" />

            <h2>
              Loading city map...
            </h2>

            <p>
              Fetching complaint locations
              from NagarSwar AI.
            </p>
          </section>
        ) : error ? (
          <section className="live-map-message">
            <Icon name="alert-triangle" size={38} style={{ color: "#f87171" }} />

            <h2>
              Unable to load map data
            </h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={loadComplaints}
            >
              Try Again
            </button>
          </section>
        ) : (
          <>
            {complaints.length === 0 && (
              <div className="live-map-empty-notice">
                No complaints with GPS
                coordinates are available
                yet. New complaints using
                "Use Current Location" will
                automatically appear here.
              </div>
            )}

            <section className="live-map-card">
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={13}
                scrollWheelZoom={true}
                className="nagarswar-map"
              >
                <TileLayer
                  attribution="© OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitMapToComplaints
                  complaints={
                    complaints
                  }
                />

                {complaints.map(
                  (complaint) => {
                    const evidenceUrl =
                      getEvidenceUrl(
                        complaint.evidenceUrl
                      );

                    return (
                      <CircleMarker
                        key={
                          complaint.id
                        }
                        center={[
                          Number(
                            complaint.latitude
                          ),
                          Number(
                            complaint.longitude
                          ),
                        ]}
                        radius={
                          complaint.priority ===
                          "Critical"
                            ? 15
                            : complaint.priority ===
                                "High"
                              ? 13
                              : 11
                        }
                        pathOptions={{
                          color: "#ffffff",
                          weight: 3,
                          fillColor:
                            getCategoryColor(
                              complaint.category
                            ),
                          fillOpacity: 1,
                        }}
                      >
                        <Popup
                          minWidth={260}
                          maxWidth={320}
                        >
                          <div className="map-popup">
                            <div className="map-popup-top">
                              <span className="map-popup-category">
                                {complaint.category ||
                                  "Other Public Issue"}
                              </span>

                              <span
                                className={`map-popup-priority ${getPriorityClass(
                                  complaint.priority
                                )}`}
                              >
                                {complaint.priority ||
                                  "Pending"}
                              </span>
                            </div>

                            <h3>
                              {complaint.title ||
                                "Civic Issue"}
                            </h3>

                            {evidenceUrl && (
                              <a
                                href={
                                  evidenceUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="map-popup-image-link"
                              >
                                <img
                                  src={
                                    evidenceUrl
                                  }
                                  alt={`Evidence for ${complaint.title}`}
                                  className="map-popup-image"
                                />
                              </a>
                            )}

                            <p className="map-popup-description">
                              {complaint.description ||
                                "No description available."}
                            </p>

                            <div className="map-popup-info">
                              <div>
                                <span>
                                  Status
                                </span>

                                <strong>
                                  {complaint.status ||
                                    "Under Review"}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Department
                                </span>

                                <strong>
                                  {complaint.department ||
                                    "Pending Assignment"}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Location
                                </span>

                                <strong>
                                  {complaint.location ||
                                    `${Number(
                                      complaint.latitude
                                    ).toFixed(
                                      5
                                    )}, ${Number(
                                      complaint.longitude
                                    ).toFixed(
                                      5
                                    )}`}
                                </strong>
                              </div>
                            </div>

                            <Link
                              to={`/complaints/${complaint.id}`}
                              className="map-popup-button"
                            >
                              View Complaint →
                            </Link>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  }
                )}
              </MapContainer>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default LiveMap;