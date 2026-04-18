// ═══════════════════════════════════════════════════════════════
// SITA OS — Render Thread Pool
// Multi-threaded work distribution with work-stealing, priority
// lanes, tile affinity, and frame deadline awareness
// ═══════════════════════════════════════════════════════════════

export type WorkPriority = "ui-critical" | "normal" | "background";

export interface WorkItem {
  id: string;
  tileId: string;
  priority: WorkPriority;
  estimatedCostUs: number; // microseconds
  affinity?: number; // preferred thread index
  execute: () => void;
  onComplete?: () => void;
}

export type ThreadState = "idle" | "busy" | "stealing" | "yielding";

export interface RenderThread {
  index: number;
  state: ThreadState;
  deque: WorkItem[];
  completedCount: number;
  stolenCount: number;
  totalCostUs: number;
  cacheRegion: { x: number; y: number; w: number; h: number } | null;
}

export interface ThreadPoolStats {
  threadCount: number;
  threads: Array<{
    index: number;
    state: ThreadState;
    queueDepth: number;
    completedCount: number;
    stolenCount: number;
    totalCostUs: number;
  }>;
  totalCompleted: number;
  totalStolen: number;
  avgLoadBalance: number; // 0-1, 1 = perfectly balanced
  frameBudgetRemainingUs: number;
}

const DEFAULT_THREAD_COUNT = 4;
const FRAME_BUDGET_US = 16_600; // 16.6ms in microseconds

export class RenderThreadPool {
  private _threads: RenderThread[];
  private _frameBudgetUs: number;
  private _frameStartUs = 0;
  private _totalCompleted = 0;
  private _totalStolen = 0;
  private _adaptiveThreadCount: number;

  constructor(threadCount = DEFAULT_THREAD_COUNT, frameBudgetUs = FRAME_BUDGET_US) {
    this._adaptiveThreadCount = threadCount;
    this._frameBudgetUs = frameBudgetUs;
    this._threads = Array.from({ length: threadCount }, (_, i) => this._createThread(i));
  }

  // ── Public API ──────────────────────────────────────────────

  /** Begin a new frame — reset per-frame counters */
  beginFrame(): void {
    this._frameStartUs = performance.now() * 1000;
    for (const t of this._threads) {
      t.deque = [];
    }
  }

  /** Submit work item to the pool */
  submit(item: WorkItem): void {
    // Respect affinity if set and valid
    if (item.affinity !== undefined && item.affinity >= 0 && item.affinity < this._threads.length) {
      this._threads[item.affinity].deque.push(item);
      return;
    }

    // Priority-aware placement: UI-critical → shortest queue
    const target = this._leastLoadedThread(item.priority);
    target.deque.push(item);
  }

  /** Submit batch of work items (e.g., all dirty tiles for a frame) */
  submitBatch(items: WorkItem[]): void {
    // Sort: ui-critical first, then normal, then background
    const sorted = [...items].sort((a, b) => {
      const order: Record<WorkPriority, number> = { "ui-critical": 0, normal: 1, background: 2 };
      return order[a.priority] - order[b.priority];
    });
    for (const item of sorted) {
      this.submit(item);
    }
  }

  /** Execute all queued work with work-stealing and deadline awareness */
  executeFrame(): { completed: number; skipped: number; elapsedUs: number } {
    let completed = 0;
    let skipped = 0;

    // Simulate parallel execution by round-robin through threads
    let anyWork = true;
    while (anyWork) {
      anyWork = false;

      // Check deadline
      const elapsed = (performance.now() * 1000) - this._frameStartUs;
      if (elapsed >= this._frameBudgetUs * 0.95) {
        // Yield — count remaining as skipped
        for (const t of this._threads) {
          skipped += t.deque.length;
          t.state = "yielding";
          t.deque = [];
        }
        break;
      }

      for (const thread of this._threads) {
        if (thread.deque.length > 0) {
          anyWork = true;
          const item = thread.deque.shift()!;
          thread.state = "busy";
          item.execute();
          item.onComplete?.();
          thread.completedCount++;
          thread.totalCostUs += item.estimatedCostUs;
          completed++;
          this._totalCompleted++;
        } else {
          // Work stealing — take from busiest thread
          thread.state = "stealing";
          const stolen = this._steal(thread);
          if (stolen) {
            anyWork = true;
            thread.state = "busy";
            stolen.execute();
            stolen.onComplete?.();
            thread.completedCount++;
            thread.stolenCount++;
            thread.totalCostUs += stolen.estimatedCostUs;
            completed++;
            this._totalCompleted++;
            this._totalStolen++;
          } else {
            thread.state = "idle";
          }
        }
      }
    }

    const elapsedUs = (performance.now() * 1000) - this._frameStartUs;
    return { completed, skipped, elapsedUs };
  }

  /** Set tile affinity — map a screen region to a preferred thread */
  setTileAffinity(threadIndex: number, region: { x: number; y: number; w: number; h: number }): void {
    if (threadIndex >= 0 && threadIndex < this._threads.length) {
      this._threads[threadIndex].cacheRegion = region;
    }
  }

  /** Get thread index with affinity for a given tile position */
  getAffinityForTile(tileX: number, tileY: number): number | undefined {
    for (const t of this._threads) {
      if (t.cacheRegion) {
        const r = t.cacheRegion;
        if (tileX >= r.x && tileX < r.x + r.w && tileY >= r.y && tileY < r.y + r.h) {
          return t.index;
        }
      }
    }
    return undefined;
  }

  /** Adapt thread count based on workload (simulate core detection) */
  adaptThreadCount(coreCount: number): void {
    const newCount = Math.max(1, Math.min(coreCount, 16));
    if (newCount === this._threads.length) return;

    if (newCount > this._threads.length) {
      for (let i = this._threads.length; i < newCount; i++) {
        this._threads.push(this._createThread(i));
      }
    } else {
      this._threads = this._threads.slice(0, newCount);
    }
    this._adaptiveThreadCount = newCount;
  }

  get threadCount(): number {
    return this._threads.length;
  }

  get frameBudgetUs(): number {
    return this._frameBudgetUs;
  }

  setFrameBudget(budgetUs: number): void {
    this._frameBudgetUs = budgetUs;
  }

  getStats(): ThreadPoolStats {
    const completedCounts = this._threads.map((t) => t.completedCount);
    const avg = completedCounts.reduce((a, b) => a + b, 0) / completedCounts.length || 0;
    const max = Math.max(...completedCounts, 1);
    const loadBalance = avg / max; // 1.0 = all threads did equal work

    return {
      threadCount: this._threads.length,
      threads: this._threads.map((t) => ({
        index: t.index,
        state: t.state,
        queueDepth: t.deque.length,
        completedCount: t.completedCount,
        stolenCount: t.stolenCount,
        totalCostUs: t.totalCostUs,
      })),
      totalCompleted: this._totalCompleted,
      totalStolen: this._totalStolen,
      avgLoadBalance: loadBalance,
      frameBudgetRemainingUs: Math.max(0, this._frameBudgetUs - ((performance.now() * 1000) - this._frameStartUs)),
    };
  }

  // ── Internal ────────────────────────────────────────────────

  private _createThread(index: number): RenderThread {
    return {
      index,
      state: "idle",
      deque: [],
      completedCount: 0,
      stolenCount: 0,
      totalCostUs: 0,
      cacheRegion: null,
    };
  }

  private _leastLoadedThread(priority: WorkPriority): RenderThread {
    let best = this._threads[0];
    let bestScore = Infinity;
    for (const t of this._threads) {
      // Weight: queue depth + priority urgency
      const score = t.deque.length + (priority === "ui-critical" ? 0 : t.deque.filter((w) => w.priority === "ui-critical").length * 10);
      if (score < bestScore) {
        bestScore = score;
        best = t;
      }
    }
    return best;
  }

  private _steal(thief: RenderThread): WorkItem | null {
    let busiestThread: RenderThread | null = null;
    let maxLen = 1; // only steal if victim has >1 items
    for (const t of this._threads) {
      if (t.index !== thief.index && t.deque.length > maxLen) {
        maxLen = t.deque.length;
        busiestThread = t;
      }
    }
    if (!busiestThread) return null;
    // Steal from the back (opposite end) — classic work-stealing
    return busiestThread.deque.pop() ?? null;
  }
}
