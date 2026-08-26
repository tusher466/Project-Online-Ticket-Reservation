import {
  Station,
  Edge,
  RouteItem,
  Ticket,
  TicketNode,
  WaitTicket,
  DijkstraResult,
  MemoryStats,
  AlgorithmicMetrics,
} from '../types';

export class CEngine {
  public stations: Station[] = [];
  public adjList: Map<number, Edge[]> = new Map();
  public bookingRoot: TicketNode | null = null;
  public waitQueue: WaitTicket[] = [];
  public maxSeats: number = 5;
  public nextTicketId: number = 1;
  public bookTimeCounter: number = 1;
  public bookedSeats: number = 0;

  // Performance telemetry
  public metrics: AlgorithmicMetrics = {
    dijkstraRuns: 0,
    avgDijkstraTimeUs: 0,
    lastDijkstraTimeUs: 0,
    bstOperations: 0,
    bstDepth: 0,
    heapOperations: 0,
    ticketsConfirmed: 0,
    ticketsCancelled: 0,
    promotionsFromWaitlist: 0,
    totalRevenue: 0,
    memory: {
      stationsBytes: 0,
      edgesBytes: 0,
      bstBytes: 0,
      heapBytes: 0,
      waitQueueBytes: 0,
      totalBytes: 0,
    },
  };

  private dijkstraTimeTotalUs = 0;
  private logCallback?: (type: 'stdout' | 'stdin' | 'system' | 'success' | 'warn' | 'error' | 'algo', text: string) => void;

  constructor(logCb?: (type: 'stdout' | 'stdin' | 'system' | 'success' | 'warn' | 'error' | 'algo', text: string) => void) {
    this.logCallback = logCb;
  }

  public setLogCallback(cb: (type: 'stdout' | 'stdin' | 'system' | 'success' | 'warn' | 'error' | 'algo', text: string) => void) {
    this.logCallback = cb;
  }

  private log(type: 'stdout' | 'stdin' | 'system' | 'success' | 'warn' | 'error' | 'algo', text: string) {
    if (this.logCallback) {
      this.logCallback(type, text);
    }
  }

  // --- Memory Calculation (C struct sizes in 64-bit architecture) ---
  public updateMemoryStats(): MemoryStats {
    const stationStructSize = 4 + 50 + 2; // id (4) + name[50] + padding -> ~56 bytes
    const edgeStructSize = 4 + 4 + 4 + 8; // dest(4) + dist(4) + fare(4) + next*(8) -> 24 bytes
    const ticketNodeSize = 4 + 50 + 4 + 4 + 4 + 8 + 8; // id(4) + name[50] + src(4) + dest(4) + fare(4) + left*(8) + right*(8) -> 82 bytes
    const waitTicketSize = 4 + 50 + 4 + 4 + 4 + 4; // id(4) + name[50] + src(4) + dest(4) + priority(4) + bookTime(4) -> 70 bytes

    const stationsBytes = this.stations.length * stationStructSize;
    let edgeCount = 0;
    this.adjList.forEach((edges) => {
      edgeCount += edges.length;
    });
    const edgesBytes = edgeCount * edgeStructSize;

    const bstNodesCount = this.getConfirmedTickets().length;
    const bstBytes = bstNodesCount * ticketNodeSize;

    const waitQueueBytes = this.waitQueue.length * waitTicketSize;
    const heapBytes = 64; // dynamic heap buffer overhead

    const totalBytes = stationsBytes + edgesBytes + bstBytes + waitQueueBytes + heapBytes;

    this.metrics.memory = {
      stationsBytes,
      edgesBytes,
      bstBytes,
      heapBytes,
      waitQueueBytes,
      totalBytes,
    };
    this.metrics.bstDepth = this.calculateBstDepth(this.bookingRoot);

    return this.metrics.memory;
  }

  // --- Station & Route Management ---
  public addStation(name: string, x?: number, y?: number): number {
    const trimmed = name.trim();
    if (!trimmed) return -1;
    const existing = this.findStationByName(trimmed);
    if (existing !== -1) {
      this.log('warn', `Station "${trimmed}" already exists at ID ${existing}`);
      return existing;
    }

    const id = this.stations.length;
    this.stations.push({
      id,
      name: trimmed,
      x: x ?? 100 + (id % 5) * 160 + (Math.floor(id / 5) % 2) * 50,
      y: y ?? 80 + Math.floor(id / 5) * 140,
    });
    this.adjList.set(id, []);
    this.updateMemoryStats();
    this.log('system', `Station added: #${id} "${trimmed}"`);
    return id;
  }

  public findStationByName(name: string): number {
    const target = name.trim().toLowerCase();
    for (let i = 0; i < this.stations.length; i++) {
      if (this.stations[i].name.toLowerCase() === target) {
        return i;
      }
    }
    return -1;
  }

  public addRoute(src: number, dest: number, distance: number, fare: number): boolean {
    if (src === dest || src < 0 || dest < 0 || src >= this.stations.length || dest >= this.stations.length) {
      this.log('error', `Invalid route endpoints: ${src} -> ${dest}`);
      return false;
    }

    // Check if route already exists
    const srcEdges = this.adjList.get(src) || [];
    const destEdges = this.adjList.get(dest) || [];

    const existingSrcEdge = srcEdges.find((e) => e.dest === dest);
    if (existingSrcEdge) {
      existingSrcEdge.distance = distance;
      existingSrcEdge.fare = fare;
      const existingDestEdge = destEdges.find((e) => e.dest === src);
      if (existingDestEdge) {
        existingDestEdge.distance = distance;
        existingDestEdge.fare = fare;
      }
      this.log('system', `Updated route between ${this.stations[src].name} and ${this.stations[dest].name} (${distance} km, ${fare} Taka)`);
      this.updateMemoryStats();
      return true;
    }

    // In C: bidirectional edge
    srcEdges.push({ dest, distance, fare });
    destEdges.push({ dest: src, distance, fare });
    this.adjList.set(src, srcEdges);
    this.adjList.set(dest, destEdges);

    this.log('system', `Route added: ${this.stations[src].name} <-> ${this.stations[dest].name} | ${distance} km | ৳${fare}`);
    this.updateMemoryStats();
    return true;
  }

  public getAllRoutes(): RouteItem[] {
    const routes: RouteItem[] = [];
    const seen = new Set<string>();

    this.adjList.forEach((edges, src) => {
      edges.forEach((edge) => {
        const u = Math.min(src, edge.dest);
        const v = Math.max(src, edge.dest);
        const key = `${u}-${v}`;
        if (!seen.has(key)) {
          seen.add(key);
          routes.push({
            src: u,
            dest: v,
            distance: edge.distance,
            fare: edge.fare,
          });
        }
      });
    });

    return routes;
  }

  // --- MinHeap Implementation (faithful to C struct MinHeap) ---
  private createMinHeap() {
    return {
      arr: [] as { station: number; dist: number }[],
      size: 0,
    };
  }

  private heapPush(heap: { arr: { station: number; dist: number }[]; size: number }, station: number, dist: number) {
    this.metrics.heapOperations++;
    heap.arr.push({ station, dist });
    heap.size = heap.arr.length;
    let i = heap.size - 1;

    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap.arr[parent].dist <= heap.arr[i].dist) break;
      const temp = heap.arr[parent];
      heap.arr[parent] = heap.arr[i];
      heap.arr[i] = temp;
      i = parent;
    }
  }

  private heapPop(heap: { arr: { station: number; dist: number }[]; size: number }) {
    this.metrics.heapOperations++;
    if (heap.arr.length === 0) return null;
    const top = heap.arr[0];
    const last = heap.arr.pop()!;
    heap.size = heap.arr.length;

    if (heap.arr.length > 0) {
      heap.arr[0] = last;
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;

        if (left < heap.size && heap.arr[left].dist < heap.arr[smallest].dist) smallest = left;
        if (right < heap.size && heap.arr[right].dist < heap.arr[smallest].dist) smallest = right;

        if (smallest === i) break;
        const temp = heap.arr[smallest];
        heap.arr[smallest] = heap.arr[i];
        heap.arr[i] = temp;
        i = smallest;
      }
    }
    return top;
  }

  // --- Dijkstra Algorithm ---
  public dijkstra(src: number, dest: number): DijkstraResult {
    const t0 = performance.now();
    const n = this.stations.length;
    const INF = 999999;

    if (src < 0 || dest < 0 || src >= n || dest >= n) {
      return { path: [], distance: -1, fare: -1, visitedNodes: [], executionTimeUs: 0 };
    }

    const dist: number[] = new Array(n).fill(INF);
    const prev: number[] = new Array(n).fill(-1);
    const visited: boolean[] = new Array(n).fill(false);
    const visitedOrder: number[] = [];

    dist[src] = 0;
    const pq = this.createMinHeap();
    this.heapPush(pq, src, 0);

    while (pq.size > 0) {
      const cur = this.heapPop(pq);
      if (!cur) break;
      const u = cur.station;

      if (visited[u]) continue;
      visited[u] = true;
      visitedOrder.push(u);

      if (u === dest) break;

      const edges = this.adjList.get(u) || [];
      for (const e of edges) {
        const v = e.dest;
        const newDist = dist[u] + e.distance;
        if (newDist < dist[v]) {
          dist[v] = newDist;
          prev[v] = u;
          this.heapPush(pq, v, newDist);
        }
      }
    }

    const t1 = performance.now();
    const timeUs = Math.round((t1 - t0) * 1000);

    this.metrics.dijkstraRuns++;
    this.dijkstraTimeTotalUs += timeUs;
    this.metrics.lastDijkstraTimeUs = timeUs;
    this.metrics.avgDijkstraTimeUs = Math.round(this.dijkstraTimeTotalUs / this.metrics.dijkstraRuns);

    if (dist[dest] === INF) {
      this.log('warn', `No route found between ${this.stations[src]?.name} and ${this.stations[dest]?.name}`);
      return { path: [], distance: -1, fare: -1, visitedNodes: visitedOrder, executionTimeUs: timeUs };
    }

    // Reconstruct path
    const path: number[] = [];
    let cur = dest;
    while (cur !== -1) {
      path.push(cur);
      cur = prev[cur];
    }
    path.reverse();

    // Calculate total fare along shortest path edges
    let fareTotal = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const edges = this.adjList.get(from) || [];
      const edge = edges.find((e) => e.dest === to);
      if (edge) fareTotal += edge.fare;
    }

    const pathNames = path.map((id) => this.stations[id]?.name).join(' -> ');
    this.log(
      'algo',
      `[Dijkstra] ${this.stations[src]?.name} to ${this.stations[dest]?.name}: ${dist[dest]} km | ৳${fareTotal} | Path: ${pathNames} (${timeUs} µs)`
    );

    return {
      path,
      distance: dist[dest],
      fare: fareTotal,
      visitedNodes: visitedOrder,
      executionTimeUs: timeUs,
    };
  }

  public getFareForRoute(src: number, dest: number): number {
    const res = this.dijkstra(src, dest);
    return res.fare;
  }

  // --- WaitQueue Priority MinHeap ---
  private waitCompare(a: WaitTicket, b: WaitTicket): number {
    if (a.priority !== b.priority) {
      return a.priority - b.priority; // 1 (VIP) before 2 (General)
    }
    return a.bookTime - b.bookTime; // FIFO
  }

  public waitPush(ticket: WaitTicket): void {
    this.metrics.heapOperations++;
    this.waitQueue.push(ticket);
    let i = this.waitQueue.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.waitCompare(this.waitQueue[parent], this.waitQueue[i]) <= 0) break;
      const temp = this.waitQueue[parent];
      this.waitQueue[parent] = this.waitQueue[i];
      this.waitQueue[i] = temp;
      i = parent;
    }
    this.updateMemoryStats();
  }

  public waitPop(): WaitTicket | null {
    this.metrics.heapOperations++;
    if (this.waitQueue.length === 0) return null;
    const top = this.waitQueue[0];
    const last = this.waitQueue.pop()!;
    if (this.waitQueue.length > 0) {
      this.waitQueue[0] = last;
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let best = i;

        if (left < this.waitQueue.length && this.waitCompare(this.waitQueue[left], this.waitQueue[best]) < 0) {
          best = left;
        }
        if (right < this.waitQueue.length && this.waitCompare(this.waitQueue[right], this.waitQueue[best]) < 0) {
          best = right;
        }

        if (best === i) break;
        const temp = this.waitQueue[best];
        this.waitQueue[best] = this.waitQueue[i];
        this.waitQueue[i] = temp;
        i = best;
      }
    }
    this.updateMemoryStats();
    return top;
  }

  public getSortedWaitlist(): WaitTicket[] {
    const copy = [...this.waitQueue];
    copy.sort((a, b) => this.waitCompare(a, b));
    return copy;
  }

  // --- Binary Search Tree (BST) for Confirmed Tickets ---
  private createTicketNode(id: number, name: string, src: number, dest: number, fare: number): TicketNode {
    return {
      ticketId: id,
      name,
      source: src,
      dest,
      fare,
      left: null,
      right: null,
    };
  }

  private insertBST(root: TicketNode | null, newNode: TicketNode): TicketNode {
    this.metrics.bstOperations++;
    if (root === null) return newNode;
    if (newNode.ticketId < root.ticketId) {
      root.left = this.insertBST(root.left, newNode);
    } else {
      root.right = this.insertBST(root.right, newNode);
    }
    return root;
  }

  public searchTicket(id: number): TicketNode | null {
    this.metrics.bstOperations++;
    let current = this.bookingRoot;
    while (current !== null) {
      this.metrics.bstOperations++;
      if (current.ticketId === id) return current;
      if (id < current.ticketId) current = current.left;
      else current = current.right;
    }
    return null;
  }

  private findMinNode(node: TicketNode): TicketNode {
    let current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }

  private deleteBST(root: TicketNode | null, id: number): TicketNode | null {
    this.metrics.bstOperations++;
    if (root === null) return null;

    if (id < root.ticketId) {
      root.left = this.deleteBST(root.left, id);
    } else if (id > root.ticketId) {
      root.right = this.deleteBST(root.right, id);
    } else {
      // Node found
      if (root.left === null) return root.right;
      if (root.right === null) return root.left;

      // Node with two children: Get in-order successor
      const successor = this.findMinNode(root.right);
      root.ticketId = successor.ticketId;
      root.name = successor.name;
      root.source = successor.source;
      root.dest = successor.dest;
      root.fare = successor.fare;
      root.right = this.deleteBST(root.right, successor.ticketId);
    }
    return root;
  }

  private calculateBstDepth(node: TicketNode | null): number {
    if (!node) return 0;
    return 1 + Math.max(this.calculateBstDepth(node.left), this.calculateBstDepth(node.right));
  }

  public getConfirmedTickets(): Ticket[] {
    const list: Ticket[] = [];
    const traverse = (node: TicketNode | null) => {
      if (!node) return;
      traverse(node.left);
      list.push({
        ticketId: node.ticketId,
        name: node.name,
        source: node.source,
        dest: node.dest,
        fare: node.fare,
        bookedAt: Date.now(),
      });
      traverse(node.right);
    };
    traverse(this.bookingRoot);
    return list;
  }

  // --- High Level Operations ---
  public bookTicket(
    name: string,
    srcName: string,
    destName: string,
    priority: number = 2
  ): { success: boolean; status: 'confirmed' | 'waitlisted' | 'error'; ticketId?: number; fare?: number; message: string } {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, status: 'error', message: 'Passenger name cannot be empty.' };
    }

    const src = this.findStationByName(srcName);
    const dest = this.findStationByName(destName);

    if (src === -1 || dest === -1) {
      const msg = `Invalid station name entered (${srcName} or ${destName})`;
      this.log('error', msg);
      return { success: false, status: 'error', message: msg };
    }

    if (src === dest) {
      const msg = 'Source and destination cannot be the same station.';
      this.log('error', msg);
      return { success: false, status: 'error', message: msg };
    }

    const fare = this.getFareForRoute(src, dest);
    if (fare === -1) {
      const msg = `No route exists between ${this.stations[src].name} and ${this.stations[dest].name}. Booking cancelled.`;
      this.log('error', msg);
      return { success: false, status: 'error', message: msg };
    }

    const ticketId = this.nextTicketId++;

    if (this.bookedSeats < this.maxSeats) {
      const newNode = this.createTicketNode(ticketId, trimmedName, src, dest, fare);
      this.bookingRoot = this.insertBST(this.bookingRoot, newNode);
      this.bookedSeats++;
      this.metrics.ticketsConfirmed++;
      this.metrics.totalRevenue += fare;
      this.updateMemoryStats();

      const msg = `Ticket confirmed! Ticket ID: #${ticketId} | Passenger: ${trimmedName} | Fare: ৳${fare} (${this.stations[src].name} -> ${this.stations[dest].name})`;
      this.log('success', msg);
      return { success: true, status: 'confirmed', ticketId, fare, message: msg };
    } else {
      // Seat limit reached -> Push to waitlist
      const wt: WaitTicket = {
        ticketId,
        name: trimmedName,
        source: src,
        dest,
        priority: priority === 1 ? 1 : 2,
        bookTime: this.bookTimeCounter++,
        addedAt: Date.now(),
      };
      this.waitPush(wt);
      this.updateMemoryStats();

      const priorityLabel = priority === 1 ? 'VIP (Priority 1)' : 'General (Priority 2)';
      const msg = `All seats full (${this.bookedSeats}/${this.maxSeats}). Passenger "${trimmedName}" added to Waitlist as Ticket #${ticketId} with ${priorityLabel}.`;
      this.log('warn', msg);
      return { success: true, status: 'waitlisted', ticketId, fare, message: msg };
    }
  }

  public cancelTicket(id: number): {
    success: boolean;
    cancelledTicket?: TicketNode;
    promotedTicket?: WaitTicket;
    message: string;
  } {
    const found = this.searchTicket(id);
    if (!found) {
      const msg = `No confirmed ticket found with ID #${id}`;
      this.log('error', msg);
      return { success: false, message: msg };
    }

    const cancelledCopy = { ...found };
    this.bookingRoot = this.deleteBST(this.bookingRoot, id);
    this.bookedSeats--;
    this.metrics.ticketsCancelled++;
    this.metrics.totalRevenue = Math.max(0, this.metrics.totalRevenue - cancelledCopy.fare);

    this.log('system', `Ticket #${id} for "${cancelledCopy.name}" cancelled successfully.`);

    // Check if there is someone in waitQueue
    let promotedTicket: WaitTicket | undefined;
    if (this.waitQueue.length > 0) {
      const promoted = this.waitPop()!;
      const fare = this.getFareForRoute(promoted.source, promoted.dest);
      const node = this.createTicketNode(promoted.ticketId, promoted.name, promoted.source, promoted.dest, fare);
      this.bookingRoot = this.insertBST(this.bookingRoot, node);
      this.bookedSeats++;
      this.metrics.promotionsFromWaitlist++;
      this.metrics.ticketsConfirmed++;
      this.metrics.totalRevenue += fare;
      promotedTicket = promoted;

      this.log(
        'success',
        `Seat freed up! Ticket #${promoted.ticketId} for ${promoted.name} [Priority ${promoted.priority}] promoted from waitlist and confirmed!`
      );
    }

    this.updateMemoryStats();
    return {
      success: true,
      cancelledTicket: cancelledCopy,
      promotedTicket,
      message: `Ticket #${id} cancelled.` + (promotedTicket ? ` Waitlisted ticket #${promotedTicket.ticketId} automatically promoted!` : ''),
    };
  }

  public resetAll() {
    this.stations = [];
    this.adjList.clear();
    this.bookingRoot = null;
    this.waitQueue = [];
    this.nextTicketId = 1;
    this.bookTimeCounter = 1;
    this.bookedSeats = 0;
    this.dijkstraTimeTotalUs = 0;
    this.metrics = {
      dijkstraRuns: 0,
      avgDijkstraTimeUs: 0,
      lastDijkstraTimeUs: 0,
      bstOperations: 0,
      bstDepth: 0,
      heapOperations: 0,
      ticketsConfirmed: 0,
      ticketsCancelled: 0,
      promotionsFromWaitlist: 0,
      totalRevenue: 0,
      memory: {
        stationsBytes: 0,
        edgesBytes: 0,
        bstBytes: 0,
        heapBytes: 0,
        waitQueueBytes: 0,
        totalBytes: 0,
      },
    };
    this.updateMemoryStats();
    this.log('system', 'System state reset to initial values.');
  }
}
