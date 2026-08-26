import React, { useState, useRef } from 'react';
import { Station, RouteItem } from '../../types';
import { MapPin, Navigation, ZoomIn, ZoomOut, RefreshCw, Layers } from 'lucide-react';

interface NetworkGraphWidgetProps {
  stations: Station[];
  routes: RouteItem[];
  highlightPath?: number[];
  activeStationId?: number | null;
  onSelectStation?: (stationId: number) => void;
  onQuickRoute?: (srcId: number, destId: number) => void;
}

export const NetworkGraphWidget: React.FC<NetworkGraphWidgetProps> = ({
  stations,
  routes,
  highlightPath = [],
  activeStationId = null,
  onSelectStation,
  onQuickRoute,
}) => {
  const [selectedForRoute, setSelectedForRoute] = useState<number | null>(null);
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // SVG dimensions
  const width = 800;
  const height = 480;

  const handleStationClick = (stationId: number) => {
    if (onSelectStation) {
      onSelectStation(stationId);
    }

    if (selectedForRoute === null) {
      setSelectedForRoute(stationId);
    } else {
      if (selectedForRoute !== stationId && onQuickRoute) {
        onQuickRoute(selectedForRoute, stationId);
      }
      setSelectedForRoute(null);
    }
  };

  // Check if an edge is part of the highlight path
  const isEdgeInPath = (u: number, v: number) => {
    if (highlightPath.length < 2) return false;
    for (let i = 0; i < highlightPath.length - 1; i++) {
      const pU = highlightPath[i];
      const pV = highlightPath[i + 1];
      if ((pU === u && pV === v) || (pU === v && pV === u)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="flex flex-col h-full bg-[#161B22] text-slate-200">
      {/* Header controls */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0D1117]/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300">Live Network Graph</span>
          <span className="text-slate-500 font-mono">
            ({stations.length} stations, {routes.length} routes)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors border ${
              showLabels
                ? 'bg-slate-800 text-cyan-300 border-slate-700'
                : 'bg-[#161B22] text-slate-400 border-slate-800'
            }`}
            title="Toggle route distance labels"
          >
            Labels
          </button>
          <button
            onClick={() => setZoom((prev) => Math.min(prev + 0.15, 1.8))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((prev) => Math.max(prev - 0.15, 0.6))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setSelectedForRoute(null);
            }}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
            title="Reset view"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Helper notice */}
      {selectedForRoute !== null && (
        <div className="px-4 py-1.5 bg-cyan-950/70 border-b border-cyan-800/40 text-cyan-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 animate-spin" />
            <span>
              Route origin: <strong>{stations[selectedForRoute]?.name}</strong>. Click another station to run Dijkstra!
            </span>
          </div>
          <button
            onClick={() => setSelectedForRoute(null)}
            className="text-[10px] text-cyan-400 hover:underline font-mono"
          >
            Cancel
          </button>
        </div>
      )}

      {/* SVG Canvas Area */}
      <div className="relative flex-1 min-h-[300px] bg-[#0A0C10] flex items-center justify-center overflow-hidden p-2">
        {/* Background Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full max-h-[460px] select-none transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Defs for gradients & glowing markers */}
          <defs>
            <linearGradient id="routeGradNormal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            <linearGradient id="routeGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Routes (Edges) */}
          {routes.map((route, idx) => {
            const stA = stations[route.src];
            const stB = stations[route.dest];
            if (!stA || !stB) return null;

            const x1 = stA.x ?? 100;
            const y1 = stA.y ?? 100;
            const x2 = stB.x ?? 300;
            const y2 = stB.y ?? 300;

            const inPath = isEdgeInPath(route.src, route.dest);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <g key={`edge-${idx}`}>
                {/* Background Shadow Line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={inPath ? '#06b6d4' : '#1e293b'}
                  strokeWidth={inPath ? 7 : 3}
                  strokeOpacity={inPath ? 0.35 : 0.8}
                  strokeLinecap="round"
                />

                {/* Primary Route Line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={inPath ? 'url(#routeGradActive)' : '#475569'}
                  strokeWidth={inPath ? 3.5 : 1.8}
                  strokeDasharray={inPath ? '6 3' : undefined}
                  className={inPath ? 'animate-pulse' : ''}
                  strokeLinecap="round"
                />

                {/* Distance and Fare Badge */}
                {showLabels && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x={-28}
                      y={-10}
                      width={56}
                      height={18}
                      rx={4}
                      fill="#0f172a"
                      stroke={inPath ? '#06b6d4' : '#334155'}
                      strokeWidth={1}
                      fillOpacity={0.92}
                    />
                    <text
                      x={0}
                      y={2}
                      textAnchor="middle"
                      fill={inPath ? '#38bdf8' : '#94a3b8'}
                      fontSize={9}
                      fontFamily="monospace"
                      fontWeight={600}
                    >
                      {route.distance}k/৳{route.fare}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Stations (Nodes) */}
          {stations.map((st) => {
            const isSelectedOrigin = selectedForRoute === st.id;
            const isInPath = highlightPath.includes(st.id);
            const isOriginInPath = highlightPath.length > 0 && highlightPath[0] === st.id;
            const isDestInPath =
              highlightPath.length > 1 && highlightPath[highlightPath.length - 1] === st.id;
            const isHovered = hoveredStation?.id === st.id;
            const isCurrentActive = activeStationId === st.id;

            const x = st.x ?? 100;
            const y = st.y ?? 100;

            let circleFill = '#1e293b';
            let circleStroke = '#64748b';
            let strokeW = 2;
            let radius = 18;

            if (isOriginInPath) {
              circleFill = '#059669';
              circleStroke = '#34d399';
              strokeW = 3;
              radius = 22;
            } else if (isDestInPath) {
              circleFill = '#0284c7';
              circleStroke = '#38bdf8';
              strokeW = 3;
              radius = 22;
            } else if (isInPath) {
              circleFill = '#0f766e';
              circleStroke = '#2dd4bf';
              strokeW = 2.5;
              radius = 20;
            } else if (isSelectedOrigin) {
              circleFill = '#7c2d12';
              circleStroke = '#fb923c';
              strokeW = 3;
              radius = 22;
            } else if (isCurrentActive) {
              circleFill = '#1e3a8a';
              circleStroke = '#60a5fa';
              strokeW = 2.5;
              radius = 20;
            }

            return (
              <g
                key={`st-${st.id}`}
                transform={`translate(${x}, ${y})`}
                onClick={() => handleStationClick(st.id)}
                onMouseEnter={() => setHoveredStation(st)}
                onMouseLeave={() => setHoveredStation(null)}
                className="cursor-pointer group"
              >
                {/* Glow ring for path or selection */}
                {(isInPath || isSelectedOrigin) && (
                  <circle
                    r={radius + 6}
                    fill="none"
                    stroke={isSelectedOrigin ? '#fb923c' : '#2dd4bf'}
                    strokeWidth={2}
                    strokeOpacity={0.4}
                    className="animate-ping"
                  />
                )}

                {/* Node circle */}
                <circle
                  r={radius}
                  fill={circleFill}
                  stroke={circleStroke}
                  strokeWidth={strokeW}
                  filter={isInPath ? 'url(#glow)' : undefined}
                  className="transition-all duration-200 group-hover:stroke-white group-hover:scale-110"
                />

                {/* Station ID or Indicator icon */}
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={10}
                  fontWeight={700}
                  fontFamily="monospace"
                  pointerEvents="none"
                >
                  #{st.id}
                </text>

                {/* Station Name Label Pill */}
                <g transform={`translate(0, ${radius + 14})`}>
                  <rect
                    x={-st.name.length * 4 - 8}
                    y={-10}
                    width={st.name.length * 8 + 16}
                    height={20}
                    rx={5}
                    fill="#020617"
                    fillOpacity={0.9}
                    stroke={
                      isOriginInPath
                        ? '#34d399'
                        : isDestInPath
                        ? '#38bdf8'
                        : isInPath
                        ? '#2dd4bf'
                        : isSelectedOrigin
                        ? '#fb923c'
                        : '#334155'
                    }
                    strokeWidth={isInPath || isSelectedOrigin ? 1.5 : 1}
                  />
                  <text
                    x={0}
                    y={4}
                    textAnchor="middle"
                    fill={isInPath || isSelectedOrigin ? '#f8fafc' : '#cbd5e1'}
                    fontSize={11}
                    fontWeight={600}
                    fontFamily="sans-serif"
                    pointerEvents="none"
                  >
                    {st.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover info tooltip */}
        {hoveredStation && (
          <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 shadow-xl backdrop-blur-sm pointer-events-none z-10">
            <div className="flex items-center gap-1.5 font-bold text-white mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{hoveredStation.name}</span>
              <span className="text-[10px] font-mono text-slate-400">(Station #{hoveredStation.id})</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Click to select origin • Click target for Dijkstra
            </div>
          </div>
        )}
      </div>

      {/* Path legend footer */}
      {highlightPath.length > 0 && (
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 font-mono text-cyan-300">
            <span className="text-slate-400">Optimal Path:</span>
            {highlightPath.map((id, i) => (
              <React.Fragment key={id}>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold">
                  {stations[id]?.name}
                </span>
                {i < highlightPath.length - 1 && <span className="text-slate-500">→</span>}
              </React.Fragment>
            ))}
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            MinHeap Dijkstra Activated
          </span>
        </div>
      )}
    </div>
  );
};
