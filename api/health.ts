import { Request, Response } from 'express';

const UPSTREAM_ENDPOINTS = [
  'two-hr-forecast',
  'twenty-four-hr-forecast',
  'four-day-outlook',
  'air-temperature',
  'rainfall',
  'psi',
  'pm25',
  'uv',
  'relative-humidity',
  'wind-speed',
  'lightning',
];

/**
 * Health check handler for the Singapore Weather & Environment serverless API
 */
export default async function healthHandler(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  let upstreamReachable = false;
  let upstreamLatencyMs = 0;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const testRes = await fetch(
      'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    upstreamLatencyMs = Date.now() - startTime;
    upstreamReachable = testRes.ok;
  } catch {
    upstreamReachable = false;
    upstreamLatencyMs = Date.now() - startTime;
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'ok',
    service: 'SG Exercise Planner Live Weather Gateway',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    upstream: {
      host: 'api-open.data.gov.sg',
      version: 'v2',
      reachable: upstreamReachable,
      latencyMs: upstreamLatencyMs,
    },
    supportedEndpoints: UPSTREAM_ENDPOINTS.map((id) => `/api/real-time?endpoint=${id}`),
    bundleEndpoint: '/api/real-time?endpoint=all',
  });
}
