import React, { useState, useEffect } from 'react';
import './MissionControl.css';
import { INITIAL_TELEMETRY, generateInitialChartData } from '../services/telemetryService';
import heroImage from '../assets/dmrs01-hero.jpg';

function MissionControl({ onNavigate }) {
  // Centralized telemetry state from service (easily replaced by WebSocket/fetch)
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [chartData, setChartData] = useState(() => generateInitialChartData(12));
  const [utcTime, setUtcTime] = useState('');

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const iso = now.toISOString(); // e.g. "2026-09-20T11:15:30.123Z"
      const formatted = iso.replace('T', ' ').substring(0, 19) + ' UTC';
      setUtcTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rolling Live Telemetry Graph Updates (Simulated Live Feed)
  useEffect(() => {
    const streamInterval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toISOString().substring(14, 19);

      // Micro fluctuations around baseline
      const tempDelta = (Math.random() * 0.4 - 0.2).toFixed(1);
      const voltDelta = (Math.random() * 0.1 - 0.05).toFixed(2);
      
      const nextTemp = parseFloat((28.4 + parseFloat(tempDelta)).toFixed(1));
      const nextVolt = parseFloat((5.8 + parseFloat(voltDelta)).toFixed(2));

      setChartData((prev) => {
        const next = [...prev.slice(1), { time: timeStr, temperature: nextTemp, solarVoltage: nextVolt }];
        return next;
      });

      // Update current telemetry reading
      setTelemetry((prev) => ({
        ...prev,
        temperature: { ...prev.temperature, value: nextTemp },
        solarVoltage: { ...prev.solarVoltage, value: nextVolt },
      }));
    }, 2500);

    return () => clearInterval(streamInterval);
  }, []);

  // Compute SVG Points for Mini Line Graph
  const minTemp = 27.5;
  const maxTemp = 29.5;
  const minVolt = 5.5;
  const maxVolt = 6.1;
  const chartWidth = 520;
  const chartHeight = 110;

  const tempPoints = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * chartWidth;
    const y = chartHeight - ((d.temperature - minTemp) / (maxTemp - minTemp)) * (chartHeight - 16) - 8;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const voltPoints = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * chartWidth;
    const y = chartHeight - ((d.solarVoltage - minVolt) / (maxVolt - minVolt)) * (chartHeight - 16) - 8;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="mc-dashboard">
      <div className="mc-container">
        {/* =========================================================================
            HEADER BAR
           ========================================================================= */}
        <header className="mc-header">
          <div className="mc-header-left">
            <div className="mc-title-group">
              <span className="mc-callsign">DMRS-01</span>
              <h1 className="mc-title">Mission Control</h1>
            </div>
            <div className="mc-sim-badge">
              <span className="sim-pulse"></span>
              <span>SIMULATED TELEMETRY</span>
            </div>
          </div>

          <div className="mc-header-right">
            <div className="mc-status-pill">
              <span className="status-beacon beacon-green"></span>
              <span className="status-text">System Status: <strong>{telemetry.systemStatus}</strong></span>
            </div>
            <div className="mc-clock">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="clock-icon">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{utcTime || 'SYNCHRONIZING UTC...'}</span>
            </div>
          </div>
        </header>

        {/* =========================================================================
            TELEMETRY METRICS GRID (COMPACT)
           ========================================================================= */}
        <section className="mc-metrics-section">
          <div className="mc-section-top">
            <h2 className="mc-section-heading">Telemetry Subsystems</h2>
            <div className="mc-legend">
              <div className="legend-item"><span className="legend-dot dot-green"></span> Normal</div>
              <div className="legend-item"><span className="legend-dot dot-yellow"></span> Warning</div>
              <div className="legend-item"><span className="legend-dot dot-red"></span> Critical</div>
            </div>
          </div>

          <div className="mc-metrics-grid">
            {/* Temperature */}
            <div className="mc-card">
              <div className="card-top">
                <span className="card-label">Temperature</span>
                <span className="card-chip">{telemetry.temperature.sensor}</span>
              </div>
              <div className="card-value-wrap">
                <span className="card-val">{telemetry.temperature.value}</span>
                <span className="card-unit">{telemetry.temperature.unit}</span>
              </div>
              <div className="card-status">
                <span className="mini-dot dot-green"></span>
                <span className="card-hint">Nominal Thermal Range</span>
              </div>
            </div>

            {/* Atmospheric Pressure */}
            <div className="mc-card">
              <div className="card-top">
                <span className="card-label">Pressure</span>
                <span className="card-chip">{telemetry.pressure.sensor}</span>
              </div>
              <div className="card-value-wrap">
                <span className="card-val">{telemetry.pressure.value}</span>
                <span className="card-unit">{telemetry.pressure.unit}</span>
              </div>
              <div className="card-status">
                <span className="mini-dot dot-green"></span>
                <span className="card-hint">Barometric Baseline</span>
              </div>
            </div>

            {/* Humidity */}
            <div className="mc-card">
              <div className="card-top">
                <span className="card-label">Humidity</span>
                <span className="card-chip">{telemetry.humidity.sensor}</span>
              </div>
              <div className="card-value-wrap">
                <span className="card-val">{telemetry.humidity.value}</span>
                <span className="card-unit">{telemetry.humidity.unit}</span>
              </div>
              <div className="card-status">
                <span className="mini-dot dot-green"></span>
                <span className="card-hint">Atmospheric Moisture</span>
              </div>
            </div>

            {/* Solar Panel Voltage */}
            <div className="mc-card">
              <div className="card-top">
                <span className="card-label">Solar Voltage</span>
                <span className="card-chip">{telemetry.solarVoltage.sensor}</span>
              </div>
              <div className="card-value-wrap">
                <span className="card-val text-yellow">{telemetry.solarVoltage.value}</span>
                <span className="card-unit">{telemetry.solarVoltage.unit}</span>
              </div>
              <div className="card-status">
                <span className="mini-dot dot-green"></span>
                <span className="card-hint">Photovoltaic Bus</span>
              </div>
            </div>

            {/* Sunlight Level */}
            <div className="mc-card">
              <div className="card-top">
                <span className="card-label">Sunlight Level</span>
                <span className="card-chip">{telemetry.sunlight.sensor}</span>
              </div>
              <div className="card-value-wrap">
                <span className="card-val text-yellow">{telemetry.sunlight.value}</span>
              </div>
              <div className="card-status">
                <span className="mini-dot dot-yellow"></span>
                <span className="card-hint">Incident Irradiance</span>
              </div>
            </div>

            {/* Gyroscope / Motion */}
            <div className="mc-card">
              <div className="card-top">
                <span className="card-label">Motion / Gyro</span>
                <span className="card-chip">{telemetry.motion.sensor}</span>
              </div>
              <div className="card-value-wrap">
                <span className="card-val text-cyan">{telemetry.motion.value}</span>
              </div>
              <div className="card-status">
                <span className="mini-dot dot-green"></span>
                <span className="card-hint">Attitude Stabilized</span>
              </div>
            </div>

            {/* Battery */}
            <div className="mc-card">
              <div className="card-top">
                <span className="card-label">Battery</span>
                <span className="card-chip">{telemetry.battery.sensor}</span>
              </div>
              <div className="card-value-wrap">
                <span className="card-val">{telemetry.battery.value}</span>
                <span className="card-unit">{telemetry.battery.unit}</span>
              </div>
              <div className="card-status">
                <span className="mini-dot dot-green"></span>
                <span className="card-hint">EPS Power Healthy</span>
              </div>
            </div>

            {/* System Status */}
            <div className="mc-card card-highlight">
              <div className="card-top">
                <span className="card-label">System Status</span>
                <span className="card-chip">Main ESP32</span>
              </div>
              <div className="card-value-wrap">
                <span className="card-val text-green">{telemetry.systemStatus}</span>
              </div>
              <div className="card-status">
                <span className="mini-dot dot-green"></span>
                <span className="card-hint">All Subsystems Nominal</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            MIDDLE ROW: LIVE GRAPH + SOLAR TRACKING + CUBESAT PREVIEW
           ========================================================================= */}
        <div className="mc-dashboard-row">
          {/* Live Telemetry Graph */}
          <div className="mc-panel graph-panel">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <span className="panel-tag">LIVE TELEMETRY STREAM</span>
                <h3 className="panel-title">Temperature &amp; Solar Voltage</h3>
              </div>
              <div className="graph-legend">
                <div className="legend-chip">
                  <span className="legend-line line-cyan"></span>
                  <span>Temp ({telemetry.temperature.value}°C)</span>
                </div>
                <div className="legend-chip">
                  <span className="legend-line line-yellow"></span>
                  <span>Solar ({telemetry.solarVoltage.value}V)</span>
                </div>
              </div>
            </div>

            <div className="svg-chart-container">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="telemetry-svg">
                {/* Subtle Grid Lines */}
                <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="rgba(56, 189, 248, 0.08)" strokeDasharray="3 3" />
                <line x1="0" y1="55" x2={chartWidth} y2="55" stroke="rgba(56, 189, 248, 0.08)" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2={chartWidth} y2="90" stroke="rgba(56, 189, 248, 0.08)" strokeDasharray="3 3" />

                {/* Voltage Line (Yellow/Gold) */}
                <polyline fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={voltPoints} />

                {/* Temperature Line (Cyan) */}
                <polyline fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={tempPoints} />
              </svg>

              {/* Time Labels */}
              <div className="chart-time-labels">
                <span>{chartData[0]?.time}</span>
                <span>{chartData[Math.floor(chartData.length / 2)]?.time}</span>
                <span>{chartData[chartData.length - 1]?.time} (Current)</span>
              </div>
            </div>
          </div>

          {/* Compact Solar Tracking Status Section */}
          <div className="mc-panel solar-panel-block">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <span className="panel-tag">ACTUATION</span>
                <h3 className="panel-title">Solar Tracking</h3>
              </div>
              <span className="tracking-status-badge">
                <span className="beacon-green-sm"></span>
                <span>{telemetry.solarTracking.status}</span>
              </span>
            </div>

            <div className="solar-tracking-grid">
              <div className="tracking-metric-box">
                <span className="track-label">LDR Left</span>
                <span className="track-val text-yellow">{telemetry.solarTracking.ldrLeft}</span>
              </div>
              <div className="tracking-metric-box">
                <span className="track-label">LDR Right</span>
                <span className="track-val text-yellow">{telemetry.solarTracking.ldrRight}</span>
              </div>
              <div className="tracking-metric-box">
                <span className="track-label">Servo Angle</span>
                <span className="track-val text-cyan">{telemetry.solarTracking.servoAngle}</span>
              </div>
              <div className="tracking-metric-box">
                <span className="track-label">Tracking Mode</span>
                <span className="track-val">{telemetry.solarTracking.mode}</span>
              </div>
            </div>

            <div className="solar-tracking-visual-summary">
              <div className="track-flow-pill">LDR Array → ESP32 ADC → Servo Motor → Solar Panel</div>
            </div>
          </div>

          {/* CubeSat Visual Preview Section */}
          <div className="mc-panel cubesat-preview-panel">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <span className="panel-tag">PAYLOAD PREVIEW</span>
                <h3 className="panel-title">DMRS-01 CubeSat</h3>
              </div>
            </div>

            <div className="preview-image-box">
              <img src={heroImage} alt="DMRS-01 CubeSat in Low Earth Orbit" className="preview-thumb" />
              <div className="preview-hud-tag">FLIGHT REVISION 1.0</div>
            </div>

            <div className="preview-meta">
              <div className="meta-row">
                <span className="meta-k">CHASSIS</span>
                <span className="meta-v">3U Modular</span>
              </div>
              <div className="meta-row">
                <span className="meta-k">SOLAR WINGS</span>
                <span className="meta-v text-yellow">Dual Deployed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MissionControl;
