// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Boundary Rules
// Defines allowed import directions between layers.
// Used by CI checks and runtime layer awareness.
// ═══════════════════════════════════════════════════════════════

import { LAYERS, type Layer } from "./layer-manifest";

// ── Allowed Import Directions ───────────────────────────────────
// Key = importing layer, Value = set of layers it may import from.
// Rule: lower layers must NOT import from higher layers.
// Kernel ← nothing above it. App can use OS_SERVICES but not OS_KERNEL directly.

export const ALLOWED_IMPORTS: Record<Layer, Set<Layer>> = {
  [LAYERS.WEB]: new Set([]),
  [LAYERS.APP]: new Set([LAYERS.OS_SERVICES, LAYERS.DOMAIN_CAPABILITY]),
  [LAYERS.OS_SERVICES]: new Set([LAYERS.OS_KERNEL, LAYERS.DOMAIN_CAPABILITY]),
  [LAYERS.OS_KERNEL]: new Set([]),
  [LAYERS.ADMIN_OPERATOR]: new Set([LAYERS.OS_SERVICES, LAYERS.OS_KERNEL, LAYERS.DOMAIN_CAPABILITY, LAYERS.APP]),
  [LAYERS.DOMAIN_CAPABILITY]: new Set([LAYERS.OS_KERNEL]),
};

// ── Forbidden Import Patterns ───────────────────────────────────
// These are hard violations that should never occur regardless of layer.

export const FORBIDDEN_PATTERNS = [
  {
    id: "WEB_IMPORTS_OS",
    description: "Web/public layer must not import OS kernel or services",
    sourceLayer: LAYERS.WEB,
    forbiddenLayers: [LAYERS.OS_KERNEL, LAYERS.OS_SERVICES, LAYERS.ADMIN_OPERATOR],
  },
  {
    id: "APP_IMPORTS_KERNEL",
    description: "App layer must not import OS kernel internals directly",
    sourceLayer: LAYERS.APP,
    forbiddenLayers: [LAYERS.OS_KERNEL],
  },
  {
    id: "KERNEL_IMPORTS_APP",
    description: "Kernel must not import from app or admin layers",
    sourceLayer: LAYERS.OS_KERNEL,
    forbiddenLayers: [LAYERS.APP, LAYERS.ADMIN_OPERATOR, LAYERS.WEB],
  },
  {
    id: "DOMAIN_IMPORTS_APP",
    description: "Domain capabilities must not import app-layer components",
    sourceLayer: LAYERS.DOMAIN_CAPABILITY,
    forbiddenLayers: [LAYERS.APP, LAYERS.ADMIN_OPERATOR, LAYERS.WEB],
  },
] as const;

// ── Check if an import is allowed ───────────────────────────────

export function isImportAllowed(fromLayer: Layer, toLayer: Layer): boolean {
  if (fromLayer === toLayer) return true; // same-layer always allowed
  return ALLOWED_IMPORTS[fromLayer]?.has(toLayer) ?? false;
}

// ── Rendering Rules ─────────────────────────────────────────────
// Which layout shells are valid for each layer.

export const VALID_SHELLS: Record<Layer, string[]> = {
  [LAYERS.WEB]: ["PublicLayout"],
  [LAYERS.APP]: ["ShellLayout"],
  [LAYERS.OS_KERNEL]: [], // kernel has no routes
  [LAYERS.OS_SERVICES]: ["ShellLayout"],
  [LAYERS.ADMIN_OPERATOR]: ["AdminShell", "OwnerWorkspaceShell"],
  [LAYERS.DOMAIN_CAPABILITY]: [], // capabilities have no routes
};

// ── Layer Hierarchy (for display) ───────────────────────────────

export const LAYER_HIERARCHY: { layer: Layer; label: string; description: string; color: string }[] = [
  { layer: LAYERS.WEB, label: "Web", description: "Public web shell — landing, auth, marketing", color: "hsl(200 60% 50%)" },
  { layer: LAYERS.APP, label: "App", description: "Authenticated user experience — dashboards, domain surfaces", color: "hsl(152 55% 48%)" },
  { layer: LAYERS.OS_SERVICES, label: "OS Services", description: "Cross-domain orchestration — attention, continuity, timing", color: "hsl(265 55% 58%)" },
  { layer: LAYERS.OS_KERNEL, label: "OS Kernel", description: "Execution primitives — brain, policy, receipts, capabilities", color: "hsl(38 85% 58%)" },
  { layer: LAYERS.ADMIN_OPERATOR, label: "Admin/Operator", description: "Governance, truth, verification, launch readiness", color: "hsl(0 65% 55%)" },
  { layer: LAYERS.DOMAIN_CAPABILITY, label: "Domain Capability", description: "Bounded domain actions — business, finance, concierge", color: "hsl(180 50% 45%)" },
];
