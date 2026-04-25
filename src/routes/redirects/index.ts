// ═══════════════════════════════════════════════════════════════
// SITA OS — Routes Redirect Barrel (Wave G — Constitution Rule 51)
//
// Single canonical entry point for all route-level redirects.
// User-domain redirects: src/routes/redirects/user-redirect-map.ts
// Admin redirects:       re-exported from @/platform/architecture/admin-redirect-map
// ═══════════════════════════════════════════════════════════════

export { USER_REDIRECTS, type UserRedirect, type UserRedirectEntry } from "./user-redirect-map";
export { ADMIN_REDIRECTS, buildAdminRedirects, type AdminRedirect } from "./admin-redirect-map";