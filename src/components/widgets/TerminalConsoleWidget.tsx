import React, { useState, useRef, useEffect } from 'react';
import { LogMessage } from '../../types';
import { Terminal, Send, Trash2, HelpCircle, CornerDownLeft } from 'lucide-react';

interface TerminalConsoleWidgetProps {
  logs: LogMessage[];
  onClearLogs: () => void;
  onExecuteCommand: (cmd: string) => void;
}

export const TerminalConsoleWidget: React.FC<TerminalConsoleWidgetProps> = ({
  logs,
  onClearLogs,
  onExecuteCommand,
}) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onExecuteCommand(input.trim());
    setInput('');
  };

  const handleQuickCommand = (cmd: string) => {
    onExecuteCommand(cmd);
  };

  return (
    <div className="flex flex-col h-full bg-[#161B22] text-slate-200 font-mono">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0D1117] border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-semibold text-slate-300 ml-1 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> C Terminal (./reservation_system)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearLogs}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear console logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Quick Menu buttons */}
      <div className="px-3 py-1.5 bg-[#0D1117]/80 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-500 uppercase text-[9px] font-bold">C Menus:</span>
        <button
          onClick={() => handleQuickCommand('4')}
          className="px-2 py-0.5 rounded bg-[#161B22] hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          4. Show Bookings (BST)
        </button>
        <button
          onClick={() => handleQuickCommand('5')}
          className="px-2 py-0.5 rounded bg-[#161B22] hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          5. Show Waitlist (Heap)
        </button>
        <button
          onClick={() => handleQuickCommand('6')}
          className="px-2 py-0.5 rounded bg-[#161B22] hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          6. Dijkstra Path
        </button>
        <button
          onClick={() => handleQuickCommand('help')}
          className="px-2 py-0.5 rounded bg-[#161B22] hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-colors"
        >
          Help
        </button>
      </div>

      {/* Console Output Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1.5 text-xs text-slate-300 bg-[#0A0C10] font-mono select-text">
        <div className="text-slate-500 text-[11px] pb-1 border-b border-slate-900">
          --- Online Ticket Reservation System (C Binary v2.0) Initialized ---
        </div>

        {logs.map((log) => {
          let color = 'text-slate-300';
          let prefix = '•';

          if (log.type === 'stdin') {
            color = 'text-cyan-300 font-bold';
            prefix = '$';
          } else if (log.type === 'stdout') {
            color = 'text-slate-200';
            prefix = '>';
          } else if (log.type === 'success') {
            color = 'text-emerald-400';
            prefix = '✔';
          } else if (log.type === 'algo') {
            color = 'text-amber-300';
            prefix = '⚡';
          } else if (log.type === 'warn') {
            color = 'text-amber-400';
            prefix = '⚠';
          } else if (log.type === 'error') {
            color = 'text-rose-400';
            prefix = '✖';
          } else if (log.type === 'system') {
            color = 'text-blue-400';
            prefix = 'ℹ';
          }

          return (
            <div key={log.id} className={`flex items-start gap-2 leading-relaxed ${color}`}>
              <span className="text-slate-600 text-[10px] select-none pt-0.5">{log.timestamp}</span>
              <span className="select-none font-bold">{prefix}</span>
              <span className="break-all whitespace-pre-wrap">{log.text}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Interactive Input Form */}
      <form onSubmit={handleSubmit} className="p-2 bg-[#0D1117] border-t border-slate-800 flex items-center gap-2">
        <span className="text-emerald-400 text-xs font-bold pl-2 select-none">$</span>
        <input
          type="text"
          placeholder="Enter choice (1-9) or command (e.g. 'book Alice Dhaka Sylhet 1', 'dijkstra 0 2', 'help')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none text-slate-100 text-xs focus:outline-none placeholder-slate-600 font-mono"
        />
        <button
          type="submit"
          className="p-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          title="Send Command"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
