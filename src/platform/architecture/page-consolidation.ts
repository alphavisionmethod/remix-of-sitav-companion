// ═══════════════════════════════════════════════════════════════
// SITA OS — Page Consolidation Barrel (Phase 7 governance)
//
// Re-exports the redirect maps so consumers (CI checks, docs
// generators, future migration scripts) have a single canonical
// import path that won't move when files relocate.
//
// Wave 0.8 — admin-redirect-map now lives in this same platform
// folder, so the platform → admin import has been eliminated.
// ═══════════════════════════════════════════════════════════════

export { ADMIN_REDIRECTS, buildAdminRedirects } from "@/platform/architecture/admin-redirect-map";
export type { AdminRedirect } from "@/platform/architecture/admin-redirect-map";
export { USER_REDIRECTS } from "@/routes/redirects/user-redirect-map";
export type { UserRedirect, UserRedirectEntry } from "@/routes/redirects/user-redirect-map";
