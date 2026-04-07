import { describe, it, expect } from "vitest";

describe("SelfHealingService re-export", () => {
  it("exports SelfHealingService class", async () => {
    const mod = await import("../index");
    expect(mod.SelfHealingService).toBeDefined();
    expect(mod.createSelfHealingService).toBeDefined();
  });

  it("createSelfHealingService returns instance", async () => {
    const { createSelfHealingService } = await import("../index");
    const svc = createSelfHealingService();
    expect(svc).toBeDefined();
  });
});

