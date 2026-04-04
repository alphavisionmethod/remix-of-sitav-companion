// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Callback Task
// ═══════════════════════════════════════════════════════════════

import type { BusinessPriority } from "./_contract-scaffold";

export type CallbackOutcome = "completed" | "voicemail" | "rescheduled" | "no-answer" | "cancelled";

export interface CallbackTask {
  id: string;
  contactId: string;
  accountId?: string;
  reason: string;
  priority: BusinessPriority;
  assignedTo?: string;
  scheduledAt: string;
  completedAt?: string;
  outcome?: CallbackOutcome;
  notes?: string;
  attemptCount: number;
  maxAttempts: number;
  createdAt: string;
}
