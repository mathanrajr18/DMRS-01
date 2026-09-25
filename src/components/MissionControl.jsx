import React, { useState, useEffect } from 'react';
import './MissionControl.css';
import { INITIAL_TELEMETRY, generateInitialChartData, transformSupabaseRow, transformSupabaseHistory } from '../services/telemetryService';
import { fetchLatestTelemetryRow, fetchTelemetryHistoryRows, isSupabaseConfigured } from '../services/supabaseClient';
import heroImage from '../assets/dmrs01-hero.jpg';

function MissionControl({ onNavigate }) {
  // Centralized telemetry state
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [chartData, setChartData] = useState(() => generateInitialChartData(12));
  const [utcTime, setUtcTime] = useState('');
  const [isLiveTelemetry, setIsLiveTelemetry] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const iso = now.toISOString();
      const formatted = iso.replace('T', ' ').substring(0, 19) + ' UTC';
      setUtcTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch telemetry from Supabase public.telemetry (Auto-refresh every 5 seconds)
  useEffect(() => {
    let isMounted = true;

    const syncTelemetry = async () => {
      try {
        const { data: latestRow, error: latestErr } = await fetchLatestTelemetryRow();

        if (!isMounted) return;

        if (latestRow && !latestErr) {
          const transformed = transformSupabaseRow(latestRow);
          setTelemetry(transformed);
          setIsLiveTelemetry(true);
          setLastSyncTime(new Date().toLocaleTimeString());

          // Fetch historical telemetry rows for graphs if enough rows exist
          const { data: histRows, error: histErr } = await fetchTelemetryHistoryRows(14);
          if (isMounted && histRows && histRows.length >= 2 && !histErr) {
            const transformedHist = transformSupabaseHistory(histRows);
            setChartData(transformedHist.map(d => ({
              time: d.time,
              temperature: d.temperature,
              solarVoltage: d.solarVoltage,
              battery: d.battery,
            })));
          }
        } else {
          // No rows in Supabase or connection pending
          setIsLiveTelemetry(false);
        }
      } catch (err) {
        console.warn('Mission Control Supabase sync notice:', err);
        if (isMounted) setIsLiveTelemetry(false);
      }
    };

    // Initial fetch
    syncTelemetry();

    // 5-second automatic refresh ticker (Requirement 8)
    const refreshInterval = setInterval(syncTelemetry, 5000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  // Compute SVG Points for Mini Line Graph safely
  const chartWidth = 520;
  const chartHeight = 110;

  const validTempVals = chartData.map(d => Number(d.temperature)).filter(v => !isNaN(v));
  const validVoltVals = chartData.map(d => Number(d.solarVoltage)).filter(v => !isNaN(v));

  const minTemp = validTempVals.length ? Math.min(...validTempVals) - 1 : 25;
  const maxTemp = validTempVals.length ? Math.max(...validTempVals) + 1 : 35;
  const tempRange = maxTemp - minTemp === 0 ? 1 : maxTemp - minTemp;

  const minVolt = validVoltVals.length ? Math.min(...validVoltVals) - 0.5 : 3.0;
  const maxVolt = validVoltVals.length ? Math.max(...validVoltVals) + 0.5 : 7.0;
  const voltRange = maxVolt - minVolt === 0 ? 1 : maxVolt - minVolt;

  const tempPoints = chartData.map((d, i) => {
    const x = chartData.length > 1 ? (i / (chartData.length - 1)) * chartWidth : chartWidth / 2;
    const y = chartHeight - ((Number(d.temperature) - minTemp) / tempRange) * (chartHeight - 16) - 8;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const voltPoints = chartData.map((d, i) => {
    const x = chartData.length > 1 ? (i / (chartData.length - 1)) * chartWidth : chartWidth / 2;
    const y = chartHeight - ((Number(d.solarVoltage) - minVolt) / voltRange) * (chartHeight - 16) - 8;
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
            {/* Live / Waiting Telemetry Status Badge (Requirements 9 & 10) */}
            <div className={`mc-sim-badge ${isLiveTelemetry ? 'live-badge' : 'waiting-badge'}`}>
              <span className={`sim-pulse ${isLiveTelemetry ? 'live-pulse' : 'waiting-pulse'}`}></span>
              <span>{isLiveTelemetry ? 'LIVE TELEMETRY' : 'WAITING FOR ESP32 TELEMETRY'}</span>
            </div>
          </div>

          <div className="mc-header-right">
            <div className="mc-status-pill">
              <span className={`status-beacon ${telemetry.systemStatus === 'CRITICAL' ? 'beacon-red' : (telemetry.systemStatus === 'WARNING' ? 'beacon-yellow' : 'beacon-green')}`}></span>
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
            {/* 1. Temperature (dht_temp) */}
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
                <span className="card-hint">Ambient Thermal Sensor</span>
              </div>
            </div>

            {/* 2. BMP Temperature (bmp_temp) */}
            <div className="mc-card">
              <div className="card-top">
                <span className="card-label">BMP Temperature</span>
                <span className="card-chip">{telemetry.bmpTemperature?.sensor || 'BMP180'}</span>
              </div>
              <div className="card-value-wrap">
                <span className="card-val">{telemetry.bmpTemperature?.value ?? '--'}</span>
                <span className="card-unit">{telemetry.bmpTemperature?.unit || '°C'}</span>
              </div>
              <div className="card-status">
                <span className="mini-dot dot-green"></span>
                <span className="card-hint">Barometric Thermal Probe</span>
              </div>
            </div>

            {/* 3. Atmospheric Pressure (pressure) */}
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

            {/* 4. Humidity (humidity) */}
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

            {/* 5. Solar Panel Voltage */}
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

            {/* 6. Sunlight Level (LDR) */}
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

            {/* 7. Battery State */}
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

            {/* 8. System Status (system_status) */}
            <div className="mc-card card-highlight">
              <div className="card-top">
                <span className="card-label">System Status</span>
                <span className="card-chip">Main ESP32</span>
              </div>
              <div className="card-value-wrap">
                <span className={`card-val ${telemetry.systemStatus === 'CRITICAL' ? 'text-red' : (telemetry.systemStatus === 'WARNING' ? 'text-yellow' : 'text-green')}`}>{telemetry.systemStatus}</span>
              </div>
              <div className="card-status">
                <span className={`mini-dot ${telemetry.systemStatus === 'CRITICAL' ? 'dot-red' : (telemetry.systemStatus === 'WARNING' ? 'dot-yellow' : 'dot-green')}`}></span>
                <span className="card-hint">{isLiveTelemetry ? 'Active Supabase Feed' : 'All Subsystems Nominal'}</span>
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
                <span className="panel-tag">{isLiveTelemetry ? 'LIVE TELEMETRY STREAM' : 'TELEMETRY STREAM'}</span>
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
                <span className="track-label">Left LDR</span>
                <span className="track-val text-yellow">{telemetry.solarTracking.ldrLeft}</span>
              </div>
              <div className="tracking-metric-box">
                <span className="track-label">Right LDR</span>
                <span className="track-val text-yellow">{telemetry.solarTracking.ldrRight}</span>
              </div>
              <div className="tracking-metric-box">
                <span className="track-label">MG90S Angle</span>
                <span className="track-val text-cyan">{telemetry.solarTracking.mgAngle}</span>
              </div>
              <div className="tracking-metric-box">
                <span className="track-label">SG90S Angle</span>
                <span className="track-val text-cyan">{telemetry.solarTracking.sgAngle}</span>
              </div>
            </div>

            <div className="solar-tracking-visual-summary">
              <div className="track-flow-pill">LDR Array → ESP32 ADC → MG90S / SG90S Servos → Solar Panel</div>
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
