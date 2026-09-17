import { Link } from "react-router";
import Icon from "../components/Icons";
import Navbar from "../components/Navbar";
import IssueDashboard from "../components/IssueDashboard";
import ImpactStats from "../components/ImpactStats";
import SuccessStories from "../components/SuccessStories";

function Home() {
  return (
    <div className="home-page">
      <section className="cinematic-hero" id="home">
        <Navbar />

        <div className="hero-layout">
          <div className="hero-copy">
            <h1>
              A better city
              <br />
              starts with <span>one report.</span>
            </h1>

            <div className="heading-line" />

            <p>
              Share what you see. CivicAI helps route it
              <br />
              to the right department and keeps you informed.
            </p>

            <div className="hero-actions">
              <Link className="primary-cta" to="/report">
  <Icon name="report" size={22} />
  Report an Issue
</Link>
              <a className="secondary-cta" href="#impact">
                <Icon name="chart" size={22} />
                See Our Impact
              </a>
            </div>
          </div>

          <IssueDashboard />
        </div>

        <div className="hero-curve" aria-hidden="true" />
      </section>

      <ImpactStats />
      <SuccessStories />

      <footer className="site-footer">
        <a className="site-logo footer-logo" href="#home">
          Civic<span>AI</span>
        </a>
        <p>Building stronger cities through transparent civic action.</p>
        <p>© 2026 CivicAI</p>
      </footer>
    </div>
  );
}

export default Home;
