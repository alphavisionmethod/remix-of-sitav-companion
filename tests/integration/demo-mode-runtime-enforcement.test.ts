import { describe, it, expect } from "vitest";

describe("Integration: Demo Mode Runtime Enforcement", () => {
  it("getRuntimeMode defaults to 'demo' when uninitialised", async () => {
    const { getRuntimeMode } = await import("@/lib/services/analytics/mode-tagger");
    delete (globalThis as any).window;
    expect(getRuntimeMode()).toBe("demo");
  });

  it("getRuntimeMode reflects window.__SITA_RUNTIME_MODE__", async () => {
    (globalThis as any).window = { __SITA_RUNTIME_MODE__: "live" };
    const { getRuntimeMode } = await import("@/lib/services/analytics/mode-tagger");
    expect(getRuntimeMode()).toBe("live");
    (globalThis as any).window = { __SITA_RUNTIME_MODE__: "demo" };
    expect(getRuntimeMode()).toBe("demo");
  });

  it("tagWithMode adds a mode field", async () => {
    (globalThis as any).window = { __SITA_RUNTIME_MODE__: "live" };
    const { tagWithMode } = await import("@/lib/services/analytics/mode-tagger");
    const tagged = tagWithMode({ event: "click" });
    expect(tagged.mode).toBe("live");
    expect(tagged.event).toBe("click");
  });

  it("tagWithMode preserves explicit mode field", async () => {
    (globalThis as any).window = { __SITA_RUNTIME_MODE__: "live" };
    const { tagWithMode } = await import("@/lib/services/analytics/mode-tagger");
    const tagged = tagWithMode({ event: "click", mode: "demo" as const });
    expect(tagged.mode).toBe("demo");
  });
});
