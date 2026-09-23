/**
 * DMRS-01 Telemetry Service
 * Centralized data contract for telemetry values, multi-sensor history, and MPU6050 attitude state.
 * 
 * Future ESP32 integration pipeline:
 * ESP32 -> Sensors (MPU6050, BMP180, Humidity, LDRs, Voltage) -> Wi-Fi/Internet -> WebSocket/API -> DMRS-01 Website
 */

export const INITIAL_TELEMETRY = {
  isSimulated: true,
  callsign: 'DMRS-01',
  systemStatus: 'NORMAL', // 'NORMAL' | 'WARNING' | 'CRITICAL'
  lastUpdated: new Date().toISOString(),
  
  // MPU6050 Gyroscope & Attitude Data
  gyroscope: {
    roll: 12.5,   // X-axis (Roll)
    pitch: -8.3,  // Y-axis (Pitch)
    yaw: 45.6,    // Z-axis (Yaw)
    sensor: 'MPU6050 6-DOF IMU',
    status: 'normal',
  },

  // Core Sensor Readings
  temperature: {
    value: 28.4,
    unit: '°C',
    label: 'Temperature',
    sensor: 'BMP180',
    status: 'normal',
  },
  pressure: {
    value: 1008,
    unit: 'hPa',
    label: 'Atmospheric Pressure',
    sensor: 'BMP180',
    status: 'normal',
  },
  humidity: {
    value: 56,
    unit: '%',
    label: 'Humidity',
    sensor: 'Humidity Sensor',
    status: 'normal',
  },
  solarVoltage: {
    value: 5.8,
    unit: 'V',
    label: 'Solar Voltage',
    sensor: 'Solar Panels',
    status: 'normal',
  },
  sunlight: {
    value: 'High',
    unit: '',
    label: 'Sunlight Level',
    sensor: 'LDR Sensors',
    status: 'normal',
  },
  motion: {
    value: 'Stable',
    unit: '',
    label: 'Motion / Gyroscope',
    sensor: 'MPU6050',
    status: 'normal',
  },
  battery: {
    value: 82,
    unit: '%',
    label: 'Battery',
    sensor: 'Power Subsystem',
    status: 'normal',
  },

  // Solar Tracking Subsystem
  solarTracking: {
    status: 'ACTIVE',
    ldrLeft: '870 Lux',
    ldrRight: '845 Lux',
    servoAngle: '42°',
    mode: 'Closed-Loop Auto',
  },

  // Sensor Health Subsystem Statuses
  sensorStatus: [
    { id: 'bmp180', name: 'BMP180', label: 'Temperature & Pressure', status: 'NORMAL', state: 'normal' },
    { id: 'humidity', name: 'Humidity Sensor', label: 'Relative Humidity', status: 'NORMAL', state: 'normal' },
    { id: 'mpu6050', name: 'MPU6050 Gyroscope', label: 'Attitude & Orientation', status: 'NORMAL', state: 'normal' },
    { id: 'ldr', name: 'LDR Sensors', label: 'Sunlight Detection', status: 'NORMAL', state: 'normal' },
    { id: 'solar', name: 'Solar Subsystem', label: 'Solar Tracking & Rails', status: 'ACTIVE', state: 'normal' },
    { id: 'esp32', name: 'ESP32 System Status', label: 'Main Flight Controller', status: 'ONLINE', state: 'normal' },
  ]
};

/**
 * Generates an incremental live telemetry sample for live chart rolling
 */
export function getNextTelemetrySample(stepIndex = 0) {
  const now = new Date();
  const timeStr = now.toISOString().substring(11, 19); // HH:mm:ss UTC
  const tempNoise = Math.sin(stepIndex * 0.7) * 0.3;
  const presNoise = Math.cos(stepIndex * 0.6) * 1.5;
  const humNoise = Math.sin(stepIndex * 0.5) * 1.0;
  const voltNoise = Math.cos(stepIndex * 0.8) * 0.06;
  const battNoise = Math.sin(stepIndex * 0.3) * 0.3;
  const gxNoise = Math.sin(stepIndex * 0.9) * 0.4;
  const gyNoise = Math.cos(stepIndex * 0.85) * 0.4;
  const gzNoise = Math.sin(stepIndex * 0.65) * 0.5;

  return {
    time: timeStr,
    temperature: parseFloat((28.4 + tempNoise).toFixed(1)),
    pressure: Math.round(1008 + presNoise),
    humidity: Math.round(56 + humNoise),
    solarVoltage: parseFloat((5.8 + voltNoise).toFixed(2)),
    battery: Math.round(82 + battNoise),
    sunlight: 'High',
    gyroX: parseFloat((12.5 + gxNoise).toFixed(1)),
    gyroY: parseFloat((-8.3 + gyNoise).toFixed(1)),
    gyroZ: parseFloat((45.6 + gzNoise).toFixed(1)),
  };
}

/**
 * Generate multi-parameter rolling chart data for telemetry graphs
 */
export function generateMultiTelemetryHistory(points = 14) {
  const data = [];
  const baseTime = Date.now() - points * 2500;
  
  for (let i = 0; i < points; i++) {
    const t = new Date(baseTime + i * 2500);
    const timeStr = t.toISOString().substring(14, 19);

    const tempNoise = (Math.sin(i * 0.7) * 0.35).toFixed(1);
    const presNoise = (Math.cos(i * 0.6) * 1.8).toFixed(0);
    const humNoise = (Math.sin(i * 0.5) * 1.2).toFixed(0);
    const voltNoise = (Math.cos(i * 0.8) * 0.08).toFixed(2);
    const battNoise = (Math.sin(i * 0.4) * 0.4).toFixed(0);

    const gxNoise = (Math.sin(i * 0.9) * 0.6).toFixed(1);
    const gyNoise = (Math.cos(i * 0.85) * 0.5).toFixed(1);
    const gzNoise = (Math.sin(i * 0.65) * 0.8).toFixed(1);

    data.push({
      time: timeStr,
      temperature: parseFloat((28.4 + parseFloat(tempNoise)).toFixed(1)),
      pressure: parseInt(1008 + parseInt(presNoise, 10), 10),
      humidity: parseInt(56 + parseInt(humNoise, 10), 10),
      solarVoltage: parseFloat((5.8 + parseFloat(voltNoise)).toFixed(2)),
      battery: parseInt(82 + parseInt(battNoise, 10), 10),
      gyroX: parseFloat((12.5 + parseFloat(gxNoise)).toFixed(1)),
      gyroY: parseFloat((-8.3 + parseFloat(gyNoise)).toFixed(1)),
      gyroZ: parseFloat((45.6 + parseFloat(gzNoise)).toFixed(1)),
    });
  }
  return data;
}

/**
 * Backward compatibility helper
 */
export function generateInitialChartData(points = 12) {
  return generateMultiTelemetryHistory(points).map(d => ({
    time: d.time,
    temperature: d.temperature,
    solarVoltage: d.solarVoltage,
    battery: d.battery,
  }));
}
