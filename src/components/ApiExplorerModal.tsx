import React, { useState, useEffect } from 'react';
import { X, Server, Play, Copy, Check, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { DATA_GOV_ENDPOINTS } from '../../api/real-time';

interface ApiExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiExplorerModal: React.FC<ApiExplorerModalProps> = ({ isOpen, onClose }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('lightning');
  const [loading, setLoading] = useState<boolean>(false);
  const [responseJson, setResponseJson] = useState<unknown>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [healthStatus, setHealthStatus] = useState<unknown>(null);

  const endpointList = [
    { id: 'health', label: 'Health Check (/api/health)' },
    { id: 'all', label: 'Aggregated Weather Bundle (/api/real-time?endpoint=all)' },
    { id: 'two-hr-forecast', label: '2-Hour Forecast (two-hr-forecast)' },
    { id: 'twenty-four-hr-forecast', label: '24-Hour Forecast (twenty-four-hr-forecast)' },
    { id: 'four-day-outlook', label: '4-Day Outlook (four-day-outlook)' },
    { id: 'air-temperature', label: 'Air Temperature (air-temperature)' },
    { id: 'rainfall', label: 'Rainfall Nowcast (rainfall)' },
    { id: 'psi', label: 'PSI Air Quality Index (psi)' },
    { id: 'pm25', label: '1-Hour PM2.5 Readings (pm25)' },
    { id: 'uv', label: 'UV Index (uv)' },
    { id: 'relative-humidity', label: 'Relative Humidity (relative-humidity)' },
    { id: 'wind-speed', label: 'Wind Speed & Direction (wind-speed)' },
    { id: 'lightning', label: 'NEA Lightning Alert Sensor (lightning)' },
  ];

  const fetchEndpointData = async (endpointId: string) => {
    setLoading(true);
    setResponseJson(null);
    try {
      let url = '';
      if (endpointId === 'health') {
        url = '/api/health';
      } else {
        url = `/api/real-time?endpoint=${endpointId}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      setResponseJson(json);
    } catch (err: unknown) {
      setResponseJson({ error: 'Fetch failed', details: String(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEndpointData(selectedEndpoint);
      // Fetch health
      fetch('/api/health')
        .then((r) => r.json())
        .then((h) => setHealthStatus(h))
        .catch(() => {});
    }
  }, [isOpen, selectedEndpoint]);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    if (!responseJson) return;
    navigator.clipboard.writeText(JSON.stringify(responseJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col justify-between">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Serverless Live Data Explorer
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-semibold">
                  /api/real-time &amp; /api/health
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Direct live proxy connections to data.gov.sg v2 open weather endpoints
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

        {/* Content Body: Left sidebar for endpoints, Right area for JSON */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Endpoint selector */}
          <div className="p-4 overflow-y-auto max-h-[350px] md:max-h-[550px] space-y-1 bg-slate-50/60 text-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select Endpoint
            </div>
            {endpointList.map((ep) => {
              const isSelected = selectedEndpoint === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between text-xs font-medium ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="truncate">{ep.label}</span>
                  {isSelected && <Play className="w-3 h-3 fill-current shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          {/* JSON preview */}
          <div className="md:col-span-2 p-4 flex flex-col overflow-hidden bg-slate-950 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-emerald-400 font-bold">GET</span>
                <span className="text-slate-300">
                  {selectedEndpoint === 'health' ? '/api/health' : `/api/real-time?endpoint=${selectedEndpoint}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchEndpointData(selectedEndpoint)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={copyToClipboard}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto rounded bg-slate-900/80 p-3 font-mono text-[11px] leading-relaxed border border-slate-800/80 select-text">
              {loading ? (
                <div className="flex items-center justify-center h-48 text-slate-400 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Fetching live data from upstream...</span>
                </div>
              ) : responseJson ? (
                <pre>{JSON.stringify(responseJson, null, 2)}</pre>
              ) : (
                <span className="text-slate-500">No response data.</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Gateway Online · In-memory cache 30s TTL</span>
          </div>

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
