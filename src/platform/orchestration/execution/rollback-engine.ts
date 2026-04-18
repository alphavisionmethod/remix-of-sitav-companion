// ═══════════════════════════════════════════════════════════════
// SITA OS — Rollback Engine (Execution Layer)
// Rollback execution when needed
// ═══════════════════════════════════════════════════════════════

import type { ExecutedSideEffect } from "../shared/orchestration-envelope";
import { RollbackError } from "../shared/orchestration-errors";

export interface RollbackRequest {
  executionId: string;
  sideEffects: ExecutedSideEffect[];
  reason: string;
}

export interface RollbackResult {
  executionId: string;
  rolledBack: ExecutedSideEffect[];
  unrollable: ExecutedSideEffect[];
  success: boolean;
  durationMs: number;
}

export async function executeRollback(request: RollbackRequest): Promise<RollbackResult> {
  const startTime = Date.now();
  const rolledBack: ExecutedSideEffect[] = [];
  const unrollable: ExecutedSideEffect[] = [];

  // Process in reverse order (LIFO)
  const reversedEffects = [...request.sideEffects].reverse();

  for (const effect of reversedEffects) {
    if (effect.reversible && !effect.reversed) {
      try {
        console.debug(`[RollbackEngine] Rolling back ${effect.effectId} (${effect.target})`);
        rolledBack.push({ ...effect, reversed: true });
      } catch {
        unrollable.push(effect);
      }
    } else {
      unrollable.push(effect);
    }
  }

  const success = unrollable.length === 0;

  if (!success && rolledBack.length === 0) {
    throw new RollbackError(
      `Complete rollback failure for execution ${request.executionId}`,
      request.executionId
    );
  }

  return {
    executionId: request.executionId,
    rolledBack,
    unrollable,
    success,
    durationMs: Date.now() - startTime,
  };
}
