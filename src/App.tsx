import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CEngine } from './engine/cEngine';
import { PRESETS } from './engine/mockData';
import {
  Station,
  RouteItem,
  Ticket,
  TicketNode,
  WaitTicket,
  DijkstraResult,
  WidgetConfig,
  WidgetId,
  LogMessage,
} from './types';
import { Navbar } from './components/Navbar';
import { DashboardGrid } from './components/DashboardGrid';
import { NetworkGraphWidget } from './components/widgets/NetworkGraphWidget';
import { RouteFinderWidget } from './components/widgets/RouteFinderWidget';
import { BookingWidget } from './components/widgets/BookingWidget';
import { BstVisualizerWidget } from './components/widgets/BstVisualizerWidget';
import { WaitlistWidget } from './components/widgets/WaitlistWidget';
import { PerformanceMetricsWidget } from './components/widgets/PerformanceMetricsWidget';
import { TerminalConsoleWidget } from './components/widgets/TerminalConsoleWidget';
import { NetworkManagerWidget } from './components/widgets/NetworkManagerWidget';
import { CSourceCodeWidget } from './components/widgets/CSourceCodeWidget';
import { TicketModal } from './components/TicketModal';
import { WidgetDrawerModal } from './components/WidgetDrawerModal';
import { QuickBookModal } from './components/QuickBookModal';

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'network-graph',
    title: 'Railway Network Topology Graph',
    description: 'Interactive SVG node-link diagram with animated Dijkstra path rendering',
    category: 'visualization',
    icon: 'Network',
    defaultColSpan: 2,
    enabled: true,
  },
  {
    id: 'route-finder',
    title: 'Dijkstra Shortest Path Finder',
    description: 'Optimal route calculation, hop-by-hop trace, distance, and fare computation',
    category: 'core',
    icon: 'Navigation',
    defaultColSpan: 1,
    enabled: true,
  },
  {
    id: 'booking-station',
    title: 'Ticket Reservation & Cancellation Desk',
    description: 'Book confirmed seats (VIP/General), search BST, cancel with auto waitlist promotion',
    category: 'core',
    icon: 'Ticket',
    defaultColSpan: 1,
    enabled: true,
  },
  {
    id: 'bst-visualizer',
    title: 'Confirmed Bookings BST Index',
    description: 'Binary Search Tree visualizer for O(log N) ticket lookup and in-order traversal',
    category: 'visualization',
    icon: 'GitFork',
    defaultColSpan: 2,
    enabled: true,
  },
  {
    id: 'performance-metrics',
    title: 'System Performance & Memory Telemetry',
    description: 'Real-time struct memory allocation (bytes), algorithm latency in µs, stress benchmark',
    category: 'analytics',
    icon: 'Activity',
    defaultColSpan: 2,
    enabled: true,
  },
  {
    id: 'waitlist-queue',
    title: 'Priority Waitlist (MinHeap Queue)',
    description: 'VIP vs General priority queue visualizer with automatic next-in-line promotion',
    category: 'visualization',
    icon: 'ShieldCheck',
    defaultColSpan: 1,
    enabled: true,
  },
  {
    id: 'terminal-console',
    title: 'C Engine Interactive CLI Terminal',
    description: 'Live stdout console and interactive command interpreter simulating the C binary menu',
    category: 'core',
    icon: 'Terminal',
    defaultColSpan: 2,
    enabled: true,
  },
  {
    id: 'network-manager',
    title: 'Graph Topology Manager',
    description: 'Add custom railway stations and bidirectional routes with distance & fare',
    category: 'management',
    icon: 'Plus',
    defaultColSpan: 1,
    enabled: true,
  },
  {
    id: 'c-code-inspector',
    title: 'C Engine Source Architecture',
    description: 'Inspect the C struct definitions, MinHeap Dijkstra, and BST pointer algorithms',
    category: 'analytics',
    icon: 'Code2',
    defaultColSpan: 3,
    enabled: false,
  },
];

export default function App() {
  // C Engine instance ref
  const engineRef = useRef<CEngine>(new CEngine());
  const [activePreset, setActivePreset] = useState<string>('bangladesh-railway');

  // Reactive State mirrors
  const [stations, setStations] = useState<Station[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [confirmedTickets, setConfirmedTickets] = useState<Ticket[]>([]);
  const [bookingRoot, setBookingRoot] = useState<TicketNode | null>(null);
  const [waitlist, setWaitlist] = useState<WaitTicket[]>([]);
  const [sortedWaitlist, setSortedWaitlist] = useState<WaitTicket[]>([]);
  const [bookedSeats, setBookedSeats] = useState<number>(0);
  const [maxSeats, setMaxSeats] = useState<number>(5);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [metrics, setMetrics] = useState(engineRef.current.metrics);

  // Active Dijkstra & Path state
  const [highlightPath, setHighlightPath] = useState<number[]>([]);
  const [lastDijkstraResult, setLastDijkstraResult] = useState<DijkstraResult | null>(null);
  const [selectedSrc, setSelectedSrc] = useState<number | null>(0);
  const [selectedDest, setSelectedDest] = useState<number | null>(1);
  const [searchHighlightId, setSearchHighlightId] = useState<number | null>(null);

  // Modals & Layout
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [selectedModalTicket, setSelectedModalTicket] = useState<Ticket | null>(null);
  const [isWidgetDrawerOpen, setIsWidgetDrawerOpen] = useState<boolean>(false);
  const [isQuickBookOpen, setIsQuickBookOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isStressTesting, setIsStressTesting] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('online_ticket_theme');
      return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('online_ticket_theme', next);
      } catch {
        // Ignore localStorage quota errors
      }
      return next;
    });
  };

  // Sync state from CEngine
  const syncFromEngine = useCallback(() => {
    const eng = engineRef.current;
    setStations([...eng.stations]);
    setRoutes(eng.getAllRoutes());
    setConfirmedTickets(eng.getConfirmedTickets());
    setBookingRoot(eng.bookingRoot ? { ...eng.bookingRoot } : null);
    setWaitlist([...eng.waitQueue]);
    setSortedWaitlist(eng.getSortedWaitlist());
    setBookedSeats(eng.bookedSeats);
    setMaxSeats(eng.maxSeats);
    setMetrics({ ...eng.metrics, memory: { ...eng.metrics.memory } });
  }, []);

  // Initialize engine and logging
  useEffect(() => {
    const addLog = (
      type: 'stdout' | 'stdin' | 'system' | 'success' | 'warn' | 'error' | 'algo',
      text: string
    ) => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      const newEntry: LogMessage = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: timeStr,
        type,
        text,
      };
      setLogs((prev) => [...prev.slice(-150), newEntry]);
    };

    engineRef.current.setLogCallback(addLog);

    // Load initial preset
    const defaultPreset = PRESETS.find((p) => p.id === 'bangladesh-railway') || PRESETS[0];
    defaultPreset.load(engineRef.current);
    syncFromEngine();

    // Initial default Dijkstra calculation
    const initRes = engineRef.current.dijkstra(0, 1);
    setLastDijkstraResult(initRes);
    setHighlightPath(initRes.path);
  }, [syncFromEngine]);

  // Handle Preset change
  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      preset.load(engineRef.current);
      syncFromEngine();
      if (engineRef.current.stations.length > 1) {
        setSelectedSrc(0);
        setSelectedDest(1);
        const res = engineRef.current.dijkstra(0, 1);
        setLastDijkstraResult(res);
        setHighlightPath(res.path);
      }
    }
  };

  // Reset system
  const handleReset = () => {
    engineRef.current.resetAll();
    syncFromEngine();
    setHighlightPath([]);
    setLastDijkstraResult(null);
  };

  // Dijkstra Path calculation
  const handleCalculateRoute = (srcId: number, destId: number): DijkstraResult | null => {
    const res = engineRef.current.dijkstra(srcId, destId);
    setLastDijkstraResult(res);
    setHighlightPath(res.path);
    setSelectedSrc(srcId);
    setSelectedDest(destId);
    syncFromEngine();
    return res;
  };

  // Quick route click on graph
  const handleQuickRoute = (srcId: number, destId: number) => {
    handleCalculateRoute(srcId, destId);
  };

  // Book Ticket
  const handleBookTicket = (
    name: string,
    srcName: string,
    destName: string,
    priority: number
  ) => {
    const res = engineRef.current.bookTicket(name, srcName, destName, priority);
    syncFromEngine();
    if (res.ticketId) {
      setSearchHighlightId(res.ticketId);
    }
    return res;
  };

  // Cancel Ticket
  const handleCancelTicket = (id: number) => {
    const res = engineRef.current.cancelTicket(id);
    syncFromEngine();
    return res;
  };

  // Search Ticket in BST
  const handleSearchTicket = (id: number): TicketNode | null => {
    const found = engineRef.current.searchTicket(id);
    setSearchHighlightId(id);
    syncFromEngine();
    return found;
  };

  // Add Station
  const handleAddStation = (name: string) => {
    engineRef.current.addStation(name);
    syncFromEngine();
  };

  // Add Route
  const handleAddRoute = (srcId: number, destId: number, distance: number, fare: number) => {
    const ok = engineRef.current.addRoute(srcId, destId, distance, fare);
    syncFromEngine();
    return ok;
  };

  // Stress Benchmark (100 rapid operations)
  const handleRunStressTest = () => {
    setIsStressTesting(true);
    setTimeout(() => {
      const eng = engineRef.current;
      const n = eng.stations.length;
      if (n > 1) {
        for (let i = 0; i < 50; i++) {
          const s1 = Math.floor(Math.random() * n);
          let s2 = Math.floor(Math.random() * n);
          if (s1 === s2) s2 = (s1 + 1) % n;
          eng.dijkstra(s1, s2);
        }
        for (let i = 0; i < 20; i++) {
          const s1 = Math.floor(Math.random() * n);
          let s2 = Math.floor(Math.random() * n);
          if (s1 === s2) s2 = (s1 + 1) % n;
          const prio = Math.random() > 0.3 ? 2 : 1;
          eng.bookTicket(`SimPass_${Math.floor(Math.random() * 900 + 100)}`, eng.stations[s1].name, eng.stations[s2].name, prio);
        }
      }
      syncFromEngine();
      setIsStressTesting(false);
    }, 150);
  };

  // Automated Traffic Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const eng = engineRef.current;
      const n = eng.stations.length;
      if (n < 2) return;

      const randomAction = Math.random();
      const names = [
        'Sadman Sakib', 'Afia Tasnim', 'Tanvir Ahmed', 'Nafisa Ali',
        'Zubair Hossain', 'Rumana Islam', 'Mustafizur Rahman', 'Shaila Sharmin',
      ];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const s1 = Math.floor(Math.random() * n);
      let s2 = Math.floor(Math.random() * n);
      if (s1 === s2) s2 = (s1 + 1) % n;
      const prio = Math.random() > 0.4 ? 2 : 1;

      if (randomAction < 0.7) {
        // Book ticket
        eng.bookTicket(randomName, eng.stations[s1].name, eng.stations[s2].name, prio);
      } else {
        // Cancel random confirmed ticket to test auto waitlist promotion
        const tickets = eng.getConfirmedTickets();
        if (tickets.length > 0) {
          const target = tickets[Math.floor(Math.random() * tickets.length)];
          eng.cancelTicket(target.ticketId);
        }
      }
      syncFromEngine();
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulating, syncFromEngine]);

  // Terminal Command Executor
  const handleExecuteCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    const eng = engineRef.current;

    // Log stdin
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toTimeString().split(' ')[0],
        type: 'stdin',
        text: trimmed,
      },
    ]);

    const parts = trimmed.split(/\s+/);
    const first = parts[0]?.toLowerCase();

    if (first === '1' || first === 'book') {
      if (parts.length >= 4) {
        const name = parts[1];
        const src = parts[2];
        const dest = parts[3];
        const prio = parts[4] ? Number(parts[4]) : 2;
        eng.bookTicket(name, src, dest, prio);
        syncFromEngine();
      } else {
        setIsQuickBookOpen(true);
      }
    } else if (first === '2' || first === 'cancel') {
      const id = parseInt(parts[1], 10);
      if (!isNaN(id)) {
        eng.cancelTicket(id);
        syncFromEngine();
      } else {
        setLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toTimeString().split(' ')[0],
            type: 'warn',
            text: 'Usage: cancel <ticketId> (e.g. "cancel 1")',
          },
        ]);
      }
    } else if (first === '3' || first === 'search') {
      const id = parseInt(parts[1], 10);
      if (!isNaN(id)) {
        const found = eng.searchTicket(id);
        if (found) {
          setLogs((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: new Date().toTimeString().split(' ')[0],
              type: 'success',
              text: `Found in BST -> Ticket #${found.ticketId} | ${found.name} | ${eng.stations[found.source]?.name} -> ${eng.stations[found.dest]?.name} | ৳${found.fare}`,
            },
          ]);
          setSearchHighlightId(id);
        } else {
          setLogs((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: new Date().toTimeString().split(' ')[0],
              type: 'error',
              text: `Ticket #${id} not found in Confirmed BST.`,
            },
          ]);
        }
      }
    } else if (first === '4' || first === 'bookings') {
      const tickets = eng.getConfirmedTickets();
      if (tickets.length === 0) {
        setLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toTimeString().split(' ')[0],
            type: 'stdout',
            text: 'No confirmed bookings currently stored in BST.',
          },
        ]);
      } else {
        tickets.forEach((t) => {
          setLogs((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: new Date().toTimeString().split(' ')[0],
              type: 'stdout',
              text: `Ticket #${t.ticketId} | ${t.name} | ${eng.stations[t.source]?.name} -> ${eng.stations[t.dest]?.name} | Fare: ৳${t.fare}`,
            },
          ]);
        });
      }
    } else if (first === '5' || first === 'waitlist') {
      const sorted = eng.getSortedWaitlist();
      if (sorted.length === 0) {
        setLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toTimeString().split(' ')[0],
            type: 'stdout',
            text: 'Waitlist is empty.',
          },
        ]);
      } else {
        sorted.forEach((wt, idx) => {
          setLogs((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: new Date().toTimeString().split(' ')[0],
              type: 'stdout',
              text: `${idx + 1}) Ticket #${wt.ticketId} | ${wt.name} | ${eng.stations[wt.source]?.name} -> ${eng.stations[wt.dest]?.name} | Priority ${wt.priority}`,
            },
          ]);
        });
      }
    } else if (first === '6' || first === 'dijkstra' || first === 'route') {
      if (parts.length >= 3) {
        const s1 = parseInt(parts[1], 10);
        const s2 = parseInt(parts[2], 10);
        if (!isNaN(s1) && !isNaN(s2)) {
          handleCalculateRoute(s1, s2);
        }
      } else if (eng.stations.length >= 2) {
        handleCalculateRoute(0, 1);
      }
    } else if (first === '7' || first === 'station') {
      if (parts.length >= 2) {
        const stName = parts.slice(1).join(' ');
        eng.addStation(stName);
        syncFromEngine();
      } else {
        setLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toTimeString().split(' ')[0],
            type: 'warn',
            text: 'Usage: station <Name> (e.g. "station Cox\'s Bazar")',
          },
        ]);
      }
    } else if (first === 'clear' || first === 'cls') {
      setLogs([]);
    } else if (first === 'help') {
      setLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toTimeString().split(' ')[0],
          type: 'stdout',
          text: `Available Commands:
  1 or book [name] [src] [dest] [prio] : Book ticket (1=VIP, 2=General)
  2 or cancel <id>                    : Cancel ticket by ID & promote from heap
  3 or search <id>                    : Search ticket in BST
  4 or bookings                       : In-order BST print
  5 or waitlist                       : View MinHeap waitlist
  6 or dijkstra <srcId> <destId>      : Run Dijkstra shortest path
  7 or station <name>                 : Add new railway station
  clear                               : Clear terminal output`,
        },
      ]);
    } else {
      setLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toTimeString().split(' ')[0],
          type: 'error',
          text: `Unrecognized command: "${trimmed}". Type "help" for options.`,
        },
      ]);
    }
  };

  // Widget Drag & Drop and configuration handlers
  const handleReorderWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
  };

  const handleToggleWidget = (id: WidgetId) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleToggleMinimize = (id: WidgetId) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w))
    );
  };

  const handleChangeColSpan = (id: WidgetId, colSpan: 1 | 2 | 3) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, defaultColSpan: colSpan } : w))
    );
  };

  const handleResetLayout = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  const handleApplyLayoutPreset = (preset: 'all' | 'essential' | 'algo') => {
    if (preset === 'all') {
      setWidgets((prev) => prev.map((w) => ({ ...w, enabled: true, minimized: false })));
    } else if (preset === 'essential') {
      setWidgets((prev) =>
        prev.map((w) => ({
          ...w,
          enabled: ['network-graph', 'route-finder', 'booking-station', 'waitlist-queue'].includes(w.id),
          minimized: false,
        }))
      );
    } else if (preset === 'algo') {
      setWidgets((prev) =>
        prev.map((w) => ({
          ...w,
          enabled: ['network-graph', 'bst-visualizer', 'performance-metrics', 'c-code-inspector'].includes(w.id),
          minimized: false,
        }))
      );
    }
  };

  // Widget Content Renderer
  const renderWidgetContent = (id: WidgetId) => {
    switch (id) {
      case 'network-graph':
        return (
          <NetworkGraphWidget
            stations={stations}
            routes={routes}
            highlightPath={highlightPath}
            activeStationId={selectedSrc}
            onSelectStation={(stId) => setSelectedSrc(stId)}
            onQuickRoute={handleQuickRoute}
          />
        );
      case 'route-finder':
        return (
          <RouteFinderWidget
            stations={stations}
            onCalculateRoute={handleCalculateRoute}
            lastResult={lastDijkstraResult}
            selectedSrc={selectedSrc}
            selectedDest={selectedDest}
            onChangeEndpoints={(src, dest) => {
              setSelectedSrc(src);
              setSelectedDest(dest);
            }}
          />
        );
      case 'booking-station':
        return (
          <BookingWidget
            stations={stations}
            confirmedTickets={confirmedTickets}
            bookedSeats={bookedSeats}
            maxSeats={maxSeats}
            onBookTicket={handleBookTicket}
            onCancelTicket={handleCancelTicket}
            onSearchTicket={handleSearchTicket}
            onSelectTicketModal={(t) => setSelectedModalTicket(t)}
          />
        );
      case 'bst-visualizer':
        return (
          <BstVisualizerWidget
            root={bookingRoot}
            stations={stations}
            highlightId={searchHighlightId}
            onSelectTicket={(t) => setSelectedModalTicket(t)}
          />
        );
      case 'waitlist-queue':
        return (
          <WaitlistWidget
            waitlist={waitlist}
            sortedWaitlist={sortedWaitlist}
            stations={stations}
          />
        );
      case 'performance-metrics':
        return (
          <PerformanceMetricsWidget
            metrics={metrics}
            stationCount={stations.length}
            routeCount={routes.length}
            confirmedCount={confirmedTickets.length}
            waitlistCount={waitlist.length}
            maxSeats={maxSeats}
            onRunStressTest={handleRunStressTest}
            isStressTesting={isStressTesting}
          />
        );
      case 'terminal-console':
        return (
          <TerminalConsoleWidget
            logs={logs}
            onClearLogs={() => setLogs([])}
            onExecuteCommand={handleExecuteCommand}
          />
        );
      case 'network-manager':
        return (
          <NetworkManagerWidget
            stations={stations}
            routes={routes}
            onAddStation={handleAddStation}
            onAddRoute={handleAddRoute}
          />
        );
      case 'c-code-inspector':
        return <CSourceCodeWidget />;
      default:
        return null;
    }
  };

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-200 ${
        isLight ? 'bg-slate-100/90 text-slate-900' : 'bg-[#0A0C10] text-slate-100'
      }`}
    >
      {/* Top Navigation */}
      <Navbar
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        seatCount={bookedSeats}
        maxSeats={maxSeats}
        waitlistCount={waitlist.length}
        totalRevenue={metrics.totalRevenue}
        onOpenWidgetDrawer={() => setIsWidgetDrawerOpen(true)}
        onOpenQuickBook={() => setIsQuickBookOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardGrid
          widgets={widgets}
          onReorderWidgets={handleReorderWidgets}
          onToggleWidget={handleToggleWidget}
          onToggleMinimize={handleToggleMinimize}
          onChangeColSpan={handleChangeColSpan}
          renderWidgetContent={renderWidgetContent}
          theme={theme}
        />
      </main>

      {/* Modals */}
      <TicketModal
        ticket={selectedModalTicket}
        stations={stations}
        onClose={() => setSelectedModalTicket(null)}
        theme={theme}
      />

      <WidgetDrawerModal
        isOpen={isWidgetDrawerOpen}
        onClose={() => setIsWidgetDrawerOpen(false)}
        widgets={widgets}
        onToggleWidget={handleToggleWidget}
        onResetLayout={handleResetLayout}
        onApplyLayoutPreset={handleApplyLayoutPreset}
        theme={theme}
      />

      <QuickBookModal
        isOpen={isQuickBookOpen}
        onClose={() => setIsQuickBookOpen(false)}
        stations={stations}
        bookedSeats={bookedSeats}
        maxSeats={maxSeats}
        onBook={handleBookTicket}
        theme={theme}
      />
    </div>
  );
}
