// ═══════════════════════════════════════════════════════════════
// SITA OS — Reversibility Writer (Proof Layer)
// Records reversibility metadata
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope } from "../shared/orchestration-envelope";

export interface ReversibilityRecord {
  recordId: string;
  envelopeId: string;
  executionId?: string;
  fullReversalPossible: boolean;
  reversibleEffects: number;
  irreversibleEffects: number;
  rollbackWindowMs: number;
  rollbackDeadline: string;
  effects: Array<{
    effectId: string;
    target: string;
    reversible: boolean;
    type: string;
  }>;
  timestamp: string;
}

export function buildReversibilityRecord(envelope: OrchestrationEnvelope): ReversibilityRecord {
  const effects = envelope.executionState?.sideEffects ?? [];
  const reversibleCount = effects.filter(e => e.reversible).length;
  const irreversibleCount = effects.filter(e => !e.reversible).length;
  const rollbackWindowMs = 30 * 60 * 1000; // 30 minutes

  return {
    recordId: crypto.randomUUID(),
    envelopeId: envelope.envelopeId,
    executionId: envelope.executionState?.executionId,
    fullReversalPossible: irreversibleCount === 0 && effects.length > 0,
    reversibleEffects: reversibleCount,
    irreversibleEffects: irreversibleCount,
    rollbackWindowMs,
    rollbackDeadline: new Date(Date.now() + rollbackWindowMs).toISOString(),
    effects: effects.map(e => ({
      effectId: e.effectId,
      target: e.target,
      reversible: e.reversible,
      type: e.type,
    })),
    timestamp: new Date().toISOString(),
  };
}
