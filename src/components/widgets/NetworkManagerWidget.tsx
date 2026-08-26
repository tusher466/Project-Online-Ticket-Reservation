import React, { useState } from 'react';
import { Station, RouteItem } from '../../types';
import { Plus, Network, MapPin, Route, Check, AlertCircle } from 'lucide-react';

interface NetworkManagerWidgetProps {
  stations: Station[];
  routes: RouteItem[];
  onAddStation: (name: string) => void;
  onAddRoute: (srcId: number, destId: number, distance: number, fare: number) => boolean;
}

export const NetworkManagerWidget: React.FC<NetworkManagerWidgetProps> = ({
  stations,
  routes,
  onAddStation,
  onAddRoute,
}) => {
  // Station form
  const [stationName, setStationName] = useState('');

  // Route form
  const [srcId, setSrcId] = useState<number>(stations[0]?.id || 0);
  const [destId, setDestId] = useState<number>(stations[1]?.id || 0);
  const [distance, setDistance] = useState<string>('50');
  const [fare, setFare] = useState<string>('100');
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const handleCreateStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationName.trim()) return;
    onAddStation(stationName.trim());
    setStatusMsg({ text: `Station "${stationName.trim()}" created!`, ok: true });
    setStationName('');
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseInt(distance, 10);
    const f = parseInt(fare, 10);
    if (isNaN(d) || isNaN(f) || d <= 0 || f <= 0) {
      setStatusMsg({ text: 'Distance and fare must be positive numbers.', ok: false });
      return;
    }
    if (srcId === destId) {
      setStatusMsg({ text: 'Source and destination must be different stations.', ok: false });
      return;
    }

    const ok = onAddRoute(srcId, destId, d, f);
    if (ok) {
      setStatusMsg({
        text: `Route between #${srcId} and #${destId} added (${d} km, ৳${f})!`,
        ok: true,
      });
    } else {
      setStatusMsg({ text: 'Failed to add route. Check station IDs.', ok: false });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161B22] text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0D1117]/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Network className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-300">Station & Route Graph Topology Editor</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Adjacency List Memory Allocation
        </span>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3.5 overflow-y-auto">
        {/* Row 1: Add Station */}
        <form onSubmit={handleCreateStation} className="bg-[#0D1117] p-2.5 rounded border border-slate-800 flex flex-col gap-2">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Add New Railway Station (C: <code>addStation</code>)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Bogura, Barishal, Rangpur..."
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              className="flex-1 bg-[#161B22] border border-slate-800 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Station</span>
            </button>
          </div>
        </form>

        {/* Row 2: Add Route */}
        <form onSubmit={handleCreateRoute} className="bg-[#0D1117] p-2.5 rounded border border-slate-800 flex flex-col gap-2">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Route className="w-3.5 h-3.5 text-emerald-400" /> Add Bidirectional Route (C: <code>addRoute</code>)
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400">From Station</span>
              <select
                value={srcId}
                onChange={(e) => setSrcId(Number(e.target.value))}
                className="bg-[#161B22] border border-slate-800 text-slate-100 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.id} {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400">To Station</span>
              <select
                value={destId}
                onChange={(e) => setDestId(Number(e.target.value))}
                className="bg-[#161B22] border border-slate-800 text-slate-100 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.id} {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400">Distance (km)</span>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="bg-[#161B22] border border-slate-800 text-slate-100 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400">Fare (৳ Taka)</span>
              <input
                type="number"
                value={fare}
                onChange={(e) => setFare(e.target.value)}
                className="bg-[#161B22] border border-slate-800 text-slate-100 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect Route</span>
            </button>
          </div>
        </form>

        {/* Status banner */}
        {statusMsg && (
          <div
            className={`p-2 rounded text-xs font-mono flex items-center justify-between border ${
              statusMsg.ok
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                : 'bg-rose-950/60 text-rose-300 border-rose-800/60'
            }`}
          >
            <span>{statusMsg.text}</span>
            <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
