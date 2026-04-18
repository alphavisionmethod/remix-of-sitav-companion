// ═══════════════════════════════════════════════════════════════
// SITA OS — Event Lineage Builder (Proof Layer)
// Builds event lineage chains for provenance tracking
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope } from "../shared/orchestration-envelope";

export interface LineageEvent {
  eventId: string;
  lineageId: string;
  parentEventId?: string;
  layer: string;
  eventType: string;
  source: string;
  detail: string;
  timestamp: string;
}

export function buildEventLineage(envelope: OrchestrationEnvelope): LineageEvent[] {
  const lineageId = envelope.proofState?.eventLineageId ?? crypto.randomUUID();
  const events: LineageEvent[] = [];
  let parentId: string | undefined;

  // Genesis event
  const genesisId = crypto.randomUUID();
  events.push({
    eventId: genesisId,
    lineageId,
    layer: "intent",
    eventType: "intent_received",
    source: envelope.sourceSurface,
    detail: `Intent: "${envelope.intentRaw.slice(0, 100)}"`,
    timestamp: envelope.createdAt,
  });
  parentId = genesisId;

  if (envelope.intentState) {
    const id = crypto.randomUUID();
    events.push({ eventId: id, lineageId, parentEventId: parentId, layer: "intent", eventType: "intent_classified", source: "intent-orchestrator", detail: `${envelope.intentState.classification} → ${envelope.intentState.resolvedDomain}`, timestamp: envelope.updatedAt });
    parentId = id;
  }

  if (envelope.planningState) {
    const id = crypto.randomUUID();
    events.push({ eventId: id, lineageId, parentEventId: parentId, layer: "planning", eventType: "plan_created", source: "planning-orchestrator", detail: `Plan ${envelope.planningState.planId} with ${envelope.planningState.steps.length} steps`, timestamp: envelope.updatedAt });
    parentId = id;
  }

  if (envelope.executionState) {
    const id = crypto.randomUUID();
    events.push({ eventId: id, lineageId, parentEventId: parentId, layer: "execution", eventType: "execution_completed", source: "execution-orchestrator", detail: `Result: ${envelope.executionState.result}`, timestamp: envelope.updatedAt });
    parentId = id;
  }

  if (envelope.proofState) {
    events.push({ eventId: crypto.randomUUID(), lineageId, parentEventId: parentId, layer: "proof", eventType: "proof_recorded", source: "proof-orchestrator", detail: `Hash: ${envelope.proofState.proofChainHash.slice(0, 16)}...`, timestamp: new Date().toISOString() });
  }

  return events;
}
