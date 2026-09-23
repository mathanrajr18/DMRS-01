import React from 'react';
import './Footer.css';

function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (page, e) => {
    if (onNavigate && (page === 'home' || page === 'mission' || page === 'mission-control' || page === 'cubesat' || page === 'telemetry' || page === 'orbit' || page === 'technology' || page === 'team' || page === 'contact')) {
      e.preventDefault();
      onNavigate(page);
    }
  };

  return (
    <footer className="aerospace-footer">
      <div className="footer-glow-bar"></div>
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-callsign">DMRS-01</span>
              <span className="logo-type">CUBESAT MISSION</span>
            </div>
            <p className="footer-tagline">
              Advancing nanosatellite research, autonomous orbital operations, and space technology exploration.
            </p>
          </div>

          <div className="footer-nav-groups">
            <div className="footer-nav-col">
              <h4>NAVIGATION</h4>
              <ul>
                <li><a href="#home" onClick={(e) => handleLinkClick('home', e)}>Home</a></li>
                <li><a href="#mission" onClick={(e) => handleLinkClick('mission', e)}>Mission</a></li>
                <li><a href="#cubesat" onClick={(e) => handleLinkClick('cubesat', e)}>CubeSat</a></li>
                <li><a href="#orbit" onClick={(e) => handleLinkClick('orbit', e)}>Orbit</a></li>
                <li><a href="#telemetry" onClick={(e) => handleLinkClick('telemetry', e)}>Telemetry</a></li>
                <li><a href="#technology" onClick={(e) => handleLinkClick('technology', e)}>Technology</a></li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <h4>OPERATIONS</h4>
              <ul>
                <li><a href="#mission-control" onClick={(e) => handleLinkClick('mission-control', e)}>Mission Control</a></li>
                <li><a href="#team" onClick={(e) => handleLinkClick('team', e)}>Team</a></li>
                <li><a href="#contact" onClick={(e) => handleLinkClick('contact', e)}>Contact</a></li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <h4>MISSION DATA</h4>
              <div className="mission-status-box">
                <div className="status-indicator">
                  <span className="indicator-dot"></span>
                  <span className="indicator-text">FLIGHT SYSTEM: NOMINAL</span>
                </div>
                <div className="status-coords">LEO ORBITAL INCLINATION: 97.4°</div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            &copy; {currentYear} DMRS-01 Space Systems. All aerospace flight specifications reserved.
          </p>
          <div className="footer-sublinks">
            <span>Orbital Flight System</span>
            <span>•</span>
            <span>CubeSat Class: 3U</span>
            <span>•</span>
            <span>Telemetry: S-Band / UHF</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
