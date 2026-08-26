export interface Station {
  id: number;
  name: string;
  x?: number;
  y?: number;
}

export interface Edge {
  dest: number;
  distance: number;
  fare: number;
}

export interface RouteItem {
  src: number;
  dest: number;
  distance: number;
  fare: number;
}

export interface Ticket {
  ticketId: number;
  name: string;
  source: number;
  dest: number;
  fare: number;
  bookedAt: number; // timestamp
  priority?: number;
}

export interface TicketNode {
  ticketId: number;
  name: string;
  source: number;
  dest: number;
  fare: number;
  left: TicketNode | null;
  right: TicketNode | null;
  // visualization props
  x?: number;
  y?: number;
}

export interface WaitTicket {
  ticketId: number;
  name: string;
  source: number;
  dest: number;
  priority: number; // 1 = VIP, 2 = General
  bookTime: number;
  addedAt: number;
}

export interface DijkstraResult {
  path: number[];
  distance: number;
  fare: number;
  visitedNodes: number[];
  executionTimeUs: number; // in microseconds
}

export interface MemoryStats {
  stationsBytes: number;
  edgesBytes: number;
  bstBytes: number;
  heapBytes: number;
  waitQueueBytes: number;
  totalBytes: number;
}

export interface AlgorithmicMetrics {
  dijkstraRuns: number;
  avgDijkstraTimeUs: number;
  lastDijkstraTimeUs: number;
  bstOperations: number;
  bstDepth: number;
  heapOperations: number;
  ticketsConfirmed: number;
  ticketsCancelled: number;
  promotionsFromWaitlist: number;
  totalRevenue: number;
  memory: MemoryStats;
}

export type WidgetId =
  | 'network-graph'
  | 'route-finder'
  | 'booking-station'
  | 'bst-visualizer'
  | 'waitlist-queue'
  | 'performance-metrics'
  | 'terminal-console'
  | 'network-manager'
  | 'c-code-inspector';

export interface WidgetConfig {
  id: WidgetId;
  title: string;
  description: string;
  category: 'core' | 'visualization' | 'analytics' | 'management';
  icon: string;
  defaultColSpan: 1 | 2 | 3;
  enabled: boolean;
  minimized?: boolean;
}

export interface LogMessage {
  id: string;
  timestamp: string;
  type: 'stdout' | 'stdin' | 'system' | 'success' | 'warn' | 'error' | 'algo';
  text: string;
}
