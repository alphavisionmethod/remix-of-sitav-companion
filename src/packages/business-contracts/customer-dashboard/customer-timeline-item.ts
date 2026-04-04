// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Customer Timeline Item
// ═══════════════════════════════════════════════════════════════

export type TimelineEventType = "call" | "email" | "meeting" | "ticket" | "purchase" | "renewal" | "escalation" | "note" | "stage-change";

export interface CustomerTimelineItem {
  id: string;
  customerId: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
