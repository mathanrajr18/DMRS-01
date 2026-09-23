import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './Technology.css';
import heroImage from '../assets/dmrs01-hero.jpg';

function Technology({ onNavigate }) {
  const mountRef = useRef(null);
  const animFrameId = useRef(null);
  const [activeSystem, setActiveSystem] = useState(0);

  // ---------------------------------------------------------------------------
  // 1. Hero Three.js 3D Earth & Slowly Orbiting Satellite
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 3.5, 14.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    sunLight.position.set(16, 8, 12);
    scene.add(sunLight);

    const limbLight = new THREE.DirectionalLight(0x0284c7, 0.9);
    limbLight.position.set(-12, -4, -8);
    scene.add(limbLight);

    // Procedural Earth Texture
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      const ocean = ctx.createLinearGradient(0, 0, 0, 512);
      ocean.addColorStop(0, '#0a2540');
      ocean.addColorStop(0.5, '#071e3d');
      ocean.addColorStop(1, '#051933');
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, 1024, 512);

      // Continent shapes
      const drawContinent = (cx, cy, rx, ry, col) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.2) {
          const rOffset = Math.sin(a * 4 + cx) * (rx * 0.25) + Math.cos(a * 6) * (ry * 0.15);
          const x = cx + Math.cos(a) * (rx + rOffset);
          const y = cy + Math.sin(a) * (ry + rOffset);
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      };

      drawContinent(550, 180, 140, 75, '#1e3a29');
      drawContinent(660, 195, 130, 70, '#264a32');
      drawContinent(530, 300, 95, 100, '#365314');
      drawContinent(230, 185, 110, 85, '#1e3a29');
      drawContinent(290, 340, 90, 115, '#166534');
      drawContinent(690, 240, 45, 45, '#2d5a27');
      drawContinent(840, 350, 70, 55, '#3f6212');

      // Ice caps
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(512, 20, 512, 35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(512, 492, 512, 35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      for (let i = 0; i < 18; i++) {
        const y = 60 + i * 24;
        const x = (i * 113) % 1024;
        ctx.beginPath();
        ctx.ellipse(x, y, 160 + (i % 4) * 30, 14 + (i % 3) * 6, 0.05, 0, Math.PI * 2);
        ctx.fill();
      }

      return new THREE.CanvasTexture(canvas);
    };

    // Earth Sphere
    const earthRadius = 3.6;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.6,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // Atmospheric Limb Glow
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.03, 36, 36);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(atmosGeo, atmosMat));

    // 3D Orbital Ring
    const orbitRadius = 5.8;
    const orbitSegments = 96;
    const orbitPoints = [];
    const inclination = THREE.MathUtils.degToRad(35);

    for (let i = 0; i <= orbitSegments; i++) {
      const theta = (i / orbitSegments) * Math.PI * 2;
      const v = new THREE.Vector3(orbitRadius * Math.cos(theta), 0, orbitRadius * Math.sin(theta));
      v.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination);
      orbitPoints.push(v);
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.45,
    });
    scene.add(new THREE.Line(orbitGeo, orbitMat));

    // Satellite Model
    const satGroup = new THREE.Group();

    // Body
    const satBodyGeo = new THREE.BoxGeometry(0.35, 0.45, 0.35);
    const satBodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 });
    satGroup.add(new THREE.Mesh(satBodyGeo, satBodyMat));

    // Solar Wings
    const wingGeo = new THREE.BoxGeometry(0.65, 0.3, 0.02);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-0.55, 0, 0);
    satGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(0.55, 0, 0);
    satGroup.add(rightWing);

    // Antenna
    const antGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.3, 8);
    const antMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
    const ant = new THREE.Mesh(antGeo, antMat);
    ant.position.set(0.08, 0.35, 0.08);
    satGroup.add(ant);

    // Beacon light
    const beacon = new THREE.PointLight(0x00e5ff, 1.2, 3);
    beacon.position.set(0, 0.3, 0);
    satGroup.add(beacon);

    scene.add(satGroup);

    // Starfield
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 40 + Math.random() * 40;
      const u = Math.random();
      const v = Math.random();
      const th = u * 2 * Math.PI;
      const ph = Math.acos(2 * v - 1);
      starPositions[i] = r * Math.sin(ph) * Math.cos(th);
      starPositions[i + 1] = r * Math.sin(ph) * Math.sin(th);
      starPositions[i + 2] = r * Math.cos(ph);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.7, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(starsGeo, starMat));

    // Animation Loop
    let angle = 0;
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      earthMesh.rotation.y += 0.0012;

      // Slow and smooth satellite orbital travel
      angle += 0.004;
      const pos = new THREE.Vector3(orbitRadius * Math.cos(angle), 0, orbitRadius * Math.sin(angle));
      pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination);
      satGroup.position.copy(pos);

      // Tangent alignment
      const nextPos = new THREE.Vector3(orbitRadius * Math.cos(angle + 0.02), 0, orbitRadius * Math.sin(angle + 0.02));
      nextPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination);
      satGroup.lookAt(nextPos);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Subsystem definitions for Section 2 (Exploded / Visual Anatomy)
  const subsystems = [
    {
      id: 'power',
      name: 'Power Subsystem (EPS)',
      icon: '⚡',
      summary: 'Photovoltaic solar arrays convert sunlight into electrical power, and Li-ion battery packs store energy for orbital eclipse periods.',
      specs: 'Solar arrays + Power distribution rails + LiPo energy storage',
    },
    {
      id: 'computer',
      name: 'Onboard Computer (OBC)',
      icon: '💻',
      summary: 'The central flight processor runs autonomous mission software, schedules sensor telemetry capture, and manages spacecraft health checks.',
      specs: 'Flight microcontroller + Non-volatile memory + Watchdog timers',
    },
    {
      id: 'sensors',
      name: 'Sensors & Transducers',
      icon: '📡',
      summary: 'Environmental sensors monitor internal spacecraft temperature, ambient air pressure during launch, and sunlight direction.',
      specs: 'Thermal transducers + Barometric sensor + Optical sun detectors',
    },
    {
      id: 'comm',
      name: 'Communication (TT&C)',
      icon: '📶',
      summary: 'Radio transceivers send telemetry and scientific data packets to ground stations and receive operational command uplinks.',
      specs: 'UHF/S-band transceiver + Deployable antenna systems',
    },
    {
      id: 'adcs',
      name: 'Attitude Determination & Control',
      icon: '🧭',
      summary: 'Inertial measurement units (IMUs) and active actuators orient the spacecraft toward Earth or the Sun for optimal power and mission tasks.',
      specs: '6-DOF gyroscopes + Accelerometers + Solar tracking servos',
    },
    {
      id: 'payload',
      name: 'Mission Payload',
      icon: '🔬',
      summary: 'The dedicated instruments designed to accomplish the specific mission goals, such as cameras, scientific detectors, or tech demos.',
      specs: 'Optical Earth-observation lens + Environmental experiment suite',
    },
  ];

  return (
    <div className="tech-page">
      {/* Subtle Background Ambience */}
      <div className="tech-bg-gradient"></div>

      <div className="tech-container">
        {/* ==================================================================
            1. HERO — HOW SATELLITES WORK
            ================================================================== */}
        <section className="tech-hero-section">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>SPACE SYSTEMS & ORBITAL TECHNOLOGY</span>
          </div>

          <h1 className="hero-main-title">HOW SATELLITES WORK</h1>
          <p className="hero-subtitle">
            Explore how satellites orbit Earth, collect information, generate power and communicate with the ground.
          </p>

          {/* 3D Realistic Earth & Orbiting Satellite Canvas */}
          <div className="tech-hero-canvas-wrap">
            <div className="tech-hero-canvas" ref={mountRef}></div>
            <div className="canvas-caption-tag">
              <span className="caption-dot"></span>
              <span>SIMULATION: LOW EARTH ORBIT (LEO) SATELLITE TRAJECTORY</span>
            </div>
          </div>

          {/* Simple Visual Flow */}
          <div className="satellite-flow-container">
            <div className="flow-step">
              <span className="step-num">01</span>
              <span className="step-title">EARTH</span>
              <span className="step-desc">Launch Site & Ground Ops</span>
            </div>
            <div className="flow-arrow">→</div>

            <div className="flow-step">
              <span className="step-num">02</span>
              <span className="step-title">LAUNCH</span>
              <span className="step-desc">Rocket Booster Ascent</span>
            </div>
            <div className="flow-arrow">→</div>

            <div className="flow-step">
              <span className="step-num">03</span>
              <span className="step-title">ORBIT</span>
              <span className="step-desc">Velocity Balances Gravity</span>
            </div>
            <div className="flow-arrow">→</div>

            <div className="flow-step">
              <span className="step-num">04</span>
              <span className="step-title">SATELLITE</span>
              <span className="step-desc">Sensors & Solar Tracking</span>
            </div>
            <div className="flow-arrow">→</div>

            <div className="flow-step">
              <span className="step-num">05</span>
              <span className="step-title">GROUND STATION</span>
              <span className="step-desc">Antenna Signal Downlink</span>
            </div>
            <div className="flow-arrow">→</div>

            <div className="flow-step highlight-step">
              <span className="step-num">06</span>
              <span className="step-title">DATA</span>
              <span className="step-desc">Mission Analysis</span>
            </div>
          </div>
        </section>

        {/* ==================================================================
            2. WHAT IS INSIDE A SATELLITE?
            ================================================================== */}
        <section className="tech-section">
          <div className="section-header">
            <span className="section-category">ANATOMY OF A SPACECRAFT</span>
            <h2 className="section-title">WHAT IS INSIDE A SATELLITE?</h2>
            <p className="section-subtext">
              Regardless of size, every operational satellite relies on modular core subsystems engineered to survive extreme orbital conditions.
            </p>
          </div>

          <div className="anatomy-layout">
            {/* Visual Spacecraft Diagram Representation */}
            <div className="anatomy-visual-box">
              <div className="schematic-satellite">
                <div className="schematic-wing left-wing">
                  <div className="pv-grid"></div>
                  <span className="part-label">SOLAR WING</span>
                </div>

                <div className="schematic-core">
                  <div className="chassis-bracket tl"></div>
                  <div className="chassis-bracket tr"></div>
                  <div className="chassis-bracket bl"></div>
                  <div className="chassis-bracket br"></div>

                  <div className="core-stack">
                    <div className={`stack-layer ${activeSystem === 5 ? 'active-layer' : ''}`} onClick={() => setActiveSystem(5)}>
                      <span>PAYLOAD SENSOR</span>
                    </div>
                    <div className={`stack-layer ${activeSystem === 1 ? 'active-layer' : ''}`} onClick={() => setActiveSystem(1)}>
                      <span>FLIGHT COMPUTER</span>
                    </div>
                    <div className={`stack-layer ${activeSystem === 3 ? 'active-layer' : ''}`} onClick={() => setActiveSystem(3)}>
                      <span>COMM / RADIO</span>
                    </div>
                    <div className={`stack-layer ${activeSystem === 4 ? 'active-layer' : ''}`} onClick={() => setActiveSystem(4)}>
                      <span>ATTITUDE (IMU)</span>
                    </div>
                    <div className={`stack-layer ${activeSystem === 0 ? 'active-layer' : ''}`} onClick={() => setActiveSystem(0)}>
                      <span>POWER & BATTERY</span>
                    </div>
                  </div>

                  <div className="schematic-lens"></div>
                  <div className="schematic-antenna"></div>
                </div>

                <div className="schematic-wing right-wing">
                  <div className="pv-grid"></div>
                  <span className="part-label">SOLAR WING</span>
                </div>
              </div>
              <div className="schematic-tip">Click any layer or item to inspect its role</div>
            </div>

            {/* Subsystem Details List */}
            <div className="subsystems-grid">
              {subsystems.map((sub, idx) => (
                <div
                  key={sub.id}
                  className={`subsystem-card ${activeSystem === idx ? 'selected-card' : ''}`}
                  onClick={() => setActiveSystem(idx)}
                >
                  <div className="card-top-row">
                    <span className="subsystem-icon">{sub.icon}</span>
                    <span className="subsystem-name">{sub.name}</span>
                  </div>
                  <p className="subsystem-desc">{sub.summary}</p>
                  <span className="subsystem-detail">{sub.specs}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            3. HOW A SATELLITE GETS POWER
            ================================================================== */}
        <section className="tech-section">
          <div className="section-header">
            <span className="section-category">ELECTRICAL POWER SUBSYSTEM</span>
            <h2 className="section-title">HOW A SATELLITE GETS POWER</h2>
            <p className="section-highlight-text">
              "Solar panels convert sunlight into electrical energy. Batteries store energy for periods when the satellite is in Earth's shadow."
            </p>
          </div>

          <div className="power-flow-visual">
            <div className="power-node sun-node">
              <div className="node-icon-circle sun-glow">☀️</div>
              <strong className="node-name">SUN</strong>
              <span className="node-note">Solar Radiation</span>
            </div>

            <div className="power-beam-arrow">
              <span className="beam-line"></span>
              <span className="beam-label">Photons</span>
            </div>

            <div className="power-node panel-node prominent-panel">
              <div className="solar-panel-preview">
                <div className="pv-cells"></div>
                <div className="pv-cells"></div>
              </div>
              <strong className="node-name text-yellow">SOLAR PANELS</strong>
              <span className="node-note">Photovoltaic Array</span>
            </div>

            <div className="power-beam-arrow">
              <span className="beam-line"></span>
              <span className="beam-label">DC Current</span>
            </div>

            <div className="power-node battery-node">
              <div className="node-icon-circle battery-glow">🔋</div>
              <strong className="node-name text-green">BATTERY</strong>
              <span className="node-note">Energy Storage (Eclipse)</span>
            </div>

            <div className="power-beam-arrow">
              <span className="beam-line"></span>
              <span className="beam-label">Regulated Bus</span>
            </div>

            <div className="power-node systems-node">
              <div className="node-icon-circle sat-glow">🛰️</div>
              <strong className="node-name">SATELLITE SYSTEMS</strong>
              <span className="node-note">Computer, Sensors, Radio</span>
            </div>
          </div>
        </section>

        {/* ==================================================================
            4. HOW SATELLITES COMMUNICATE
            ================================================================== */}
        <section className="tech-section">
          <div className="section-header">
            <span className="section-category">TELECOMMUNICATIONS & TELEMETRY</span>
            <h2 className="section-title">HOW SATELLITES COMMUNICATE</h2>
            <p className="section-highlight-text">
              "Satellites use radio communication to send telemetry and mission data to ground stations."
            </p>
          </div>

          <div className="comms-flow-container">
            <div className="comms-stage-box">
              <div className="stage-icon">🛰️</div>
              <div className="stage-info">
                <strong className="stage-title">SATELLITE</strong>
                <span className="stage-desc">Transmits encoded RF telemetry packets</span>
              </div>
            </div>

            <div className="comms-signal-connector">
              <div className="wave-icon">〰️ 〰️ 〰️</div>
              <span className="signal-badge">RADIO SIGNAL (UHF / S-BAND)</span>
            </div>

            <div className="comms-stage-box">
              <div className="stage-icon">📡</div>
              <div className="stage-info">
                <strong className="stage-title">GROUND STATION</strong>
                <span className="stage-desc">High-gain tracking dish receives downlink</span>
              </div>
            </div>

            <div className="comms-signal-connector">
              <div className="wire-icon">───────▶</div>
              <span className="signal-badge">FIBER NETWORK</span>
            </div>

            <div className="comms-stage-box">
              <div className="stage-icon">🖥️</div>
              <div className="stage-info">
                <strong className="stage-title">MISSION CONTROL</strong>
                <span className="stage-desc">Real-time health monitoring & command uplink</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            5. WHAT SATELLITES ARE USED FOR
            ================================================================== */}
        <section className="tech-section">
          <div className="section-header">
            <span className="section-category">SPACE APPLICATIONS</span>
            <h2 className="section-title">WHAT SATELLITES ARE USED FOR</h2>
            <p className="section-subtext">
              Modern society depends continuously on space infrastructure across six essential domains.
            </p>
          </div>

          <div className="applications-grid">
            <div className="app-card">
              <div className="app-icon">🌐</div>
              <h3 className="app-name">COMMUNICATION</h3>
              <p className="app-desc">
                Relays telephone, internet, and broadcast media signals across global landmasses and oceans.
              </p>
            </div>

            <div className="app-card">
              <div className="app-icon">🌦️</div>
              <h3 className="app-name">WEATHER</h3>
              <p className="app-desc">
                Tracks cloud patterns, atmospheric temperatures, storms, and cyclone paths for meteorological forecasts.
              </p>
            </div>

            <div className="app-card">
              <div className="app-icon">🧭</div>
              <h3 className="app-name">NAVIGATION</h3>
              <p className="app-desc">
                Provides precise satellite timing and positioning data for GPS, aviation, maritime shipping, and phones.
              </p>
            </div>

            <div className="app-card">
              <div className="app-icon">🌍</div>
              <h3 className="app-name">EARTH OBSERVATION</h3>
              <p className="app-desc">
                Monitors agricultural health, deforestation, polar ice cap retreat, and urban expansion over decades.
              </p>
            </div>

            <div className="app-card">
              <div className="app-icon">🔭</div>
              <h3 className="app-name">SCIENCE</h3>
              <p className="app-desc">
                Investigates cosmic radiation, planetary physics, space weather, and Earth's upper atmosphere.
              </p>
            </div>

            <div className="app-card">
              <div className="app-icon">🚨</div>
              <h3 className="app-name">DISASTER MONITORING</h3>
              <p className="app-desc">
                Delivers rapid imaging of wildfires, floods, tsunami impacts, and earthquakes to assist emergency responders.
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================================
            6. EARTH ORBIT
            ================================================================== */}
        <section className="tech-section">
          <div className="section-header">
            <span className="section-category">ORBITAL MECHANICS</span>
            <h2 className="section-title">EARTH ORBIT REGIONS</h2>
            <p className="section-subtext">
              Satellites are placed into specific orbits depending on their mission, coverage area, and observation requirements.
            </p>
          </div>

          <div className="orbit-levels-container">
            {/* Visual Altitude Ladder */}
            <div className="orbit-ladder-card">
              <div className="orbit-level-badge leo-badge">
                <span className="level-tag">LEO</span>
                <span className="altitude-label">160 – 2,000 km</span>
              </div>
              <div className="orbit-level-content">
                <h3 className="level-title">LEO — Low Earth Orbit</h3>
                <p className="level-text">
                  Closest to Earth. Ideal for high-resolution Earth observation, the International Space Station, and CubeSats with rapid ~90-minute orbital periods.
                </p>
              </div>
            </div>

            <div className="orbit-ladder-card">
              <div className="orbit-level-badge meo-badge">
                <span className="level-tag">MEO</span>
                <span className="altitude-label">2,000 – 35,786 km</span>
              </div>
              <div className="orbit-level-content">
                <h3 className="level-title">MEO — Medium Earth Orbit</h3>
                <p className="level-text">
                  Intermediate altitude. Home to global navigation satellite constellations including GPS, Galileo, and GLONASS, balancing ground coverage and signal delay.
                </p>
              </div>
            </div>

            <div className="orbit-ladder-card">
              <div className="orbit-level-badge geo-badge">
                <span className="level-tag">GEO</span>
                <span className="altitude-label">35,786 km</span>
              </div>
              <div className="orbit-level-content">
                <h3 className="level-title">GEO — Geostationary Earth Orbit</h3>
                <p className="level-text">
                  Matches Earth's exact 24-hour rotation speed, appearing stationary over one geographic location. Perfect for persistent weather observation and direct-to-home broadcast.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            7. SATELLITES AROUND EARTH
            ================================================================== */}
        <section className="tech-section">
          <div className="section-header">
            <span className="section-category">ORBITAL POPULATION</span>
            <h2 className="section-title">OUR ORBITAL NEIGHBOURHOOD</h2>
            <p className="section-subtext">
              Thousands of artificial satellites have been launched since the beginning of the Space Age, serving communication, navigation, science and Earth observation.
            </p>
          </div>

          <div className="neighbourhood-grid">
            <div className="fact-card prominent-fact">
              <span className="fact-number">~10,200+</span>
              <span className="fact-label">Active Operational Satellites</span>
              <p className="fact-source">
                Source: ESA Space Debris Office & UCS Satellite Database (Reported 2024)
              </p>
            </div>

            <div className="fact-card info-card">
              <div className="info-icon">ℹ️</div>
              <h4 className="info-title">Orbital Population Context</h4>
              <p className="info-desc">
                "Satellites are only one part of the population of objects around Earth."
              </p>
              <span className="info-footnote">
                In addition to functioning spacecraft, thousands of rocket bodies, defunct payloads, and fragments orbit simultaneously.
              </span>
            </div>
          </div>
        </section>

        {/* ==================================================================
            8. SPACE DEBRIS
            ================================================================== */}
        <section className="tech-section">
          <div className="section-header">
            <span className="section-category">SPACE SUSTAINABILITY</span>
            <h2 className="section-title">SPACE DEBRIS</h2>
            <p className="section-highlight-text">
              "Not every object in orbit is an active satellite. Space around Earth also contains inactive spacecraft, rocket stages and debris."
            </p>
          </div>

          <div className="debris-types-grid">
            <div className="debris-card active-sat">
              <div className="status-indicator-dot dot-green"></div>
              <h3 className="debris-title">Active Satellite</h3>
              <p className="debris-desc">
                Operational spacecraft with functional power, computing, and orientation systems performing regular missions.
              </p>
            </div>

            <div className="debris-card inactive-sat">
              <div className="status-indicator-dot dot-yellow"></div>
              <h3 className="debris-title">Inactive Satellite</h3>
              <p className="debris-desc">
                Retired spacecraft that have completed their lifespan, run out of maneuvering propellant, or suffered subsystem power loss.
              </p>
            </div>

            <div className="debris-card rocket-body">
              <div className="status-indicator-dot dot-gray"></div>
              <h3 className="debris-title">Rocket Body</h3>
              <p className="debris-desc">
                Upper rocket booster stages left in orbital trajectories after releasing satellites into their operational altitudes.
              </p>
            </div>

            <div className="debris-card fragment-debris">
              <div className="status-indicator-dot dot-orange"></div>
              <h3 className="debris-title">Debris Fragments</h3>
              <p className="debris-desc">
                Small hardware fragments, solar panel paint flakes, and collision remnants tracked by international space surveillance networks.
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================================
            9. WHY SPACE TECHNOLOGY MATTERS
            ================================================================== */}
        <section className="tech-section">
          <div className="section-header">
            <span className="section-category">IMPACT ON SOCIETY</span>
            <h2 className="section-title">WHY SPACE TECHNOLOGY MATTERS</h2>
            <p className="section-subtext">
              Everyday life on Earth is intrinsically connected to the silent operations of spacecraft overhead.
            </p>
          </div>

          <div className="benefits-cards-grid">
            <div className="benefit-item">
              <div className="benefit-marker">🌤️</div>
              <div className="benefit-content">
                <strong className="benefit-heading">Weather Forecasts</strong>
                <p className="benefit-text">
                  Early cyclone alerts and storm warnings save lives and protect communities.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-marker">📍</div>
              <div className="benefit-content">
                <strong className="benefit-heading">Navigation</strong>
                <p className="benefit-text">
                  Accurate satellite positioning coordinates commercial aviation, shipping logistics, and emergency dispatch.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-marker">📡</div>
              <div className="benefit-content">
                <strong className="benefit-heading">Communication</strong>
                <p className="benefit-text">
                  Instant global connectivity connects isolated rural regions, islands, and oceanic transport.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-marker">🌱</div>
              <div className="benefit-content">
                <strong className="benefit-heading">Earth Monitoring</strong>
                <p className="benefit-text">
                  Multispectral sensors assess soil moisture, freshwater reservoirs, and forest conservation health.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-marker">🔭</div>
              <div className="benefit-content">
                <strong className="benefit-heading">Scientific Research</strong>
                <p className="benefit-text">
                  Orbital laboratories advance microgravity medicine, material sciences, and planetary climate physics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            10. DMRS-01 — OUR PROJECT
            ================================================================== */}
        <section className="tech-section dmrs-project-showcase">
          <div className="dmrs-box">
            <div className="dmrs-badge-row">
              <span className="dmrs-tag">ACADEMIC & RESEARCH INITIATIVE</span>
              <span className="dev-status-pill">
                <span className="pill-beacon"></span>
                PROJECT DEVELOPMENT / SIMULATION
              </span>
            </div>

            <h2 className="dmrs-title">WHERE DMRS-01 FITS</h2>

            <p className="dmrs-description">
              "DMRS-01 is our CubeSat project exploring satellite sensing, onboard processing, solar tracking and telemetry monitoring."
            </p>

            <div className="dmrs-visual-row">
              <div className="dmrs-img-container">
                <img
                  src={heroImage}
                  alt="DMRS-01 CubeSat prototype illustration with dual deployable solar panels in orbit"
                  className="dmrs-orbit-img"
                />
                <div className="dmrs-img-overlay"></div>
                <div className="dmrs-img-tag">3U CUBESAT FORM FACTOR</div>
              </div>

              <div className="dmrs-flow-column">
                <span className="flow-column-header">DMRS-01 ONBOARD DATA PIPELINE</span>

                <div className="dmrs-pipeline-stepper">
                  <div className="pipe-step">
                    <span className="pipe-dot"></span>
                    <div className="pipe-info">
                      <strong>SENSORS</strong>
                      <span>BMP180, Humidity, LDR Sun Detectors, MPU6050</span>
                    </div>
                  </div>

                  <div className="pipe-arrow">↓</div>

                  <div className="pipe-step">
                    <span className="pipe-dot"></span>
                    <div className="pipe-info">
                      <strong className="text-cyan">ESP32</strong>
                      <span>Dual-core flight controller & ADC signal processing</span>
                    </div>
                  </div>

                  <div className="pipe-arrow">↓</div>

                  <div className="pipe-step">
                    <span className="pipe-dot"></span>
                    <div className="pipe-info">
                      <strong>TELEMETRY</strong>
                      <span>State packaging, closed-loop servo solar tracking</span>
                    </div>
                  </div>

                  <div className="pipe-arrow">↓</div>

                  <div className="pipe-step">
                    <span className="pipe-dot"></span>
                    <div className="pipe-info">
                      <strong>COMMUNICATION</strong>
                      <span>UART / Wi-Fi serial telemetry packet broadcast</span>
                    </div>
                  </div>

                  <div className="pipe-arrow">↓</div>

                  <div className="pipe-step highlight-pipe">
                    <span className="pipe-dot green-dot"></span>
                    <div className="pipe-info">
                      <strong className="text-green">MISSION CONTROL</strong>
                      <span>Live ground console visualization and data logging</span>
                    </div>
                  </div>
                </div>

                <div className="dmrs-buttons-row">
                  <button className="dmrs-btn primary" onClick={() => onNavigate && onNavigate('cubesat')}>
                    3D CubeSat Inspection →
                  </button>
                  <button className="dmrs-btn secondary" onClick={() => onNavigate && onNavigate('orbit')}>
                    3D Orbit Simulator →
                  </button>
                  <button className="dmrs-btn secondary" onClick={() => onNavigate && onNavigate('mission-control')}>
                    Mission Control →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Technology;
