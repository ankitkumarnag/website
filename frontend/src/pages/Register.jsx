import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Icon from "../components/Icons";
import {
  requestCitizenOtp,
  resendCitizenOtp,
  verifyCitizenOtp,
} from "../services/api";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [verificationMethod, setVerificationMethod] =
    useState("email");

  const [registrationId, setRegistrationId] = useState("");
  const [otpDestination, setOtpDestination] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendSeconds((current) =>
        current > 0 ? current - 1 : 0
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  async function handleRegister(event) {
    event.preventDefault();

    setRegisterMessage("");
    setRegisterError("");

    const formData = new FormData(event.currentTarget);

    const password = String(formData.get("password") || "");
    const confirmPassword = String(
      formData.get("confirmPassword") || ""
    );

    if (password !== confirmPassword) {
      setRegisterError(
        "Password and confirm password do not match."
      );
      return;
    }

    if (password.length < 8) {
      setRegisterError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    const payload = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password,
      verificationMethod,
    };

    setIsSendingOtp(true);

    try {
      const response = await requestCitizenOtp(payload);

      setRegistrationId(response.registrationId);
      setOtpDestination(response.destination || "");
      setOtp("");
      setOtpStep(true);
      setResendSeconds(response.resendAfterSeconds || 60);

      setRegisterMessage(
        response.message ||
          "Verification code sent successfully."
      );
    } catch (error) {
      setRegisterError(
        error.message || "Unable to send verification code."
      );
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();

    setRegisterError("");
    setRegisterMessage("");

    const cleanOtp = otp.replace(/\D/g, "").slice(0, 6);

    if (cleanOtp.length !== 6) {
      setRegisterError("Enter the 6-digit OTP.");
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const response = await verifyCitizenOtp(
        registrationId,
        cleanOtp
      );

      setRegisterMessage(
        response.message ||
          "Account created successfully."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      setRegisterError(
        error.message || "Unable to verify OTP."
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function handleResendOtp() {
    if (!registrationId || resendSeconds > 0) {
      return;
    }

    setRegisterError("");
    setRegisterMessage("");
    setIsSendingOtp(true);

    try {
      const response = await resendCitizenOtp(registrationId);

      setRegisterMessage(
        response.message || "New OTP sent successfully."
      );

      setResendSeconds(response.resendAfterSeconds || 60);
    } catch (error) {
      setRegisterError(
        error.message || "Unable to resend OTP."
      );
    } finally {
      setIsSendingOtp(false);
    }
  }

  function restartRegistration() {
    setOtpStep(false);
    setRegistrationId("");
    setOtpDestination("");
    setOtp("");
    setRegisterMessage("");
    setRegisterError("");
    setResendSeconds(0);
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <Link className="auth-logo" to="/">
          NagarSwar <span>AI</span>
        </Link>

        <div className="auth-visual-content">
          <p className="auth-label">JOIN NAGARSWAR AI</p>

          <h1>
            Your report can create <span>real change.</span>
          </h1>

          <p>
            Create a verified citizen account to report public issues,
            upload evidence and follow every update until resolution.
          </p>

          <ul>
            <li>
              <Icon name="check" size={19} />
              One account per email and mobile number
            </li>

            <li>
              <Icon name="check" size={19} />
              Verify your account using Email OTP or Mobile OTP
            </li>

            <li>
              <Icon name="check" size={19} />
              Passwords are stored as secure hashes
            </li>
          </ul>
        </div>
      </section>

      <main className="auth-form-area">
        <section className="auth-card register-card">
          <Link className="auth-back" to="/">
            ← Back to Home
          </Link>

          <div className="auth-heading">
            <p>CREATE VERIFIED ACCOUNT</p>

            <h2>Join NagarSwar AI</h2>

            <span>
              Your account is created only after OTP verification.
            </span>
          </div>

          {!otpStep ? (
            <form onSubmit={handleRegister}>
              <div className="register-name-grid">
                <label>
                  First name
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    autoComplete="given-name"
                    required
                  />
                </label>

                <label>
                  Last name
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    autoComplete="family-name"
                    required
                  />
                </label>
              </div>

              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Mobile number
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your 10-digit mobile number"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  autoComplete="tel"
                  required
                />
              </label>

              <label>
                Password
                <div className="password-control">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    minLength="8"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <label>
                Confirm password
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Enter the password again"
                  minLength="8"
                  autoComplete="new-password"
                  required
                />
              </label>

              <div
                style={{
                  padding: "16px",
                  margin: "8px 0 18px",
                  background: "#f3f8f6",
                  border: "1px solid #d6e6e0",
                  borderRadius: "12px",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    color: "#173840",
                  }}
                >
                  Send verification OTP by
                </strong>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <label
                    style={{
                      margin: 0,
                      padding: "12px",
                      border:
                        verificationMethod === "email"
                          ? "2px solid #0aa476"
                          : "1px solid #cfded9",
                      borderRadius: "10px",
                      cursor: "pointer",
                      background:
                        verificationMethod === "email"
                          ? "#eaf8f2"
                          : "#ffffff",
                    }}
                  >
                    <input
                      type="radio"
                      name="verificationMethod"
                      value="email"
                      checked={verificationMethod === "email"}
                      onChange={() =>
                        setVerificationMethod("email")
                      }
                      style={{ marginRight: "8px" }}
                    />
                    Email OTP
                  </label>

                  <label
                    style={{
                      margin: 0,
                      padding: "12px",
                      border:
                        verificationMethod === "phone"
                          ? "2px solid #0aa476"
                          : "1px solid #cfded9",
                      borderRadius: "10px",
                      cursor: "pointer",
                      background:
                        verificationMethod === "phone"
                          ? "#eaf8f2"
                          : "#ffffff",
                    }}
                  >
                    <input
                      type="radio"
                      name="verificationMethod"
                      value="phone"
                      checked={verificationMethod === "phone"}
                      onChange={() =>
                        setVerificationMethod("phone")
                      }
                      style={{ marginRight: "8px" }}
                    />
                    Mobile OTP
                  </label>
                </div>

                <small
                  style={{
                    display: "block",
                    marginTop: "10px",
                    color: "#637d82",
                    lineHeight: 1.5,
                  }}
                >
                  Only the contact verified by OTP can be used to
                  sign in. The other contact remains unverified.
                </small>
              </div>

              <label className="terms-check">
                <input type="checkbox" required />

                <span>
                  I agree to the NagarSwar AI terms and confirm
                  that the information provided is correct.
                </span>
              </label>

              {registerError && (
                <div className="register-error">
                  ⚠️ {registerError}
                </div>
              )}

              {registerMessage && (
                <div className="login-message">
                  <Icon name="check" size={20} />
                  <span>{registerMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={isSendingOtp}
              >
                {isSendingOtp
                  ? "Sending OTP..."
                  : verificationMethod === "email"
                  ? "Send OTP to Email"
                  : "Send OTP to Mobile"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div
                style={{
                  padding: "18px",
                  marginBottom: "18px",
                  background: "#eef8f4",
                  border: "1px solid #cde7dc",
                  borderRadius: "12px",
                }}
              >
                <strong
                  style={{
                    color: "#087452",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  OTP sent successfully
                </strong>

                <p
                  style={{
                    margin: 0,
                    color: "#5e777b",
                    lineHeight: 1.5,
                  }}
                >
                  Enter the 6-digit OTP sent to{" "}
                  <strong>{otpDestination}</strong>.
                  The code expires in 5 minutes.
                </p>
              </div>

              <label>
                Verification OTP
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  maxLength="6"
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  required
                  style={{
                    textAlign: "center",
                    letterSpacing: "8px",
                    fontSize: "22px",
                    fontWeight: "800",
                  }}
                />
              </label>

              {registerError && (
                <div className="register-error">
                  ⚠️ {registerError}
                </div>
              )}

              {registerMessage && (
                <div className="login-message">
                  <Icon name="check" size={20} />
                  <span>{registerMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={isVerifyingOtp}
              >
                {isVerifyingOtp
                  ? "Verifying..."
                  : "Verify OTP & Create Account"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={
                  resendSeconds > 0 ||
                  isSendingOtp
                }
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "12px",
                  border: "1px solid #cbdcd6",
                  borderRadius: "10px",
                  background: "#ffffff",
                  color: "#087452",
                  fontWeight: "800",
                  cursor:
                    resendSeconds > 0
                      ? "not-allowed"
                      : "pointer",
                  opacity: resendSeconds > 0 ? 0.6 : 1,
                }}
              >
                {resendSeconds > 0
                  ? `Resend OTP in ${resendSeconds}s`
                  : "Resend OTP"}
              </button>

              <button
                type="button"
                onClick={restartRegistration}
                style={{
                  width: "100%",
                  marginTop: "9px",
                  padding: "10px",
                  border: "0",
                  background: "transparent",
                  color: "#657a7f",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ← Edit registration details
              </button>
            </form>
          )}

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>

          <p className="auth-demo-note">
            NagarSwar does not create the citizen account until
            the selected email or mobile OTP is successfully verified.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Register;
