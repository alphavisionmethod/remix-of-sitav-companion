import { describe, it, expect } from "vitest";

describe("ProcessManager", () => {
  let ProcessManager: any;

  beforeEach(async () => {
    const mod = await import("../process-manager");
    ProcessManager = mod.ProcessManager;
  });

  it("exports ProcessManager", () => {
    expect(ProcessManager).toBeDefined();
  });

  it("creates a process with valid manifest", () => {
    const manifest = {
      id: "test-app",
      name: "Test App",
      version: "1.0.0",
      permissions: [],
    };
    const proc = ProcessManager.create(manifest);
    expect(proc).toBeDefined();
    expect(proc.pid).toBeGreaterThan(0);
    expect(proc.appId).toBe("test-app");
    expect(proc.state).toBe("created");
  });

  it("lists all processes", () => {
    const list = ProcessManager.listAll();
    expect(Array.isArray(list)).toBe(true);
  });

  it("kills a process by pid", () => {
    const manifest = { id: "kill-test", name: "Kill", version: "1.0.0", permissions: [] };
    const proc = ProcessManager.create(manifest);
    const result = ProcessManager.kill(proc.pid);
    expect(result).toBe(true);
  });

  it("process has CPU context", () => {
    const manifest = { id: "ctx-test", name: "Ctx", version: "1.0.0", permissions: [] };
    const proc = ProcessManager.create(manifest);
    expect(proc.context).toBeDefined();
    expect(proc.context.rip).toBeDefined();
    expect(proc.context.rsp).toBeDefined();
  });

  it("process has priority band", () => {
    const manifest = { id: "prio-test", name: "Prio", version: "1.0.0", permissions: [] };
    const proc = ProcessManager.create(manifest);
    expect(["RT-Critical", "RT-Normal", "Interactive", "Batch", "Idle"]).toContain(proc.priority);
  });
});
