// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Follow-Up Automation Service
// ═══════════════════════════════════════════════════════════════

import type { Quote } from "./quotes.service";

export interface FollowUpAction {
  id: string;
  quoteId: string;
  type: "email" | "sms" | "call" | "in-app";
  scheduledAt: string;
  message: string;
  status: "pending" | "sent" | "completed" | "skipped";
}

export function generateFollowUpSequence(quote: Quote): FollowUpAction[] {
  const baseTime = new Date(quote.createdAt).getTime();
  return [
    { id: `fu-${quote.id}-1`, quoteId: quote.id, type: "email", scheduledAt: new Date(baseTime + 2 * 86400000).toISOString(), message: "Following up on quote — any questions?", status: "pending" },
    { id: `fu-${quote.id}-2`, quoteId: quote.id, type: "email", scheduledAt: new Date(baseTime + 5 * 86400000).toISOString(), message: "Friendly reminder — quote valid for 9 more days", status: "pending" },
    { id: `fu-${quote.id}-3`, quoteId: quote.id, type: "call", scheduledAt: new Date(baseTime + 8 * 86400000).toISOString(), message: "Personal call — discuss any concerns", status: "pending" },
    { id: `fu-${quote.id}-4`, quoteId: quote.id, type: "email", scheduledAt: new Date(baseTime + 12 * 86400000).toISOString(), message: "Quote expiring in 2 days — final reminder", status: "pending" },
  ];
}

export function shouldEscalateFollowUp(quote: Quote, attemptCount: number): boolean {
  const daysUntilExpiry = (new Date(quote.validUntil).getTime() - Date.now()) / 86400000;
  return daysUntilExpiry < 3 && attemptCount >= 3 && quote.status === "sent";
}
