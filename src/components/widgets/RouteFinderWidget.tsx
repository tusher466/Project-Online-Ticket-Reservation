import React, { useState, useEffect } from 'react';
import { Station, DijkstraResult } from '../../types';
import { Navigation, Route, Clock, Banknote, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface RouteFinderWidgetProps {
  stations: Station[];
  onCalculateRoute: (srcId: number, destId: number) => DijkstraResult | null;
  lastResult: DijkstraResult | null;
  selectedSrc: number | null;
  selectedDest: number | null;
  onChangeEndpoints: (src: number | null, dest: number | null) => void;
}

export const RouteFinderWidget: React.FC<RouteFinderWidgetProps> = ({
  stations,
  onCalculateRoute,
  lastResult,
  selectedSrc,
  selectedDest,
  onChangeEndpoints,
}) => {
  const [srcId, setSrcId] = useState<number>(selectedSrc ?? 0);
  const [destId, setDestId] = useState<number>(selectedDest ?? (stations.length > 1 ? 1 : 0));
  const [result, setResult] = useState<DijkstraResult | null>(lastResult);

  useEffect(() => {
    if (selectedSrc !== null) setSrcId(selectedSrc);
    if (selectedDest !== null) setDestId(selectedDest);
  }, [selectedSrc, selectedDest]);

  useEffect(() => {
    setResult(lastResult);
  }, [lastResult]);

  const handleCompute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (srcId === destId) return;
    const res = onCalculateRoute(srcId, destId);
    setResult(res);
    onChangeEndpoints(srcId, destId);
  };

  const handleSwap = () => {
    const temp = srcId;
    setSrcId(destId);
    setDestId(temp);
    onChangeEndpoints(destId, temp);
    if (destId !== temp) {
      const res = onCalculateRoute(destId, temp);
      setResult(res);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161B22] text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0D1117]/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Route className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-300">Dijkstra Shortest Path Finder</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">MinHeap O((V+E)logV)</span>
      </div>

      <div className="p-3.5 flex-1 flex flex-col gap-3.5">
        {/* Form controls */}
        <form onSubmit={handleCompute} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
          <div className="sm:col-span-5 flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Source Station (Src)
            </label>
            <select
              value={srcId}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSrcId(val);
                onChangeEndpoints(val, destId);
              }}
              className="bg-[#0D1117] border border-slate-800 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-mono font-medium"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  #{st.id} {st.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1 flex items-center justify-center pb-0.5">
            <button
              type="button"
              onClick={handleSwap}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
              title="Swap endpoints"
            >
              ⇄
            </button>
          </div>

          <div className="sm:col-span-4 flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Destination Station (Dest)
            </label>
            <select
              value={destId}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDestId(val);
                onChangeEndpoints(srcId, val);
              }}
              className="bg-[#0D1117] border border-slate-800 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-mono font-medium"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  #{st.id} {st.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={srcId === destId}
              className={`w-full py-1.5 px-3 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                srcId === destId
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Find</span>
            </button>
          </div>
        </form>

        {/* Results Card */}
        {result && result.distance !== -1 ? (
          <div className="flex-1 flex flex-col justify-between bg-[#0D1117] rounded border border-slate-800 p-3 gap-3">
            {/* Top metrics summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#161B22] rounded p-2 border border-slate-800 flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                  <Route className="w-3 h-3 text-cyan-400" /> Distance
                </span>
                <span className="text-base font-mono font-bold text-cyan-300">
                  {result.distance} <span className="text-xs font-normal text-slate-400">km</span>
                </span>
              </div>

              <div className="bg-[#161B22] rounded p-2 border border-slate-800 flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                  <Banknote className="w-3 h-3 text-emerald-400" /> Est. Fare
                </span>
                <span className="text-base font-mono font-bold text-emerald-300">
                  ৳{result.fare} <span className="text-xs font-normal text-slate-400">Taka</span>
                </span>
              </div>

              <div className="bg-[#161B22] rounded p-2 border border-slate-800 flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> MinHeap Exec
                </span>
                <span className="text-base font-mono font-bold text-amber-300">
                  {result.executionTimeUs} <span className="text-xs font-normal text-slate-400">µs</span>
                </span>
              </div>
            </div>

            {/* Path route breakdown */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Optimal Transit Path (
                {result.path.length} hops)
              </span>

              <div className="flex items-center flex-wrap gap-1.5 p-2 bg-[#161B22] rounded border border-slate-800">
                {result.path.map((stationId, index) => {
                  const isFirst = index === 0;
                  const isLast = index === result.path.length - 1;
                  return (
                    <React.Fragment key={stationId}>
                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold ${
                          isFirst
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                            : isLast
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                            : 'bg-slate-800 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <span>{stations[stationId]?.name || `Station #${stationId}`}</span>
                      </div>
                      {!isLast && <ArrowRight className="w-3 h-3 text-slate-500" />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Explanatory C trace note */}
            <div className="text-[10px] font-mono text-slate-400 bg-[#0A0C10] px-2.5 py-1.5 rounded border border-slate-800/80">
              C Routine: <code className="text-cyan-300">dijkstra(src={srcId}, dest={destId})</code> relaxed{' '}
              {result.visitedNodes.length} vertices via <code className="text-amber-300">MinHeap pq</code>.
            </div>
          </div>
        ) : result && result.distance === -1 ? (
          <div className="p-3 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>No connected railway route exists between these two stations in the current graph.</span>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 font-mono flex flex-col items-center justify-center gap-2 border border-dashed border-slate-800 rounded">
            <Sparkles className="w-5 h-5 text-slate-600" />
            <span>Select origin & destination and click "Find" to execute Dijkstra pathfinding</span>
          </div>
        )}
      </div>
    </div>
  );
};
