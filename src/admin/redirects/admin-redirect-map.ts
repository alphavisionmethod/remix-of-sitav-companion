// Wave 0.8 — body relocated to @/platform/architecture/admin-redirect-map
// to eliminate the last platform → admin import. This file is preserved
// as a thin re-export so existing consumers keep working.
export { ADMIN_REDIRECTS, buildAdminRedirects } from "@/platform/architecture/admin-redirect-map";
export type { AdminRedirect } from "@/platform/architecture/admin-redirect-map";
