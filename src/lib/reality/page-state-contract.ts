// ═══════════════════════════════════════════════════════════════
// SITA OS — Page State Contract
// Required UI states for every production page class.
// ═══════════════════════════════════════════════════════════════

export type PageClass =
  | "data-list"        // table/grid backed by query
  | "data-detail"      // single record detail
  | "form"             // create/edit form
  | "dashboard"        // multi-widget overview
  | "auth"             // login/signup/recovery
  | "static";          // marketing/info, no data

export type PageStateRequirement =
  | "loading"
  | "empty"
  | "error"
  | "degraded"
  | "permission-denied";

export interface PageStateContract {
  readonly pageClass: PageClass;
  readonly required: readonly PageStateRequirement[];
}

export const PAGE_STATE_CONTRACTS: Readonly<Record<PageClass, PageStateContract>> = {
  "data-list":        { pageClass: "data-list",        required: ["loading", "empty", "error", "permission-denied"] },
  "data-detail":      { pageClass: "data-detail",      required: ["loading", "error", "permission-denied"] },
  "form":             { pageClass: "form",             required: ["loading", "error", "permission-denied"] },
  "dashboard":        { pageClass: "dashboard",        required: ["loading", "error", "degraded", "permission-denied"] },
  "auth":             { pageClass: "auth",             required: ["loading", "error"] },
  "static":           { pageClass: "static",           required: [] },
};

export function getRequiredStates(pageClass: PageClass): readonly PageStateRequirement[] {
  return PAGE_STATE_CONTRACTS[pageClass].required;
}
