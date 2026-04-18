// ═══════════════════════════════════════════════════════════════
// SITA OS — System Layer Registry (Canonical 3-Layer Stack)
// Layer 1: User Experience  ·  Layer 2: Domain Framework  ·  Layer 3: Platform Services
// Companion doc: docs/architecture/SITA_SYSTEM_STACK.md
// ═══════════════════════════════════════════════════════════════

export type SystemLayer = "L1-experience" | "L2-domain" | "L3-platform";

export type L3PlatformService =
  | "auth"
  | "policies"
  | "proof"
  | "execution"
  | "eventing"
  | "observability"
  | "sync"
  | "notifications";

export interface SystemLayerEntry {
  readonly layer: SystemLayer;
  readonly key: string;
  readonly displayName: string;
  readonly description: string;
  readonly canonicalRoots: readonly string[];
  readonly forbiddenImports: readonly string[];
  readonly mayImportFrom: readonly SystemLayer[];
  readonly registryFile: string | null;
  readonly docFile: string | null;
}

/**
 * Layer 1 — User Experience surfaces (pages, shells, widgets, boardroom screens).
 * Layer 2 — Domain Framework (boardroom, business, money, concierge, …) bounded contexts.
 * Layer 3 — Platform Services that all surfaces and domains rely on.
 */
export const SYSTEM_LAYER_REGISTRY: readonly SystemLayerEntry[] = [
  // ── Layer 1: User Experience ─────────────────────────────────
  {
    layer: "L1-experience",
    key: "experience.surfaces",
    displayName: "User Experience Surfaces",
    description: "Pages, shells, widgets, admin/boardroom/mobile/desktop surfaces. UX only — no orchestration.",
    canonicalRoots: ["src/pages/", "src/components/", "src/shells/", "src/features/", "src/admin/"],
    forbiddenImports: ["src/lib/runtime/backend/**", "src/lib/services/connector-runners/**"],
    mayImportFrom: ["L2-domain", "L3-platform"],
    registryFile: "src/lib/architecture/route-registry.ts",
    docFile: "docs/architecture/SITA_SYSTEM_STACK.md",
  },

  // ── Layer 2: Domain Framework ────────────────────────────────
  {
    layer: "L2-domain",
    key: "domain.framework",
    displayName: "Domain Framework (Bounded Contexts)",
    description: "High-level domain logic: boardroom, business, money, concierge, investment, setup, proof/trust views.",
    canonicalRoots: ["src/lib/services/", "src/lib/engines/", "src/lib/boardroom/", "src/lib/advisor-intelligence/", "src/lib/domain-engines/"],
    forbiddenImports: ["src/components/**", "src/pages/**", "src/lib/data-services/**"],
    mayImportFrom: ["L2-domain", "L3-platform"],
    registryFile: "src/lib/architecture/bounded-context-registry.ts",
    docFile: "docs/architecture/BOUNDED_CONTEXT_MAP.md",
  },

  // ── Layer 3: Platform Services (the 8 organs) ────────────────
  {
    layer: "L3-platform",
    key: "platform.auth",
    displayName: "Auth & Identity",
    description: "Identity, sessions, MFA/passkey, trusted devices, admin auth separation, connector auth.",
    canonicalRoots: ["src/lib/platform/auth/", "src/contexts/AuthContext.tsx", "src/platform/auth/"],
    forbiddenImports: ["src/pages/**", "src/components/**"],
    mayImportFrom: ["L3-platform"],
    registryFile: "src/lib/platform/auth/session-registry.ts",
    docFile: "docs/architecture/AUTH_AND_IDENTITY_RUNTIME.md",
  },
  {
    layer: "L3-platform",
    key: "platform.policies",
    displayName: "Policies & Permissions",
    description: "Unified policy matrix, trust thresholds, approval requirements, reversibility, surface restrictions.",
    canonicalRoots: ["src/lib/policy/"],
    forbiddenImports: ["src/pages/**", "src/components/**"],
    mayImportFrom: ["L3-platform"],
    registryFile: "src/lib/policy/unified-policy-matrix.ts",
    docFile: "docs/architecture/UNIFIED_PERMISSION_AND_POLICY_MATRIX.md",
  },
  {
    layer: "L3-platform",
    key: "platform.proof",
    displayName: "Proof, Audit & Receipts",
    description: "Approvals, action lineage, execution receipts, reversals, audit trails, proof requirement map.",
    canonicalRoots: ["src/lib/platform/proof/", "src/lib/services/receipt-service/", "src/lib/orchestration/proof/"],
    forbiddenImports: ["src/pages/**"],
    mayImportFrom: ["L3-platform"],
    registryFile: "src/lib/platform/proof/proof-registry.ts",
    docFile: "docs/architecture/PROOF_AND_AUDIT_MODEL.md",
  },
  {
    layer: "L3-platform",
    key: "platform.execution",
    displayName: "Execution Engine",
    description: "Canonical action-taking layer: command routing, retries, rollback, postcondition validation, kill-switch awareness.",
    canonicalRoots: ["src/lib/platform/execution/", "src/lib/orchestration/", "src/lib/core-services/executor-service/"],
    forbiddenImports: ["src/pages/**", "src/components/**"],
    mayImportFrom: ["L3-platform"],
    registryFile: "src/lib/platform/execution/execution-registry.ts",
    docFile: "docs/architecture/EXECUTION_MODEL.md",
  },
  {
    layer: "L3-platform",
    key: "platform.eventing",
    displayName: "Eventing & Messaging",
    description: "Event classes, publisher/subscriber model, persistence/replay, trusted vs untrusted sources.",
    canonicalRoots: ["src/lib/runtime/runtime-message-registry.ts", "src/lib/runtime/event-classification-map.ts", "src/lib/core-services/event-bus/"],
    forbiddenImports: ["src/pages/**"],
    mayImportFrom: ["L3-platform"],
    registryFile: "src/lib/runtime/event-classification-map.ts",
    docFile: "docs/architecture/RUNTIME_MESSAGING_ARCHITECTURE.md",
  },
  {
    layer: "L3-platform",
    key: "platform.observability",
    displayName: "Observability & Diagnostics",
    description: "Structured logs, metrics, traces, drift indicators, support diagnostics, admin inspection surfaces.",
    canonicalRoots: ["src/lib/platform/observability/", "src/lib/architecture/observability-diagnostics.ts"],
    forbiddenImports: ["src/pages/**"],
    mayImportFrom: ["L3-platform"],
    registryFile: "src/lib/platform/observability/observability-registry.ts",
    docFile: "docs/architecture/OBSERVABILITY_AND_INCIDENT_MODEL.md",
  },
  {
    layer: "L3-platform",
    key: "platform.sync",
    displayName: "Sync & Continuity",
    description: "Cross-device + offline-to-online convergence, namespaces, conflict resolution, replay, degraded-network policy.",
    canonicalRoots: ["src/lib/platform/sync/"],
    forbiddenImports: ["src/pages/**"],
    mayImportFrom: ["L3-platform"],
    registryFile: "src/lib/platform/sync/sync-topology-registry.ts",
    docFile: "docs/architecture/SYNC_AND_CONTINUITY_MODEL.md",
  },
  {
    layer: "L3-platform",
    key: "platform.notifications",
    displayName: "Notifications",
    description: "Cross-surface notification routing, push, calm policy / fatigue control, delivery proof.",
    canonicalRoots: ["src/lib/platform/notifications/"],
    forbiddenImports: ["src/pages/**"],
    mayImportFrom: ["L3-platform"],
    registryFile: "src/lib/platform/notifications/notification-topology.ts",
    docFile: "docs/architecture/NOTIFICATION_RUNTIME_MODEL.md",
  },
] as const;

export const L3_PLATFORM_SERVICES: readonly L3PlatformService[] = [
  "auth",
  "policies",
  "proof",
  "execution",
  "eventing",
  "observability",
  "sync",
  "notifications",
] as const;

export function getLayerEntry(key: string): SystemLayerEntry | undefined {
  return SYSTEM_LAYER_REGISTRY.find((e) => e.key === key);
}

export function getEntriesForLayer(layer: SystemLayer): readonly SystemLayerEntry[] {
  return SYSTEM_LAYER_REGISTRY.filter((e) => e.layer === layer);
}

export function getL3Service(service: L3PlatformService): SystemLayerEntry | undefined {
  return getLayerEntry(`platform.${service}`);
}

/** Returns true if `from` is allowed to import from `to`. */
export function canImportFrom(from: SystemLayer, to: SystemLayer): boolean {
  const entry = SYSTEM_LAYER_REGISTRY.find((e) => e.layer === from);
  if (!entry) return false;
  return entry.mayImportFrom.includes(to);
}

export function validateSystemStack(): { ok: boolean; missing: readonly string[] } {
  const expected = ["experience.surfaces", "domain.framework", ...L3_PLATFORM_SERVICES.map((s) => `platform.${s}`)];
  const missing = expected.filter((k) => !getLayerEntry(k));
  return { ok: missing.length === 0, missing };
}
