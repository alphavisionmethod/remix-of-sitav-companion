import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CloudSyncManager } from "../cloud-sync-manager";

describe("CloudSyncManager", () => {
  let manager: CloudSyncManager;

  beforeEach(() => {
    manager = new CloudSyncManager({ nodeId: "test-node" });
  });

  afterEach(() => {
    manager.stop();
  });

  it("creates with node id", () => {
    const status = manager.getSyncStatus();
    expect(status.nodeId).toBe("test-node");
  });

  it("getVersionVector returns correct shape", () => {
    const vv = manager.getVersionVector();
    expect(vv.nodeId).toBe("test-node");
    expect(typeof vv.version).toBe("number");
    expect(typeof vv.checksum).toBe("string");
  });

  it("syncState increments version and totalSyncs", () => {
    const before = manager.getSyncStatus();
    manager.syncState();
    const after = manager.getSyncStatus();
    expect(after.version).toBe(before.version + 1);
    expect(after.totalSyncs).toBe(before.totalSyncs + 1);
  });

  it("pushUpdate adds to outbound queue", () => {
    manager.pushUpdate("cloud", "preference", { theme: "dark" });
    const status = manager.getSyncStatus();
    expect(status.pendingOutbound).toBe(1);
  });

  it("syncState flushes outbound queue", () => {
    manager.pushUpdate("cloud", "preference", { theme: "dark" });
    manager.syncState();
    expect(manager.getSyncStatus().pendingOutbound).toBe(0);
    expect(manager.getAppliedPatches().length).toBeGreaterThan(0);
  });

  it("applyUpdate with stale version creates conflict", () => {
    manager.syncState(); // version becomes 2
    manager.applyUpdate({
      source: "remote",
      target: "cloud",
      patchType: "preference",
      payload: { key: "value" },
      version: 1, // stale
    });
    expect(manager.getConflicts().length).toBeGreaterThan(0);
  });

  it("syncSettings pushes preference patch", () => {
    manager.syncSettings({ language: "en" });
    expect(manager.getSyncStatus().pendingOutbound).toBe(1);
  });

  it("syncSession pushes manifest patch", () => {
    manager.syncSession({ windows: [] });
    expect(manager.getSyncStatus().pendingOutbound).toBe(1);
  });

  it("restoreFromCloud returns current state", () => {
    manager.applyUpdate({
      source: "remote",
      target: "cloud",
      patchType: "preference",
      payload: { restored: true },
      version: 999,
    });
    const state = manager.restoreFromCloud();
    expect(state).toBeDefined();
  });

  it("reconcile merges local and remote", () => {
    const merged = manager.reconcile(
      { remote_key: "remote_val" },
      { local_key: "local_val" }
    );
    expect(merged.remote_key).toBe("remote_val");
    expect(merged.local_key).toBe("local_val");
  });

  it("start and stop control sync interval", () => {
    manager.start(100000);
    manager.stop();
    // No error thrown
    expect(manager.getSyncStatus().connected).toBe(true);
  });
});
