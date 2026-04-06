import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/persistence/universal-service-persistence", () => ({
  loadServiceState: vi.fn(() => Promise.resolve(null)),
  debouncedSaveServiceState: vi.fn(),
}));

describe("ModelRouterService", () => {
  it("exports ModelRouterService class", async () => {
    const mod = await import("../index");
    expect(mod.ModelRouterService).toBeDefined();
    expect(typeof mod.ModelRouterService).toBe("function");
  });

  it("creates instance", async () => {
    const { ModelRouterService } = await import("../index");
    const router = new ModelRouterService();
    expect(router).toBeDefined();
  });
});
