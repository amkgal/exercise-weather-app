import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

interface NavbarProps {
  onScrollToSection: (sectionId: string) => void;
  onOpenQuickPlanner: () => void;
  onOpenApiExplorer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onScrollToSection,
  onOpenQuickPlanner,
  onOpenApiExplorer,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single brand wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            SG Exercise Weather Planner
          </span>
        </div>

        {/* Zone 2: 4–5 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onScrollToSection('planner-controls')}
            className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
          >
            Activity Planner
          </button>
          <button
            onClick={() => onScrollToSection('singapore-map-view')}
            className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
          >
            Radar Map
          </button>
          <button
            onClick={() => onScrollToSection('recommended-zones')}
            className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
          >
            Safe Zones
          </button>
          <button
            onClick={onOpenApiExplorer}
            className="text-emerald-700 font-semibold hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <span>Live API (/api/*)</span>
          </button>
          <button
            onClick={() => onScrollToSection('nea-guidelines')}
            className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
          >
            NEA Standards
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenQuickPlanner}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Plan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
