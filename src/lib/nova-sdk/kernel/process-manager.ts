// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Process Manager
// PID table, process struct, memory budget, lifecycle binding
// ═══════════════════════════════════════════════════════════════

import type { AppManifest } from "../core/manifest";

export type ProcessState = "created" | "ready" | "running" | "blocked" | "suspended" | "terminated";

export type PriorityBand = "RT-Critical" | "RT-Normal" | "Interactive" | "Batch" | "Idle";

export interface Process {
  pid: number;
  appId: string;
  state: ProcessState;
  priority: PriorityBand;
  memoryBudget: number;       // bytes
  memoryUsed: number;         // bytes
  cpuTicks: number;           // total ticks consumed
  windowIds: string[];
  manifest: AppManifest;
  createdAt: number;          // Date.now()
  exitCode: number | null;
  parentPid: number | null;
}

const DEFAULT_MEMORY_BUDGET = 64 * 1024 * 1024; // 64MB

class ProcessTableClass {
  private processes = new Map<number, Process>();
  private nextPid = 1;
  private appToPid = new Map<string, number>();

  /** Spawn a new process from an app manifest */
  spawn(manifest: AppManifest, opts?: { priority?: PriorityBand; memoryBudget?: number; parentPid?: number }): Process {
    // Prevent duplicate processes for same app
    const existing = this.appToPid.get(manifest.id);
    if (existing !== undefined) {
      const proc = this.processes.get(existing);
      if (proc && proc.state !== "terminated") {
        return proc; // already running
      }
    }

    const pid = this.nextPid++;
    const process: Process = {
      pid,
      appId: manifest.id,
      state: "created",
      priority: opts?.priority ?? "Interactive",
      memoryBudget: opts?.memoryBudget ?? DEFAULT_MEMORY_BUDGET,
      memoryUsed: 0,
      cpuTicks: 0,
      windowIds: [],
      manifest,
      createdAt: Date.now(),
      exitCode: null,
      parentPid: opts?.parentPid ?? null,
    };

    this.processes.set(pid, process);
    this.appToPid.set(manifest.id, pid);

    console.log(`[Kernel:ProcessTable] Spawned PID ${pid} → "${manifest.name}" (${manifest.id})`);
    return process;
  }

  /** Transition process to ready state */
  setReady(pid: number): boolean {
    const p = this.processes.get(pid);
    if (!p || p.state !== "created") return false;
    p.state = "ready";
    return true;
  }

  /** Transition process to running */
  setRunning(pid: number): boolean {
    const p = this.processes.get(pid);
    if (!p || (p.state !== "ready" && p.state !== "suspended")) return false;
    p.state = "running";
    return true;
  }

  /** Suspend a running process */
  suspend(pid: number): boolean {
    const p = this.processes.get(pid);
    if (!p || p.state !== "running") return false;
    p.state = "suspended";
    console.log(`[Kernel:ProcessTable] Suspended PID ${pid}`);
    return true;
  }

  /** Resume a suspended process */
  resume(pid: number): boolean {
    const p = this.processes.get(pid);
    if (!p || p.state !== "suspended") return false;
    p.state = "running";
    console.log(`[Kernel:ProcessTable] Resumed PID ${pid}`);
    return true;
  }

  /** Kill a process */
  kill(pid: number, exitCode = 0): boolean {
    const p = this.processes.get(pid);
    if (!p || p.state === "terminated") return false;
    p.state = "terminated";
    p.exitCode = exitCode;
    console.log(`[Kernel:ProcessTable] Killed PID ${pid} (exit: ${exitCode})`);
    return true;
  }

  /** Add a window reference to a process */
  addWindow(pid: number, windowId: string): void {
    const p = this.processes.get(pid);
    if (p && !p.windowIds.includes(windowId)) {
      p.windowIds.push(windowId);
    }
  }

  /** Remove a window reference */
  removeWindow(pid: number, windowId: string): void {
    const p = this.processes.get(pid);
    if (p) {
      p.windowIds = p.windowIds.filter(id => id !== windowId);
    }
  }

  /** Record CPU tick consumption */
  addTicks(pid: number, ticks: number): void {
    const p = this.processes.get(pid);
    if (p) p.cpuTicks += ticks;
  }

  /** Update memory usage */
  setMemoryUsed(pid: number, bytes: number): boolean {
    const p = this.processes.get(pid);
    if (!p) return false;
    if (bytes > p.memoryBudget) {
      console.warn(`[Kernel:ProcessTable] PID ${pid} OOM: ${bytes} > budget ${p.memoryBudget}`);
      return false;
    }
    p.memoryUsed = bytes;
    return true;
  }

  getProcess(pid: number): Process | undefined {
    return this.processes.get(pid);
  }

  getByAppId(appId: string): Process | undefined {
    const pid = this.appToPid.get(appId);
    return pid !== undefined ? this.processes.get(pid) : undefined;
  }

  listProcesses(): Process[] {
    return Array.from(this.processes.values());
  }

  listRunning(): Process[] {
    return this.listProcesses().filter(p => p.state === "running" || p.state === "ready");
  }

  getStats() {
    const all = this.listProcesses();
    return {
      total: all.length,
      running: all.filter(p => p.state === "running").length,
      suspended: all.filter(p => p.state === "suspended").length,
      terminated: all.filter(p => p.state === "terminated").length,
      totalMemory: all.reduce((sum, p) => sum + p.memoryUsed, 0),
      totalTicks: all.reduce((sum, p) => sum + p.cpuTicks, 0),
      nextPid: this.nextPid,
    };
  }

  /** Reset entire process table (for kernel shutdown) */
  reset(): void {
    this.processes.clear();
    this.appToPid.clear();
    this.nextPid = 1;
  }
}

export const ProcessTable = new ProcessTableClass();
