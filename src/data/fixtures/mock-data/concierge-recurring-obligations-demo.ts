// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Recurring Obligations demo fixtures
// Demo-mode-only. Consumed via useRealityModeSafe().isDemo gate.
// ═══════════════════════════════════════════════════════════════

export interface RecurringItem {
  id: string;
  title: string;
  category: "admin" | "health" | "finance" | "household" | "school" | "vehicle" | "personal";
  frequency: string;
  nextDue: string;
  lastCompleted?: string;
  status: "on-track" | "due-soon" | "overdue" | "review-needed";
  effort: "low" | "medium" | "high";
  automatable?: boolean;
}

export const RECURRING_ITEMS_DEMO: ReadonlyArray<RecurringItem> = [
  { id: "r1",  title: "Mortgage payment",                category: "finance",   frequency: "Monthly",          nextDue: "In 3 days",        lastCompleted: "Mar 1",  status: "on-track",      effort: "low",    automatable: true },
  { id: "r2",  title: "HVAC filter replacement",         category: "household", frequency: "Every 90 days",    nextDue: "Overdue 7 days",   lastCompleted: "Dec 15", status: "overdue",       effort: "medium" },
  { id: "r3",  title: "Car oil change",                  category: "vehicle",   frequency: "Every 5,000 mi",   nextDue: "This week",                                  status: "due-soon",      effort: "medium" },
  { id: "r4",  title: "Dental checkup — family",         category: "health",    frequency: "Every 6 months",   nextDue: "Today",            lastCompleted: "Oct 10", status: "due-soon",      effort: "high"   },
  { id: "r5",  title: "Water filter replacement",        category: "household", frequency: "Every 60 days",    nextDue: "In 12 days",       lastCompleted: "Feb 8",  status: "on-track",      effort: "low",    automatable: true },
  { id: "r6",  title: "Parking permit renewal",          category: "admin",     frequency: "Annually",         nextDue: "In 10 days",                                 status: "on-track",      effort: "low"    },
  { id: "r7",  title: "Pet vaccination — annual",        category: "personal",  frequency: "Annually",         nextDue: "In 6 weeks",       lastCompleted: "May 2025", status: "on-track",    effort: "medium" },
  { id: "r8",  title: "Smoke detector battery check",    category: "household", frequency: "Every 6 months",   nextDue: "In 2 weeks",                                 status: "on-track",      effort: "low"    },
  { id: "r9",  title: "Insurance policy review",         category: "finance",   frequency: "Annually",         nextDue: "Overdue 3 weeks",                            status: "overdue",       effort: "high"   },
  { id: "r10", title: "School lunch balance refill",     category: "school",    frequency: "Bi-weekly",        nextDue: "In 4 days",        lastCompleted: "Mar 28", status: "on-track",      effort: "low",    automatable: true },
  { id: "r11", title: "Lawn service check-in",           category: "household", frequency: "Monthly",          nextDue: "Review needed",                              status: "review-needed", effort: "low"    },
  { id: "r12", title: "Passport validity check",         category: "admin",     frequency: "Every 2 years",    nextDue: "Expires Aug 2026",                           status: "review-needed", effort: "high"   },
];
