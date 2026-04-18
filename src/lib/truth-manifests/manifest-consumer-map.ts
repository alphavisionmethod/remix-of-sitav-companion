// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Consumer Map
// Which pages/scripts consume each artifact
// ═══════════════════════════════════════════════════════════════

import { MANIFEST_REGISTRY } from "./manifest-registry";

export interface ConsumerEntry {
  manifestId: string;
  consumers: string[];
  consumerCount: number;
}

/** Build consumer map */
export function buildConsumerMap(): ConsumerEntry[] {
  return MANIFEST_REGISTRY.map((entry) => ({
    manifestId: entry.id,
    consumers: entry.consumers,
    consumerCount: entry.consumers.length,
  }));
}

/** Get orphaned manifests (no consumers) */
export function getOrphanedManifests(): string[] {
  return MANIFEST_REGISTRY
    .filter((m) => m.consumers.length === 0)
    .map((m) => m.id);
}

/** Get most-consumed manifests (sorted descending) */
export function getMostConsumedManifests(limit = 10): ConsumerEntry[] {
  return buildConsumerMap()
    .sort((a, b) => b.consumerCount - a.consumerCount)
    .slice(0, limit);
}
