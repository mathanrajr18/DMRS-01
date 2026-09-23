import React, { useEffect } from 'react';
import './Mission.css';

function Mission({ onNavigate }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="mission-page">
      {/* Background Atmosphere */}
      <div className="mission-backdrop">
        <div className="mission-grid-lines"></div>
        <div className="mission-subtle-glow"></div>
      </div>

      <div className="mission-container">
        {/* Header & Breadcrumb */}
        <div className="mission-header-bar">
          <div className="mission-breadcrumb">
            <span className="badge-dot"></span>
            <span className="breadcrumb-text">DMRS-01 • CUBESAT MISSION ARCHITECTURE</span>
          </div>

          {onNavigate && (
            <button className="back-btn" onClick={() => onNavigate('home')} aria-label="Return to Home">
              <svg viewBox="0 0 20 20" fill="currentColor" className="btn-icon">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Back to Home</span>
            </button>
          )}
        </div>

        {/* Title Block */}
        <div className="mission-title-block">
          <h1 className="mission-title">Mission Systems &amp; Hardware</h1>
          <p className="mission-tagline">
            Student CubeSat prototype for atmospheric monitoring, autonomous solar tracking, and embedded telemetry.
          </p>
        </div>

        {/* =========================================================================
            1. TELEMETRY & ENVIRONMENTAL SENSORS (SAMPLE DEMO TELEMETRY)
           ========================================================================= */}
        <section className="section-block">
          <div className="block-header">
            <div className="block-title-group">
              <span className="block-number">01</span>
              <div>
                <h2 className="block-heading">Environmental Sensors &amp; Telemetry</h2>
                <span className="block-sub">Simulated values until real ESP32 telemetry is connected</span>
              </div>
            </div>
            <div className="demo-pill">
              <span className="demo-dot"></span>
              <span>SIMULATED TELEMETRY</span>
            </div>
          </div>

          <div className="telemetry-grid">
            {/* Temperature */}
            <div className="telemetry-card card-warm">
              <div className="telemetry-top">
                <span className="telemetry-label">Temperature</span>
                <span className="chip-tag tag-yellow">BMP180</span>
              </div>
              <div className="telemetry-metric">
                <span className="metric-val text-yellow">28.4</span>
                <span className="metric-unit">°C</span>
              </div>
              <div className="telemetry-footer">
                <span className="status-indicator-dot dot-yellow"></span>
                <span className="footer-subtext">Thermal Payload Range</span>
              </div>
            </div>

            {/* Pressure */}
            <div className="telemetry-card">
              <div className="telemetry-top">
                <span className="telemetry-label">Pressure</span>
                <span className="chip-tag">BMP180</span>
              </div>
              <div className="telemetry-metric">
                <span className="metric-val">1008</span>
                <span className="metric-unit">hPa</span>
              </div>
              <div className="telemetry-footer">
                <span className="status-indicator-dot dot-cyan"></span>
                <span className="footer-subtext">Atmospheric Pressure</span>
              </div>
            </div>

            {/* Humidity */}
            <div className="telemetry-card">
              <div className="telemetry-top">
                <span className="telemetry-label">Humidity</span>
                <span className="chip-tag">Sensor</span>
              </div>
              <div className="telemetry-metric">
                <span className="metric-val">56</span>
                <span className="metric-unit">%</span>
              </div>
              <div className="telemetry-footer">
                <span className="status-indicator-dot dot-cyan"></span>
                <span className="footer-subtext">Relative Air Moisture</span>
              </div>
            </div>

            {/* Solar Voltage */}
            <div className="telemetry-card card-warm">
              <div className="telemetry-top">
                <span className="telemetry-label">Solar Voltage</span>
                <span className="chip-tag tag-yellow">Solar Panels</span>
              </div>
              <div className="telemetry-metric">
                <span className="metric-val text-yellow">5.8</span>
                <span className="metric-unit">V</span>
              </div>
              <div className="telemetry-footer">
                <span className="status-indicator-dot dot-yellow"></span>
                <span className="footer-subtext">Power Generation Rail</span>
              </div>
            </div>

            {/* Sunlight */}
            <div className="telemetry-card card-warm">
              <div className="telemetry-top">
                <span className="telemetry-label">Sunlight</span>
                <span className="chip-tag tag-yellow">LDR Sensors</span>
              </div>
              <div className="telemetry-metric">
                <span className="metric-val text-yellow">High</span>
                <span className="metric-unit">Lux</span>
              </div>
              <div className="telemetry-footer">
                <span className="status-indicator-dot dot-yellow"></span>
                <span className="footer-subtext">Peak Optical Intensity</span>
              </div>
            </div>

            {/* Motion */}
            <div className="telemetry-card">
              <div className="telemetry-top">
                <span className="telemetry-label">Motion</span>
                <span className="chip-tag">Gyroscope</span>
              </div>
              <div className="telemetry-metric">
                <span className="metric-val text-cyan">Stable</span>
                <span className="metric-unit">3-Axis</span>
              </div>
              <div className="telemetry-footer">
                <span className="status-indicator-dot dot-cyan"></span>
                <span className="footer-subtext">Orientation &amp; Attitude</span>
              </div>
            </div>

            {/* System Status */}
            <div className="telemetry-card card-status-healthy">
              <div className="telemetry-top">
                <span className="telemetry-label">System Status</span>
                <span className="chip-tag tag-green">ESP32</span>
              </div>
              <div className="telemetry-metric">
                <span className="metric-val text-green">NORMAL</span>
              </div>
              <div className="telemetry-footer">
                <span className="status-indicator-dot dot-green"></span>
                <span className="footer-subtext">All Subsystems Nominal</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. SOLAR TRACKING SYSTEM (COMPACT VISUAL PIPELINE)
           ========================================================================= */}
        <section className="section-block">
          <div className="block-header">
            <div className="block-title-group">
              <span className="block-number">02</span>
              <div>
                <h2 className="block-heading">Autonomous Solar Tracking</h2>
                <span className="block-sub">Closed-loop sun tracking pipeline</span>
              </div>
            </div>
            <div className="status-badge-inline">
              <span className="pulse-yellow"></span>
              <span className="text-yellow">ACTIVE VECTORING</span>
            </div>
          </div>

          <div className="solar-diagram-container">
            {/* Sunlight Source */}
            <div className="solar-node sun-source-node">
              <div className="solar-icon-wrap sun-bg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" fill="#facc15" fillOpacity="0.25" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </div>
              <span className="solar-node-title text-yellow">Sunlight</span>
              <span className="solar-node-desc">Incident Solar Radiance</span>
            </div>

            <div className="solar-arrow-down">
              <span className="arrow-shaft"></span>
              <span className="arrow-tip">↓</span>
            </div>

            {/* Dual LDR Sensors */}
            <div className="ldr-dual-node">
              <div className="ldr-half">
                <span className="ldr-tag">LDR Left</span>
                <span className="ldr-val">Sensor A</span>
              </div>
              <div className="ldr-divider">|</div>
              <div className="ldr-half">
                <span className="ldr-tag">LDR Right</span>
                <span className="ldr-val">Sensor B</span>
              </div>
            </div>

            <div className="solar-arrow-down">
              <span className="arrow-shaft"></span>
              <span className="arrow-tip">↓</span>
            </div>

            {/* ESP32 Controller */}
            <div className="solar-node controller-node">
              <div className="solar-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                  <line x1="9" y1="1" x2="9" y2="4" />
                  <line x1="15" y1="1" x2="15" y2="4" />
                  <line x1="9" y1="20" x2="9" y2="23" />
                  <line x1="15" y1="20" x2="15" y2="23" />
                </svg>
              </div>
              <span className="solar-node-title">ESP32</span>
              <span className="solar-node-desc">Differential Vector Computation</span>
            </div>

            <div className="solar-arrow-down">
              <span className="arrow-shaft"></span>
              <span className="arrow-tip">↓</span>
            </div>

            {/* Servo Motor */}
            <div className="solar-node actuator-node">
              <div className="solar-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 12l4 -4M12 6a6 6 0 1 1 -6 6" />
                </svg>
              </div>
              <span className="solar-node-title">Servo Motor</span>
              <span className="solar-node-desc">Precision Rotation Actuation</span>
            </div>

            <div className="solar-arrow-down">
              <span className="arrow-shaft"></span>
              <span className="arrow-tip">↓</span>
            </div>

            {/* Solar Panel */}
            <div className="solar-node panel-result-node">
              <div className="solar-icon-wrap panel-bg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="1" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="9" y1="4" x2="9" y2="20" />
                  <line x1="15" y1="4" x2="15" y2="20" />
                </svg>
              </div>
              <span className="solar-node-title text-yellow">Solar Panel Direction</span>
              <span className="solar-node-desc">Rotates directly toward strongest sunlight</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. ONBOARD ELECTRONICS (VISUAL CARDS)
           ========================================================================= */}
        <section className="section-block">
          <div className="block-header">
            <div className="block-title-group">
              <span className="block-number">03</span>
              <div>
                <h2 className="block-heading">On-Board Electronics</h2>
                <span className="block-sub">Core hardware payload &amp; components</span>
              </div>
            </div>
          </div>

          <div className="hardware-grid">
            {/* 1. ESP32 */}
            <div className="hw-card">
              <div className="hw-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                </svg>
              </div>
              <div className="hw-content">
                <h3 className="hw-title">ESP32</h3>
                <span className="hw-subtitle">Main Controller</span>
                <p className="hw-detail">Central CPU executing flight routines, ADC sampling, and servo logic.</p>
              </div>
            </div>

            {/* 2. BMP180 */}
            <div className="hw-card">
              <div className="hw-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                </svg>
              </div>
              <div className="hw-content">
                <h3 className="hw-title">BMP180</h3>
                <span className="hw-subtitle">Temperature + Pressure</span>
                <p className="hw-detail">High-accuracy digital sensor measuring thermal and barometric data.</p>
              </div>
            </div>

            {/* 3. Humidity Sensor */}
            <div className="hw-card">
              <div className="hw-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <div className="hw-content">
                <h3 className="hw-title">Humidity Sensor</h3>
                <span className="hw-subtitle">Humidity</span>
                <p className="hw-detail">Moisture transducer monitoring relative atmospheric air conditions.</p>
              </div>
            </div>

            {/* 4. Gyroscope */}
            <div className="hw-card">
              <div className="hw-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <ellipse cx="12" cy="12" rx="9" ry="3" />
                  <path d="M12 3v18" />
                </svg>
              </div>
              <div className="hw-content">
                <h3 className="hw-title">Gyroscope</h3>
                <span className="hw-subtitle">Motion / Orientation</span>
                <p className="hw-detail">Multi-axis inertial sensor tracking spacecraft attitude and dynamics.</p>
              </div>
            </div>

            {/* 5. LDR Sensors */}
            <div className="hw-card card-warm">
              <div className="hw-icon-box icon-yellow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                </svg>
              </div>
              <div className="hw-content">
                <h3 className="hw-title text-yellow">LDR Sensors</h3>
                <span className="hw-subtitle text-yellow">Sunlight Detection</span>
                <p className="hw-detail">Photo-resistive array measuring ambient solar vector illumination.</p>
              </div>
            </div>

            {/* 6. Solar Panels */}
            <div className="hw-card card-warm">
              <div className="hw-icon-box icon-yellow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="16" rx="1" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
              </div>
              <div className="hw-content">
                <h3 className="hw-title text-yellow">Solar Panels</h3>
                <span className="hw-subtitle text-yellow">Solar Voltage</span>
                <p className="hw-detail">Dual photovoltaic arrays for onboard power generation and voltage checks.</p>
              </div>
            </div>

            {/* 7. Servo Motor */}
            <div className="hw-card">
              <div className="hw-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <div className="hw-content">
                <h3 className="hw-title">Servo Motor</h3>
                <span className="hw-subtitle">Solar Tracking</span>
                <p className="hw-detail">Precision mechanical motor orienting the solar wing toward sunlight.</p>
              </div>
            </div>

            {/* 8. OLED Display */}
            <div className="hw-card">
              <div className="hw-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div className="hw-content">
                <h3 className="hw-title">OLED Display</h3>
                <span className="hw-subtitle">Telemetry</span>
                <p className="hw-detail">On-chassis graphical screen showing local diagnostics &amp; measurements.</p>
              </div>
            </div>

            {/* 9. 7-Segment Display */}
            <div className="hw-card">
              <div className="hw-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 14 14" />
                </svg>
              </div>
              <div className="hw-content">
                <h3 className="hw-title">7-Segment Display</h3>
                <span className="hw-subtitle">Mission Clock</span>
                <p className="hw-detail">Digital LED display indicating real-time mission clock elapsed time.</p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. VISUAL STATUS INDICATORS
           ========================================================================= */}
        <section className="section-block">
          <div className="block-header">
            <div className="block-title-group">
              <span className="block-number">04</span>
              <div>
                <h2 className="block-heading">Visual Indicators &amp; Annunciators</h2>
                <span className="block-sub">Telemetry status color logic</span>
              </div>
            </div>
          </div>

          <div className="status-trio-grid">
            {/* Green = Normal */}
            <div className="status-pill-card pill-green">
              <div className="indicator-beacon beacon-green">
                <span className="beacon-ring"></span>
                <span className="beacon-core"></span>
              </div>
              <div className="pill-info">
                <div className="pill-title text-green">Green LED — Normal</div>
                <div className="pill-desc">Nominal operating state • All sensors and voltages within spec.</div>
              </div>
            </div>

            {/* Yellow = Sunlight / Heat */}
            <div className="status-pill-card pill-yellow">
              <div className="indicator-beacon beacon-yellow">
                <span className="beacon-ring ring-yellow"></span>
                <span className="beacon-core core-yellow"></span>
              </div>
              <div className="pill-info">
                <div className="pill-title text-yellow">Yellow Indicator — Sunlight / Heat</div>
                <div className="pill-desc">Solar energy detection • Active solar tracking and thermal state.</div>
              </div>
            </div>

            {/* Red = Warning */}
            <div className="status-pill-card pill-red">
              <div className="indicator-beacon beacon-red">
                <span className="beacon-ring ring-red"></span>
                <span className="beacon-core core-red"></span>
              </div>
              <div className="pill-info">
                <div className="pill-title text-red">Red LED — Warning</div>
                <div className="pill-desc">Abnormal condition • Triggered if system thresholds are exceeded.</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. MISSION DATA FLOW (VISUAL STRIP)
           ========================================================================= */}
        <section className="section-block">
          <div className="block-header">
            <div className="block-title-group">
              <span className="block-number">05</span>
              <div>
                <h2 className="block-heading">Mission Data Flow</h2>
                <span className="block-sub">Telemetry architecture</span>
              </div>
            </div>
          </div>

          <div className="flow-strip">
            <div className="flow-step">
              <span className="step-num">01</span>
              <span className="step-name">Sensors</span>
              <span className="step-note">BMP180 • Humidity • Gyro • LDRs</span>
            </div>

            <div className="flow-divider">→</div>

            <div className="flow-step">
              <span className="step-num">02</span>
              <span className="step-name">ESP32</span>
              <span className="step-note">Processing &amp; Servo Tracking</span>
            </div>

            <div className="flow-divider">→</div>

            <div className="flow-step">
              <span className="step-num">03</span>
              <span className="step-name">Local Displays</span>
              <span className="step-note">OLED • 7-Segment • Status LEDs</span>
            </div>

            <div className="flow-divider">→</div>

            <div className="flow-step flow-step-highlight">
              <span className="step-num">04</span>
              <span className="step-name text-cyan">Mission Control</span>
              <span className="step-note">DMRS-01 Ground Interface</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Mission;
