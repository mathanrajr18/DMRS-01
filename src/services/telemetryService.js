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
    label: 'Temperature (DHT)',
    sensor: 'DHT Sensor',
    status: 'normal',
  },
  bmpTemperature: {
    value: 28.1,
    unit: '°C',
    label: 'BMP Temperature',
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

  // Actuation & Solar Tracking Subsystem
  solarTracking: {
    status: 'ACTIVE',
    ldrLeft: '870 Lux',
    ldrRight: '845 Lux',
    leftLdrRaw: 870,
    rightLdrRaw: 845,
    mgAngle: '45°',
    sgAngle: '90°',
    servoAngle: '45°',
    mode: 'Closed-Loop Auto',
  },

  // Sensor Health Subsystem Statuses
  sensorStatus: [
    { id: 'dht', name: 'DHT Sensor', label: 'Temperature & Humidity', status: 'NORMAL', state: 'normal' },
    { id: 'bmp180', name: 'BMP180', label: 'Temperature & Pressure', status: 'NORMAL', state: 'normal' },
    { id: 'ldr', name: 'LDR Dual Array', label: 'Sunlight Tracking', status: 'ACTIVE', state: 'normal' },
    { id: 'servos', name: 'MG90S / SG90S', label: 'Dual Axis Gimbal', status: 'ALIGNED', state: 'normal' },
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

/**
 * Transform a single Supabase public.telemetry row into website telemetry format
 */
export function transformSupabaseRow(row) {
  if (!row) return null;

  const dhtTemp = row.dht_temp != null ? Number(row.dht_temp) : null;
  const bmpTemp = row.bmp_temp != null ? Number(row.bmp_temp) : null;
  const humidity = row.humidity != null ? Number(row.humidity) : null;
  const pressure = row.pressure != null ? Number(row.pressure) : null;
  const leftLdr = row.left_ldr != null ? Number(row.left_ldr) : null;
  const rightLdr = row.right_ldr != null ? Number(row.right_ldr) : null;
  const mgAngle = row.mg_angle != null ? Number(row.mg_angle) : null;
  const sgAngle = row.sg_angle != null ? Number(row.sg_angle) : null;
  const statusRaw = row.system_status ? String(row.system_status).trim().toUpperCase() : 'NORMAL';

  let sunlightVal = 'Nominal';
  if (leftLdr != null && rightLdr != null) {
    const avgLux = Math.round((leftLdr + rightLdr) / 2);
    sunlightVal = `${avgLux} Lux`;
  } else if (leftLdr != null) {
    sunlightVal = `${leftLdr} Lux`;
  }

  const estimatedVoltage = leftLdr != null
    ? parseFloat(Math.min(6.5, Math.max(3.2, 3.2 + (leftLdr / 1000) * 2.8)).toFixed(2))
    : 5.8;

  return {
    isLive: true,
    isSimulated: false,
    callsign: 'DMRS-01',
    systemStatus: statusRaw,
    lastUpdated: row.created_at || new Date().toISOString(),

    temperature: {
      value: dhtTemp != null ? dhtTemp : (bmpTemp != null ? bmpTemp : '--'),
      unit: '°C',
      label: 'Temperature (DHT)',
      sensor: 'DHT Sensor',
      status: 'normal',
    },
    bmpTemperature: {
      value: bmpTemp != null ? bmpTemp : '--',
      unit: '°C',
      label: 'BMP Temperature',
      sensor: 'BMP180',
      status: 'normal',
    },
    pressure: {
      value: pressure != null ? pressure : '--',
      unit: 'hPa',
      label: 'Atmospheric Pressure',
      sensor: 'BMP180',
      status: 'normal',
    },
    humidity: {
      value: humidity != null ? humidity : '--',
      unit: '%',
      label: 'Humidity',
      sensor: 'Humidity Sensor',
      status: 'normal',
    },
    solarVoltage: {
      value: estimatedVoltage,
      unit: 'V',
      label: 'Solar Voltage',
      sensor: 'Solar Panels',
      status: 'normal',
    },
    sunlight: {
      value: sunlightVal,
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
      value: 85,
      unit: '%',
      label: 'Battery',
      sensor: 'Power Subsystem',
      status: 'normal',
    },

    solarTracking: {
      status: 'ACTIVE',
      ldrLeft: leftLdr != null ? `${leftLdr} Lux` : '--',
      ldrRight: rightLdr != null ? `${rightLdr} Lux` : '--',
      leftLdrRaw: leftLdr,
      rightLdrRaw: rightLdr,
      mgAngle: mgAngle != null ? `${mgAngle}°` : '--',
      sgAngle: sgAngle != null ? `${sgAngle}°` : '--',
      servoAngle: mgAngle != null ? `${mgAngle}°` : (sgAngle != null ? `${sgAngle}°` : '--'),
      mode: 'Closed-Loop Auto',
    },

    raw: {
      id: row.id,
      created_at: row.created_at,
      dht_temp: dhtTemp,
      humidity,
      bmp_temp: bmpTemp,
      pressure,
      left_ldr: leftLdr,
      right_ldr: rightLdr,
      mg_angle: mgAngle,
      sg_angle: sgAngle,
      system_status: statusRaw,
    },
  };
}

/**
 * Transform Supabase history rows for chart display
 */
export function transformSupabaseHistory(rows = []) {
  if (!rows || rows.length === 0) return [];

  return rows.map((r) => {
    const dhtTemp = r.dht_temp != null ? Number(r.dht_temp) : (r.bmp_temp != null ? Number(r.bmp_temp) : 28);
    const bmpTemp = r.bmp_temp != null ? Number(r.bmp_temp) : dhtTemp;
    const humidity = r.humidity != null ? Number(r.humidity) : 55;
    const pressure = r.pressure != null ? Number(r.pressure) : 1008;
    const leftLdr = r.left_ldr != null ? Number(r.left_ldr) : 500;
    const rightLdr = r.right_ldr != null ? Number(r.right_ldr) : 500;
    const mgAngle = r.mg_angle != null ? Number(r.mg_angle) : 45;
    const sgAngle = r.sg_angle != null ? Number(r.sg_angle) : 90;

    const timeStr = r.created_at
      ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '--:--';

    const solarVoltage = parseFloat(Math.min(6.5, Math.max(3.2, 3.2 + (leftLdr / 1000) * 2.8)).toFixed(2));

    return {
      time: timeStr,
      temperature: dhtTemp,
      bmpTemp: bmpTemp,
      pressure: pressure,
      humidity: humidity,
      solarVoltage: solarVoltage,
      battery: 82,
      leftLdr: leftLdr,
      rightLdr: rightLdr,
      mgAngle: mgAngle,
      sgAngle: sgAngle,
      gyroX: mgAngle - 30,
      gyroY: sgAngle - 90,
      gyroZ: (mgAngle + sgAngle) % 360,
    };
  });
}

