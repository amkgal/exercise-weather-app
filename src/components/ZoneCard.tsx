import React from 'react';
import {
  Activity,
  ActivityType,
  ZoneSuitability,
} from '../types/planner';
import {
  CloudLightning,
  CloudRain,
  Wind,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Building2,
  CheckCircle2,
  XCircle,
  Droplets,
  ArrowRight,
  Sun,
} from 'lucide-react';
import { formatConditionLabel } from '../utils/weatherEngine';

interface ZoneCardProps {
  suitability: ZoneSuitability;
  activity: Activity;
  activityType: ActivityType;
  durationMinutes: number;
  isSelected: boolean;
  onSelect: () => void;
  onOpenWorkoutPlan: () => void;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({
  suitability,
  activity,
  activityType,
  durationMinutes,
  isSelected,
  onSelect,
  onOpenWorkoutPlan,
}) => {
  const { zone, isSafe, status, reasons, alerts, maxRainProb, lightningAlertActive, psiValue, isPsiHealthy } =
    suitability;

  // Status styling
  const isOptimal = isSafe && status === 'optimal';
  const isAcceptable = isSafe && status === 'acceptable';

  return (
    <div
      onClick={onSelect}
      className={`group rounded-xl border transition-all cursor-pointer bg-white overflow-hidden flex flex-col justify-between ${
        isSelected
          ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Top Header Strip */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="uppercase font-semibold tracking-wider">{zone.region} Singapore</span>
              <span aria-hidden="true">·</span>
              <span>{zone.hasShelteredSections ? 'Sheltered sections' : 'Open-air'}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              {zone.name}
            </h3>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {activityType === 'indoor' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                <Building2 className="w-3.5 h-3.5" />
                <span>Indoor Ready</span>
              </span>
            ) : isSafe ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Safe for {durationMinutes}m</span>
              </span>
            ) : lightningAlertActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100 animate-pulse">
                <CloudLightning className="w-3.5 h-3.5 text-rose-600" />
                <span>Cat 1 Lightning Alert</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-100">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Rain / Hazard Expected</span>
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {zone.description}
        </p>

        {/* Environmental Telemetry Grid */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs tabular-nums mb-4">
          {/* Temperature */}
          <div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-0.5">
              <Thermometer className="w-3 h-3 text-slate-400" />
              <span>Temp</span>
            </div>
            <div className="font-semibold text-slate-800 font-mono">
              {suitability.timeWindowSummary.avgTemp}°C
            </div>
          </div>

          {/* Rain Probability */}
          <div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-0.5">
              <CloudRain className="w-3 h-3 text-slate-400" />
              <span>Rain</span>
            </div>
            <div
              className={`font-semibold font-mono ${
                maxRainProb >= 35 ? 'text-blue-600 font-bold' : 'text-slate-800'
              }`}
            >
              {maxRainProb}%
            </div>
          </div>

          {/* Lightning Status */}
          <div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-0.5">
              <CloudLightning className="w-3 h-3 text-slate-400" />
              <span>Lightning</span>
            </div>
            <div
              className={`font-semibold font-mono ${
                lightningAlertActive ? 'text-rose-600 font-bold' : 'text-emerald-700'
              }`}
            >
              {lightningAlertActive ? 'Active' : 'Clear'}
            </div>
          </div>

          {/* PSI Air Quality */}
          <div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-0.5">
              <Wind className="w-3 h-3 text-slate-400" />
              <span>PSI</span>
            </div>
            <div
              className={`font-semibold font-mono ${
                !isPsiHealthy ? 'text-rose-600 font-bold' : psiValue > 50 ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {psiValue} <span className="text-[10px] font-normal">({suitability.psiBand})</span>
            </div>
          </div>
        </div>

        {/* 4-Hour Visual Micro Forecast Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span>Forecast Timeline (Next 4 Hours)</span>
            <span className="text-[10px] text-slate-400">Exercise window highlighted</span>
          </div>

          <div className="grid grid-cols-8 gap-1">
            {zone.forecasts.slice(0, 8).map((f, idx) => {
              const isRain = f.rainProbability >= 35 || f.rainfallMm > 0;
              const isLightning = f.lightningRisk === 'cat1_warning' || f.lightningRisk === 'moderate_risk';
              const isWithinDuration = idx * 30 < durationMinutes;

              let cellBg = 'bg-emerald-100 hover:bg-emerald-200';
              if (isLightning) cellBg = 'bg-rose-400 hover:bg-rose-500';
              else if (isRain) cellBg = 'bg-blue-300 hover:bg-blue-400';

              return (
                <div
                  key={idx}
                  title={`${f.time}: ${formatConditionLabel(f.condition)} | Rain ${f.rainProbability}% | Lightning: ${f.lightningRisk}`}
                  className={`h-7 rounded flex flex-col items-center justify-center text-[10px] font-mono transition-all relative ${cellBg} ${
                    isWithinDuration ? 'ring-1.5 ring-slate-800 shadow-xs' : 'opacity-70'
                  }`}
                >
                  <span className="text-[9px] font-bold text-slate-800 leading-none">
                    {f.time.split(':')[0]}
                  </span>
                  <span className="text-[8px] text-slate-600 leading-none mt-0.5">
                    {isLightning ? '⚡' : isRain ? '💧' : '☀️'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety Reason Callout */}
        {activityType === 'outdoor' && (
          <div className="text-xs space-y-1 mb-3">
            {alerts.length > 0 ? (
              <div className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-100 text-rose-900 flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">{alerts[0]}</span>
                  {reasons[0] && <span className="text-[11px] text-rose-700">{reasons[0]}</span>}
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-100 text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">
                    Zero rain & lightning expected during your {durationMinutes} mins.
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    PSI {psiValue} is healthy. All weather safety criteria satisfied.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Indoor Hub Alternative or Amenity Callout */}
        <div className="text-xs border-t border-slate-100 pt-3">
          {activityType === 'indoor' ? (
            <div>
              <div className="flex items-center gap-1.5 text-sky-800 font-semibold mb-1">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>On-Site Indoor Sports Complex:</span>
              </div>
              <ul className="text-slate-600 text-[11px] space-y-1">
                {zone.indoorFacilities.map((fac, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                    <span>{fac.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span className="truncate">
                Indoor rain backup: {zone.indoorFacilities[0]?.name || 'ActiveSG Complex'}
              </span>
              <span className="shrink-0 text-emerald-700 font-medium">Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          {isSafe || activityType === 'indoor' ? 'Ready to plan' : 'Review warnings'}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
            onOpenWorkoutPlan();
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
            isSafe || activityType === 'indoor'
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-slate-800 text-white hover:bg-slate-900'
          }`}
        >
          <span>Plan Workout</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
