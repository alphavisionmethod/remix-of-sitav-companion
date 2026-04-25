// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Redirect Map (Wave G canonical re-export)
//
// Body lives at @/platform/architecture/admin-redirect-map.
// This file gives the routes layer its own redirect entry point so that
// `import { ADMIN_REDIRECTS } from "@/routes/redirects"` works alongside
// the existing `@/admin/redirects/admin-redirect-map` shim.
// ═══════════════════════════════════════════════════════════════

export { ADMIN_REDIRECTS, buildAdminRedirects } from "@/platform/architecture/admin-redirect-map";
export type { AdminRedirect } from "@/platform/architecture/admin-redirect-map";