import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import {
  citizenLogout,
  clearCitizenSession,
  getCitizenComplaints,
  getCitizenToken,
  getCitizenUser,
} from "../services/api";
import Icon from "../components/Icons";
import "./MyComplaints.css";

const statusSteps = [
  "Reported",
  "Under Review",
  "Assigned",
  "Resolved",
];

function getStatusStep(status) {
  const normalizedStatus = (status || "").toLowerCase();

  if (
    normalizedStatus.includes("resolved") ||
    normalizedStatus.includes("closed") ||
    normalizedStatus.includes("completed")
  ) {
    return 3;
  }

  if (
    normalizedStatus.includes("assigned") ||
    normalizedStatus.includes("in progress") ||
    normalizedStatus.includes("processing")
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

function MyComplaints() {
  const navigate = useNavigate();
  const citizenToken = getCitizenToken();
  const citizenUser = getCitizenUser();

  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadComplaintsFromBackend();
  }, []);

  async function loadComplaintsFromBackend() {
    setLoading(true);
    setLoadError("");

    try {
      const response = await getCitizenComplaints();

      setComplaints(
        Array.isArray(response.complaints)
          ? response.complaints
          : []
      );
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

      setLoadError(
        error.message ||
          "Unable to load your complaints. Please make sure the NagarSwar backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await citizenLogout();
    } catch (error) {
      console.error(error);
      clearCitizenSession();
    }

    navigate("/login", {
      replace: true,
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

  const filteredComplaints = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return complaints;
    }

    return complaints.filter((complaint) => {
      return (
        complaint.id
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.title
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.category
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.status
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.location
          ?.toLowerCase()
          .includes(searchText)
      );
    });
  }, [complaints, search]);

  function formatDate(date) {
    if (!date) {
      return "Recently submitted";
    }

    try {
      return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(date));
    } catch {
      return "Recently submitted";
    }
  }

  return (
    <div className="track-page">
      <header className="track-navbar">
        <Link to="/" className="track-logo">
          NagarSwar <span>AI</span>
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {citizenUser && (
            <span
              style={{
                color: "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Icon name="user" size={15} />
              {citizenUser.firstName}
            </span>
          )}

          <Link to="/" className="track-home-link">
            ← Back to Home
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "9px 13px",
              color: "#ffffff",
              background: "#0a8f6a",
              border: "0",
              borderRadius: "9px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="track-main">
        <section className="track-heading">
          <p className="track-label">
            COMPLAINT TRACKING
          </p>

          <h1>Track your reported issues.</h1>

          <p>
            Search using your complaint reference number,
            title, category, status or location.
          </p>

          <div className="track-controls">
            <input
              type="search"
              placeholder="Search complaint ID or title..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <Link
              to="/report"
              className="new-report-button"
            >
              + Report New Issue
            </Link>
          </div>
        </section>

        <section className="complaints-section">
          {loading ? (
            <div className="empty-complaints">
              <Icon name="loader" size={36} className="spin-slow" />

              <h2>Loading complaints...</h2>

              <p>
                Fetching your latest complaints from
                NagarSwar AI.
              </p>
            </div>
          ) : loadError ? (
            <div className="empty-complaints">
              <Icon name="alert-triangle" size={36} style={{ color: "#f87171" }} />

              <h2>Backend connection failed</h2>

              <p>{loadError}</p>

              <button
                type="button"
                onClick={loadComplaintsFromBackend}
                style={{
                  padding: "11px 20px",
                  color: "#04100c",
                  background: "var(--accent-primary)",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </div>
          ) : complaints.length === 0 ? (
            <div className="empty-complaints">
              <Icon name="file-text" size={36} />

              <h2>No complaints submitted yet</h2>

              <p>
                Your submitted complaints will appear
                on this page.
              </p>

              <Link to="/report">
                Report your first issue
              </Link>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="empty-complaints">
              <Icon name="search" size={36} />

              <h2>No matching complaint found</h2>

              <p>
                Check the complaint ID or try another
                search.
              </p>
            </div>
          ) : (
            <div className="complaints-list">
              {filteredComplaints.map((complaint) => {
                const currentStep = getStatusStep(
                  complaint.status
                );

                return (
                  <article
                    className="complaint-track-card"
                    key={complaint.id}
                  >
                    <div className="complaint-card-top">
                      <span className="complaint-category">
                        {complaint.category ||
                          "Other Public Issue"}
                      </span>

                      <span className="complaint-status">
                        {complaint.status ||
                          "Under Review"}
                      </span>
                    </div>

                    <h2>
                      {complaint.title ||
                        "Civic Issue"}
                    </h2>

                    <p className="complaint-description">
                      {complaint.description ||
                        "No description available."}
                    </p>

                    <div className="complaint-information">
                      <div>
                        <span>Complaint ID</span>

                        <strong>
                          {complaint.id}
                        </strong>
                      </div>

                      <div>
                        <span>Location</span>

                        <strong>
                          {complaint.location ||
                            "Not provided"}
                        </strong>
                      </div>

                      <div>
                        <span>Submitted</span>

                        <strong>
                          {formatDate(
                            complaint.submittedAt
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Priority</span>

                        <strong>
                          {complaint.priority ||
                            "Pending AI Analysis"}
                        </strong>
                      </div>
                    </div>

                    <div className="status-tracker">
                      {statusSteps.map(
                        (step, index) => (
                          <div
                            key={step}
                            style={{
                              display: "contents",
                            }}
                          >
                            {index > 0 && (
                              <div
                                className={`tracker-line ${
                                  index <=
                                  currentStep
                                    ? "active"
                                    : ""
                                }`}
                              ></div>
                            )}

                            <div
                              className={`tracker-step ${
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
                                currentStep ? (
                                  <Icon name="check" size={13} />
                                ) : (
                                  index + 1
                                )}
                              </span>

                              <p>{step}</p>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <Link
                      to={`/complaints/${complaint.id}`}
                      className="view-details-button"
                    >
                      View Complaint Details →
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MyComplaints;