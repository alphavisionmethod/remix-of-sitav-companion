// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Error Context (Phase 20.A)
// Enriches every error report with route, user, tenant, correlation
// id, surface, and feature flags so error_events rows are useful.
// ═══════════════════════════════════════════════════════════════

import { APP_RELEASE, APP_ENVIRONMENT } from "./release";

export interface RuntimeErrorContext {
  route: string;
  userId: string | null;
  tenantId: string | null;
  correlationId: string | null;
  surface: string;
  featureFlags: Record<string, boolean>;
  release: string;
  environment: string;
  userAgent: string;
}

let currentUserId: string | null = null;
let currentTenantId: string | null = null;
let currentSurface = "web";
let currentFeatureFlags: Record<string, boolean> = {};

export function setErrorUser(userId: string | null, tenantId: string | null = null) {
  currentUserId = userId;
  currentTenantId = tenantId;
}

export function setErrorSurface(surface: string) {
  currentSurface = surface;
}

export function setErrorFeatureFlags(flags: Record<string, boolean>) {
  currentFeatureFlags = { ...flags };
}

export function getRuntimeErrorContext(correlationId: string | null = null): RuntimeErrorContext {
  return {
    route: typeof window !== "undefined" ? window.location.pathname + window.location.search : "",
    userId: currentUserId,
    tenantId: currentTenantId,
    correlationId,
    surface: currentSurface,
    featureFlags: currentFeatureFlags,
    release: APP_RELEASE,
    environment: APP_ENVIRONMENT,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };
}

/**
 * Stable-ish fingerprint for deduplication: first stack frame + message head.
 */
export function fingerprintError(message: string, stack?: string): string {
  const head = (message || "").slice(0, 120).replace(/\s+/g, " ").trim();
  const firstFrame = stack
    ?.split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("at "))
    ?.replace(/:\d+:\d+\)?$/g, "") || "";
  return `${head}|${firstFrame}`.slice(0, 240);
}
