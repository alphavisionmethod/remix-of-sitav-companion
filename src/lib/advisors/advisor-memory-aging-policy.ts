// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Memory Aging Policy
// Governs memory retention, decay, and archival per memory layer.
// ═══════════════════════════════════════════════════════════════

export type MemoryLayer = "working" | "short-term" | "long-term" | "archival";

export interface MemoryAgingRule {
  readonly layer: MemoryLayer;
  readonly maxAgeDays: number | null;     // null = no expiry
  readonly decayRate: number;             // daily importance decay (0-1)
  readonly promotionThreshold: number;    // access count to promote
  readonly archiveOnExpiry: boolean;
  readonly deletionPolicy: "soft-delete" | "hard-delete-after-archive" | "never-delete";
}

export const MEMORY_AGING_RULES: readonly MemoryAgingRule[] = [
  { layer: "working", maxAgeDays: 1, decayRate: 0.5, promotionThreshold: 3, archiveOnExpiry: false, deletionPolicy: "soft-delete" },
  { layer: "short-term", maxAgeDays: 7, decayRate: 0.1, promotionThreshold: 5, archiveOnExpiry: true, deletionPolicy: "soft-delete" },
  { layer: "long-term", maxAgeDays: 90, decayRate: 0.01, promotionThreshold: 10, archiveOnExpiry: true, deletionPolicy: "hard-delete-after-archive" },
  { layer: "archival", maxAgeDays: null, decayRate: 0.0, promotionThreshold: Infinity, archiveOnExpiry: false, deletionPolicy: "never-delete" },
];

export function getAgingRule(layer: MemoryLayer): MemoryAgingRule {
  return MEMORY_AGING_RULES.find((r) => r.layer === layer) ?? MEMORY_AGING_RULES[0];
}

export function shouldPromote(layer: MemoryLayer, accessCount: number): boolean {
  const rule = getAgingRule(layer);
  return accessCount >= rule.promotionThreshold;
}

export function shouldExpire(layer: MemoryLayer, ageDays: number): boolean {
  const rule = getAgingRule(layer);
  return rule.maxAgeDays !== null && ageDays > rule.maxAgeDays;
}