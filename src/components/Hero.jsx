import React, { useState } from 'react';
import './Hero.css';
import heroImage from '../assets/dmrs01-hero.jpg';

function Hero({ onNavigate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleExploreClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('mission');
      return;
    }
    const overviewSection = document.getElementById('mission-overview');
    if (overviewSection) {
      overviewSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      setModalMessage('Mission Overview: DMRS-01 is a state-of-the-art 3U orbital platform engineered for low-Earth orbit technological demonstration.');
      setModalOpen(true);
    }
  };

  const handleMissionControlClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('mission-control');
      return;
    }
    setModalMessage('Mission Control Interface: Ground station communication link & operational telemetry console are scheduled for activation in the next mission phase.');
    setModalOpen(true);
  };

  return (
    <section className="hero-section" id="home">
      {/* Deep Space Background Atmosphere & Starfield Elements */}
      <div className="space-backdrop">
        <div className="stars-layer"></div>
        <div className="nebula-glow"></div>
        <div className="earth-limb-glow"></div>
      </div>

      <div className="hero-container">
        {/* Left Column: Mission Details & Call to Action */}
        <div className="hero-content">
          <div className="mission-pill">
            <span className="pill-pulse-ring"></span>
            <span className="pill-dot"></span>
            <span className="pill-text">ORBITAL MISSION STATUS: READY FOR LAUNCH</span>
          </div>

          <h1 className="hero-title">
            <span className="title-highlight">DMRS-01</span>
          </h1>

          <h2 className="hero-subtitle">CubeSat Mission</h2>

          <p className="hero-description">
            Next-generation nanosatellite engineered for low-Earth orbit research,
            autonomous multispectral observation, and high-frequency aerospace
            telecommunications. Built to advance miniaturized space flight technology.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={handleExploreClick}>
              <span>Explore Mission</span>
              <svg viewBox="0 0 20 20" fill="currentColor" className="btn-icon">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <button className="btn btn-secondary" onClick={handleMissionControlClick}>
              <span className="terminal-prefix">&gt;</span>
              <span>Mission Control</span>
            </button>
          </div>

          {/* Key Spacecraft Specifications Quick Strip */}
          <div className="hero-specs-strip">
            <div className="spec-card">
              <span className="spec-label">PLATFORM</span>
              <span className="spec-value">3U CubeSat</span>
            </div>
            <div className="spec-divider"></div>
            <div className="spec-card">
              <span className="spec-label">TARGET ORBIT</span>
              <span className="spec-value">LEO ~500 KM</span>
            </div>
            <div className="spec-divider"></div>
            <div className="spec-card">
              <span className="spec-label">SOLAR ARRAYS</span>
              <span className="spec-value">Dual Deployable</span>
            </div>
          </div>
        </div>

        {/* Right Column: Prominent Realistic Spacecraft Visual */}
        <div className="hero-spacecraft-showcase">
          <div className="spacecraft-halo"></div>
          
          <div className="spacecraft-frame">
            {/* Aerospace HUD Target Overlays */}
            <div className="hud-corner hud-top-left"></div>
            <div className="hud-corner hud-top-right"></div>
            <div className="hud-corner hud-bottom-left"></div>
            <div className="hud-corner hud-bottom-right"></div>

            <div className="hud-badge hud-badge-top">
              <span className="hud-tag">SATELLITE ID</span>
              <span className="hud-value">DMRS-01</span>
            </div>

            <div className="hud-badge hud-badge-bottom">
              <span className="hud-tag">PHOTOVOLTAIC ARRAYS</span>
              <span className="hud-value">DUAL-WING DEPLOYED</span>
            </div>

            {/* Realistic CubeSat in Orbit */}
            <div className="spacecraft-image-wrapper">
              <img
                src={heroImage}
                alt="DMRS-01 CubeSat Satellite with dual blue photovoltaic solar panels orbiting Earth"
                className="spacecraft-hero-image"
                loading="eager"
              />
              <div className="image-depth-overlay"></div>
            </div>
          </div>

          <div className="spacecraft-caption">
            <span className="caption-dot"></span>
            <span>FLIGHT CONFIGURATION • EARTH OBSERVATION ORBIT</span>
          </div>
        </div>
      </div>

      {/* Aerospace Status Notice Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <h3 className="modal-title">SYSTEM NOTICE</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close modal">✕</button>
            </div>
            <div className="modal-body">
              <p>{modalMessage}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(false)}>
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Hero;
