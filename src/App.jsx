import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Mission from './components/Mission';
import MissionControl from './components/MissionControl';
import CubeSat from './components/CubeSat';
import Telemetry from './components/Telemetry';
import Orbit from './components/Orbit';
import Technology from './components/Technology';
import Team from './components/Team';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './index.css';

const PAGE_TITLES = {
  home: 'DMRS-01 | CubeSat Project',
  mission: 'DMRS-01 | Mission',
  cubesat: 'DMRS-01 | CubeSat',
  'mission-control': 'DMRS-01 | Mission Control',
  telemetry: 'DMRS-01 | Telemetry',
  orbit: 'DMRS-01 | Orbit',
  technology: 'DMRS-01 | Technology',
  team: 'DMRS-01 | Team',
  contact: 'DMRS-01 | Contact',
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    document.title = PAGE_TITLES[currentPage] || 'DMRS-01 | CubeSat Project';
  }, [currentPage]);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dmrs-app">
      {/* Navigation Bar */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content: Home, Mission, Mission Control, CubeSat, Telemetry, Orbit, Technology, Team, or Contact */}
      <main>
        {currentPage === 'home' && <Hero onNavigate={handleNavigate} />}
        {currentPage === 'mission' && <Mission onNavigate={handleNavigate} />}
        {currentPage === 'mission-control' && <MissionControl onNavigate={handleNavigate} />}
        {currentPage === 'cubesat' && <CubeSat onNavigate={handleNavigate} />}
        {currentPage === 'telemetry' && <Telemetry onNavigate={handleNavigate} />}
        {currentPage === 'orbit' && <Orbit onNavigate={handleNavigate} />}
        {currentPage === 'technology' && <Technology onNavigate={handleNavigate} />}
        {currentPage === 'team' && <Team onNavigate={handleNavigate} />}
        {currentPage === 'contact' && <Contact onNavigate={handleNavigate} />}
      </main>

      {/* Aerospace Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
