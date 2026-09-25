import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_TELEMETRY, generateMultiTelemetryHistory, getNextTelemetrySample, transformSupabaseRow, transformSupabaseHistory } from '../services/telemetryService';
import { fetchLatestTelemetryRow, fetchTelemetryHistoryRows, isSupabaseConfigured } from '../services/supabaseClient';
import { fetchCurrentWeather } from '../services/weatherService';
import './Telemetry.css';

/**
 * Reusable Responsive SVG Single-Metric Telemetry Graph
 */
function SingleMetricChart({ title, sensor, unit, data, dataKey, strokeColor, gradientId, minY, maxY, formatVal }) {
  if (!data || data.length === 0) return null;

  const currentVal = data[data.length - 1][dataKey];
  const numValues = data.map(d => Number(d[dataKey])).filter(v => !isNaN(v));
  const dataMin = numValues.length ? Math.min(...numValues) : (minY ?? 0);
  const dataMax = numValues.length ? Math.max(...numValues) : (maxY ?? 100);
  const minVal = minY !== undefined ? Math.min(minY, dataMin) : dataMin;
  const maxVal = maxY !== undefined ? Math.max(maxY, dataMax) : dataMax;
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const width = 480;
  const height = 140;
  const padLeft = 46;
  const padRight = 20;
  const padTop = 16;
  const padBottom = 26;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Convert points to coordinates
  const points = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartW;
    const norm = (d[dataKey] - minVal) / range;
    const y = padTop + chartH - norm * chartH;
    return { x, y, val: d[dataKey], time: d.time };
  });

  const polylineStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `M ${points[0].x},${padTop + chartH} ` +
    points.map(p => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
    ` L ${points[points.length - 1].x},${padTop + chartH} Z`;

  const lastPt = points[points.length - 1];

  // Midpoint reference value
  const midVal = (minVal + maxVal) / 2;

  return (
    <div className="telemetry-chart-card">
      <div className="chart-header">
        <div className="chart-meta">
          <span className="chart-title">{title}</span>
          <span className="chart-sensor">{sensor}</span>
        </div>
        <div className="chart-reading" style={{ color: strokeColor }}>
          <span className="reading-val">{formatVal ? formatVal(currentVal) : currentVal}</span>
          <span className="reading-unit">{unit}</span>
        </div>
      </div>

      <div className="chart-svg-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="telemetry-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.32" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padLeft} y1={padTop} x2={width - padRight} y2={padTop} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={padLeft} y1={padTop + chartH / 2} x2={width - padRight} y2={padTop + chartH / 2} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={padLeft} y1={padTop + chartH} x2={width - padRight} y2={padTop + chartH} stroke="#1e293b" strokeWidth="1" />

          {/* Y Axis Reference Labels */}
          <text x={padLeft - 8} y={padTop + 4} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">
            {maxVal.toFixed(maxVal < 10 && maxVal > -10 ? 1 : 0)}
          </text>
          <text x={padLeft - 8} y={padTop + chartH / 2 + 3} textAnchor="end" fill="#475569" fontSize="9" fontFamily="monospace">
            {midVal.toFixed(midVal < 10 && midVal > -10 ? 1 : 0)}
          </text>
          <text x={padLeft - 8} y={padTop + chartH + 1} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">
            {minVal.toFixed(minVal < 10 && minVal > -10 ? 1 : 0)}
          </text>

          {/* Gradient fill area */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Line */}
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylineStr}
          />

          {/* Latest point pulsing beacon */}
          <circle cx={lastPt.x} cy={lastPt.y} r="6" fill={strokeColor} opacity="0.25" className="live-point-pulse" />
          <circle cx={lastPt.x} cy={lastPt.y} r="3.5" fill={strokeColor} />

          {/* Time axis labels */}
          <text x={padLeft} y={height - 8} textAnchor="start" fill="#475569" fontSize="9" fontFamily="monospace">
            {data[0]?.time}
          </text>
          <text x={width - padRight} y={height - 8} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
            {data[data.length - 1]?.time}
          </text>
        </svg>
      </div>
    </div>
  );
}

/**
 * 3-Axis Gyroscope SVG Graph (Roll X, Pitch Y, Yaw Z)
 */
function GyroscopeMultiChart({ data }) {
  if (!data || data.length === 0) return null;

  const width = 480;
  const height = 140;
  const padLeft = 46;
  const padRight = 20;
  const padTop = 16;
  const padBottom = 26;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Fixed attitude range covering typical rotations: -30° to +60°
  const minY = -25;
  const maxY = 65;
  const range = maxY - minY;

  const projectY = (v) => padTop + chartH - ((v - minY) / range) * chartH;

  const pointsX = data.map((d, i) => ({ x: padLeft + (i / (data.length - 1)) * chartW, y: projectY(d.gyroX) }));
  const pointsY = data.map((d, i) => ({ x: padLeft + (i / (data.length - 1)) * chartW, y: projectY(d.gyroY) }));
  const pointsZ = data.map((d, i) => ({ x: padLeft + (i / (data.length - 1)) * chartW, y: projectY(d.gyroZ) }));

  const polyX = pointsX.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const polyY = pointsY.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const polyZ = pointsZ.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const current = data[data.length - 1];

  return (
    <div className="telemetry-chart-card gyro-chart-card">
      <div className="chart-header">
        <div className="chart-meta">
          <span className="chart-title">Gyroscope 3-Axis Motion</span>
          <span className="chart-sensor">MPU6050 6-DOF IMU</span>
        </div>
        <div className="gyro-legend-readings">
          <span className="gyro-axis-item x-axis">
            <span className="axis-bullet" style={{ background: '#ef4444' }}></span>
            <span className="axis-name">X (Roll):</span>
            <strong className="axis-num">{current?.gyroX > 0 ? `+${current?.gyroX}` : current?.gyroX}°</strong>
          </span>
          <span className="gyro-axis-item y-axis">
            <span className="axis-bullet" style={{ background: '#22c55e' }}></span>
            <span className="axis-name">Y (Pitch):</span>
            <strong className="axis-num">{current?.gyroY > 0 ? `+${current?.gyroY}` : current?.gyroY}°</strong>
          </span>
          <span className="gyro-axis-item z-axis">
            <span className="axis-bullet" style={{ background: '#38bdf8' }}></span>
            <span className="axis-name">Z (Yaw):</span>
            <strong className="axis-num">{current?.gyroZ > 0 ? `+${current?.gyroZ}` : current?.gyroZ}°</strong>
          </span>
        </div>
      </div>

      <div className="chart-svg-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="telemetry-svg" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1={padLeft} y1={padTop} x2={width - padRight} y2={padTop} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={padLeft} y1={projectY(0)} x2={width - padRight} y2={projectY(0)} stroke="#334155" strokeWidth="1" strokeDasharray="4 2" />
          <line x1={padLeft} y1={padTop + chartH} x2={width - padRight} y2={padTop + chartH} stroke="#1e293b" strokeWidth="1" />

          {/* Reference labels */}
          <text x={padLeft - 8} y={padTop + 4} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">+65°</text>
          <text x={padLeft - 8} y={projectY(0) + 3} textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="monospace">0°</text>
          <text x={padLeft - 8} y={padTop + chartH + 1} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">-25°</text>

          {/* Lines */}
          <polyline fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={polyX} />
          <polyline fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={polyY} />
          <polyline fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={polyZ} />

          {/* Latest Point Dots */}
          <circle cx={pointsX[pointsX.length - 1].x} cy={pointsX[pointsX.length - 1].y} r="3.5" fill="#ef4444" />
          <circle cx={pointsY[pointsY.length - 1].x} cy={pointsY[pointsY.length - 1].y} r="3.5" fill="#22c55e" />
          <circle cx={pointsZ[pointsZ.length - 1].x} cy={pointsZ[pointsZ.length - 1].y} r="3.5" fill="#38bdf8" />

          {/* Time axis */}
          <text x={padLeft} y={height - 8} textAnchor="start" fill="#475569" fontSize="9" fontFamily="monospace">
            {data[0]?.time}
          </text>
          <text x={width - padRight} y={height - 8} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
            {data[data.length - 1]?.time}
          </text>
        </svg>
      </div>
    </div>
  );
}

/**
 * Main Telemetry Component
 */
export default function Telemetry({ onNavigate }) {
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [chartData, setChartData] = useState(() => generateMultiTelemetryHistory(16));
  const [isLiveTelemetry, setIsLiveTelemetry] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(() => new Date().toISOString().substring(11, 19) + ' UTC');
  const stepCountRef = useRef(16);

  // Live Ground Weather state for SACS MAVMM Engineering College
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherRefreshing, setWeatherRefreshing] = useState(false);

  const loadWeather = async (isManual = false) => {
    if (isManual) setWeatherRefreshing(true);
    try {
      const data = await fetchCurrentWeather();
      setWeather(data);
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setWeatherLoading(false);
      if (isManual) setWeatherRefreshing(false);
    }
  };

  // Weather auto-refresh ticker (every 5 minutes / 300,000 ms)
  useEffect(() => {
    loadWeather();
    const weatherInterval = setInterval(() => {
      loadWeather();
    }, 300000);

    return () => clearInterval(weatherInterval);
  }, []);

  // Live Telemetry Sync from Supabase public.telemetry (Auto-refreshes every 5 seconds - Requirement 8)
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
          const timeFormatted = latestRow.created_at
            ? new Date(latestRow.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC'
            : new Date().toISOString().substring(11, 19) + ' UTC';
          setLastUpdatedTime(timeFormatted);

          // Fetch historical rows for the 6 graphs (Requirement 12)
          const { data: histRows, error: histErr } = await fetchTelemetryHistoryRows(16);
          if (isMounted && histRows && histRows.length >= 2 && !histErr) {
            const transformedHist = transformSupabaseHistory(histRows);
            setChartData(transformedHist);
          }
        } else {
          // No row in Supabase or connection awaiting data
          setIsLiveTelemetry(false);
        }
      } catch (err) {
        console.warn('Telemetry page Supabase sync notice:', err);
        if (isMounted) setIsLiveTelemetry(false);
      }
    };

    // Initial fetch
    syncTelemetry();

    // 5-second automatic refresh interval (Requirement 8)
    const interval = setInterval(syncTelemetry, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fallback simulation: ONLY active if Supabase is unconfigured (Requirement 11)
  useEffect(() => {
    if (isSupabaseConfigured() || isLiveTelemetry) return;

    const interval = setInterval(() => {
      stepCountRef.current += 1;
      const sample = getNextTelemetrySample(stepCountRef.current);
      const currentTime = new Date().toISOString().substring(11, 19) + ' UTC';
      setLastUpdatedTime(currentTime);

      setTelemetry(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
        temperature: { ...prev.temperature, value: sample.temperature },
        pressure: { ...prev.pressure, value: sample.pressure },
        humidity: { ...prev.humidity, value: sample.humidity },
        solarVoltage: { ...prev.solarVoltage, value: sample.solarVoltage },
        battery: { ...prev.battery, value: sample.battery },
        sunlight: { ...prev.sunlight, value: sample.sunlight },
        gyroscope: {
          ...prev.gyroscope,
          roll: sample.gyroX,
          pitch: sample.gyroY,
          yaw: sample.gyroZ,
        },
      }));

      setChartData(prev => [...prev.slice(1), sample]);
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveTelemetry]);

  return (
    <div className="telemetry-page">
      {/* Background Ambience */}
      <div className="telemetry-bg-glow"></div>
      <div className="telemetry-grid-pattern"></div>

      <div className="telemetry-container">
        {/* Top Control Bar & Official Callsign */}
        <header className="telemetry-header">
          <div className="header-left">
            <div className="callsign-badge">
              <span className="callsign-code">{telemetry.callsign}</span>
              <span className="callsign-desc">OFFICIAL CALLSIGN</span>
            </div>
            <div className="title-group">
              <h1 className="telemetry-main-title">Telemetry System</h1>
              <p className="telemetry-subtitle">
                Continuous Autonomous Sensor &amp; Attitude Acquisition Subsystem
              </p>
            </div>
          </div>

          <div className="header-right">
            {/* Live / Waiting Telemetry Status Badge (Requirements 9 & 10) */}
            <div className="simulated-badge-container">
              <div className={`simulated-pill ${isLiveTelemetry ? 'live-pill' : 'waiting-pill'}`}>
                <span className={`simulated-dot ${isLiveTelemetry ? 'live-dot' : 'waiting-dot'}`}></span>
                <span className="simulated-text">
                  {isLiveTelemetry ? 'LIVE TELEMETRY' : 'WAITING FOR ESP32 TELEMETRY'}
                </span>
              </div>
              <span className="simulated-caption">
                {isLiveTelemetry ? 'Real-time Supabase telemetry feed from CubeSat' : 'Awaiting real ESP32 telemetry packets'}
              </span>
            </div>

            {/* System Status & Time */}
            <div className="header-stats">
              <div className="stat-pill">
                <span className="pill-label">STATUS</span>
                <span className={`pill-val ${telemetry.systemStatus === 'CRITICAL' ? 'status-critical text-red' : (telemetry.systemStatus === 'WARNING' ? 'status-warning text-yellow' : 'status-normal text-green')}`}>
                  <span className={`status-dot ${telemetry.systemStatus === 'CRITICAL' ? 'dot-red' : (telemetry.systemStatus === 'WARNING' ? 'dot-yellow' : 'green-dot')}`}></span> {telemetry.systemStatus}
                </span>
              </div>
              <div className="stat-pill">
                <span className="pill-label">LAST UPDATE</span>
                <span className="pill-val mono-val">{lastUpdatedTime}</span>
              </div>
              <div className="stat-pill stream-sync-pill" title="5-second Supabase telemetry synchronization">
                <span className="pill-label">REFRESH</span>
                <span className="pill-val mono-val text-cyan">5s AUTO</span>
              </div>
            </div>
          </div>
        </header>

        {/* Sensor Status Strip */}
        <section className="sensor-health-section">
          <div className="section-label-bar">
            <span className="bar-title">SUBSYSTEM & SENSOR HARDWARE STATUS</span>
            <span className="bar-sub">ESP32 SENSOR BUS (I2C / ADC / GPIO)</span>
          </div>

          <div className="sensor-status-grid">
            {telemetry.sensorStatus.map((sensor) => (
              <div key={sensor.id || sensor.name} className="sensor-status-card">
                <div className="sensor-header-row">
                  <span className="sensor-name">{sensor.name}</span>
                  <span className="status-tag status-tag-normal">
                    <span className="status-dot"></span>
                    {sensor.status}
                  </span>
                </div>
                <div className="sensor-sub-label">{sensor.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Compact Telemetry Cards (9 Requested Readings) */}
        <section className="telemetry-cards-section">
          <div className="section-label-bar">
            <span className="bar-title">REAL-TIME TELEMETRY VALUES</span>
            <span className="bar-sub">9 ONBOARD PARAMETERS</span>
          </div>

          <div className="telemetry-cards-grid">
            {/* 1. Temperature (dht_temp) */}
            <div className="telemetry-card">
              <div className="card-top">
                <span className="card-label">Temperature</span>
                <span className="card-sensor-tag">{telemetry.temperature.sensor}</span>
              </div>
              <div className="card-metric">
                <span className="metric-value">{telemetry.temperature.value}</span>
                <span className="metric-unit">{telemetry.temperature.unit}</span>
              </div>
              <div className="card-footer">
                <span className="nominal-badge">DHT SENSOR</span>
                <span className="status-chip normal">Active</span>
              </div>
            </div>

            {/* 2. BMP Temperature (bmp_temp) */}
            <div className="telemetry-card">
              <div className="card-top">
                <span className="card-label">BMP Temperature</span>
                <span className="card-sensor-tag">{telemetry.bmpTemperature?.sensor || 'BMP180'}</span>
              </div>
              <div className="card-metric">
                <span className="metric-value">{telemetry.bmpTemperature?.value ?? '--'}</span>
                <span className="metric-unit">{telemetry.bmpTemperature?.unit || '°C'}</span>
              </div>
              <div className="card-footer">
                <span className="nominal-badge">BMP180 THERMAL</span>
                <span className="status-chip normal">Active</span>
              </div>
            </div>

            {/* 3. Atmospheric Pressure (pressure) */}
            <div className="telemetry-card">
              <div className="card-top">
                <span className="card-label">Atmospheric Pressure</span>
                <span className="card-sensor-tag">{telemetry.pressure.sensor}</span>
              </div>
              <div className="card-metric">
                <span className="metric-value">{telemetry.pressure.value}</span>
                <span className="metric-unit">{telemetry.pressure.unit}</span>
              </div>
              <div className="card-footer">
                <span className="nominal-badge">SEA-LEVEL BASELINE</span>
                <span className="status-chip normal">Active</span>
              </div>
            </div>

            {/* 4. Humidity (humidity) */}
            <div className="telemetry-card">
              <div className="card-top">
                <span className="card-label">Humidity</span>
                <span className="card-sensor-tag">{telemetry.humidity.sensor}</span>
              </div>
              <div className="card-metric">
                <span className="metric-value">{telemetry.humidity.value}</span>
                <span className="metric-unit">{telemetry.humidity.unit}</span>
              </div>
              <div className="card-footer">
                <span className="nominal-badge">RELATIVE MOISTURE</span>
                <span className="status-chip normal">Active</span>
              </div>
            </div>

            {/* 5. Left LDR (left_ldr) */}
            <div className="telemetry-card card-yellow-accent">
              <div className="card-top">
                <span className="card-label text-yellow">Left LDR</span>
                <span className="card-sensor-tag sensor-yellow">LDR Sensor</span>
              </div>
              <div className="card-metric metric-yellow">
                <span className="metric-value-text">{telemetry.solarTracking.ldrLeft}</span>
              </div>
              <div className="card-footer">
                <span className="nominal-badge">PORT SOLAR FLUX</span>
                <span className="status-chip chip-yellow">Solar Tracking</span>
              </div>
            </div>

            {/* 6. Right LDR (right_ldr) */}
            <div className="telemetry-card card-yellow-accent">
              <div className="card-top">
                <span className="card-label text-yellow">Right LDR</span>
                <span className="card-sensor-tag sensor-yellow">LDR Sensor</span>
              </div>
              <div className="card-metric metric-yellow">
                <span className="metric-value-text">{telemetry.solarTracking.ldrRight}</span>
              </div>
              <div className="card-footer">
                <span className="nominal-badge">STARBOARD FLUX</span>
                <span className="status-chip chip-yellow">Solar Tracking</span>
              </div>
            </div>

            {/* 7. MG90S Angle (mg_angle) */}
            <div className="telemetry-card">
              <div className="card-top">
                <span className="card-label">MG90S Angle</span>
                <span className="card-sensor-tag">Servo Motor</span>
              </div>
              <div className="card-metric">
                <span className="metric-value text-cyan">{telemetry.solarTracking.mgAngle}</span>
              </div>
              <div className="card-footer">
                <span className="nominal-badge">PRIMARY GIMBAL</span>
                <span className="status-chip normal">Actuator</span>
              </div>
            </div>

            {/* 8. SG90S Angle (sg_angle) */}
            <div className="telemetry-card">
              <div className="card-top">
                <span className="card-label">SG90S Angle</span>
                <span className="card-sensor-tag">Servo Motor</span>
              </div>
              <div className="card-metric">
                <span className="metric-value text-cyan">{telemetry.solarTracking.sgAngle}</span>
              </div>
              <div className="card-footer">
                <span className="nominal-badge">SECONDARY GIMBAL</span>
                <span className="status-chip normal">Actuator</span>
              </div>
            </div>

            {/* 9. System Status (system_status) */}
            <div className="telemetry-card">
              <div className="card-top">
                <span className="card-label">System Status</span>
                <span className="card-sensor-tag">Main ESP32</span>
              </div>
              <div className="card-metric">
                <span className={`metric-value-text ${telemetry.systemStatus === 'CRITICAL' ? 'text-red' : (telemetry.systemStatus === 'WARNING' ? 'text-yellow' : 'text-green')}`}>
                  {telemetry.systemStatus}
                </span>
              </div>
              <div className="card-footer">
                <span className="nominal-badge">{isLiveTelemetry ? 'LIVE SUPABASE' : 'STANDBY'}</span>
                <span className={`status-chip ${telemetry.systemStatus === 'CRITICAL' ? 'chip-red' : (telemetry.systemStatus === 'WARNING' ? 'chip-yellow' : 'normal')}`}>
                  {telemetry.systemStatus}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            CURRENT WEATHER SECTION (Ground Weather • Live Weather Data)
            Real-time meteorological readings for SACS MAVMM Engineering College
            ================================================================= */}
        <section className="current-weather-section" aria-label="Current Ground Weather">
          <div className="section-label-bar weather-label-bar">
            <div className="weather-title-group">
              <span className="bar-title weather-heading">CURRENT WEATHER</span>
              <span className="live-weather-badge">
                <span className="live-weather-dot"></span>
                LIVE WEATHER DATA
              </span>
              <span className="weather-distinction-tag">GROUND WEATHER</span>
            </div>

            <div className="weather-meta-group">
              <div className="weather-location-pill" title="SACS MAVMM Engineering College Campus, Kidaripatti, Madurai">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="loc-pin-svg" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="college-name-text">SACS MAVMM Engineering College</span>
                <span className="college-coords-text">(10.05°N, 78.22°E)</span>
              </div>

              <div className="weather-update-pill">
                <span className="update-label">UPDATED:</span>
                <span className="update-time mono-val">{weather?.lastUpdated || 'FETCHING...'}</span>
              </div>

              <button
                className={`weather-refresh-btn ${weatherRefreshing ? 'refreshing' : ''}`}
                onClick={() => loadWeather(true)}
                disabled={weatherRefreshing}
                title="Refresh live ground weather from Open-Meteo API"
                aria-label="Refresh live ground weather"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="refresh-svg" aria-hidden="true">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span className="refresh-btn-text">{weatherRefreshing ? 'SYNCING...' : 'REFRESH'}</span>
              </button>
            </div>
          </div>

          {/* Graceful notice if API is temporarily unavailable */}
          {weather?.error && (
            <div className="weather-fallback-banner">
              <span className="warning-dot"></span>
              <span className="warning-text">Weather data unavailable ({weather.error})</span>
            </div>
          )}

          {/* 6 Responsive Ground Weather Cards */}
          <div className="weather-cards-grid">
            {/* 1. Cloud Cover (Highlighted & Prominent) */}
            <div className="weather-card weather-card-cloud">
              <div className="wcard-top">
                <span className="wcard-label">Cloud Cover</span>
                <span className="wcard-icon-box cloud-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="wcard-svg">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                  </svg>
                </span>
              </div>
              <div className="wcard-metric">
                <span className="wmetric-val cloud-val">{weather ? `${weather.cloudCover}` : '--'}</span>
                <span className="wmetric-unit">%</span>
              </div>
              <div className="wcard-footer">
                <div className="cloud-bar-track">
                  <div
                    className="cloud-bar-fill"
                    style={{ width: `${Math.min(100, Math.max(0, weather?.cloudCover ?? 0))}%` }}
                  ></div>
                </div>
                <span className="wcard-status-text">
                  {weather ? (weather.cloudCover > 80 ? 'Heavy Overcast' : weather.cloudCover > 40 ? 'Partly Cloudy' : 'Clear Sky') : 'Live Metric'}
                </span>
              </div>
            </div>

            {/* 2. Temperature */}
            <div className="weather-card">
              <div className="wcard-top">
                <span className="wcard-label">Temperature</span>
                <span className="wcard-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="wcard-svg">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                  </svg>
                </span>
              </div>
              <div className="wcard-metric">
                <span className="wmetric-val">{weather ? `${weather.temperature}` : '--'}</span>
                <span className="wmetric-unit">°C</span>
              </div>
              <div className="wcard-footer">
                <span className="wcard-subtext">Ground Ambient</span>
                <span className="wcard-tag">Open-Meteo</span>
              </div>
            </div>

            {/* 3. Weather Condition */}
            <div className="weather-card">
              <div className="wcard-top">
                <span className="wcard-label">Condition</span>
                <span className="wcard-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="wcard-svg">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                </span>
              </div>
              <div className="wcard-metric">
                <span className="wmetric-text-val">{weather ? weather.condition : '--'}</span>
              </div>
              <div className="wcard-footer">
                <span className="wcard-subtext">WMO Surface Code</span>
                <span className="wcard-tag">Ground</span>
              </div>
            </div>

            {/* 4. Humidity */}
            <div className="weather-card">
              <div className="wcard-top">
                <span className="wcard-label">Humidity</span>
                <span className="wcard-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="wcard-svg">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                </span>
              </div>
              <div className="wcard-metric">
                <span className="wmetric-val">{weather ? `${weather.humidity}` : '--'}</span>
                <span className="wmetric-unit">%</span>
              </div>
              <div className="wcard-footer">
                <span className="wcard-subtext">Relative Humidity</span>
                <span className="wcard-tag">Ambient</span>
              </div>
            </div>

            {/* 5. Wind Speed */}
            <div className="weather-card">
              <div className="wcard-top">
                <span className="wcard-label">Wind Speed</span>
                <span className="wcard-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="wcard-svg">
                    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                  </svg>
                </span>
              </div>
              <div className="wcard-metric">
                <span className="wmetric-val">{weather ? `${weather.windSpeed}` : '--'}</span>
                <span className="wmetric-unit">km/h</span>
              </div>
              <div className="wcard-footer">
                <span className="wcard-subtext">10m Surface Wind</span>
                <span className="wcard-tag">Vector</span>
              </div>
            </div>

            {/* 6. Precipitation */}
            <div className="weather-card">
              <div className="wcard-top">
                <span className="wcard-label">Precipitation</span>
                <span className="wcard-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="wcard-svg">
                    <line x1="16" y1="13" x2="16" y2="21" />
                    <line x1="8" y1="13" x2="8" y2="21" />
                    <line x1="12" y1="15" x2="12" y2="23" />
                    <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
                  </svg>
                </span>
              </div>
              <div className="wcard-metric">
                <span className="wmetric-val">{weather ? `${weather.precipitation}` : '--'}</span>
                <span className="wmetric-unit">mm</span>
              </div>
              <div className="wcard-footer">
                <span className="wcard-subtext">Current Rainfall Rate</span>
                <span className="wcard-tag">Surface</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6 Responsive Clean Graphs */}
        <section className="telemetry-charts-section">
          <div className="section-label-bar">
            <span className="bar-title">LIVE TELEMETRY GRAPHS</span>
            <span className="bar-sub">RESPONSIVE TIME-SERIES MONITORING</span>
          </div>

          <div className="charts-grid">
            {/* Graph 1: Temperature */}
            <SingleMetricChart
              title="Temperature History"
              sensor="BMP180 Sensor"
              unit="°C"
              data={chartData}
              dataKey="temperature"
              strokeColor="#38bdf8"
              gradientId="tempGrad"
              minY={25}
              maxY={32}
              formatVal={v => v.toFixed(1)}
            />

            {/* Graph 2: Pressure */}
            <SingleMetricChart
              title="Atmospheric Pressure"
              sensor="BMP180 Barometer"
              unit="hPa"
              data={chartData}
              dataKey="pressure"
              strokeColor="#00e5ff"
              gradientId="presGrad"
              minY={1000}
              maxY={1016}
              formatVal={v => Math.round(v)}
            />

            {/* Graph 3: Humidity */}
            <SingleMetricChart
              title="Relative Humidity"
              sensor="Humidity Transducer"
              unit="%"
              data={chartData}
              dataKey="humidity"
              strokeColor="#0284c7"
              gradientId="humGrad"
              minY={50}
              maxY={65}
              formatVal={v => Math.round(v)}
            />

            {/* Graph 4: Solar Voltage (Yellow) */}
            <SingleMetricChart
              title="Solar Panel Voltage"
              sensor="Photovoltaic Array"
              unit="V"
              data={chartData}
              dataKey="solarVoltage"
              strokeColor="#facc15"
              gradientId="voltGrad"
              minY={5.0}
              maxY={6.5}
              formatVal={v => v.toFixed(2)}
            />

            {/* Graph 5: Battery (Green) */}
            <SingleMetricChart
              title="Battery State of Charge"
              sensor="EPS Power Bus"
              unit="%"
              data={chartData}
              dataKey="battery"
              strokeColor="#22c55e"
              gradientId="battGrad"
              minY={75}
              maxY={90}
              formatVal={v => Math.round(v)}
            />

            {/* Graph 6: Gyroscope X/Y/Z */}
            <GyroscopeMultiChart data={chartData} />
          </div>
        </section>

        {/* Integration Architecture Readiness Notice */}
        <section className="esp32-readiness-banner">
          <div className="readiness-icon-col">
            <div className="chip-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" className="chip-svg">
                <rect x="5" y="5" width="14" height="14" rx="2" />
                <path d="M9 9h6v6H9z" />
                <path d="M2 9h3M2 15h3M19 9h3M19 15h3M9 2v3M15 2v3M9 19v3M15 19v3" />
              </svg>
            </div>
          </div>
          <div className="readiness-text-col">
            <h4 className="readiness-title">Hardware Telemetry Architecture Ready</h4>
            <p className="readiness-desc">
              All telemetry values and graph feeds are linked to a single central state structure (<code>telemetryService.js</code>).
              When the physical <strong>ESP32 CubeSat</strong> is wired and broadcasting via UART or Wi-Fi WebSocket,
              simulated data will seamlessly switch to real hardware packets without requiring changes to the user interface.
            </p>
          </div>
          <div className="readiness-actions">
            <button className="nav-secondary-btn" onClick={() => onNavigate && onNavigate('mission-control')}>
              Mission Control →
            </button>
            <button className="nav-secondary-btn" onClick={() => onNavigate && onNavigate('cubesat')}>
              3D CubeSat Model →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
