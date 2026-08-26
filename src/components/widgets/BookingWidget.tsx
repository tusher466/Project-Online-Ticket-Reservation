import React, { useState } from 'react';
import { Station, Ticket, TicketNode } from '../../types';
import {
  Ticket as TicketIcon,
  User,
  Shield,
  XCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingWidgetProps {
  stations: Station[];
  confirmedTickets: Ticket[];
  bookedSeats: number;
  maxSeats: number;
  onBookTicket: (
    name: string,
    srcName: string,
    destName: string,
    priority: number
  ) => { success: boolean; status: 'confirmed' | 'waitlisted' | 'error'; ticketId?: number; fare?: number; message: string };
  onCancelTicket: (id: number) => { success: boolean; message: string };
  onSearchTicket: (id: number) => TicketNode | null;
  onSelectTicketModal: (ticket: Ticket) => void;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  stations,
  confirmedTickets,
  bookedSeats,
  maxSeats,
  onBookTicket,
  onCancelTicket,
  onSearchTicket,
  onSelectTicketModal,
}) => {
  // Booking Form State
  const [name, setName] = useState('');
  const [srcName, setSrcName] = useState(stations[0]?.name || '');
  const [destName, setDestName] = useState(stations[1]?.name || '');
  const [priority, setPriority] = useState<number>(2); // 1 = VIP, 2 = General
  const [feedback, setFeedback] = useState<{ type: 'success' | 'warn' | 'error'; msg: string } | null>(null);

  // Search State
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<{ found: boolean; ticket?: TicketNode; searchedId?: number } | null>(null);

  // Cancel State
  const [cancelId, setCancelId] = useState('');

  // Active Tab inside booking widget
  const [activeTab, setActiveTab] = useState<'book' | 'search' | 'cancel'>('book');

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: 'error', msg: 'Please enter a passenger name.' });
      return;
    }

    const res = onBookTicket(name, srcName, destName, priority);
    if (res.success) {
      if (res.status === 'confirmed') {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
        setFeedback({ type: 'success', msg: res.message });
      } else {
        setFeedback({ type: 'warn', msg: res.message });
      }
      setName('');
    } else {
      setFeedback({ type: 'error', msg: res.message });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(searchId, 10);
    if (isNaN(id)) return;
    const found = onSearchTicket(id);
    if (found) {
      setSearchResult({ found: true, ticket: found, searchedId: id });
    } else {
      setSearchResult({ found: false, searchedId: id });
    }
  };

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(cancelId, 10);
    if (isNaN(id)) return;
    const res = onCancelTicket(id);
    if (res.success) {
      setFeedback({ type: 'success', msg: res.message });
      setCancelId('');
    } else {
      setFeedback({ type: 'error', msg: res.message });
    }
  };

  const isFull = bookedSeats >= maxSeats;

  return (
    <div className="flex flex-col h-full bg-[#161B22] text-slate-200">
      {/* Header with Sub-tabs */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0D1117]/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <TicketIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-300">Ticket Reservation Desk</span>
        </div>

        <div className="flex items-center gap-1 bg-[#161B22] p-0.5 rounded border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('book');
              setFeedback(null);
            }}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              activeTab === 'book' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Book
          </button>
          <button
            onClick={() => {
              setActiveTab('search');
              setFeedback(null);
            }}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              activeTab === 'search' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Search BST
          </button>
          <button
            onClick={() => {
              setActiveTab('cancel');
              setFeedback(null);
            }}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              activeTab === 'cancel' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3.5">
        {/* TAB 1: BOOKING */}
        {activeTab === 'book' && (
          <form onSubmit={handleBook} className="flex flex-col gap-2.5">
            {/* Passenger Name & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-8 flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-cyan-400" /> Passenger Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mahfuz Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#0D1117] border border-slate-800 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div className="sm:col-span-4 flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> Priority Tier
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="bg-[#0D1117] border border-slate-800 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                >
                  <option value={2}>General (Priority 2)</option>
                  <option value={1}>⭐ VIP (Priority 1)</option>
                </select>
              </div>
            </div>

            {/* Source & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">From Station</label>
                <select
                  value={srcName}
                  onChange={(e) => setSrcName(e.target.value)}
                  className="bg-[#0D1117] border border-slate-800 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">To Station</label>
                <select
                  value={destName}
                  onChange={(e) => setDestName(e.target.value)}
                  className="bg-[#0D1117] border border-slate-800 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Booking Action Button & Occupancy Alert */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs text-slate-400 font-mono">
                {isFull ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Seats Full ({bookedSeats}/{maxSeats}) → Joins Waitlist Heap
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Instant Confirmation ({bookedSeats}/{maxSeats})
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={`py-1.5 px-4 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isFull
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                <TicketIcon className="w-3.5 h-3.5" />
                <span>{isFull ? 'Add to Waitlist' : 'Confirm & Book'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SEARCH BST */}
        {activeTab === 'search' && (
          <div className="flex flex-col gap-2.5">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="number"
                placeholder="Enter Ticket ID (e.g. 1, 2, 3...)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 bg-[#0D1117] border border-slate-800 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="submit"
                className="py-1.5 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search BST</span>
              </button>
            </form>

            {searchResult && (
              <div className="mt-1 p-3 rounded border border-slate-800 bg-[#0D1117]">
                {searchResult.found && searchResult.ticket ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed Ticket #{searchResult.ticket.ticketId}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-300">
                        ৳{searchResult.ticket.fare} Taka
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Passenger:</span>
                        <strong className="text-white">{searchResult.ticket.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Route:</span>
                        <span className="text-cyan-300">
                          {stations[searchResult.ticket.source]?.name} → {stations[searchResult.ticket.dest]?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-rose-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Ticket #{searchResult.searchedId} not found in Confirmed BST Index.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CANCEL TICKET */}
        {activeTab === 'cancel' && (
          <div className="flex flex-col gap-2.5">
            <p className="text-xs text-slate-400">
              Cancelling a ticket deletes its node from the <strong className="text-slate-300">BST</strong> and
              promotes the top passenger from the{' '}
              <strong className="text-amber-300">Waitlist MinHeap</strong>.
            </p>
            <form onSubmit={handleCancel} className="flex gap-2">
              <input
                type="number"
                placeholder="Ticket ID to cancel (e.g. 1)"
                value={cancelId}
                onChange={(e) => setCancelId(e.target.value)}
                className="flex-1 bg-[#0D1117] border border-slate-800 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-500 font-mono"
              />
              <button
                type="submit"
                className="py-1.5 px-3 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Ticket</span>
              </button>
            </form>
          </div>
        )}

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`p-2 rounded text-xs flex items-center justify-between gap-2 border font-mono ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                : feedback.type === 'warn'
                ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                : 'bg-rose-950/60 text-rose-300 border-rose-800/60'
            }`}
          >
            <span>{feedback.msg}</span>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Quick Confirmed Tickets Table Strip */}
        <div className="border-t border-slate-800 pt-2.5">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            <span>Confirmed Bookings ({confirmedTickets.length})</span>
            <span className="text-slate-500 font-mono">In-Order BST</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-h-24">
            {confirmedTickets.length === 0 ? (
              <span className="text-xs text-slate-500 font-mono italic">No tickets currently booked.</span>
            ) : (
              confirmedTickets.map((t) => (
                <div
                  key={t.ticketId}
                  onClick={() => onSelectTicketModal(t)}
                  className="flex items-center gap-2 px-2 py-1 rounded bg-[#0D1117] hover:bg-slate-800 border border-slate-800 cursor-pointer shrink-0 transition-colors group"
                >
                  <span className="text-xs font-mono font-bold text-emerald-400">#{t.ticketId}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300">{t.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {stations[t.source]?.name || t.source} → {stations[t.dest]?.name || t.dest} (৳{t.fare})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
