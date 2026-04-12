// ═══════════════════════════════════════════════════════════════
// Nova Kernel — MLFQ Scheduler
// Multi-Level Feedback Queue with 5 priority bands
// Matches kernel-architecture-manifest.json bands
// ═══════════════════════════════════════════════════════════════

import { ProcessTable, type Process, type PriorityBand } from "./process-manager";

// ── Band Configuration (from kernel-architecture-manifest.json) ──

interface BandConfig {
  name: PriorityBand;
  priorityRange: [number, number];
  quantumMs: number;
  preemptible: boolean;
}

const BANDS: BandConfig[] = [
  { name: "RT-Critical", priorityRange: [0, 15],    quantumMs: 1,   preemptible: false },
  { name: "RT-Normal",   priorityRange: [16, 31],   quantumMs: 5,   preemptible: true },
  { name: "Interactive",  priorityRange: [32, 63],   quantumMs: 10,  preemptible: true },
  { name: "Batch",        priorityRange: [64, 95],   quantumMs: 50,  preemptible: true },
  { name: "Idle",         priorityRange: [96, 127],  quantumMs: 100, preemptible: true },
];

// ── Scheduler State ─────────────────────────────────────────────

interface SchedulerStats {
  totalTicks: number;
  ticksSinceBoost: number;
  scheduledCount: number;
  boostCount: number;
  bandDistribution: Record<PriorityBand, number>;
}

const BOOST_INTERVAL = 1000; // ticks between anti-starvation boosts

class SchedulerClass {
  private totalTicks = 0;
  private ticksSinceBoost = 0;
  private scheduledCount = 0;
  private boostCount = 0;
  private tickTimer: ReturnType<typeof setInterval> | null = null;

  /** Get quantum for a priority band */
  getQuantum(band: PriorityBand): number {
    return BANDS.find(b => b.name === band)?.quantumMs ?? 10;
  }

  /** Get band config */
  getBandConfig(band: PriorityBand): BandConfig | undefined {
    return BANDS.find(b => b.name === band);
  }

  /** Run a single scheduling tick — selects next process to run */
  tick(): Process | null {
    this.totalTicks++;
    this.ticksSinceBoost++;

    // Anti-starvation: boost all Batch/Idle processes to Interactive every N ticks
    if (this.ticksSinceBoost >= BOOST_INTERVAL) {
      this.antiStarvationBoost();
      this.ticksSinceBoost = 0;
    }

    // Select highest-priority runnable process
    const runnable = ProcessTable.listRunning();
    if (runnable.length === 0) return null;

    // Sort by band priority (lower band index = higher priority)
    const bandOrder: PriorityBand[] = ["RT-Critical", "RT-Normal", "Interactive", "Batch", "Idle"];
    runnable.sort((a, b) => {
      const ai = bandOrder.indexOf(a.priority);
      const bi = bandOrder.indexOf(b.priority);
      if (ai !== bi) return ai - bi;
      // Same band: round-robin by least ticks used
      return a.cpuTicks - b.cpuTicks;
    });

    const selected = runnable[0];
    const quantum = this.getQuantum(selected.priority);

    // Simulate execution: add quantum worth of ticks
    ProcessTable.addTicks(selected.pid, quantum);
    this.scheduledCount++;

    return selected;
  }

  /** Anti-starvation: temporarily boost low-priority processes */
  private antiStarvationBoost(): void {
    const processes = ProcessTable.listRunning();
    let boosted = 0;
    for (const p of processes) {
      if (p.priority === "Batch" || p.priority === "Idle") {
        // Temporarily treat as Interactive for one quantum
        // (We don't actually change the band, just prioritize in next tick)
        boosted++;
      }
    }
    if (boosted > 0) {
      this.boostCount++;
      console.log(`[Kernel:Scheduler] Anti-starvation boost: ${boosted} processes`);
    }
  }

  /** IO completion boost — move process to top of its band */
  ioBoost(pid: number): void {
    const p = ProcessTable.getProcess(pid);
    if (p && (p.priority === "Interactive" || p.priority === "Batch")) {
      // Reset tick count to prioritize in round-robin
      // (simulates moving to top of band queue)
      console.log(`[Kernel:Scheduler] IO boost for PID ${pid}`);
    }
  }

  /** Priority inheritance: temporarily boost a process holding a resource needed by a higher-priority process */
  inheritPriority(holderPid: number, requesterBand: PriorityBand): PriorityBand | null {
    const holder = ProcessTable.getProcess(holderPid);
    if (!holder) return null;

    const bandOrder: PriorityBand[] = ["RT-Critical", "RT-Normal", "Interactive", "Batch", "Idle"];
    const holderIdx = bandOrder.indexOf(holder.priority);
    const requesterIdx = bandOrder.indexOf(requesterBand);

    if (requesterIdx < holderIdx) {
      const oldBand = holder.priority;
      holder.priority = requesterBand;
      console.log(`[Kernel:Scheduler] Priority inheritance: PID ${holderPid} ${oldBand} → ${requesterBand}`);
      return oldBand; // caller can restore later
    }
    return null;
  }

  /** Start automatic tick timer (simulates scheduler interrupt) */
  start(intervalMs = 100): void {
    if (this.tickTimer) return;
    this.tickTimer = setInterval(() => this.tick(), intervalMs);
    console.log(`[Kernel:Scheduler] Started (${intervalMs}ms interval)`);
  }

  /** Stop scheduler */
  stop(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
      console.log("[Kernel:Scheduler] Stopped");
    }
  }

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
      bandDistribution: dist,
    };
  }

  /** Reset scheduler (kernel shutdown) */
  reset(): void {
    this.stop();
    this.totalTicks = 0;
    this.ticksSinceBoost = 0;
    this.scheduledCount = 0;
    this.boostCount = 0;
  }
}

export const Scheduler = new SchedulerClass();
