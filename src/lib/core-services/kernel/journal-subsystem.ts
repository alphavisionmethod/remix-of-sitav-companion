// ═══════════════════════════════════════════════════════════════
// SITA OS — Journal Subsystem
// OS-level structured journal: ring buffer, persistent storage,
// priority filtering, crash dump collection, diagnostic snapshots
// ═══════════════════════════════════════════════════════════════

export type JournalPriority = "emerg" | "alert" | "crit" | "err" | "warning" | "notice" | "info" | "debug";

const PRIORITY_LEVELS: Record<JournalPriority, number> = {
  emerg: 0, alert: 1, crit: 2, err: 3, warning: 4, notice: 5, info: 6, debug: 7,
};

export interface JournalEntry {
  id: string;
  timestamp: number;
  priority: JournalPriority;
  source: "kernel" | "daemon" | "service" | "boot" | "user" | "audit";
  unit: string;          // service unit that emitted (e.g. "sita-networkd")
  message: string;
  pid?: number;
  uid?: number;
  fields?: Record<string, string>;
  boot_id: string;       // unique per boot session
}

export interface CrashDump {
  id: string;
  timestamp: number;
  unit: string;
  signal: number;
  pid: number;
  corePath: string;
  stackTrace?: string;
  metadata: Record<string, string>;
}

export interface DiagnosticSnapshot {
  id: string;
  timestamp: number;
  reason: string;
  entries: JournalEntry[];
  crashes: CrashDump[];
  systemState: Record<string, unknown>;
}

export class JournalSubsystem {
  private entries: JournalEntry[] = [];
  private crashes: CrashDump[] = [];
  private snapshots: DiagnosticSnapshot[] = [];
  private _maxEntries: number;
  private _minPriority: JournalPriority = "debug";
  private _bootId: string;
  private _entryCounter = 0;
  private _forwardTargets: Array<(entry: JournalEntry) => void> = [];

  constructor(maxEntries = 10000) {
    this._maxEntries = maxEntries;
    this._bootId = `boot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  }

  /** Set minimum priority filter (entries below this are discarded) */
  setMinPriority(priority: JournalPriority): void {
    this._minPriority = priority;
  }

  /** Write a journal entry */
  write(
    priority: JournalPriority,
    source: JournalEntry["source"],
    unit: string,
    message: string,
    fields?: Record<string, string>
  ): JournalEntry | null {
    if (PRIORITY_LEVELS[priority] > PRIORITY_LEVELS[this._minPriority]) return null;

    const entry: JournalEntry = {
      id: `je_${++this._entryCounter}`,
      timestamp: Date.now(),
      priority,
      source,
      unit,
      message,
      fields,
      boot_id: this._bootId,
    };

    this.entries.push(entry);

    // Ring buffer eviction
    while (this.entries.length > this._maxEntries) {
      this.entries.shift();
    }

    // Forward to registered targets
    for (const fn of this._forwardTargets) {
      try { fn(entry); } catch { /* ignore forward errors */ }
    }

    return entry;
  }

  /** Kernel message (highest priority source) */
  kernelMsg(priority: JournalPriority, message: string): JournalEntry | null {
    return this.write(priority, "kernel", "kernel", message);
  }

  /** Query journal entries */
  query(filter: {
    unit?: string;
    source?: JournalEntry["source"];
    minPriority?: JournalPriority;
    since?: number;
    until?: number;
    limit?: number;
    bootId?: string;
  }): JournalEntry[] {
    let results = this.entries;

    if (filter.unit) results = results.filter(e => e.unit === filter.unit);
    if (filter.source) results = results.filter(e => e.source === filter.source);
    if (filter.bootId) results = results.filter(e => e.boot_id === filter.bootId);
    if (filter.since) results = results.filter(e => e.timestamp >= filter.since!);
    if (filter.until) results = results.filter(e => e.timestamp <= filter.until!);
    if (filter.minPriority) {
      const minLevel = PRIORITY_LEVELS[filter.minPriority];
      results = results.filter(e => PRIORITY_LEVELS[e.priority] <= minLevel);
    }
    if (filter.limit) results = results.slice(-filter.limit);

    return results;
  }

  /** Record a crash dump */
  recordCrash(unit: string, signal: number, pid: number, stackTrace?: string): CrashDump {
    const dump: CrashDump = {
      id: `crash_${Date.now().toString(36)}`,
      timestamp: Date.now(),
      unit,
      signal,
      pid,
      corePath: `/var/crash/${unit}.${pid}.core`,
      stackTrace,
      metadata: { boot_id: this._bootId },
    };

    this.crashes.push(dump);
    this.write("crit", "kernel", unit, `Process crashed: signal=${signal} pid=${pid}`);
    return dump;
  }

  /** Create a diagnostic snapshot */
  createSnapshot(reason: string, systemState: Record<string, unknown> = {}): DiagnosticSnapshot {
    const snapshot: DiagnosticSnapshot = {
      id: `diag_${Date.now().toString(36)}`,
      timestamp: Date.now(),
      reason,
      entries: this.entries.slice(-500), // last 500 entries
      crashes: [...this.crashes],
      systemState,
    };

    this.snapshots.push(snapshot);
    this.write("notice", "daemon", "sita-journald", `Diagnostic snapshot created: ${reason}`);
    return snapshot;
  }

  /** Register a log forwarding target */
  addForwardTarget(fn: (entry: JournalEntry) => void): void {
    this._forwardTargets.push(fn);
  }

  getCrashes(): CrashDump[] { return [...this.crashes]; }
  getSnapshots(): DiagnosticSnapshot[] { return [...this.snapshots]; }
  getBootId(): string { return this._bootId; }

  getStats() {
    return {
      totalEntries: this.entries.length,
      maxEntries: this._maxEntries,
      crashCount: this.crashes.length,
      snapshotCount: this.snapshots.length,
      bootId: this._bootId,
      minPriority: this._minPriority,
      forwardTargets: this._forwardTargets.length,
      entriesByPriority: Object.fromEntries(
        (Object.keys(PRIORITY_LEVELS) as JournalPriority[]).map(p => [
          p,
          this.entries.filter(e => e.priority === p).length,
        ])
      ),
    };
  }
}
