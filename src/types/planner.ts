export type ActivityType = 'outdoor' | 'indoor';

export type SingaporeRegion = 'central' | 'east' | 'west' | 'north' | 'north-east' | 'south';

export type WeatherCondition =
  | 'fair'
  | 'fair_warm'
  | 'partly_cloudy'
  | 'cloudy'
  | 'hazy'
  | 'passing_showers'
  | 'light_rain'
  | 'moderate_rain'
  | 'heavy_rain'
  | 'thundery_showers'
  | 'heavy_thundery_showers';

export type LightningAlertLevel = 'none' | 'moderate_risk' | 'cat1_warning';

export interface HourlyForecast {
  time: string; // e.g. "09:00", "09:30"
  timestamp: number;
  condition: WeatherCondition;
  rainProbability: number; // 0 - 100%
  rainfallMm: number;
  temperatureC: number;
  humidityPct: number;
  lightningRisk: LightningAlertLevel;
  lightningDistanceKm?: number;
  psi: number; // 0 - 500
}

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  category: string;
  iconName: string;
  intensity: 'low' | 'moderate' | 'high';
  estimatedCalPerHour: number;
  waterRecommendedMlPerHour: number;
  suitableSurfaces: string[];
  indoorBackupTip?: string;
  recommendedGear: string[];
}

export interface ZoneFacility {
  name: string;
  type: 'indoor_gym' | 'swimming_complex' | 'sports_hall' | 'climbing_wall' | 'covered_running_track';
  address: string;
  shelteredFromRain: boolean;
}

export interface SingaporeZone {
  id: string;
  name: string;
  shortName: string;
  region: SingaporeRegion;
  mapCoords: {
    x: number; // percentage in SVG viewBox 0-1000
    y: number; // percentage in SVG viewBox 0-600
  };
  description: string;
  popularOutdoorActivities: string[];
  indoorFacilities: ZoneFacility[];
  hasShelteredSections: boolean;
  waterPointsAvailable: boolean;
  lightingAvailable: boolean;
  forecasts: HourlyForecast[];
}

export interface ZoneSuitability {
  zoneId: string;
  zone: SingaporeZone;
  isSafe: boolean;
  status: 'optimal' | 'acceptable' | 'warning' | 'unsafe';
  matchScore: number; // 0 - 100
  rainExpected: boolean;
  maxRainProb: number;
  lightningAlertActive: boolean;
  lightningNearestDistanceKm?: number;
  psiValue: number;
  isPsiHealthy: boolean;
  psiBand: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  reasons: string[];
  alerts: string[];
  recommendationNote: string;
  timeWindowSummary: {
    start: string;
    end: string;
    conditionSummary: WeatherCondition;
    avgTemp: number;
  };
}

export type WeatherScenarioId =
  | 'live_nea_feed'
  | 'islandwide_clear'
  | 'afternoon_thunderstorms'
  | 'east_coast_lightning'
  | 'moderate_haze_event'
  | 'passing_showers_central';

export interface WeatherScenario {
  id: WeatherScenarioId;
  label: string;
  description: string;
  scenarioNotes: string;
}
