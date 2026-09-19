import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router";

import {
  getAllComplaints,
  updateComplaintStatus,
  updateEvidenceReview,
} from "../services/api";
import Icon from "../components/Icons";

import "./AdminDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(
  /\/api\/?$/,
  ""
);

const STATUSES = [
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
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

function formatFileSize(bytes) {
  const size = Number(bytes);

  if (!size || Number.isNaN(size)) {
    return "";
  }

  if (size < 1024) {
    return `${size} bytes`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(
      1
    )} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}


function getCheckTone(status) {
  const text = String(status || "")
    .toLowerCase();

  if (
    text.includes("strong") ||
    text.includes("unique") ||
    text.includes("approved") ||
    text.includes("reviewed") ||
    text.includes("no duplicate") ||
    text.includes("no strong")
  ) {
    return {
      background: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.3)",
      color: "#34d399",
    };
  }

  if (
    text.includes("possible") ||
    text.includes("manual") ||
    text.includes("reused")
  ) {
    return {
      background: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.3)",
      color: "#fbbf24",
    };
  }

  if (
    text.includes("mismatch") ||
    text.includes("unavailable") ||
    text.includes("not configured")
  ) {
    return {
      background: "rgba(244, 63, 94, 0.12)",
      border: "rgba(244, 63, 94, 0.3)",
      color: "#f87171",
    };
  }

  return {
    background: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.12)",
    color: "#94a3b8",
  };
}

function AdminCheckBadge({
  status,
  score,
}) {
  const tone =
    getCheckTone(status);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 10px",
        background: tone.background,
        border: `1px solid ${tone.border}`,
        borderRadius: "999px",
        color: tone.color,
        fontSize: "11px",
        fontWeight: "700",
        fontFamily: "var(--font-mono)",
        lineHeight: 1,
      }}
    >
      {status || "Not analyzed"}

      {score !== null &&
        score !== undefined && (
          <strong>
            {score}/100
          </strong>
        )}
    </span>
  );
}

const adminAiStyles = {
  wrapper: {
    marginTop: "16px",
    padding: "18px",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "14px",
  },

  heading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "14px",
  },

  label: {
    margin: 0,
    color: "var(--accent-primary)",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.2px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
  },

  card: {
    minWidth: 0,
    padding: "14px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "10px",
  },

  title: {
    display: "block",
    marginBottom: "8px",
    color: "var(--text-tertiary)",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: ".8px",
    textTransform: "uppercase",
  },

  meta: {
    margin: "10px 0 0",
    color: "var(--text-secondary)",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  summary: {
    margin: "10px 0 0",
    color: "var(--text-secondary)",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  warning: {
    marginTop: "10px",
    padding: "8px 10px",
    background: "rgba(244, 63, 94, 0.1)",
    border: "1px solid rgba(244, 63, 94, 0.25)",
    borderRadius: "8px",
    color: "#f87171",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "10px",
    color: "var(--accent-primary)",
    fontSize: "12px",
    fontWeight: "700",
    textDecoration: "none",
  },
};

const adminReviewStyles = {
  wrapper: {
    marginTop: "16px",
    padding: "18px",
    background: "rgba(16, 185, 129, 0.03)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    borderRadius: "14px",
  },

  heading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
  },

  label: {
    margin: 0,
    color: "var(--accent-primary)",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.1px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  note: {
    width: "100%",
    minHeight: "72px",
    marginTop: "12px",
    padding: "10px 14px",
    resize: "vertical",
    color: "var(--text-primary)",
    background: "rgba(0, 0, 0, 0.25)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "9px",
    fontFamily: "inherit",
    fontSize: "13px",
    lineHeight: 1.5,
    boxSizing: "border-box",
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  },

  button: {
    minHeight: "38px",
    padding: "8px 14px",
    border: "0",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.15s ease",
  },

  meta: {
    margin: "10px 0 0",
    color: "var(--text-tertiary)",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

const MUNICIPAL_CATEGORIES = [
  { value: "Road and Pothole", label: "Road & Pothole Damage", icon: "road" },
  { value: "Sanitation and Waste", label: "Sanitation & Solid Waste", icon: "trash" },
  { value: "Electricity", label: "Electricity & Utility Poles", icon: "zap" },
  { value: "Public Healthcare", label: "Public Healthcare Impact", icon: "activity" },
  { value: "Water Supply", label: "Water Supply & Sewerage", icon: "droplet" },
  { value: "Fire and Emergency", label: "Fire & Structural Emergency", icon: "flame" },
  { value: "Other Public Issue", label: "General Municipal Concern", icon: "building" },
];

function AdminDashboard() {
  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    updatingId,
    setUpdatingId,
  ] = useState("");

  const [
    reviewingId,
    setReviewingId,
  ] = useState("");

  const [
    reviewNotes,
    setReviewNotes,
  ] = useState({});

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    setLoading(true);
    setError("");

    try {
      const response =
        await getAllComplaints();

      setComplaints(
        Array.isArray(
          response.complaints
        )
          ? response.complaints
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load complaints. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    complaintId,
    newStatus
  ) {
    setUpdatingId(complaintId);

    try {
      const response =
        await updateComplaintStatus(
          complaintId,
          newStatus
        );

      setComplaints(
        (currentComplaints) =>
          currentComplaints.map(
            (complaint) =>
              complaint.id ===
              complaintId
                ? response.complaint
                : complaint
          )
      );
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Unable to update complaint status."
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function handleEvidenceReview(
    complaintId,
    reviewStatus
  ) {
    setReviewingId(
      complaintId
    );

    try {
      const note =
        String(
          reviewNotes[
            complaintId
          ] || ""
        ).trim();

      const response =
        await updateEvidenceReview(
          complaintId,
          reviewStatus,
          note
        );

      setComplaints(
        (currentComplaints) =>
          currentComplaints.map(
            (complaint) =>
              complaint.id ===
              complaintId
                ? response.complaint
                : complaint
          )
      );

      setReviewNotes(
        (currentNotes) => ({
          ...currentNotes,
          [complaintId]:
            response.complaint
              ?.adminEvidenceReview
              ?.note || "",
        })
      );
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Unable to update evidence review."
      );
    } finally {
      setReviewingId("");
    }
  }

  const filteredComplaints =
    useMemo(() => {
      const searchText =
        search.toLowerCase().trim();

      return complaints.filter(
        (complaint) => {
          const matchesSearch =
            !searchText ||
            complaint.id
              ?.toLowerCase()
              .includes(searchText) ||
            complaint.title
              ?.toLowerCase()
              .includes(searchText) ||
            complaint.category
              ?.toLowerCase()
              .includes(searchText) ||
            complaint.department
              ?.toLowerCase()
              .includes(searchText) ||
            complaint.location
              ?.toLowerCase()
              .includes(searchText);

          const matchesCategory =
            categoryFilter === "All" ||
            complaint.category === categoryFilter ||
            (complaint.category || "")
              .toLowerCase()
              .includes((categoryFilter || "").toLowerCase());

          const matchesStatus =
            statusFilter === "All" ||
            complaint.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
          );
        }
      );
    }, [
      complaints,
      search,
      categoryFilter,
      statusFilter,
    ]);

  function formatDate(date) {
    if (!date) {
      return "Unknown";
    }

    try {
      return new Intl.DateTimeFormat(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      ).format(new Date(date));
    } catch {
      return "Unknown";
    }
  }

  const total =
    complaints.length;

  const underReview =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "Under Review"
    ).length;

  const active =
    complaints.filter(
      (complaint) =>
        complaint.status ===
          "Assigned" ||
        complaint.status ===
          "In Progress"
    ).length;

  const resolved =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "Resolved"
    ).length;

  const evidenceCount =
    complaints.filter(
      (complaint) =>
        Boolean(
          complaint.evidenceUrl
        )
    ).length;

  const aiReviewNeeded =
    complaints.filter(
      (complaint) =>
        Boolean(
          complaint
            .evidenceVerification
            ?.reviewRequired
        )
    ).length;

  const suspiciousEvidence =
    complaints.filter(
      (complaint) =>
        complaint
          .adminEvidenceReview
          ?.status ===
        "Suspicious"
    ).length;

  return (
    <div className="admin-page">
      <header className="admin-navbar">
        <Link
          to="/"
          className="admin-logo"
        >
          NagarSwar <span>AI</span>
        </Link>

        <nav>
          <Link to="/">
            Citizen Home
          </Link>

          <Link to="/track">
            Track Complaints
          </Link>
        </nav>
      </header>

      <main className="admin-main">
        <section className="admin-hero">
          <div>
            <p className="admin-label">
              MUNICIPAL COMMAND CENTER
            </p>

            <h1>
              Complaint Management
              Dashboard
            </h1>

            <p>
              Review civic complaints,
              inspect evidence, monitor
              priority, identify assigned
              departments and update
              resolution progress.
            </p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={loadComplaints}
          >
            <Icon name="refresh" size={15} />
            Refresh Telemetry
          </button>
        </section>

        <section className="admin-stats">
          <article>
            <span>
              Total Complaints
            </span>

            <strong>
              {total}
            </strong>
          </article>

          <article>
            <span>
              Under Review
            </span>

            <strong>
              {underReview}
            </strong>
          </article>

          <article>
            <span>
              Active Cases
            </span>

            <strong>
              {active}
            </strong>
          </article>

          <article>
            <span>
              Resolved
            </span>

            <strong>
              {resolved}
            </strong>
          </article>

          <article>
            <span>
              With Evidence
            </span>

            <strong>
              {evidenceCount}
            </strong>
          </article>

          <article>
            <span>
              AI Review Needed
            </span>

            <strong>
              {aiReviewNeeded}
            </strong>
          </article>

          <article>
            <span>
              Marked Suspicious
            </span>

            <strong>
              {suspiciousEvidence}
            </strong>
          </article>
        </section>

        <section className="admin-tools">
          <input
            type="search"
            placeholder="Search ID, title, landmark, department..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {/* 1. Municipal Category Filter FIRST */}
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
            aria-label="Filter by Municipal Category"
          >
            <option value="All">
              📁 All Categories
            </option>
            {MUNICIPAL_CATEGORIES.map(
              (cat) => (
                <option
                  value={cat.value}
                  key={cat.value}
                >
                  {cat.label}
                </option>
              )
            )}
          </select>

          {/* 2. Resolution Status Filter SECOND */}
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            aria-label="Filter by Resolution Status"
          >
            <option value="All">
              🔄 All Statuses
            </option>
            {STATUSES.map(
              (status) => (
                <option
                  value={status}
                  key={status}
                >
                  {status}
                </option>
              )
            )}
          </select>
        </section>

        {/* Category Filter Badges / Quick Tabs */}
        <div className="admin-category-pills-row">
          <button
            type="button"
            onClick={() => setCategoryFilter("All")}
            className={`cat-pill ${categoryFilter === "All" ? "active" : ""}`}
          >
            <Icon name="grid" size={13} />
            <span>All Categories ({complaints.length})</span>
          </button>

          {MUNICIPAL_CATEGORIES.map((cat) => {
            const count = complaints.filter(
              (c) => c.category === cat.value || (c.category || "").toLowerCase().includes(cat.value.toLowerCase())
            ).length;
            const isActive = categoryFilter === cat.value;

            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategoryFilter(cat.value)}
                className={`cat-pill ${isActive ? "active" : ""}`}
              >
                <Icon name={cat.icon} size={13} />
                <span>{cat.label}</span>
                {count > 0 && <span className="cat-count-badge">{count}</span>}
              </button>
            );
          })}
        </div>

        {loading ? (
          <section className="admin-message">
            <Icon name="loader" size={36} className="spin-slow" />

            <h2>
              Loading complaints...
            </h2>
          </section>
        ) : error ? (
          <section className="admin-message">
            <Icon name="alert-triangle" size={36} style={{ color: "#f87171" }} />

            <h2>
              Backend connection failed
            </h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={loadComplaints}
            >
              Try Again
            </button>
          </section>
        ) : filteredComplaints.length ===
          0 ? (
          <section className="admin-message">
            <Icon name="file-text" size={36} />

            <h2>
              No complaints found
            </h2>

            <p>
              No complaint matches the
              current search or filter.
            </p>
          </section>
        ) : (
          <section className="admin-complaints">
            {filteredComplaints.map(
              (complaint) => {
                const evidenceUrl =
                  getEvidenceUrl(
                    complaint.evidenceUrl
                  );

                const evidenceVerification =
                  complaint.evidenceVerification ||
                  null;

                const duplicateDetection =
                  complaint.duplicateDetection ||
                  null;

                const imageReuse =
                  complaint.imageReuse ||
                  null;

                const adminEvidenceReview =
                  complaint.adminEvidenceReview ||
                  {
                    status:
                      evidenceUrl
                        ? "Pending Review"
                        : "Not Required",
                    note: "",
                    reviewedAt: null,
                    reviewedBy: null,
                  };

                const hasIntelligenceChecks =
                  Boolean(
                    evidenceVerification ||
                      duplicateDetection ||
                      imageReuse
                  );

                return (
                  <article
                    className="admin-complaint-card"
                    key={complaint.id}
                  >
                    <div className="admin-card-header">
                      <div>
                        <p className="admin-complaint-id">
                          {complaint.id}
                        </p>

                        <h2>
                          {complaint.title ||
                            "Civic Issue"}
                        </h2>
                      </div>

                      <span
                        className={`priority-badge priority-${(
                          complaint.priority ||
                          "low"
                        )
                          .toLowerCase()
                          .replaceAll(
                            " ",
                            "-"
                          )}`}
                      >
                        {complaint.priority ||
                          "Pending"}
                      </span>
                    </div>

                    <p className="admin-description">
                      {complaint.description ||
                        "No description available."}
                    </p>

                    {evidenceUrl && (
                      <div className="admin-evidence">
                        <div className="admin-evidence-heading">
                          <div>
                            <span>
                              EVIDENCE
                            </span>

                            <strong>
                              Citizen
                              photograph
                            </strong>
                          </div>

                          <span className="admin-evidence-badge">
                            <Icon name="check" size={13} /> Attached
                          </span>
                        </div>

                        <a
                          href={
                            evidenceUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-evidence-link"
                          title="Open full-size evidence"
                        >
                          <img
                            src={
                              evidenceUrl
                            }
                            alt={`Evidence for ${complaint.title}`}
                            loading="lazy"
                          />

                          <div className="admin-evidence-overlay">
                            <Icon name="search" size={13} /> Open full-size
                          </div>
                        </a>

                        <div className="admin-evidence-meta">
                          {complaint.evidenceOriginalName && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                              <Icon name="paperclip" size={13} />
                              {
                                complaint.evidenceOriginalName
                              }
                            </span>
                          )}

                          {complaint.evidenceSize && (
                            <span>
                              {formatFileSize(
                                complaint.evidenceSize
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    )}


                    {hasIntelligenceChecks && (
                      <section
                        style={
                          adminAiStyles.wrapper
                        }
                      >
                        <div
                          style={
                            adminAiStyles.heading
                          }
                        >
                          <p
                            style={
                              adminAiStyles.label
                            }
                          >
                            AI & VERIFICATION CHECKS
                          </p>

                          {evidenceVerification?.reviewRequired && (
                            <span
                              style={
                                adminAiStyles.warning
                              }
                            >
                              <Icon name="alert-triangle" size={12} /> Manual review
                            </span>
                          )}
                        </div>

                        <div
                          style={
                            adminAiStyles.grid
                          }
                        >
                          <article
                            style={
                              adminAiStyles.card
                            }
                          >
                            <span
                              style={
                                adminAiStyles.title
                              }
                            >
                              GEMINI EVIDENCE
                            </span>

                            <AdminCheckBadge
                              status={
                                evidenceVerification?.status ||
                                "Not analyzed"
                              }
                              score={
                                evidenceVerification?.score
                              }
                            />

                            {evidenceVerification?.confidence !=
                              null && (
                              <p
                                style={
                                  adminAiStyles.meta
                                }
                              >
                                Confidence:{" "}
                                <strong>
                                  {
                                    evidenceVerification.confidence
                                  }
                                  %
                                </strong>
                                <br />
                                Image quality:{" "}
                                <strong>
                                  {evidenceVerification.imageQuality ||
                                    "Unknown"}
                                </strong>
                              </p>
                            )}

                            {evidenceVerification?.visualSummary && (
                              <p
                                style={
                                  adminAiStyles.summary
                                }
                              >
                                {
                                  evidenceVerification.visualSummary
                                }
                              </p>
                            )}

                            {evidenceVerification?.model && (
                              <p
                                style={
                                  adminAiStyles.meta
                                }
                              >
                                Model:{" "}
                                {
                                  evidenceVerification.model
                                }
                              </p>
                            )}
                          </article>

                          <article
                            style={
                              adminAiStyles.card
                            }
                          >
                            <span
                              style={
                                adminAiStyles.title
                              }
                            >
                              DUPLICATE CHECK
                            </span>

                            <AdminCheckBadge
                              status={
                                duplicateDetection?.status ||
                                "Not checked"
                              }
                              score={
                                duplicateDetection?.score
                              }
                            />

                            {duplicateDetection && (
                              <p
                                style={
                                  adminAiStyles.meta
                                }
                              >
                                Distance:{" "}
                                <strong>
                                  {duplicateDetection.distanceMeters !=
                                  null
                                    ? `${duplicateDetection.distanceMeters} m`
                                    : "N/A"}
                                </strong>
                                <br />
                                Text similarity:{" "}
                                <strong>
                                  {duplicateDetection.textSimilarity !=
                                  null
                                    ? `${duplicateDetection.textSimilarity}%`
                                    : "N/A"}
                                </strong>
                              </p>
                            )}

                            {duplicateDetection?.matchedComplaintId && (
                              <Link
                                to={`/complaints/${duplicateDetection.matchedComplaintId}`}
                                style={
                                  adminAiStyles.link
                                }
                              >
                                Open match{" "}
                                {
                                  duplicateDetection.matchedComplaintId
                                }{" "}
                                →
                              </Link>
                            )}
                          </article>

                          <article
                            style={
                              adminAiStyles.card
                            }
                          >
                            <span
                              style={
                                adminAiStyles.title
                              }
                            >
                              REUSED IMAGE
                            </span>

                            <AdminCheckBadge
                              status={
                                imageReuse?.status ||
                                "Not checked"
                              }
                            />

                            <p
                              style={
                                adminAiStyles.meta
                              }
                            >
                              Previous exact matches:{" "}
                              <strong>
                                {imageReuse?.matchCount ??
                                  0}
                              </strong>
                            </p>

                            {imageReuse?.isReused && (
                              <div
                                style={
                                  adminAiStyles.warning
                                }
                              >
                                Exact evidence file was used
                                previously.
                              </div>
                            )}

                            {Array.isArray(
                              imageReuse?.matchedComplaintIds
                            ) &&
                              imageReuse.matchedComplaintIds
                                .length > 0 && (
                                <p
                                  style={
                                    adminAiStyles.meta
                                  }
                                >
                                  Matches:{" "}
                                  {imageReuse.matchedComplaintIds
                                    .slice(0, 3)
                                    .join(", ")}
                                  {imageReuse.matchedComplaintIds
                                    .length > 3
                                    ? "..."
                                    : ""}
                                </p>
                              )}
                          </article>
                        </div>
                      </section>
                    )}

                    {evidenceUrl && (
                      <section
                        style={
                          adminReviewStyles.wrapper
                        }
                      >
                        <div
                          style={
                            adminReviewStyles.heading
                          }
                        >
                          <p
                            style={
                              adminReviewStyles.label
                            }
                          >
                            MUNICIPAL EVIDENCE REVIEW
                          </p>

                          <AdminCheckBadge
                            status={
                              adminEvidenceReview.status
                            }
                          />
                        </div>

                        <textarea
                          value={
                            reviewNotes[
                              complaint.id
                            ] ??
                            adminEvidenceReview.note ??
                            ""
                          }
                          onChange={(event) =>
                            setReviewNotes(
                              (currentNotes) => ({
                                ...currentNotes,
                                [complaint.id]:
                                  event.target.value,
                              })
                            )
                          }
                          placeholder="Optional internal review note..."
                          maxLength={500}
                          style={
                            adminReviewStyles.note
                          }
                        />

                        <div
                          style={
                            adminReviewStyles.actions
                          }
                        >
                          <button
                            type="button"
                            disabled={
                              reviewingId ===
                              complaint.id
                            }
                            onClick={() =>
                              handleEvidenceReview(
                                complaint.id,
                                "Approved"
                              )
                            }
                            style={{
                              ...adminReviewStyles.button,
                              color: "#ffffff",
                              background: "#0b946c",
                              opacity:
                                reviewingId ===
                                complaint.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            <Icon name="check" size={14} /> Approve Evidence
                          </button>

                          <button
                            type="button"
                            disabled={
                              reviewingId ===
                              complaint.id
                            }
                            onClick={() =>
                              handleEvidenceReview(
                                complaint.id,
                                "Needs Review"
                              )
                            }
                            style={{
                              ...adminReviewStyles.button,
                              color: "#fbbf24",
                              background: "rgba(245, 158, 11, 0.15)",
                              border: "1px solid rgba(245, 158, 11, 0.3)",
                              opacity:
                                reviewingId ===
                                complaint.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            <Icon name="clock" size={14} /> Needs Review
                          </button>

                          <button
                            type="button"
                            disabled={
                              reviewingId ===
                              complaint.id
                            }
                            onClick={() =>
                              handleEvidenceReview(
                                complaint.id,
                                "Suspicious"
                              )
                            }
                            style={{
                              ...adminReviewStyles.button,
                              color: "#ffffff",
                              background: "#e11d48",
                              opacity:
                                reviewingId ===
                                complaint.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            <Icon name="alert-triangle" size={14} /> Mark Suspicious
                          </button>

                          <button
                            type="button"
                            disabled={
                              reviewingId ===
                              complaint.id
                            }
                            onClick={() =>
                              handleEvidenceReview(
                                complaint.id,
                                "Pending Review"
                              )
                            }
                            style={{
                              ...adminReviewStyles.button,
                              color: "var(--text-secondary)",
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid var(--border-subtle)",
                              opacity:
                                reviewingId ===
                                complaint.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            <Icon name="refresh" size={14} /> Reset Review
                          </button>
                        </div>

                        {adminEvidenceReview.reviewedAt && (
                          <p
                            style={
                              adminReviewStyles.meta
                            }
                          >
                            Reviewed{" "}
                            {formatDate(
                              adminEvidenceReview.reviewedAt
                            )}
                          </p>
                        )}

                        {reviewingId ===
                          complaint.id && (
                          <p
                            style={
                              adminReviewStyles.meta
                            }
                          >
                            Saving evidence review...
                          </p>
                        )}
                      </section>
                    )}

                    <div className="admin-information-grid">
                      <div>
                        <span>
                          Category
                        </span>

                        <strong>
                          {complaint.category ||
                            "Other Public Issue"}
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
                            "Not provided"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Submitted
                        </span>

                        <strong>
                          {formatDate(
                            complaint.submittedAt
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Priority Score
                        </span>

                        <strong>
                          {complaint.priorityScore !=
                          null
                            ? `${complaint.priorityScore}/100`
                            : "Not available"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Current Status
                        </span>

                        <strong>
                          {
                            complaint.status
                          }
                        </strong>
                      </div>
                    </div>

                    {Array.isArray(
                      complaint.priorityReasons
                    ) &&
                      complaint
                        .priorityReasons
                        .length > 0 && (
                        <div className="analysis-box">
                          <span>
                            Why this
                            priority?
                          </span>

                          <ul>
                            {complaint.priorityReasons.map(
                              (
                                reason
                              ) => (
                                <li
                                  key={
                                    reason
                                  }
                                >
                                  {
                                    reason
                                  }
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    <div className="admin-card-actions">
                      <div className="status-update-control">
                        <label
                          htmlFor={`status-${complaint.id}`}
                        >
                          Update Status
                        </label>

                        <select
                          id={`status-${complaint.id}`}
                          value={
                            complaint.status
                          }
                          disabled={
                            updatingId ===
                            complaint.id
                          }
                          onChange={(
                            event
                          ) =>
                            handleStatusChange(
                              complaint.id,
                              event
                                .target
                                .value
                            )
                          }
                        >
                          {STATUSES.map(
                            (
                              status
                            ) => (
                              <option
                                value={
                                  status
                                }
                                key={
                                  status
                                }
                              >
                                {
                                  status
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <Link
                        to={`/complaints/${complaint.id}`}
                        className="admin-view-button"
                      >
                        View Full
                        Complaint →
                      </Link>
                    </div>

                    {updatingId ===
                      complaint.id && (
                      <p className="updating-text">
                        Updating complaint
                        status...
                      </p>
                    )}
                  </article>
                );
              }
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;