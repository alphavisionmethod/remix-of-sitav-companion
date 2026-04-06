import { describe, it, expect, vi } from "vitest";
import { ExecutorService, createExecutorService, createEnvelope } from "../executor-service";

vi.mock("../action-lineage-service", () => ({
  getActionLineageService: () => ({
    initiateAction: vi.fn().mockResolvedValue(undefined),
    transitionAction: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("../event-bus", () => ({
  getEventBus: () => ({
    publish: vi.fn().mockResolvedValue({}),
  }),
}));

describe("ExecutorService", () => {
  it("executes draft mode without handler", async () => {
    const svc = createExecutorService();
    const env = createEnvelope("test.cap", { key: "val" }, { mode: "draft" });
    const result = await svc.execute(env);
    expect(result.status).toBe("completed");
    expect(result.result?.mode).toBe("draft");
  });

  it("executes simulation mode without handler", async () => {
    const svc = createExecutorService();
    const env = createEnvelope("test.cap", {}, { mode: "simulation" });
    const result = await svc.execute(env);
    expect(result.status).toBe("completed");
    expect(result.result?.mode).toBe("simulation");
  });

  it("fails when no handler registered for real mode", async () => {
    const svc = createExecutorService();
    const env = createEnvelope("missing.cap", {}, { mode: "real" });
    const result = await svc.execute(env);
    expect(result.status).toBe("failed");
    expect(result.errorDetails?.code).toBe("NO_HANDLER");
  });

  it("executes real mode with registered handler", async () => {
    const svc = createExecutorService();
    svc.registerHandler("test.cap", async () => ({
      status: "success",
      result: { done: true },
    }));
    const env = createEnvelope("test.cap", {}, { mode: "real" });
    const result = await svc.execute(env);
    expect(result.status).toBe("completed");
    expect(result.result?.done).toBe(true);
  });

  it("returns cached result for idempotent key", async () => {
    const svc = createExecutorService();
    svc.registerHandler("test.cap", async () => ({ status: "success", result: { x: 1 } }));
    const env1 = createEnvelope("test.cap", {}, { mode: "real", idempotencyKey: "key1" });
    await svc.execute(env1);
    const env2 = createEnvelope("test.cap", {}, { mode: "real", idempotencyKey: "key1" });
    const result = await svc.execute(env2);
    expect(result.status).toBe("completed");
  });

  it("handles handler errors gracefully", async () => {
    const svc = createExecutorService();
    svc.registerHandler("err.cap", async () => { throw new Error("handler crash"); });
    const env = createEnvelope("err.cap", {}, { mode: "real" });
    const result = await svc.execute(env);
    expect(result.status).toBe("failed");
    expect(result.errorDetails?.message).toBe("handler crash");
  });

  it("rollback marks envelope as rolled_back", async () => {
    const svc = createExecutorService();
    const env = createEnvelope("test", {});
    const result = await svc.rollback(env);
    expect(result.status).toBe("rolled_back");
  });
});

describe("createEnvelope", () => {
  it("creates envelope with defaults", () => {
    const env = createEnvelope("cap", { a: 1 });
    expect(env.mode).toBe("real");
    expect(env.status).toBe("pending");
    expect(env.attemptCount).toBe(1);
  });
});
