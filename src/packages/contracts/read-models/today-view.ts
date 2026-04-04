// ═══════════════════════════════════════════════════════════════
// SITA OS — Read Models: Today View
// UI projection — NEVER a source of truth
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

/** @layer read-model — derived from truth contracts, not authoritative */
export interface TodayViewItem {
  id: string;
  type: "task" | "reminder" | "approval" | "opportunity" | "incident" | "meeting" | "deadline";
  title: string;
  domain: DomainId;
  priority: "critical" | "high" | "medium" | "low";
  dueAt?: string;
  status: string;
  actionRequired: boolean;
}

export interface TodayView {
  userId: string;
  date: string;
  generatedAt: string;
  items: TodayViewItem[];
  topPriority: TodayViewItem | null;
  completedCount: number;
  remainingCount: number;
  dailyPulse: string;
}
