import Icon from "./Icons";

const stats = [
  {
    icon: "users",
    value: "125K+",
    label: "Citizens",
    note: "Active community members",
  },
  {
    icon: "file",
    value: "358K+",
    label: "Reports",
    note: "Issues reported across the city",
  },
  {
    icon: "check",
    value: "290K+",
    label: "Resolved",
    note: "Issues resolved successfully",
  },
  {
    icon: "building",
    value: "48+",
    label: "Departments",
    note: "Working together for our city",
  },
];

function ImpactStats() {
  return (
    <section className="impact-section" id="impact" aria-label="CivicAI impact">
      <div className="impact-grid">
        {stats.map((stat) => (
          <article className="impact-card" key={stat.label}>
            <span className="impact-icon">
              <Icon name={stat.icon} size={32} />
            </span>
            <div>
              <strong>{stat.value}</strong>
              <h3>{stat.label}</h3>
              <p>{stat.note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ImpactStats;
