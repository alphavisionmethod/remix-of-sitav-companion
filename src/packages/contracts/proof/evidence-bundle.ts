// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Contracts: Evidence Bundle
// Raw/structured evidence aggregation (distinct from proof-pack)
// ═══════════════════════════════════════════════════════════════

export type EvidenceType = "document" | "screenshot" | "log" | "metric" | "api-response" | "user-input" | "system-generated";

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  source: string;
  content: Record<string, unknown>;
  capturedAt: string;
  confidence: number; // 0-1
  redacted: boolean;
}

export interface EvidenceBundle {
  id: string;
  caseId: string;
  items: EvidenceItem[];
  collectedAt: string;
  collectedBy: string;
  purpose: string;
  chainOfCustody: Array<{
    actor: string;
    action: string;
    timestamp: string;
  }>;
}
