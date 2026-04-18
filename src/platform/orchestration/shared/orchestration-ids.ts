// ═══════════════════════════════════════════════════════════════
// SITA OS — Orchestration ID Generation
// Centralized, typed ID factory for all orchestration artifacts
// ═══════════════════════════════════════════════════════════════

export type OrchestrationIdKind =
  | "envelope"
  | "correlation"
  | "execution"
  | "receipt"
  | "proof-chain"
  | "audit-trail"
  | "plan"
  | "step"
  | "approval"
  | "lineage"
  | "simulation"
  | "rollback"
  | "idempotency";

const PREFIXES: Record<OrchestrationIdKind, string> = {
  envelope: "env",
  correlation: "cor",
  execution: "exe",
  receipt: "rct",
  "proof-chain": "prf",
  "audit-trail": "aud",
  plan: "pln",
  step: "stp",
  approval: "apr",
  lineage: "lin",
  simulation: "sim",
  rollback: "rbk",
  idempotency: "idk",
};

/**
 * Generate a prefixed, typed orchestration ID.
 * Format: `{prefix}_{uuid}` — e.g. `env_a1b2c3d4-...`
 */
export function generateOrchestrationId(kind: OrchestrationIdKind): string {
  return `${PREFIXES[kind]}_${crypto.randomUUID()}`;
}

/** Batch-generate multiple IDs of different kinds */
export function generateIdSet<K extends OrchestrationIdKind>(
  kinds: K[]
): Record<K, string> {
  const result = {} as Record<K, string>;
  for (const kind of kinds) {
    result[kind] = generateOrchestrationId(kind);
  }
  return result;
}

/** Extract the kind from a prefixed ID (returns undefined if unrecognized) */
export function parseIdKind(id: string): OrchestrationIdKind | undefined {
  const prefix = id.split("_")[0];
  const entry = Object.entries(PREFIXES).find(([, v]) => v === prefix);
  return entry ? (entry[0] as OrchestrationIdKind) : undefined;
}

/** Validate that an ID matches the expected kind */
export function validateOrchestrationId(id: string, expectedKind: OrchestrationIdKind): boolean {
  return id.startsWith(`${PREFIXES[expectedKind]}_`);
}
