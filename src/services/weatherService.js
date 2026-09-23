/**
 * Weather Service for DMRS-01 Telemetry Subsystem
 * Fetches real ground meteorological data for SACS MAVMM Engineering College
 * Coordinates: Latitude 10.05° N, Longitude 78.22° E (Kidaripatti / Alagarkoil, Madurai)
 * Provider: Open-Meteo Public Meteorological API
 */

export const COLLEGE_LOCATION = {
  name: 'SACS MAVMM Engineering College',
  campus: 'Kidaripatti, Madurai, Tamil Nadu',
  latitude: 10.05,
  longitude: 78.22,
  coordsDisplay: '10.05°N, 78.22°E'
};

const OPEN_METEO_URL = `https://api.open-meteo.com/v1/forecast?latitude=${COLLEGE_LOCATION.latitude}&longitude=${COLLEGE_LOCATION.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,cloud_cover,wind_speed_10m&timezone=auto`;

/**
 * Translates WMO weather codes into human-readable conditions
 */
export function getWeatherCondition(code) {
  if (code === undefined || code === null) return 'Unknown';
  switch (code) {
    case 0:
      return 'Clear Sky';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Foggy / Hazy';
    case 51:
    case 53:
    case 55:
      return 'Light Drizzle';
    case 56:
    case 57:
      return 'Freezing Drizzle';
    case 61:
      return 'Light Rain';
    case 63:
      return 'Moderate Rain';
    case 65:
      return 'Heavy Rain';
    case 66:
    case 67:
      return 'Freezing Rain';
    case 71:
    case 73:
    case 75:
      return 'Snow Fall';
    case 77:
      return 'Snow Grains';
    case 80:
    case 81:
    case 82:
      return 'Rain Showers';
    case 85:
    case 86:
      return 'Snow Showers';
    case 95:
      return 'Thunderstorm';
    case 96:
    case 99:
      return 'Thunderstorm with Hail';
    default:
      return 'Fair';
  }
}

/**
 * In-memory cache for graceful fallback if network temporarily disconnects
 */
let lastCachedWeather = null;

/**
 * Fetches real current ground weather data from Open-Meteo API
 */
export async function fetchCurrentWeather() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(OPEN_METEO_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Weather API HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.current) {
      throw new Error('Invalid weather payload');
    }

    const current = data.current;
    const units = data.current_units || {};

    const formattedWeather = {
      temperature: current.temperature_2m !== undefined ? Math.round(current.temperature_2m * 10) / 10 : 29.0,
      temperatureUnit: units.temperature_2m || '°C',
      cloudCover: current.cloud_cover !== undefined ? Math.round(current.cloud_cover) : 40,
      cloudCoverUnit: units.cloud_cover || '%',
      humidity: current.relative_humidity_2m !== undefined ? Math.round(current.relative_humidity_2m) : 65,
      humidityUnit: units.relative_humidity_2m || '%',
      windSpeed: current.wind_speed_10m !== undefined ? Math.round(current.wind_speed_10m * 10) / 10 : 12.0,
      windSpeedUnit: units.wind_speed_10m || 'km/h',
      precipitation: current.precipitation !== undefined ? Math.round(current.precipitation * 10) / 10 : 0.0,
      precipitationUnit: units.precipitation || 'mm',
      weatherCode: current.weather_code,
      condition: getWeatherCondition(current.weather_code),
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      locationName: COLLEGE_LOCATION.name,
      locationCoords: COLLEGE_LOCATION.coordsDisplay,
      isLive: true,
      error: null
    };

    lastCachedWeather = formattedWeather;
    return formattedWeather;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Open-Meteo weather fetch encountered an issue:', err.message);

    // Return cached weather with error flag, or fallback safe defaults
    if (lastCachedWeather) {
      return {
        ...lastCachedWeather,
        isLive: false,
        error: 'Weather data temporarily unavailable (displaying last recorded)'
      };
    }

    return {
      temperature: 29.0,
      temperatureUnit: '°C',
      cloudCover: 42,
      cloudCoverUnit: '%',
      humidity: 68,
      humidityUnit: '%',
      windSpeed: 12.0,
      windSpeedUnit: 'km/h',
      precipitation: 0.0,
      precipitationUnit: 'mm',
      weatherCode: 2,
      condition: 'Partly Cloudy',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      locationName: COLLEGE_LOCATION.name,
      locationCoords: COLLEGE_LOCATION.coordsDisplay,
      isLive: false,
      error: 'Weather data unavailable'
    };
  }
}
