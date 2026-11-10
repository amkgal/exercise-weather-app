import React, { useState } from 'react';
import {
  ActivityType,
  ZoneSuitability,
} from '../types/planner';
import {
  CloudLightning,
  CloudRain,
  ShieldCheck,
  Building2,
  Layers,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wind,
  Thermometer,
} from 'lucide-react';

interface SingaporeMapProps {
  suitabilities: ZoneSuitability[];
  selectedZoneId?: string;
  onSelectZone: (zoneId: string) => void;
  activityType: ActivityType;
  durationMinutes: number;
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  suitabilities,
  selectedZoneId,
  onSelectZone,
  activityType,
  durationMinutes,
}) => {
  const [showRadarLayer, setShowRadarLayer] = useState(true);
  const [showLightningZones, setShowLightningZones] = useState(true);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  const hoveredSuitability = suitabilities.find((s) => s.zoneId === hoveredZoneId);
  const selectedSuitability = suitabilities.find((s) => s.zoneId === selectedZoneId);

  // Singapore island main polygon outline (normalized to viewBox 0 0 1000 580)
  const singaporeMainlandPath =
    'M 120 280 C 140 240, 200 180, 280 140 C 350 110, 420 80, 520 80 C 600 80, 680 110, 780 140 C 850 160, 910 200, 920 240 C 925 260, 900 280, 850 310 C 800 340, 750 380, 700 395 C 650 410, 580 415, 520 405 C 470 395, 410 400, 360 410 C 300 425, 240 405, 190 380 C 150 360, 110 320, 120 280 Z';

  // Sentosa island path
  const sentosaPath = 'M 460 460 C 480 450, 540 460, 520 480 C 490 495, 450 485, 460 460 Z';

  // Jurong Island path
  const jurongIslandPath = 'M 190 420 C 240 410, 270 430, 250 460 C 220 475, 180 460, 190 420 Z';

  // Pulau Ubin path
  const pulauUbinPath = 'M 790 130 C 830 120, 870 135, 850 150 C 820 160, 780 145, 790 130 Z';

  return (
    <div id="singapore-map-view" className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-8">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Interactive Radar & Safe Zone Map
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-emerald-700 font-medium">
              Live Weather Mapping
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Singapore Weather Nowcast & Lightning Alert Zones
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any pin to inspect microclimate, PSI air quality, and full workout suitability.
          </p>
        </div>

        {/* Map Layer Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRadarLayer(!showRadarLayer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showRadarLayer
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLightningZones(!showLightningZones)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showLightningZones
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <CloudLightning className="w-3.5 h-3.5" />
            <span>Lightning Alert</span>
          </button>
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative w-full aspect-[16/9] max-h-[500px] bg-gradient-to-b from-sky-50/70 via-slate-50 to-emerald-50/30 rounded-xl border border-slate-200/80 overflow-hidden select-none">
        {/* Subtle background sea grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#0284c7 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Region Watermarks */}
        <div className="absolute top-4 left-6 text-[10px] font-bold uppercase tracking-wider text-slate-300 pointer-events-none">
          Straits of Johor
        </div>
        <div className="absolute bottom-3 right-8 text-[10px] font-bold uppercase tracking-wider text-slate-300 pointer-events-none">
          Singapore Strait
        </div>

        <svg
          viewBox="0 0 1000 560"
          className="w-full h-full drop-shadow-sm"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="safeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="rainRadarOverlay" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="lightningRiskOverlay" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </radialGradient>

            {/* Pattern for land texture */}
            <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>

          {/* Singapore Landmasses */}
          <g id="landmass" className="transition-all">
            {/* Mainland */}
            <path
              d={singaporeMainlandPath}
              fill="url(#landGradient)"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              className="drop-shadow-sm"
            />
            {/* Sentosa */}
            <path
              d={sentosaPath}
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            {/* Jurong Island */}
            <path
              d={jurongIslandPath}
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            {/* Pulau Ubin */}
            <path
              d={pulauUbinPath}
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            {/* Internal Region Boundaries (subtle dashed dividers) */}
            <path
              d="M 360 110 Q 380 250 420 405"
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.4"
            />
            <path
              d="M 600 95 Q 610 240 610 405"
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.4"
            />
            <path
              d="M 420 230 Q 520 240 760 230"
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.3"
            />

            {/* Region Label Markers */}
            <text x="250" y="220" fill="#94a3b8" fontSize="13" fontWeight="600" opacity="0.6">
              WEST
            </text>
            <text x="460" y="115" fill="#94a3b8" fontSize="13" fontWeight="600" opacity="0.6">
              NORTH
            </text>
            <text x="520" y="280" fill="#94a3b8" fontSize="13" fontWeight="600" opacity="0.6">
              CENTRAL
            </text>
            <text x="700" y="180" fill="#94a3b8" fontSize="13" fontWeight="600" opacity="0.6">
              NORTH-EAST
            </text>
            <text x="800" y="260" fill="#94a3b8" fontSize="13" fontWeight="600" opacity="0.6">
              EAST
            </text>
            <text x="480" y="525" fill="#94a3b8" fontSize="11" fontWeight="600" opacity="0.6">
              SOUTH (SENTOSA)
            </text>
          </g>

          {/* Dynamic Weather Radar / Rain Cells Layer */}
          {showRadarLayer && (
            <g id="rain-radar-cells" className="pointer-events-none">
              {suitabilities.map((s) => {
                if (s.rainExpected || s.maxRainProb >= 50) {
                  return (
                    <circle
                      key={`rain-${s.zoneId}`}
                      cx={s.zone.mapCoords.x}
                      cy={s.zone.mapCoords.y}
                      r="65"
                      fill="url(#rainRadarOverlay)"
                      className="animate-pulse"
                      style={{ animationDuration: '3s' }}
                    />
                  );
                }
                return null;
              })}
            </g>
          )}

          {/* Dynamic Lightning Warning Radius Circles */}
          {showLightningZones && (
            <g id="lightning-warning-radii" className="pointer-events-none">
              {suitabilities.map((s) => {
                if (s.lightningAlertActive) {
                  return (
                    <g key={`lightning-${s.zoneId}`}>
                      {/* Danger radius (simulating NEA 6-8km warning buffer) */}
                      <circle
                        cx={s.zone.mapCoords.x}
                        cy={s.zone.mapCoords.y}
                        r="75"
                        fill="url(#lightningRiskOverlay)"
                        className="animate-pulse"
                        style={{ animationDuration: '1.8s' }}
                      />
                      <circle
                        cx={s.zone.mapCoords.x}
                        cy={s.zone.mapCoords.y}
                        r="75"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        opacity="0.8"
                      />
                    </g>
                  );
                }
                return null;
              })}
            </g>
          )}

          {/* Interactive Zone Pins */}
          <g id="zone-markers">
            {suitabilities.map((s) => {
              const { x, y } = s.zone.mapCoords;
              const isSelected = selectedZoneId === s.zoneId;
              const isHovered = hoveredZoneId === s.zoneId;

              // Color determination
              let pinBg = '#10b981'; // Green for safe
              let pinBorder = '#059669';
              let pinTextColor = '#ffffff';

              if (activityType === 'indoor') {
                pinBg = '#0284c7'; // Sky-blue for indoor hubs
                pinBorder = '#0369a1';
              } else if (!s.isSafe) {
                if (s.lightningAlertActive) {
                  pinBg = '#e11d48'; // Rose red for lightning alert
                  pinBorder = '#9f1239';
                } else if (s.rainExpected) {
                  pinBg = '#2563eb'; // Blue for rain
                  pinBorder = '#1d4ed8';
                } else {
                  pinBg = '#d97706'; // Amber for unhealthy PSI
                  pinBorder = '#b45309';
                }
              }

              return (
                <g
                  key={s.zoneId}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer transition-transform"
                  onClick={() => onSelectZone(s.zoneId)}
                  onMouseEnter={() => setHoveredZoneId(s.zoneId)}
                  onMouseLeave={() => setHoveredZoneId(null)}
                >
                  {/* Selected / Hovered Pulse Ring */}
                  {(isSelected || isHovered) && (
                    <circle
                      r="22"
                      fill="none"
                      stroke={pinBg}
                      strokeWidth="2.5"
                      opacity="0.5"
                      className="animate-ping"
                      style={{ animationDuration: '2s' }}
                    />
                  )}

                  {/* Marker Circle Base */}
                  <circle
                    r={isSelected || isHovered ? 16 : 13}
                    fill={pinBg}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="drop-shadow-md transition-all duration-200"
                  />

                  {/* Icon glyph inside pin */}
                  {activityType === 'indoor' ? (
                    <g transform="translate(-6, -6) scale(0.65)" fill="#ffffff">
                      <rect x="2" y="2" width="16" height="16" rx="2" fill="none" stroke="#fff" strokeWidth="2.5" />
                      <line x1="6" y1="7" x2="10" y2="7" stroke="#fff" strokeWidth="2.5" />
                      <line x1="6" y1="11" x2="14" y2="11" stroke="#fff" strokeWidth="2.5" />
                    </g>
                  ) : s.lightningAlertActive ? (
                    <g transform="translate(-6, -6) scale(0.65)">
                      <path
                        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                        fill="#ffffff"
                      />
                    </g>
                  ) : s.rainExpected ? (
                    <g transform="translate(-6, -6) scale(0.65)">
                      <path
                        d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                        fill="#ffffff"
                      />
                    </g>
                  ) : !s.isPsiHealthy ? (
                    <g transform="translate(-6, -6) scale(0.65)">
                      <circle cx="10" cy="10" r="8" fill="none" stroke="#fff" strokeWidth="2.5" />
                      <line x1="10" y1="6" x2="10" y2="10" stroke="#fff" strokeWidth="2.5" />
                      <circle cx="10" cy="14" r="1.2" fill="#fff" />
                    </g>
                  ) : (
                    <g transform="translate(-5, -5) scale(0.65)">
                      <polyline
                        points="4 9 8 13 16 5"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  )}

                  {/* Text label below pin */}
                  <text
                    y={isSelected || isHovered ? 26 : 22}
                    textAnchor="middle"
                    className={`text-[10px] font-bold select-none pointer-events-none transition-all ${
                      isSelected || isHovered
                        ? 'fill-slate-900 font-extrabold'
                        : 'fill-slate-700'
                    }`}
                    style={{
                      paintOrder: 'stroke',
                      stroke: '#ffffff',
                      strokeWidth: '3px',
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                    }}
                  >
                    {s.zone.shortName}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Quick Tooltip on Hover */}
        {hoveredSuitability && (
          <div
            className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-lg border border-slate-200 shadow-lg p-3 text-xs max-w-xs z-20 pointer-events-none transition-all"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-slate-900 truncate">
                {hoveredSuitability.zone.name}
              </span>
              <span className="uppercase text-[10px] text-slate-400 font-semibold">
                {hoveredSuitability.zone.region}
              </span>
            </div>

            <div className="mb-2">
              {activityType === 'indoor' ? (
                <span className="inline-flex items-center gap-1 text-sky-700 font-medium bg-sky-50 px-2 py-0.5 rounded text-[11px]">
                  <Building2 className="w-3 h-3" />
                  Indoor Hub · 100% Weather Proof
                </span>
              ) : hoveredSuitability.isSafe ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  <CheckCircle2 className="w-3 h-3" />
                  Safe & Optimal for {durationMinutes}m
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                  <XCircle className="w-3 h-3" />
                  Not Recommended (Weather Warning)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-1.5">
              <div className="flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-slate-400" />
                <span>{hoveredSuitability.timeWindowSummary.avgTemp}°C</span>
              </div>
              <div className="flex items-center gap-1">
                <CloudRain className="w-3 h-3 text-slate-400" />
                <span>Rain: {hoveredSuitability.maxRainProb}%</span>
              </div>
              <div className="flex items-center gap-1">
                <CloudLightning className="w-3 h-3 text-slate-400" />
                <span>{hoveredSuitability.lightningAlertActive ? 'Lightning Cat 1' : 'No Lightning'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-slate-400" />
                <span>PSI: {hoveredSuitability.psiValue}</span>
              </div>
            </div>
          </div>
        )}

        {/* Map Legend (Bottom Left) */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200/90 shadow-sm px-3 py-2 text-[11px] flex flex-wrap items-center gap-3">
          {activityType === 'outdoor' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-slate-700">Safe Outdoor Zone (No Rain/Lightning)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <span className="text-slate-600">Cat 1 Lightning / Heavy Rain</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-slate-600">Rain Expected</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
              <span className="font-medium text-slate-700">Indoor Sports Hub (Weather Protected)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
