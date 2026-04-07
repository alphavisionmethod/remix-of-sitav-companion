// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Activity Prep Service
// ═══════════════════════════════════════════════════════════════

export interface ActivityChecklist { activityName: string; items: { task: string; done: boolean }[]; completionPct: number; }

export function buildActivityChecklist(activityName: string, items: string[]): ActivityChecklist {
  return { activityName, items: items.map(task => ({ task, done: false })), completionPct: 0 };
}

export function getMockActivityChecklists(): ActivityChecklist[] {
  return [
    buildActivityChecklist("Soccer Practice", ["Pack cleats", "Fill water bottle", "Bring shin guards", "Pack snack"]),
    buildActivityChecklist("Piano Lesson", ["Print sheet music", "Practice 30 min", "Pack lesson book"]),
  ];
}

