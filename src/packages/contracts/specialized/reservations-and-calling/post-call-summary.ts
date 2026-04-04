// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Reservations & Calling
// Post-Call Summary
// ═══════════════════════════════════════════════════════════════

export interface PostCallSummary {
  id: string;
  callId: string;
  reservationId?: string;
  duration: number;
  outcome: "successful" | "voicemail" | "no-answer" | "busy" | "failed" | "follow-up-needed";
  summary: string;
  actionItems: string[];
  sentiment: "positive" | "neutral" | "negative";
  recordingAvailable: boolean;
  transcriptRetention: "none" | "summary-only" | "full";
  calledAt: string;
  completedAt: string;
}
