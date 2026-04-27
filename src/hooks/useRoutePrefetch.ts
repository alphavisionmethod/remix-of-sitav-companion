/**
 * Route Prefetch on Hover
 * Triggers lazy import() for route chunks on mouseenter/touchstart
 * so pages load before the user clicks.
 */

// Map of route prefixes to their lazy import functions
const routeImportMap: Record<string, () => Promise<unknown>> = {
  "/home": () => import("@/pages/DailyPulse"),
  "/desktop": () => import("@/pages/DesktopPage"),
  "/business": () => import("@/pages/BusinessCenter"),
  "/money": () => import("@/pages/MoneyCenter"),
  "/concierge": () => import("@/pages/ConciergeCenter"),
  "/settings": () => import("@/pages/SettingsPage"),
  "/workflows": () => import("@/pages/WorkflowsCenter"),
  "/proof": () => import("@/pages/ProofCenter"),
  "/boardroom": () => import("@/pages/Boardroom"),
  "/files": () => import("@/pages/FilesCenter"),
  // IA Phase 6: /life is redirected to /concierge/overview by USER_REDIRECTS;
  // prefetch the canonical destination instead of the archived LifeDashboard.
  "/life": () => import("@/pages/concierge/ConciergeOverview"),
  "/advisors": () => import("@/pages/advisors/AdvisorWorkspace"),
  "/personal-brain": () => import("@/pages/PersonalBrain"),
  "/profile": () => import("@/pages/UserProfilePage"),
  "/search": () => import("@/pages/SearchPage"),
};

const prefetchedRoutes = new Set<string>();

/** Prefetch the chunk for a given route path */
export function prefetchRoute(path: string) {
  // Find matching route prefix
  const key = Object.keys(routeImportMap).find(
    (prefix) => path === prefix || path.startsWith(prefix + "/")
  );
  if (!key || prefetchedRoutes.has(key)) return;

  prefetchedRoutes.add(key);
  // Fire-and-forget: browser caches the chunk
  routeImportMap[key]().catch(() => {
    // If prefetch fails, allow retry
    prefetchedRoutes.delete(key);
  });
}

/** Returns event handlers to attach to nav links for prefetch-on-hover */
export function usePrefetchHandlers(to: string) {
  return {
    onMouseEnter: () => prefetchRoute(to),
    onTouchStart: () => prefetchRoute(to),
  };
}
