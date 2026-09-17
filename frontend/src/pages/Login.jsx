import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Icon from "../components/Icons";
import {
  citizenLogin,
  saveCitizenSession,
} from "../services/api";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setLoginMessage("");
    setLoginError("");

    const formData = new FormData(event.currentTarget);

    const identifier = String(
      formData.get("identifier") || ""
    ).trim();

    const password = String(
      formData.get("password") || ""
    );

    const remember = Boolean(
      formData.get("remember")
    );

    setIsSigningIn(true);

    try {
      const response = await citizenLogin(
        identifier,
        password,
        remember
      );

      saveCitizenSession(
        response.token,
        response.user,
        remember
      );

      setLoginMessage(
        `Welcome ${response.user?.firstName || "back"}! Sign in successful.`
      );

      setTimeout(() => {
        navigate("/", {
          replace: true,
        });
      }, 700);
    } catch (error) {
      setLoginError(
        error.message || "Unable to sign in."
      );
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <Link className="auth-logo" to="/">
          NagarSwar <span>AI</span>
        </Link>

        <div className="auth-visual-content">
          <p className="auth-label">CITIZEN PORTAL</p>

          <h1>
            Welcome back to a city that <span>listens.</span>
          </h1>

          <p>
            Sign in with the email address or mobile number that
            you verified while creating your NagarSwar account.
          </p>

          <ul>
            <li>
              <Icon name="check" size={19} />
              Only verified citizen accounts can sign in
            </li>

            <li>
              <Icon name="check" size={19} />
              Email or verified mobile number supported
            </li>

            <li>
              <Icon name="check" size={19} />
              Login attempts are rate-limited for safety
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
            <p>WELCOME BACK</p>

            <h2>Citizen Sign In</h2>

            <span>
              Enter your verified email or mobile number.
            </span>
          </div>

          <form onSubmit={handleLogin}>
            <label>
              Email or verified mobile number
              <input
                type="text"
                name="identifier"
                placeholder="Email address or 10-digit mobile number"
                autoComplete="username"
                required
              />
            </label>

            <label>
              Password
              <div className="password-control">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  minLength="8"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </label>

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="remember"
                />
                Remember me
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  alert(
                    "OTP-based password reset will be added next."
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            {loginError && (
              <div className="register-error">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={isSigningIn}
            >
              {isSigningIn
                ? "Signing In..."
                : "Sign In"}
            </button>

            {loginMessage && (
              <div className="login-message">
                <Icon
                  name="check"
                  size={20}
                />

                <span>
                  {loginMessage}
                </span>
              </div>
            )}
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <Link to="/register">
              Create a verified account
            </Link>
          </p>

          <p className="auth-switch">
            Municipal staff?{" "}
            <Link to="/admin">
              Open Admin Sign In
            </Link>
          </p>

          <p className="auth-demo-note">
            An unverified email or mobile number cannot be used
            to sign in.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Login;
