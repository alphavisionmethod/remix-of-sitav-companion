// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Vocabulary Bridge (Wave 1.3)
//
// Maps the user-facing vocabulary `service / adapter / client / readModel`
// onto the existing 5-layer Service Layer Constitution.
//
// This is a PURE CONSTANT module. It contains no runtime behaviour and is
// consumed only by:
//   - scripts/architecture/checks/check-service-vocabulary-coherence.ts
//   - scripts/architecture/emit-lib-service-layer-ownership.ts
//   - generators that emit lib-service-layer-ownership-map.json
//
// Authority: docs/architecture/SERVICE_ADAPTER_CLIENT_OWNERSHIP_MODEL.md
// ═══════════════════════════════════════════════════════════════

import type { ServiceLayer } from "./service-authority-map";

export type VocabClass = "service" | "adapter" | "client" | "readModel";

/** Canonical mapping from user vocabulary → 5-layer constitution. */
export const VOCAB_BRIDGE: Record<VocabClass, ServiceLayer[]> = {
  service:   ["PLATFORM_CANONICAL", "DOMAIN_CANONICAL"],
  adapter:   ["INTEGRATION_ADAPTER"],
  client:    ["UI_CLIENT"],
  readModel: ["PROJECTION_CANONICAL"],
};

/** Inverse lookup: layer → vocab class. Returns undefined for compat / split states. */
export function vocabClassForLayer(layer: ServiceLayer): VocabClass | undefined {
  for (const [vocab, layers] of Object.entries(VOCAB_BRIDGE) as [VocabClass, ServiceLayer[]][]) {
    if (layers.includes(layer)) return vocab;
  }
  return undefined;
}

/**
 * Canonical roots that are allowed to host each vocab class.
 * Used by check-service-vocabulary-coherence to detect misplaced files.
 */
export const CANONICAL_ROOTS: Record<VocabClass, string[]> = {
  service: [
    "src/lib/core-services",
    "src/lib/services",
    "src/lib/engines",
    "src/lib/boardroom",
    "src/lib/advisor-intelligence",
    "src/lib/domain-engines",
  ],
  adapter: [
    "src/lib/core-services",
    "src/lib/services",
  ],
  client: [
    "src/lib/data-services",
  ],
  readModel: [
    "src/lib/core-services/projection-service",
    "src/lib/services/projection-service",
    "src/lib/services/audit-trail-timeline",
    "src/lib/services/truth-indices",
  ],
};

/**
 * Modules that may be imported directly by service-layer code.
 * Anything else that imports `@supabase/supabase-js` (or similar) outside
 * `src/integrations/supabase/client.ts` is a raw-SDK bypass.
 */
export const APPROVED_TRANSPORT_OWNERS: readonly string[] = Object.freeze([
  "src/integrations/supabase/client.ts",
  "src/lib/data-services",
]);