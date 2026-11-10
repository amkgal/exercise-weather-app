import React from 'react';
import {
  ActivityType,
  Activity,
  ZoneSuitability,
} from '../types/planner';
import {
  ShieldCheck,
  CloudLightning,
  Sun,
  Building2,
  Clock,
  Wind,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
} from 'lucide-react';

interface WeatherSummaryBannerProps {
  activityType: ActivityType;
  activity: Activity;
  durationMinutes: number;
  safeCount: number;
  totalCount: number;
  suitabilities: ZoneSuitability[];
  startTimeFormatted: string;
  endTimeFormatted: string;
  onScrollToRecommendations: () => void;
}

export const WeatherSummaryBanner: React.FC<WeatherSummaryBannerProps> = ({
  activityType,
  activity,
  durationMinutes,
  safeCount,
  totalCount,
  suitabilities,
  startTimeFormatted,
  endTimeFormatted,
  onScrollToRecommendations,
}) => {
  const activeLightningCount = suitabilities.filter((s) => s.lightningAlertActive).length;
  const isAllOutdoorSafe = safeCount === totalCount;
  const hasSevereWarnings = activeLightningCount > 0;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl text-white p-6 sm:p-7 shadow-lg mb-8 border border-slate-700/80">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Main Briefing */}
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
            <span
              className={`px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider text-[11px] ${
                activityType === 'outdoor'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              }`}
            >
              {activityType.toUpperCase()} MODE
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300 font-medium">
              Target: {activity.name}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-400 font-mono">
              {durationMinutes} Mins ({startTimeFormatted} – {endTimeFormatted})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {activityType === 'outdoor' ? (
              safeCount > 0 ? (
                <>
                  Found <span className="text-emerald-400">{safeCount} Safe Locations</span> with No Rain & Zero Lightning
                </>
              ) : (
                <>
                  Severe Weather Islandwide: Indoor Alternatives Advised
                </>
              )
            ) : (
              <>
                All <span className="text-sky-400">{totalCount} Singapore Zones</span> Suitable for Indoor Session
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {activityType === 'outdoor' ? (
              <>
                NEA weather forecasts, lightning sensor network, and PSI air quality checked across the full {durationMinutes}-minute exercise duration. Areas with expected showers or lightning risk are automatically flagged.
              </>
            ) : (
              <>
                Indoor workouts are fully protected from tropical downpours and lightning warnings. You can proceed at any indoor sports hall, ActiveSG gym, or climbing facility islandwide.
              </>
            )}
          </p>
        </div>

        {/* Status Metrics Strip */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
          {/* Safe Zones KPI */}
          <div className="flex-1 sm:flex-initial bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 min-w-[130px]">
            <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safe Zones</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {safeCount} <span className="text-xs font-normal text-slate-400">/ {totalCount}</span>
            </div>
          </div>

          {/* Lightning Status KPI */}
          <div className="flex-1 sm:flex-initial bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 min-w-[130px]">
            <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
              <CloudLightning className="w-3.5 h-3.5 text-rose-400" />
              <span>Lightning Alert</span>
            </div>
            <div
              className={`text-sm font-bold font-mono mt-1 ${
                activeLightningCount > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {activeLightningCount > 0
                ? `${activeLightningCount} Areas Alert`
                : 'All Clear'}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onScrollToRecommendations}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shrink-0 whitespace-nowrap"
          >
            <span>View Safe Areas</span>
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
