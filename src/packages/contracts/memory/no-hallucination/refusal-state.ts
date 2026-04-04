// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory: No-Hallucination: Refusal State
// Runtime refusal state (distinct from RefusalReceipt proof contract)
// ═══════════════════════════════════════════════════════════════

import type { DowngradeLevel } from "./confidence-state";

export interface RefusalState {
  refused: boolean;
  reason: string;
  nextSteps: string[];
  fallbackOutput?: string;
  downgradeLevel: DowngradeLevel;
}
