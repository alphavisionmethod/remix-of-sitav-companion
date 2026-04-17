import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    contains: vi.fn(() => builder),
    or: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => Promise.resolve({ data: [{ app_id: "x", name: "X" }], error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: { app_id: "x", name: "X" }, error: null })),
  };
  return { supabase: { from: vi.fn(() => builder) } };
});

import { catalogService } from "@/lib/services/app-store/catalog.service";

describe("catalog.service", () => {
  beforeEach(() => vi.clearAllMocks());
  it("list() returns rows", async () => {
    const r = await catalogService.list();
    expect(r.length).toBe(1);
    expect(r[0].app_id).toBe("x");
  });
  it("getByAppId() returns single", async () => {
    const r = await catalogService.getByAppId("x");
    expect(r?.app_id).toBe("x");
  });
});
