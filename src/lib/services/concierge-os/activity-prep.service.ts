// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Activity Prep Service
// Domain types imported from `@/domains/concierge` (canonical).
// ═══════════════════════════════════════════════════════════════

import type { ActivityChecklist } from "@/domains/concierge";

export type { ActivityChecklist };

export function buildActivityChecklist(activityName: string, items: string[]): ActivityChecklist {
  return { activityName, items: items.map(task => ({ task, done: false })), completionPct: 0 };
}

export function getMockActivityChecklists(): ActivityChecklist[] {
  return [
    buildActivityChecklist("Soccer Practice", ["Pack cleats", "Fill water bottle", "Bring shin guards", "Pack snack"]),
    buildActivityChecklist("Piano Lesson", ["Print sheet music", "Practice 30 min", "Pack lesson book"]),
  ];
}

