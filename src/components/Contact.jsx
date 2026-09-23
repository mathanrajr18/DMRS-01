import React from 'react';
import './Contact.css';
import collegeLogo from '../assets/college-logo.jpg';
import githubLogo from '../assets/github-logo.png';
import linkedinLogo from '../assets/linkedin-logo.png';

function Contact({ onNavigate }) {
  const teamMembers = [
    {
      id: 'fabin',
      name: 'Fabin Ronaldo A',
      phone: '+91 79046 38790',
      phoneHref: 'tel:+917904638790',
      email: 'ronaldo123@vmail.com',
      emailHref: 'mailto:ronaldo123@vmail.com'
    },
    {
      id: 'dharmalingam',
      name: 'Dharmalingam M',
      phone: '+91 98437 73284',
      phoneHref: 'tel:+919843773284',
      email: 'drmdsm4@gmail.com',
      emailHref: 'mailto:drmdsm4@gmail.com'
    },
    {
      id: 'mathanraj',
      name: 'Mathanraj R',
      phone: '+91 9360065347',
      phoneHref: 'tel:+919360065347',
      email: 'mathanrajdc18@gmail.com',
      emailHref: 'mailto:mathanrajdc18@gmail.com',
      socials: {
        linkedin: 'www.linkedin.com/in/',
        linkedinHref: 'https://www.linkedin.com/in/',
        github: 'https://github.com/mathanrajr18',
        githubHref: 'https://github.com/mathanrajr18'
      }
    }
  ];

  return (
    <div className="contact-page">
      {/* Subtle PCB / Circuit-Line Background Decoration (Light Corporate Engineering Style) */}
      <div className="contact-pcb-bg" aria-hidden="true">
        <svg className="contact-circuit-svg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="light-circuit-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(37, 99, 235, 0.035)" strokeWidth="1" strokeDasharray="2 4" />
              <circle cx="0" cy="0" r="1.2" fill="rgba(37, 99, 235, 0.08)" />
              <circle cx="60" cy="0" r="1.2" fill="rgba(37, 99, 235, 0.08)" />
              <circle cx="0" cy="60" r="1.2" fill="rgba(37, 99, 235, 0.08)" />
              <circle cx="60" cy="60" r="1.2" fill="rgba(37, 99, 235, 0.08)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#light-circuit-grid)" />
          
          {/* Subtle Clean PCB Traces */}
          <g stroke="rgba(37, 99, 235, 0.09)" strokeWidth="1.2" fill="none">
            <path d="M 30 80 L 140 80 L 180 120 L 320 120" />
            <circle cx="30" cy="80" r="2.5" fill="#38bdf8" />
            <circle cx="320" cy="120" r="2.5" fill="#2563eb" />

            <path d="M 900 60 L 1020 60 L 1060 100 L 1180 100" />
            <circle cx="900" cy="60" r="2.5" fill="#2563eb" />
            <circle cx="1180" cy="100" r="2.5" fill="#38bdf8" />

            <path d="M 80 460 L 200 460 L 240 500 L 380 500" />
            <circle cx="80" cy="460" r="2.5" fill="#93c5fd" />
            <circle cx="380" cy="500" r="2.5" fill="#2563eb" />

            <path d="M 880 480 L 990 480 L 1030 520 L 1140 520" />
            <circle cx="880" cy="480" r="2.5" fill="#2563eb" />
            <circle cx="1140" cy="520" r="2.5" fill="#38bdf8" />
          </g>
        </svg>
      </div>

      <div className="contact-container">
        
        {/* =================================================================
            1. HEADER / HERO
            ================================================================= */}
        <header className="contact-header">
          <h1 className="contact-title">CONTACT US</h1>
          <p className="contact-subtitle">Connect with the DMRS-01 CubeSat Team</p>
        </header>

        {/* =================================================================
            2. TEAM CARDS (EXACTLY 3 EQUAL-SIZED CARDS IN ONE ROW ON DESKTOP)
            ================================================================= */}
        <section className="contact-cards-section" aria-label="Team Members">
          <div className="contact-cards-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="contact-card">
                {/* Small Blue Accent Line at Top of Card */}
                <div className="card-top-accent"></div>

                {/* Member Header: Small Contact Icon & Name */}
                <div className="card-header">
                  <div className="card-icon-wrap" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-svg-icon">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <h2 className="card-name">{member.name}</h2>
                </div>

                {/* Contact Items: Phone & Email */}
                <div className="card-contacts">
                  {/* Phone */}
                  <a href={member.phoneHref} className="contact-item-link" title={`Call ${member.name}`}>
                    <span className="item-icon-box" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="item-svg">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <span className="item-text">{member.phone}</span>
                  </a>

                  {/* Email */}
                  <a href={member.emailHref} className="contact-item-link" title={`Email ${member.name}`}>
                    <span className="item-icon-box" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="item-svg">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <span className="item-text">{member.email}</span>
                  </a>
                </div>

                {/* Social Links (Mathanraj R Only) */}
                {member.socials ? (
                  <div className="card-social-section">
                    <div className="social-divider"></div>
                    <div className="social-links-list">
                      {/* LinkedIn */}
                      <a
                        href={member.socials.linkedinHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-compact-link"
                        title="LinkedIn Profile"
                      >
                        <div className="social-logo-wrap">
                          <img src={linkedinLogo} alt="LinkedIn" className="social-small-logo" />
                        </div>
                        <span className="social-link-label">{member.socials.linkedin}</span>
                        <svg className="external-tiny-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="7 7 17 7 17 17" />
                        </svg>
                      </a>

                      {/* GitHub */}
                      <a
                        href={member.socials.githubHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-compact-link"
                        title="GitHub Profile"
                      >
                        <div className="social-logo-wrap">
                          <img src={githubLogo} alt="GitHub" className="social-small-logo" />
                        </div>
                        <span className="social-link-label">{member.socials.github}</span>
                        <svg className="external-tiny-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="7 7 17 7 17 17" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Spacing placeholder to keep height perfectly aligned */
                  <div className="card-empty-spacer" aria-hidden="true"></div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================
            3. COLLEGE SECTION
            ================================================================= */}
        <section className="contact-college-section" aria-label="College Information">
          <div className="college-card">
            {/* College Logo - Kept Small and Aspect-Ratio Preserved */}
            <div className="college-logo-wrap">
              <img
                src={collegeLogo}
                alt="SACS MAVMM Engineering College Logo"
                className="college-logo-img"
              />
            </div>

            {/* College Name & Email */}
            <div className="college-details-wrap">
              <h2 className="college-title">SACS MAVMM Engineering College</h2>
              <div className="college-email-row">
                <span className="college-email-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="college-email-svg">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <span className="college-email-label">Email:</span>
                <a href="mailto:sacmecsacsmec@yahoo.com" className="college-email-link">
                  sacmecsacsmec@yahoo.com
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            4. CLEAN PROFESSIONAL FOOTER
            ================================================================= */}
        <footer className="contact-bottom-footer">
          <div className="footer-accent-bar" aria-hidden="true"></div>
          <div className="footer-title">DMRS-01 CubeSat Project</div>
          <div className="footer-tagline">"Learn. Build. Test. Explore."</div>
        </footer>

      </div>
    </div>
  );
}

export default Contact;
