// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Boundary Policy
// Defines what features may import and what may import them.
// ═══════════════════════════════════════════════════════════════

/**
 * Feature barrels (src/features/<domain>/index.ts) are the ONLY
 * public entry points for each feature domain. Rules:
 *
 * 1. Feature barrels may import from:
 *    - src/components/**  (UI primitives and domain components)
 *    - src/pages/**       (page-level compositions)
 *    - src/contexts/**    (React context providers)
 *    - src/hooks/**       (shared hooks)
 *    - src/lib/**         (shared utilities)
 *    - src/platform/**    (platform contracts)
 *
 * 2. Feature barrels must NOT import from:
 *    - Other feature barrels (no peer feature coupling)
 *    - src/routes/**      (routes consume features, not vice versa)
 *    - src/integrations/**  (backend layer, not feature-facing)
 *
 * 3. Consumers should import from @/features/<domain>, not from
 *    internal paths like @/components/<domain>/SomeComponent.
 *    Exception: components used across many features remain
 *    importable directly from @/components/.
 *
 * 4. No page-level (.tsx with JSX rendering full views) files
 *    may live under src/features/. Pages belong in src/pages/.
 *    Feature barrels re-export them as stable public API.
 *
 * 5. Feature internal code (hooks, utils, sub-components) that
 *    is NOT part of the public API should NOT be exported from
 *    the barrel index.ts.
 */

export const FEATURE_IMPORT_ALLOWED_SOURCES = [
  "src/components/",
  "src/pages/",
  "src/contexts/",
  "src/hooks/",
  "src/lib/",
  "src/platform/",
  "src/packages/",
] as const;

export const FEATURE_IMPORT_PROHIBITED_SOURCES = [
  "src/features/",   // no peer feature imports
  "src/routes/",     // routes consume features
  "src/integrations/", // backend layer
] as const;

/** Directories where page-level files must live (not src/features/) */
export const PAGE_CANONICAL_DIRS = ["src/pages/"] as const;