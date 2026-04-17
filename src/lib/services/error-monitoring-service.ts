// ═══════════════════════════════════════════════════════════════
// SITA OS — Error Monitoring Service (Phase 20.A — REWIRED)
// Captures unhandled errors & rejections, batches reports to
// the new error-ingest edge function, also forwards to Sentry
// when active. Native sink always works.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { captureException, isSentryActive } from "@/lib/observability/sentry";
import { fingerprintError, getRuntimeErrorContext } from "@/lib/observability/runtime-error-context";
import { getCurrentCorrelationId } from "@/lib/observability/request-context";
import { APP_RELEASE, APP_ENVIRONMENT } from "@/lib/observability/release";

interface ErrorReport {
  fingerprint: string;
  message: string;
  stack?: string;
  source: "frontend";
  severity: "fatal" | "error" | "warning" | "info";
  route: string;
  correlation_id: string | null;
  release: string;
  environment: string;
  user_agent: string;
  metadata: Record<string, unknown>;
  sentry_event_id?: string;
}

const BATCH_INTERVAL_MS = 10_000;
const MAX_BATCH_SIZE = 25;

let errorQueue: ErrorReport[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let initialized = false;

function build(message: string, stack?: string, severity: ErrorReport["severity"] = "error", source?: string): ErrorReport {
  const ctx = getRuntimeErrorContext(getCurrentCorrelationId());
  return {
    fingerprint: fingerprintError(message, stack),
    message: String(message).slice(0, 2048),
    stack: stack?.slice(0, 8192),
    source: "frontend",
    severity,
    route: ctx.route,
    correlation_id: ctx.correlationId,
    release: APP_RELEASE,
    environment: APP_ENVIRONMENT,
    user_agent: ctx.userAgent,
    metadata: {
      surface: ctx.surface,
      capturedFrom: source,
      featureFlags: ctx.featureFlags,
      tenantId: ctx.tenantId,
    },
  };
}

async function flushQueue() {
  if (errorQueue.length === 0) return;
  const batch = errorQueue.splice(0, MAX_BATCH_SIZE);
  try {
    await supabase.functions.invoke("error-ingest", { body: { errors: batch } });
  } catch {
    if (errorQueue.length < MAX_BATCH_SIZE * 2) errorQueue.push(...batch);
  }
}

function enqueue(report: ErrorReport) {
  errorQueue.push(report);
  if (errorQueue.length >= MAX_BATCH_SIZE) flushQueue();
}

export function initErrorMonitoring() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("error", (event) => {
    const report = build(
      event.message || "Unknown error",
      event.error?.stack,
      "error",
      `${event.filename}:${event.lineno}:${event.colno}`,
    );
    if (isSentryActive() && event.error) {
      const id = captureException(event.error);
      if (id) report.sentry_event_id = id;
    }
    enqueue(report);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const report = build(reason?.message || String(reason), reason?.stack, "error", "unhandledrejection");
    if (isSentryActive()) {
      const id = captureException(reason);
      if (id) report.sentry_event_id = id;
    }
    enqueue(report);
  });

  flushTimer = setInterval(flushQueue, BATCH_INTERVAL_MS);

  window.addEventListener("beforeunload", () => {
    if (flushTimer) clearInterval(flushTimer);
    flushQueue();
  });

  console.log("[ErrorMonitoring] Initialized (release=%s env=%s sentry=%s)", APP_RELEASE, APP_ENVIRONMENT, isSentryActive());
}

export function reportFatalError(error: Error, componentStack?: string) {
  const report = build(error.message, error.stack || componentStack, "fatal", "ErrorBoundary");
  if (isSentryActive()) {
    const id = captureException(error, { componentStack });
    if (id) report.sentry_event_id = id;
  }
  enqueue(report);
  flushQueue();
}

export function reportWarning(message: string, context?: string) {
  enqueue(build(message, undefined, "warning", context));
}
