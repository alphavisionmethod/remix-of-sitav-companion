// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Process Manager
// PID table, CPU context, address space, memory budget, lifecycle
// ═══════════════════════════════════════════════════════════════

import type { AppManifest } from "../core/manifest";

export type ProcessState = "created" | "ready" | "running" | "blocked" | "suspended" | "terminated";

export type PriorityBand = "RT-Critical" | "RT-Normal" | "Interactive" | "Batch" | "Idle";

export type WaitReason = "io" | "sleep" | "ipc" | "mutex" | "syscall" | "none";

// ── CPU Context (simulated register file) ────────────────────

export interface CPUContext {
  rip: number;          // instruction pointer
  rsp: number;          // stack pointer
  rbp: number;          // base pointer
  rflags: number;       // status flags
  registers: number[];  // general-purpose registers (16)
  fsBase: number;       // TLS base
  gsBase: number;       // kernel GS base
}

function createCPUContext(entryPoint: number, stackTop: number): CPUContext {
  return {
    rip: entryPoint,
    rsp: stackTop,
    rbp: stackTop,
    rflags: 0x202, // IF=1, reserved bit 1
    registers: new Array(16).fill(0),
    fsBase: 0,
    gsBase: 0,
  };
}

// ── Address Space Reference ──────────────────────────────────

export interface AddressSpaceRef {
  pid: number;
  pageTableRoot: number;  // simulated CR3 value
  heapStart: number;
  heapEnd: number;
  stackTop: number;
  stackBottom: number;
}

// ── Process Structure ────────────────────────────────────────

export interface Process {
  pid: number;
  appId: string;
  state: ProcessState;
  priority: PriorityBand;
  originalPriority: PriorityBand; // for priority inheritance restoration
  memoryBudget: number;       // bytes
  memoryUsed: number;         // bytes
  cpuTicks: number;           // total ticks consumed
  quantumRemaining: number;   // ticks left in current quantum
  quantumSize: number;        // total quantum allocated per schedule
  windowIds: string[];
  manifest: AppManifest;
  createdAt: number;          // Date.now()
  exitCode: number | null;
  parentPid: number | null;

  // CPU context — saved/restored on context switch
  context: CPUContext;

  // Address space
  addressSpace: AddressSpaceRef | null;

  // Blocking
  waitReason: WaitReason;
  wakeAt: number | null;      // timestamp for timed sleep
  blockedSince: number | null;

  // Stats
  contextSwitches: number;
  totalWaitTime: number;      // ms spent blocked
  lastScheduled: number;      // timestamp
}

const DEFAULT_MEMORY_BUDGET = 64 * 1024 * 1024; // 64MB
const DEFAULT_ENTRY_POINT = 0x400000;  // conventional ELF entry
const DEFAULT_STACK_TOP = 0x7FFFFFFFE000;

// Quantum sizes per band (in ticks)
const QUANTUM_MAP: Record<PriorityBand, number> = {
  "RT-Critical": 1,
  "RT-Normal": 5,
  "Interactive": 10,
  "Batch": 50,
  "Idle": 100,
};

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
    const priority = opts?.priority ?? "Interactive";
    const quantum = QUANTUM_MAP[priority];

    const process: Process = {
      pid,
      appId: manifest.id,
      state: "created",
      priority,
      originalPriority: priority,
      memoryBudget: opts?.memoryBudget ?? DEFAULT_MEMORY_BUDGET,
      memoryUsed: 0,
      cpuTicks: 0,
      quantumRemaining: quantum,
      quantumSize: quantum,
      windowIds: [],
      manifest,
      createdAt: Date.now(),
      exitCode: null,
      parentPid: opts?.parentPid ?? null,
      context: createCPUContext(DEFAULT_ENTRY_POINT, DEFAULT_STACK_TOP),
      addressSpace: null,
      waitReason: "none",
      wakeAt: null,
      blockedSince: null,
      contextSwitches: 0,
      totalWaitTime: 0,
      lastScheduled: 0,
    };

    this.processes.set(pid, process);
    this.appToPid.set(manifest.id, pid);

    console.log(`[Kernel:ProcessTable] Spawned PID ${pid} → "${manifest.name}" (${manifest.id}) quantum=${quantum}`);
    return process;
  }

  /** Attach address space to process */
  attachAddressSpace(pid: number, as: AddressSpaceRef): void {
    const p = this.processes.get(pid);
    if (p) {
      p.addressSpace = as;
      // Set stack pointer to address space stack top
      p.context.rsp = as.stackTop;
      p.context.rbp = as.stackTop;
    }
  }

  /** Transition process to ready state */
  setReady(pid: number): boolean {
    const p = this.processes.get(pid);
    if (!p || (p.state !== "created" && p.state !== "blocked")) return false;
    if (p.state === "blocked" && p.blockedSince) {
      p.totalWaitTime += Date.now() - p.blockedSince;
      p.blockedSince = null;
    }
    p.state = "ready";
    p.waitReason = "none";
    p.wakeAt = null;
    return true;
  }

  /** Transition process to running */
  setRunning(pid: number): boolean {
    const p = this.processes.get(pid);
    if (!p || (p.state !== "ready" && p.state !== "suspended")) return false;
    p.state = "running";
    p.lastScheduled = Date.now();
    p.quantumRemaining = p.quantumSize;
    return true;
  }

  /** Block a running process */
  block(pid: number, reason: WaitReason): boolean {
    const p = this.processes.get(pid);
    if (!p || (p.state !== "running" && p.state !== "ready")) return false;
    p.state = "blocked";
    p.waitReason = reason;
    p.blockedSince = Date.now();
    console.log(`[Kernel:ProcessTable] Blocked PID ${pid} reason=${reason}`);
    return true;
  }

  /** Block with timed wakeup */
  sleep(pid: number, ms: number): boolean {
    const p = this.processes.get(pid);
    if (!p || (p.state !== "running" && p.state !== "ready")) return false;
    p.state = "blocked";
    p.waitReason = "sleep";
    p.wakeAt = Date.now() + ms;
    p.blockedSince = Date.now();
    console.log(`[Kernel:ProcessTable] PID ${pid} sleeping for ${ms}ms`);
    return true;
  }

  /** Wake a blocked process → ready */
  wake(pid: number): boolean {
    const p = this.processes.get(pid);
    if (!p || p.state !== "blocked") return false;
    return this.setReady(pid);
  }

  /** Check and wake sleeping processes */
  checkSleepers(): number[] {
    const now = Date.now();
    const woken: number[] = [];
    for (const [pid, p] of this.processes) {
      if (p.state === "blocked" && p.waitReason === "sleep" && p.wakeAt && now >= p.wakeAt) {
        this.setReady(pid);
        woken.push(pid);
      }
    }
    return woken;
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
    p.state = "ready";
    console.log(`[Kernel:ProcessTable] Resumed PID ${pid}`);
    return true;
  }

  /** Kill a process */
  kill(pid: number, exitCode = 0): boolean {
    const p = this.processes.get(pid);
    if (!p || p.state === "terminated") return false;
    p.state = "terminated";
    p.exitCode = exitCode;
    p.waitReason = "none";
    p.wakeAt = null;
    console.log(`[Kernel:ProcessTable] Killed PID ${pid} (exit: ${exitCode})`);
    return true;
  }

  /** Save CPU context for a process (context switch out) */
  saveContext(pid: number, ctx: CPUContext): void {
    const p = this.processes.get(pid);
    if (p) {
      p.context = { ...ctx, registers: [...ctx.registers] };
      p.contextSwitches++;
    }
  }

  /** Load CPU context (context switch in) */
  loadContext(pid: number): CPUContext | null {
    const p = this.processes.get(pid);
    return p ? { ...p.context, registers: [...p.context.registers] } : null;
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
    if (p) {
      p.cpuTicks += ticks;
      p.quantumRemaining = Math.max(0, p.quantumRemaining - ticks);
      // Simulate instruction pointer advance
      p.context.rip += ticks * 4; // 4 bytes per "instruction"
    }
  }

  /** Check if quantum expired */
  isQuantumExpired(pid: number): boolean {
    const p = this.processes.get(pid);
    return p ? p.quantumRemaining <= 0 : true;
  }

  /** Reset quantum for rescheduling */
  resetQuantum(pid: number): void {
    const p = this.processes.get(pid);
    if (p) p.quantumRemaining = p.quantumSize;
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

  /** Get all ready processes */
  listReady(): Process[] {
    return Array.from(this.processes.values()).filter(p => p.state === "ready");
  }

  /** Get all blocked processes */
  listBlocked(): Process[] {
    return Array.from(this.processes.values()).filter(p => p.state === "blocked");
  }

  /** Get the currently running process (should be at most 1 on single-core) */
  getRunning(): Process | null {
    for (const p of this.processes.values()) {
      if (p.state === "running") return p;
    }
    return null;
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
      ready: all.filter(p => p.state === "ready").length,
      blocked: all.filter(p => p.state === "blocked").length,
      suspended: all.filter(p => p.state === "suspended").length,
      terminated: all.filter(p => p.state === "terminated").length,
      totalMemory: all.reduce((sum, p) => sum + p.memoryUsed, 0),
      totalTicks: all.reduce((sum, p) => sum + p.cpuTicks, 0),
      totalContextSwitches: all.reduce((sum, p) => sum + p.contextSwitches, 0),
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
