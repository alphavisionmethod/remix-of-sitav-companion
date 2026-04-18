// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical 5-Plane Architecture Registry
//
// Single source of truth for the platform's horizontal planes.
// Every route, app, service, and module belongs to exactly one
// plane. Cross-plane imports are governed by boundary checks.
//
// This registry CONSOLIDATES the prior sprawl:
//   - 7 namespaces in src/planes/index.ts
//   - 4 PlaneKey values in PlaneBoundaryGuard
//   - Various ad-hoc plane labels across docs
// ═══════════════════════════════════════════════════════════════

export type CanonicalPlaneKey =
  | "core-os"          // Native substrate: image builder, boot, trust, update, recovery
  | "shell-runtime"    // Electron host + window/launcher/notifications/IPC bridge
  | "user"             // End-user product surfaces (Business/Money/Concierge/Files/Boardroom)
  | "admin"            // Operator control plane (observability/release/security/governance)
  | "backend-services" // Supabase, edge functions, DB, storage, auth, gateways
  ;

export type LegacyPlaneKey =
  | "control"
  | "product"
  | "shared-core"
  | "internal-execution";

export type PlaneKeyAny = CanonicalPlaneKey | LegacyPlaneKey;

export interface CanonicalPlaneInfo {
  key: CanonicalPlaneKey;
  label: string;
  shortLabel: string;
  description: string;
  /** Top-level directories that physically house this plane. */
  ownedPaths: string[];
  /** Which planes this plane is allowed to import from. */
  mayImportFrom: CanonicalPlaneKey[];
  /** Which planes MUST NOT import from this plane. */
  mustNotBeImportedBy: CanonicalPlaneKey[];
  /** Default deployment profiles that include this plane. */
  defaultProfiles: ("user" | "operator")[];
  /** Display tokens (semantic, no raw color). */
  badgeClass: string;
}

export const CANONICAL_PLANES: Record<CanonicalPlaneKey, CanonicalPlaneInfo> = {
  "core-os": {
    key: "core-os",
    label: "Core OS Platform",
    shortLabel: "Core OS",
    description:
      "Ubuntu-native substrate: image builder, boot/trust chain, dm-verity, A/B updates, recovery, diagnostics.",
    ownedPaths: ["os/", "src/planes/os.ts", "src/runtimes/native/"],
    mayImportFrom: [],
    mustNotBeImportedBy: [],
    defaultProfiles: ["user", "operator"],
    badgeClass: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  "shell-runtime": {
    key: "shell-runtime",
    label: "Shell Runtime",
    shortLabel: "Shell",
    description:
      "Electron host, window manager, app launcher, notifications, command palette, IPC bridge — shared by all planes.",
    ownedPaths: ["electron/", "src/runtimes/shell/", "src/components/sita/shell/", "src/components/sita/os/"],
    mayImportFrom: ["core-os"],
    mustNotBeImportedBy: [],
    defaultProfiles: ["user", "operator"],
    badgeClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  user: {
    key: "user",
    label: "User Product Plane",
    shortLabel: "User",
    description:
      "End-user product surfaces: Business OS, Money, Concierge, Files, Boardroom, Workspace, Apps, Settings.",
    ownedPaths: [
      "src/planes/product.ts",
      "src/planes/founder.ts",
      "src/app/",
      "src/pages/",
      "src/components/business/",
      "src/components/money/",
      "src/components/concierge/",
      "src/components/files/",
      "src/components/boardroom/",
    ],
    mayImportFrom: ["shell-runtime", "core-os", "backend-services"],
    mustNotBeImportedBy: ["admin"],
    defaultProfiles: ["user"],
    badgeClass: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  admin: {
    key: "admin",
    label: "Admin Control Plane",
    shortLabel: "Admin",
    description:
      "Operator control plane: observability, release readiness, support, verification, security, AI governance.",
    ownedPaths: [
      "src/planes/admin.ts",
      "src/admin/",
      "src/pages/admin/",
      "src/components/admin/",
    ],
    mayImportFrom: ["shell-runtime", "core-os", "backend-services"],
    mustNotBeImportedBy: ["user"],
    defaultProfiles: ["operator"],
    badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  "backend-services": {
    key: "backend-services",
    label: "Backend Services Plane",
    shortLabel: "Backend",
    description:
      "Supabase, edge functions, DB, storage, auth, AI gateway, sync — governed (not replaced) by the admin plane.",
    ownedPaths: [
      "src/planes/backend.ts",
      "src/integrations/supabase/",
      "supabase/",
    ],
    mayImportFrom: [],
    mustNotBeImportedBy: [],
    defaultProfiles: ["user", "operator"],
    badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
};

/**
 * Map deprecated PlaneKey values onto the canonical 5.
 * Keep this shim until callers are migrated.
 */
export const LEGACY_PLANE_MAP: Record<LegacyPlaneKey, CanonicalPlaneKey> = {
  control: "admin",
  product: "user",
  "shared-core": "backend-services",
  "internal-execution": "admin",
};

export function resolvePlane(key: PlaneKeyAny): CanonicalPlaneKey {
  if (key in CANONICAL_PLANES) return key as CanonicalPlaneKey;
  return LEGACY_PLANE_MAP[key as LegacyPlaneKey] ?? "user";
}

export function getPlaneInfo(key: PlaneKeyAny): CanonicalPlaneInfo {
  return CANONICAL_PLANES[resolvePlane(key)];
}

export const ALL_CANONICAL_PLANES: CanonicalPlaneKey[] = Object.keys(
  CANONICAL_PLANES,
) as CanonicalPlaneKey[];
