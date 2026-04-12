// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Advanced Multitasking Scheduler
// MLFQ with FIFO ready queues, context switching, preemption,
// blocking/waking, sleep timers, and full event logging
// ═══════════════════════════════════════════════════════════════

import { ProcessTable, type Process, type PriorityBand, type CPUContext } from "./process-manager";
import { MemoryManager } from "./memory-manager";

// ── Band Configuration ───────────────────────────────────────

interface BandConfig {
  name: PriorityBand;
  priorityRange: [number, number];
  quantumTicks: number;
  preemptible: boolean;
}

const BANDS: BandConfig[] = [
  { name: "RT-Critical", priorityRange: [0, 15],    quantumTicks: 1,   preemptible: false },
  { name: "RT-Normal",   priorityRange: [16, 31],   quantumTicks: 5,   preemptible: true },
  { name: "Interactive", priorityRange: [32, 63],    quantumTicks: 10,  preemptible: true },
  { name: "Batch",       priorityRange: [64, 95],    quantumTicks: 50,  preemptible: true },
  { name: "Idle",        priorityRange: [96, 127],   quantumTicks: 100, preemptible: true },
];

const BAND_ORDER: PriorityBand[] = ["RT-Critical", "RT-Normal", "Interactive", "Batch", "Idle"];

// ── Scheduler Events ─────────────────────────────────────────

export type SchedulerEventType =
  | "context-switch"
  | "preempt"
  | "block"
  | "wake"
  | "sleep"
  | "boost"
  | "quantum-expire"
  | "idle"
  | "spawn"
  | "kill";

export interface SchedulerEvent {
  type: SchedulerEventType;
  tick: number;
  timestamp: number;
  fromPid: number | null;
  toPid: number | null;
  detail: string;
}

// ── Scheduler Stats ──────────────────────────────────────────

export interface SchedulerStats {
  totalTicks: number;
  ticksSinceBoost: number;
  scheduledCount: number;
  boostCount: number;
  contextSwitchCount: number;
  preemptionCount: number;
  currentPid: number | null;
  idleTicks: number;
  bandDistribution: Record<PriorityBand, number>;
  readyQueueDepths: Record<PriorityBand, number>;
  blockedCount: number;
}

// ── Ready Queue (FIFO per band) ──────────────────────────────

class ReadyQueue {
  private queues = new Map<PriorityBand, number[]>(); // band → PID list (FIFO)

  constructor() {
    for (const band of BAND_ORDER) {
      this.queues.set(band, []);
    }
  }

  enqueue(pid: number, band: PriorityBand): void {
    const q = this.queues.get(band)!;
    if (!q.includes(pid)) q.push(pid);
  }

  dequeue(band: PriorityBand): number | null {
    const q = this.queues.get(band)!;
    return q.length > 0 ? q.shift()! : null;
  }

  remove(pid: number): void {
    for (const q of this.queues.values()) {
      const idx = q.indexOf(pid);
      if (idx !== -1) q.splice(idx, 1);
    }
  }

  depth(band: PriorityBand): number {
    return this.queues.get(band)?.length ?? 0;
  }

  depths(): Record<PriorityBand, number> {
    const result = {} as Record<PriorityBand, number>;
    for (const band of BAND_ORDER) {
      result[band] = this.depth(band);
    }
    return result;
  }

  /** Get the highest-priority non-empty band */
  highestNonEmpty(): PriorityBand | null {
    for (const band of BAND_ORDER) {
      if (this.depth(band) > 0) return band;
    }
    return null;
  }

  clear(): void {
    for (const q of this.queues.values()) q.length = 0;
  }

  allPids(): number[] {
    const pids: number[] = [];
    for (const q of this.queues.values()) pids.push(...q);
    return pids;
  }
}

// ── Blocked Queue ────────────────────────────────────────────

class BlockedQueue {
  private pids = new Set<number>();

  add(pid: number): void { this.pids.add(pid); }
  remove(pid: number): void { this.pids.delete(pid); }
  has(pid: number): boolean { return this.pids.has(pid); }
  size(): number { return this.pids.size; }
  list(): number[] { return Array.from(this.pids); }
  clear(): void { this.pids.clear(); }
}

// ── Main Scheduler ───────────────────────────────────────────

const BOOST_INTERVAL = 1000;
const MAX_EVENT_LOG = 200;

class SchedulerClass {
  private totalTicks = 0;
  private ticksSinceBoost = 0;
  private scheduledCount = 0;
  private boostCount = 0;
  private contextSwitchCount = 0;
  private preemptionCount = 0;
  private idleTicks = 0;
  private tickTimer: ReturnType<typeof setInterval> | null = null;

  // Core data structures
  private readyQueue = new ReadyQueue();
  private blockedQueue = new BlockedQueue();
  private currentPid: number | null = null;
  private savedContext: CPUContext | null = null;

  // Event log (circular buffer)
  private eventLog: SchedulerEvent[] = [];

  // ── Public API ──────────────────────────────────────────

  /** Get quantum for a priority band */
  getQuantum(band: PriorityBand): number {
    return BANDS.find(b => b.name === band)?.quantumTicks ?? 10;
  }

  getBandConfig(band: PriorityBand): BandConfig | undefined {
    return BANDS.find(b => b.name === band);
  }

  /** Add a process to the ready queue */
  admit(pid: number): void {
    const p = ProcessTable.getProcess(pid);
    if (!p) return;
    ProcessTable.setReady(pid);
    this.readyQueue.enqueue(pid, p.priority);
    this.logEvent("spawn", null, pid, `PID ${pid} admitted to ${p.priority} queue`);
  }

  /** Remove a process entirely (killed) */
  evict(pid: number): void {
    this.readyQueue.remove(pid);
    this.blockedQueue.remove(pid);
    if (this.currentPid === pid) {
      this.currentPid = null;
      this.savedContext = null;
    }
    this.logEvent("kill", pid, null, `PID ${pid} evicted from scheduler`);
  }

  /** Block the running process */
  blockProcess(pid: number, reason: "io" | "ipc" | "mutex" | "syscall"): void {
    if (pid === this.currentPid) {
      // Save context before blocking
      this.saveCurrentContext();
      this.currentPid = null;
    }
    this.readyQueue.remove(pid);
    ProcessTable.block(pid, reason);
    this.blockedQueue.add(pid);
    this.logEvent("block", pid, null, `PID ${pid} blocked (${reason})`);
  }

  /** Wake a blocked process → ready queue */
  wakeProcess(pid: number): void {
    if (!this.blockedQueue.has(pid)) return;
    this.blockedQueue.remove(pid);
    const p = ProcessTable.getProcess(pid);
    if (!p) return;
    ProcessTable.wake(pid);
    this.readyQueue.enqueue(pid, p.priority);
    this.logEvent("wake", null, pid, `PID ${pid} woken → ${p.priority} queue`);
  }

  /** Sleep a process for ms milliseconds */
  sleepProcess(pid: number, ms: number): void {
    if (pid === this.currentPid) {
      this.saveCurrentContext();
      this.currentPid = null;
    }
    this.readyQueue.remove(pid);
    ProcessTable.sleep(pid, ms);
    this.blockedQueue.add(pid);
    this.logEvent("sleep", pid, null, `PID ${pid} sleeping ${ms}ms`);
  }

  // ── Timer Interrupt (Preemption) ──────────────────────────

  /** Simulated timer interrupt — called every tick interval */
  timerInterrupt(): void {
    this.totalTicks++;
    this.ticksSinceBoost++;

    // 1. Check sleeping processes
    const woken = ProcessTable.checkSleepers();
    for (const pid of woken) {
      this.blockedQueue.remove(pid);
      const p = ProcessTable.getProcess(pid);
      if (p) {
        this.readyQueue.enqueue(pid, p.priority);
        this.logEvent("wake", null, pid, `PID ${pid} sleep timer expired`);
      }
    }

    // 2. Anti-starvation boost
    if (this.ticksSinceBoost >= BOOST_INTERVAL) {
      this.antiStarvationBoost();
      this.ticksSinceBoost = 0;
    }

    // 3. Check quantum expiry on current process
    if (this.currentPid !== null) {
      const current = ProcessTable.getProcess(this.currentPid);
      if (current) {
        ProcessTable.addTicks(this.currentPid, 1);

        if (ProcessTable.isQuantumExpired(this.currentPid)) {
          // Preempt! Quantum exhausted
          this.preempt();
          return;
        }
      } else {
        // Process gone
        this.currentPid = null;
      }
    }

    // 4. If no current process, schedule one
    if (this.currentPid === null) {
      this.schedule();
    }
  }

  /** Schedule the next process from ready queues */
  private schedule(): void {
    const band = this.readyQueue.highestNonEmpty();
    if (!band) {
      // Idle — no ready processes
      this.idleTicks++;
      if (this.totalTicks % 100 === 0) {
        this.logEvent("idle", null, null, "CPU idle");
      }
      return;
    }

    const nextPid = this.readyQueue.dequeue(band);
    if (nextPid === null) return;

    this.switchTo(nextPid);
  }

  /** Preempt current running process */
  private preempt(): void {
    if (this.currentPid === null) return;

    const pid = this.currentPid;
    const p = ProcessTable.getProcess(pid);
    if (!p) return;

    this.preemptionCount++;
    this.logEvent("preempt", pid, null, `PID ${pid} preempted (quantum expired)`);

    // Save context, move to ready
    this.saveCurrentContext();
    p.state = "ready";
    ProcessTable.resetQuantum(pid);
    this.readyQueue.enqueue(pid, p.priority);
    this.currentPid = null;

    // Schedule next
    this.schedule();
  }

  /** Context switch to a new process */
  private switchTo(nextPid: number): void {
    const next = ProcessTable.getProcess(nextPid);
    if (!next) return;

    const prevPid = this.currentPid;

    // Save current context if switching from another process
    if (prevPid !== null && prevPid !== nextPid) {
      this.saveCurrentContext();
      const prev = ProcessTable.getProcess(prevPid);
      if (prev && prev.state === "running") {
        prev.state = "ready";
        this.readyQueue.enqueue(prevPid, prev.priority);
      }
    }

    // Load next process context
    this.currentPid = nextPid;
    this.savedContext = ProcessTable.loadContext(nextPid);
    ProcessTable.setRunning(nextPid);

    // Switch address space (simulated CR3 load)
    MemoryManager.switchAddressSpace(nextPid);

    this.contextSwitchCount++;
    this.scheduledCount++;

    this.logEvent("context-switch", prevPid, nextPid,
      `Switch PID ${prevPid ?? "idle"} → PID ${nextPid} (${next.priority})`);
  }

  /** Save the current process's CPU context */
  private saveCurrentContext(): void {
    if (this.currentPid !== null && this.savedContext) {
      // Simulate updating context with current execution state
      const ctx: CPUContext = {
        ...this.savedContext,
        registers: [...this.savedContext.registers],
      };
      ProcessTable.saveContext(this.currentPid, ctx);
    }
  }

  /** Anti-starvation: boost Batch/Idle to Interactive temporarily */
  private antiStarvationBoost(): void {
    let boosted = 0;
    for (const band of ["Batch", "Idle"] as PriorityBand[]) {
      const depths = this.readyQueue.depths();
      // Move all processes from low bands to Interactive
      while (this.readyQueue.depth(band) > 0) {
        const pid = this.readyQueue.dequeue(band);
        if (pid !== null) {
          this.readyQueue.enqueue(pid, "Interactive");
          boosted++;
        }
      }
    }
    if (boosted > 0) {
      this.boostCount++;
      this.logEvent("boost", null, null, `Anti-starvation: ${boosted} processes boosted to Interactive`);
      console.log(`[Kernel:Scheduler] Anti-starvation boost: ${boosted} processes`);
    }
  }

  /** IO completion boost — move process to front of its band */
  ioBoost(pid: number): void {
    const p = ProcessTable.getProcess(pid);
    if (p && (p.priority === "Interactive" || p.priority === "Batch")) {
      this.readyQueue.remove(pid);
      // Re-enqueue at front by temporarily removing and re-adding
      this.readyQueue.enqueue(pid, p.priority);
      console.log(`[Kernel:Scheduler] IO boost for PID ${pid}`);
    }
  }

  /** Priority inheritance */
  inheritPriority(holderPid: number, requesterBand: PriorityBand): PriorityBand | null {
    const holder = ProcessTable.getProcess(holderPid);
    if (!holder) return null;

    const holderIdx = BAND_ORDER.indexOf(holder.priority);
    const requesterIdx = BAND_ORDER.indexOf(requesterBand);

    if (requesterIdx < holderIdx) {
      const oldBand = holder.priority;
      holder.priority = requesterBand;
      // Move in ready queue
      this.readyQueue.remove(holderPid);
      if (holder.state === "ready") {
        this.readyQueue.enqueue(holderPid, requesterBand);
      }
      console.log(`[Kernel:Scheduler] Priority inheritance: PID ${holderPid} ${oldBand} → ${requesterBand}`);
      return oldBand;
    }
    return null;
  }

  /** Start automatic tick timer */
  start(intervalMs = 100): void {
    if (this.tickTimer) return;
    this.tickTimer = setInterval(() => this.timerInterrupt(), intervalMs);
    console.log(`[Kernel:Scheduler] Started (${intervalMs}ms tick interval)`);
  }

  /** Stop scheduler */
  stop(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
      console.log("[Kernel:Scheduler] Stopped");
    }
  }

  /** Legacy tick() for compatibility — delegates to timerInterrupt */
  tick(): Process | null {
    this.timerInterrupt();
    return this.currentPid !== null ? ProcessTable.getProcess(this.currentPid) ?? null : null;
  }

  // ── Event Log ─────────────────────────────────────────────

  private logEvent(type: SchedulerEventType, fromPid: number | null, toPid: number | null, detail: string): void {
    this.eventLog.push({
      type,
      tick: this.totalTicks,
      timestamp: Date.now(),
      fromPid,
      toPid,
      detail,
    });
    // Keep circular buffer bounded
    if (this.eventLog.length > MAX_EVENT_LOG) {
      this.eventLog = this.eventLog.slice(-MAX_EVENT_LOG);
    }
  }

  getEventLog(count = 20): readonly SchedulerEvent[] {
    return this.eventLog.slice(-count);
  }

  getCurrentPid(): number | null {
    return this.currentPid;
  }

  getCurrentContext(): CPUContext | null {
    return this.savedContext;
  }

  // ── Stats ─────────────────────────────────────────────────

  getStats(): SchedulerStats {
    const processes = ProcessTable.listProcesses();
    const dist: Record<PriorityBand, number> = {
      "RT-Critical": 0, "RT-Normal": 0, "Interactive": 0, "Batch": 0, "Idle": 0,
    };
    for (const p of processes) {
      if (p.state !== "terminated") dist[p.priority]++;
    }
    return {
      totalTicks: this.totalTicks,
      ticksSinceBoost: this.ticksSinceBoost,
      scheduledCount: this.scheduledCount,
      boostCount: this.boostCount,
      contextSwitchCount: this.contextSwitchCount,
      preemptionCount: this.preemptionCount,
      currentPid: this.currentPid,
      idleTicks: this.idleTicks,
      bandDistribution: dist,
      readyQueueDepths: this.readyQueue.depths(),
      blockedCount: this.blockedQueue.size(),
    };
  }

  /** Reset scheduler (kernel shutdown) */
  reset(): void {
    this.stop();
    this.totalTicks = 0;
    this.ticksSinceBoost = 0;
    this.scheduledCount = 0;
    this.boostCount = 0;
    this.contextSwitchCount = 0;
    this.preemptionCount = 0;
    this.idleTicks = 0;
    this.currentPid = null;
    this.savedContext = null;
    this.readyQueue.clear();
    this.blockedQueue.clear();
    this.eventLog = [];
  }
}

export const Scheduler = new SchedulerClass();
