// SITA OS — Mobile Offline Policy
export type OfflineMode = "full" | "read-only" | "degraded" | "blocked";
export interface OfflineSurface { readonly surface: string; readonly offlineMode: OfflineMode; readonly cacheStrategy: string; readonly syncOnReconnect: boolean; readonly degradedUx: string; }
export const MOBILE_OFFLINE_SURFACES: readonly OfflineSurface[] = [
  { surface: "Dashboard", offlineMode: "read-only", cacheStrategy: "Service worker stale-while-revalidate", syncOnReconnect: true, degradedUx: "Cached data with Offline banner" },
  { surface: "Authentication", offlineMode: "blocked", cacheStrategy: "Session token in localStorage", syncOnReconnect: true, degradedUx: "Network required message" },
  { surface: "Files", offlineMode: "read-only", cacheStrategy: "Recently viewed in IndexedDB", syncOnReconnect: true, degradedUx: "View cached; upload disabled" },
  { surface: "AI Advisors", offlineMode: "blocked", cacheStrategy: "No offline AI", syncOnReconnect: false, degradedUx: "Requires connection notice" },
  { surface: "Settings", offlineMode: "read-only", cacheStrategy: "Profile cached; changes queued", syncOnReconnect: true, degradedUx: "View-only" },
  { surface: "Notifications", offlineMode: "read-only", cacheStrategy: "Last-fetched cached", syncOnReconnect: true, degradedUx: "Cached list; badge may be stale" },
  { surface: "Payments", offlineMode: "blocked", cacheStrategy: "None", syncOnReconnect: false, degradedUx: "Connection required" },
  { surface: "Connectors", offlineMode: "blocked", cacheStrategy: "None", syncOnReconnect: false, degradedUx: "Status unknown; operations disabled" },
];
export function getOfflineCapableSurfaces(): OfflineSurface[] { return MOBILE_OFFLINE_SURFACES.filter(s => s.offlineMode !== "blocked"); }
