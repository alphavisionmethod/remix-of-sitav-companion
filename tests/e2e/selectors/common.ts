// ═══════════════════════════════════════════════════════
// SITA OS — Common Selectors
// Shared UI selectors used across all journey tests
// ═══════════════════════════════════════════════════════

export const COMMON = {
  SIDEBAR_NAV: "[data-testid='sidebar-nav']",
  SIDEBAR_TOGGLE: "[data-testid='sidebar-toggle']",
  MODE_TOGGLE: "[data-testid='mode-toggle']",
  DEMO_BADGE: "[data-testid='demo-mode-badge']",
  LIVE_BADGE: "[data-testid='live-mode-badge']",
  LOADING_STATE: "[data-testid='loading-state']",
  ERROR_STATE: "[data-testid='error-state']",
  EMPTY_STATE: "[data-testid='empty-state']",
  DEGRADED_BANNER: "[data-testid='degraded-banner']",
  UNAVAILABLE_BANNER: "[data-testid='unavailable-banner']",
  TOAST: "[data-sonner-toast]",
  PAGE_TITLE: "[data-testid='page-title']",
  BREADCRUMB: "[data-testid='breadcrumb']",
} as const;
