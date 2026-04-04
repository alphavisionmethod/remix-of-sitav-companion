// ═══════════════════════════════════════════════════════════════
// SITA OS — Read Models: Incident Summary
// UI projection — NEVER a source of truth
// ═══════════════════════════════════════════════════════════════

/** @layer read-model — derived from truth contracts, not authoritative */
export type IncidentSeverityLevel = "P0" | "P1" | "P2" | "P3" | "P4";

export interface IncidentSummary {
  id: string;
  title: string;
  severity: IncidentSeverityLevel;
  status: "open" | "investigating" | "mitigating" | "resolved" | "post-mortem";
  affectedServices: string[];
  startedAt: string;
  resolvedAt?: string;
  assignedTo: string[];
  description: string;
  impactDescription: string;
  rootCause?: string;
  timeToDetectMs?: number;
  timeToResolveMs?: number;
}
