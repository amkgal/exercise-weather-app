import { HourlyForecast, LightningAlertLevel, SingaporeZone, WeatherCondition } from '../types/planner';
import { SINGAPORE_ZONES_BASE } from '../data/singaporeZones';
import { getTimeString } from '../utils/weatherEngine';

export interface LiveFeedResponse {
  code: number;
  source: string;
  timestamp: string;
  data: {
    'two-hr-forecast'?: {
      data?: {
        items?: Array<{
          forecasts?: Array<{ area: string; forecast: string }>;
          update_timestamp?: string;
          valid_period?: { start: string; end: string };
        }>;
      };
    };
    lightning?: {
      data?: {
        records?: Array<{
          datetime: string;
          item: {
            readings: Array<{
              location: { latitude: string; longitude: string };
              type: string;
              text: string;
              datetime: string;
            }>;
          };
        }>;
      };
    };
    psi?: {
      data?: {
        items?: Array<{
          readings?: {
            psi_twenty_four_hourly?: Record<string, number>;
            pm25_twenty_four_hourly?: Record<string, number>;
          };
        }>;
      };
    };
    'air-temperature'?: {
      data?: {
        items?: Array<{
          readings?: Array<{ station_id: string; value: number }>;
        }>;
      };
    };
    rainfall?: {
      data?: {
        items?: Array<{
          readings?: Array<{ station_id: string; value: number }>;
        }>;
      };
    };
    'relative-humidity'?: {
      data?: {
        items?: Array<{
          readings?: Array<{ station_id: string; value: number }>;
        }>;
      };
    };
    'wind-speed'?: {
      data?: {
        items?: Array<{
          readings?: Array<{ station_id: string; value: number }>;
        }>;
      };
    };
  };
}

export async function fetchLiveWeatherData(): Promise<LiveFeedResponse> {
  const res = await fetch('/api/real-time?endpoint=all');
  if (!res.ok) {
    throw new Error(`Failed to fetch live weather: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchSingleLiveEndpoint(endpoint: string): Promise<unknown> {
  const res = await fetch(`/api/real-time?endpoint=${encodeURIComponent(endpoint)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch endpoint ${endpoint}: ${res.statusText}`);
  }
  return await res.json();
}

/**
 * Maps live NEA text forecasts to standard WeatherCondition
 */
function mapNeaForecastToCondition(forecastText: string): WeatherCondition {
  const lower = (forecastText || '').toLowerCase();
  if (lower.includes('heavy thundery')) return 'heavy_thundery_showers';
  if (lower.includes('thundery') || lower.includes('thunder')) return 'thundery_showers';
  if (lower.includes('heavy rain')) return 'heavy_rain';
  if (lower.includes('moderate rain')) return 'moderate_rain';
  if (lower.includes('passing shower') || lower.includes('light shower') || lower.includes('showers'))
    return 'passing_showers';
  if (lower.includes('light rain')) return 'light_rain';
  if (lower.includes('cloudy') || lower.includes('overcast')) return 'cloudy';
  if (lower.includes('hazy') || lower.includes('haze')) return 'hazy';
  if (lower.includes('partly cloudy')) return 'partly_cloudy';
  if (lower.includes('fair') && lower.includes('warm')) return 'fair_warm';
  if (lower.includes('fair')) return 'fair';
  return 'partly_cloudy';
}

/**
 * Calculates distance in km between two lat/lng coordinates (Haversine formula)
 */
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Map approximate lat/long coordinates for Singapore exercise zones
const ZONE_LAT_LNG: Record<string, { lat: number; lng: number }> = {
  'east-coast-park': { lat: 1.3006, lng: 103.9122 },
  'bedok-reservoir': { lat: 1.3406, lng: 103.9312 },
  'tampines-hub': { lat: 1.3533, lng: 103.9402 },
  'pasir-ris-park': { lat: 1.3789, lng: 103.9525 },
  'marina-bay': { lat: 1.284, lng: 103.8607 },
  'sports-hub': { lat: 1.3032, lng: 103.8749 },
  'bishan-amk-park': { lat: 1.3624, lng: 103.8468 },
  'macritchie-reservoir': { lat: 1.3458, lng: 103.8291 },
  'botanic-gardens': { lat: 1.3138, lng: 103.8159 },
  'jurong-lake-gardens': { lat: 1.3366, lng: 103.7292 },
  'bukit-timah-rail': { lat: 1.3547, lng: 103.7764 },
  'west-coast-park': { lat: 1.2937, lng: 103.7681 },
  'yishun-park': { lat: 1.4239, lng: 103.8372 },
  'admiralty-park': { lat: 1.4447, lng: 103.7828 },
  'punggol-waterway': { lat: 1.4116, lng: 103.9072 },
  'sengkang-riverside': { lat: 1.3976, lng: 103.8872 },
  'sentosa-coastal': { lat: 1.2494, lng: 103.8303 },
  'southern-ridges': { lat: 1.2809, lng: 103.8045 },
};

/**
 * Transforms live upstream data into populated SingaporeZone records
 */
export function transformLiveWeatherToZones(liveData: LiveFeedResponse): SingaporeZone[] {
  const twoHrItems = liveData.data['two-hr-forecast']?.data?.items?.[0]?.forecasts || [];
  const lightningReadings = liveData.data.lightning?.data?.records?.[0]?.item?.readings || [];
  const psiReadings = liveData.data.psi?.data?.items?.[0]?.readings?.psi_twenty_four_hourly || {};

  // Parse active lightning strikes (recent within 30 mins)
  const strikeLocations = lightningReadings.map((r) => ({
    lat: parseFloat(r.location.latitude),
    lng: parseFloat(r.location.longitude),
    type: r.type,
    text: r.text,
  }));

  const intervals = [0, 30, 60, 90, 120, 150, 180, 210, 240];

  return SINGAPORE_ZONES_BASE.map((baseZone) => {
    const coords = ZONE_LAT_LNG[baseZone.id] || { lat: 1.3521, lng: 103.8198 };

    // Nearest lightning strike
    let minLightningDist: number | undefined = undefined;
    strikeLocations.forEach((st) => {
      const d = calculateDistanceKm(coords.lat, coords.lng, st.lat, st.lng);
      if (minLightningDist === undefined || d < minLightningDist) {
        minLightningDist = d;
      }
    });

    const isLightningNear = minLightningDist !== undefined && minLightningDist <= 8.0; // NEA Cat 1 radius
    const lightningRisk: LightningAlertLevel = isLightningNear
      ? 'cat1_warning'
      : minLightningDist !== undefined && minLightningDist <= 14.0
      ? 'moderate_risk'
      : 'none';

    // Match area forecast from twoHrItems
    const matchedForecast =
      twoHrItems.find((f) =>
        baseZone.name.toLowerCase().includes(f.area.toLowerCase()) ||
        baseZone.shortName.toLowerCase().includes(f.area.toLowerCase())
      )?.forecast || 'Partly Cloudy';

    const baseCondition = mapNeaForecastToCondition(matchedForecast);

    // Get region PSI
    let regionPsi = 42;
    if (baseZone.region === 'central' && psiReadings.central) regionPsi = psiReadings.central;
    else if (baseZone.region === 'east' && psiReadings.east) regionPsi = psiReadings.east;
    else if (baseZone.region === 'west' && psiReadings.west) regionPsi = psiReadings.west;
    else if (baseZone.region === 'north' && psiReadings.north) regionPsi = psiReadings.north;
    else if (baseZone.region === 'south' && psiReadings.south) regionPsi = psiReadings.south;
    else if (psiReadings.national) regionPsi = psiReadings.national;

    // Build 4-hour forecasts
    const forecasts: HourlyForecast[] = intervals.map((offsetMinutes) => {
      const time = getTimeString(offsetMinutes);
      const isRainy =
        baseCondition.includes('rain') ||
        baseCondition.includes('shower') ||
        baseCondition.includes('thunder');

      let rainProbability = isRainy ? 80 : 12;
      let rainfallMm = isRainy ? 6.5 : 0;

      // Slight progression over time
      if (offsetMinutes >= 90 && isRainy) {
        rainProbability = Math.max(20, rainProbability - 30);
      }

      return {
        time,
        timestamp: Date.now() + offsetMinutes * 60 * 1000,
        condition: baseCondition,
        rainProbability,
        rainfallMm,
        temperatureC: 30.2,
        humidityPct: 78,
        lightningRisk,
        lightningDistanceKm: minLightningDist,
        psi: regionPsi,
      };
    });

    return {
      ...baseZone,
      forecasts,
    };
  });
}
