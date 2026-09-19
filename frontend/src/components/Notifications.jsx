import { useState } from "react";
import Icon from "./Icons";

export default function Notifications() {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div style={{ position: "relative", zIndex: 999999 }}>
      <button
        type="button"
        onClick={handleClick}
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#ffffff",
          padding: "8px 14px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Icon name="bell" size={16} />
        Alerts
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            right: "30px",
            width: "320px",
            background: "#111726",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "12px",
            padding: "20px",
            zIndex: 9999999,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Icon name="check-circle" size={18} style={{ color: "#10b981" }} />
            <h3 style={{ margin: 0, fontSize: "16px" }}>Notifications Active</h3>
          </div>
          <p style={{ margin: "6px 0", fontSize: "13px", color: "#94a3b8" }}>Complaint submitted successfully</p>
          <p style={{ margin: "6px 0", fontSize: "13px", color: "#94a3b8" }}>Heavy rain warning in sector 4</p>
          <p style={{ margin: "6px 0", fontSize: "13px", color: "#94a3b8" }}>You earned 50 NagarCoins</p>
        </div>
      )}
    </div>
  );
}