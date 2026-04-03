export interface NarrativeVsDeterministicBoundary {
  field: string;
  domain: string;
  classification: "deterministic" | "narrative" | "hybrid";
  deterministicSource?: string;
  narrativeAllowed: boolean;
  requiresCaveat: boolean;
  description: string;
}

export interface CallAutomationPolicy {
  callType: "outbound-cold" | "outbound-warm" | "follow-up" | "support";
  maxCallsPerDay: number;
  requiresApproval: boolean;
  recordingRequired: boolean;
  transcriptRetention: "none" | "summary-only" | "full";
  timeRestrictions: { startHour: number; endHour: number; timezone: "recipient" | "sender" };
  consentRequired: boolean;
  cooldownMinutes: number;
  complianceNotes: string;
}
