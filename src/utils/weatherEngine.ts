import {
  Activity,
  ActivityType,
  HourlyForecast,
  LightningAlertLevel,
  SingaporeZone,
  WeatherCondition,
  WeatherScenarioId,
  ZoneSuitability,
} from '../types/planner';
import { SINGAPORE_ZONES_BASE } from '../data/singaporeZones';

/**
 * Format minutes offset from current time into "HH:mm" display string
 */
export function getTimeString(minutesOffset: number = 0): string {
  const base = new Date();
  base.setMinutes(base.getMinutes() + minutesOffset);
  const hours = base.getHours().toString().padStart(2, '0');
  const minutes = Math.floor(base.getMinutes() / 15) * 15; // align to 15-min intervals
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

export function formatPsiBand(psi: number): 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' {
  if (psi <= 50) return 'Good';
  if (psi <= 100) return 'Moderate';
  if (psi <= 200) return 'Unhealthy';
  if (psi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Generates synthetic realistic 4-hour forecasts for a zone based on the active scenario.
 */
export function generateZoneForecasts(
  zoneId: string,
  region: string,
  scenario: WeatherScenarioId
): HourlyForecast[] {
  const intervals = [0, 30, 60, 90, 120, 150, 180, 210, 240];
  const now = Date.now();

  return intervals.map((offsetMinutes) => {
    const timestamp = now + offsetMinutes * 60 * 1000;
    const time = getTimeString(offsetMinutes);

    let condition: WeatherCondition = 'partly_cloudy';
    let rainProbability = 10;
    let rainfallMm = 0;
    let temperatureC = 30.5;
    let humidityPct = 76;
    let lightningRisk: LightningAlertLevel = 'none';
    let lightningDistanceKm: number | undefined = undefined;
    let psi = 38;

    switch (scenario) {
      case 'live_nea_feed':
      case 'islandwide_clear': {
        condition = offsetMinutes < 90 ? 'fair' : 'partly_cloudy';
        rainProbability = 5;
        rainfallMm = 0;
        temperatureC = 29.5 + (offsetMinutes / 60) * 0.8;
        humidityPct = 72;
        lightningRisk = 'none';
        psi = 32 + (zoneId.charCodeAt(0) % 10);
        break;
      }

      case 'afternoon_thunderstorms': {
        // Convection hits West and North regions hard
        if (region === 'west' || region === 'north') {
          if (offsetMinutes < 30) {
            condition = 'cloudy';
            rainProbability = 55;
            temperatureC = 30.0;
            humidityPct = 85;
            lightningRisk = 'moderate_risk';
            lightningDistanceKm = 7.5;
          } else {
            condition = 'heavy_thundery_showers';
            rainProbability = 95;
            rainfallMm = 28.5;
            temperatureC = 26.5;
            humidityPct = 96;
            lightningRisk = 'cat1_warning';
            lightningDistanceKm = 2.1;
          }
          psi = 40;
        } else if (region === 'central' && (zoneId === 'macritchie-reservoir' || zoneId === 'bishan-amk-park')) {
          // Central catchment gets edge showers after 60 mins
          if (offsetMinutes >= 60) {
            condition = 'thundery_showers';
            rainProbability = 75;
            rainfallMm = 12.0;
            temperatureC = 27.8;
            humidityPct = 92;
            lightningRisk = 'cat1_warning';
            lightningDistanceKm = 4.3;
          } else {
            condition = 'cloudy';
            rainProbability = 40;
            lightningRisk = 'moderate_risk';
            lightningDistanceKm = 8.0;
          }
          psi = 42;
        } else {
          // East and South remain dry and safe!
          condition = 'partly_cloudy';
          rainProbability = 10;
          rainfallMm = 0;
          temperatureC = 31.0;
          humidityPct = 75;
          lightningRisk = 'none';
          psi = 36;
        }
        break;
      }

      case 'east_coast_lightning': {
        // Sumatra squall remnant over East Coast & Marina Bay
        if (region === 'east' || zoneId === 'marina-bay' || zoneId === 'sports-hub') {
          condition = 'thundery_showers';
          rainProbability = 85;
          rainfallMm = 18.2;
          temperatureC = 27.2;
          humidityPct = 94;
          lightningRisk = 'cat1_warning';
          lightningDistanceKm = 3.4;
          psi = 45;
        } else {
          // West, North, and South are clear
          condition = 'fair';
          rainProbability = 8;
          rainfallMm = 0;
          temperatureC = 31.2;
          humidityPct = 70;
          lightningRisk = 'none';
          psi = 39;
        }
        break;
      }

      case 'moderate_haze_event': {
        // Islandwide haze with South & Central most affected
        condition = 'hazy';
        rainProbability = 5;
        rainfallMm = 0;
        temperatureC = 32.5;
        humidityPct = 68;
        lightningRisk = 'none';

        if (region === 'south' || region === 'central') {
          psi = 124 + (offsetMinutes / 60) * 3; // Unhealthy: 124 - 136
        } else {
          psi = 112 + (offsetMinutes / 60) * 2; // Unhealthy: 112 - 120
        }
        break;
      }

      case 'passing_showers_central': {
        if (region === 'central') {
          if (offsetMinutes >= 30 && offsetMinutes <= 90) {
            condition = 'passing_showers';
            rainProbability = 70;
            rainfallMm = 4.2;
            temperatureC = 28.5;
            humidityPct = 88;
            lightningRisk = 'none';
          } else {
            condition = 'cloudy';
            rainProbability = 25;
            temperatureC = 29.8;
            humidityPct = 80;
            lightningRisk = 'none';
          }
          psi = 40;
        } else {
          condition = 'partly_cloudy';
          rainProbability = 10;
          rainfallMm = 0;
          temperatureC = 30.8;
          humidityPct = 74;
          lightningRisk = 'none';
          psi = 37;
        }
        break;
      }
    }

    return {
      time,
      timestamp,
      condition,
      rainProbability,
      rainfallMm,
      temperatureC: Math.round(temperatureC * 10) / 10,
      humidityPct,
      lightningRisk,
      lightningDistanceKm,
      psi: Math.round(psi),
    };
  });
}

/**
 * Returns populated Singapore zones with current scenario forecasts
 */
export function getSingaporeZonesWithForecasts(scenario: WeatherScenarioId): SingaporeZone[] {
  return SINGAPORE_ZONES_BASE.map((zone) => ({
    ...zone,
    forecasts: generateZoneForecasts(zone.id, zone.region, scenario),
  }));
}

/**
 * Core Exercise Planner Suitability Engine
 * Evaluates whether an activity can be safely performed in a given zone over the requested duration.
 */
export function evaluateZoneSuitability(
  zone: SingaporeZone,
  activityType: ActivityType,
  activity: Activity,
  durationMinutes: number,
  startOffsetMinutes: number = 0
): ZoneSuitability {
  const forecasts = zone.forecasts;
  const startIdx = Math.min(Math.floor(startOffsetMinutes / 30), forecasts.length - 1);
  const numSlices = Math.max(1, Math.ceil(durationMinutes / 30));
  const activeSlices = forecasts.slice(startIdx, Math.min(startIdx + numSlices, forecasts.length));

  if (activeSlices.length === 0) {
    activeSlices.push(forecasts[0]);
  }

  const startTimeStr = activeSlices[0].time;
  const endTimeStr = getTimeString(startOffsetMinutes + durationMinutes);

  // Maximum values during the exercise duration
  let maxRainProb = 0;
  let maxRainfall = 0;
  let hasLightningWarning = false;
  let minLightningDist: number | undefined = undefined;
  let maxPsi = 0;
  let tempSum = 0;

  activeSlices.forEach((slice) => {
    if (slice.rainProbability > maxRainProb) maxRainProb = slice.rainProbability;
    if (slice.rainfallMm > maxRainfall) maxRainfall = slice.rainfallMm;
    if (slice.lightningRisk === 'cat1_warning' || slice.lightningRisk === 'moderate_risk') {
      hasLightningWarning = true;
      if (slice.lightningDistanceKm !== undefined) {
        if (minLightningDist === undefined || slice.lightningDistanceKm < minLightningDist) {
          minLightningDist = slice.lightningDistanceKm;
        }
      }
    }
    if (slice.psi > maxPsi) maxPsi = slice.psi;
    tempSum += slice.temperatureC;
  });

  const avgTemp = Math.round((tempSum / activeSlices.length) * 10) / 10;
  const psiBand = formatPsiBand(maxPsi);
  const isPsiHealthy = maxPsi <= 100; // Good or Moderate is officially Healthy under NEA MOH guidelines

  const rainExpected =
    maxRainProb >= 35 ||
    maxRainfall > 0.5 ||
    activeSlices.some(
      (s) =>
        s.condition === 'passing_showers' ||
        s.condition === 'light_rain' ||
        s.condition === 'moderate_rain' ||
        s.condition === 'heavy_rain' ||
        s.condition === 'thundery_showers' ||
        s.condition === 'heavy_thundery_showers'
    );

  const lightningAlertActive = hasLightningWarning;

  // RULE ENGINE
  if (activityType === 'indoor') {
    // "If the activity is indoor, then any location is ok."
    const availableFacilities = zone.indoorFacilities.map((f) => f.name).join(', ');
    return {
      zoneId: zone.id,
      zone,
      isSafe: true,
      status: 'optimal',
      matchScore: 98,
      rainExpected: false, // Not applicable for indoor
      maxRainProb,
      lightningAlertActive: false,
      lightningNearestDistanceKm: minLightningDist,
      psiValue: maxPsi,
      isPsiHealthy: true, // Air-conditioned indoor filtration
      psiBand,
      reasons: [
        'Indoor activity is completely weather-proof and rain/lightning-independent.',
        zone.indoorFacilities.length > 0
          ? `Fully equipped indoor facilities available on site: ${availableFacilities}.`
          : 'Air-conditioned indoor training facility with sheltered parking and amenities.',
      ],
      alerts:
        rainExpected || lightningAlertActive
          ? ['Outdoor wet weather in this vicinity. Bring an umbrella for transit to the indoor facility.']
          : [],
      recommendationNote: `Ideal indoor workout location. Completely shielded from outdoor heat, rain, and lightning.`,
      timeWindowSummary: {
        start: startTimeStr,
        end: endTimeStr,
        conditionSummary: activeSlices[0].condition,
        avgTemp: 23.5, // Indoor AC climate
      },
    };
  }

  // OUTDOOR ACTIVITY EVALUATION:
  // "for outdoor activities, the planner will show areas where rain and lightning is not expected in the exercise duration, and healthy PSI rating."
  const reasons: string[] = [];
  const alerts: string[] = [];

  let isSafe = true;
  let status: 'optimal' | 'acceptable' | 'warning' | 'unsafe' = 'optimal';
  let matchScore = 95;

  if (lightningAlertActive) {
    isSafe = false;
    status = 'unsafe';
    matchScore -= 55;
    const distText = minLightningDist ? ` (lightning detected within ${minLightningDist}km)` : '';
    alerts.push(`NEA Category 1 Lightning Warning active${distText}. Outdoor activities prohibited!`);
    reasons.push(`Cease all open-air activities immediately under Singapore NEA lightning safety protocol.`);
  }

  if (rainExpected) {
    isSafe = false;
    if (status !== 'unsafe') status = 'warning';
    matchScore -= 40;
    alerts.push(`Precipitation expected during your ${durationMinutes}-min workout (rain risk: ${maxRainProb}%).`);
    reasons.push(`Wet surfaces increase slipping hazards for ${activity.name.toLowerCase()}.`);
  }

  if (!isPsiHealthy) {
    isSafe = false;
    status = 'unsafe';
    matchScore -= 45;
    alerts.push(`Unhealthy air quality (PSI ${maxPsi} · ${psiBand}). Exceeds healthy threshold.`);
    reasons.push(`MOH health advisory warns against prolonged or strenuous outdoor physical exertion.`);
  }

  // If completely safe
  if (isSafe) {
    if (maxRainProb > 15) {
      status = 'acceptable';
      matchScore = 86;
      reasons.push(`Low rain probability (${maxRainProb}%). Safe for outdoor training with passing cloud cover.`);
    } else {
      status = 'optimal';
      matchScore = 96;
      reasons.push(`Zero rain predicted for the entire ${durationMinutes}-minute window (${startTimeStr} – ${endTimeStr}).`);
    }

    reasons.push(`Lightning alert is All Clear with no active strikes detected in the sector.`);
    reasons.push(`Air quality is Healthy (PSI ${maxPsi} · ${psiBand}), well within safety limits.`);

    if (zone.waterPointsAvailable) {
      reasons.push(`Drink water regularly; public hydration stations available.`);
    }
  }

  let recommendationNote = '';
  if (isSafe) {
    recommendationNote = `Highly recommended for outdoor ${activity.name.toLowerCase()}. Clear skies and safe conditions verified for your full ${durationMinutes} minutes.`;
  } else if (lightningAlertActive) {
    recommendationNote = `DANGER: Lightning warning active. Shift to an indoor sports hall or postpone outdoor session.`;
  } else if (!isPsiHealthy) {
    recommendationNote = `Unhealthy PSI level detected. Transfer to an indoor air-conditioned gym or workout studio.`;
  } else {
    recommendationNote = `Rain predicted during the planned duration. Switch to a sheltered facility or delay start.`;
  }

  return {
    zoneId: zone.id,
    zone,
    isSafe,
    status,
    matchScore: Math.max(10, Math.min(99, matchScore)),
    rainExpected,
    maxRainProb,
    lightningAlertActive,
    lightningNearestDistanceKm: minLightningDist,
    psiValue: maxPsi,
    isPsiHealthy,
    psiBand,
    reasons,
    alerts,
    recommendationNote,
    timeWindowSummary: {
      start: startTimeStr,
      end: endTimeStr,
      conditionSummary: activeSlices[0].condition,
      avgTemp,
    },
  };
}

export function formatConditionLabel(condition: WeatherCondition): string {
  switch (condition) {
    case 'fair':
      return 'Fair & Clear';
    case 'fair_warm':
      return 'Fair & Warm';
    case 'partly_cloudy':
      return 'Partly Cloudy';
    case 'cloudy':
      return 'Overcast / Cloudy';
    case 'hazy':
      return 'Hazy';
    case 'passing_showers':
      return 'Passing Showers';
    case 'light_rain':
      return 'Light Rain';
    case 'moderate_rain':
      return 'Moderate Rain';
    case 'heavy_rain':
      return 'Heavy Rain';
    case 'thundery_showers':
      return 'Thundery Showers';
    case 'heavy_thundery_showers':
      return 'Heavy Thundery Showers';
    default:
      return 'Partly Cloudy';
  }
}
