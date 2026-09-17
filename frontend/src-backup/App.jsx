import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="navbar">
        <a href="#home" className="brand">
          Civic<span>AI</span>
        </a>

        <nav className="nav-menu">
          <a href="#home">Home</a>
          <a href="#how-it-works">How It Works</a>
          <button type="button" className="login-button">
            Login
          </button>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">AI-POWERED CIVIC REPORTING</p>

            <h1>Your voice can build a better city.</h1>

            <p className="hero-description">
              Report potholes, sanitation problems, electricity failures,
              healthcare issues and other public problems with evidence and
              location.
            </p>

            <div className="hero-buttons">
              <button type="button" className="primary-button">
                Report a Complaint
              </button>

              <button type="button" className="secondary-button">
                Track Complaint
              </button>
            </div>
          </div>

          <div className="complaint-preview">
            <div className="preview-heading">
              <span className="issue-icon">🛣️</span>
              <span className="priority">High Priority</span>
            </div>

            <h2>Large pothole on main road</h2>

            <p>📍 Bhubaneswar, Odisha</p>

            <div className="status-row">
              <span>Status</span>
              <strong>Under Review</strong>
            </div>
          </div>
        </section>

        <section className="how-it-works" id="how-it-works">
          <p className="section-label">SIMPLE PROCESS</p>
          <h2>How CivicAI works</h2>

          <div className="steps">
            <article className="step-card">
              <span>01</span>
              <h3>Report the issue</h3>
              <p>Describe the problem and upload supporting evidence.</p>
            </article>

            <article className="step-card">
              <span>02</span>
              <h3>AI analyses it</h3>
              <p>AI identifies its category, priority and department.</p>
            </article>

            <article className="step-card">
              <span>03</span>
              <h3>Track the action</h3>
              <p>Receive updates until the complaint is resolved.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 CivicAI — Building better cities together.</p>
      </footer>
    </div>
  );
}

export default App;