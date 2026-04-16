// ═══════════════════════════════════════════════════════════════
// SITA OS — Error Monitoring Service
// Centralized error reporting — pluggable backend (console, 
// edge function, or external like Sentry when configured)
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
  userId?: string;
  severity: "error" | "warning" | "fatal";
  context?: Record<string, unknown>;
}

const ERROR_QUEUE: ErrorReport[] = [];
const FLUSH_INTERVAL = 30_000; // 30s
const MAX_QUEUE = 50;
let flushTimer: ReturnType<typeof setInterval> | null = null;

/** Format an error into a structured report */
function formatError(
  error: Error,
  severity: ErrorReport["severity"] = "error",
  context?: Record<string, unknown>
): ErrorReport {
  return {
    message: error.message,
    stack: error.stack,
    url: typeof window !== "undefined" ? window.location.href : "unknown",
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    severity,
    context,
  };
}

/** Queue an error report for batch sending */
function queueError(report: ErrorReport): void {
  ERROR_QUEUE.push(report);
  if (ERROR_QUEUE.length >= MAX_QUEUE) {
    flushErrors();
  }
}

/** Flush queued errors to the backend */
async function flushErrors(): Promise<void> {
  if (ERROR_QUEUE.length === 0) return;

  const batch = ERROR_QUEUE.splice(0, ERROR_QUEUE.length);

  try {
    // Get current user if available
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Send to edge function for persistence
    await supabase.functions.invoke("support-gateway", {
      body: {
        action: "report-errors",
        errors: batch.map(e => ({ ...e, userId })),
      },
    });
  } catch (err) {
    // If reporting fails, log locally — don't lose errors
    console.warn("[ErrorMonitor] Failed to flush errors:", err);
    // Re-queue failed reports (up to limit)
    if (ERROR_QUEUE.length + batch.length <= MAX_QUEUE * 2) {
      ERROR_QUEUE.push(...batch);
    }
  }
}

/** Start periodic error flushing */
function startFlushTimer(): void {
  if (flushTimer) return;
  flushTimer = setInterval(flushErrors, FLUSH_INTERVAL);
}

/** Stop periodic flushing */
function stopFlushTimer(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

// ── Public API ─────────────────────────────────────────

/** Report a caught error */
export function reportError(
  error: Error,
  context?: Record<string, unknown>
): void {
  const report = formatError(error, "error", context);
  console.error("[SITA Error]", error.message, context);
  queueError(report);
}

/** Report a fatal/unrecoverable error */
export function reportFatalError(
  error: Error,
  componentStack?: string,
  context?: Record<string, unknown>
): void {
  const report = formatError(error, "fatal", context);
  report.componentStack = componentStack;
  console.error("[SITA FATAL]", error.message, componentStack);
  queueError(report);
  // Flush immediately for fatal errors
  flushErrors();
}

/** Report a warning-level issue */
export function reportWarning(
  message: string,
  context?: Record<string, unknown>
): void {
  const report = formatError(new Error(message), "warning", context);
  queueError(report);
}

/** Initialize error monitoring (call once at app startup) */
export function initErrorMonitoring(): void {
  startFlushTimer();

  // Catch unhandled promise rejections
  if (typeof window !== "undefined") {
    window.addEventListener("unhandledrejection", (event) => {
      const error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));
      reportError(error, { type: "unhandledrejection" });
    });

    // Catch uncaught errors
    window.addEventListener("error", (event) => {
      if (event.error) {
        reportError(event.error, { type: "uncaught", filename: event.filename, lineno: event.lineno });
      }
    });

    // Flush on page unload
    window.addEventListener("beforeunload", () => {
      stopFlushTimer();
      flushErrors();
    });
  }
}

/** Get current error queue length (for diagnostics) */
export function getErrorQueueLength(): number {
  return ERROR_QUEUE.length;
}
