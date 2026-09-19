import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  citizenLogout,
  clearCitizenSession,
  getAllComplaints,
  getCitizenToken,
  getCitizenUser,
} from "../services/api";
import Icon from "../components/Icons";
import CitizenProfileModal from "../components/CitizenProfileModal";
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
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [scopeFilter, setScopeFilter] = useState("all"); // "all" | "my"
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadComplaintsFromBackend();
  }, []);

  async function loadComplaintsFromBackend() {
    setLoading(true);
    setLoadError("");

    try {
      // Fetch all public/registered complaints so anyone can track all grievances
      const response = await getAllComplaints();

      setComplaints(
        Array.isArray(response.complaints)
          ? response.complaints
          : []
      );
    } catch (error) {
      console.error(error);
      setLoadError(
        error.message ||
          "Unable to load complaints. Please make sure the NagarSwar backend is running."
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

  // Count how many complaints were submitted by this logged-in user
  const myComplaintsCount = useMemo(() => {
    if (!citizenUser?.id) return 0;
    return complaints.filter((c) => c.citizenId === citizenUser.id).length;
  }, [complaints, citizenUser]);

  const filteredComplaints = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return complaints.filter((complaint) => {
      // Scope filter: If user chose "my", only show their complaints
      if (scopeFilter === "my" && citizenUser?.id) {
        if (complaint.citizenId !== citizenUser.id) {
          return false;
        }
      }

      const matchesSearch =
        !searchText ||
        complaint.id?.toLowerCase().includes(searchText) ||
        complaint.title?.toLowerCase().includes(searchText) ||
        complaint.category?.toLowerCase().includes(searchText) ||
        complaint.status?.toLowerCase().includes(searchText) ||
        complaint.location?.toLowerCase().includes(searchText);

      const matchesCategory =
        categoryFilter === "All" ||
        complaint.category === categoryFilter ||
        (complaint.category || "").toLowerCase().includes(categoryFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        complaint.status === statusFilter ||
        (statusFilter === "Active" && (complaint.status === "Assigned" || complaint.status === "In Progress")) ||
        (statusFilter === "Under Review" && complaint.status === "Under Review") ||
        (statusFilter === "Resolved" && complaint.status === "Resolved");

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [complaints, search, categoryFilter, statusFilter, scopeFilter, citizenUser]);

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
            gap: "10px",
          }}
        >
          {citizenUser ? (
            <>
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="track-profile-btn"
                title="View your citizen profile and grievances"
              >
                <Icon name="user" size={15} />
                <span>{citizenUser.firstName || "My Profile"}</span>
              </button>

              <Link to="/" className="track-home-link">
                ← Back to Home
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="track-logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="track-home-link">
                ← Back to Home
              </Link>

              <Link to="/login" className="track-login-btn">
                <Icon name="log-in" size={15} />
                <span>Citizen Login</span>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="track-main">
        <section className="track-heading">
          <p className="track-label">
            CIVIC GRIEVANCE TRACKING
          </p>

          <h1>Track Reported Civic Issues</h1>

          <p>
            Real-time public grievance resolution tracking. Search using reference ID,
            title, category, status, or landmark to inspect status.
          </p>

          {citizenUser && (
            <div className="track-scope-tabs">
              <button
                type="button"
                className={`track-scope-tab ${scopeFilter === "all" ? "active" : ""}`}
                onClick={() => setScopeFilter("all")}
              >
                🌐 All City Complaints ({complaints.length})
              </button>
              <button
                type="button"
                className={`track-scope-tab ${scopeFilter === "my" ? "active" : ""}`}
                onClick={() => setScopeFilter("my")}
              >
                👤 My Reported Issues ({myComplaintsCount})
              </button>
            </div>
          )}

          <div className="track-controls">
            <div className="track-search-wrapper">
              <Icon name="search" size={16} />
              <input
                type="search"
                placeholder="Search reference ID, keyword, landmark..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              className="track-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by Category"
            >
              <option value="All">📁 All Categories</option>
              <option value="Road and Pothole">🛣️ Road & Pothole</option>
              <option value="Sanitation and Waste">🧹 Sanitation & Waste</option>
              <option value="Water Supply">💧 Water Supply</option>
              <option value="Electricity">⚡ Electricity</option>
              <option value="Public Healthcare">🏥 Public Healthcare</option>
              <option value="Fire and Emergency">🚨 Fire & Emergency</option>
              <option value="Other Public Issue">📋 Other Issues</option>
            </select>

            <select
              className="track-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
            >
              <option value="All">⚡ All Statuses</option>
              <option value="Under Review">⏳ Under Review</option>
              <option value="Active">🚧 Active / Assigned</option>
              <option value="Resolved">✅ Resolved</option>
            </select>

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

      {citizenUser && (
        <CitizenProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default MyComplaints;