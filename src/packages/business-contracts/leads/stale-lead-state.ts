export interface StaleLeadState {
  leadId: string;
  daysSinceLastContact: number;
  daysSinceCapture: number;
  lastActivityType: string;
  staleSince: string;
  recommendedAction: "re-engage" | "archive" | "reassign" | "escalate";
  reengagementScore: number; // 0-100
  estimatedValueCents: number;
  reason: string;
}
