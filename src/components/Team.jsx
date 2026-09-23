import React from 'react';
import './Team.css';
import fabinImg from '../assets/team-fabin.jpg';
import dharmanlingamImg from '../assets/team-dharmanlingam.jpg';
import mathanrajImg from '../assets/team-mathanraj.jpg';

function Team({ onNavigate }) {
  const teamMembers = [
    {
      name: 'Fabin Ronaldo A',
      year: '3rd Year • ECE',
      college: 'SACS MAVMM Engineering College',
      project: 'DMRS-01 CubeSat Project',
      photo: fabinImg,
      badge: 'ECE DEPT',
      callsign: 'ECE-01'
    },
    {
      name: 'Dharmalingam M',
      year: '3rd Year • ECE',
      college: 'SACS MAVMM Engineering College',
      project: 'DMRS-01 CubeSat Project',
      photo: dharmanlingamImg,
      badge: 'ECE DEPT',
      callsign: 'ECE-02'
    },
    {
      name: 'Mathanraj R',
      year: '3rd Year • ECE',
      college: 'SACS MAVMM Engineering College',
      project: 'DMRS-01 CubeSat Project',
      photo: mathanrajImg,
      badge: 'ECE DEPT',
      callsign: 'ECE-03'
    },
  ];

  const workflowSteps = [
    {
      id: 'idea',
      label: 'IDEA',
      desc: 'Concept & mission goals',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
        </svg>
      )
    },
    {
      id: 'design',
      label: 'DESIGN',
      desc: 'Schematics & architecture',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <path d="M6 8h4" />
          <path d="M6 12h8" />
        </svg>
      )
    },
    {
      id: 'build',
      label: 'BUILD',
      desc: 'PCB assembly & wiring',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      )
    },
    {
      id: 'test',
      label: 'TEST',
      desc: 'Telemetry & sensor checks',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      )
    },
    {
      id: 'dmrs01',
      label: 'DMRS-01',
      desc: 'Integrated flight system',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 19 21 12 17 5 21 12 2" />
        </svg>
      )
    }
  ];

  const teamValues = [
    {
      title: 'ELECTRONICS',
      desc: 'Building the foundation with hands-on learning',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      )
    },
    {
      title: 'COMMUNICATION',
      desc: 'Exploring wireless and satellite communication',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.93 19.07A10 10 0 0 1 12 2a10 10 0 0 1 7.07 17.07" />
          <path d="M8.46 15.54A6 6 0 0 1 12 6a6 6 0 0 1 3.54 9.54" />
          <circle cx="12" cy="18" r="2" fill="#2563eb" />
        </svg>
      )
    },
    {
      title: 'INNOVATION',
      desc: 'Turning ideas into real-world solutions',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )
    },
    {
      title: 'TEAMWORK',
      desc: 'Learning and growing together',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    }
  ];

  return (
    <div className="team-page">
      {/* Subtle PCB Circuit Background Vectors */}
      <div className="team-pcb-background" aria-hidden="true">
        <svg className="pcb-circuit-svg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pcb-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="1.5" fill="#94a3b8" />
              <circle cx="80" cy="0" r="1.5" fill="#94a3b8" />
              <circle cx="0" cy="80" r="1.5" fill="#94a3b8" />
              <circle cx="80" cy="80" r="1.5" fill="#94a3b8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pcb-grid)" />
          
          {/* Subtle PCB Traces & Connection Nodes */}
          <g stroke="#cbd5e1" strokeWidth="1.2" fill="none" opacity="0.6">
            <path d="M 50 120 L 180 120 L 220 160 L 400 160" />
            <circle cx="50" cy="120" r="3" fill="#3b82f6" />
            <circle cx="400" cy="160" r="3" fill="#3b82f6" />
            
            <path d="M 900 80 L 1050 80 L 1100 130 L 1250 130" />
            <circle cx="900" cy="80" r="3" fill="#2563eb" />
            <circle cx="1250" cy="130" r="3" fill="#2563eb" />

            <path d="M 120 480 L 260 480 L 300 520 L 450 520" />
            <circle cx="120" cy="480" r="2.5" fill="#64748b" />
            <circle cx="450" cy="520" r="2.5" fill="#64748b" />

            <path d="M 850 600 L 980 600 L 1020 640 L 1180 640" />
            <circle cx="850" cy="600" r="2.5" fill="#3b82f6" />
            <circle cx="1180" cy="640" r="2.5" fill="#3b82f6" />
          </g>
        </svg>
      </div>

      <div className="team-container">
        
        {/* =================================================================
            1. HEADER / HERO SECTION
            ================================================================= */}
        <section className="team-hero-section">
          <div className="team-hero-content">
            <div className="team-label-chip">
              <span className="label-indicator-dot"></span>
              <span className="team-small-label">OUR TEAM</span>
            </div>

            <h1 className="team-main-heading">Three Minds. One Mission.</h1>

            <p className="team-hero-desc">
              We are a student team exploring electronics, communication and space technology through the DMRS-01 CubeSat project.
            </p>

            <div className="team-keywords-banner">
              <span className="keyword-item">LEARN</span>
              <span className="keyword-separator">|</span>
              <span className="keyword-item">BUILD</span>
              <span className="keyword-separator">|</span>
              <span className="keyword-item">EXPLORE</span>
              <span className="keyword-separator">|</span>
              <span className="keyword-item">INNOVATE</span>
            </div>
          </div>

          {/* Right Side: Subtle DMRS-01 Chip/PCB Inspired Graphic */}
          <div className="team-hero-chip-graphic" aria-label="DMRS-01 PCB IC Graphic">
            <div className="chip-package">
              <div className="chip-pins top-pins">
                {[...Array(6)].map((_, i) => (
                  <div key={`tp-${i}`} className="chip-pin"></div>
                ))}
              </div>
              <div className="chip-body">
                <div className="chip-notch"></div>
                <div className="chip-inner-circuit">
                  <div className="chip-brand">DMRS-01</div>
                  <div className="chip-sub">ECE CORE • REV 3.0</div>
                  <div className="chip-bus-indicator">
                    <span className="bus-dot active"></span>
                    <span className="bus-label">BUS: ACTIVE</span>
                  </div>
                </div>
                <div className="chip-specs-mini">
                  <span>ESP32-S3</span>
                  <span>•</span>
                  <span>TELEMETRY</span>
                  <span>•</span>
                  <span>433MHz</span>
                </div>
              </div>
              <div className="chip-pins bottom-pins">
                {[...Array(6)].map((_, i) => (
                  <div key={`bp-${i}`} className="chip-pin"></div>
                ))}
              </div>
            </div>

            {/* Trace lines coming off the IC */}
            <svg className="chip-traces-svg" width="280" height="180" viewBox="0 0 280 180" fill="none">
              <path d="M 30 90 L 70 90 L 90 60" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="30" cy="90" r="3" fill="#3b82f6" />
              <path d="M 250 90 L 210 90 L 190 120" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="250" cy="90" r="3" fill="#3b82f6" />
              <path d="M 140 10 L 140 30" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="140" cy="10" r="2.5" fill="#64748b" />
              <path d="M 140 170 L 140 150" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="140" cy="170" r="2.5" fill="#64748b" />
            </svg>
          </div>
        </section>

        {/* =================================================================
            2. TEAM MEMBERS SECTION
            ================================================================= */}
        <section className="team-members-section">
          <div className="section-header-compact">
            <span className="section-sub-tag">MEMBERS</span>
            <h2 className="section-title-compact">Project Engineers</h2>
          </div>

          <div className="team-cards-grid">
            {teamMembers.map((member, index) => (
              <div key={member.name} className="team-member-card">
                <div className="card-top-circuit">
                  <span className="callsign-tag">{member.callsign}</span>
                  <span className="dept-tag">{member.badge}</span>
                </div>

                <div className="member-portrait-frame">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="member-portrait-img"
                    loading="lazy"
                  />
                  <div className="portrait-corner-brackets">
                    <span className="corner top-left"></span>
                    <span className="corner top-right"></span>
                    <span className="corner bottom-left"></span>
                    <span className="corner bottom-right"></span>
                  </div>
                </div>

                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <div className="member-year-badge">
                    <span className="year-pill">{member.year}</span>
                  </div>
                  <div className="member-college">
                    <svg className="college-mini-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                    <span>{member.college}</span>
                  </div>
                  <p className="member-project">
                    <svg className="cubesat-mini-icon" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1L2 4.5v7L8 15l6-3.5v-7L8 1zm0 1.5l4.5 2.6-4.5 2.6-4.5-2.6L8 2.5zm-5 4l4.5 2.6v4.7L3 11.2V6.5zm5.5 7.3V9.1l4.5-2.6v4.7l-4.5 2.6z"/>
                    </svg>
                    {member.project}
                  </p>
                </div>

                <div className="card-bottom-bar">
                  <span className="status-dot"></span>
                  <span className="status-text">ACTIVE MEMBER</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================
            3. OUR MISSION SECTION
            ================================================================= */}
        <section className="team-mission-section">
          <div className="mission-section-header">
            <span className="section-sub-tag">OUR MISSION</span>
            <h2 className="mission-main-text">Learn. Build. Test. Explore.</h2>
            <p className="mission-short-desc">
              Working together to learn electronics and communication engineering through a hands-on CubeSat project.
            </p>
          </div>

          <div className="workflow-container">
            <div className="workflow-steps-track">
              {workflowSteps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div className="workflow-step-node">
                    <div className="workflow-icon-bubble">
                      {step.icon}
                    </div>
                    <div className="workflow-step-label">{step.label}</div>
                    <div className="workflow-step-sub">{step.desc}</div>
                  </div>

                  {idx < workflowSteps.length - 1 && (
                    <div className="workflow-arrow-connector" aria-hidden="true">
                      <div className="connector-circuit-line"></div>
                      <svg className="arrow-head-svg" viewBox="0 0 16 16" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 3 11 8 6 13" />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================================
            4. TEAM VALUES SECTION
            ================================================================= */}
        <section className="team-values-section">
          <div className="section-header-compact">
            <span className="section-sub-tag">CORE PILLARS</span>
            <h2 className="section-title-compact">Team Values</h2>
          </div>

          <div className="values-grid">
            {teamValues.map((val) => (
              <div key={val.title} className="value-card">
                <div className="value-icon-box">
                  {val.icon}
                </div>
                <div className="value-content">
                  <h3 className="value-title">{val.title}</h3>
                  <p className="value-desc">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================
            5. FOOTER BANNER
            ================================================================= */}
        <section className="team-footer-banner">
          <div className="banner-circuit-accent left" aria-hidden="true">
            <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
              <path d="M 0 20 L 50 20 L 70 35" stroke="#93c5fd" strokeWidth="1.5" />
              <circle cx="70" cy="35" r="3" fill="#2563eb" />
            </svg>
          </div>

          <div className="banner-text-center">
            <div className="banner-project-name">DMRS-01</div>
            <div className="banner-project-title">STUDENT CUBESAT PROJECT</div>
            <div className="banner-tagline">Small Ideas | Big Horizons</div>
          </div>

          <div className="banner-circuit-accent right" aria-hidden="true">
            <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
              <path d="M 80 20 L 30 20 L 10 5" stroke="#93c5fd" strokeWidth="1.5" />
              <circle cx="10" cy="5" r="3" fill="#2563eb" />
            </svg>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Team;
