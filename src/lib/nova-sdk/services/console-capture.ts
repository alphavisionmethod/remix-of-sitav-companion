// ═══════════════════════════════════════════════════════════════
// SITA OS — Console Capture Service
// Monkey-patches console for real-time log capture with ring buffer
// ═══════════════════════════════════════════════════════════════

export interface CapturedEntry {
  id: string;
  level: "log" | "warn" | "error" | "info" | "debug";
  message: string;
  args: unknown[];
  timestamp: number;
  source?: string;
}

type EntryCallback = (entry: CapturedEntry) => void;

class ConsoleCaptureService {
  private buffer: CapturedEntry[] = [];
  private maxSize = 1000;
  private capturing = false;
  private originals: Record<string, (...args: unknown[]) => void> = {};
  private listeners: Set<EntryCallback> = new Set();

  startCapture(): void {
    if (this.capturing) return;
    this.capturing = true;

    const levels = ["log", "warn", "error", "info", "debug"] as const;
    for (const level of levels) {
      this.originals[level] = (console as any)[level].bind(console);
      (console as any)[level] = (...args: unknown[]) => {
        // Call original
        this.originals[level](...args);
        // Capture
        const entry: CapturedEntry = {
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          level,
          message: args.map(a => {
            if (typeof a === "string") return a;
            try { return JSON.stringify(a); } catch { return String(a); }
          }).join(" "),
          args,
          timestamp: Date.now(),
          source: this.getSource(),
        };
        this.buffer.push(entry);
        if (this.buffer.length > this.maxSize) this.buffer.shift();
        this.listeners.forEach(cb => cb(entry));
      };
    }
  }

  stopCapture(): void {
    if (!this.capturing) return;
    this.capturing = false;
    for (const [level, fn] of Object.entries(this.originals)) {
      (console as any)[level] = fn;
    }
    this.originals = {};
  }

  getEntries(filter?: { level?: CapturedEntry["level"]; search?: string }): CapturedEntry[] {
    let entries = [...this.buffer];
    if (filter?.level) entries = entries.filter(e => e.level === filter.level);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      entries = entries.filter(e => e.message.toLowerCase().includes(q));
    }
    return entries;
  }

  clear(): void {
    this.buffer = [];
  }

  on(cb: EntryCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  isCapturing(): boolean {
    return this.capturing;
  }

  private getSource(): string {
    try {
      const stack = new Error().stack || "";
      const lines = stack.split("\n").filter(l => !l.includes("console-capture"));
      return lines[3]?.trim().replace(/^at\s+/, "").slice(0, 80) || "unknown";
    } catch {
      return "unknown";
    }
  }
}

export const consoleCapture = new ConsoleCaptureService();
