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
      background: "#e8f7f0",
      border: "#a8dcc6",
      color: "#087153",
    };
  }

  if (
    text.includes("possible") ||
    text.includes("manual") ||
    text.includes("reused")
  ) {
    return {
      background: "#fff6df",
      border: "#efd695",
      color: "#8b6512",
    };
  }

  if (
    text.includes("mismatch") ||
    text.includes("unavailable") ||
    text.includes("not configured")
  ) {
    return {
      background: "#fff0ed",
      border: "#efb1a8",
      color: "#a13b2f",
    };
  }

  return {
    background: "#eef5f3",
    border: "#cfdfda",
    color: "#49665f",
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
        padding: "6px 9px",
        background:
          tone.background,
        border: `1px solid ${tone.border}`,
        borderRadius: "999px",
        color: tone.color,
        fontSize: "11px",
        fontWeight: "900",
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
    padding: "16px",
    background: "#f6faf8",
    border:
      "1px solid #d6e5df",
    borderRadius: "14px",
  },

  heading: {
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "10px",
    marginBottom: "12px",
  },

  label: {
    margin: 0,
    color: "#0b8161",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1.2px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "9px",
  },

  card: {
    minWidth: 0,
    padding: "12px",
    background: "#ffffff",
    border:
      "1px solid #dfe9e5",
    borderRadius: "11px",
  },

  title: {
    display: "block",
    marginBottom: "8px",
    color: "#617973",
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: ".8px",
  },

  meta: {
    margin:
      "9px 0 0",
    color: "#5d716c",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  summary: {
    margin:
      "9px 0 0",
    color: "#374f54",
    fontSize: "11px",
    lineHeight: 1.55,
  },

  warning: {
    marginTop: "9px",
    padding:
      "8px 9px",
    background: "#fff0ed",
    border:
      "1px solid #f0b9af",
    borderRadius: "8px",
    color: "#9c3c30",
    fontSize: "10px",
    fontWeight: "800",
  },

  link: {
    display: "inline-block",
    marginTop: "8px",
    color: "#087b5d",
    fontSize: "11px",
    fontWeight: "800",
    textDecoration: "none",
  },
};


const adminReviewStyles = {
  wrapper: {
    marginTop: "14px",
    padding: "16px",
    background: "#fffdf8",
    border: "1px solid #eadfbe",
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
    color: "#6e5a18",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1.1px",
  },

  note: {
    width: "100%",
    minHeight: "72px",
    marginTop: "12px",
    padding: "10px 12px",
    resize: "vertical",
    color: "#32484d",
    background: "#ffffff",
    border: "1px solid #d9d4c2",
    borderRadius: "9px",
    fontFamily: "inherit",
    fontSize: "12px",
    lineHeight: 1.5,
    boxSizing: "border-box",
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },

  button: {
    minHeight: "38px",
    padding: "9px 12px",
    border: "0",
    borderRadius: "9px",
    fontSize: "11px",
    fontWeight: "900",
    cursor: "pointer",
  },

  meta: {
    margin: "9px 0 0",
    color: "#6c6b61",
    fontSize: "11px",
    lineHeight: 1.5,
  },
};

function AdminDashboard() {
  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

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

          const matchesStatus =
            statusFilter === "All" ||
            complaint.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      complaints,
      search,
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
            ↻ Refresh Data
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
            placeholder="Search ID, title, category, department..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Statuses
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

        {loading ? (
          <section className="admin-message">
            <div>⏳</div>

            <h2>
              Loading complaints...
            </h2>
          </section>
        ) : error ? (
          <section className="admin-message">
            <div>⚠️</div>

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
            <div>📋</div>

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
                            ✓ Attached
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
                            🔍 Open
                            full-size
                          </div>
                        </a>

                        <div className="admin-evidence-meta">
                          {complaint.evidenceOriginalName && (
                            <span>
                              📎{" "}
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
                              ⚠ Manual review
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
                            ✓ Approve Evidence
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
                              color: "#6f5411",
                              background: "#f8e8af",
                              opacity:
                                reviewingId ===
                                complaint.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            ◷ Needs Review
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
                              background: "#b3473a",
                              opacity:
                                reviewingId ===
                                complaint.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            ⚠ Mark Suspicious
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
                              color: "#3d565c",
                              background: "#e9f0ed",
                              opacity:
                                reviewingId ===
                                complaint.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            ↺ Reset Review
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