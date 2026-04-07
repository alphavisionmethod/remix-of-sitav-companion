// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel Contract: ReplayPacket
// Enables deterministic replay of past actions using receipts.
// ═══════════════════════════════════════════════════════════════

import type { ActionEnvelope } from "./action-envelope";

export interface KernelReplayPacket {
  id: string;
  originalEnvelopeId: string;
  originalReceiptId: string;
  originalCorrelationId: string;
  replayEnvelope: ActionEnvelope;
  replayMode: "EMULATED";
  originalOutput: Record<string, unknown>;
  replayOutput?: Record<string, unknown>;
  outputMatch?: boolean;
  outputDrift?: string[];
  replayedAt: string;
  replayDurationMs?: number;
  status: "pending" | "replayed" | "drift-detected" | "failed";
}

/** Validate that replay output matches original output schema */
export function detectOutputDrift(
  original: Record<string, unknown>,
  replayed: Record<string, unknown>
): { match: boolean; driftKeys: string[] } {
  const originalKeys = new Set(Object.keys(original));
  const replayedKeys = new Set(Object.keys(replayed));
  const driftKeys: string[] = [];

  for (const key of originalKeys) {
    if (!replayedKeys.has(key)) driftKeys.push(`missing:${key}`);
  }
  for (const key of replayedKeys) {
    if (!originalKeys.has(key)) driftKeys.push(`extra:${key}`);
  }

  return { match: driftKeys.length === 0, driftKeys };
}
