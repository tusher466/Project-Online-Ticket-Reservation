import React, { useState } from 'react';
import { WidgetConfig, WidgetId } from '../types';
import {
  GripVertical,
  Minus,
  Maximize2,
  Columns,
  EyeOff,
} from 'lucide-react';

interface DashboardGridProps {
  widgets: WidgetConfig[];
  onReorderWidgets: (newWidgets: WidgetConfig[]) => void;
  onToggleWidget: (id: WidgetId) => void;
  onToggleMinimize: (id: WidgetId) => void;
  onChangeColSpan: (id: WidgetId, colSpan: 1 | 2 | 3) => void;
  renderWidgetContent: (id: WidgetId) => React.ReactNode;
  theme?: 'dark' | 'light';
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  widgets,
  onReorderWidgets,
  onToggleWidget,
  onToggleMinimize,
  onChangeColSpan,
  renderWidgetContent,
  theme = 'dark',
}) => {
  const [draggedWidgetId, setDraggedWidgetId] = useState<WidgetId | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<WidgetId | null>(null);

  const handleDragStart = (e: React.DragEvent, id: WidgetId) => {
    setDraggedWidgetId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: WidgetId) => {
    e.preventDefault();
    if (draggedWidgetId && draggedWidgetId !== targetId) {
      setDragOverWidgetId(targetId);
    }
  };

  const handleDragLeave = () => {
    setDragOverWidgetId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: WidgetId) => {
    e.preventDefault();
    setDragOverWidgetId(null);

    if (!draggedWidgetId || draggedWidgetId === targetId) return;

    const currentOrder = [...widgets];
    const dragIdx = currentOrder.findIndex((w) => w.id === draggedWidgetId);
    const dropIdx = currentOrder.findIndex((w) => w.id === targetId);

    if (dragIdx !== -1 && dropIdx !== -1) {
      const [removed] = currentOrder.splice(dragIdx, 1);
      currentOrder.splice(dropIdx, 0, removed);
      onReorderWidgets(currentOrder);
    }
    setDraggedWidgetId(null);
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const visibleWidgets = widgets.filter((w) => w.enabled);
  const isLight = theme === 'light';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {visibleWidgets.map((widget) => {
        const isDragged = draggedWidgetId === widget.id;
        const isOver = dragOverWidgetId === widget.id;
        const colSpanClass =
          widget.defaultColSpan === 3
            ? 'col-span-1 md:col-span-2 xl:col-span-3'
            : widget.defaultColSpan === 2
            ? 'col-span-1 md:col-span-2 xl:col-span-2'
            : 'col-span-1';

        return (
          <div
            key={widget.id}
            id={`widget-card-${widget.id}`}
            draggable
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragOver={(e) => handleDragOver(e, widget.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, widget.id)}
            onDragEnd={handleDragEnd}
            className={`flex flex-col rounded-xl border transition-all duration-150 overflow-hidden ${colSpanClass} ${
              isLight
                ? isOver
                  ? 'bg-white border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg'
                  : isDragged
                  ? 'bg-slate-100 opacity-40 border-slate-300'
                  : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md'
                : isOver
                ? 'bg-[#161B22] border-cyan-400 ring-1 ring-cyan-500/40 shadow-xl'
                : isDragged
                ? 'bg-[#161B22] opacity-40 border-slate-700'
                : 'bg-[#161B22] border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Widget Top Bar with Drag Handle and Controls */}
            <div
              className={`flex items-center justify-between px-3.5 py-2 border-b text-xs select-none ${
                isLight
                  ? 'bg-slate-50/90 border-slate-200 text-slate-700'
                  : 'bg-[#0D1117]/90 border-slate-800 text-slate-400'
              }`}
            >
              {/* Drag Handle & Title */}
              <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
                <div
                  className={`p-0.5 rounded transition-colors ${
                    isLight
                      ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                  title="Drag to reorder widget position"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {widget.title}
                </span>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1">
                {/* Column Span width adjuster */}
                <button
                  onClick={() => {
                    const nextSpan: 1 | 2 | 3 =
                      widget.defaultColSpan === 1
                        ? 2
                        : widget.defaultColSpan === 2
                        ? 3
                        : 1;
                    onChangeColSpan(widget.id, nextSpan);
                  }}
                  className={`p-1 rounded transition-colors ${
                    isLight
                      ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
                      : 'hover:bg-slate-800 text-slate-500 hover:text-slate-200'
                  }`}
                  title={`Adjust widget width (${widget.defaultColSpan} col)`}
                >
                  <Columns className="w-3 h-3" />
                </button>

                {/* Minimize / Expand Toggle */}
                <button
                  onClick={() => onToggleMinimize(widget.id)}
                  className={`p-1 rounded transition-colors ${
                    isLight
                      ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
                      : 'hover:bg-slate-800 text-slate-500 hover:text-slate-200'
                  }`}
                  title={widget.minimized ? 'Expand widget' : 'Minimize widget'}
                >
                  {widget.minimized ? <Maximize2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                </button>

                {/* Hide Widget */}
                <button
                  onClick={() => onToggleWidget(widget.id)}
                  className={`p-1 rounded transition-colors ${
                    isLight
                      ? 'hover:bg-rose-100 text-slate-400 hover:text-rose-600'
                      : 'hover:bg-rose-950/40 text-slate-500 hover:text-rose-400'
                  }`}
                  title="Hide widget from dashboard"
                >
                  <EyeOff className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Widget Content Body */}
            {!widget.minimized && (
              <div
                className={`flex-1 flex flex-col min-h-0 ${
                  isLight ? 'text-slate-800' : 'text-slate-200'
                }`}
              >
                {renderWidgetContent(widget.id)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
