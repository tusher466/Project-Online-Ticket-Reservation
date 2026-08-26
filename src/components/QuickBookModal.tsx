import React, { useState } from 'react';
import { Station } from '../types';
import { X, Ticket as TicketIcon } from 'lucide-react';

interface QuickBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: Station[];
  bookedSeats: number;
  maxSeats: number;
  onBook: (
    name: string,
    src: string,
    dest: string,
    priority: number
  ) => { success: boolean; status: 'confirmed' | 'waitlisted' | 'error'; ticketId?: number; fare?: number; message: string };
  theme?: 'dark' | 'light';
}

export const QuickBookModal: React.FC<QuickBookModalProps> = ({
  isOpen,
  onClose,
  stations,
  bookedSeats,
  maxSeats,
  onBook,
  theme = 'dark',
}) => {
  const [name, setName] = useState('');
  const [src, setSrc] = useState(stations[0]?.name || '');
  const [dest, setDest] = useState(stations[1]?.name || '');
  const [priority, setPriority] = useState<number>(2);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  if (!isOpen) return null;
  const isLight = theme === 'light';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMsg({ text: 'Passenger name is required.', ok: false });
      return;
    }

    const res = onBook(name.trim(), src, dest, priority);
    if (res.success) {
      setMsg({ text: res.message, ok: true });
      setTimeout(() => {
        onClose();
        setName('');
        setMsg(null);
      }, 1200);
    } else {
      setMsg({ text: res.message, ok: false });
    }
  };

  const isFull = bookedSeats >= maxSeats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-md rounded-xl border shadow-2xl overflow-hidden p-5 flex flex-col gap-3.5 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#161B22] border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b pb-2.5 ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <TicketIcon className="w-4 h-4 text-cyan-500" />
            <div>
              <h3
                className={`text-sm font-bold uppercase ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Quick Ticket Reservation
              </h3>
              <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {isFull
                  ? `Seats Full (${bookedSeats}/${maxSeats}) → Priority Heap`
                  : `Seats Available (${bookedSeats}/${maxSeats})`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              isLight
                ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-800'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Passenger Name
            </label>
            <input
              type="text"
              placeholder="e.g. Shakib Al Hasan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-medium border ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  : 'bg-[#0D1117] border-slate-800 text-slate-100 placeholder:text-slate-600'
              }`}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Origin
              </label>
              <select
                value={src}
                onChange={(e) => setSrc(e.target.value)}
                className={`rounded px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#0D1117] border-slate-800 text-slate-100'
                }`}
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Destination
              </label>
              <select
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                className={`rounded px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#0D1117] border-slate-800 text-slate-100'
                }`}
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Priority Tier
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className={`rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-medium border ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                  : 'bg-[#0D1117] border-slate-800 text-slate-100'
              }`}
            >
              <option value={2}>General (Priority 2)</option>
              <option value={1}>⭐ VIP (Priority 1 - Top Heap Ranking)</option>
            </select>
          </div>

          {msg && (
            <div
              className={`p-2 rounded text-xs font-mono border ${
                msg.ok
                  ? isLight
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                  : isLight
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-rose-950/70 text-rose-300 border-rose-800/60'
              }`}
            >
              {msg.text}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold border transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-[#0D1117] hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-1.5 rounded text-xs font-bold text-white transition-colors shadow-sm ${
                isFull
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-cyan-600 hover:bg-cyan-500'
              }`}
            >
              {isFull ? 'Add to Waitlist' : 'Confirm & Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
