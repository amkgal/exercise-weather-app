# Exercise Weather Planner - Project Prompts

This document collates all user prompts and requirement specifications across the build iterations of the **SG Exercise Weather Planner** application.

---

## Prompt 1: Initial Application Build (Frontend & Safety Logic)

```text
build an exercise planner based on weather forecast in singapore and lightning alert in singapore. the planner will allow users to select indoor or outdoor activities and duration. for outdoor activities, the planner will show areas where rain and lightning is not expected  in the exercise duration, and healthy PSI rating. If the activity is indoor, then any location is ok. build just the front end for now. i will integrate te backend connection later.
```

### Objectives Implemented:
- Outdoor vs Indoor activity selection with workout types (Running, Road Cycling, Hiking, Tennis, Swimming, Gym, Badminton, Climbing, etc.).
- Workout duration selector (30, 45, 60, 90, 120 minutes) and start time window.
- Safety evaluation engine:
  - **Outdoor**: Filters for areas with no expected rain, no NEA Category 1 lightning alerts, and healthy air quality (PSI $\le 100$).
  - **Indoor**: All locations across Singapore certified suitable; displays on-site indoor facilities and sheltered alternatives.
- Interactive Singapore vector radar map with weather overlays, lightning alert danger radii, and 18 exercise hotspots.
- 4-hour micro-forecast timelines, workout itinerary export, and weather scenario simulation.

---

## Prompt 2: Serverless Live Weather Gateway & `/api` Endpoints

```text
1. add a serverless connection that pulls live data from LTA's datamall using the following endpoints: 

# # Weather & environment (v2 host, wrapped responses) - all keyless, all live:
https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast
https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast
https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook
https://api-open.data.gov.sg/v2/real-time/api/air-temperature
https://api-open.data.gov.sg/v2/real-time/api/rainfall
https://api-open.data.gov.sg/v2/real-time/api/psi
https://api-open.data.gov.sg/v2/real-time/api/pm25
https://api-open.data.gov.sg/v2/real-time/api/uv
https://api-open.data.gov.sg/v2/real-time/api/relative-humidity
https://api-open.data.gov.sg/v2/real-time/api/wind-speed
https://api-open.data.gov.sg/v2/real-time/api/weather?api=lightning

2. store this in /api folder (at project root level)
- include a /health.ts and /real-time.ts
```

### Objectives Implemented:
- Created root-level `/api` folder with serverless proxy endpoints.
- `/api/health.ts`: Upstream status, uptime, latency monitoring, and endpoint catalog.
- `/api/real-time.ts`: Live data gateway with 30s in-memory caching and CORS support for all 11 endpoints, plus an aggregated `/api/real-time?endpoint=all` bundle.
- Full-stack Express integration via `server.ts` running Vite middleware in dev and static serving in prod.
- Frontend Live API Explorer modal allowing direct inspection of all 11 raw JSON feeds in-browser.

---

## Prompt 3: Remote Repository Synchronization

```text
git push https://<GITHUB_TOKEN>@github.com/amkgal/exercise-weather-app.git
```

### Objectives Implemented:
- Initialized git repository, added safe directory configuration, and committed all source files.
- Pushed the complete application and `/api` directory to `https://github.com/amkgal/exercise-weather-app.git` on branch `main`.

---

## Prompt 4: Prompt Documentation Collation

```text
collate all the prompts into filename prompt.md in the /api folder.
```

### Objectives Implemented:
- Created `/api/prompt.md` documenting the chronological prompts, architecture choices, and features delivered.
