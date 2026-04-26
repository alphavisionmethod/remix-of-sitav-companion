// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Upcoming Needs demo fixtures
// Demo-mode-only. Consumed via useRealityModeSafe().isDemo gate.
// ═══════════════════════════════════════════════════════════════

import type { UpcomingObligation, ReviewItem } from "@/modules/concierge/components/concierge";

export const UPCOMING_OBLIGATIONS_DEMO: ReadonlyArray<UpcomingObligation> = [
  { id: "u1",  title: "Dentist appointment — Alex",          type: "appointment", dueLabel: "Today 2:30 PM",  who: "Alex",    prepNeeded: true },
  { id: "u2",  title: "Drop off UPS package",                  type: "errand",      dueLabel: "Today",          who: "You" },
  { id: "u3",  title: "Hotel check-in confirmation",           type: "reservation", dueLabel: "Tomorrow",                       prepNeeded: true },
  { id: "u4",  title: "Permission slip deadline",              type: "admin",       dueLabel: "Tomorrow",       who: "Alex" },
  { id: "u5",  title: "Lake Tahoe trip begins",                type: "travel",      dueLabel: "In 12 days",     who: "Family" },
  { id: "u6",  title: "Mortgage payment auto-draft",           type: "recurring",   dueLabel: "In 3 days" },
  { id: "u7",  title: "Plumber follow-up call",                type: "errand",      dueLabel: "Overdue 4 days", who: "You" },
  { id: "u8",  title: "Spring break flight check-in",          type: "travel",      dueLabel: "In 16 days" },
  { id: "u9",  title: "HVAC annual inspection",                type: "recurring",   dueLabel: "Overdue 1 week" },
  { id: "u10", title: "Restaurant reservation — anniversary",  type: "reservation", dueLabel: "In 5 days",      who: "Partner" },
  { id: "u11", title: "Car oil change",                        type: "errand",      dueLabel: "This week" },
  { id: "u12", title: "Renew parking permit",                  type: "admin",       dueLabel: "In 10 days" },
] as const;

export const UPCOMING_REVIEW_ITEMS_DEMO: ReadonlyArray<ReviewItem> = [
  { id: "r1", title: "Weekly grocery auto-order",        reason: "New items added — review before submit",       urgency: "medium" },
  { id: "r2", title: "Pet sitter booking — $280",        reason: "Spending over $200 policy",                    urgency: "high"   },
  { id: "r3", title: "Reschedule dentist proposal",      reason: "AI detected conflict with soccer match",       urgency: "medium" },
] as const;