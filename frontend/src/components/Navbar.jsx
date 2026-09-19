import React from "react";
import { Link } from "react-router";
import Notifications from "./Notifications";

function Navbar() {
  return (
    <header className="site-navbar">
      <Link className="site-logo" to="/" aria-label="CivicAI home">
        Civic<span>AI</span>
      </Link>

      <nav className="nav-pill" aria-label="Main navigation">
        <Link to="/report">Report</Link>
        <Link to="/track">Track</Link>
        <a href="#map">City Map</a>
        <a href="#impact">Our Impact</a>

        <Notifications />

        <Link className="login-link" to="/login">
          Login
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;