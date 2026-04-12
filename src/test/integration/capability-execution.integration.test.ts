import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerCapability, invokeCapability, hasCapability, listCapabilities } from "@/lib/capabilities/capability-registry";

// Mock validator
vi.mock("@/packages/contracts/msa/capability-validator", () => ({
  validateCapabilityInvocation: () => ({ valid: true, warnings: [], errors: [] }),
  validateCapabilityResult: () => ({ valid: true, warnings: [], errors: [] }),
}));

describe("Integration: Capability → Execution → Receipt", () => {
  it("registers and invokes a capability end-to-end", async () => {
    registerCapability("test.echo", async (params) => ({
      success: true,
      data: { echo: params.message },
    }));

    expect(hasCapability("test.echo")).toBe(true);
    expect(listCapabilities()).toContain("test.echo");

    const result = await invokeCapability({
      capabilityKey: "test.echo",
      userId: "u1",
      surface: "web",
      mode: "demo",
      params: { message: "hello" },
    } as any);

    expect(result.success).toBe(true);
    expect(result.latencyMs).toBeDefined();
    expect((result as any).data.echo).toBe("hello");
  });

  it("returns error for unregistered capability", async () => {
    const result = await invokeCapability({
      capabilityKey: "nonexistent.cap",
      userId: "u1",
      surface: "web",
      mode: "demo",
      params: {},
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain("not registered");
  });

  it("catches handler errors gracefully", async () => {
    registerCapability("test.error", async () => {
      throw new Error("handler boom");
    });

    const result = await invokeCapability({
      capabilityKey: "test.error",
      userId: "u1",
      surface: "web",
      mode: "demo",
      params: {},
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain("handler boom");
    expect(result.latencyMs).toBeDefined();
  });
});
