// ═══════════════════════════════════════════════════════════════
// SITA OS — Core Truth: Intent Envelope
// Canonical intent capture before policy/approval/execution
// ═══════════════════════════════════════════════════════════════

import type { DomainId, CorrelationContext, ConfidenceMetadata } from "../_contract-scaffold";

export type IntentSource = "user" | "advisor" | "system" | "device" | "scheduler" | "workflow";
export type IntentUrgency = "immediate" | "normal" | "deferred" | "background";

export interface IntentEnvelope {
  id: string;
  source: IntentSource;
  actorId: string;
  tenantId: string;
  domain: DomainId;
  action: string;
  description: string;
  parameters: Record<string, unknown>;
  urgency: IntentUrgency;
  confidence: ConfidenceMetadata;
  correlation: CorrelationContext;
  capturedAt: string;
  expiresAt?: string;
  parentIntentId?: string;
  requiresPolicy: boolean;
  requiresApproval: boolean;
  simulationRequested: boolean;
}