// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Family Types (Wave G — Constitution Rule 51)
//
// Single source of truth for route family classification metadata.
// Every file in src/routes/families/** must register here via
// route-family-registry.ts.
// ═══════════════════════════════════════════════════════════════

/** What kind of architecture layer owns this route family. */
export type RouteFamilyKind =
  | "module" // src/modules/<pillar>/* product surfaces
  | "platform" // src/platform/<system>/* capability surfaces
  | "admin" // src/admin/** operator/admin surfaces
  | "app-runtime" // app-platform/store/launcher
  | "os-shell" // desktop, system, workspaces, built-in OS apps
  | "mobile-runtime"; // mobile shell trusted-device experience

/** Which user-facing surface bucket this family belongs to. */
export type RouteSurfaceKind =
  | "user-product" // end-user product features
  | "operator" // admin/founder/SRE
  | "shared-shell" // settings/notifications/search visible to both
  | "owner"; // owner-mode strategic console

/** Deployment profile visibility (matches profile-route-visibility-map). */
export type RouteProfileVisibility = "user" | "operator" | "both";

/** What the route file owns. Page bodies are forbidden in src/routes/**. */
export type RouteFamilyOwnership =
  | "topology-only" // pure path → element bindings
  | "shell-mount" // wraps Outlet with a provider/layout (declared)
  | "redirect-only"; // only Navigate elements

/** A single registered route family. */
export interface RouteFamilyDescriptor {
  /** Stable id, kebab-case, matches the family file basename without `-routes`. */
  id: string;
  /** Human-readable display name. */
  name: string;
  /** Family kind (architecture layer that owns the routes). */
  kind: RouteFamilyKind;
  /** User-facing surface bucket. */
  surface: RouteSurfaceKind;
  /** Profile visibility. */
  profiles: readonly RouteProfileVisibility[];
  /** What this file owns (must be topology-only / shell-mount / redirect-only). */
  owns: RouteFamilyOwnership;
  /** Glob-style canonical page family this family routes into. */
  canonicalPageOwner: string;
  /** Repo-relative path to the route family file. */
  filePath: string;
  /** Name of the exported factory (or component for the Mobile family). */
  factoryExport: string;
  /** Free-form notes (e.g., "split from experimental-routes in Wave G"). */
  notes?: string;
}

/** Registry envelope. */
export interface RouteFamilyRegistry {
  schemaVersion: 1;
  generatedAt: string;
  totalFamilies: number;
  families: readonly RouteFamilyDescriptor[];
}