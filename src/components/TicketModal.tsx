import React from 'react';
import { Ticket, Station } from '../types';
import { X, Bus, MapPin, CheckCircle2, Wifi } from 'lucide-react';

interface TicketModalProps {
  ticket: Ticket | null;
  stations: Station[];
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const TicketModal: React.FC<TicketModalProps> = ({
  ticket,
  stations,
  onClose,
  theme = 'dark',
}) => {
  if (!ticket) return null;
  const isLight = theme === 'light';

  const srcStation = stations[ticket.source]?.name || `Station #${ticket.source}`;
  const destStation = stations[ticket.dest]?.name || `Station #${ticket.dest}`;
  const dateStr = new Date(ticket.bookedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-md rounded-xl border shadow-2xl overflow-hidden transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#161B22] border-slate-800 text-slate-100'
        }`}
      >
        {/* Ticket Header Banner */}
        <div
          className={`p-3.5 flex items-center justify-between border-b ${
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-[#0D1117] border-slate-800 text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center">
              <Bus className="w-4 h-4 text-cyan-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3
                  className={`text-xs font-bold tracking-tight uppercase ${
                    isLight ? 'text-slate-900' : 'text-slate-200'
                  }`}
                >
                  ONLINE TICKET RESERVATION PASS
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[9px] rounded font-mono font-semibold">
                  <Wifi className="w-2.5 h-2.5 text-emerald-500" /> ONLINE
                </span>
              </div>
              <p className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Confirmed BST Ticket Node • Validated E-Pass
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              isLight
                ? 'hover:bg-slate-200 text-slate-400 hover:text-slate-800'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Boarding Pass Body */}
        <div className="p-4 flex flex-col gap-3.5">
          {/* Passenger & Ticket ID */}
          <div
            className={`flex items-center justify-between border-b pb-2.5 ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider block ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Passenger Name
              </span>
              <span
                className={`text-sm font-bold flex items-center gap-1.5 mt-0.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {ticket.name}
              </span>
            </div>
            <div className="text-right">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider block ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Ticket ID (BST Key)
              </span>
              <span className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                #{ticket.ticketId}
              </span>
            </div>
          </div>

          {/* Route Origin and Destination */}
          <div
            className={`grid grid-cols-2 gap-3 p-3 rounded border ${
              isLight
                ? 'bg-slate-50 border-slate-200'
                : 'bg-[#0D1117] border-slate-800'
            }`}
          >
            <div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider block ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Departure
              </span>
              <span
                className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${
                  isLight ? 'text-cyan-700' : 'text-cyan-300'
                }`}
              >
                <MapPin className="w-3 h-3 text-cyan-500" /> {srcStation}
              </span>
            </div>
            <div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider block ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Destination
              </span>
              <span
                className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${
                  isLight ? 'text-emerald-700' : 'text-emerald-300'
                }`}
              >
                <MapPin className="w-3 h-3 text-emerald-500" /> {destStation}
              </span>
            </div>
          </div>

          {/* Details Row: Fare, Status, Issued */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div
              className={`p-2 rounded border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1117] border-slate-800'
              }`}
            >
              <span className={`text-[10px] block uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Fare Paid
              </span>
              <strong className="text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                ৳{ticket.fare}
              </strong>
            </div>
            <div
              className={`p-2 rounded border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1117] border-slate-800'
              }`}
            >
              <span className={`text-[10px] block uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Status
              </span>
              <strong
                className={`text-xs font-mono flex items-center justify-center gap-1 ${
                  isLight ? 'text-cyan-700' : 'text-cyan-300'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-cyan-500" /> Confirmed
              </strong>
            </div>
            <div
              className={`p-2 rounded border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1117] border-slate-800'
              }`}
            >
              <span className={`text-[10px] block uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Issued
              </span>
              <span
                className={`text-[10px] font-mono ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                {dateStr}
              </span>
            </div>
          </div>

          {/* Barcode & Verification */}
          <div
            className={`pt-2.5 border-t border-dashed flex items-center justify-between ${
              isLight ? 'border-slate-300' : 'border-slate-800'
            }`}
          >
            <div className="flex flex-col">
              <span
                className={`text-[9px] font-mono tracking-widest uppercase ${
                  isLight ? 'text-slate-500' : 'text-slate-500'
                }`}
              >
                BST-NODE-{ticket.ticketId}-VALIDATED
              </span>
              {/* Simulated Barcode */}
              <div className="flex items-center gap-0.5 mt-1 h-6">
                {[4, 2, 6, 1, 5, 2, 4, 1, 3, 5, 2, 6, 3, 2, 4, 1, 5, 2, 4, 3].map((w, i) => (
                  <div
                    key={i}
                    className={`h-full ${isLight ? 'bg-slate-700' : 'bg-slate-400'}`}
                    style={{ width: `${w * 1.5}px` }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
