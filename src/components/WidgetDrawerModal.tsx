import React from 'react';
import { WidgetConfig, WidgetId } from '../types';
import { X, Check, Grid, RotateCcw } from 'lucide-react';

interface WidgetDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onToggleWidget: (id: WidgetId) => void;
  onResetLayout: () => void;
  onApplyLayoutPreset: (preset: 'all' | 'essential' | 'algo') => void;
  theme?: 'dark' | 'light';
}

export const WidgetDrawerModal: React.FC<WidgetDrawerModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
  onResetLayout,
  onApplyLayoutPreset,
  theme = 'dark',
}) => {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#161B22] border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1117] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-cyan-500" />
            <div>
              <h3
                className={`text-sm font-bold uppercase ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Customize Dashboard Layout
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Toggle widget visibility • Drag cards to reorder • Responsive grid
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              isLight
                ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Layout Presets */}
        <div
          className={`p-3 border-b flex items-center justify-between gap-2 ${
            isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-[#0A0C10] border-slate-800'
          }`}
        >
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Quick Views:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onApplyLayoutPreset('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
                  : 'bg-[#161B22] hover:bg-slate-800 text-slate-200 border-slate-700/60'
              }`}
            >
              All Widgets
            </button>
            <button
              onClick={() => onApplyLayoutPreset('essential')}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
                  : 'bg-[#161B22] hover:bg-slate-800 text-slate-200 border-slate-700/60'
              }`}
            >
              Operations View
            </button>
            <button
              onClick={() => onApplyLayoutPreset('algo')}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
                  : 'bg-[#161B22] hover:bg-slate-800 text-slate-200 border-slate-700/60'
              }`}
            >
              Algorithms View
            </button>
          </div>
        </div>

        {/* Widget Items List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {widgets.map((w) => (
            <div
              key={w.id}
              onClick={() => onToggleWidget(w.id)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                w.enabled
                  ? isLight
                    ? 'bg-cyan-50/60 border-cyan-300 text-slate-900'
                    : 'bg-[#161B22] border-cyan-500/40 text-slate-100'
                  : isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-70'
                  : 'bg-[#0D1117] border-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                    w.enabled
                      ? 'bg-cyan-600 border-cyan-400 text-white'
                      : isLight
                      ? 'border-slate-300 bg-white'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {w.enabled && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold">{w.title}</h4>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {w.description}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {w.defaultColSpan} Col
              </span>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div
          className={`px-4 py-3 border-t flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1117] border-slate-800'
          }`}
        >
          <button
            onClick={onResetLayout}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default Layout</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
