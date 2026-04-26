// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Life Admin demo fixtures
// Demo-mode-only. Consumed via useRealityModeSafe().isDemo gate.
// ═══════════════════════════════════════════════════════════════

export type AdminTab = "recurring" | "service" | "forms" | "upcoming" | "aging" | "bundles";

export interface AdminItem {
  id: string;
  title: string;
  category: string;
  dueDate?: string;
  daysOverdue: number;
  frequency?: string;
  linkedTo?: string;
  urgency: "high" | "medium" | "low";
}

export const LIFE_ADMIN_RECURRING_DEMO: ReadonlyArray<AdminItem> = [
  { id: "la1", title: "Car insurance renewal review",            category: "Insurance", dueDate: "2026-04-28", daysOverdue: 0, frequency: "Annual",          urgency: "medium" },
  { id: "la2", title: "Water filter replacement",                category: "Home",      dueDate: "2026-04-15", daysOverdue: 0, frequency: "Quarterly",       urgency: "low"    },
  { id: "la3", title: "Passport renewal — expires Aug 2026",     category: "Documents", dueDate: "2026-06-01", daysOverdue: 0, frequency: "Every 10 years", urgency: "medium" },
  { id: "la4", title: "Annual HVAC inspection",                  category: "Home",      dueDate: "2026-05-10", daysOverdue: 0, frequency: "Annual",          urgency: "low"    },
];

export const LIFE_ADMIN_SERVICE_DEMO: ReadonlyArray<AdminItem> = [
  { id: "la5", title: "Follow up with plumber on kitchen leak",  category: "Home Repair",  daysOverdue: 4, urgency: "high"   },
  { id: "la6", title: "Request lawn service spring schedule",    category: "Landscaping",  daysOverdue: 2, urgency: "medium" },
  { id: "la7", title: "Confirm pet sitter for spring break",     category: "Pet Care",     daysOverdue: 0, linkedTo: "Spring Break Trip", urgency: "high" },
];

export const LIFE_ADMIN_FORMS_DEMO: ReadonlyArray<AdminItem> = [
  { id: "la8",  title: "School field trip permission slip",       category: "School",    dueDate: "2026-04-14", daysOverdue: 0, urgency: "high"   },
  { id: "la9",  title: "Health insurance claim submission",       category: "Insurance",                         daysOverdue: 6, urgency: "medium" },
  { id: "la10", title: "Vehicle registration renewal form",       category: "Documents", dueDate: "2026-04-30", daysOverdue: 0, urgency: "low"    },
];

export const LIFE_ADMIN_UPCOMING_DEMO: ReadonlyArray<AdminItem> = [
  { id: "la11", title: "Dentist — bring insurance card",          category: "Health", dueDate: "2026-04-16", daysOverdue: 0, urgency: "medium" },
  { id: "la12", title: "Parent-teacher conference prep",          category: "School", dueDate: "2026-04-18", daysOverdue: 0, urgency: "low"    },
];

export const LIFE_ADMIN_AGING_DEMO: ReadonlyArray<AdminItem> = [
  { id: "la13", title: "Organize tax documents",                  category: "Tax",    daysOverdue: 12, urgency: "high"   },
  { id: "la14", title: "Clean out garage — postponed 3x",         category: "Home",   daysOverdue: 21, urgency: "medium" },
  { id: "la15", title: "Update emergency contacts at school",     category: "School", daysOverdue: 8,  urgency: "low"    },
];

export const LIFE_ADMIN_BUNDLES_DEMO: ReadonlyArray<AdminItem> = [
  { id: "lb1", title: "Phone calls — plumber, vet, insurance",            category: "Calls",   daysOverdue: 0, urgency: "medium" },
  { id: "lb2", title: "School paperwork batch",                            category: "School",  daysOverdue: 0, urgency: "high"   },
  { id: "lb3", title: "Online admin — claim, registration, tax upload",   category: "Digital", daysOverdue: 2, urgency: "medium" },
];

export const LIFE_ADMIN_QUICK_WINS_DEMO = [
  { id: "qw1", title: "Update school emergency contacts",  category: "School",    urgency: "low"    as const, effort: "quick" as const },
  { id: "qw2", title: "Submit insurance claim photo",      category: "Insurance", urgency: "medium" as const, effort: "quick" as const },
  { id: "qw3", title: "Set up autopay for lawn service",   category: "Home",      urgency: "low"    as const, effort: "quick" as const },
];
