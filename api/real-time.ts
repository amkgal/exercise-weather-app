import { Request, Response } from 'express';

export const DATA_GOV_ENDPOINTS: Record<string, string> = {
  'two-hr-forecast': 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',
  'twenty-four-hr-forecast': 'https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast',
  'four-day-outlook': 'https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook',
  'air-temperature': 'https://api-open.data.gov.sg/v2/real-time/api/air-temperature',
  'rainfall': 'https://api-open.data.gov.sg/v2/real-time/api/rainfall',
  'psi': 'https://api-open.data.gov.sg/v2/real-time/api/psi',
  'pm25': 'https://api-open.data.gov.sg/v2/real-time/api/pm25',
  'uv': 'https://api-open.data.gov.sg/v2/real-time/api/uv',
  'relative-humidity': 'https://api-open.data.gov.sg/v2/real-time/api/relative-humidity',
  'wind-speed': 'https://api-open.data.gov.sg/v2/real-time/api/wind-speed',
  'lightning': 'https://api-open.data.gov.sg/v2/real-time/api/weather?api=lightning',
};

// In-memory cache to prevent spamming upstream rate limits
interface CacheEntry {
  data: unknown;
  cachedAt: number;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds TTL

/**
 * Fetch a single live endpoint from data.gov.sg v2
 */
export async function fetchLiveEndpoint(endpointKey: string): Promise<unknown> {
  const url = DATA_GOV_ENDPOINTS[endpointKey];
  if (!url) {
    throw new Error(`Unknown endpoint key: ${endpointKey}`);
  }

  const cached = memoryCache.get(endpointKey);
  const now = Date.now();
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SG-Exercise-Planner/1.0',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Upstream returned status ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    memoryCache.set(endpointKey, { data: json, cachedAt: now });
    return json;
  } catch (err: unknown) {
    clearTimeout(timeout);
    // If cache exists even if expired, return it as stale fallback
    if (cached) {
      return cached.data;
    }
    throw err;
  }
}

/**
 * Aggregates all core live weather, lightning, and air quality feeds in parallel
 */
export async function fetchAggregatedLiveWeather(): Promise<Record<string, unknown>> {
  const keys = [
    'two-hr-forecast',
    'air-temperature',
    'rainfall',
    'psi',
    'lightning',
    'relative-humidity',
    'wind-speed',
  ];

  const results = await Promise.allSettled(
    keys.map(async (k) => {
      const data = await fetchLiveEndpoint(k);
      return { key: k, data };
    })
  );

  const bundle: Record<string, unknown> = {};
  results.forEach((res, i) => {
    const key = keys[i];
    if (res.status === 'fulfilled') {
      bundle[key] = res.value.data;
    } else {
      bundle[key] = { error: String(res.reason), unavailable: true };
    }
  });

  return bundle;
}

/**
 * Serverless handler for live real-time weather & environment endpoints
 */
export default async function realTimeHandler(req: Request, res: Response): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const endpointParam =
    (req.query.endpoint as string) ||
    (req.query.type as string) ||
    (req.params && req.params.endpoint) ||
    'all';

  try {
    if (endpointParam === 'all' || endpointParam === 'bundle') {
      const bundle = await fetchAggregatedLiveWeather();
      res.status(200).json({
        code: 0,
        source: 'api-open.data.gov.sg/v2',
        timestamp: new Date().toISOString(),
        type: 'aggregated-bundle',
        data: bundle,
      });
      return;
    }

    // Individual endpoint lookup
    if (!DATA_GOV_ENDPOINTS[endpointParam]) {
      res.status(400).json({
        code: 1,
        error: `Invalid endpoint '${endpointParam}'. Valid options: ${Object.keys(
          DATA_GOV_ENDPOINTS
        ).join(', ')}, or 'all'.`,
      });
      return;
    }

    const liveData = await fetchLiveEndpoint(endpointParam);
    res.status(200).json({
      code: 0,
      source: DATA_GOV_ENDPOINTS[endpointParam],
      timestamp: new Date().toISOString(),
      type: endpointParam,
      data: liveData,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(502).json({
      code: 2,
      error: 'Failed to fetch live data from upstream',
      details: errorMessage,
      endpoint: endpointParam,
      timestamp: new Date().toISOString(),
    });
  }
}
