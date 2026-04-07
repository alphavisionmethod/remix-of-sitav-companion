import { describe, it, expect, vi } from "vitest";
import { registerCapability, invokeCapability, listCapabilities, hasCapability } from "@/lib/capabilities/capability-registry";

describe("CapabilityRegistry - Extended", () => {
  it("handles concurrent registrations", () => {
    const keys = Array.from({ length: 10 }, (_, i) => `concurrent.${Date.now()}.${i}`);
    keys.forEach(k => registerCapability(k, async () => ({ success: true })));
    keys.forEach(k => expect(hasCapability(k)).toBe(true));
  });

  it("overwrites handler with warning", () => {
    const key = `overwrite.${Date.now()}`;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    registerCapability(key, async () => ({ success: true, data: "v1" }));
    registerCapability(key, async () => ({ success: true, data: "v2" }));
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("lists all registered keys", () => {
    const before = listCapabilities().length;
    const key = `list.test.${Date.now()}`;
    registerCapability(key, async () => ({ success: true }));
    expect(listCapabilities().length).toBe(before + 1);
  });
});
