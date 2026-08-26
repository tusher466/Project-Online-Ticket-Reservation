import React, { useState } from 'react';
import { Code2, BookOpen, Layers, Check, Copy } from 'lucide-react';

export const CSourceCodeWidget: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'structs' | 'dijkstra' | 'bst' | 'waitlist'>('structs');
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    structs: `// Core C Struct Definitions
typedef struct Edge {
    int dest;
    int distance;
    int fare;
    struct Edge *next;
} Edge;

typedef struct {
    int id;
    char name[50];
} Station;

typedef struct {
    int station;
    int dist;
} HeapNode;

typedef struct {
    HeapNode *arr;
    int size;
    int capacity;
} MinHeap;

typedef struct {
    int ticketId;
    char name[50];
    int source;
    int dest;
    int priority; // 1 = VIP, 2 = General
    int bookTime;
} WaitTicket;

typedef struct TicketNode {
    int ticketId;
    char name[50];
    int source;
    int dest;
    int fare;
    struct TicketNode *left;
    struct TicketNode *right;
} TicketNode;`,

    dijkstra: `// Dijkstra's Shortest Path with MinHeap Priority Queue
void dijkstra(int src, int dest) {
    int *dist = malloc(stationCount * sizeof(int));
    int *prev = malloc(stationCount * sizeof(int));
    int *visited = malloc(stationCount * sizeof(int));
    for (int i = 0; i < stationCount; i++) {
        dist[i] = INF;
        prev[i] = -1;
        visited[i] = 0;
    }
    dist[src] = 0;

    MinHeap *pq = createMinHeap();
    heapPush(pq, src, 0);

    while (pq->size > 0) {
        HeapNode cur = heapPop(pq);
        int u = cur.station;
        if (visited[u]) continue;
        visited[u] = 1;

        Edge *e = adjList[u];
        while (e != NULL) {
            int v = e->dest;
            int newDist = dist[u] + e->distance;
            if (newDist < dist[v]) {
                dist[v] = newDist;
                prev[v] = u;
                heapPush(pq, v, newDist);
            }
            e = e->next;
        }
    }
    // Path reconstruction and fare calculation...
}`,

    bst: `// Confirmed Tickets Binary Search Tree (BST)
TicketNode *insertTicket(TicketNode *root, TicketNode *newNode) {
    if (root == NULL) return newNode;
    if (newNode->ticketId < root->ticketId)
        root->left = insertTicket(root->left, newNode);
    else
        root->right = insertTicket(root->right, newNode);
    return root;
}

TicketNode *searchTicket(TicketNode *root, int id) {
    if (root == NULL || root->ticketId == id) return root;
    if (id < root->ticketId)
        return searchTicket(root->left, id);
    return searchTicket(root->right, id);
}

TicketNode *deleteTicket(TicketNode *root, int id) {
    if (root == NULL) return NULL;
    if (id < root->ticketId) root->left = deleteTicket(root->left, id);
    else if (id > root->ticketId) root->right = deleteTicket(root->right, id);
    else {
        if (root->left == NULL) {
            TicketNode *temp = root->right;
            free(root);
            return temp;
        } else if (root->right == NULL) {
            TicketNode *temp = root->left;
            free(root);
            return temp;
        }
        TicketNode *successor = findMin(root->right);
        root->ticketId = successor->ticketId;
        strcpy(root->name, successor->name);
        root->source = successor->source;
        root->dest = successor->dest;
        root->fare = successor->fare;
        root->right = deleteTicket(root->right, successor->ticketId);
    }
    return root;
}`,

    waitlist: `// Priority WaitQueue (MinHeap with Priority & BookTime)
int waitCompare(WaitTicket a, WaitTicket b) {
    if (a.priority != b.priority)
        return a.priority - b.priority; // 1 (VIP) < 2 (General)
    return a.bookTime - b.bookTime;    // FIFO timestamp tie-breaker
}

void cancelTicket() {
    int id;
    // ... search and delete from BST ...
    bookingRoot = deleteTicket(bookingRoot, id);
    bookedSeats--;

    if (waitQueue.size > 0) {
        WaitTicket promoted = waitPop();
        int fare = getFareForRoute(promoted.source, promoted.dest);
        TicketNode *node = createTicketNode(promoted.ticketId, promoted.name, promoted.source, promoted.dest, fare);
        bookingRoot = insertTicket(bookingRoot, node);
        bookedSeats++;
        printf("Seat freed up! Ticket #%d promoted from waitlist\\n", promoted.ticketId);
    }
}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeSection]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0C10] text-slate-200 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0D1117]/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-300 font-sans">C Engine Source Architecture</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700/60 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 py-1 bg-[#161B22] border-b border-slate-800 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSection('structs')}
          className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
            activeSection === 'structs' ? 'bg-[#0D1117] text-cyan-300 border border-slate-700 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Data Structs
        </button>
        <button
          onClick={() => setActiveSection('dijkstra')}
          className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
            activeSection === 'dijkstra' ? 'bg-[#0D1117] text-cyan-300 border border-slate-700 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dijkstra MinHeap
        </button>
        <button
          onClick={() => setActiveSection('bst')}
          className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
            activeSection === 'bst' ? 'bg-[#0D1117] text-cyan-300 border border-slate-700 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          BST Bookings
        </button>
        <button
          onClick={() => setActiveSection('waitlist')}
          className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
            activeSection === 'waitlist' ? 'bg-[#0D1117] text-cyan-300 border border-slate-700 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Priority Promotion
        </button>
      </div>

      {/* Code Display Area */}
      <div className="flex-1 p-3.5 overflow-auto text-xs bg-[#0A0C10] font-mono text-emerald-400/90 leading-relaxed select-text">
        <pre className="whitespace-pre">{codeSnippets[activeSection]}</pre>
      </div>
    </div>
  );
};
