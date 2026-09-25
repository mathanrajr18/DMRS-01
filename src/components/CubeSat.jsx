import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import './CubeSat.css';
import { INITIAL_TELEMETRY, generateInitialChartData } from '../services/telemetryService';

function CubeSat({ onNavigate }) {
  // Central Telemetry State
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [chartData, setChartData] = useState(() => generateInitialChartData(12));

  // Gyroscope Attitude State (MPU6050: X=Roll, Y=Pitch, Z=Yaw)
  const [gyro, setGyro] = useState({
    roll: 12.5,   // X
    pitch: -8.3,  // Y
    yaw: 45.6,    // Z
  });

  // Viewport Control States
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoom, setZoom] = useState(1);

  // References for Three.js Canvas and Scene
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cubeSatGroupRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameId = useRef(null);

  // Base Orientation Refs (Euler angles in radians)
  const baseAngleX = useRef(THREE.MathUtils.degToRad(12.5));
  const baseAngleY = useRef(THREE.MathUtils.degToRad(-8.3));
  const baseAngleZ = useRef(THREE.MathUtils.degToRad(45.6));
  const autoRotateRef = useRef(false);

  // Drag interaction refs
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // ---------------------------------------------------------------------------
  // 1. Initialize Realistic 3D CubeSat in Three.js
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);
    cameraRef.current = camera;

    // 2. WebGL Renderer with Anti-Aliasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting Setup (Orbital Sun + Spacecraft Rim Light)
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    sunLight.position.set(6, 8, 7);
    scene.add(sunLight);

    const earthFillLight = new THREE.DirectionalLight(0x0284c7, 0.9);
    earthFillLight.position.set(-6, -4, -4);
    scene.add(earthFillLight);

    const cyanRimLight = new THREE.PointLight(0x00e5ff, 1.5, 20);
    cyanRimLight.position.set(0, 3, -4);
    scene.add(cyanRimLight);

    // 4. Procedural Photovoltaic Solar Cell Grid Texture
    const createSolarTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // Deep space crystalline blue
      ctx.fillStyle = '#082f49';
      ctx.fillRect(0, 0, 512, 256);

      // Solar cell cells & busbars
      const cols = 8;
      const rows = 4;
      const cellW = 512 / cols;
      const cellH = 256 / rows;

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = '#0369a1';
          ctx.fillRect(c * cellW + 2, r * cellH + 2, cellW - 4, cellH - 4);
          ctx.strokeRect(c * cellW + 2, r * cellH + 2, cellW - 4, cellH - 4);
        }
      }

      // Silver Busbar conductors
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 128);
      ctx.lineTo(512, 128);
      ctx.moveTo(0, 64);
      ctx.lineTo(512, 64);
      ctx.moveTo(0, 192);
      ctx.lineTo(512, 192);
      ctx.stroke();

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    };

    // 5. Callsign Front Face Texture (DMRS-01)
    const createCallsignTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Anodized dark titanium base
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 512, 512);

      // Chassis structural corner details
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, 480, 480);

      // Text: DMRS-01
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 64px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DMRS-01', 256, 160);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 24px monospace';
      ctx.fillText('3U CUBESAT // PROTOTYPE', 256, 210);

      // Gold MLI insulation square in lower half
      ctx.fillStyle = '#b45309';
      ctx.fillRect(96, 280, 320, 160);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(96, 280, 320, 160);

      return new THREE.CanvasTexture(canvas);
    };

    // -------------------------------------------------------------------------
    // Assemble 3D DMRS-01 CubeSat Model Hierarchy
    // -------------------------------------------------------------------------
    const satelliteGroup = new THREE.Group();
    cubeSatGroupRef.current = satelliteGroup;

    // A. Main CubeSat Chassis Body
    const bodyGeometry = new THREE.BoxGeometry(1.6, 2.0, 1.6);
    
    // Materials for 6 faces: Right, Left, Top, Bottom, Front, Back
    const bodyMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 }), // +X
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 }), // -X
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.25 }), // +Y Top
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.25 }), // -Y Bottom
      new THREE.MeshStandardMaterial({ map: createCallsignTexture(), metalness: 0.6, roughness: 0.4 }), // +Z Front
      new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.35 }), // -Z Back (Gold MLI)
    ];

    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterials);
    satelliteGroup.add(bodyMesh);

    // B. Aerospace Chassis Corner Structural Rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.2 });
    const railGeo = new THREE.BoxGeometry(0.06, 2.08, 0.06);

    const railPositions = [
      [0.8, 0, 0.8],
      [-0.8, 0, 0.8],
      [0.8, 0, -0.8],
      [-0.8, 0, -0.8],
    ];

    railPositions.forEach(([x, y, z]) => {
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(x, y, z);
      satelliteGroup.add(rail);
    });

    // C. Optical Aperture / Sensor Lens (Front +Z)
    const lensRingGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.12, 32);
    const lensRingMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
    const lensRing = new THREE.Mesh(lensRingGeo, lensRingMat);
    lensRing.rotation.x = Math.PI / 2;
    lensRing.position.set(0, -0.15, 0.82);
    satelliteGroup.add(lensRing);

    const lensGlassGeo = new THREE.CircleGeometry(0.18, 32);
    const lensGlassMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, metalness: 0.2, roughness: 0.05 });
    const lensGlass = new THREE.Mesh(lensGlassGeo, lensGlassMat);
    lensGlass.position.set(0, -0.15, 0.89);
    satelliteGroup.add(lensGlass);

    // D. Two Large Flat Rectangular Solar Panels (Left & Right)
    const solarTex = createSolarTexture();
    const panelGeo = new THREE.BoxGeometry(2.2, 1.4, 0.04);
    const panelFrontMat = new THREE.MeshStandardMaterial({ map: solarTex, metalness: 0.7, roughness: 0.3 });
    const panelBackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.3 });

    const solarMats = [
      panelBackMat, panelBackMat, panelBackMat, panelBackMat,
      panelFrontMat, // Front
      panelBackMat,  // Back
    ];

    // Left Solar Panel (-X side)
    const leftPanel = new THREE.Mesh(panelGeo, solarMats);
    leftPanel.position.set(-2.0, 0, 0);
    satelliteGroup.add(leftPanel);

    // Left Hinge / Bracket
    const leftHingeGeo = new THREE.BoxGeometry(0.3, 0.08, 0.08);
    const hingeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 });
    const leftHinge = new THREE.Mesh(leftHingeGeo, hingeMat);
    leftHinge.position.set(-0.95, 0, 0);
    satelliteGroup.add(leftHinge);

    // Right Solar Panel (+X side)
    const rightPanel = new THREE.Mesh(panelGeo, solarMats);
    rightPanel.position.set(2.0, 0, 0);
    satelliteGroup.add(rightPanel);

    // Right Hinge / Bracket
    const rightHinge = new THREE.Mesh(leftHingeGeo, hingeMat);
    rightHinge.position.set(0.95, 0, 0);
    satelliteGroup.add(rightHinge);

    // E. Small Deployable Whip Antenna on Top (+Y)
    const antennaBaseGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.1, 16);
    const antennaBase = new THREE.Mesh(antennaBaseGeo, hingeMat);
    antennaBase.position.set(0.35, 1.05, 0.3);
    satelliteGroup.add(antennaBase);

    const antennaRodGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.1, 16);
    const antennaRodMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.95, roughness: 0.1 });
    const antennaRod = new THREE.Mesh(antennaRodGeo, antennaRodMat);
    antennaRod.position.set(0.35, 1.6, 0.3);
    antennaRod.rotation.z = -0.1; // slight realistic cant
    satelliteGroup.add(antennaRod);

    // Add satellite to main scene
    scene.add(satelliteGroup);

    // Apply initial Euler orientation
    satelliteGroup.rotation.x = baseAngleX.current;
    satelliteGroup.rotation.y = baseAngleY.current;
    satelliteGroup.rotation.z = baseAngleZ.current;

    // -------------------------------------------------------------------------
    // Render Loop (Slow, smooth automatic LEFT ↔ RIGHT rotation)
    // -------------------------------------------------------------------------
    const animate = (time) => {
      animFrameId.current = requestAnimationFrame(animate);

      const timeSec = (time || performance.now()) * 0.001;

      if (cubeSatGroupRef.current) {
        if (autoRotateRef.current && !isDragging.current) {
          // If autoRotate button is explicitly enabled, continuous 360° spin
          baseAngleY.current += 0.008;
          cubeSatGroupRef.current.rotation.y = baseAngleY.current;
        } else if (!isDragging.current) {
          // Slow, subtle, professional automatic LEFT ↔ RIGHT oscillation
          // Uses pure sine harmonic motion for natural ease-in-out (no jerking at limits)
          // Speed: 0.65 rad/s (~9.6s period for full left-right-left sweep)
          // Amplitude: 18° (~0.314 radians)
          const oscillation = Math.sin(timeSec * 0.65) * 0.314;
          cubeSatGroupRef.current.rotation.y = baseAngleY.current + oscillation;
        }
      }

      renderer.render(scene, camera);
    };
    animFrameId.current = requestAnimationFrame(animate);

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

  // Handle Zoom State change
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = 7.8 / zoom;
    }
  }, [zoom]);

  // ---------------------------------------------------------------------------
  // 2. Pointer & Mouse Drag Interaction (Orbital rotation)
  // ---------------------------------------------------------------------------
  const handlePointerDown = (e) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || !cubeSatGroupRef.current) return;

    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };

    // Rotate CubeSat based on drag delta
    baseAngleY.current += deltaX * 0.008;
    baseAngleX.current += deltaY * 0.008;

    cubeSatGroupRef.current.rotation.y = baseAngleY.current;
    cubeSatGroupRef.current.rotation.x = baseAngleX.current;
  };

  const handlePointerUp = () => {
    if (isDragging.current && cubeSatGroupRef.current) {
      isDragging.current = false;
      // Seamlessly sync baseAngleY with current time oscillation phase so resuming has zero jump
      const timeSec = performance.now() * 0.001;
      const currentOscillation = Math.sin(timeSec * 0.65) * 0.314;
      baseAngleY.current = cubeSatGroupRef.current.rotation.y - currentOscillation;
    } else {
      isDragging.current = false;
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.001;
    setZoom((z) => Math.max(0.6, Math.min(2.0, z + zoomDelta)));
  };

  // Reset View to Default Isometric Angles
  const handleResetView = () => {
    setGyro({ roll: 12.5, pitch: -8.3, yaw: 45.6 });
    setZoom(1);
    setAutoRotate(false);
    autoRotateRef.current = false;

    baseAngleX.current = THREE.MathUtils.degToRad(12.5);
    baseAngleY.current = THREE.MathUtils.degToRad(-8.3);
    baseAngleZ.current = THREE.MathUtils.degToRad(45.6);

    if (cubeSatGroupRef.current) {
      cubeSatGroupRef.current.rotation.x = baseAngleX.current;
      cubeSatGroupRef.current.rotation.y = baseAngleY.current;
      cubeSatGroupRef.current.rotation.z = baseAngleZ.current;
    }
  };

  // Gyro Slider Updates (Testing simulated MPU6050 angle changes)
  const handleGyroChange = (axis, value) => {
    const val = parseFloat(value);
    setAutoRotate(false);
    autoRotateRef.current = false;
    setGyro((prev) => ({
      ...prev,
      [axis]: val,
    }));

    if (axis === 'roll') {
      baseAngleX.current = THREE.MathUtils.degToRad(val);
      if (cubeSatGroupRef.current) cubeSatGroupRef.current.rotation.x = baseAngleX.current;
    }
    if (axis === 'pitch') {
      const timeSec = performance.now() * 0.001;
      const currentOscillation = Math.sin(timeSec * 0.65) * 0.314;
      baseAngleY.current = THREE.MathUtils.degToRad(val) - currentOscillation;
    }
    if (axis === 'yaw') {
      baseAngleZ.current = THREE.MathUtils.degToRad(val);
      if (cubeSatGroupRef.current) cubeSatGroupRef.current.rotation.z = baseAngleZ.current;
    }
  };

  return (
    <div className="cubesat-page">
      <div className="cubesat-container">
        {/* Header Bar */}
        <div className="cubesat-header-bar">
          <div className="header-badge">
            <span className="badge-dot"></span>
            <span>DMRS-01 • 3D CUBESAT &amp; GYROSCOPE ATTITUDE</span>
          </div>
          {onNavigate && (
            <button className="back-btn" onClick={() => onNavigate('home')}>
              ← Back to Home
            </button>
          )}
        </div>

        {/* Title Block */}
        <div className="cubesat-title-block">
          <h1 className="page-title">Interactive 3D CubeSat</h1>
          <p className="page-subtitle">
            Direct 3D visualization of DMRS-01 driven by simulated MPU6050 attitude dynamics.
          </p>
        </div>

        {/* =========================================================================
            MAIN SECTION: 3D VIEWPORT + GYROSCOPE ATTITUDE PANEL
           ========================================================================= */}
        <div className="main-3d-grid">
          {/* 3D WebGL Canvas Viewport */}
          <div className="webgl-viewport-wrapper">
            <div
              className="three-canvas-container"
              ref={mountRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onWheel={handleWheel}
            >
              {/* Corner HUD reticles */}
              <div className="hud-corner top-left"></div>
              <div className="hud-corner top-right"></div>
              <div className="hud-corner bottom-left"></div>
              <div className="hud-corner bottom-right"></div>

              {/* Viewport Top Tag */}
              <div className="viewport-overlay-tag">
                <span className="tag-pulse"></span>
                <span>REAL-TIME 3D WEBGL // DMRS-01</span>
              </div>

              {/* Drag & Zoom Interaction Hint */}
              <div className="drag-hint">
                <span>Drag to Rotate • Scroll to Zoom</span>
              </div>
            </div>

            {/* Viewport Controls Bar */}
            <div className="viewport-toolbar">
              <div className="toolbar-left">
                <button
                  className={`toolbar-btn ${autoRotate ? 'btn-active' : ''}`}
                  onClick={() => {
                    const nextVal = !autoRotate;
                    setAutoRotate(nextVal);
                    autoRotateRef.current = nextVal;
                  }}
                >
                  Auto Rotate: {autoRotate ? 'ON' : 'OFF'}
                </button>
                <button className="toolbar-btn" onClick={handleResetView}>
                  Reset View
                </button>
              </div>

              <div className="toolbar-right">
                <button className="zoom-btn" onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}>
                  −
                </button>
                <span className="zoom-display">{Math.round(zoom * 100)}%</span>
                <button className="zoom-btn" onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}>
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Dedicated Attitude / Gyroscope Panel */}
          <div className="gyro-attitude-panel">
            <div className="panel-top-badge">
              <span className="mini-beacon dot-green"></span>
              <span>MPU6050 6-DOF IMU • ATTITUDE SINK</span>
            </div>

            <h2 className="gyro-heading">Attitude / Gyroscope</h2>
            <p className="gyro-intro">
              Simulated MPU6050 angular orientation connected directly to the 3D model. Adjust sliders to rotate satellite:
            </p>

            {/* X, Y, Z Angle Readouts & Sliders */}
            <div className="gyro-metrics-list">
              {/* X (Roll) */}
              <div className="gyro-axis-row">
                <div className="axis-title-line">
                  <div className="axis-indicator red-axis">X (Roll)</div>
                  <span className="axis-angle-val text-red">{gyro.roll}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="0.5"
                  value={gyro.roll}
                  onChange={(e) => handleGyroChange('roll', e.target.value)}
                  className="gyro-slider"
                />
              </div>

              {/* Y (Pitch) */}
              <div className="gyro-axis-row">
                <div className="axis-title-line">
                  <div className="axis-indicator green-axis">Y (Pitch)</div>
                  <span className="axis-angle-val text-green">{gyro.pitch}°</span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  step="0.5"
                  value={gyro.pitch}
                  onChange={(e) => handleGyroChange('pitch', e.target.value)}
                  className="gyro-slider"
                />
              </div>

              {/* Z (Yaw) */}
              <div className="gyro-axis-row">
                <div className="axis-title-line">
                  <div className="axis-indicator blue-axis">Z (Yaw)</div>
                  <span className="axis-angle-val text-cyan">{gyro.yaw}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="0.5"
                  value={gyro.yaw}
                  onChange={(e) => handleGyroChange('yaw', e.target.value)}
                  className="gyro-slider"
                />
              </div>
            </div>

            {/* 3D XYZ Axis Graphic Indicator */}
            <div className="gimbal-indicator-box">
              <div className="gimbal-title">3D Coordinate Frame</div>
              <div className="axis-legend-row">
                <div className="legend-chip"><span className="axis-bar red-bg"></span> X-Axis (Roll)</div>
                <div className="legend-chip"><span className="axis-bar green-bg"></span> Y-Axis (Pitch)</div>
                <div className="legend-chip"><span className="axis-bar blue-bg"></span> Z-Axis (Yaw)</div>
              </div>
            </div>

            {/* Hardware Pipeline Ready Note */}
            <div className="pipeline-ready-box">
              <span className="pipe-dot"></span>
              <span>Ready for real ESP32 MPU6050 telemetry ingestion via WebSocket.</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            LIVE TELEMETRY SECTION (COMPACT CARDS BELOW 3D CUBESAT)
           ========================================================================= */}
        <section className="cubesat-telemetry-section">
          <div className="telemetry-section-bar">
            <div className="section-title-wrap">
              <h2 className="telemetry-section-heading">Live Telemetry</h2>
              <span className="telemetry-sub">Sensor bus status</span>
            </div>
            <div className="sim-telemetry-pill">
              <span className="pill-dot"></span>
              <span>SIMULATED TELEMETRY</span>
            </div>
          </div>

          <div className="telemetry-cards-grid">
            {/* Temperature */}
            <div className="telemetry-card">
              <div className="t-card-top">
                <span className="t-label">Temperature</span>
                <span className="t-chip">BMP180</span>
              </div>
              <div className="t-metric text-yellow">{telemetry.temperature.value} °C</div>
              {/* Mini live sparkline indicator */}
              <div className="t-mini-graph">
                <div className="sparkline-bar bar-yellow" style={{ width: `${(telemetry.temperature.value / 40) * 100}%` }}></div>
              </div>
              <span className="t-subtext">Thermal Payload</span>
            </div>

            {/* Atmospheric Pressure */}
            <div className="telemetry-card">
              <div className="t-card-top">
                <span className="t-label">Pressure</span>
                <span className="t-chip">BMP180</span>
              </div>
              <div className="t-metric">{telemetry.pressure.value} hPa</div>
              <div className="t-mini-graph">
                <div className="sparkline-bar bar-cyan" style={{ width: `${(telemetry.pressure.value / 1200) * 100}%` }}></div>
              </div>
              <span className="t-subtext">Atmospheric Baseline</span>
            </div>

            {/* Humidity */}
            <div className="telemetry-card">
              <div className="t-card-top">
                <span className="t-label">Humidity</span>
                <span className="t-chip">Sensor</span>
              </div>
              <div className="t-metric">{telemetry.humidity.value} %</div>
              <div className="t-mini-graph">
                <div className="sparkline-bar bar-cyan" style={{ width: `${telemetry.humidity.value}%` }}></div>
              </div>
              <span className="t-subtext">Relative Air Moisture</span>
            </div>

            {/* Solar Voltage */}
            <div className="telemetry-card">
              <div className="t-card-top">
                <span className="t-label">Solar Voltage</span>
                <span className="t-chip">Photovoltaic</span>
              </div>
              <div className="t-metric text-yellow">{telemetry.solarVoltage.value} V</div>
              <div className="t-mini-graph">
                <div className="sparkline-bar bar-yellow" style={{ width: `${(telemetry.solarVoltage.value / 7) * 100}%` }}></div>
              </div>
              <span className="t-subtext">Power Generation Rail</span>
            </div>

            {/* Sunlight */}
            <div className="telemetry-card">
              <div className="t-card-top">
                <span className="t-label">Sunlight</span>
                <span className="t-chip">LDRs</span>
              </div>
              <div className="t-metric text-yellow">{telemetry.sunlight.value}</div>
              <div className="t-mini-graph">
                <div className="sparkline-bar bar-yellow" style={{ width: '85%' }}></div>
              </div>
              <span className="t-subtext">Incident Radiance</span>
            </div>

            {/* Battery */}
            <div className="telemetry-card">
              <div className="t-card-top">
                <span className="t-label">Battery</span>
                <span className="t-chip">EPS Bus</span>
              </div>
              <div className="t-metric text-green">{telemetry.battery.value} %</div>
              <div className="t-mini-graph">
                <div className="sparkline-bar bar-green" style={{ width: `${telemetry.battery.value}%` }}></div>
              </div>
              <span className="t-subtext">Power Subsystem</span>
            </div>

            {/* Motion */}
            <div className="telemetry-card">
              <div className="t-card-top">
                <span className="t-label">Motion</span>
                <span className="t-chip">MPU6050</span>
              </div>
              <div className="t-metric text-cyan">{telemetry.motion.value}</div>
              <div className="t-mini-graph">
                <div className="sparkline-bar bar-cyan" style={{ width: '92%' }}></div>
              </div>
              <span className="t-subtext">Inertial Stability</span>
            </div>

            {/* System Status */}
            <div className="telemetry-card card-status-ok">
              <div className="t-card-top">
                <span className="t-label">System Status</span>
                <span className="t-chip tag-green">Core</span>
              </div>
              <div className="t-metric text-green">{telemetry.systemStatus}</div>
              <div className="t-mini-graph">
                <div className="sparkline-bar bar-green" style={{ width: '100%' }}></div>
              </div>
              <span className="t-subtext">All Subsystems Nominal</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CubeSat;
