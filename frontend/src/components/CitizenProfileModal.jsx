import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { getCitizenUser, getCitizenComplaints, clearCitizenSession, clearAdminSession } from "../services/api";
import Icon from "./Icons";
import "./CitizenProfileModal.css";

const MUNICIPAL_CATEGORIES = [
  { value: "All", label: "📁 All Categories" },
  { value: "Road & Pothole", label: "🛣️ Road & Pothole" },
  { value: "Sanitation & Waste", label: "🧹 Sanitation & Waste" },
  { value: "Water Supply", label: "💧 Water Supply" },
  { value: "Electricity & Lighting", label: "⚡ Electricity & Lighting" },
  { value: "Public Healthcare", label: "🏥 Public Healthcare" },
  { value: "Fire & Emergency", label: "🚨 Fire & Emergency" },
  { value: "General Concern", label: "📋 General Concern" },
];

export const CitizenProfileModal = ({ isOpen, onClose, onLogout }) => {
  const navigate = useNavigate();
  const citizenUser = getCitizenUser();
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    if (isOpen) {
      fetchComplaints();
    }
  }, [isOpen]);

  async function fetchComplaints() {
    setLoading(true);
    try {
      const res = await getCitizenComplaints();
      const list = Array.isArray(res?.complaints) ? res.complaints : [];
      // Strictly ensure only complaints submitted by this logged-in user are shown
      const userComplaints = citizenUser?.id
        ? list.filter((c) => c.citizenId === citizenUser.id)
        : list;
      setComplaints(userComplaints);
    } catch (err) {
      console.error("Error fetching citizen complaints for profile modal:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filtered grievances logic
  const filteredComplaints = useMemo(() => {
    const query = search.toLowerCase().trim();
    return complaints.filter((c) => {
      const matchesSearch =
        !query ||
        c.id?.toLowerCase().includes(query) ||
        c.title?.toLowerCase().includes(query) ||
        c.category?.toLowerCase().includes(query) ||
        c.location?.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        c.category === categoryFilter ||
        (c.category || "").toLowerCase().includes(categoryFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        c.status === statusFilter ||
        (statusFilter === "Active" && (c.status === "Assigned" || c.status === "In Progress")) ||
        (statusFilter === "Under Review" && c.status === "Under Review") ||
        (statusFilter === "Resolved" && c.status === "Resolved");

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [complaints, search, categoryFilter, statusFilter]);

  // Summary counts
  const totalCount = complaints.length;
  const underReviewCount = complaints.filter((c) => c.status === "Under Review").length;
  const activeCount = complaints.filter((c) => c.status === "Assigned" || c.status === "In Progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  if (!isOpen) return null;

  const displayName = citizenUser?.firstName
    ? `${citizenUser.firstName} ${citizenUser.lastName || ""}`.trim()
    : "Verified Citizen";

  const userEmail = citizenUser?.email || "citizen@nagarswar.gov.in";
  const userPhone = citizenUser?.phone || "+91 98765 43210";

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <header className="profile-modal-header">
          <div className="profile-user-summary">
            <div className="profile-avatar-circle">
              <Icon name="user" size={24} />
            </div>
            <div className="profile-user-meta">
              <h2>{displayName}</h2>
              <p className="profile-user-contacts">
                <span>📧 {userEmail}</span> • <span>📞 {userPhone}</span>
              </p>
              <div className="profile-badges-row">
                <span className="profile-badge verified">
                  <Icon name="shield-check" size={13} /> Verified Citizen
                </span>
                <span className="profile-badge rewards">
                  <Icon name="coin" size={13} /> 250 NagarCoins
                </span>
              </div>
            </div>
          </div>

          <button type="button" className="profile-close-btn" onClick={onClose} aria-label="Close Profile">
            <Icon name="x" size={20} />
          </button>
        </header>

        {/* Complaints Counter Cards */}
        <section className="profile-stats-grid">
          <div className="profile-stat-card total">
            <span>TOTAL FILED</span>
            <strong>{totalCount}</strong>
          </div>
          <div className="profile-stat-card review">
            <span>UNDER REVIEW</span>
            <strong>{underReviewCount}</strong>
          </div>
          <div className="profile-stat-card active">
            <span>ACTIVE CASES</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="profile-stat-card resolved">
            <span>RESOLVED</span>
            <strong>{resolvedCount}</strong>
          </div>
        </section>

        {/* Filter Controls (Category FIRST, Status SECOND) */}
        <section className="profile-filter-bar">
          <div className="profile-search-box">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search reference ID, title, landmark..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 1. Category Filter FIRST */}
          <select
            className="profile-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {MUNICIPAL_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* 2. Status Filter SECOND */}
          <select
            className="profile-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">⚡ All Statuses</option>
            <option value="Under Review">⏳ Under Review</option>
            <option value="Active">🚧 Active / Assigned</option>
            <option value="Resolved">✅ Resolved</option>
          </select>
        </section>

        {/* Complaints Feed List */}
        <section className="profile-complaints-list">
          {loading ? (
            <div className="profile-empty-state">
              <Icon name="loader" size={28} className="spin-slow" />
              <p>Fetching your grievances...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="profile-empty-state">
              <Icon name="file" size={32} />
              <p>No grievances found matching selected filters.</p>
            </div>
          ) : (
            filteredComplaints.map((c) => (
              <div key={c.id || c._id} className="profile-complaint-item">
                <div className="profile-item-left">
                  <span className="profile-item-cat">{c.category || "General Concern"}</span>
                  <span className="profile-item-ref">{c.id}</span>
                  <h4 className="profile-item-title">{c.title}</h4>
                  <p className="profile-item-desc">{c.description || "No details provided"}</p>
                </div>
                <div className="profile-item-right">
                  <span className={`profile-status-pill ${ (c.status || '').toLowerCase().replace(/\s+/g, '-') }`}>
                    {c.status || "Under Review"}
                  </span>
                  <Link
                    to={`/complaints/${c.id}`}
                    onClick={onClose}
                    className="profile-view-link"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Modal Footer Actions */}
        <footer className="profile-modal-footer">
          <div className="profile-footer-left">
            <Link
              to="/report"
              onClick={onClose}
              className="profile-btn primary"
            >
              <Icon name="report" size={16} /> + Report New Grievance
            </Link>
            <Link
              to="/track"
              onClick={onClose}
              className="profile-btn secondary"
            >
              <Icon name="file" size={16} /> Open Full Dashboard
            </Link>
          </div>

          <button
            type="button"
            className="profile-btn logout"
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                clearCitizenSession();
                clearAdminSession();
                navigate("/login");
              }
              onClose();
            }}
          >
            <Icon name="log-out" size={16} /> Log Out
          </button>
        </footer>

      </div>
    </div>
  );
};

export default CitizenProfileModal;
