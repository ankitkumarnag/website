import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Icon from "../components/Icons";
import {
  adminLogin,
  saveAdminToken,
} from "../services/api";
import "./Auth.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    setLoginError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await adminLogin(
        formData.get("email"),
        formData.get("password")
      );

      saveAdminToken(response.token, rememberMe);
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error(error);
      setLoginError(error.message || "Unable to sign in as admin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <Link className="auth-logo" to="/">
          NagarSwar <span>AI</span>
        </Link>

        <div className="auth-visual-content">
          <p className="auth-label">MUNICIPAL ADMIN PORTAL</p>

          <h1>
            Manage civic issues with <span>accountability.</span>
          </h1>

          <p>
            Authorized municipal staff can review evidence, monitor priority,
            route complaints and update resolution progress.
          </p>

          <ul>
            <li>
              <Icon name="check" size={19} />
              Review reported civic complaints
            </li>
            <li>
              <Icon name="check" size={19} />
              Inspect evidence and priority analysis
            </li>
            <li>
              <Icon name="check" size={19} />
              Update complaint status securely
            </li>
          </ul>
        </div>
      </section>

      <main className="auth-form-area">
        <section className="auth-card">
          <Link className="auth-back" to="/">
            ← Back to Home
          </Link>

          <div className="auth-heading">
            <p>AUTHORIZED ACCESS</p>
            <h2>Admin Sign In</h2>
            <span>Use the municipal administrator credentials.</span>
          </div>

          <form onSubmit={handleLogin}>
            <label>
              Admin email
              <input
                type="email"
                name="email"
                placeholder="Enter admin email"
                autoComplete="username"
                required
              />
            </label>

            <label>
              Password
              <div className="password-control">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Remember me
              </label>
            </div>

            {loginError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  color: "#f87171",
                  background: "rgba(244, 63, 94, 0.1)",
                  border: "1px solid rgba(244, 63, 94, 0.25)",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                <Icon name="alert-triangle" size={16} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Signing in..." : "Sign In as Admin"}
            </button>
          </form>

          <p className="auth-switch">
            Citizen account? <Link to="/login">Open citizen sign in</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default AdminLogin;
