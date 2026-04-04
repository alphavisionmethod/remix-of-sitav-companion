// ═══════════════════════════════════════════════════════════════
// SITA OS — Core Truth Contracts: Event Envelope
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export interface EventEnvelope {
  id: string;
  type: string;
  tenantId: string;
  correlationId: string;
  timestamp: string;
  domain: DomainId;
  payload: Record<string, unknown>;
  metadata: {
    source: string;
    version: string;
    causedBy?: string;
  };
}
