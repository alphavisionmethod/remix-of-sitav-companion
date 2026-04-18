// ═══════════════════════════════════════════════════════════════
// SITA OS — Sentry Integration (Phase 20.A)
// DSN-gated initialization. No-op if VITE_SENTRY_DSN not present.
// Always safe to call; never blocks app startup.
// ═══════════════════════════════════════════════════════════════

import * as Sentry from "@sentry/react";
import { APP_RELEASE, APP_ENVIRONMENT } from "./release";

let initialized = false;

const env = (typeof import.meta !== "undefined" ? import.meta.env : {}) as Record<string, string | undefined>;

/**
 * Initialize Sentry. Idempotent. No-op when DSN is missing.
 * Returns true if Sentry is now active.
 */
export function initSentry(): boolean {
  if (initialized) return true;
  if (typeof window === "undefined") return false;

  const dsn = env.VITE_SENTRY_DSN;
  if (!dsn) {
    // Silent: native error sink still operates without Sentry.
    return false;
  }

  try {
    Sentry.init({
      dsn,
      release: APP_RELEASE,
      environment: APP_ENVIRONMENT,
      tracesSampleRate: APP_ENVIRONMENT === "production" ? 0.1 : 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: APP_ENVIRONMENT === "production" ? 0.1 : 0,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
      ],
      beforeSend(event) {
        // Strip auth tokens / cookies from event payload defensively.
        if (event.request?.cookies) delete event.request.cookies;
        if (event.request?.headers) {
          const h = event.request.headers as Record<string, string>;
          delete h.authorization;
          delete h.Authorization;
          delete h.cookie;
        }
        return event;
      },
    });

    initialized = true;
    return true;
  } catch (err) {
    console.warn("[Sentry] init failed:", err);
    return false;
  }
}

export function isSentryActive(): boolean {
  return initialized;
}

export function setSentryUser(userId: string | null, tenantId?: string | null) {
  if (!initialized) return;
  if (!userId) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({ id: userId, ...(tenantId ? { tenantId } : {}) });
}

export function captureException(error: unknown, context?: Record<string, unknown>): string | null {
  if (!initialized) return null;
  try {
    return Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    return null;
  }
}

export { Sentry };
