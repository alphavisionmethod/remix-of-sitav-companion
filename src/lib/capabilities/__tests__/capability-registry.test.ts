import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerCapability, invokeCapability, listCapabilities, hasCapability } from "../capability-registry";

describe("CapabilityRegistry", () => {
  const testKey = `test.cap.${Date.now()}`;

  it("registers and lists capabilities", () => {
    registerCapability(testKey, async () => ({ success: true }));
    expect(hasCapability(testKey)).toBe(true);
    expect(listCapabilities()).toContain(testKey);
  });

  it("invokes registered capability successfully", async () => {
    const key = `invoke.test.${Date.now()}`;
    registerCapability(key, async (params) => ({ success: true, data: params }));
    const result = await invokeCapability({
      capabilityKey: key,
      userId: "00000000-0000-0000-0000-000000000001",
      surface: "test",
      mode: "demo",
      params: { x: 1 },
    });
    expect(result.success).toBe(true);
  });

  it("returns error for unregistered capability", async () => {
    const result = await invokeCapability({
      capabilityKey: "nonexistent.capability.key",
      userId: "00000000-0000-0000-0000-000000000001",
      surface: "test",
      mode: "demo",
      params: {},
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("not registered");
  });

  it("catches handler errors", async () => {
    const key = `err.handler.${Date.now()}`;
    registerCapability(key, async () => { throw new Error("handler boom"); });
    const result = await invokeCapability({
      capabilityKey: key,
      userId: "00000000-0000-0000-0000-000000000001",
      surface: "test",
      mode: "live",
      params: {},
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("handler boom");
  });

  it("includes latencyMs in result", async () => {
    const key = `lat.test.${Date.now()}`;
    registerCapability(key, async () => ({ success: true }));
    const result = await invokeCapability({
      capabilityKey: key,
      userId: "00000000-0000-0000-0000-000000000001",
      surface: "test",
      mode: "demo",
      params: {},
    });
    expect(result.latencyMs).toBeDefined();
    expect(typeof result.latencyMs).toBe("number");
  });
});
