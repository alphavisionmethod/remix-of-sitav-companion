// ═══════════════════════════════════════════════════════════════
// SITA OS — Error Monitoring Service
// Captures unhandled errors & rejections, batches reports to
// the support-gateway edge function for centralized observability.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

interface ErrorReport {
  message: string;
  stack?: string;
  source?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  severity: "fatal" | "error" | "warning";
}

const BATCH_INTERVAL_MS = 10_000;
const MAX_BATCH_SIZE = 25;

let errorQueue: ErrorReport[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let initialized = false;

function createReport(
  message: string,
  stack?: string,
  severity: ErrorReport["severity"] = "error",
  source?: string
): ErrorReport {
  return {
    message: String(message).slice(0, 2048),
    stack: stack?.slice(0, 4096),
    source,
    severity,
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : "",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };
}

async function flushQueue() {
  if (errorQueue.length === 0) return;

  const batch = errorQueue.splice(0, MAX_BATCH_SIZE);

  try {
    await supabase.functions.invoke("support-gateway", {
      body: { action: "report-errors", errors: batch },
    });
  } catch {
    // If reporting fails, re-enqueue (once) to avoid infinite loops
    if (errorQueue.length < MAX_BATCH_SIZE * 2) {
      errorQueue.push(...batch);
    }
  }
}

function enqueue(report: ErrorReport) {
  errorQueue.push(report);
  if (errorQueue.length >= MAX_BATCH_SIZE) {
    flushQueue();
  }
}

/**
 * Initialize global error monitoring.
 * Call once at application startup (before React render).
 */
export function initErrorMonitoring() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // Capture uncaught errors
  window.addEventListener("error", (event) => {
    enqueue(
      createReport(
        event.message || "Unknown error",
        event.error?.stack,
        "error",
        `${event.filename}:${event.lineno}:${event.colno}`
      )
    );
  });

  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    enqueue(
      createReport(
        reason?.message || String(reason),
        reason?.stack,
        "error",
        "unhandledrejection"
      )
    );
  });

  // Periodic flush
  flushTimer = setInterval(flushQueue, BATCH_INTERVAL_MS);

  // Flush on page unload
  window.addEventListener("beforeunload", () => {
    if (flushTimer) clearInterval(flushTimer);
    flushQueue();
  });

  console.log("[ErrorMonitoring] Initialized");
}

/**
 * Report a fatal error (e.g., from an ErrorBoundary).
 * Immediately enqueues and attempts flush.
 */
export function reportFatalError(error: Error, componentStack?: string) {
  enqueue(
    createReport(
      error.message,
      error.stack || componentStack,
      "fatal",
      "ErrorBoundary"
    )
  );
  // Attempt immediate flush for fatal errors
  flushQueue();
}

/**
 * Manually report a warning-level issue.
 */
export function reportWarning(message: string, context?: string) {
  enqueue(createReport(message, undefined, "warning", context));
}
