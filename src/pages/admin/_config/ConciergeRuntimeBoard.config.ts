// ═══════════════════════════════════════════════════════════════
// ConciergeRuntimeBoard — UI catalog (Wave 9.2)
//
// Authored concierge runtime catalog. Live `household_tasks` rows
// come from the live useQuery hook in the page; everything else is
// authored operator-grounded fixture data.
// ═══════════════════════════════════════════════════════════════

export type TaskState = "active" | "completed" | "broken" | "stale";
export type ConciergeDomain = "task" | "travel" | "household" | "promise";
export type SLAStatus = "healthy" | "at-risk" | "below";
export type ReceiptOutcome = "success" | "failed";

export interface ConciergeTask {
  id: string;
  title: string;
  domain: ConciergeDomain;
  state: TaskState;
  assignee: string;
  lastUpdated: string;
  continuityBroken: boolean;
  receiptRef?: string;
}

export interface TravelLeg {
  id: string;
  trip: string;
  status: "active" | "completed";
  legs: number;
  completed: number;
  nextAction: string;
  lastUpdated: string;
}

export interface HouseholdCommitment {
  id: string;
  commitment: string;
  status: TaskState;
  frequency: string;
  nextDue: string;
  assignee: string;
  lastFulfilled: string;
}

export interface ConciergePromise {
  id: string;
  promise: string;
  status: TaskState;
  dueDate: string;
  owner: string;
  confidence: number;
}

export interface ConciergeReceipt {
  id: string;
  action: string;
  agent: string;
  timestamp: string;
  outcome: ReceiptOutcome;
}

export interface ConciergeSLA {
  metric: string;
  target: number;
  current: number;
  unit: string;
  status: SLAStatus;
}

export const TASK_STATE_BADGE: Record<TaskState, string> = {
  active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  broken: "bg-red-500/10 text-red-500 border-red-500/20",
  stale: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

/** Authored concierge task registry. */
export const CONCIERGE_TASKS: ConciergeTask[] = [
  { id: "ct-1", title: "Berlin → London business trip continuity", domain: "travel", state: "active", assignee: "travel-agent", lastUpdated: "2026-04-05T10:00:00Z", continuityBroken: false, receiptRef: "rc-001" },
  { id: "ct-2", title: "Weekly grocery delivery handoff", domain: "household", state: "active", assignee: "household-agent", lastUpdated: "2026-04-04T08:30:00Z", continuityBroken: false, receiptRef: "rc-002" },
  { id: "ct-3", title: "Anniversary dinner reservation", domain: "promise", state: "completed", assignee: "concierge-agent", lastUpdated: "2026-04-08T20:15:00Z", continuityBroken: false, receiptRef: "rc-003" },
  { id: "ct-4", title: "Home inspection report follow-up", domain: "task", state: "broken", assignee: "household-agent", lastUpdated: "2026-04-03T14:00:00Z", continuityBroken: true },
  { id: "ct-5", title: "Annual insurance renewal", domain: "household", state: "stale", assignee: "concierge-agent", lastUpdated: "2026-04-01T09:00:00Z", continuityBroken: false },
];

/** Authored travel state. */
export const CONCIERGE_TRAVEL: TravelLeg[] = [
  { id: "tr-1", trip: "Berlin → London", status: "active", legs: 3, completed: 1, nextAction: "Check-in opens at 14:00", lastUpdated: "2026-04-05T10:00:00Z" },
  { id: "tr-2", trip: "Tokyo Business Trip", status: "completed", legs: 5, completed: 5, nextAction: "Expense report pending", lastUpdated: "2026-04-02T18:00:00Z" },
];

/** Authored household commitments. */
export const CONCIERGE_HOUSEHOLD: HouseholdCommitment[] = [
  { id: "hh-1", commitment: "Weekly grocery delivery", status: "active", frequency: "Weekly", nextDue: "2026-04-07", assignee: "household-agent", lastFulfilled: "2026-03-31" },
  { id: "hh-2", commitment: "Monthly budget review", status: "active", frequency: "Monthly", nextDue: "2026-04-30", assignee: "finance-advisor", lastFulfilled: "2026-03-28" },
  { id: "hh-3", commitment: "Insurance renewal", status: "stale", frequency: "Annual", nextDue: "2026-04-15", assignee: "concierge-agent", lastFulfilled: "2025-04-15" },
];

/** Authored promise registry. */
export const CONCIERGE_PROMISES: ConciergePromise[] = [
  { id: "pm-1", promise: "Send updated portfolio summary by Friday", status: "active", dueDate: "2026-04-11", owner: "finance-advisor", confidence: 92 },
  { id: "pm-2", promise: "Book restaurant for anniversary", status: "completed", dueDate: "2026-04-08", owner: "concierge-agent", confidence: 100 },
  { id: "pm-3", promise: "Follow up on home inspection report", status: "broken", dueDate: "2026-04-03", owner: "household-agent", confidence: 0 },
];

/** Authored receipt feed. */
export const CONCIERGE_RECEIPTS: ConciergeReceipt[] = [
  { id: "rc-1", action: "Booked restaurant reservation", agent: "concierge-agent", timestamp: "2026-04-05T09:30:00Z", outcome: "success" },
  { id: "rc-2", action: "Submitted expense report", agent: "finance-advisor", timestamp: "2026-04-04T16:00:00Z", outcome: "success" },
  { id: "rc-3", action: "Attempted flight rebooking", agent: "travel-agent", timestamp: "2026-04-03T11:00:00Z", outcome: "failed" },
  { id: "rc-4", action: "Grocery order placed", agent: "household-agent", timestamp: "2026-04-01T08:00:00Z", outcome: "success" },
];

/** Authored SLA tracking. */
export const CONCIERGE_SLA: ConciergeSLA[] = [
  { metric: "Promise fulfillment rate", target: 95, current: 67, unit: "%", status: "below" },
  { metric: "Task completion within SLA", target: 90, current: 88, unit: "%", status: "at-risk" },
  { metric: "Travel continuity", target: 99, current: 100, unit: "%", status: "healthy" },
  { metric: "Household commitment adherence", target: 95, current: 67, unit: "%", status: "below" },
];