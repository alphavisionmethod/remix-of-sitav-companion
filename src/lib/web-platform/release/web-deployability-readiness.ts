// ═══════════════════════════════════════════════════════════════
// SITA OS — Web Deployability Readiness Registry
// Phase 13 — the 13-item Web deployability checklist as data.
// Mirrors the iOS/Android pattern in src/lib/mobile-platform/release.
// ═══════════════════════════════════════════════════════════════

export type WebReadinessStatus = "ready" | "partial" | "deferred" | "missing";

export interface WebReadinessItem {
  readonly id: string;
  readonly title: string;
  readonly status: WebReadinessStatus;
  readonly evidence: string;
  readonly blocker: boolean;
  readonly remediation?: string;
}

export const WEB_DEPLOYABILITY_READINESS: ReadonlyArray<WebReadinessItem> = [
  {
    id: "web-prod-build",
    title: "Production web build passes",
    status: "ready",
    evidence: "vite.config.ts with chunked vendor splits + health.json plugin; dist/ output verified.",
    blocker: false,
  },
  {
    id: "web-env-vars",
    title: "Environment variables fully documented",
    status: "ready",
    evidence: "docs/web/env-vars.md enumerates VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID, VITE_PUBLIC_HOST, VITE_VAPID_PUBLIC_KEY.",
    blocker: false,
  },
  {
    id: "web-auth-session",
    title: "Auth/session works in production",
    status: "ready",
    evidence: "ProtectedRoute + onAuthStateChange wired in App.tsx; Supabase client persists session in localStorage.",
    blocker: false,
  },
  {
    id: "web-pwa-behavior",
    title: "PWA behavior is correct (manifest + install)",
    status: "ready",
    evidence: "public/manifest.webmanifest with name/short_name/icons/display=standalone; iframe-guarded SW registration.",
    blocker: false,
  },
  {
    id: "web-sw-guard",
    title: "Service worker behavior is correct (preview/iframe guarded)",
    status: "ready",
    evidence: "src/main.tsx checks isInIframe + isPreviewHost before navigator.serviceWorker.register('/sw.js').",
    blocker: true,
  },
  {
    id: "web-push-vapid",
    title: "Push on web works where supported (VAPID)",
    status: "ready",
    evidence: "public/sw.js handles push + notificationclick + push-track callback; VAPID public key flows through services/push-token-lifecycle.ts.",
    blocker: false,
  },
  {
    id: "web-sandbox-honesty",
    title: "Browser sandbox constraints handled honestly",
    status: "ready",
    evidence: "src/lib/web-platform/web-runtime-contract.ts declares prohibited / simulation-only capabilities.",
    blocker: false,
  },
  {
    id: "web-file-handling",
    title: "File handling works in browser-safe ways (user-mediated picker only)",
    status: "ready",
    evidence: "src/lib/web-platform/web-fallbacks.ts — no silent disk access; File System Access API or <input type=file>.",
    blocker: false,
  },
  {
    id: "web-native-gating",
    title: "No native-only feature is exposed without gating",
    status: "ready",
    evidence: "WEB_RUNTIME_CONTRACT enumerates platformProhibited capabilities; UI guards via webCapability().",
    blocker: false,
  },
  {
    id: "web-deep-links",
    title: "Web routing works with deep links and refreshes",
    status: "ready",
    evidence: "BrowserRouter in App.tsx; nginx try_files $uri $uri/ /index.html SPA fallback in nginx/default.conf.",
    blocker: false,
  },
  {
    id: "web-seo-public-assets",
    title: "SEO/public assets valid (robots, sitemap, OG, canonical)",
    status: "ready",
    evidence: "public/robots.txt + public/sitemap.xml + index.html OG/Twitter/canonical tags present; vite publicHostRewritePlugin auto-rewrites https://app.sita.os → $WEB_PUBLIC_HOST in dist/ on build.",
    blocker: false,
  },
  {
    id: "web-csp-headers",
    title: "CSP / security headers defined and consistent across hosts",
    status: "ready",
    evidence: "index.html meta CSP + nginx/default.conf + deploy/nginx.conf all pin https://fctupowhcljejygjfpty.supabase.co + ai.gateway.lovable.dev.",
    blocker: true,
  },
  {
    id: "web-error-boundaries",
    title: "Error boundaries deployed and tested",
    status: "ready",
    evidence: "GlobalErrorBoundary + RouteErrorBoundary + WindowErrorBoundary wired in App.tsx; initErrorMonitoring() global capture.",
    blocker: true,
  },
];

export interface WebReadinessSummary {
  surface: "web";
  total: number;
  ready: number;
  partial: number;
  deferred: number;
  missing: number;
  blockers: number;
  ok: boolean;
  items: ReadonlyArray<WebReadinessItem>;
}

export function webReadinessSummary(): WebReadinessSummary {
  const counts: Record<WebReadinessStatus, number> = { ready: 0, partial: 0, deferred: 0, missing: 0 };
  let blockers = 0;
  for (const it of WEB_DEPLOYABILITY_READINESS) {
    counts[it.status]++;
    if (it.blocker && it.status !== "ready") blockers++;
  }
  return {
    surface: "web",
    total: WEB_DEPLOYABILITY_READINESS.length,
    ready: counts.ready,
    partial: counts.partial,
    deferred: counts.deferred,
    missing: counts.missing,
    blockers,
    // OK if zero missing, zero blockers; partials with remediation are acceptable.
    ok: counts.missing === 0 && blockers === 0,
    items: WEB_DEPLOYABILITY_READINESS,
  };
}
