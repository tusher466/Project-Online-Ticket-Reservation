<div align="center">
  <img src="./assets/online-ticket-reservation-banner.svg" alt="Online Ticket Reservation" width="100%" />
</div>

# Online Ticket Reservation

An interactive **Online Ticket Reservation System** built around core Data Structures and Algorithms. The project combines railway network routing, ticket booking, cancellation, BST-based ticket search, and a priority waitlist into one visual dashboard.

## Project Overview

The system models a railway network as a graph and uses **Dijkstra's Shortest Path Algorithm** to find the shortest route and calculate the corresponding fare. Confirmed tickets are indexed in a **Binary Search Tree (BST)** for searching and management, while passengers who cannot get a seat are placed in a **priority MinHeap waitlist**.

The application also provides visual tools for understanding how the algorithms work, including the railway network graph, BST structure, waitlist, route calculation, performance metrics, and an interactive terminal that simulates the C-style command interface.

## Main Features

- 🎫 **Ticket Booking** — Book a ticket by passenger name, source, destination, and priority.
- ❌ **Ticket Cancellation** — Cancel a confirmed ticket using its ticket ID.
- 🔎 **Fast Ticket Search** — Search confirmed tickets through the BST index.
- 🌐 **Shortest Route Finder** — Find the shortest railway path between two stations using Dijkstra.
- 💰 **Automatic Fare Calculation** — Calculate total fare along the selected shortest path.
- ⏳ **Priority Waitlist** — Store passengers when all seats are occupied.
- ⭐ **VIP Priority** — VIP passengers are served before General passengers; equal-priority passengers follow booking order.
- 🔄 **Automatic Promotion** — When a confirmed ticket is cancelled, the next eligible waitlisted passenger is automatically promoted.
- 🚉 **Station & Route Management** — Add new stations and bidirectional routes with distance and fare.
- 📊 **Performance Monitoring** — Track Dijkstra execution time, BST operations, heap operations, bookings, cancellations, promotions, revenue, and estimated memory usage.
- 🧩 **Algorithm Visualization** — Explore the graph, BST, waitlist, and algorithm activity visually.
- 💻 **Interactive C-Style Terminal** — Run commands such as booking, cancellation, search, bookings, waitlist, and Dijkstra route queries.

## Data Structures & Algorithms

| Component | Data Structure / Algorithm | Purpose |
|---|---|---|
| Railway Network | **Graph + Adjacency List** | Represents stations and bidirectional routes |
| Route Finding | **Dijkstra's Algorithm** | Finds the shortest-distance path |
| Dijkstra Priority Handling | **MinHeap / Priority Queue** | Selects the next closest station efficiently |
| Confirmed Tickets | **Binary Search Tree (BST)** | Stores, searches, deletes, and traverses tickets by ID |
| Waitlist | **Priority MinHeap** | Selects VIP passengers first and maintains FIFO order within the same priority |

### Booking Flow

```text
Passenger Request
       │
       ▼
Validate Passenger & Stations
       │
       ▼
Run Dijkstra → Calculate Route & Fare
       │
       ▼
   Seats Available?
     ┌──────┴──────┐
    Yes            No
     │              │
     ▼              ▼
Insert into BST   Add to Priority MinHeap
     │              │
     ▼              ▼
Confirmed Ticket   Waitlisted Ticket
```

### Cancellation & Promotion

```text
Cancel Confirmed Ticket
          │
          ▼
      Delete from BST
          │
          ▼
       Free a Seat
          │
          ▼
 Waitlist Empty? ── No ──► Pop Highest Priority Passenger
          │                         │
         Yes                        ▼
          │                  Insert into BST
          ▼                         │
        Finish                Confirm New Ticket
```

## System Modules

### 1. Railway Network

The default preset represents a Bangladesh Railway-style network connecting major locations. Stations are represented as graph nodes, while routes store distance and fare information.

### 2. Dijkstra Route Finder

The route finder calculates the shortest distance between two stations. After finding the path, the system reconstructs the route and adds the fare of each edge to calculate the total fare.

### 3. Ticket Reservation

The booking module validates the passenger and stations, calculates the route fare, generates a ticket ID, and either confirms the ticket or places it on the waitlist when the seat limit is reached.

### 4. BST Booking Index

Confirmed tickets are stored using their ticket IDs as BST keys. The system supports insertion, search, deletion, and in-order traversal of confirmed bookings.

### 5. Priority Waitlist

The waitlist uses a MinHeap-style priority queue. **Priority 1 = VIP** and **Priority 2 = General**. If two passengers have the same priority, their booking timestamp determines their order.

### 6. Performance & Memory Telemetry

The dashboard records algorithm activity such as Dijkstra runs, average and last execution time, BST operations, heap operations, confirmed tickets, cancellations, waitlist promotions, revenue, and estimated memory usage based on the project's C-style structures.

## Technology Stack

- **React** — User interface
- **TypeScript** — Application logic and type safety
- **Vite** — Development server and build tool
- **Tailwind CSS** — Interface styling
- **Motion** — UI animations
- **Recharts** — Performance/analytics visualization
- **Lucide React** — Interface icons
- **Google GenAI package** — Included in the project dependencies for AI integration support

## Project Structure

```text
Online-Ticket-Reservation/
├── assets/
│   └── online-ticket-reservation-banner.svg
├── src/
│   ├── components/
│   │   ├── widgets/
│   │   │   ├── BookingWidget.tsx
│   │   │   ├── BstVisualizerWidget.tsx
│   │   │   ├── CSourceCodeWidget.tsx
│   │   │   ├── NetworkGraphWidget.tsx
│   │   │   ├── NetworkManagerWidget.tsx
│   │   │   ├── PerformanceMetricsWidget.tsx
│   │   │   ├── RouteFinderWidget.tsx
│   │   │   ├── TerminalConsoleWidget.tsx
│   │   │   └── WaitlistWidget.tsx
│   │   ├── DashboardGrid.tsx
│   │   ├── Navbar.tsx
│   │   ├── QuickBookModal.tsx
│   │   ├── TicketModal.tsx
│   │   └── WidgetDrawerModal.tsx
│   ├── engine/
│   │   ├── cEngine.ts
│   │   └── mockData.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Run the Project

### 1. Install dependencies

```bash
npm install
```

Or, if you use Bun:

```bash
bun install
```

### 2. Start the development server

```bash
npm run dev
```

Or:

```bash
bun run dev
```

### 3. Build for production

```bash
npm run build
```

## Terminal Commands

The built-in terminal provides a C-style interface for the main operations:

```text
1 or book [name] [src] [dest] [prio] : Book ticket
2 or cancel <id>                    : Cancel ticket by ID
3 or search <id>                    : Search ticket in BST
4 or bookings                       : Print confirmed bookings
5 or waitlist                       : View priority waitlist
6 or dijkstra <srcId> <destId>      : Run Dijkstra shortest path
```

## Core Complexity

| Operation | Expected Complexity |
|---|---:|
| BST Search | O(h) — O(log n) when balanced, O(n) worst case |
| BST Insertion | O(h) — O(log n) average, O(n) worst case |
| BST Deletion | O(h) — O(log n) average, O(n) worst case |
| MinHeap Insert | O(log n) |
| MinHeap Remove | O(log n) |
| Dijkstra with MinHeap | O((V + E) log V) |
| In-order BST Traversal | O(n) |

## What This Project Demonstrates

This project is primarily designed to demonstrate how multiple Data Structures and Algorithms can work together in a realistic reservation system:

**Graph → Dijkstra → MinHeap → BST → Priority Waitlist → Automatic Promotion**

Instead of implementing each structure separately, the system connects them into one complete workflow for route management, ticket reservation, ticket searching, cancellation, and waitlist handling.
