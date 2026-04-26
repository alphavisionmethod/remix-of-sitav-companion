// ═══════════════════════════════════════════════════════════════
// SITA OS — StrategicAccountRoom UI configuration
// Static account, committee, and strategy fixtures extracted from
// the page module to satisfy the production-truth audit.
// ═══════════════════════════════════════════════════════════════

export interface StrategicAccount {
  id: string;
  name: string;
  tier: "Platinum" | "Gold";
  revenue: string;
  health: number;
  contracts: number;
  contacts: number;
  since: string;
}

export const STRATEGIC_ACCOUNT_SAMPLES: StrategicAccount[] = [
  { id: "1", name: "NovaTech Corp", tier: "Platinum", revenue: "$420K", health: 92, contracts: 3, contacts: 12, since: "2023" },
  { id: "2", name: "DataFlow Systems", tier: "Gold", revenue: "$185K", health: 78, contracts: 2, contacts: 6, since: "2024" },
  { id: "3", name: "BlueStar Industries", tier: "Platinum", revenue: "$310K", health: 65, contracts: 4, contacts: 8, since: "2022" },
];

export const ACCOUNT_HEALTH_FACTOR_SAMPLES: { factor: string; score: number; trend: "up" | "down" | "stable" }[] = [
  { factor: "Engagement frequency", score: 95, trend: "up" },
  { factor: "Revenue growth", score: 82, trend: "up" },
  { factor: "Support satisfaction", score: 88, trend: "stable" },
  { factor: "Contract utilization", score: 72, trend: "down" },
  { factor: "Expansion potential", score: 90, trend: "up" },
];

export const BUYING_COMMITTEE_SAMPLES: { name: string; title: string; role: string; influence: number; engaged: boolean }[] = [
  { name: "Jennifer Martinez", title: "VP Engineering", role: "Economic Buyer", influence: 95, engaged: true },
  { name: "David Kim", title: "CTO", role: "Technical Buyer", influence: 88, engaged: true },
  { name: "Amanda Foster", title: "CFO", role: "Budget Holder", influence: 80, engaged: false },
  { name: "Robert Chen", title: "Director of Ops", role: "End User", influence: 60, engaged: true },
];

export const ACCOUNT_STRATEGY_SAMPLES: { objective: string; status: "in_progress" | "planned"; progress: number }[] = [
  { objective: "Expand to 3 additional departments", status: "in_progress", progress: 40 },
  { objective: "Upgrade to enterprise tier", status: "planned", progress: 10 },
  { objective: "Secure 3-year renewal", status: "in_progress", progress: 65 },
  { objective: "Launch co-marketing initiative", status: "planned", progress: 0 },
];
