// ═══════════════════════════════════════════════════════════════
// SITA OS — Page Consolidation Barrel (Phase 7 governance)
//
// Re-exports the redirect maps so consumers (CI checks, docs
// generators, future migration scripts) have a single canonical
// import path that won't move when files relocate.
// ═══════════════════════════════════════════════════════════════

export { ADMIN_REDIRECTS, buildAdminRedirects } from "@/admin/redirects/admin-redirect-map";
export type { AdminRedirect } from "@/admin/redirects/admin-redirect-map";
export { USER_REDIRECTS } from "@/routes/redirects/user-redirect-map";
export type { UserRedirect, UserRedirectEntry } from "@/routes/redirects/user-redirect-map";
