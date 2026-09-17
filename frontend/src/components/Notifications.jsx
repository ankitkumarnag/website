import { useState } from "react";

export default function Notifications() {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    alert("Notification button clicked!");
    setOpen(!open);
  };

  return (
    <div style={{ position: "relative", zIndex: 999999 }}>
      <button
        type="button"
        onClick={handleClick}
        style={{
          background: "yellow",
          border: "2px solid red",
          padding: "10px",
          cursor: "pointer",
          fontSize: "20px",
          position: "relative",
          zIndex: 999999
        }}
      >
        🔔 TEST
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            top: "100px",
            right: "30px",
            width: "300px",
            background: "white",
            color: "black",
            border: "3px solid red",
            padding: "20px",
            zIndex: 9999999
          }}
        >
          <h3>Notifications Working ✅</h3>
          <p>Complaint submitted successfully</p>
          <p>Heavy rain warning</p>
          <p>You earned 50 NagarCoins</p>
        </div>
      )}
    </div>
  );
}