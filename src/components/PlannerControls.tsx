import React from 'react';
import {
  ActivityType,
  Activity,
  SingaporeRegion,
} from '../types/planner';
import { ACTIVITIES } from '../data/activities';
import {
  Sun,
  Building2,
  Clock,
  Calendar,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Search,
  Flame,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface PlannerControlsProps {
  activityType: ActivityType;
  onActivityTypeChange: (type: ActivityType) => void;
  selectedActivityId: string;
  onActivityChange: (activityId: string) => void;
  durationMinutes: number;
  onDurationChange: (duration: number) => void;
  startOffsetMinutes: number;
  onStartOffsetChange: (offset: number) => void;
  selectedRegion: SingaporeRegion | 'all';
  onRegionChange: (region: SingaporeRegion | 'all') => void;
  onlySafeZones: boolean;
  onOnlySafeZonesChange: (onlySafe: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  safeCount: number;
  totalCount: number;
  startTimeFormatted: string;
  endTimeFormatted: string;
}

export const PlannerControls: React.FC<PlannerControlsProps> = ({
  activityType,
  onActivityTypeChange,
  selectedActivityId,
  onActivityChange,
  durationMinutes,
  onDurationChange,
  startOffsetMinutes,
  onStartOffsetChange,
  selectedRegion,
  onRegionChange,
  onlySafeZones,
  onOnlySafeZonesChange,
  searchQuery,
  onSearchQueryChange,
  safeCount,
  totalCount,
  startTimeFormatted,
  endTimeFormatted,
}) => {
  const currentActivities = ACTIVITIES.filter((a) => a.type === activityType);
  const activeActivity = ACTIVITIES.find((a) => a.id === selectedActivityId) || currentActivities[0];

  const durations = [30, 45, 60, 90, 120];
  const startOffsets = [
    { label: 'Start Now', offset: 0 },
    { label: '+30 Mins', offset: 30 },
    { label: '+1 Hour', offset: 60 },
    { label: '+2 Hours', offset: 120 },
  ];

  const regions: { id: SingaporeRegion | 'all'; label: string }[] = [
    { id: 'all', label: 'All Regions' },
    { id: 'central', label: 'Central' },
    { id: 'east', label: 'East' },
    { id: 'west', label: 'West' },
    { id: 'north', label: 'North' },
    { id: 'north-east', label: 'North-East' },
    { id: 'south', label: 'South' },
  ];

  // Helper to get Lucide icon
  const renderActivityIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />;
    }
    return <Sun className="w-4 h-4" />;
  };

  return (
    <div id="planner-controls" className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-8">
      {/* 1. Primary Activity Type Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Step 1 · Exercise Environment
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Where do you want to work out?
          </h2>
        </div>

        {/* Functional segmented control */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              onActivityTypeChange('outdoor');
              // Automatically switch to first outdoor activity if previous was indoor
              const firstOutdoor = ACTIVITIES.find((a) => a.type === 'outdoor');
              if (firstOutdoor) onActivityChange(firstOutdoor.id);
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              activityType === 'outdoor'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Outdoor Activity</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onActivityTypeChange('indoor');
              // Automatically switch to first indoor activity if previous was outdoor
              const firstIndoor = ACTIVITIES.find((a) => a.type === 'indoor');
              if (firstIndoor) onActivityChange(firstIndoor.id);
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              activityType === 'indoor'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Indoor Activity</span>
          </button>
        </div>
      </div>

      {/* Dynamic Context Banner */}
      <div
        className={`my-4 p-3.5 rounded-lg text-xs leading-relaxed flex items-start gap-2.5 ${
          activityType === 'outdoor'
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-100'
            : 'bg-sky-50 text-sky-900 border border-sky-100'
        }`}
      >
        <ShieldCheck
          className={`w-4 h-4 shrink-0 mt-0.5 ${
            activityType === 'outdoor' ? 'text-emerald-600' : 'text-sky-600'
          }`}
        />
        <div>
          {activityType === 'outdoor' ? (
            <span>
              <strong>Outdoor Safety Policy:</strong> Singapore NEA 2-hour nowcast and lightning warning radar will evaluate conditions during your exact duration ({startTimeFormatted} – {endTimeFormatted}). Only areas with <strong>no rain, no active lightning strikes</strong>, and <strong>healthy PSI (&le; 100)</strong> are recommended.
            </span>
          ) : (
            <span>
              <strong>Indoor Safety Policy:</strong> Since your activity is indoors, <strong>any location across Singapore is suitable</strong> regardless of outdoor rain, wet weather, or lightning. Covered facilities and air-conditioned hubs remain 100% operational.
            </span>
          )}
        </div>
      </div>

      {/* 2. Activity Selection Grid */}
      <div className="py-4">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Step 2 · Select Specific Sport or Exercise
          </label>
          <span className="text-xs text-slate-400">
            {currentActivities.length} {activityType} options
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {currentActivities.map((act) => {
            const isSelected = act.id === activeActivity?.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => onActivityChange(act.id)}
                className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? activityType === 'outdoor'
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 ring-1 ring-emerald-500/20 shadow-sm'
                      : 'border-sky-600 bg-sky-50/60 text-sky-950 ring-1 ring-sky-500/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`p-1.5 rounded-md ${
                      isSelected
                        ? activityType === 'outdoor'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {renderActivityIcon(act.iconName)}
                  </span>
                  {isSelected && (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        activityType === 'outdoor' ? 'text-emerald-600' : 'text-sky-600'
                      }`}
                    />
                  )}
                </div>
                <div className="text-xs font-semibold truncate" title={act.name}>
                  {act.name}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-mono">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>~{act.estimatedCalPerHour} kcal/h</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Duration & Start Time Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-slate-100">
        {/* Duration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Exercise Duration</span>
            </label>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {durationMinutes} Minutes
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {durations.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onDurationChange(d)}
                className={`py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                  durationMinutes === d
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                {d}m
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Weather forecast and lightning risks are evaluated for the full {durationMinutes} mins.
          </span>
        </div>

        {/* Start Time */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Session Window</span>
            </label>
            <span className="text-xs font-semibold text-emerald-700 font-mono">
              {startTimeFormatted} – {endTimeFormatted}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {startOffsets.map((item) => (
              <button
                key={item.offset}
                type="button"
                onClick={() => onStartOffsetChange(item.offset)}
                className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all text-center truncate ${
                  startOffsetMinutes === item.offset
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Evaluates real-time radar from {startTimeFormatted} onwards.
          </span>
        </div>
      </div>

      {/* 4. Filter Bar & Region Tabs */}
      <div className="pt-4 border-t border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Region tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {regions.map((reg) => (
            <button
              key={reg.id}
              type="button"
              onClick={() => onRegionChange(reg.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedRegion === reg.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* Search & Safe-Only Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[180px] flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search park or venue..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Toggle for showing only safe areas */}
          {activityType === 'outdoor' && (
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 bg-emerald-50/70 border border-emerald-200/80 px-3 py-1.5 rounded-lg">
              <input
                type="checkbox"
                checked={onlySafeZones}
                onChange={(e) => onOnlySafeZonesChange(e.target.checked)}
                className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="font-semibold text-emerald-950">
                Safe zones only ({safeCount}/{totalCount})
              </span>
            </label>
          )}

          {activityType === 'indoor' && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-sky-800 bg-sky-50 border border-sky-200/60 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
              <span>All {totalCount} locations available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
