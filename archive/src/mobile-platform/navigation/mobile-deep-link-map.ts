// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Deep-Link Map
// Single registry of every deep-link the mobile app can resolve.
// ═══════════════════════════════════════════════════════════════

import type { DeepLinkRoute, DeepLinkResolution } from "../contracts/deep-link-contract";

export const MOBILE_DEEP_LINKS: ReadonlyArray<DeepLinkRoute> = [
  { key: "home",                 path: "/mobile",                  routeTemplate: "/mobile",                    authRequirement: "authenticated", description: "Mobile home pulse",          staleFallback: "/mobile" },
  { key: "approval-detail",      path: "/mobile/approval/:id",     routeTemplate: "/mobile/approval/:id",       authRequirement: "biometric",     description: "Approval detail (gated)",    staleFallback: "/mobile/approvals" },
  { key: "approvals",            path: "/mobile/approvals",        routeTemplate: "/mobile/approvals",          authRequirement: "authenticated", description: "Approval queue",             staleFallback: "/mobile" },
  { key: "boardroom",            path: "/mobile/boardroom",        routeTemplate: "/mobile/boardroom",          authRequirement: "authenticated", description: "Boardroom mobile",           staleFallback: "/mobile" },
  { key: "proof-detail",         path: "/mobile/receipt/:id",      routeTemplate: "/mobile/receipt/:id",        authRequirement: "authenticated", description: "Proof receipt detail",       staleFallback: "/mobile/proof" },
  { key: "proof",                path: "/mobile/proof",            routeTemplate: "/mobile/proof",              authRequirement: "authenticated", description: "Proof inbox",                staleFallback: "/mobile" },
  { key: "alerts",               path: "/mobile/alerts",           routeTemplate: "/mobile/alerts",             authRequirement: "authenticated", description: "Alert center",               staleFallback: "/mobile" },
  { key: "emergency",            path: "/mobile/emergency",        routeTemplate: "/mobile/emergency",          authRequirement: "biometric",     description: "Emergency authority actions", staleFallback: "/mobile" },
  { key: "device-trust",         path: "/mobile/device-trust",     routeTemplate: "/mobile/device-trust",       authRequirement: "biometric",     description: "Device trust controls",      staleFallback: "/mobile/settings" },
  { key: "sync-control",         path: "/mobile/sync",             routeTemplate: "/mobile/sync",               authRequirement: "authenticated", description: "Sync control surface",        staleFallback: "/mobile/settings" },
  { key: "settings",             path: "/mobile/settings",         routeTemplate: "/mobile/settings",           authRequirement: "authenticated", description: "Mobile settings",             staleFallback: "/mobile" },
] as const;

const SCHEME = "sita://";

export function resolveDeepLink(url: string): DeepLinkResolution | null {
  if (!url) return null;

  // Strip scheme or origin
  let path = url;
  if (url.startsWith(SCHEME)) {
    path = "/" + url.slice(SCHEME.length).replace(/^\/+/, "");
  } else {
    try {
      const u = new URL(url);
      path = u.pathname;
    } catch {
      // already a path
    }
  }

  // Match against registered templates
  for (const route of MOBILE_DEEP_LINKS) {
    const params: Record<string, string> = {};
    const tplParts = route.routeTemplate.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);
    if (tplParts.length !== pathParts.length) continue;
    let ok = true;
    for (let i = 0; i < tplParts.length; i++) {
      if (tplParts[i].startsWith(":")) {
        params[tplParts[i].slice(1)] = pathParts[i];
      } else if (tplParts[i] !== pathParts[i]) {
        ok = false;
        break;
      }
    }
    if (ok) {
      let routePath = route.routeTemplate;
      for (const [k, v] of Object.entries(params)) {
        routePath = routePath.replace(`:${k}`, v);
      }
      return { key: route.key, routePath, params, authRequirement: route.authRequirement };
    }
  }

  return null;
}
