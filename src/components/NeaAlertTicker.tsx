import React from 'react';
import { AlertTriangle, CloudLightning, ShieldCheck, Wind } from 'lucide-react';
import { WeatherScenarioId } from '../types/planner';

interface NeaAlertTickerProps {
  currentScenario: WeatherScenarioId;
  totalActiveLightningAlerts: number;
  overallPsi: number;
  onOpenScenarioModal: () => void;
  onOpenApiExplorer: () => void;
  isLiveFeedActive: boolean;
}

export const NeaAlertTicker: React.FC<NeaAlertTickerProps> = ({
  currentScenario,
  totalActiveLightningAlerts,
  overallPsi,
  onOpenScenarioModal,
  onOpenApiExplorer,
  isLiveFeedActive,
}) => {
  const isLightningActive = totalActiveLightningAlerts > 0;
  const isPsiUnhealthy = overallPsi > 100;

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-x-auto py-0.5 scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0 font-medium text-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Singapore Meteorological Feed</span>
          </div>

          <span className="text-slate-600">|</span>

          {/* Lightning Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isLightningActive ? (
              <span className="flex items-center gap-1 text-rose-300 font-medium">
                <CloudLightning className="w-3.5 h-3.5 text-rose-400" />
                <span>NEA Lightning Alert Cat 1 Active ({totalActiveLightningAlerts} sectors)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lightning Status: All Clear Islandwide</span>
              </span>
            )}
          </div>

          <span className="text-slate-600">|</span>

          {/* Air Quality PSI */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Wind className="w-3.5 h-3.5 text-slate-400" />
            <span>24h PSI:</span>
            <span
              className={`font-mono font-medium ${
                isPsiUnhealthy
                  ? 'text-rose-300'
                  : overallPsi > 50
                  ? 'text-amber-300'
                  : 'text-emerald-300'
              }`}
            >
              {overallPsi} · {overallPsi <= 50 ? 'Good' : overallPsi <= 100 ? 'Moderate (Healthy)' : 'Unhealthy'}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          {/* Update frequency note */}
          <span className="text-slate-400 hidden lg:inline">
            Refreshes automatically with 15-min radar nowcasting
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            onClick={onOpenApiExplorer}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="Inspect /api/real-time and /api/health live proxy endpoints"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>API Gateway (/api/*)</span>
          </button>

          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isLiveFeedActive ? 'Live NEA Active' : 'Simulate Weather'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
