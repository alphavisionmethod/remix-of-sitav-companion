// ═══════════════════════════════════════════════════════════════
// SITA OS — Product Boundary Contract
// Defines allowed and forbidden cross-product dependencies
// ═══════════════════════════════════════════════════════════════

import { ProductSurface } from "./product-surface-registry";

export interface CrossProductDependency {
  from: ProductSurface;
  to: ProductSurface;
  allowed: boolean;
  reason: string;
}

/** Allowed cross-product dependency edges */
export const ALLOWED_DEPENDENCIES: CrossProductDependency[] = [
  { from: ProductSurface.SITA_OS_DESKTOP, to: ProductSurface.SITA_CORE_API, allowed: true, reason: "OS consumes Core API for all backend operations" },
  { from: ProductSurface.SITA_MOBILE_APP, to: ProductSurface.SITA_CORE_API, allowed: true, reason: "Mobile consumes Core API for all backend operations" },
  { from: ProductSurface.SITA_ADMIN_BACKEND, to: ProductSurface.SITA_CORE_API, allowed: true, reason: "Admin consumes Core API for system management" },
];

/** Forbidden cross-product import patterns */
export const FORBIDDEN_IMPORTS: Array<{
  from: ProductSurface;
  to: ProductSurface;
  forbiddenPathPatterns: string[];
  reason: string;
}> = [
  {
    from: ProductSurface.SITA_MOBILE_APP,
    to: ProductSurface.SITA_OS_DESKTOP,
    forbiddenPathPatterns: [
      "components/desktop/",
      "components/shell/",
      "components/dock/",
      "components/window/",
    ],
    reason: "Mobile must never import OS shell components — different rendering model",
  },
  {
    from: ProductSurface.SITA_ADMIN_BACKEND,
    to: ProductSurface.SITA_OS_DESKTOP,
    forbiddenPathPatterns: [
      "pages/business/",
      "pages/finance/",
      "pages/concierge/",
      "pages/investment/",
      "pages/boardroom/",
    ],
    reason: "Admin must not import domain app UI pages — operator-only surface",
  },
  {
    from: ProductSurface.SITA_OS_DESKTOP,
    to: ProductSurface.SITA_MOBILE_APP,
    forbiddenPathPatterns: [
      "components/mobile/",
      "pages/mobile/",
    ],
    reason: "OS Desktop must not import mobile shell — separate rendering surface",
  },
  {
    from: ProductSurface.SITA_ADMIN_BACKEND,
    to: ProductSurface.SITA_MOBILE_APP,
    forbiddenPathPatterns: [
      "components/mobile/",
      "pages/mobile/",
    ],
    reason: "Admin must not import mobile components",
  },
];

/**
 * Shared contract layers that all surfaces may import.
 * These live in src/packages/, src/platform/, src/lib/, src/integrations/.
 */
export const SHARED_IMPORT_NAMESPACES = [
  "src/packages/",
  "src/platform/",
  "src/lib/",
  "src/integrations/",
  "src/hooks/",
  "src/components/ui/",
  "src/components/sita/",
  "src/components/auth/",
] as const;

export function isDependencyAllowed(from: ProductSurface, to: ProductSurface): boolean {
  if (from === to) return true;
  return ALLOWED_DEPENDENCIES.some(d => d.from === from && d.to === to && d.allowed);
}

export function getForbiddenImports(fromSurface: ProductSurface): string[] {
  return FORBIDDEN_IMPORTS
    .filter(f => f.from === fromSurface)
    .flatMap(f => f.forbiddenPathPatterns);
}