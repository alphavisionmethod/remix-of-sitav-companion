// ═══════════════════════════════════════════════════════════════
// SITA OS — Structured Logger
// JSON structured logging with correlation IDs, severity,
// domain tagging, and performance tracking
// ═══════════════════════════════════════════════════════════════

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  domain?: string;
  service?: string;
  correlationId?: string;
  userId?: string;
  surface?: string;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0, info: 1, warn: 2, error: 3, fatal: 4,
};

let minLevel: LogLevel = "info";
let globalCorrelationId: string | undefined;
let logBuffer: LogEntry[] = [];
const MAX_BUFFER = 500;

export function setMinLogLevel(level: LogLevel) { minLevel = level; }
export function setCorrelationId(id: string) { globalCorrelationId = id; }
export function getLogBuffer(): LogEntry[] { return [...logBuffer]; }
export function clearLogBuffer() { logBuffer = []; }

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
}

function createEntry(level: LogLevel, message: string, ctx?: Partial<LogEntry>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId: ctx?.correlationId ?? globalCorrelationId,
    ...ctx,
  };
}

function emit(entry: LogEntry) {
  logBuffer.push(entry);
  if (logBuffer.length > MAX_BUFFER) logBuffer.shift();

  const formatted = JSON.stringify(entry);
  switch (entry.level) {
    case "debug": console.debug(formatted); break;
    case "info": console.info(formatted); break;
    case "warn": console.warn(formatted); break;
    case "error":
    case "fatal": console.error(formatted); break;
  }
}

export const logger = {
  debug: (msg: string, ctx?: Partial<LogEntry>) => { if (shouldLog("debug")) emit(createEntry("debug", msg, ctx)); },
  info: (msg: string, ctx?: Partial<LogEntry>) => { if (shouldLog("info")) emit(createEntry("info", msg, ctx)); },
  warn: (msg: string, ctx?: Partial<LogEntry>) => { if (shouldLog("warn")) emit(createEntry("warn", msg, ctx)); },
  error: (msg: string, err?: Error, ctx?: Partial<LogEntry>) => {
    if (shouldLog("error")) {
      emit(createEntry("error", msg, {
        ...ctx,
        error: err ? { name: err.name, message: err.message, stack: err.stack } : undefined,
      }));
    }
  },
  fatal: (msg: string, err?: Error, ctx?: Partial<LogEntry>) => {
    if (shouldLog("fatal")) {
      emit(createEntry("fatal", msg, {
        ...ctx,
        error: err ? { name: err.name, message: err.message, stack: err.stack } : undefined,
      }));
    }
  },

  /** Measure async operation latency */
  async timed<T>(label: string, fn: () => Promise<T>, ctx?: Partial<LogEntry>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const latencyMs = Math.round(performance.now() - start);
      emit(createEntry("info", `${label} completed`, { ...ctx, latencyMs }));
      return result;
    } catch (err) {
      const latencyMs = Math.round(performance.now() - start);
      emit(createEntry("error", `${label} failed`, {
        ...ctx,
        latencyMs,
        error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : undefined,
      }));
      throw err;
    }
  },

  /** Generate a correlation ID */
  correlationId(): string {
    return `cor_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  },
};
