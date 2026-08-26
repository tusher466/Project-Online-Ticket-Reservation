import React from 'react';
import {
  RotateCcw,
  Pause,
  Zap,
  Ticket as TicketIcon,
  Grid,
  Bus,
  MapPin,
  Sun,
  Moon,
} from 'lucide-react';
import { PRESETS } from '../engine/mockData';

interface NavbarProps {
  activePreset: string;
  onSelectPreset: (presetId: string) => void;
  onReset: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  seatCount: number;
  maxSeats: number;
  waitlistCount: number;
  totalRevenue: number;
  onOpenWidgetDrawer: () => void;
  onOpenQuickBook: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePreset,
  onSelectPreset,
  onReset,
  isSimulating,
  onToggleSimulation,
  seatCount,
  maxSeats,
  waitlistCount,
  totalRevenue,
  onOpenWidgetDrawer,
  onOpenQuickBook,
  theme = 'dark',
  onToggleTheme,
}) => {
  const seatPercentage = Math.round((seatCount / Math.max(1, maxSeats)) * 100);
  const isLight = theme === 'light';

  return (
    <header
      className={`h-14 border-b ${
        isLight
          ? 'border-slate-200 bg-white/95 text-slate-800 shadow-sm'
          : 'border-slate-800/80 bg-[#0D1117]/95 text-slate-200'
      } backdrop-blur-md select-none z-40 sticky top-0 w-full transition-colors`}
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Brand Identity & Live Online Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-800 flex items-center justify-center shadow-md shadow-cyan-950/40 border border-cyan-400/40 shrink-0">
            <Bus className="w-5 h-5 text-white drop-shadow" />
            {/* Live Online Ping Beacon */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-[#0D1117]" />
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1
                className={`text-sm sm:text-base font-bold tracking-tight whitespace-nowrap ${
                  isLight ? 'text-slate-900' : 'text-slate-100'
                }`}
              >
                Online Ticket Reservation
              </h1>
              <span
                className={`hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>
            <span
              className={`text-[11px] font-mono hidden md:inline truncate ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Smart Transit & Dijkstra Algorithmic Booking Engine
            </span>
          </div>
        </div>

        {/* Center: Network Preset & Quick Stats Pill */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Preset Selector */}
          <div
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs transition-colors ${
              isLight
                ? 'bg-slate-100/90 border-slate-200 text-slate-700'
                : 'bg-[#161B22] border-slate-800 text-slate-300'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span className={`font-mono text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Network:
            </span>
            <select
              id="preset-selector"
              value={activePreset}
              onChange={(e) => onSelectPreset(e.target.value)}
              className={`bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1 ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              {PRESETS.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  className={isLight ? 'bg-white text-slate-900' : 'bg-[#161B22] text-slate-200'}
                >
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Summary Pill */}
          <div
            className={`flex items-center gap-3 border rounded-lg px-3 py-1 text-xs font-mono transition-colors ${
              isLight
                ? 'bg-slate-100/90 border-slate-200'
                : 'bg-[#161B22]/80 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Seats
              </span>
              <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {seatCount}/{maxSeats}
              </span>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                ({seatPercentage}%)
              </span>
            </div>
            <div className={`w-px h-3.5 ${isLight ? 'bg-slate-300' : 'bg-slate-800'}`} />
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Revenue
              </span>
              <span className="font-bold text-amber-500 dark:text-amber-400">
                ৳{totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions Toolbar */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Preset Selector for Small/Medium Screens */}
          <div className="lg:hidden flex items-center">
            <select
              id="preset-selector-mobile"
              value={activePreset}
              onChange={(e) => onSelectPreset(e.target.value)}
              className={`text-[11px] font-mono border rounded-md px-2 py-1.5 focus:outline-none ${
                isLight
                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-[#161B22] text-slate-200 border-slate-800'
              }`}
            >
              {PRESETS.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  className={isLight ? 'bg-white text-slate-900' : 'bg-[#161B22] text-slate-200'}
                >
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Action: Book Ticket */}
          <button
            id="btn-quick-book"
            onClick={onOpenQuickBook}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white shadow-sm shadow-cyan-950/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <TicketIcon className="w-3.5 h-3.5" />
            <span>Book Ticket</span>
          </button>

          {/* Secondary Action Toolbar */}
          <div
            className={`flex items-center border rounded-lg p-0.5 transition-colors ${
              isLight
                ? 'bg-slate-100 border-slate-200'
                : 'bg-[#161B22] border-slate-800'
            }`}
          >
            {/* Auto Traffic Simulation */}
            <button
              id="btn-simulate-traffic"
              onClick={onToggleSimulation}
              className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-md transition-colors ${
                isSimulating
                  ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300 font-semibold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title={isSimulating ? 'Pause traffic simulator' : 'Start auto traffic simulation'}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3 h-3 text-amber-500 dark:text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline text-[11px]">Simulating</span>
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 text-cyan-500" />
                  <span className="hidden sm:inline text-[11px]">Auto Sim</span>
                </>
              )}
            </button>

            {/* Layout Drawer Button */}
            <button
              id="btn-customize-layout"
              onClick={onOpenWidgetDrawer}
              className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-md transition-colors ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title="Customize dashboard widgets"
            >
              <Grid className="w-3.5 h-3.5 text-cyan-500" />
              <span className="hidden md:inline text-[11px]">Layout</span>
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              id="btn-toggle-theme"
              onClick={onToggleTheme}
              className={`p-1.5 rounded-md transition-colors ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/80'
              }`}
              title={isLight ? 'Switch to Dark mode' : 'Switch to Light mode'}
            >
              {isLight ? (
                <Moon className="w-3.5 h-3.5 text-slate-700" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>

            {/* Reset State Button */}
            <button
              id="btn-reset-system"
              onClick={onReset}
              className={`p-1.5 rounded-md transition-colors ${
                isLight
                  ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40'
              }`}
              title="Reset system state to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
