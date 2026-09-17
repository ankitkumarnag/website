import potholePhoto from "../assets/pothole-before.webp";
import Icon from "./Icons";

const progress = [
  { title: "Reported", note: "Just now", icon: "file", active: true },
  { title: "Verified", note: "In Review", icon: "check" },
  { title: "Assigned", note: "PWD", icon: "hardhat" },
  { title: "Resolved", note: "Pending", icon: "check" },
];

function IssueDashboard() {
  return (
    <div className="issue-dashboard" id="track">
      <article className="glass-card main-issue-card">
        <img src={potholePhoto} alt="Large pothole filled with water" />

        <div className="issue-copy">
          <span className="detected-label">Issue Detected</span>
          <h2>Large pothole on main road</h2>
          <p className="location-line">
            <Icon name="pin" size={18} />
            Bhubaneswar, Odisha
          </p>
          <p className="reported-time">Reported just now</p>
        </div>
      </article>

      <div className="signal-cards">
        <article className="glass-card signal-card">
          <span className="signal-title">Priority</span>
          <div className="priority-ring">
            <strong>92</strong>
          </div>
        </article>

        <article className="glass-card signal-card assigned-card">
          <span className="signal-title">Assigned To</span>
          <span className="signal-icon green-icon">
            <Icon name="hardhat" size={31} />
          </span>
          <strong>PWD</strong>
          <small>Public Works Department</small>
        </article>

        <article className="glass-card signal-card status-card">
          <span className="signal-title">Status</span>
          <span className="status-wheel">
            <Icon name="tools" size={28} />
          </span>
          <strong>In Progress</strong>
        </article>
      </div>

      <div className="glass-card progress-card">
        {progress.map((item) => (
          <div
            className={`progress-step ${item.active ? "active" : ""}`}
            key={item.title}
          >
            <span className="progress-dot">
              <Icon name={item.icon} size={15} />
            </span>
            <strong>{item.title}</strong>
            <small>{item.note}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IssueDashboard;
