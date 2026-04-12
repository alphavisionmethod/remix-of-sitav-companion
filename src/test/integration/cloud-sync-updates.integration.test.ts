import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => {
  const fn = vi.fn;
  return {
    supabase: {
      auth: {
        onAuthStateChange: fn(() => ({ data: { subscription: { unsubscribe: fn() } } })),
        getUser: fn(() => Promise.resolve({ data: { user: { id: "u1" } } })),
        getSession: fn(() => Promise.resolve({ data: { session: null } })),
      },
      from: fn(() => ({
        select: fn().mockReturnThis(),
        eq: fn().mockReturnThis(),
        order: fn().mockReturnThis(),
        limit: fn().mockReturnThis(),
        single: fn(() => Promise.resolve({ data: null })),
        insert: fn(() => Promise.resolve({ data: null })),
      })),
      functions: { invoke: fn(() => Promise.resolve({ data: null })) },
    },
  };
});

vi.mock("@/lib/supabase-helpers", () => {
  const fn = vi.fn;
  const chain = () => ({
    select: fn().mockReturnThis(),
    eq: fn().mockReturnThis(),
    order: fn().mockReturnThis(),
    limit: fn().mockReturnThis(),
    single: fn(() => Promise.resolve({ data: null })),
    insert: fn(() => Promise.resolve({ data: null })),
  });
  return { fromTable: fn(chain), fromDynamicTable: fn(chain) };
});

import { CloudSyncManager } from "@/lib/core-services/cloud-sync-manager";

describe("Integration: Settings → Cloud Sync", () => {
  let syncManager: CloudSyncManager;

  beforeEach(() => {
    syncManager = new CloudSyncManager({ nodeId: "int-test" });
  });

  afterEach(() => {
    syncManager.stop();
  });

  it("settings change triggers sync push and flush", () => {
    syncManager.syncSettings({ theme: "dark", language: "en" });
    expect(syncManager.getSyncStatus().pendingOutbound).toBe(1);
    syncManager.syncState();
    expect(syncManager.getSyncStatus().pendingOutbound).toBe(0);
    expect(syncManager.getAppliedPatches().length).toBeGreaterThan(0);
  });

  it("session sync → flush → restore round-trip", () => {
    syncManager.syncSession({ windows: ["finder", "settings"], activeApp: "finder" });
    syncManager.syncState();
    const restored = syncManager.restoreFromCloud();
    expect(restored).toBeDefined();
  });

  it("conflict resolution on stale settings update", () => {
    syncManager.syncState();
    syncManager.syncState();
    syncManager.applyUpdate({
      source: "remote-device",
      target: "cloud",
      patchType: "preference",
      payload: { theme: "light" },
      version: 1,
    });
    const conflicts = syncManager.getConflicts();
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts.some(c => c.resolution === "remote-wins")).toBe(true);
  });
});

describe("Integration: System Update Service", () => {
  it("getSystemInfo returns consistent version", async () => {
    const { SystemUpdateService } = await import("@/lib/services/system-updates/index");
    const info = SystemUpdateService.getSystemInfo();
    expect(info.version).toBe(SystemUpdateService.getAppVersion());
  });
});

describe("Integration: Console Capture → Filter → Clear", () => {
  it("full capture lifecycle", async () => {
    const { consoleCapture } = await import("@/lib/nova-sdk/services/console-capture");
    consoleCapture.startCapture();
    console.log("integration-test-msg");
    console.warn("integration-warn");

    const all = consoleCapture.getEntries();
    expect(all.length).toBeGreaterThanOrEqual(2);

    const warns = consoleCapture.getEntries({ level: "warn" });
    expect(warns.some(e => e.message.includes("integration-warn"))).toBe(true);

    const searched = consoleCapture.getEntries({ search: "integration-test" });
    expect(searched.length).toBeGreaterThanOrEqual(1);

    consoleCapture.clear();
    expect(consoleCapture.getEntries().length).toBe(0);
    consoleCapture.stopCapture();
  });
});
