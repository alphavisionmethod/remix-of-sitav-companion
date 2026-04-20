// ═══════════════════════════════════════════════════════════════
// SITA OS — Page Performance Budget
// Per-page-class performance expectations.
// ═══════════════════════════════════════════════════════════════

import type { PageClass } from "@/lib/reality/page-state-contract";

export interface PerformanceBudget {
  readonly pageClass: PageClass;
  readonly lcpMs: number;
  readonly fcpMs: number;
  readonly bundleKb: number;
  readonly skeletonRequired: boolean;
  readonly lazyLoadRequired: boolean;
}

export const PAGE_PERFORMANCE_BUDGETS: Readonly<Record<PageClass, PerformanceBudget>> = {
  "data-list": {
    pageClass: "data-list",
    lcpMs: 2000,
    fcpMs: 1000,
    bundleKb: 250,
    skeletonRequired: true,
    lazyLoadRequired: true,
  },
  "data-detail": {
    pageClass: "data-detail",
    lcpMs: 1800,
    fcpMs: 900,
    bundleKb: 200,
    skeletonRequired: true,
    lazyLoadRequired: true,
  },
  "form": {
    pageClass: "form",
    lcpMs: 1500,
    fcpMs: 800,
    bundleKb: 200,
    skeletonRequired: false,
    lazyLoadRequired: true,
  },
  "dashboard": {
    pageClass: "dashboard",
    lcpMs: 2500,
    fcpMs: 1200,
    bundleKb: 400,
    skeletonRequired: true,
    lazyLoadRequired: true,
  },
  "auth": {
    pageClass: "auth",
    lcpMs: 1200,
    fcpMs: 600,
    bundleKb: 100,
    skeletonRequired: false,
    lazyLoadRequired: false,
  },
  "static": {
    pageClass: "static",
    lcpMs: 1500,
    fcpMs: 800,
    bundleKb: 150,
    skeletonRequired: false,
    lazyLoadRequired: false,
  },
};

/** Get performance budget for a page class. */
export function getPerformanceBudget(pageClass: PageClass): PerformanceBudget {
  return PAGE_PERFORMANCE_BUDGETS[pageClass];
}

/** Evidence source path. */
export const PERFORMANCE_EVIDENCE_PATH = "generated/surface-performance-budget.json";