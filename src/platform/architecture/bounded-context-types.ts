// ═══════════════════════════════════════════════════════════════
// SITA OS — Bounded Context Types
// Canonical type definitions for the bounded-context registry.
// Every BoundedContextEntry must be backed by REAL code artifacts.
// ═══════════════════════════════════════════════════════════════

export type BoundedContextId =
  | "business-os"
  | "finance-os"
  | "concierge-os"
  | "investment-office"
  | "boardroom"
  | "mission-control"
  | "setup-identity"
  | "cloud-control-plane"
  | "integrations"
  | "proof-trust"
  | "runtime-kernel"
  | "mobile"
  | "admin";

export type BoundedContextOwner =
  | "business-team"
  | "finance-team"
  | "concierge-team"
  | "investment-team"
  | "boardroom-team"
  | "platform-team"
  | "identity-team"
  | "cloud-team"
  | "integration-team"
  | "trust-team"
  | "kernel-team"
  | "mobile-team"
  | "admin-team";

export type RuntimeTier =
  | "web"
  | "desktop"
  | "mobile-pwa"
  | "appliance"
  | "ios"
  | "android"
  | "offline"
  | "demo";

export type DeploymentUnit =
  | "user-spa"
  | "admin-spa"
  | "mobile-pwa"
  | "desktop-electron"
  | "vmware-appliance"
  | "edge-function-cluster"
  | "supabase-postgres"
  | "shared-bff";

export interface BoundedContextEntry {
  /** Canonical ID, kebab-case, used as foreign key across all registries. */
  readonly contextId: BoundedContextId;
  /** Human-readable name. */
  readonly contextName: string;
  /** One-paragraph description of what this context owns. */
  readonly description: string;
  /** Owning team. */
  readonly owner: BoundedContextOwner;
  /** Primary surface where this context is consumed. */
  readonly primarySurface: RuntimeTier;
  /** Authoritative source-of-truth file or directory (relative path). */
  readonly sourceOfTruth: readonly string[];
  /** Canonical APIs/edge-functions this context exposes. */
  readonly canonicalApis: readonly string[];
  /** Read models / view tables this context produces. */
  readonly readModels: readonly string[];
  /** Write models / mutation tables this context owns. */
  readonly writeModels: readonly string[];
  /** External systems this context depends on. */
  readonly externalDependencies: readonly string[];
  /** Edge function names registered to this context. */
  readonly edgeFunctions: readonly string[];
  /** Service IDs (from canonical-service-registry) this context owns. */
  readonly services: readonly string[];
  /** Database table names this context owns. */
  readonly tables: readonly string[];
  /** Test file patterns covering this context. */
  readonly tests: readonly string[];
  /** Deployment unit this context lives in. */
  readonly deploymentUnit: DeploymentUnit;
  /** Runtime tiers this context supports. */
  readonly runtimeTiersSupported: readonly RuntimeTier[];
  /** Critical journey IDs (golden paths) anchored here. */
  readonly criticalJourneys: readonly string[];
  /** Kill-switch IDs that affect this context. */
  readonly killSwitches: readonly string[];
  /** Runbook IDs that cover this context's incidents. */
  readonly supportRunbooks: readonly string[];
}

export interface BoundedContextRouteBinding {
  readonly contextId: BoundedContextId;
  readonly routePattern: string;
}

export interface BoundedContextDependencyEdge {
  readonly from: BoundedContextId;
  readonly to: BoundedContextId;
  readonly kind: "data" | "event" | "rpc" | "ui" | "auth";
  readonly description: string;
}
