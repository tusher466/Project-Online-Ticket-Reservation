import React from 'react';
import { WaitTicket, Station } from '../../types';
import { ShieldCheck, Crown, User, Clock, ArrowUpCircle, Layers } from 'lucide-react';

interface WaitlistWidgetProps {
  waitlist: WaitTicket[];
  sortedWaitlist: WaitTicket[];
  stations: Station[];
  onManualPromote?: () => void;
}

export const WaitlistWidget: React.FC<WaitlistWidgetProps> = ({
  waitlist,
  sortedWaitlist,
  stations,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#161B22] text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0D1117]/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-300">Priority Waitlist (MinHeap Queue)</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Rule: VIP (1) &gt; General (2) • FIFO
        </span>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
        {sortedWaitlist.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded">
            <ShieldCheck className="w-5 h-5 text-slate-600 mb-1" />
            <span>Waitlist queue is empty. (All passengers have confirmed seats)</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-2.5 overflow-auto">
            {/* Next in line promotion highlight */}
            <div className="p-2.5 rounded bg-[#0D1117] border border-amber-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono font-bold text-[11px]">
                  #1 in line
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {sortedWaitlist[0]?.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        sortedWaitlist[0]?.priority === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5'
                          : 'bg-[#161B22] text-slate-300 border border-slate-700'
                      }`}
                    >
                      {sortedWaitlist[0]?.priority === 1 ? (
                        <>
                          <Crown className="w-2.5 h-2.5" /> VIP
                        </>
                      ) : (
                        'General'
                      )}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Ticket #{sortedWaitlist[0]?.ticketId} • {stations[sortedWaitlist[0]?.source]?.name} →{' '}
                    {stations[sortedWaitlist[0]?.dest]?.name}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block">
                  Auto-Promotion
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Next Free Seat</span>
              </div>
            </div>

            {/* List of remaining queued passengers */}
            <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto pr-1">
              {sortedWaitlist.map((wt, idx) => {
                const isVIP = wt.priority === 1;
                return (
                  <div
                    key={`wait-${wt.ticketId}`}
                    className="flex items-center justify-between p-2 rounded bg-[#0D1117] border border-slate-800 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold w-4 text-center">
                        {idx + 1}
                      </span>
                      <span className="text-emerald-400 font-bold">#{wt.ticketId}</span>
                      <span className="text-white font-sans font-medium">{wt.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">
                        {stations[wt.source]?.name} → {stations[wt.dest]?.name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isVIP
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5'
                            : 'bg-[#161B22] text-slate-400 border border-slate-800'
                        }`}
                      >
                        {isVIP ? 'VIP-1' : 'GEN-2'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MinHeap Internal Buffer Representation */}
        <div className="pt-2 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Heap Buffer Capacity: {Math.max(8, waitlist.length)}</span>
          </div>
          <span className="text-emerald-400">MinHeap size = {waitlist.length}</span>
        </div>
      </div>
    </div>
  );
};
