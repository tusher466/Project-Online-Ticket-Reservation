import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmicMetrics } from '../../types';
import {
  Activity,
  Database,
  Zap,
  Clock,
  Layers,
  HardDrive,
  Flame,
  Radio,
  TrendingUp,
  Coins,
  Ticket,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface PerformanceMetricsWidgetProps {
  metrics: AlgorithmicMetrics;
  stationCount: number;
  routeCount: number;
  confirmedCount: number;
  waitlistCount: number;
  maxSeats: number;
  onRunStressTest: () => void;
  isStressTesting?: boolean;
}

interface TelemetryPoint {
  timeSec: number; // relative second: -60 to 0
  label: string; // e.g. "-45s", "-30s", "now"
  timestamp: number;
  memoryBytes: number;
  memoryKb: number;
  latencyUs: number;
  avgLatencyUs: number;
  revenue: number; // Total revenue in ৳
  confirmedSeats: number;
}

export const PerformanceMetricsWidget: React.FC<PerformanceMetricsWidgetProps> = ({
  metrics,
  stationCount,
  routeCount,
  confirmedCount,
  waitlistCount,
  onRunStressTest,
  isStressTesting = false,
}) => {
  const mem = metrics.memory;
  const memoryKb = (mem.totalBytes / 1024).toFixed(2);

  // Primary Chart view mode
  const [primaryChartMode, setPrimaryChartMode] = useState<'both' | 'memory' | 'latency'>('both');

  // Rolling 60-second telemetry data buffer (60 sample points, 1 sample per second)
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(() => {
    const now = Date.now();
    const initialPoints: TelemetryPoint[] = [];
    const baseMemory = mem.totalBytes || 1088;
    const baseLatency = metrics.lastDijkstraTimeUs || 18;
    const currentRev = metrics.totalRevenue || 12800;
    const currentConfirmed = metrics.ticketsConfirmed || 14;

    for (let i = 59; i >= 0; i--) {
      const secOffset = -i;
      const noise = Math.sin(i / 4) * 2 + Math.cos(i / 3) * 1.5;
      const simulatedMem = Math.max(256, Math.round(baseMemory + noise * 8));
      const simulatedLat = Math.max(1, Math.round(baseLatency + (i % 7 === 0 ? noise * 3 : 0)));

      // Simulate historical revenue progression leading to current
      const revStep = Math.max(0, currentRev - Math.round((i / 59) * (currentRev * 0.15)));
      const confirmedStep = Math.max(1, currentConfirmed - Math.round((i / 59) * 3));

      initialPoints.push({
        timeSec: secOffset,
        label: secOffset === 0 ? 'now' : `${secOffset}s`,
        timestamp: now - i * 1000,
        memoryBytes: simulatedMem,
        memoryKb: Number((simulatedMem / 1024).toFixed(2)),
        latencyUs: simulatedLat,
        avgLatencyUs: Math.max(1, Math.round(metrics.avgDijkstraTimeUs || baseLatency)),
        revenue: revStep,
        confirmedSeats: confirmedStep,
      });
    }
    return initialPoints;
  });

  const latestMetricsRef = useRef({ metrics, mem });
  useEffect(() => {
    latestMetricsRef.current = { metrics, mem };
  }, [metrics, mem]);

  // Interval to push a new telemetry point every second and keep the last 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const current = latestMetricsRef.current;
      const curMemBytes = current.mem.totalBytes || 1088;
      const curLatency = current.metrics.lastDijkstraTimeUs || 14;
      const curAvgLat = current.metrics.avgDijkstraTimeUs || 14;
      const curRevenue = current.metrics.totalRevenue || 0;
      const curConfirmed = current.metrics.ticketsConfirmed || 0;

      setTelemetryHistory((prev) => {
        // Shift data by 1 second and keep 60 points
        const updated = prev.slice(1).map((pt, idx) => {
          const sec = -(59 - idx);
          return {
            ...pt,
            timeSec: sec,
            label: sec === 0 ? 'now' : `${sec}s`,
          };
        });

        // Add latest point at t = 0
        updated.push({
          timeSec: 0,
          label: 'now',
          timestamp: now,
          memoryBytes: curMemBytes,
          memoryKb: Number((curMemBytes / 1024).toFixed(2)),
          latencyUs: curLatency,
          avgLatencyUs: curAvgLat,
          revenue: curRevenue,
          confirmedSeats: curConfirmed,
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update immediately whenever metrics change so interactions reflect instantly
  useEffect(() => {
    setTelemetryHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const curMemBytes = mem.totalBytes || 1088;
      const curLatency = metrics.lastDijkstraTimeUs || 14;
      const curAvgLat = metrics.avgDijkstraTimeUs || 14;
      const curRevenue = metrics.totalRevenue || 0;
      const curConfirmed = metrics.ticketsConfirmed || 0;

      const updated = [...prev];
      updated[updated.length - 1] = {
        ...last,
        memoryBytes: curMemBytes,
        memoryKb: Number((curMemBytes / 1024).toFixed(2)),
        latencyUs: curLatency,
        avgLatencyUs: curAvgLat,
        revenue: curRevenue,
        confirmedSeats: curConfirmed,
      };
      return updated;
    });
  }, [metrics, mem]);

  // Compute peak and stats across 60 seconds
  const maxRecordedLatency = Math.max(...telemetryHistory.map((d) => d.latencyUs), 1);
  const maxRecordedMemory = Math.max(...telemetryHistory.map((d) => d.memoryBytes), 1);

  const startRevenue = telemetryHistory[0]?.revenue || metrics.totalRevenue;
  const currentRevenue = telemetryHistory[telemetryHistory.length - 1]?.revenue || metrics.totalRevenue;
  const revenueGain60s = Math.max(0, currentRevenue - startRevenue);
  const minRecordedRevenue = Math.min(...telemetryHistory.map((d) => d.revenue));
  const maxRecordedRevenue = Math.max(...telemetryHistory.map((d) => d.revenue), 1);

  return (
    <div className="flex flex-col h-full bg-[#161B22] text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0D1117]/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-300">Performance Telemetry & Revenue Trends</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRunStressTest}
            disabled={isStressTesting}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1 transition-all ${
              isStressTesting
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
            }`}
            title="Benchmark 100 random Dijkstra and booking operations"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{isStressTesting ? 'Benchmarking...' : 'Stress Benchmark'}</span>
          </button>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3.5 overflow-y-auto">
        {/* Top 4 Performance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Dijkstra Execution Time */}
          <div className="p-2.5 rounded bg-[#0D1117] border border-slate-800 flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Dijkstra Latency
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-mono font-bold text-cyan-300">
                {metrics.lastDijkstraTimeUs}
              </span>
              <span className="text-xs text-slate-400 font-mono">µs</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              Avg: {metrics.avgDijkstraTimeUs} µs ({metrics.dijkstraRuns} runs)
            </span>
          </div>

          {/* Memory Allocation */}
          <div className="p-2.5 rounded bg-[#0D1117] border border-slate-800 flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-emerald-400" /> C RAM Footprint
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-mono font-bold text-emerald-300">
                {mem.totalBytes}
              </span>
              <span className="text-xs text-slate-400 font-mono">bytes</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              ≈ {memoryKb} KB struct heap
            </span>
          </div>

          {/* BST Tree Depth & Ops */}
          <div className="p-2.5 rounded bg-[#0D1117] border border-slate-800 flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Database className="w-3 h-3 text-purple-400" /> BST Depth / Ops
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-mono font-bold text-purple-300">
                {metrics.bstDepth}
              </span>
              <span className="text-xs text-slate-400 font-mono">lvls</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              {metrics.bstOperations} pointer visits
            </span>
          </div>

          {/* MinHeap Priority Operations */}
          <div className="p-2.5 rounded bg-[#0D1117] border border-slate-800 flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Heap Swaps
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-mono font-bold text-amber-300">
                {metrics.heapOperations}
              </span>
              <span className="text-xs text-slate-400 font-mono">ops</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              {metrics.promotionsFromWaitlist} auto-promotions
            </span>
          </div>
        </div>

        {/* PRIMARY CHART: 60-Second Real-Time Memory & Latency Telemetry */}
        <div className="bg-[#0D1117] rounded p-3 border border-slate-800 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                Live 60-Second System Telemetry
              </span>
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                (1 Hz sampling • Peak: {maxRecordedLatency}µs / {maxRecordedMemory}B)
              </span>
            </div>

            {/* Filter Toggle Buttons */}
            <div className="flex items-center gap-1 bg-[#161B22] p-0.5 rounded border border-slate-800 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setPrimaryChartMode('both')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  primaryChartMode === 'both'
                    ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Metrics
              </button>
              <button
                type="button"
                onClick={() => setPrimaryChartMode('memory')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  primaryChartMode === 'memory'
                    ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Memory (Bytes)
              </button>
              <button
                type="button"
                onClick={() => setPrimaryChartMode('latency')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  primaryChartMode === 'latency'
                    ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Latency (µs)
              </button>
            </div>
          </div>

          {/* Recharts LineChart */}
          <div className="w-full h-40 sm:h-44 pt-1 font-mono text-[11px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={telemetryHistory}
                margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
              >
                <CartesianGrid stroke="#21262d" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  tick={{ fill: '#8b949e', fontSize: 10 }}
                  interval={9}
                  tickLine={{ stroke: '#30363d' }}
                  axisLine={{ stroke: '#30363d' }}
                />

                {/* Left Y-Axis for Memory Allocation (Bytes) */}
                {(primaryChartMode === 'both' || primaryChartMode === 'memory') && (
                  <YAxis
                    yAxisId="memAxis"
                    orientation="left"
                    stroke="#10b981"
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tick={{ fill: '#34d399', fontSize: 10 }}
                    tickLine={{ stroke: '#30363d' }}
                    axisLine={{ stroke: '#30363d' }}
                    tickFormatter={(val: number) => `${Math.round(val)}B`}
                  />
                )}

                {/* Right Y-Axis for Latency (µs) */}
                {(primaryChartMode === 'both' || primaryChartMode === 'latency') && (
                  <YAxis
                    yAxisId="latAxis"
                    orientation="right"
                    stroke="#06b6d4"
                    domain={[0, (dataMax: number) => Math.max(30, Math.ceil(dataMax * 1.25))]}
                    tick={{ fill: '#38bdf8', fontSize: 10 }}
                    tickLine={{ stroke: '#30363d' }}
                    axisLine={{ stroke: '#30363d' }}
                    tickFormatter={(val: number) => `${val}µs`}
                  />
                )}

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TelemetryPoint;
                      return (
                        <div className="bg-[#161B22] border border-slate-700 p-2.5 rounded shadow-xl text-xs font-mono">
                          <div className="text-slate-400 text-[10px] border-b border-slate-800 pb-1 mb-1.5 flex justify-between gap-3">
                            <span>Relative Time: {label}</span>
                            <span className="text-slate-500">
                              {new Date(data.timestamp).toTimeString().split(' ')[0]}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {(primaryChartMode === 'both' || primaryChartMode === 'memory') && (
                              <div className="flex items-center justify-between gap-4 text-emerald-300">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                  Memory Allocation:
                                </span>
                                <span className="font-bold">
                                  {data.memoryBytes} B ({data.memoryKb} KB)
                                </span>
                              </div>
                            )}
                            {(primaryChartMode === 'both' || primaryChartMode === 'latency') && (
                              <div className="flex items-center justify-between gap-4 text-cyan-300">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                                  Algorithm Latency:
                                </span>
                                <span className="font-bold">{data.latencyUs} µs</span>
                              </div>
                            )}
                            {primaryChartMode === 'both' && (
                              <div className="flex items-center justify-between gap-4 text-amber-300 text-[10px]">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                                  Avg Latency:
                                </span>
                                <span>{data.avgLatencyUs} µs</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  height={24}
                  iconSize={8}
                  formatter={(value: string) => {
                    const labelMap: Record<string, string> = {
                      memoryBytes: 'C Struct RAM (Bytes)',
                      latencyUs: 'Dijkstra Latency (µs)',
                      avgLatencyUs: 'Avg Latency (µs)',
                    };
                    return (
                      <span className="text-[10px] text-slate-300 font-mono">
                        {labelMap[value] || value}
                      </span>
                    );
                  }}
                />

                {/* Memory Line */}
                {(primaryChartMode === 'both' || primaryChartMode === 'memory') && (
                  <Line
                    yAxisId="memAxis"
                    type="monotone"
                    dataKey="memoryBytes"
                    name="memoryBytes"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#34d399', stroke: '#065f46', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                )}

                {/* Algorithm Latency Line */}
                {(primaryChartMode === 'both' || primaryChartMode === 'latency') && (
                  <Line
                    yAxisId="latAxis"
                    type="monotone"
                    dataKey="latencyUs"
                    name="latencyUs"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#38bdf8', stroke: '#0369a1', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                )}

                {/* Average Latency Line */}
                {primaryChartMode === 'both' && (
                  <Line
                    yAxisId="latAxis"
                    type="monotone"
                    dataKey="avgLatencyUs"
                    name="avgLatencyUs"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECONDARY CHART: 60-Second Historical Total Revenue Trends (Recharts Line Chart) */}
        <div className="bg-[#0D1117] rounded p-3 border border-slate-800 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Historical Total Revenue Trends (Last 60 Seconds)
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-mono">
              <div className="flex items-center gap-1 text-slate-400">
                <span>Current:</span>
                <span className="text-amber-300 font-bold">৳{currentRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span>60s Gain:</span>
                <span className="font-bold">+৳{revenueGain60s.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Revenue Line Chart */}
          <div className="w-full h-36 sm:h-40 pt-1 font-mono text-[11px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={telemetryHistory}
                margin={{ top: 8, right: 12, left: -5, bottom: 0 }}
              >
                <CartesianGrid stroke="#21262d" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  tick={{ fill: '#8b949e', fontSize: 10 }}
                  interval={9}
                  tickLine={{ stroke: '#30363d' }}
                  axisLine={{ stroke: '#30363d' }}
                />

                {/* Left Y-Axis for Revenue (৳) */}
                <YAxis
                  yAxisId="revAxis"
                  orientation="left"
                  stroke="#f59e0b"
                  domain={[
                    (dataMin: number) => Math.max(0, Math.floor((dataMin - 300) / 500) * 500),
                    (dataMax: number) => Math.ceil((dataMax + 300) / 500) * 500,
                  ]}
                  tick={{ fill: '#fbbf24', fontSize: 10 }}
                  tickLine={{ stroke: '#30363d' }}
                  axisLine={{ stroke: '#30363d' }}
                  tickFormatter={(val: number) => `৳${(val / 1000).toFixed(1)}k`}
                />

                {/* Right Y-Axis for Confirmed Tickets step */}
                <YAxis
                  yAxisId="seatsAxis"
                  orientation="right"
                  stroke="#818cf8"
                  domain={[0, (dataMax: number) => Math.max(16, dataMax + 2)]}
                  tick={{ fill: '#a5b4fc', fontSize: 10 }}
                  tickLine={{ stroke: '#30363d' }}
                  axisLine={{ stroke: '#30363d' }}
                  tickFormatter={(val: number) => `${val} seats`}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TelemetryPoint;
                      return (
                        <div className="bg-[#161B22] border border-slate-700 p-2.5 rounded shadow-xl text-xs font-mono">
                          <div className="text-slate-400 text-[10px] border-b border-slate-800 pb-1 mb-1.5 flex justify-between gap-3">
                            <span>Time: {label}</span>
                            <span className="text-slate-500">
                              {new Date(data.timestamp).toTimeString().split(' ')[0]}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4 text-amber-300">
                              <span className="flex items-center gap-1.5">
                                <Coins className="w-3 h-3 text-amber-400" />
                                Total Revenue:
                              </span>
                              <span className="font-bold">৳{data.revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-indigo-300 text-[10px]">
                              <span className="flex items-center gap-1.5">
                                <Ticket className="w-3 h-3 text-indigo-400" />
                                Confirmed Seats:
                              </span>
                              <span className="font-bold">{data.confirmedSeats}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  height={22}
                  iconSize={8}
                  formatter={(value: string) => {
                    const labelMap: Record<string, string> = {
                      revenue: 'Cumulative Revenue (৳ BDT)',
                      confirmedSeats: 'Confirmed Bookings',
                    };
                    return (
                      <span className="text-[10px] text-slate-300 font-mono">
                        {labelMap[value] || value}
                      </span>
                    );
                  }}
                />

                {/* Total Revenue Trend Line */}
                <Line
                  yAxisId="revAxis"
                  type="monotone"
                  dataKey="revenue"
                  name="revenue"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#fbbf24', stroke: '#78350f', strokeWidth: 2 }}
                  isAnimationActive={false}
                />

                {/* Confirmed Seats Line */}
                <Line
                  yAxisId="seatsAxis"
                  type="stepAfter"
                  dataKey="confirmedSeats"
                  name="confirmedSeats"
                  stroke="#818cf8"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed C Struct Memory Breakdown */}
        <div className="bg-[#0D1117] rounded p-3 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-400" /> Struct Memory Allocation (64-bit ABI)
            </span>
            <span className="text-emerald-400 font-mono">{mem.totalBytes} Bytes</span>
          </div>

          {/* Progress bar visualizer */}
          <div className="w-full h-2.5 bg-slate-900 rounded overflow-hidden flex mb-2.5 border border-slate-800">
            <div
              style={{ width: `${(mem.stationsBytes / Math.max(1, mem.totalBytes)) * 100}%` }}
              className="bg-cyan-500"
              title={`Stations: ${mem.stationsBytes}B`}
            />
            <div
              style={{ width: `${(mem.edgesBytes / Math.max(1, mem.totalBytes)) * 100}%` }}
              className="bg-blue-500"
              title={`Edges: ${mem.edgesBytes}B`}
            />
            <div
              style={{ width: `${(mem.bstBytes / Math.max(1, mem.totalBytes)) * 100}%` }}
              className="bg-purple-500"
              title={`BST Nodes: ${mem.bstBytes}B`}
            />
            <div
              style={{ width: `${(mem.waitQueueBytes / Math.max(1, mem.totalBytes)) * 100}%` }}
              className="bg-amber-500"
              title={`Waitlist Heap: ${mem.waitQueueBytes}B`}
            />
          </div>

          {/* Breakdown items */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-cyan-500" />
              <span className="text-slate-400">Station[{stationCount}]:</span>
              <strong className="text-slate-100">{mem.stationsBytes}B</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-blue-500" />
              <span className="text-slate-400">Edge[{routeCount * 2}]:</span>
              <strong className="text-slate-100">{mem.edgesBytes}B</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-purple-500" />
              <span className="text-slate-400">TicketNode[{confirmedCount}]:</span>
              <strong className="text-slate-100">{mem.bstBytes}B</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-amber-500" />
              <span className="text-slate-400">WaitTicket[{waitlistCount}]:</span>
              <strong className="text-slate-100">{mem.waitQueueBytes}B</strong>
            </div>
          </div>
        </div>

        {/* Throughput & Ticket Flow stats */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
          <div className="p-2 rounded bg-[#0D1117] border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Confirmed Seats</span>
            <strong className="text-emerald-400 text-sm">{metrics.ticketsConfirmed}</strong>
          </div>
          <div className="p-2 rounded bg-[#0D1117] border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Cancellations</span>
            <strong className="text-rose-400 text-sm">{metrics.ticketsCancelled}</strong>
          </div>
          <div className="p-2 rounded bg-[#0D1117] border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Total Revenue</span>
            <strong className="text-amber-300 text-sm">৳{metrics.totalRevenue.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
