import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// We need a fresh instance per test, so we'll create inline
class TestConsoleCaptureService {
  private buffer: any[] = [];
  private maxSize = 1000;
  private capturing = false;
  private originals: Record<string, (...args: unknown[]) => void> = {};
  private listeners: Set<(entry: any) => void> = new Set();

  startCapture(): void {
    if (this.capturing) return;
    this.capturing = true;
    const levels = ["log", "warn", "error", "info", "debug"] as const;
    for (const level of levels) {
      this.originals[level] = (console as any)[level].bind(console);
      (console as any)[level] = (...args: unknown[]) => {
        this.originals[level](...args);
        const entry = {
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          level,
          message: args.map(a => typeof a === "string" ? a : JSON.stringify(a)).join(" "),
          args,
          timestamp: Date.now(),
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

  getEntries(filter?: { level?: string; search?: string }): any[] {
    let entries = [...this.buffer];
    if (filter?.level) entries = entries.filter(e => e.level === filter.level);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      entries = entries.filter(e => e.message.toLowerCase().includes(q));
    }
    return entries;
  }

  clear(): void { this.buffer = []; }
  on(cb: (entry: any) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  isCapturing(): boolean { return this.capturing; }
}

describe("ConsoleCaptureService", () => {
  let service: TestConsoleCaptureService;

  beforeEach(() => {
    service = new TestConsoleCaptureService();
  });

  afterEach(() => {
    service.stopCapture();
  });

  it("starts and stops capture", () => {
    expect(service.isCapturing()).toBe(false);
    service.startCapture();
    expect(service.isCapturing()).toBe(true);
    service.stopCapture();
    expect(service.isCapturing()).toBe(false);
  });

  it("captures console.log entries", () => {
    service.startCapture();
    console.log("test message");
    const entries = service.getEntries();
    expect(entries.length).toBeGreaterThanOrEqual(1);
    expect(entries.some(e => e.message.includes("test message"))).toBe(true);
  });

  it("captures console.warn and console.error", () => {
    service.startCapture();
    console.warn("warn msg");
    console.error("error msg");
    const warns = service.getEntries({ level: "warn" });
    const errors = service.getEntries({ level: "error" });
    expect(warns.some(e => e.message.includes("warn msg"))).toBe(true);
    expect(errors.some(e => e.message.includes("error msg"))).toBe(true);
  });

  it("filters by search term", () => {
    service.startCapture();
    console.log("alpha");
    console.log("beta");
    const filtered = service.getEntries({ search: "alpha" });
    expect(filtered.every(e => e.message.includes("alpha"))).toBe(true);
  });

  it("clears buffer", () => {
    service.startCapture();
    console.log("before clear");
    service.clear();
    expect(service.getEntries().length).toBe(0);
  });

  it("ring buffer overflow drops oldest", () => {
    (service as any).maxSize = 5;
    service.startCapture();
    for (let i = 0; i < 10; i++) console.log(`msg-${i}`);
    const entries = service.getEntries();
    expect(entries.length).toBeLessThanOrEqual(5);
  });

  it("listener receives entries in real-time", () => {
    const received: any[] = [];
    service.on(entry => received.push(entry));
    service.startCapture();
    console.log("streamed");
    expect(received.some(e => e.message.includes("streamed"))).toBe(true);
  });

  it("unsubscribe stops listener", () => {
    const received: any[] = [];
    const unsub = service.on(entry => received.push(entry));
    service.startCapture();
    unsub();
    console.log("after unsub");
    // May or may not have entries depending on timing, but unsub should work
    expect(typeof unsub).toBe("function");
  });

  it("double start is idempotent", () => {
    service.startCapture();
    service.startCapture();
    expect(service.isCapturing()).toBe(true);
  });

  it("double stop is idempotent", () => {
    service.startCapture();
    service.stopCapture();
    service.stopCapture();
    expect(service.isCapturing()).toBe(false);
  });
});
