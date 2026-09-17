import { useEffect, useState } from "react";
import {
  Navigate,
  useNavigate,
} from "react-router";
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
          background: "#f3f7f5",
          color: "#173a43",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "42px" }}>🔐</div>
          <h2>Verifying admin session...</h2>
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
          padding: "10px 15px",
          color: "#ffffff",
          background: "#b53b32",
          border: "none",
          borderRadius: "9px",
          fontWeight: "800",
          cursor: loggingOut ? "not-allowed" : "pointer",
          opacity: loggingOut ? 0.7 : 1,
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        }}
      >
        {loggingOut ? "Logging out..." : "Admin Logout"}
      </button>

      {children}
    </>
  );
}

export default AdminRoute;
