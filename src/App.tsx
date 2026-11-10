import React, { useState, useMemo } from 'react';
import {
  ActivityType,
  SingaporeRegion,
  WeatherScenarioId,
} from './types/planner';
import { ACTIVITIES } from './data/activities';
import {
  getSingaporeZonesWithForecasts,
  evaluateZoneSuitability,
  getTimeString,
} from './utils/weatherEngine';
import { Navbar } from './components/Navbar';
import { NeaAlertTicker } from './components/NeaAlertTicker';
import { WeatherSummaryBanner } from './components/WeatherSummaryBanner';
import { PlannerControls } from './components/PlannerControls';
import { SingaporeMap } from './components/SingaporeMap';
import { ZoneCard } from './components/ZoneCard';
import { WorkoutPlanModal } from './components/WorkoutPlanModal';
import { ScenarioSwitcher } from './components/ScenarioSwitcher';
import { NeaGuidelinesModal } from './components/NeaGuidelinesModal';
import { ApiExplorerModal } from './components/ApiExplorerModal';
import { fetchLiveWeatherData, transformLiveWeatherToZones } from './services/liveWeatherService';
import {
  ShieldCheck,
  AlertTriangle,
  Building2,
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function App() {
  // 1. Planner State
  const [activeScenario, setActiveScenario] = useState<WeatherScenarioId>('afternoon_thunderstorms');
  const [activityType, setActivityType] = useState<ActivityType>('outdoor');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('outdoor-running');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [startOffsetMinutes, setStartOffsetMinutes] = useState<number>(0);
  const [selectedRegion, setSelectedRegion] = useState<SingaporeRegion | 'all'>('all');
  const [onlySafeZones, setOnlySafeZones] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<string | undefined>('east-coast-park');

  // Modals state
  const [isWorkoutPlanOpen, setIsWorkoutPlanOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isNeaGuidelinesOpen, setIsNeaGuidelinesOpen] = useState(false);
  const [isApiExplorerOpen, setIsApiExplorerOpen] = useState(false);
  const [liveZonesData, setLiveZonesData] = useState<any[] | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);

  // Fetch live weather data when activeScenario is live_nea_feed
  React.useEffect(() => {
    if (activeScenario === 'live_nea_feed') {
      setIsLiveLoading(true);
      fetchLiveWeatherData()
        .then((data) => {
          const transformed = transformLiveWeatherToZones(data);
          setLiveZonesData(transformed);
        })
        .catch((err) => {
          console.error('Failed to load live weather:', err);
        })
        .finally(() => {
          setIsLiveLoading(false);
        });
    }
  }, [activeScenario]);

  // Active activity object
  const activeActivity = useMemo(() => {
    return (
      ACTIVITIES.find((a) => a.id === selectedActivityId) ||
      ACTIVITIES.find((a) => a.type === activityType) ||
      ACTIVITIES[0]
    );
  }, [selectedActivityId, activityType]);

  // Formatted start and end times for the session window
  const startTimeFormatted = useMemo(() => getTimeString(startOffsetMinutes), [startOffsetMinutes]);
  const endTimeFormatted = useMemo(
    () => getTimeString(startOffsetMinutes + durationMinutes),
    [startOffsetMinutes, durationMinutes]
  );

  // 2. Fetch and evaluate Singapore zones
  const zonesWithForecasts = useMemo(() => {
    if (activeScenario === 'live_nea_feed' && liveZonesData && liveZonesData.length > 0) {
      return liveZonesData;
    }
    return getSingaporeZonesWithForecasts(activeScenario);
  }, [activeScenario, liveZonesData]);

  // Evaluate all zones
  const allSuitabilities = useMemo(() => {
    return zonesWithForecasts.map((zone) =>
      evaluateZoneSuitability(zone, activityType, activeActivity, durationMinutes, startOffsetMinutes)
    );
  }, [zonesWithForecasts, activityType, activeActivity, durationMinutes, startOffsetMinutes]);

  // Telemetry metrics
  const totalActiveLightningAlerts = useMemo(() => {
    return allSuitabilities.filter((s) => s.lightningAlertActive).length;
  }, [allSuitabilities]);

  const overallAvgPsi = useMemo(() => {
    if (allSuitabilities.length === 0) return 38;
    const sum = allSuitabilities.reduce((acc, s) => acc + s.psiValue, 0);
    return Math.round(sum / allSuitabilities.length);
  }, [allSuitabilities]);

  const safeSuitabilities = useMemo(() => {
    return allSuitabilities.filter((s) => s.isSafe);
  }, [allSuitabilities]);

  const unsafeSuitabilities = useMemo(() => {
    return allSuitabilities.filter((s) => !s.isSafe);
  }, [allSuitabilities]);

  // Filtered list based on region, search, and "safe only" toggle
  const displayedSuitabilities = useMemo(() => {
    return allSuitabilities.filter((s) => {
      // Region filter
      if (selectedRegion !== 'all' && s.zone.region !== selectedRegion) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.zone.name.toLowerCase().includes(q);
        const matchesRegion = s.zone.region.toLowerCase().includes(q);
        const matchesFacilities = s.zone.indoorFacilities.some((f) => f.name.toLowerCase().includes(q));
        if (!matchesName && !matchesRegion && !matchesFacilities) return false;
      }
      // Safe only filter (only applies to outdoor activities)
      if (activityType === 'outdoor' && onlySafeZones && !s.isSafe) {
        return false;
      }
      return true;
    });
  }, [allSuitabilities, selectedRegion, searchQuery, activityType, onlySafeZones]);

  // Selected zone suitability object
  const activeSelectedSuitability = useMemo(() => {
    return (
      allSuitabilities.find((s) => s.zoneId === selectedZoneId) ||
      allSuitabilities.find((s) => s.isSafe) ||
      allSuitabilities[0]
    );
  }, [allSuitabilities, selectedZoneId]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Official NEA Meteorological Feed Ticker */}
      <NeaAlertTicker
        currentScenario={activeScenario}
        totalActiveLightningAlerts={totalActiveLightningAlerts}
        overallPsi={overallAvgPsi}
        onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
        onOpenApiExplorer={() => setIsApiExplorerOpen(true)}
        isLiveFeedActive={activeScenario === 'live_nea_feed'}
      />

      {/* 2. Top Bar Contract Navbar */}
      <Navbar
        onScrollToSection={scrollToSection}
        onOpenQuickPlanner={() => setIsWorkoutPlanOpen(true)}
        onOpenApiExplorer={() => setIsApiExplorerOpen(true)}
      />

      {/* 3. Main Workspace Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Weather Briefing & KPI Banner */}
        <WeatherSummaryBanner
          activityType={activityType}
          activity={activeActivity}
          durationMinutes={durationMinutes}
          safeCount={safeSuitabilities.length}
          totalCount={allSuitabilities.length}
          suitabilities={allSuitabilities}
          startTimeFormatted={startTimeFormatted}
          endTimeFormatted={endTimeFormatted}
          onScrollToRecommendations={() => scrollToSection('recommended-zones')}
        />

        {/* Exercise Planner Controls */}
        <PlannerControls
          activityType={activityType}
          onActivityTypeChange={(type) => {
            setActivityType(type);
            // Default onlySafeZones to true for outdoor
            if (type === 'outdoor') setOnlySafeZones(true);
          }}
          selectedActivityId={selectedActivityId}
          onActivityChange={setSelectedActivityId}
          durationMinutes={durationMinutes}
          onDurationChange={setDurationMinutes}
          startOffsetMinutes={startOffsetMinutes}
          onStartOffsetChange={setStartOffsetMinutes}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          onlySafeZones={onlySafeZones}
          onOnlySafeZonesChange={setOnlySafeZones}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          safeCount={safeSuitabilities.length}
          totalCount={allSuitabilities.length}
          startTimeFormatted={startTimeFormatted}
          endTimeFormatted={endTimeFormatted}
        />

        {/* Interactive Singapore Weather Radar & Safe Map */}
        <SingaporeMap
          suitabilities={allSuitabilities}
          selectedZoneId={selectedZoneId}
          onSelectZone={(id) => {
            setSelectedZoneId(id);
            scrollToSection('recommended-zones');
          }}
          activityType={activityType}
          durationMinutes={durationMinutes}
        />

        {/* 4. Recommended Zones Grid Section */}
        <section id="recommended-zones" className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Curated Exercise Zones
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-emerald-700 font-semibold font-mono">
                  {displayedSuitabilities.length} Locations Matched
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {activityType === 'outdoor'
                  ? onlySafeZones
                    ? 'Recommended Safe Outdoor Exercise Zones'
                    : 'Singapore Exercise Zones & Weather Status'
                  : 'All Indoor Sports Facilities & Air-Conditioned Hubs'}
              </h2>
            </div>

            {/* Quick Filter Status */}
            <div className="flex items-center gap-3">
              {activityType === 'outdoor' && !onlySafeZones && (
                <button
                  onClick={() => setOnlySafeZones(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  Filter to Safe Zones Only
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {displayedSuitabilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedSuitabilities.map((s) => (
                <ZoneCard
                  key={s.zoneId}
                  suitability={s}
                  activity={activeActivity}
                  activityType={activityType}
                  durationMinutes={durationMinutes}
                  isSelected={selectedZoneId === s.zoneId}
                  onSelect={() => setSelectedZoneId(s.zoneId)}
                  onOpenWorkoutPlan={() => {
                    setSelectedZoneId(s.zoneId);
                    setIsWorkoutPlanOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">
                No Locations Matched Current Filters
              </h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Try switching off &ldquo;Safe zones only&rdquo;, clearing your search query, or selecting &ldquo;All Regions&rdquo;. Alternatively, switch to Indoor Mode for 100% weather-proof facilities.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setOnlySafeZones(false);
                    setSelectedRegion('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setActivityType('indoor')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                >
                  Switch to Indoor Mode
                </button>
              </div>
            </div>
          )}

          {/* If outdoor and onlySafeZones is active, provide an accordion or callout showing avoided areas */}
          {activityType === 'outdoor' && onlySafeZones && unsafeSuitabilities.length > 0 && (
            <div className="mt-8 p-4 sm:p-5 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>
                    {unsafeSuitabilities.length} Locations Excluded Due to Active Weather Warnings
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1 leading-snug">
                  Areas with expected rainfall, NEA lightning alerts, or unhealthy air quality were filtered to protect your workout safety.
                </p>
              </div>

              <button
                onClick={() => setOnlySafeZones(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors whitespace-nowrap shadow-xs"
              >
                Show All Areas & Warnings
              </button>
            </div>
          )}
        </section>

        {/* 5. NEA Safety Standards Education Section */}
        <section
          id="nea-guidelines"
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-7 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Official Safety Criteria
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                How Outdoor Suitability Is Determined in Singapore
              </h3>
            </div>

            <button
              onClick={() => setIsNeaGuidelinesOpen(true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View Full NEA & MOH Standards</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Rule 1: Rain Nowcast */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Zero Rain Requirement
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates cumulative rain probability (&lt; 35%) and zero precipitation across your exact workout duration ({durationMinutes} mins) using NEA high-resolution Doppler radar.
              </p>
            </div>

            {/* Rule 2: Lightning Cat 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Lightning All Clear Rule
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero lightning strikes detected within 6–8 km. Any Category 1 alert automatically blocks outdoor exercise until 30 minutes after the last detected electrical strike.
              </p>
            </div>

            {/* Rule 3: Healthy PSI */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Healthy Air Quality (PSI &le; 100)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Follows MOH Singapore health advisories: PSI levels between 0–100 (Good or Moderate) are certified safe for open-air exercise. Readings &gt; 100 route exercisers indoors.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Clean, Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">SG Exercise Weather Planner</span>
            <span aria-hidden="true">·</span>
            <span>Frontend Architecture for Singapore NEA & Weather Services</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Data format ready for data.gov.sg & NEA API integration</span>
          </div>
        </div>
      </footer>

      {/* 7. Modals */}
      {isWorkoutPlanOpen && activeSelectedSuitability && (
        <WorkoutPlanModal
          isOpen={isWorkoutPlanOpen}
          onClose={() => setIsWorkoutPlanOpen(false)}
          suitability={activeSelectedSuitability}
          activity={activeActivity}
          activityType={activityType}
          durationMinutes={durationMinutes}
        />
      )}

      {isScenarioModalOpen && (
        <ScenarioSwitcher
          isOpen={isScenarioModalOpen}
          onClose={() => setIsScenarioModalOpen(false)}
          activeScenarioId={activeScenario}
          onSelectScenario={setActiveScenario}
        />
      )}

      {isNeaGuidelinesOpen && (
        <NeaGuidelinesModal
          isOpen={isNeaGuidelinesOpen}
          onClose={() => setIsNeaGuidelinesOpen(false)}
        />
      )}

      {isApiExplorerOpen && (
        <ApiExplorerModal
          isOpen={isApiExplorerOpen}
          onClose={() => setIsApiExplorerOpen(false)}
        />
      )}
    </div>
  );
}
