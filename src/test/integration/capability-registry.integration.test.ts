import { describe, it, expect, beforeEach } from "vitest";
import {
  registerCapability,
  invokeCapability,
  listCapabilities,
  hasCapability,
} from "@/lib/capabilities/capability-registry";

describe("Capability Registry — Integration", () => {
  const TEST_KEY = `test-cap-${Date.now()}`;

  beforeEach(() => {
    // Register a test capability
    registerCapability(TEST_KEY, async (params) => ({
      success: true,
      data: { echo: params.message, processed: true },
    }));
  });

  it("registers and lists capabilities", () => {
    expect(hasCapability(TEST_KEY)).toBe(true);
    expect(listCapabilities()).toContain(TEST_KEY);
  });

  it("invokes a registered capability and returns result", async () => {
    const result = await invokeCapability({
      capabilityKey: TEST_KEY,
      userId: "user-1",
      surface: "web",
      mode: "demo",
      params: { message: "hello" },
    });

    expect(result.success).toBe(true);
    expect((result as any).data?.echo).toBe("hello");
    expect(typeof (result as any).latencyMs).toBe("number");
  });

  it("returns error for unregistered capability", async () => {
    const result = await invokeCapability({
      capabilityKey: "nonexistent-cap",
      userId: "user-1",
      surface: "web",
      mode: "demo",
      params: {},
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("not registered");
  });

  it("returns validation error for invalid invocation", async () => {
    const result = await invokeCapability({
      capabilityKey: "",
      userId: "",
      surface: "",
      mode: "" as any,
      params: {},
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("validation failed");
  });

  it("catches handler errors and returns graceful failure", async () => {
    const errorKey = `error-cap-${Date.now()}`;
    registerCapability(errorKey, async () => {
      throw new Error("Intentional test failure");
    });

    const result = await invokeCapability({
      capabilityKey: errorKey,
      userId: "user-1",
      surface: "web",
      mode: "demo",
      params: {},
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Intentional test failure");
    expect(typeof (result as any).latencyMs).toBe("number");
  });
});
