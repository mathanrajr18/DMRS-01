import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Orbit.css';
import { INITIAL_TELEMETRY } from '../services/telemetryService';

function Orbit({ onNavigate }) {
  const [telemetry] = useState(INITIAL_TELEMETRY);
  const [isOrbiting, setIsOrbiting] = useState(true);
  const [orbitSpeed, setOrbitSpeed] = useState(1);
  const [followSatellite, setFollowSatellite] = useState(false);
  const [utcTime, setUtcTime] = useState(() => new Date().toISOString().substring(11, 19) + ' UTC');
  const [orbitStats, setOrbitStats] = useState({
    altitude: 512,
    velocity: 7.61,
    lat: '14.2° N',
    lon: '78.5° E',
    period: '94.8 min',
    inclination: '97.4°',
    passStatus: 'SUNLIT PASS',
  });

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameId = useRef(null);
  const satelliteMeshRef = useRef(null);
  const earthMeshRef = useRef(null);
  const cloudsMeshRef = useRef(null);

  // Orbit angle ref
  const orbitAngleRef = useRef(0);
  const isOrbitingRef = useRef(isOrbiting);
  const orbitSpeedRef = useRef(orbitSpeed);
  const followSatelliteRef = useRef(followSatellite);

  // Interaction refs
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const cameraSpherical = useRef({ radius: 19, theta: 0.35, phi: 1.15 });

  useEffect(() => {
    isOrbitingRef.current = isOrbiting;
  }, [isOrbiting]);

  useEffect(() => {
    orbitSpeedRef.current = orbitSpeed;
  }, [orbitSpeed]);

  useEffect(() => {
    followSatelliteRef.current = followSatellite;
  }, [followSatellite]);

  // Live UTC and Sub-satellite tracking simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toISOString().substring(11, 19) + ' UTC');
      setOrbitStats(prev => {
        const altNoise = (Math.sin(Date.now() * 0.001) * 1.2).toFixed(1);
        const velNoise = (Math.cos(Date.now() * 0.001) * 0.02).toFixed(2);
        return {
          ...prev,
          altitude: (512 + parseFloat(altNoise)).toFixed(1),
          velocity: (7.61 + parseFloat(velNoise)).toFixed(2),
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ---------------------------------------------------------------------------
  // Three.js 3D Earth, Orbit Path, and DMRS-01 CubeSat
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0a1628, 1.4);
    scene.add(ambientLight);

    // Sun directional light (illuminates Earth and CubeSat)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    sunLight.position.set(18, 8, 14);
    scene.add(sunLight);

    // Deep space rim light for Earth limb
    const spaceRim = new THREE.DirectionalLight(0x38bdf8, 0.8);
    spaceRim.position.set(-15, -6, -10);
    scene.add(spaceRim);

    // -------------------------------------------------------------------------
    // 4. Create Realistic Procedural Earth (Requirement: Moderately Sized, Centered)
    // -------------------------------------------------------------------------
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // Deep ocean base
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      oceanGrad.addColorStop(0, '#0a2540');
      oceanGrad.addColorStop(0.5, '#071e3d');
      oceanGrad.addColorStop(1, '#051933');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 2048, 1024);

      // Continent shapes simulation
      const drawContinent = (cx, cy, rx, ry, col) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.15) {
          const rOffset = Math.sin(a * 4 + cx) * (rx * 0.25) + Math.cos(a * 6) * (ry * 0.15);
          const x = cx + Math.cos(a) * (rx + rOffset);
          const y = cy + Math.sin(a) * (ry + rOffset);
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      };

      // Continental Landmasses
      // Eurasia & Africa
      drawContinent(1100, 360, 280, 150, '#1e3a29');
      drawContinent(1320, 390, 260, 140, '#264a32');
      drawContinent(1060, 600, 190, 200, '#365314');
      // Americas
      drawContinent(460, 370, 220, 170, '#1e3a29');
      drawContinent(580, 680, 180, 230, '#166534');
      // Indian Subcontinent
      drawContinent(1380, 480, 90, 90, '#2d5a27');
      // Australia
      drawContinent(1680, 700, 140, 110, '#3f6212');

      // Polar Ice Caps
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(1024, 40, 1024, 70, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(1024, 984, 1024, 70, 0, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric cloud bands (semi-transparent wisps)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      for (let i = 0; i < 28; i++) {
        const y = 100 + i * 30;
        const x = (i * 137) % 2048;
        ctx.beginPath();
        ctx.ellipse(x, y, 240 + (i % 5) * 40, 22 + (i % 3) * 8, 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse((x + 1024) % 2048, y + 10, 200, 18, -0.05, 0, Math.PI * 2);
        ctx.fill();
      }

      return new THREE.CanvasTexture(canvas);
    };

    // Earth Geometry: Moderately sized (Radius = 3.9) so it is clearly visible and centered
    const earthRadius = 3.9;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.65,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // Atmospheric Glow Layer
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.025, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosMesh);

    // Subtle Outer Limb Haze
    const hazeGeo = new THREE.SphereGeometry(earthRadius * 1.06, 48, 48);
    const hazeMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const hazeMesh = new THREE.Mesh(hazeGeo, hazeMat);
    scene.add(hazeMesh);

    // -------------------------------------------------------------------------
    // 5. 3D Orbital Trajectory (Requirement: Clearly visible 3D orbit path)
    // -------------------------------------------------------------------------
    // LEO Orbit radius = 6.2 (giving realistic space above Earth radius 3.9)
    const orbitRadius = 6.2;
    const orbitSegments = 128;
    const orbitPoints = [];

    // Polar Sun-Synchronous Inclination: 97.4°
    const inclination = THREE.MathUtils.degToRad(97.4);
    const ascendingNode = THREE.MathUtils.degToRad(28);

    for (let i = 0; i <= orbitSegments; i++) {
      const theta = (i / orbitSegments) * Math.PI * 2;
      // Parametric inclined circular orbit
      const x0 = orbitRadius * Math.cos(theta);
      const y0 = 0;
      const z0 = orbitRadius * Math.sin(theta);

      // Rotate by inclination around X and ascending node around Y
      const v = new THREE.Vector3(x0, y0, z0);
      v.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination);
      v.applyAxisAngle(new THREE.Vector3(0, 1, 0), ascendingNode);
      orbitPoints.push(v);
    }

    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.75,
      linewidth: 2,
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    scene.add(orbitLine);

    // -------------------------------------------------------------------------
    // 6. DMRS-01 CubeSat 3D Model (Requirement: Slightly larger, clearly see body & 2 solar wings)
    // -------------------------------------------------------------------------
    const satelliteGroup = new THREE.Group();
    satelliteMeshRef.current = satelliteGroup;

    // Solar Cell Canvas Texture
    const createSolarCellTexture = () => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 128;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#082f49';
      ctx.fillRect(0, 0, 256, 128);

      // Cells
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      for (let r = 0; r < 3; r++) {
        for (let col = 0; col < 6; col++) {
          ctx.fillStyle = '#0369a1';
          ctx.fillRect(col * 42 + 2, r * 42 + 2, 38, 38);
          ctx.strokeRect(col * 42 + 2, r * 42 + 2, 38, 38);
        }
      }
      // Conductors
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 64);
      ctx.lineTo(256, 64);
      ctx.stroke();
      return new THREE.CanvasTexture(c);
    };

    // Body Texture with Callsign
    const createBodyTexture = () => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(8, 8, 240, 240);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DMRS-01', 128, 90);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('CUBESAT', 128, 125);

      // Gold MLI foil block
      ctx.fillStyle = '#b45309';
      ctx.fillRect(40, 150, 176, 70);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 150, 176, 70);

      return new THREE.CanvasTexture(c);
    };

    // A. Main CubeSat Body (Slightly larger: 0.65 x 0.85 x 0.65)
    const satBodyGeo = new THREE.BoxGeometry(0.65, 0.85, 0.65);
    const satBodyMats = [
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 }),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 }),
      new THREE.MeshStandardMaterial({ map: createBodyTexture(), metalness: 0.6, roughness: 0.35 }),
      new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 }),
    ];
    const satBody = new THREE.Mesh(satBodyGeo, satBodyMats);
    satelliteGroup.add(satBody);

    // Chassis corner rails (Cyan aerospace rails)
    const railMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.95, roughness: 0.15 });
    const railGeo = new THREE.BoxGeometry(0.04, 0.89, 0.04);
    const rPos = [
      [0.325, 0, 0.325],
      [-0.325, 0, 0.325],
      [0.325, 0, -0.325],
      [-0.325, 0, -0.325],
    ];
    rPos.forEach(([x, y, z]) => {
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(x, y, z);
      satelliteGroup.add(rail);
    });

    // B. Two Large Rectangular Solar Panels (Left & Right Wings)
    const solarTex = createSolarCellTexture();
    const wingGeo = new THREE.BoxGeometry(1.05, 0.65, 0.025);
    const wingMatFront = new THREE.MeshStandardMaterial({ map: solarTex, metalness: 0.7, roughness: 0.3 });
    const wingMatBack = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.9, roughness: 0.3 });
    const wingMats = [wingMatBack, wingMatBack, wingMatBack, wingMatBack, wingMatFront, wingMatBack];

    // Left Solar Panel (-X)
    const leftWing = new THREE.Mesh(wingGeo, wingMats);
    leftWing.position.set(-0.95, 0, 0);
    satelliteGroup.add(leftWing);

    // Right Solar Panel (+X)
    const rightWing = new THREE.Mesh(wingGeo, wingMats);
    rightWing.position.set(0.95, 0, 0);
    satelliteGroup.add(rightWing);

    // Hinges
    const hingeGeo = new THREE.BoxGeometry(0.18, 0.05, 0.05);
    const hingeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 });
    const leftHinge = new THREE.Mesh(hingeGeo, hingeMat);
    leftHinge.position.set(-0.41, 0, 0);
    satelliteGroup.add(leftHinge);

    const rightHinge = new THREE.Mesh(hingeGeo, hingeMat);
    rightHinge.position.set(0.41, 0, 0);
    satelliteGroup.add(rightHinge);

    // C. Whip Antenna on top (+Y)
    const antennaGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.5, 12);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1 });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.set(0.15, 0.65, 0.15);
    antenna.rotation.z = -0.15;
    satelliteGroup.add(antenna);

    // D. Optical Earth Observation Sensor Lens (Nadir pointing)
    const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 24);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, metalness: 0.4, roughness: 0.1 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0, -0.44, 0);
    satelliteGroup.add(lens);

    // Subtle Satellite Position Beacon Light
    const satBeacon = new THREE.PointLight(0x00e5ff, 1.2, 4);
    satBeacon.position.set(0, 0.6, 0);
    satelliteGroup.add(satBeacon);

    scene.add(satelliteGroup);

    // -------------------------------------------------------------------------
    // 7. Background Distant Starfield
    // -------------------------------------------------------------------------
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 600;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      const r = 80 + Math.random() * 80;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const sinPhi = Math.sin(phi);
      starPositions[i] = r * sinPhi * Math.cos(theta);
      starPositions[i + 1] = r * sinPhi * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.8, transparent: true, opacity: 0.75 });
    const starfield = new THREE.Points(starsGeo, starsMat);
    scene.add(starfield);

    // Initial Camera Position Setup
    const updateCameraPos = () => {
      const { radius, theta, phi } = cameraSpherical.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    };
    updateCameraPos();

    // -------------------------------------------------------------------------
    // 8. Animation & Orbital Physics Loop
    // -------------------------------------------------------------------------
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      // Earth Axial Rotation (Continuous smooth spin)
      if (earthMeshRef.current) {
        earthMeshRef.current.rotation.y += 0.001;
      }

      // Continuous Smooth Satellite Travel along Orbital Path
      if (isOrbitingRef.current && satelliteMeshRef.current) {
        orbitAngleRef.current += 0.0055 * orbitSpeedRef.current;
        const a = orbitAngleRef.current;

        // Position on inclined 3D orbit
        const x0 = orbitRadius * Math.cos(a);
        const y0 = 0;
        const z0 = orbitRadius * Math.sin(a);

        const pos = new THREE.Vector3(x0, y0, z0);
        pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination);
        pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), ascendingNode);

        satelliteMeshRef.current.position.copy(pos);

        // Orient satellite along trajectory (tangent heading)
        const nextX0 = orbitRadius * Math.cos(a + 0.02);
        const nextZ0 = orbitRadius * Math.sin(a + 0.02);
        const nextPos = new THREE.Vector3(nextX0, 0, nextZ0);
        nextPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination);
        nextPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), ascendingNode);

        satelliteMeshRef.current.lookAt(nextPos);

        // If follow mode enabled, camera gently tracks satellite
        if (followSatelliteRef.current) {
          camera.lookAt(pos);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
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

  // ---------------------------------------------------------------------------
  // Pointer & Drag Orbit Interaction
  // ---------------------------------------------------------------------------
  const handlePointerDown = (e) => {
    isDragging.current = true;
    previousMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || !cameraRef.current) return;
    const deltaX = e.clientX - previousMouse.current.x;
    const deltaY = e.clientY - previousMouse.current.y;
    previousMouse.current = { x: e.clientX, y: e.clientY };

    cameraSpherical.current.theta -= deltaX * 0.007;
    cameraSpherical.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraSpherical.current.phi + deltaY * 0.007));

    const { radius, theta, phi } = cameraSpherical.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 0, 0);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const zoomDelta = e.deltaY * 0.015;
    cameraSpherical.current.radius = Math.max(9, Math.min(32, cameraSpherical.current.radius + zoomDelta));
    const { radius, theta, phi } = cameraSpherical.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 0, 0);
  };

  // Reset View to optimal default isometric angle
  const handleResetView = () => {
    cameraSpherical.current = { radius: 19, theta: 0.35, phi: 1.15 };
    setFollowSatellite(false);
    if (cameraRef.current) {
      const { radius, theta, phi } = cameraSpherical.current;
      cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
      cameraRef.current.position.y = radius * Math.cos(phi);
      cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  return (
    <div className="orbit-page">
      {/* Deep Space Background Atmosphere */}
      <div className="orbit-space-glow"></div>

      <div className="orbit-page-container">
        {/* Aerospace Mission Header */}
        <header className="orbit-header">
          <div className="orbit-header-left">
            <div className="callsign-chip">
              <span className="chip-code">DMRS-01</span>
              <span className="chip-label">CALLSIGN</span>
            </div>
            <div className="orbit-title-wrap">
              <h1 className="orbit-main-title">Orbital Trajectory</h1>
              <p className="orbit-subtitle">Low Earth Orbit (LEO) Flight Path & Earth Observation</p>
            </div>
          </div>

          <div className="orbit-header-right">
            <div className="orbit-sim-badge">
              <span className="sim-dot"></span>
              <span>SIMULATED ORBIT</span>
            </div>
            <div className="status-indicator-pill">
              <span className="status-dot-green"></span>
              <span className="status-txt">LEO TRAJECTORY: NOMINAL</span>
            </div>
            <div className="orbit-utc-box">
              <span className="utc-lbl">UTC TIME</span>
              <span className="utc-val">{utcTime}</span>
            </div>
          </div>
        </header>

        {/* Main 3D Orbit Viewport & HUD Layout */}
        <div className="orbit-workspace-grid">
          {/* Left Column: 3D Interactive WebGL Orbit Stage */}
          <div className="orbit-canvas-panel">
            <div
              className="orbit-canvas-container"
              ref={mountRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onWheel={handleWheel}
            >
              {/* HUD Corner Accents */}
              <div className="canvas-hud hud-tl"></div>
              <div className="canvas-hud hud-tr"></div>
              <div className="canvas-hud hud-bl"></div>
              <div className="canvas-hud hud-br"></div>

              {/* HUD Overlay Indicators */}
              <div className="hud-overlay-top">
                <div className="hud-badge">
                  <span className="hud-k">TARGET OBJECT</span>
                  <span className="hud-v text-cyan">DMRS-01 CubeSat</span>
                </div>
                <div className="hud-badge">
                  <span className="hud-k">PRIMARY BODY</span>
                  <span className="hud-v">Earth (Centered)</span>
                </div>
                <div className="hud-badge">
                  <span className="hud-k">INCLINATION</span>
                  <span className="hud-v text-cyan">{orbitStats.inclination}</span>
                </div>
              </div>

              <div className="hud-overlay-bottom">
                <span className="orbit-drag-hint">Drag to rotate view • Scroll to zoom</span>
              </div>
            </div>

            {/* Viewport Orbital Controls */}
            <div className="orbit-viewport-toolbar">
              <div className="toolbar-group">
                <button
                  className={`toolbar-btn ${isOrbiting ? 'active' : ''}`}
                  onClick={() => setIsOrbiting(!isOrbiting)}
                >
                  <span className="btn-icon">{isOrbiting ? '❚❚' : '▶'}</span>
                  <span>{isOrbiting ? 'Pause Orbit' : 'Resume Orbit'}</span>
                </button>
                <button
                  className="toolbar-btn"
                  onClick={() => setOrbitSpeed(s => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
                >
                  <span>Speed: {orbitSpeed}x</span>
                </button>
                <button
                  className={`toolbar-btn ${followSatellite ? 'active' : ''}`}
                  onClick={() => setFollowSatellite(!followSatellite)}
                >
                  <span>{followSatellite ? 'Target: Satellite' : 'Target: Earth'}</span>
                </button>
              </div>

              <div className="toolbar-group">
                <button className="toolbar-btn reset-btn" onClick={handleResetView}>
                  <span>Reset View</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Orbital Parameters & Telemetry Cards */}
          <div className="orbit-sidebar-panel">
            {/* 1. Orbit Parameters Card */}
            <div className="orbit-info-card">
              <div className="card-header">
                <span className="card-tag">ORBITAL PARAMETERS</span>
                <span className="badge-active">LEO SUN-SYNC</span>
              </div>

              <div className="orbit-params-grid">
                <div className="param-item">
                  <span className="param-k">Altitude (Mean)</span>
                  <strong className="param-v">{orbitStats.altitude} <span className="unit">km</span></strong>
                </div>
                <div className="param-item">
                  <span className="param-k">Orbital Velocity</span>
                  <strong className="param-v">{orbitStats.velocity} <span className="unit">km/s</span></strong>
                </div>
                <div className="param-item">
                  <span className="param-k">Orbital Period</span>
                  <strong className="param-v">{orbitStats.period}</strong>
                </div>
                <div className="param-item">
                  <span className="param-k">Inclination</span>
                  <strong className="param-v text-cyan">{orbitStats.inclination}</strong>
                </div>
                <div className="param-item">
                  <span className="param-k">Sub-Satellite Lat</span>
                  <strong className="param-v">{orbitStats.lat}</strong>
                </div>
                <div className="param-item">
                  <span className="param-k">Sub-Satellite Lon</span>
                  <strong className="param-v">{orbitStats.lon}</strong>
                </div>
              </div>
            </div>

            {/* 2. Onboard Telemetry Status Cards */}
            <div className="orbit-info-card">
              <div className="card-header">
                <span className="card-tag">SATELLITE HEALTH & POWER</span>
                <span className="badge-green">ONLINE</span>
              </div>

              <div className="telemetry-compact-grid">
                <div className="telemetry-mini-box">
                  <div className="mini-lbl">Temperature</div>
                  <div className="mini-val">{telemetry.temperature.value} °C</div>
                  <div className="mini-status text-green">BMP180 Nominal</div>
                </div>

                <div className="telemetry-mini-box yellow-box">
                  <div className="mini-lbl text-yellow">Solar Voltage</div>
                  <div className="mini-val text-yellow">{telemetry.solarVoltage.value} V</div>
                  <div className="mini-status text-yellow">Dual Wings Active</div>
                </div>

                <div className="telemetry-mini-box">
                  <div className="mini-lbl">Battery SoC</div>
                  <div className="mini-val text-green">{telemetry.battery.value} %</div>
                  <div className="mini-status text-green">Optimal Rail</div>
                </div>

                <div className="telemetry-mini-box">
                  <div className="mini-lbl">Attitude (MPU6050)</div>
                  <div className="mini-val">R: {telemetry.gyroscope.roll}°</div>
                  <div className="mini-status">P: {telemetry.gyroscope.pitch}° | Y: {telemetry.gyroscope.yaw}°</div>
                </div>
              </div>
            </div>

            {/* 3. Spacecraft Specs Summary */}
            <div className="orbit-info-card spacecraft-spec-card">
              <div className="card-header">
                <span className="card-tag">SPACECRAFT CONFIGURATION</span>
              </div>

              <ul className="spec-list">
                <li>
                  <span className="spec-dot"></span>
                  <span className="spec-title">Chassis Class:</span>
                  <span className="spec-detail">3U CubeSat (~30 × 10 × 10 cm)</span>
                </li>
                <li>
                  <span className="spec-dot"></span>
                  <span className="spec-title">Photovoltaics:</span>
                  <span className="spec-detail text-yellow">2 Deployable Solar Wings</span>
                </li>
                <li>
                  <span className="spec-dot"></span>
                  <span className="spec-title">Main Controller:</span>
                  <span className="spec-detail">ESP32 Dual-Core CPU</span>
                </li>
                <li>
                  <span className="spec-dot"></span>
                  <span className="spec-title">Attitude / Gyro:</span>
                  <span className="spec-detail">MPU6050 6-DOF IMU</span>
                </li>
                <li>
                  <span className="spec-dot"></span>
                  <span className="spec-title">Sensors:</span>
                  <span className="spec-detail">BMP180, Humidity, LDR Sun Track</span>
                </li>
              </ul>

              <div className="spec-actions">
                <button className="nav-btn-link" onClick={() => onNavigate && onNavigate('cubesat')}>
                  3D CubeSat Inspection →
                </button>
                <button className="nav-btn-link" onClick={() => onNavigate && onNavigate('telemetry')}>
                  Live Telemetry Stream →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orbit;
