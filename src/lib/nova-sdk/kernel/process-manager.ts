// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Process Manager
// PID table, CPU context with CPL, dual stacks, address space,
// memory budget, privilege levels, lifecycle
// ═══════════════════════════════════════════════════════════════

import type { AppManifest } from "../core/manifest";

export type ProcessState = "created" | "ready" | "running" | "blocked" | "suspended" | "terminated";

export type PriorityBand = "RT-Critical" | "RT-Normal" | "Interactive" | "Batch" | "Idle";

export type WaitReason = "io" | "sleep" | "ipc" | "mutex" | "syscall" | "none";

// ── CPU Context (simulated register file + privilege) ────────

export interface CPUContext {
  rip: number;          // instruction pointer
  rsp: number;          // stack pointer
  rbp: number;          // base pointer
  rflags: number;       // status flags (includes IOPL bits 12-13)
  registers: number[];  // general-purpose registers (16): RAX,RCX,RDX,RBX,RSP,RBP,RSI,RDI,R8-R15
  fsBase: number;       // TLS base
  gsBase: number;       // kernel GS base
  // Privilege ring fields
  cpl: 0 | 1 | 2 | 3;  // Current Privilege Level (from CS register RPL bits)
  cs: number;           // Code Segment selector
  ss: number;           // Stack Segment selector
}

function createCPUContext(entryPoint: number, stackTop: number, ring: 0 | 3 = 3): CPUContext {
  return {
    rip: entryPoint,
    rsp: stackTop,
    rbp: stackTop,
    rflags: ring === 0 ? 0x3202 : 0x202, // Ring 0 gets IOPL=3, Ring 3 gets IOPL=0
    registers: new Array(16).fill(0),
    fsBase: 0,
    gsBase: ring === 0 ? 0xFFFF800000000000 : 0, // kernel GS base for Ring 0
    cpl: ring,
    cs: ring === 0 ? 0x08 : 0x2B,  // kernel CS vs user CS
    ss: ring === 0 ? 0x10 : 0x23,  // kernel SS vs user SS
  };
}

// ── Address Space Reference (with dual stacks) ──────────────

export interface AddressSpaceRef {
  pid: number;
  pageTableRoot: number;  // simulated CR3 value
  heapStart: number;
  heapEnd: number;
  // Kernel-mode stack (used during syscalls/interrupts)
  kernelStackTop: number;
  kernelStackBottom: number;
  // User-mode stack (used during normal execution in Ring 3)
  userStackTop: number;
  userStackBottom: number;
  // Legacy aliases
  stackTop: number;
  stackBottom: number;
}

// ── Process Structure ────────────────────────────────────────

export interface Process {
  pid: number;
  appId: string;
  state: ProcessState;
  priority: PriorityBand;
  originalPriority: PriorityBand;
  memoryBudget: number;
  memoryUsed: number;
  cpuTicks: number;
  quantumRemaining: number;
  quantumSize: number;
  windowIds: string[];
  manifest: AppManifest;
  createdAt: number;
  exitCode: number | null;
  parentPid: number | null;

  // CPU context — saved/restored on context switch
  context: CPUContext;

  // Address space (with dual stacks)
  addressSpace: AddressSpaceRef | null;

  // CPU Privilege Level — Ring 0 (kernel) or Ring 3 (user)
  privilegeLevel: 0 | 3;

  // Ring transition tracking
  ringTransitions: number;
  lastRingTransition: number;  // timestamp

  // Blocking
  waitReason: WaitReason;
  wakeAt: number | null;
  blockedSince: number | null;

  // Stats
  contextSwitches: number;
  totalWaitTime: number;
  lastScheduled: number;
}

const DEFAULT_MEMORY_BUDGET = 64 * 1024 * 1024;
const DEFAULT_ENTRY_POINT = 0x400000;
const DEFAULT_KERNEL_STACK_TOP = 0xFFFF80007FFE0000;
const DEFAULT_KERNEL_STACK_BOTTOM = 0xFFFF80007FFC0000;
const DEFAULT_USER_STACK_TOP = 0x7FFFFFFFE000;
const DEFAULT_USER_STACK_BOTTOM = 0x7FFFFFFC0000;

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
  spawn(
    manifest: AppManifest,
    opts?: {
      priority?: PriorityBand;
      memoryBudget?: number;
      parentPid?: number;
      kernelMode?: boolean; // true = Ring 0 (kernel process)
    }
  ): Process {
    const existing = this.appToPid.get(manifest.id);
    if (existing !== undefined) {
      const proc = this.processes.get(existing);
      if (proc && proc.state !== "terminated") return proc;
    }

    const pid = this.nextPid++;
    const priority = opts?.priority ?? "Interactive";
    const quantum = QUANTUM_MAP[priority];
    const isKernel = opts?.kernelMode ?? false;
    const ring: 0 | 3 = isKernel ? 0 : 3;

    // Select stack based on privilege level
    const stackTop = isKernel ? DEFAULT_KERNEL_STACK_TOP : DEFAULT_USER_STACK_TOP;

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
      context: createCPUContext(DEFAULT_ENTRY_POINT, stackTop, ring),
      addressSpace: null,
      privilegeLevel: ring,
      ringTransitions: 0,
      lastRingTransition: 0,
      waitReason: "none",
      wakeAt: null,
      blockedSince: null,
      contextSwitches: 0,
      totalWaitTime: 0,
      lastScheduled: 0,
    };

    this.processes.set(pid, process);
    this.appToPid.set(manifest.id, pid);

    console.log(`[Kernel:ProcessTable] Spawned PID ${pid} → "${manifest.name}" (${manifest.id}) ring=${ring} quantum=${quantum}`);
    return process;
  }

  /** Attach address space to process (with dual stacks) */
  attachAddressSpace(pid: number, as: Omit<AddressSpaceRef, 'kernelStackTop' | 'kernelStackBottom' | 'userStackTop' | 'userStackBottom'> & Partial<AddressSpaceRef>): void {
    const p = this.processes.get(pid);
    if (!p) return;

    const fullAs: AddressSpaceRef = {
      ...as,
      kernelStackTop: as.kernelStackTop ?? DEFAULT_KERNEL_STACK_TOP,
      kernelStackBottom: as.kernelStackBottom ?? DEFAULT_KERNEL_STACK_BOTTOM,
      userStackTop: as.userStackTop ?? as.stackTop ?? DEFAULT_USER_STACK_TOP,
      userStackBottom: as.userStackBottom ?? as.stackBottom ?? DEFAULT_USER_STACK_BOTTOM,
      stackTop: as.stackTop,
      stackBottom: as.stackBottom,
    };

    p.addressSpace = fullAs;

    // Set stack pointer based on current privilege level
    if (p.privilegeLevel === 0) {
      p.context.rsp = fullAs.kernelStackTop;
      p.context.rbp = fullAs.kernelStackTop;
    } else {
      p.context.rsp = fullAs.userStackTop;
      p.context.rbp = fullAs.userStackTop;
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
    return true;
  }

  /** Resume a suspended process */
  resume(pid: number): boolean {
    const p = this.processes.get(pid);
    if (!p || p.state !== "suspended") return false;
    p.state = "ready";
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

  /** Record a ring transition */
  recordRingTransition(pid: number): void {
    const p = this.processes.get(pid);
    if (p) {
      p.ringTransitions++;
      p.lastRingTransition = Date.now();
    }
  }

  addWindow(pid: number, windowId: string): void {
    const p = this.processes.get(pid);
    if (p && !p.windowIds.includes(windowId)) p.windowIds.push(windowId);
  }

  removeWindow(pid: number, windowId: string): void {
    const p = this.processes.get(pid);
    if (p) p.windowIds = p.windowIds.filter(id => id !== windowId);
  }

  addTicks(pid: number, ticks: number): void {
    const p = this.processes.get(pid);
    if (p) {
      p.cpuTicks += ticks;
      p.quantumRemaining = Math.max(0, p.quantumRemaining - ticks);
      p.context.rip += ticks * 4;
    }
  }

  isQuantumExpired(pid: number): boolean {
    const p = this.processes.get(pid);
    return p ? p.quantumRemaining <= 0 : true;
  }

  resetQuantum(pid: number): void {
    const p = this.processes.get(pid);
    if (p) p.quantumRemaining = p.quantumSize;
  }

  setMemoryUsed(pid: number, bytes: number): boolean {
    const p = this.processes.get(pid);
    if (!p) return false;
    if (bytes > p.memoryBudget) return false;
    p.memoryUsed = bytes;
    return true;
  }

  listReady(): Process[] {
    return Array.from(this.processes.values()).filter(p => p.state === "ready");
  }

  listBlocked(): Process[] {
    return Array.from(this.processes.values()).filter(p => p.state === "blocked");
  }

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
      totalRingTransitions: all.reduce((sum, p) => sum + p.ringTransitions, 0),
      ring0Count: all.filter(p => p.state !== "terminated" && p.privilegeLevel === 0).length,
      ring3Count: all.filter(p => p.state !== "terminated" && p.privilegeLevel === 3).length,
      nextPid: this.nextPid,
    };
  }

  reset(): void {
    this.processes.clear();
    this.appToPid.clear();
    this.nextPid = 1;
  }
}

export const ProcessTable = new ProcessTableClass();
