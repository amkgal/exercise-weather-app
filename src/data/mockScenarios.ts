import { WeatherScenario } from '../types/planner';

export const WEATHER_SCENARIOS: WeatherScenario[] = [
  {
    id: 'live_nea_feed',
    label: '🟢 Live Real-Time Feed (data.gov.sg)',
    description: 'Pulls live data from NEA 2-hour nowcast, real-time lightning sensor readings, and 24-hr PSI.',
    scenarioNotes: 'Connected live to the serverless /api/real-time proxy endpoints.',
  },
  {
    id: 'afternoon_thunderstorms',
    label: 'Afternoon Thundery Showers (West & North)',
    description: 'Heavy showers & NEA Cat 1 Lightning alert in West/North; East & Central coastal areas remain clear.',
    scenarioNotes: 'Typical tropical convective rain. Demonstrates how the planner safely routes outdoor workouts away from Jurong/Bukit Timah to East Coast Park or indoor hubs.',
  },
  {
    id: 'islandwide_clear',
    label: 'Islandwide Clear & Sunny Morning',
    description: 'Dry conditions islandwide, light breeze, healthy PSI (35-45). All outdoor zones optimal.',
    scenarioNotes: 'Ideal conditions across Singapore. Both outdoor and indoor options fully green and recommended.',
  },
  {
    id: 'east_coast_lightning',
    label: 'East Coast Lightning Alert (Cat 1)',
    description: 'NEA Lightning Warning active along East Coast Park & Bedok; West & Central remain safe.',
    scenarioNotes: 'Tests lightning safety enforcement: outdoor activities in ECP are blocked with red Cat 1 alert, while Jurong and MacRitchie are safe.',
  },
  {
    id: 'moderate_haze_event',
    label: 'Elevated PSI Haze Event (Unhealthy Air)',
    description: 'PSI spikes to 115–130 in Central & South. Outdoor exertion discouraged; indoor venues highlighted.',
    scenarioNotes: 'Demonstrates the PSI safety filter: outdoor zones show air quality warnings, while indoor air-conditioned gyms remain 100% safe.',
  },
  {
    id: 'passing_showers_central',
    label: 'Passing Showers in Central Catchment',
    description: 'Light passing rain over MacRitchie and Bishan; coastal parks (ECP, Sentosa, Pasir Ris) clear.',
    scenarioNotes: 'Demonstrates duration-based time windows where short dry windows allow planning.',
  },
];
