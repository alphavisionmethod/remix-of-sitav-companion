import { describe, it, expect, vi, beforeEach } from "vitest";

const fnInvoke = vi.fn();
vi.mock("@/integrations/supabase/client", () => {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    update: vi.fn(() => builder),
    order: vi.fn(() => Promise.resolve({ data: [], error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
  };
  return { supabase: { from: vi.fn(() => builder), functions: { invoke: fnInvoke } } };
});

import { installService } from "@/lib/services/app-store/install.service";

describe("install.service", () => {
  beforeEach(() => { fnInvoke.mockReset(); });
  it("install() invokes app-install edge function", async () => {
    fnInvoke.mockResolvedValue({ data: { installed: { app_id: "x" } }, error: null });
    const r = await installService.install("x");
    expect(fnInvoke).toHaveBeenCalledWith("app-install", expect.any(Object));
    expect(r?.app_id).toBe("x");
  });
  it("uninstall() invokes app-uninstall edge function", async () => {
    fnInvoke.mockResolvedValue({ data: { ok: true }, error: null });
    await installService.uninstall("x");
    expect(fnInvoke).toHaveBeenCalledWith("app-uninstall", expect.any(Object));
  });
});
