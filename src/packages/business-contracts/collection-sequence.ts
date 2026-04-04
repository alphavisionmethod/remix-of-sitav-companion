// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Collection Sequence
// ═══════════════════════════════════════════════════════════════

import type { CollectionStep } from "./collection-step";

export type CollectionSequenceStatus = "pending" | "active" | "paused" | "completed" | "escalated" | "written-off";

export interface CollectionSequence {
  id: string;
  invoiceIds: string[];
  accountId: string;
  totalOwedCents: number;
  steps: CollectionStep[];
  currentStepIndex: number;
  status: CollectionSequenceStatus;
  startedAt: string;
  completedAt?: string;
  escalatedAt?: string;
  notes: string[];
}
