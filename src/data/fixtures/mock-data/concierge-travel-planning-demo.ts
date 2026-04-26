// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Travel Planning demo fixtures
// Demo-mode-only. Consumed via useRealityModeSafe().isDemo gate.
// ═══════════════════════════════════════════════════════════════

export interface DemoTrip {
  id: string;
  destination: string;
  dates: string;
  status: "planning" | "booked" | "upcoming" | "active" | "completed";
  travelers: string;
  budget: string;
  spent: string;
  tasks: number;
  completedTasks: number;
  documents: number;
  daysUntil: number;
  type: "family" | "business" | "mixed";
}

export const TRAVEL_TRIPS_DEMO: ReadonlyArray<DemoTrip> = [
  { id: "1", destination: "Lake Tahoe — Family Ski Trip",         dates: "Feb 14–18, 2026", status: "upcoming", travelers: "4 travelers", budget: "$4,200", spent: "$3,100", tasks: 8,  completedTasks: 6, documents: 5, daysUntil: 12, type: "family" },
  { id: "2", destination: "Cancún — Spring Break",                dates: "Apr 10–17, 2026", status: "planning", travelers: "4 travelers", budget: "$6,500", spent: "$1,200", tasks: 12, completedTasks: 3, documents: 2, daysUntil: 18, type: "family" },
  { id: "3", destination: "NYC — Business + Family Extension",    dates: "May 5–8, 2026",   status: "planning", travelers: "2 travelers", budget: "$2,800", spent: "$0",     tasks: 6,  completedTasks: 0, documents: 0, daysUntil: 43, type: "mixed"  },
] as const;

export const TRAVEL_RESERVATIONS_DEMO = [
  { id: "res1", title: "Hotel — Lake Tahoe Resort", date: "Feb 14–18", status: "confirmed" as const, linkedTrip: "Lake Tahoe" },
  { id: "res2", title: "Flight — SFO → CUN",         date: "Apr 10",    status: "confirmed" as const, linkedTrip: "Cancún"     },
  { id: "res3", title: "Car rental — Cancún",        date: "Apr 10–17", status: "missing"   as const, linkedTrip: "Cancún"     },
] as const;