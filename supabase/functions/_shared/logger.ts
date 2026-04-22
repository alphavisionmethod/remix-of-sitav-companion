// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Structured Logger
// JSON-structured logging with correlation IDs and severity
// ═══════════════════════════════════════════════════════════════

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  ts: string;
  level: LogLevel;
  fn: string;
  correlationId?: string;
  msg: string;
  data?: Record<string, unknown>;
  latencyMs?: number;
}

export class EdgeLogger {
  private fn: string;
  private correlationId?: string;

  constructor(functionName: string, correlationId?: string) {
    this.fn = functionName;
    this.correlationId = correlationId;
  }

  private log(level: LogLevel, msg: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      fn: this.fn,
      msg,
      ...(this.correlationId && { correlationId: this.correlationId }),
      ...(data && { data }),
    };
    const output = JSON.stringify(entry);
    if (level === "error") console.error(output);
    else if (level === "warn") console.warn(output);
    else console.log(output);
  }

  debug(msg: string, data?: Record<string, unknown>) { this.log("debug", msg, data); }
  info(msg: string, data?: Record<string, unknown>) { this.log("info", msg, data); }
  warn(msg: string, data?: Record<string, unknown>) { this.log("warn", msg, data); }
  error(msg: string, data?: Record<string, unknown>) { this.log("error", msg, data); }

  /** Log request completion with latency */
  complete(status: number, latencyMs: number, data?: Record<string, unknown>) {
    this.log(status >= 400 ? "error" : "info", `${status} in ${latencyMs}ms`, { status, latencyMs, ...data });
  }

  /** Create child logger with correlation ID */
  child(correlationId: string): EdgeLogger {
    return new EdgeLogger(this.fn, correlationId);
  }

  /** Start a timer — call the returned function to log elapsed time */
  timer(label: string): () => void {
    const start = performance.now();
    return () => {
      const elapsed = Math.round(performance.now() - start);
      this.info(`${label} completed`, { latencyMs: elapsed });
    };
  }
}
