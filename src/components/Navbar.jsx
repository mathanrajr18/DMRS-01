import React, { useState, useEffect } from 'react';
import './Navbar.css';

function Navbar({ currentPage = 'home', onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Mission', id: 'mission' },
    { name: 'CubeSat', id: 'cubesat' },
    { name: 'Orbit', id: 'orbit' },
    { name: 'Telemetry', id: 'telemetry' },
    { name: 'Team', id: 'team' },
    { name: 'Technology', id: 'technology' },
    { name: 'Mission Control', id: 'mission-control', isCta: true },
    { name: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (id, e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <header className={`navbar-wrapper ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand Logo */}
        <a href="#home" className="navbar-brand" onClick={(e) => handleNavClick('home', e)} aria-label="DMRS-01 Aerospace Home">
          <div className="brand-orbit-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="orbit-svg" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3" />
              <ellipse cx="12" cy="12" rx="11" ry="4.5" transform="rotate(-30 12 12)" stroke="#00e5ff" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" fill="#38bdf8" />
            </svg>
            <span className="brand-pulse" aria-hidden="true"></span>
          </div>
          <div className="brand-text">
            <span className="brand-name">DMRS-01</span>
            <span className="brand-label">AEROSPACE</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav" aria-label="Main Navigation">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.id} className="nav-item">
                <a
                  href={`#${item.id}`}
                  className={`nav-link ${currentPage === item.id ? 'active' : ''} ${item.isCta ? 'nav-cta' : ''}`}
                  onClick={(e) => handleNavClick(item.id, e)}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                >
                  {item.isCta && <span className="cta-dot" aria-hidden="true"></span>}
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className={`mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        id="mobile-navigation"
        className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <ul className="mobile-nav-list">
          {navItems.map((item) => (
            <li key={`mobile-${item.id}`} className="mobile-nav-item">
              <a
                href={`#${item.id}`}
                className={`mobile-nav-link ${currentPage === item.id ? 'active' : ''} ${item.isCta ? 'mobile-nav-cta' : ''}`}
                onClick={(e) => handleNavClick(item.id, e)}
                aria-current={currentPage === item.id ? 'page' : undefined}
              >
                {item.isCta && <span className="cta-dot" aria-hidden="true"></span>}
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

export default Navbar;
