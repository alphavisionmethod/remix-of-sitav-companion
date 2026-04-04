// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Collection Step
// ═══════════════════════════════════════════════════════════════

export type CollectionStepType = "reminder" | "call" | "escalate" | "legal" | "final-notice" | "write-off";
export type CollectionChannel = "email" | "sms" | "phone" | "letter" | "in-person";

export interface CollectionStep {
  stepType: CollectionStepType;
  channel: CollectionChannel;
  templateId?: string;
  scheduledAt: string;
  executedAt?: string;
  result?: "sent" | "delivered" | "responded" | "failed" | "skipped";
  delayDays: number;
  notes?: string;
}
