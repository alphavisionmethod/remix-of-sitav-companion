import { describe, it, expect } from "vitest";
import { ProcessTable } from "../process-manager";

describe("ProcessTable", () => {
  const makeManifest = (id: string) => ({
    id,
    name: `App ${id}`,
    version: "1.0.0",
    permissions: [],
  } as any);

  it("exports ProcessTable", () => {
    expect(ProcessTable).toBeDefined();
  });

  it("spawns a process with valid manifest", () => {
    const proc = ProcessTable.spawn(makeManifest("pt-test-1"));
    expect(proc).toBeDefined();
    expect(proc.pid).toBeGreaterThan(0);
    expect(proc.appId).toBe("pt-test-1");
    expect(proc.state).toBe("created");
  });

  it("listProcesses returns array", () => {
    const list = ProcessTable.listProcesses();
    expect(Array.isArray(list)).toBe(true);
  });

  it("kills a process by pid", () => {
    const proc = ProcessTable.spawn(makeManifest("pt-kill-test"));
    const result = ProcessTable.kill(proc.pid);
    expect(result).toBe(true);
  });

  it("process has CPU context with rip and rsp", () => {
    const proc = ProcessTable.spawn(makeManifest("pt-ctx-test"));
    expect(proc.context).toBeDefined();
    expect(typeof proc.context.rip).toBe("number");
    expect(typeof proc.context.rsp).toBe("number");
  });

  it("process has priority band", () => {
    const proc = ProcessTable.spawn(makeManifest("pt-prio-test"));
    expect(["RT-Critical", "RT-Normal", "Interactive", "Batch", "Idle"]).toContain(proc.priority);
  });

  it("getProcess returns process by pid", () => {
    const proc = ProcessTable.spawn(makeManifest("pt-get-test"));
    const found = ProcessTable.getProcess(proc.pid);
    expect(found?.pid).toBe(proc.pid);
  });

  it("getByAppId returns process", () => {
    ProcessTable.spawn(makeManifest("pt-appid-test"));
    const found = ProcessTable.getByAppId("pt-appid-test");
    expect(found?.appId).toBe("pt-appid-test");
  });

  it("getStats returns statistics", () => {
    const stats = ProcessTable.getStats();
    expect(stats).toHaveProperty("total");
    expect(typeof stats.total).toBe("number");
  });
});
