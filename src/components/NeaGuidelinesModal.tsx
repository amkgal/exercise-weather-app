import React from 'react';
import { X, CloudLightning, Wind, ShieldCheck, AlertTriangle, Droplets, Info } from 'lucide-react';

interface NeaGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NeaGuidelinesModal: React.FC<NeaGuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Singapore Meteorological & NEA Safety Standards
              </h3>
              <p className="text-xs text-slate-500">
                Official health, lightning warning, and air quality advisories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Section 1: Lightning Warning System (LWS) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <CloudLightning className="w-4 h-4 text-rose-600" />
              <h4>1. NEA Lightning Warning System (LWS)</h4>
            </div>
            <p>
              Singapore is situated in the equatorial tropical belt and experiences one of the highest lightning flash densities in the world (approx. 168 thunderstorm days per year).
            </p>
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-rose-950 space-y-1">
              <div className="font-semibold">Category 1 Lightning Warning Protocol:</div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-900">
                <li>Issued whenever lightning strikes are detected within 6 to 8 km of a sensor sector.</li>
                <li><strong>Mandatory Action:</strong> All open-air physical training, open pool swimming, and field sports must cease immediately. Seek shelter in a substantial enclosed building.</li>
                <li><strong>The 30-Minute Rule:</strong> Activities must not resume until at least 30 minutes after the last thunder is heard or lightning strike is detected.</li>
              </ul>
            </div>
          </div>

          {/* Section 2: PSI & Air Quality Bands */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Wind className="w-4 h-4 text-slate-700" />
              <h4>2. Pollutant Standards Index (PSI) & MOH Health Advisory</h4>
            </div>
            <p>
              Singapore NEA and the Ministry of Health (MOH) categorize 24-hr PSI and 1-hr PM2.5 readings to protect outdoor exercisers from particulate exposure:
            </p>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">PSI Band</th>
                    <th className="p-2.5">Descriptor</th>
                    <th className="p-2.5">Outdoor Exercise Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr className="bg-emerald-50/30">
                    <td className="p-2.5 font-bold text-emerald-800">0 – 50</td>
                    <td className="p-2.5 text-emerald-700 font-medium">Good (Healthy)</td>
                    <td className="p-2.5 text-slate-700">Normal outdoor physical activities safe for all persons.</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-bold text-amber-700">51 – 100</td>
                    <td className="p-2.5 text-amber-700 font-medium">Moderate (Healthy)</td>
                    <td className="p-2.5 text-slate-700">Safe for normal outdoor exercise for healthy individuals.</td>
                  </tr>
                  <tr className="bg-rose-50/30">
                    <td className="p-2.5 font-bold text-rose-700">101 – 200</td>
                    <td className="p-2.5 text-rose-700 font-medium">Unhealthy</td>
                    <td className="p-2.5 text-slate-700">Reduce prolonged or strenuous outdoor physical exertion. Switch to indoor venues.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-purple-700">201 – 300</td>
                    <td className="p-2.5 text-purple-700 font-medium">Very Unhealthy</td>
                    <td className="p-2.5 text-slate-700">Avoid outdoor exertion; stay indoors.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Wet Weather & Indoor Alternatives */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
              <Droplets className="w-4 h-4 text-sky-700" />
              <h4>3. Tropical Rain & Indoor ActiveSG Infrastructure</h4>
            </div>
            <p>
              Singapore features a vast network of sheltered community hubs, ActiveSG indoor sports halls, badminton arenas, and covered elevated running tracks (such as the 888m 100PLUS Promenade at National Stadium and Level 5 at Our Tampines Hub) that allow uninterrupted training regardless of monsoonal rainfall.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
