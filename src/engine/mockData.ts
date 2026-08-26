import { CEngine } from './cEngine';

export interface NetworkPreset {
  id: string;
  name: string;
  description: string;
  load: (engine: CEngine) => void;
}

export const PRESETS: NetworkPreset[] = [
  {
    id: 'bangladesh-railway',
    name: 'Bangladesh Railway Network (Default)',
    description: 'Intercity railway network connecting major divisions: Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, and Cox\'s Bazar.',
    load: (engine: CEngine) => {
      engine.resetAll();
      engine.maxSeats = 5;

      // Stations with coordinates for nice visual graph layout
      const dhaka = engine.addStation('Dhaka', 380, 220);
      const chittagong = engine.addStation('Chittagong', 560, 360);
      const sylhet = engine.addStation('Sylhet', 560, 110);
      const rajshahi = engine.addStation('Rajshahi', 170, 140);
      const khulna = engine.addStation('Khulna', 210, 340);
      const coxbazar = engine.addStation("Cox's Bazar", 680, 460);
      const comilla = engine.addStation('Comilla', 470, 290);
      const mymensingh = engine.addStation('Mymensingh', 360, 90);

      // Routes (src, dest, distance km, fare Taka)
      engine.addRoute(dhaka, comilla, 97, 180);
      engine.addRoute(comilla, chittagong, 145, 270);
      engine.addRoute(chittagong, coxbazar, 150, 320);
      engine.addRoute(dhaka, sylhet, 240, 420);
      engine.addRoute(dhaka, mymensingh, 120, 190);
      engine.addRoute(mymensingh, sylhet, 195, 310);
      engine.addRoute(dhaka, rajshahi, 255, 450);
      engine.addRoute(dhaka, khulna, 275, 480);
      engine.addRoute(khulna, rajshahi, 215, 360);
      engine.addRoute(comilla, sylhet, 185, 330);

      // Seed some initial bookings to demonstrate BST and Waitlist
      engine.bookTicket('Tusher Hossen', 'Dhaka', 'Chittagong', 1); // VIP #1
      engine.bookTicket('Amina Rahman', 'Dhaka', 'Sylhet', 2); // General #2
      engine.bookTicket('Rafiqul Islam', 'Rajshahi', 'Dhaka', 2); // General #3
      engine.bookTicket('Farhana Akter', 'Khulna', 'Chittagong', 1); // VIP #4
      engine.bookTicket('Kamal Hossain', 'Dhaka', "Cox's Bazar", 2); // General #5 (Seats full now!)

      // These will enter Waitlist with priority heap ordering
      engine.bookTicket('Dr. Anisur Rahman', 'Dhaka', 'Chittagong', 1); // VIP waitlisted #6
      engine.bookTicket('Nusrat Jahan', 'Sylhet', 'Dhaka', 2); // General waitlisted #7
      engine.bookTicket('Minister Shahriar', 'Rajshahi', 'Sylhet', 1); // VIP waitlisted #8 (will jump in front of General!)
    },
  },
  {
    id: 'metro-rapid',
    name: 'Dhaka Metro Transit (MRT Line-6)',
    description: 'High-frequency urban rapid transit line from Uttara North to Motijheel with high passenger throughput.',
    load: (engine: CEngine) => {
      engine.resetAll();
      engine.maxSeats = 6;

      const uNorth = engine.addStation('Uttara North', 150, 80);
      const uCenter = engine.addStation('Uttara Center', 230, 120);
      const uSouth = engine.addStation('Uttara South', 310, 160);
      const pallabi = engine.addStation('Pallabi', 390, 200);
      const mirpur10 = engine.addStation('Mirpur 10', 470, 240);
      const kazipara = engine.addStation('Kazipara', 540, 280);
      const agargaon = engine.addStation('Agargaon', 610, 320);
      const farmgate = engine.addStation('Farmgate', 680, 360);
      const motijheel = engine.addStation('Motijheel', 750, 410);

      engine.addRoute(uNorth, uCenter, 2, 20);
      engine.addRoute(uCenter, uSouth, 2, 20);
      engine.addRoute(uSouth, pallabi, 3, 30);
      engine.addRoute(pallabi, mirpur10, 2, 20);
      engine.addRoute(mirpur10, kazipara, 2, 20);
      engine.addRoute(kazipara, agargaon, 3, 30);
      engine.addRoute(agargaon, farmgate, 4, 40);
      engine.addRoute(farmgate, motijheel, 4, 40);

      // Seed bookings
      engine.bookTicket('Tahmid Zaman', 'Uttara North', 'Motijheel', 1);
      engine.bookTicket('Sadia Afrin', 'Mirpur 10', 'Farmgate', 2);
      engine.bookTicket('Zubair Hasan', 'Pallabi', 'Motijheel', 2);
      engine.bookTicket('Sumaiya Khan', 'Uttara Center', 'Agargaon', 1);
      engine.bookTicket('Rezaul Karim', 'Kazipara', 'Motijheel', 2);
      engine.bookTicket('Sultana Parvin', 'Uttara North', 'Farmgate', 2);
      // Waitlist
      engine.bookTicket('VIP Mahbub', 'Agargaon', 'Motijheel', 1);
      engine.bookTicket('Hasan Mahmud', 'Mirpur 10', 'Motijheel', 2);
    },
  },
  {
    id: 'minimal-triangle',
    name: 'Minimal Triangle Topology (3 Stations)',
    description: 'Simple 3-node connected graph for testing basic Dijkstra path calculation, BST insertion, and deletion.',
    load: (engine: CEngine) => {
      engine.resetAll();
      engine.maxSeats = 3;

      const sA = engine.addStation('Station Alpha', 200, 100);
      const sB = engine.addStation('Station Beta', 500, 100);
      const sC = engine.addStation('Station Gamma', 350, 320);

      engine.addRoute(sA, sB, 100, 150);
      engine.addRoute(sB, sC, 80, 120);
      engine.addRoute(sA, sC, 160, 220);

      engine.bookTicket('Alice Walker', 'Station Alpha', 'Station Beta', 1);
      engine.bookTicket('Bob Vance', 'Station Beta', 'Station Gamma', 2);
      engine.bookTicket('Charlie Brown', 'Station Alpha', 'Station Gamma', 2);
      engine.bookTicket('David VIP', 'Station Alpha', 'Station Beta', 1);
    },
  },
];
