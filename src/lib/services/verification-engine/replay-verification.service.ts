// ═══════════════════════════════════════════════════════════════
// SITA OS — Replay Verification Service
// Deterministic replay of action sequences, outcome comparison,
// drift detection for non-deterministic behavior
// ═══════════════════════════════════════════════════════════════

export interface ReplayableAction {
  id: string;
  capabilityId: string;
  input: Record<string, unknown>;
  originalResult: Record<string, unknown>;
  originalTimestamp: string;
  sequenceIndex: number;
}

export type ReplayVerdict = "identical" | "divergent" | "non-reproducible";

export interface ReplayDrift {
  actionId: string;
  sequenceIndex: number;
  field: string;
  originalValue: unknown;
  replayedValue: unknown;
  driftType: "value-mismatch" | "missing-field" | "extra-field" | "type-change";
}

export interface ReplayVerificationResult {
  id: string;
  verdict: ReplayVerdict;
  totalActions: number;
  identicalCount: number;
  divergentCount: number;
  nonReproducibleCount: number;
  drifts: ReplayDrift[];
  replayStartedAt: string;
  replayCompletedAt: string;
  durationMs: number;
  confidence: number; // 0-100
}

export interface ActionReplayOutcome {
  actionId: string;
  replayedResult: Record<string, unknown>;
  success: boolean;
  error?: string;
}

export type ReplayExecutor = (action: ReplayableAction) => ActionReplayOutcome;

export class ReplayVerificationService {
  /**
   * Run a deterministic replay of an action sequence and compare results.
   * The executor function re-executes each action and returns the replayed result.
   */
  verifyReplay(
    actions: ReplayableAction[],
    executor: ReplayExecutor
  ): ReplayVerificationResult {
    const startTime = performance.now();
    const sorted = [...actions].sort((a, b) => a.sequenceIndex - b.sequenceIndex);
    const drifts: ReplayDrift[] = [];
    let identicalCount = 0;
    let divergentCount = 0;
    let nonReproducibleCount = 0;

    for (const action of sorted) {
      const outcome = executor(action);

      if (!outcome.success) {
        nonReproducibleCount++;
        continue;
      }

      const actionDrifts = this.compareResults(
        action.id,
        action.sequenceIndex,
        action.originalResult,
        outcome.replayedResult
      );

      if (actionDrifts.length === 0) {
        identicalCount++;
      } else {
        divergentCount++;
        drifts.push(...actionDrifts);
      }
    }

    const total = sorted.length;
    const confidence = total > 0
      ? Math.round((identicalCount / total) * 100)
      : 0;

    const verdict: ReplayVerdict =
      nonReproducibleCount > 0 ? "non-reproducible" :
      divergentCount > 0 ? "divergent" : "identical";

    return {
      id: crypto.randomUUID(),
      verdict,
      totalActions: total,
      identicalCount,
      divergentCount,
      nonReproducibleCount,
      drifts,
      replayStartedAt: new Date(Date.now() - (performance.now() - startTime)).toISOString(),
      replayCompletedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - startTime),
      confidence,
    };
  }

  /** Compare original and replayed results, returning all detected drifts */
  private compareResults(
    actionId: string,
    sequenceIndex: number,
    original: Record<string, unknown>,
    replayed: Record<string, unknown>
  ): ReplayDrift[] {
    const drifts: ReplayDrift[] = [];
    const allKeys = new Set([...Object.keys(original), ...Object.keys(replayed)]);

    for (const field of allKeys) {
      const inOriginal = field in original;
      const inReplayed = field in replayed;

      if (inOriginal && !inReplayed) {
        drifts.push({
          actionId, sequenceIndex, field,
          originalValue: original[field], replayedValue: undefined,
          driftType: "missing-field",
        });
      } else if (!inOriginal && inReplayed) {
        drifts.push({
          actionId, sequenceIndex, field,
          originalValue: undefined, replayedValue: replayed[field],
          driftType: "extra-field",
        });
      } else if (typeof original[field] !== typeof replayed[field]) {
        drifts.push({
          actionId, sequenceIndex, field,
          originalValue: original[field], replayedValue: replayed[field],
          driftType: "type-change",
        });
      } else if (JSON.stringify(original[field]) !== JSON.stringify(replayed[field])) {
        drifts.push({
          actionId, sequenceIndex, field,
          originalValue: original[field], replayedValue: replayed[field],
          driftType: "value-mismatch",
        });
      }
    }

    return drifts;
  }

  /** Quick check: are two result sets identical? */
  areIdentical(
    original: Record<string, unknown>,
    replayed: Record<string, unknown>
  ): boolean {
    return JSON.stringify(original) === JSON.stringify(replayed);
  }

  /** Compute a drift severity score (0-100, higher = more drift) */
  computeDriftScore(result: ReplayVerificationResult): number {
    if (result.totalActions === 0) return 0;
    const driftWeight = result.drifts.reduce((sum, d) => {
      switch (d.driftType) {
        case "value-mismatch": return sum + 3;
        case "missing-field": return sum + 5;
        case "extra-field": return sum + 1;
        case "type-change": return sum + 4;
        default: return sum + 2;
      }
    }, 0);
    return Math.min(100, Math.round((driftWeight / (result.totalActions * 5)) * 100));
  }
}

export function createReplayVerificationService(): ReplayVerificationService {
  return new ReplayVerificationService();
}
