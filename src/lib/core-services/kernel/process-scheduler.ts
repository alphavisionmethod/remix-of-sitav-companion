// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: Process Scheduler
// Multilevel Feedback Queue (MLFQ) with 5 priority bands
// ═══════════════════════════════════════════════════════════════

// ── Priority Bands ─────────────────────────────────────────────

export enum PriorityBand {
  RT_CRITICAL = 0,   // Security monitor, TPM agent, proof chain
  RT_NORMAL   = 1,   // Executor service, approval pipeline
  INTERACTIVE = 2,   // Desktop surface, UI, user apps
  BATCH       = 3,   // Sync, indexing, projections
  IDLE        = 4,   // GC, analytics, self-learning
}

export const BAND_CONFIG: Record<PriorityBand, {
  label: string;
  priorityRange: [number, number];
  quantumMs: number;
  preemptible: boolean;
  boostOnIO: boolean;
}> = {
  [PriorityBand.RT_CRITICAL]: { label: "RT-Critical", priorityRange: [0, 15], quantumMs: 1, preemptible: false, boostOnIO: false },
  [PriorityBand.RT_NORMAL]:   { label: "RT-Normal",   priorityRange: [16, 31], quantumMs: 5, preemptible: true, boostOnIO: false },
  [PriorityBand.INTERACTIVE]: { label: "Interactive",  priorityRange: [32, 63], quantumMs: 10, preemptible: true, boostOnIO: true },
  [PriorityBand.BATCH]:       { label: "Batch",        priorityRange: [64, 95], quantumMs: 50, preemptible: true, boostOnIO: false },
  [PriorityBand.IDLE]:        { label: "Idle",         priorityRange: [96, 127], quantumMs: 100, preemptible: true, boostOnIO: false },
};

// ── Process States ─────────────────────────────────────────────

export type ProcessState = "created" | "ready" | "running" | "blocked" | "sleeping" | "zombie" | "terminated";

// ── Process Control Block ──────────────────────────────────────

export interface ProcessControlBlock {
  pid: number;
  parentPid: number | null;
  name: string;
  state: ProcessState;
  priority: number;
  band: PriorityBand;
  // Scheduling
  quantumRemaining: number;
  totalCpuTime: number;
  lastScheduledAt: number;
  waitTime: number;
  // Memory
  memoryMapId: string;
  stackSize: number;
  heapSize: number;
  // Capabilities
  capabilities: string[];
  namespaceId: string;
  // Threading
  threads: ThreadControlBlock[];
  mainThreadId: number;
  // Lifecycle
  createdAt: number;
  exitCode: number | null;
  signalMask: number;
}

export interface ThreadControlBlock {
  tid: number;
  pid: number;
  state: ProcessState;
  priority: number;
  stackPointer: number;
  instructionPointer: number;
  cpuAffinity: number[];
  isGreenThread: boolean;
}

// ── Scheduler ──────────────────────────────────────────────────

export class ProcessScheduler {
  private processes = new Map<number, ProcessControlBlock>();
  private readyQueues: Map<PriorityBand, number[]> = new Map();
  private nextPid = 1;
  private nextTid = 1;
  private currentPid: number | null = null;
  private tickCount = 0;
  private _boostInterval = 1000; // ticks between priority boosts (anti-starvation)

  constructor() {
    for (const band of Object.values(PriorityBand).filter(v => typeof v === "number")) {
      this.readyQueues.set(band as PriorityBand, []);
    }
  }

  // ── Process Lifecycle ────────────────────────────────────────

  spawn(name: string, band: PriorityBand, opts?: {
    parentPid?: number;
    capabilities?: string[];
    namespaceId?: string;
    stackSize?: number;
  }): ProcessControlBlock {
    const config = BAND_CONFIG[band];
    const priority = config.priorityRange[0]; // start at top of band
    const pid = this.nextPid++;
    const tid = this.nextTid++;

    const mainThread: ThreadControlBlock = {
      tid,
      pid,
      state: "ready",
      priority,
      stackPointer: 0,
      instructionPointer: 0,
      cpuAffinity: [],
      isGreenThread: false,
    };

    const pcb: ProcessControlBlock = {
      pid,
      parentPid: opts?.parentPid ?? null,
      name,
      state: "ready",
      priority,
      band,
      quantumRemaining: config.quantumMs,
      totalCpuTime: 0,
      lastScheduledAt: 0,
      waitTime: 0,
      memoryMapId: `mmap-${pid}`,
      stackSize: opts?.stackSize ?? 8192,
      heapSize: 0,
      capabilities: opts?.capabilities ?? [],
      namespaceId: opts?.namespaceId ?? "default",
      threads: [mainThread],
      mainThreadId: tid,
      createdAt: Date.now(),
      exitCode: null,
      signalMask: 0,
    };

    this.processes.set(pid, pcb);
    this.enqueue(pid, band);
    return pcb;
  }

  kill(pid: number, exitCode = 0): boolean {
    const pcb = this.processes.get(pid);
    if (!pcb) return false;

    pcb.state = "terminated";
    pcb.exitCode = exitCode;
    pcb.threads.forEach(t => { t.state = "terminated"; });

    // Remove from ready queue
    const queue = this.readyQueues.get(pcb.band);
    if (queue) {
      const idx = queue.indexOf(pid);
      if (idx !== -1) queue.splice(idx, 1);
    }

    if (this.currentPid === pid) this.currentPid = null;

    // Reparent children to init (pid 1)
    for (const [, child] of this.processes) {
      if (child.parentPid === pid) child.parentPid = 1;
    }

    return true;
  }

  // ── Scheduling ───────────────────────────────────────────────

  /** Pick next process to run — highest priority band with ready processes */
  schedule(): ProcessControlBlock | null {
    this.tickCount++;

    // Anti-starvation: periodic boost of all processes
    if (this.tickCount % this._boostInterval === 0) {
      this.boostAll();
    }

    for (const band of [PriorityBand.RT_CRITICAL, PriorityBand.RT_NORMAL, PriorityBand.INTERACTIVE, PriorityBand.BATCH, PriorityBand.IDLE]) {
      const queue = this.readyQueues.get(band)!;
      if (queue.length > 0) {
        const pid = queue.shift()!;
        const pcb = this.processes.get(pid)!;
        pcb.state = "running";
        pcb.lastScheduledAt = Date.now();
        pcb.quantumRemaining = BAND_CONFIG[band].quantumMs;
        this.currentPid = pid;
        return pcb;
      }
    }
    return null;
  }

  /** Called when quantum expires — demote if not RT */
  quantumExpired(pid: number): void {
    const pcb = this.processes.get(pid);
    if (!pcb || pcb.state !== "running") return;

    pcb.totalCpuTime += BAND_CONFIG[pcb.band].quantumMs;
    pcb.state = "ready";

    // Demote within band (increase priority number = lower priority)
    const [, max] = BAND_CONFIG[pcb.band].priorityRange;
    if (pcb.priority < max) pcb.priority++;

    this.enqueue(pid, pcb.band);
    if (this.currentPid === pid) this.currentPid = null;
  }

  /** IO completion boost — promote interactive processes */
  ioComplete(pid: number): void {
    const pcb = this.processes.get(pid);
    if (!pcb) return;

    if (BAND_CONFIG[pcb.band].boostOnIO) {
      const [min] = BAND_CONFIG[pcb.band].priorityRange;
      pcb.priority = min; // boost to top of band
    }

    if (pcb.state === "blocked") {
      pcb.state = "ready";
      this.enqueue(pid, pcb.band);
    }
  }

  /** Block process (waiting for IO/IPC) */
  block(pid: number): void {
    const pcb = this.processes.get(pid);
    if (!pcb) return;
    pcb.state = "blocked";
    if (this.currentPid === pid) this.currentPid = null;
  }

  /** Priority inheritance: temporarily boost blocked process holding resource needed by higher-priority process */
  inheritPriority(holderPid: number, waiterPid: number): void {
    const holder = this.processes.get(holderPid);
    const waiter = this.processes.get(waiterPid);
    if (!holder || !waiter) return;

    if (waiter.priority < holder.priority) {
      holder.priority = waiter.priority;
    }
  }

  // ── Queries ──────────────────────────────────────────────────

  getProcess(pid: number): ProcessControlBlock | undefined {
    return this.processes.get(pid);
  }

  listProcesses(): ProcessControlBlock[] {
    return Array.from(this.processes.values());
  }

  getRunning(): ProcessControlBlock | null {
    return this.currentPid ? this.processes.get(this.currentPid) ?? null : null;
  }

  getStats() {
    const byBand: Record<string, number> = {};
    const byState: Record<string, number> = {};
    for (const pcb of this.processes.values()) {
      const bandLabel = BAND_CONFIG[pcb.band].label;
      byBand[bandLabel] = (byBand[bandLabel] ?? 0) + 1;
      byState[pcb.state] = (byState[pcb.state] ?? 0) + 1;
    }
    return { totalProcesses: this.processes.size, byBand, byState, tickCount: this.tickCount };
  }

  // ── Internal ─────────────────────────────────────────────────

  private enqueue(pid: number, band: PriorityBand): void {
    const queue = this.readyQueues.get(band)!;
    if (!queue.includes(pid)) queue.push(pid);
  }

  /** Anti-starvation: boost all non-RT processes to top of their band */
  private boostAll(): void {
    for (const pcb of this.processes.values()) {
      if (pcb.band >= PriorityBand.INTERACTIVE && pcb.state !== "terminated") {
        const [min] = BAND_CONFIG[pcb.band].priorityRange;
        pcb.priority = min;
      }
    }
  }
}
