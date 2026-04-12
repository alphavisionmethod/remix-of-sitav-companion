import { describe, it, expect, vi } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: { id: "u1" } } })) },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null })),
      insert: vi.fn(() => Promise.resolve({ data: null })),
      update: vi.fn(() => Promise.resolve({ data: null })),
      upsert: vi.fn(() => ({ select: vi.fn().mockReturnThis(), single: vi.fn(() => Promise.resolve({ data: null })) })),
    })),
  },
}));

vi.mock("@/lib/supabase-helpers", () => ({
  fromTable: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ data: null })),
    insert: vi.fn(() => Promise.resolve({ data: null })),
    update: vi.fn(() => Promise.resolve({ data: null })),
  })),
  fromDynamicTable: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ data: null })),
    insert: vi.fn(() => Promise.resolve({ data: null })),
    update: vi.fn(() => Promise.resolve({ data: null })),
    upsert: vi.fn(() => ({ select: vi.fn().mockReturnThis(), single: vi.fn(() => Promise.resolve({ data: null })) })),
  })),
}));

describe("SystemUpdateService", () => {
  it("getSystemInfo returns version, buildNumber, channel", async () => {
    const { SystemUpdateService } = await import("@/lib/services/system-updates/index");
    const info = SystemUpdateService.getSystemInfo();
    expect(info.version).toBeDefined();
    expect(info.buildNumber).toBeDefined();
    expect(info.channel).toBe("stable");
  });

  it("getAppVersion returns a string", async () => {
    const { SystemUpdateService } = await import("@/lib/services/system-updates/index");
    expect(typeof SystemUpdateService.getAppVersion()).toBe("string");
  });

  it("checkForUpdates returns null when no update", async () => {
    const { SystemUpdateService } = await import("@/lib/services/system-updates/index");
    const result = await SystemUpdateService.checkForUpdates();
    expect(result).toBeNull();
  });

  it("getUpdateHistory returns array", async () => {
    const { SystemUpdateService } = await import("@/lib/services/system-updates/index");
    const history = await SystemUpdateService.getUpdateHistory();
    expect(Array.isArray(history)).toBe(true);
  });

  it("rollbackUpdate does not throw", async () => {
    const { SystemUpdateService } = await import("@/lib/services/system-updates/index");
    await expect(SystemUpdateService.rollbackUpdate("log-1")).resolves.not.toThrow();
  });
});
