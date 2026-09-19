import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import Icon from "./Icons";
import {
  adminLogout,
  clearAdminSession,
  getAdminToken,
  verifyAdminSession,
} from "../services/api";

function AdminRoute({ children }) {
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function verify() {
      const token = getAdminToken();

      if (!token) {
        if (active) {
          setAuthorized(false);
          setChecking(false);
        }
        return;
      }

      try {
        await verifyAdminSession();

        if (active) {
          setAuthorized(true);
        }
      } catch (error) {
        console.error(error);
        clearAdminSession();

        if (active) {
          setAuthorized(false);
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await adminLogout();
    } catch (error) {
      console.error(error);
      clearAdminSession();
    } finally {
      navigate("/admin-login", { replace: true });
      setLoggingOut(false);
    }
  }

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--bg-app)",
          color: "var(--text-primary)",
        }}
      >
        <div style={{ textAlign: "center", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "var(--accent-primary-subtle)",
              border: "1px solid var(--border-medium)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-primary)",
            }}
          >
            <Icon name="lock" size={26} strokeWidth={2} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", margin: "0 0 4px 0", color: "var(--text-primary)" }}>Verifying Authority Session</h2>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>Securing municipal administrative access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        style={{
          position: "fixed",
          top: "18px",
          right: "24px",
          zIndex: 9999,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "9px 16px",
          color: "#ffffff",
          background: "linear-gradient(135deg, #e11d48, #be123c)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "var(--radius-sm)",
          fontWeight: "600",
          fontSize: "0.875rem",
          cursor: loggingOut ? "not-allowed" : "pointer",
          opacity: loggingOut ? 0.7 : 1,
          boxShadow: "0 4px 14px rgba(225, 29, 72, 0.3)",
          transition: "all 0.2s ease",
        }}
      >
        <Icon name="log-out" size={16} />
        {loggingOut ? "Signing out..." : "Sign Out"}
      </button>

      {children}
    </>
  );
}

export default AdminRoute;
