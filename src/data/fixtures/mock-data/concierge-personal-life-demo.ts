// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Personal Life Workspace demo fixtures
// Demo-mode-only. Consumed via useRealityModeSafe().isDemo gate.
// ═══════════════════════════════════════════════════════════════

export const PERSONAL_ROUTINES_DEMO = [
  { id: "1", name: "Morning meditation", time: "6:30 AM", streak: 14, active: true,  category: "wellbeing" },
  { id: "2", name: "Exercise",           time: "7:00 AM", streak: 7,  active: true,  category: "health"    },
  { id: "3", name: "Journal",            time: "9:00 PM", streak: 3,  active: true,  category: "growth"    },
  { id: "4", name: "Read 30 min",        time: "8:30 PM", streak: 0,  active: false, category: "growth"    },
  { id: "5", name: "Hydrate (8 glasses)", time: "All day", streak: 21, active: true, category: "health"    },
] as const;

export const PERSONAL_GOALS_DEMO = [
  { id: "1", title: "Run a half marathon",     progress: 65, deadline: "2026-09-01", domain: "health",    milestones: ["5K done", "10K done", "15K next"], nextAction: "Register for 10K race" },
  { id: "2", title: "Learn Spanish B1",        progress: 40, deadline: "2026-12-31", domain: "growth",    milestones: ["A1 complete", "A2 in progress"],   nextAction: "Complete Duolingo Unit 5" },
  { id: "3", title: "Save €10k emergency fund", progress: 82, deadline: "2026-06-30", domain: "finance",   milestones: ["€5K saved", "€8.2K saved"],        nextAction: "Set up auto-transfer for €500/mo" },
  { id: "4", title: "Declutter home office",   progress: 30, deadline: "2026-05-15", domain: "household", milestones: ["Sorted papers"],                   nextAction: "Organize bookshelf" },
] as const;

export const PERSONAL_SLIPPING_DEMO = [
  { id: "1", item: "Dentist appointment — overdue by 2 weeks",     severity: "medium" as const, domain: "health",  action: "Schedule appointment" },
  { id: "2", item: "Car insurance renewal — 3 days left",          severity: "high"   as const, domain: "finance", action: "Review & renew online" },
  { id: "3", item: "Read 30 min habit — streak broken 4 days ago", severity: "low"    as const, domain: "growth",  action: "Resume tonight" },
  { id: "4", item: "Annual physical — 6 months overdue",           severity: "high"   as const, domain: "health",  action: "Call doctor" },
] as const;

export const PERSONAL_BACKLOG_DEMO = [
  { id: "1", item: "Learn to cook Thai food",     domain: "growth"    },
  { id: "2", item: "Organize photo library",      domain: "household" },
  { id: "3", item: "Plan summer vacation",        domain: "personal"  },
  { id: "4", item: "Update will/estate docs",     domain: "finance"   },
  { id: "5", item: "Set up home automation",      domain: "household" },
  { id: "6", item: "Start a podcast",             domain: "growth"    },
] as const;
