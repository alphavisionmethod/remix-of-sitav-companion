// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Concierge Domain: Service-Output DTOs
//
// Derived/computed view types produced by Concierge services and
// consumed by the UI layer. These are NOT persistent entities —
// persistent entities live in `@/packages/concierge-contracts` and
// are re-exported via `../contracts`.
//
// Pure types only. No React, no runtime, no I/O. Domain depends
// on nothing.
// ═══════════════════════════════════════════════════════════════

import type {
  HouseholdTask,
  TripSummary,
} from "@/packages/concierge-contracts";

// ── Household: aggregated views ──────────────────────────────

export interface HouseholdOverview {
  memberCount: number;
  activeTasks: number;
  overdueTasks: number;
  upcomingEvents: number;
  loadBalanceScore: number;
  topPriorities: string[];
  generatedAt: string;
}

export interface HouseholdBoardroomPacket {
  activeTasks: number;
  overdueTasks: number;
  loadBalanceScore: number;
  upcomingEvents: string[];
  calendarConflicts: number;
  schoolItems: number;
  travelPrep: { tripName: string; readinessPct: number }[];
  actionItems: string[];
  generatedAt: string;
}

// ── Responsibilities & load distribution ─────────────────────

export interface ResponsibilityAssignment {
  memberId: string;
  memberName: string;
  tasks: HouseholdTask[];
  totalMinutes: number;
}

export interface LoadReport {
  memberId: string;
  name: string;
  taskCount: number;
  hours: number;
  overloaded: boolean;
}

// ── Activities, gifts, school ────────────────────────────────

export interface ActivityChecklist {
  activityName: string;
  items: { task: string; done: boolean }[];
  completionPct: number;
}

export interface GiftReminder {
  id: string;
  recipientName: string;
  occasion: string;
  date: string;
  daysUntil: number;
  budgetCents: number;
  ideas: string[];
  purchased: boolean;
}

export interface SchoolItem {
  id: string;
  childId: string;
  title: string;
  dueDate: string;
  type: "assignment" | "event" | "supply" | "form";
  completed: boolean;
}

// ── Trips ────────────────────────────────────────────────────

export interface TripDashboard {
  upcoming: TripSummary[];
  active: TripSummary[];
  past: TripSummary[];
  totalBudgetCents: number;
  totalSpentCents: number;
}

// ── Calendar reconciliation (lightweight derived views) ──────
//
// NOTE: The persistent `CalendarConflict` entity (richer shape)
// lives in `@/packages/concierge-contracts/calendar-conflict`
// and is re-exported via this domain's contracts barrel. The
// types below are the lightweight pair-detection views produced
// by reconciliation/conflict-detector services.

export interface LocalCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  calendar: string;
  attendees: string[];
}

export interface CalendarOverlapPair {
  eventA: LocalCalendarEvent;
  eventB: LocalCalendarEvent;
  overlapMinutes: number;
}

export interface CalendarReconciliationReport {
  totalEvents: number;
  conflicts: CalendarOverlapPair[];
  gaps: { date: string; hours: number }[];
}

export interface OverlapResolutionSuggestion {
  conflict: CalendarOverlapPair;
  suggestion: string;
  autoResolvable: boolean;
}

// ── Event continuity (lightweight tracker) ───────────────────
//
// NOTE: The persistent `EventPlan` entity (richer shape) lives in
// `@/packages/concierge-contracts/event-plan` and is re-exported
// via this domain's contracts barrel. `EventContinuityPlan` is
// the lightweight derived tracker produced by the event-continuity
// service.

export interface EventContinuityPlan {
  id: string;
  name: string;
  date: string;
  tasks: { task: string; done: boolean; assignedTo?: string }[];
  completionPct: number;
}