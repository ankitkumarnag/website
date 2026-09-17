import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getComplaintById } from "../services/api";
import "./ComplaintDetails.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(
  /\/api\/?$/,
  ""
);

const timelineSteps = [
  {
    title: "Complaint reported",
    description:
      "Your complaint was successfully received.",
  },
  {
    title: "Under review",
    description:
      "The complaint is being checked and verified.",
  },
  {
    title: "Assigned",
    description:
      "The complaint has been assigned to the responsible department.",
  },
  {
    title: "In progress",
    description:
      "The responsible department is currently working on the issue.",
  },
  {
    title: "Resolved",
    description:
      "The civic issue has been marked as resolved.",
  },
];

function getStatusStep(status) {
  const normalizedStatus = (
    status || ""
  ).toLowerCase();

  if (
    normalizedStatus.includes("resolved") ||
    normalizedStatus.includes("closed") ||
    normalizedStatus.includes("completed")
  ) {
    return 4;
  }

  if (
    normalizedStatus.includes("in progress") ||
    normalizedStatus.includes("processing") ||
    normalizedStatus.includes("working")
  ) {
    return 3;
  }

  if (
    normalizedStatus.includes("assigned")
  ) {
    return 2;
  }

  if (
    normalizedStatus.includes("review") ||
    normalizedStatus.includes("verified")
  ) {
    return 1;
  }

  return 0;
}

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
    return `${(size / 1024).toFixed(1)} KB`;
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

function StatusPill({
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
        gap: "7px",
        padding: "7px 11px",
        background:
          tone.background,
        border: `1px solid ${tone.border}`,
        borderRadius: "999px",
        color: tone.color,
        fontSize: "12px",
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

const intelligenceStyles = {
  section: {
    marginTop: "24px",
    padding: "22px",
    background:
      "linear-gradient(180deg, #f8fbfa 0%, #f1f7f4 100%)",
    border:
      "1px solid #d5e5df",
    borderRadius: "18px",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "16px",
  },

  eyebrow: {
    display: "block",
    marginBottom: "5px",
    color: "#0a8b67",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1.4px",
  },

  title: {
    margin: 0,
    color: "#173b42",
    fontSize: "21px",
  },

  subtitle: {
    margin:
      "6px 0 0",
    color: "#6c807a",
    fontSize: "13px",
    lineHeight: 1.55,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },

  card: {
    minWidth: 0,
    padding: "16px",
    background: "#ffffff",
    border:
      "1px solid #dce8e3",
    borderRadius: "14px",
  },

  cardLabel: {
    display: "block",
    marginBottom: "9px",
    color: "#718984",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1px",
  },

  meta: {
    marginTop: "10px",
    color: "#60756f",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  summary: {
    margin:
      "12px 0 0",
    color: "#334d52",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  list: {
    margin:
      "10px 0 0",
    paddingLeft: "18px",
    color: "#445d59",
    fontSize: "12px",
    lineHeight: 1.65,
  },

  warning: {
    marginTop: "12px",
    padding:
      "10px 12px",
    background: "#fff1ed",
    border:
      "1px solid #f1bbb1",
    borderRadius: "10px",
    color: "#9a3c31",
    fontSize: "12px",
    fontWeight: "800",
  },

  link: {
    display: "inline-block",
    marginTop: "8px",
    color: "#087b5d",
    fontSize: "12px",
    fontWeight: "800",
    textDecoration: "none",
  },
};

function getCitizenEvidenceReview(
  review
) {
  const status =
    String(
      review?.status ||
        "Pending Review"
    );

  if (status === "Approved") {
    return {
      label:
        "Evidence reviewed",
      message:
        "A municipal administrator has reviewed the submitted evidence.",
    };
  }

  if (
    status ===
    "Needs Review"
  ) {
    return {
      label:
        "Additional review in progress",
      message:
        "The evidence is receiving additional manual verification.",
    };
  }

  if (
    status ===
    "Suspicious"
  ) {
    return {
      label:
        "Further verification required",
      message:
        "The evidence requires further municipal verification before a final decision.",
    };
  }

  if (
    status ===
    "Not Required"
  ) {
    return {
      label:
        "No evidence review required",
      message:
        "This complaint does not currently require an evidence review.",
    };
  }

  return {
    label:
      "Pending municipal review",
    message:
      "The evidence has been received and is awaiting municipal review.",
  };
}

function ComplaintDetails() {
  const { complaintId } = useParams();

  const [complaint, setComplaint] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    loadComplaintFromBackend();
  }, [complaintId]);

  async function loadComplaintFromBackend() {
    setLoading(true);
    setLoadError("");

    try {
      const response =
        await getComplaintById(
          complaintId
        );

      setComplaint(
        response.complaint || null
      );
    } catch (error) {
      console.error(error);

      setComplaint(null);

      setLoadError(
        error.message ||
          "Unable to load complaint."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) {
      return "Recently submitted";
    }

    try {
      return new Intl.DateTimeFormat(
        "en-IN",
        {
          dateStyle: "long",
          timeStyle: "short",
        }
      ).format(new Date(date));
    } catch {
      return "Recently submitted";
    }
  }

  if (loading) {
    return (
      <div className="details-page">
        <main className="complaint-not-found">
          <span>⏳</span>

          <h1>
            Loading complaint...
          </h1>

          <p>
            Fetching complaint
            information from NagarSwar AI.
          </p>
        </main>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="details-page">
        <main className="complaint-not-found">
          <span>🔍</span>

          <h1>
            Complaint not found
          </h1>

          <p>
            {loadError ||
              "The complaint may have been removed or the ID is incorrect."}
          </p>

          <Link to="/track">
            Return to My Complaints
          </Link>
        </main>
      </div>
    );
  }

  const currentStep =
    getStatusStep(complaint.status);

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
      reviewedAt: null,
    };

  const citizenEvidenceReview =
    getCitizenEvidenceReview(
      adminEvidenceReview
    );

  const hasIntelligenceChecks =
    Boolean(
      evidenceVerification ||
        duplicateDetection ||
        imageReuse
    );

  return (
    <div className="details-page">
      <header className="details-navbar">
        <Link
          to="/"
          className="details-logo"
        >
          NagarSwar <span>AI</span>
        </Link>

        <Link
          to="/track"
          className="details-track-link"
        >
          My Complaints
        </Link>
      </header>

      <main className="details-main">
        <Link
          to="/track"
          className="details-back"
        >
          ← Back to My Complaints
        </Link>

        <div className="details-layout">
          <section className="details-card">
            <div className="details-card-top">
              <span className="details-category">
                {complaint.category ||
                  "Other Public Issue"}
              </span>

              <span className="details-status">
                {complaint.status ||
                  "Under Review"}
              </span>
            </div>

            <p className="details-reference">
              {complaint.id}
            </p>

            <h1>
              {complaint.title ||
                "Civic Issue"}
            </h1>

            <div className="details-section">
              <h2>
                Problem description
              </h2>

              <p>
                {complaint.description ||
                  "No description available."}
              </p>
            </div>

            {evidenceUrl && (
              <div className="details-evidence">
                <div className="details-evidence-header">
                  <div>
                    <span>
                      EVIDENCE
                    </span>

                    <h2>
                      Evidence photograph
                    </h2>
                  </div>

                  <span className="evidence-attached-badge">
                    ✓ Evidence attached
                  </span>
                </div>

                <a
                  href={evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="details-evidence-link"
                  title="Open full-size evidence"
                >
                  <img
                    src={evidenceUrl}
                    alt={`Evidence for ${complaint.title}`}
                    className="details-evidence-image"
                    loading="lazy"
                  />

                  <div className="evidence-open-overlay">
                    🔍 Open full-size
                  </div>
                </a>

                <div className="evidence-meta">
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

                  {complaint.evidenceMimeType && (
                    <span>
                      {
                        complaint.evidenceMimeType
                      }
                    </span>
                  )}
                </div>
              </div>
            )}


            {hasIntelligenceChecks && (
              <section
                style={
                  intelligenceStyles.section
                }
              >
                <div
                  style={
                    intelligenceStyles.header
                  }
                >
                  <div>
                    <span
                      style={
                        intelligenceStyles.eyebrow
                      }
                    >
                      NAGARSWAR INTELLIGENCE
                    </span>

                    <h2
                      style={
                        intelligenceStyles.title
                      }
                    >
                      AI & verification checks
                    </h2>

                    <p
                      style={
                        intelligenceStyles.subtitle
                      }
                    >
                      These checks help verify evidence and
                      identify repeated reports. They support
                      review and do not automatically reject
                      a citizen complaint.
                    </p>
                  </div>
                </div>

                <div
                  style={
                    intelligenceStyles.grid
                  }
                >
                  <article
                    style={
                      intelligenceStyles.card
                    }
                  >
                    <span
                      style={
                        intelligenceStyles.cardLabel
                      }
                    >
                      GEMINI EVIDENCE VERIFICATION
                    </span>

                    <StatusPill
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
                          intelligenceStyles.meta
                        }
                      >
                        Confidence:{" "}
                        <strong>
                          {
                            evidenceVerification.confidence
                          }
                          %
                        </strong>
                        {" · "}
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
                          intelligenceStyles.summary
                        }
                      >
                        {
                          evidenceVerification.visualSummary
                        }
                      </p>
                    )}

                    {Array.isArray(
                      evidenceVerification?.matchingFactors
                    ) &&
                      evidenceVerification.matchingFactors
                        .length > 0 && (
                        <ul
                          style={
                            intelligenceStyles.list
                          }
                        >
                          {evidenceVerification.matchingFactors.map(
                            (factor) => (
                              <li
                                key={
                                  factor
                                }
                              >
                                ✓{" "}
                                {factor}
                              </li>
                            )
                          )}
                        </ul>
                      )}

                    {evidenceVerification?.reviewRequired && (
                      <div
                        style={
                          intelligenceStyles.warning
                        }
                      >
                        ⚠ Manual admin review recommended.
                      </div>
                    )}

                    {evidenceVerification?.model && (
                      <p
                        style={
                          intelligenceStyles.meta
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
                      intelligenceStyles.card
                    }
                  >
                    <span
                      style={
                        intelligenceStyles.cardLabel
                      }
                    >
                      DUPLICATE COMPLAINT CHECK
                    </span>

                    <StatusPill
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
                          intelligenceStyles.meta
                        }
                      >
                        GPS distance:{" "}
                        <strong>
                          {duplicateDetection.distanceMeters !=
                          null
                            ? `${duplicateDetection.distanceMeters} m`
                            : "Unavailable"}
                        </strong>
                        <br />
                        Text similarity:{" "}
                        <strong>
                          {duplicateDetection.textSimilarity !=
                          null
                            ? `${duplicateDetection.textSimilarity}%`
                            : "Unavailable"}
                        </strong>
                      </p>
                    )}

                    {duplicateDetection?.matchedComplaintId && (
                      <Link
                        to={`/complaints/${duplicateDetection.matchedComplaintId}`}
                        style={
                          intelligenceStyles.link
                        }
                      >
                        View matched complaint{" "}
                        {
                          duplicateDetection.matchedComplaintId
                        }{" "}
                        →
                      </Link>
                    )}

                    {Array.isArray(
                      duplicateDetection?.reasons
                    ) &&
                      duplicateDetection.reasons
                        .length > 0 && (
                        <ul
                          style={
                            intelligenceStyles.list
                          }
                        >
                          {duplicateDetection.reasons.map(
                            (reason) => (
                              <li
                                key={
                                  reason
                                }
                              >
                                {reason}
                              </li>
                            )
                          )}
                        </ul>
                      )}
                  </article>

                  <article
                    style={
                      intelligenceStyles.card
                    }
                  >
                    <span
                      style={
                        intelligenceStyles.cardLabel
                      }
                    >
                      REUSED IMAGE CHECK
                    </span>

                    <StatusPill
                      status={
                        imageReuse?.status ||
                        "Not checked"
                      }
                    />

                    <p
                      style={
                        intelligenceStyles.meta
                      }
                    >
                      Previous matching uploads:{" "}
                      <strong>
                        {imageReuse?.matchCount ??
                          0}
                      </strong>
                    </p>

                    {imageReuse?.isReused && (
                      <div
                        style={
                          intelligenceStyles.warning
                        }
                      >
                        ⚠ The exact same evidence file has
                        appeared in an earlier complaint.
                      </div>
                    )}

                    {Array.isArray(
                      imageReuse?.matchedComplaintIds
                    ) &&
                      imageReuse.matchedComplaintIds
                        .length > 0 && (
                        <p
                          style={
                            intelligenceStyles.meta
                          }
                        >
                          Matched complaint IDs:{" "}
                          {imageReuse.matchedComplaintIds
                            .slice(0, 4)
                            .join(", ")}
                          {imageReuse.matchedComplaintIds
                            .length > 4
                            ? "..."
                            : ""}
                        </p>
                      )}

                    {imageReuse?.detectionType && (
                      <p
                        style={
                          intelligenceStyles.meta
                        }
                      >
                        Method:{" "}
                        {
                          imageReuse.detectionType
                        }
                      </p>
                    )}
                  </article>

                  {evidenceUrl && (
                    <article
                      style={
                        intelligenceStyles.card
                      }
                    >
                      <span
                        style={
                          intelligenceStyles.cardLabel
                        }
                      >
                        MUNICIPAL EVIDENCE REVIEW
                      </span>

                      <StatusPill
                        status={
                          citizenEvidenceReview.label
                        }
                      />

                      <p
                        style={
                          intelligenceStyles.summary
                        }
                      >
                        {
                          citizenEvidenceReview.message
                        }
                      </p>

                      {adminEvidenceReview.reviewedAt && (
                        <p
                          style={
                            intelligenceStyles.meta
                          }
                        >
                          Last reviewed:{" "}
                          {formatDate(
                            adminEvidenceReview.reviewedAt
                          )}
                        </p>
                      )}
                    </article>
                  )}
                </div>
              </section>
            )}

            <div className="details-information">
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
                  Priority
                </span>

                <strong>
                  {complaint.priority ||
                    "Pending AI Analysis"}
                </strong>
              </div>

              <div>
                <span>
                  Assigned department
                </span>

                <strong>
                  {complaint.department ||
                    "Pending Assignment"}
                </strong>
              </div>

              {complaint.priorityScore != null && (
                <div>
                  <span>
                    Priority Score
                  </span>

                  <strong>
                    {
                      complaint.priorityScore
                    }
                    /100
                  </strong>
                </div>
              )}

              {complaint.latitude &&
                complaint.longitude && (
                  <div>
                    <span>
                      GPS Coordinates
                    </span>

                    <strong>
                      {Number(
                        complaint.latitude
                      ).toFixed(6)}
                      ,{" "}
                      {Number(
                        complaint.longitude
                      ).toFixed(6)}
                    </strong>
                  </div>
                )}
            </div>
          </section>

          <aside className="details-progress-card">
            <p className="progress-label">
              CURRENT STATUS
            </p>

            <h2>
              {complaint.status ||
                "Under Review"}
            </h2>

            <div className="details-timeline">
              {timelineSteps.map(
                (step, index) => (
                  <div
                    key={step.title}
                    className={`timeline-item ${
                      index <
                      currentStep
                        ? "completed"
                        : index ===
                            currentStep
                          ? "active"
                          : ""
                    }`}
                  >
                    <span>
                      {index <
                      currentStep
                        ? "✓"
                        : index + 1}
                    </span>

                    <div>
                      <strong>
                        {step.title}
                      </strong>

                      <p>
                        {
                          step.description
                        }
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ComplaintDetails;