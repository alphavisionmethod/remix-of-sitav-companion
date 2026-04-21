// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch Drill Calendar
// Quarterly schedule with overdue tracking
// ═══════════════════════════════════════════════════════════════

import { KILL_SWITCH_DRILL_INVENTORY } from "./kill-switch-drill-runner";

export type DrillCadence = "monthly" | "quarterly" | "semi-annual";

export interface DrillScheduleEntry {
  switchId: string;
  cadence: DrillCadence;
  responsibleRole: string;
  lastDrillDate: string | null;
  nextDueDate: string;
  isOverdue: boolean;
}

const CADENCE_MAP: Record<string, DrillCadence> = {
  "KS-AI-ADVISORY": "quarterly",
  "KS-WORKFLOW-AUTO": "quarterly",
  "KS-OUTBOUND-MSG": "quarterly",
  "KS-INVESTOR-ACCESS": "quarterly",
  "KS-BUILD-DOWNLOAD": "semi-annual",
  "KS-PUBLIC-CHAT": "semi-annual",
  "KS-THIRD-PARTY": "quarterly",
  "KS-CROWDFUND": "monthly",
};

const CADENCE_DAYS: Record<DrillCadence, number> = {
  monthly: 30,
  quarterly: 90,
  "semi-annual": 180,
};

export function buildDrillSchedule(
  lastDrillDates: Record<string, string | null> = {}
): DrillScheduleEntry[] {
  const now = new Date();
  return KILL_SWITCH_DRILL_INVENTORY.map((def) => {
    const cadence = CADENCE_MAP[def.switchId] ?? "quarterly";
    const lastDrill = lastDrillDates[def.switchId] ?? null;
    const daysInterval = CADENCE_DAYS[cadence];
    const nextDue = lastDrill
      ? new Date(new Date(lastDrill).getTime() + daysInterval * 86400000)
      : new Date(now.getTime() - 86400000); // overdue if never drilled
    return {
      switchId: def.switchId,
      cadence,
      responsibleRole: def.authorizedRoles[0],
      lastDrillDate: lastDrill,
      nextDueDate: nextDue.toISOString(),
      isOverdue: nextDue <= now,
    };
  });
}

export function getOverdueDrills(
  lastDrillDates: Record<string, string | null> = {}
): DrillScheduleEntry[] {
  return buildDrillSchedule(lastDrillDates).filter((d) => d.isOverdue);
}