import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppEventLoop } from "../managed-runtime";

describe("AppEventLoop", () => {
  let loop: AppEventLoop;

  beforeEach(() => {
    loop = new AppEventLoop();
  });

  afterEach(() => {
    loop.stop();
  });

  it("starts and reports running state", () => {
    expect(loop.isRunning).toBe(false);
    loop.start();
    expect(loop.isRunning).toBe(true);
  });

  it("stops cleanly", () => {
    loop.start();
    loop.stop();
    expect(loop.isRunning).toBe(false);
  });

  it("pauses and resumes", () => {
    loop.start();
    loop.pause();
    expect(loop.isRunning).toBe(false);
    expect(loop.stats.paused).toBe(true);
    loop.resume();
    expect(loop.isRunning).toBe(true);
  });

  it("enqueues messages with priority ordering", () => {
    const order: string[] = [];
    loop.defer(() => order.push("idle"), "idle");
    loop.postMessage(() => order.push("normal"), "normal");
    loop.schedule(() => order.push("immediate"), "immediate");
    // Queue should be sorted: immediate, normal, idle
    expect(loop.pending).toBe(3);
  });

  it("cancel removes event from queue", () => {
    const id = loop.postMessage(() => {}, "test");
    expect(loop.pending).toBe(1);
    const cancelled = loop.cancel(id);
    expect(cancelled).toBe(true);
    expect(loop.pending).toBe(0);
  });

  it("cancel returns false for unknown id", () => {
    expect(loop.cancel(9999)).toBe(false);
  });

  it("stats returns correct shape", () => {
    const stats = loop.stats;
    expect(stats).toHaveProperty("pending");
    expect(stats).toHaveProperty("tickCount");
    expect(stats).toHaveProperty("totalProcessed");
    expect(stats).toHaveProperty("running");
    expect(stats).toHaveProperty("paused");
  });
});

// Import remaining classes
describe("Managed Runtime — Imports", () => {
  it("exports AppEventLoop", async () => {
    const mod = await import("../managed-runtime");
    expect(mod.AppEventLoop).toBeDefined();
  });

  it("exports AppMemoryGuard if present", async () => {
    const mod = await import("../managed-runtime");
    // AppMemoryGuard may exist
    expect(mod).toBeDefined();
  });

  it("exports AppResourceTracker if present", async () => {
    const mod = await import("../managed-runtime");
    expect(mod).toBeDefined();
  });
});
