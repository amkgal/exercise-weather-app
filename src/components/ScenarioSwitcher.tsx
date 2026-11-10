import React from 'react';
import { WEATHER_SCENARIOS } from '../data/mockScenarios';
import { WeatherScenarioId } from '../types/planner';
import { X, CloudLightning, Sun, CloudRain, Wind, Sparkles, CheckCircle2 } from 'lucide-react';

interface ScenarioSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenarioId: WeatherScenarioId;
  onSelectScenario: (scenarioId: WeatherScenarioId) => void;
}

export const ScenarioSwitcher: React.FC<ScenarioSwitcherProps> = ({
  isOpen,
  onClose,
  activeScenarioId,
  onSelectScenario,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Singapore Weather Simulation Engine</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Select Meteorological Scenario
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Since live weather in Singapore changes dynamically throughout the day, use these scenarios to test how the planner enforces safety rules under diverse conditions:
          </p>

          <div className="space-y-2.5">
            {WEATHER_SCENARIOS.map((sc) => {
              const isSelected = sc.id === activeScenarioId;

              const getScenarioIcon = () => {
                switch (sc.id) {
                  case 'afternoon_thunderstorms':
                    return <CloudLightning className="w-4 h-4 text-rose-500" />;
                  case 'islandwide_clear':
                    return <Sun className="w-4 h-4 text-amber-500" />;
                  case 'east_coast_lightning':
                    return <CloudLightning className="w-4 h-4 text-rose-600" />;
                  case 'moderate_haze_event':
                    return <Wind className="w-4 h-4 text-slate-500" />;
                  case 'passing_showers_central':
                    return <CloudRain className="w-4 h-4 text-blue-500" />;
                }
              };

              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    onSelectScenario(sc.id);
                    onClose();
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {getScenarioIcon()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs">{sc.label}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mb-1 leading-snug">
                      {sc.description}
                    </p>
                    <p className="text-[10px] text-slate-400 italic">
                      Test behavior: {sc.scenarioNotes}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
