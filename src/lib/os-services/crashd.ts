// ═══════════════════════════════════════════════════════════════
// SITA OS — crashd: Crash Report Collection & Recovery Daemon
// ═══════════════════════════════════════════════════════════════

export interface CrashDump {
  id: string;
  pid: number;
  processName: string;
  signal: string;
  exitCode: number;
  stackTrace: string[];
  timestamp: number;
  memoryUsageMB: number;
  cpuTimeSec: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  restartAttempted: boolean;
  restartSucceeded: boolean;
}

export interface DiagnosticBundle {
  id: string;
  createdAt: number;
  crashes: CrashDump[];
  systemLogs: string[];
  configSnapshot: Record<string, unknown>;
  healthScore: number;
  safeModeTriggered: boolean;
}

const CRASHES: CrashDump[] = [
  { id: 'crash-001', pid: 1842, processName: 'wifid', signal: 'SIGSEGV', exitCode: 139, stackTrace: ['wifid::scan_loop+0x4a2', 'wifid::handle_bss+0x182', 'libc::poll+0x3f'], timestamp: Date.now() - 3600000, memoryUsageMB: 24.5, cpuTimeSec: 142, severity: 'high', resolved: true, restartAttempted: true, restartSucceeded: true },
  { id: 'crash-002', pid: 2103, processName: 'notifyd', signal: 'SIGABRT', exitCode: 134, stackTrace: ['notifyd::dispatch+0x221', 'notifyd::queue_overflow+0x44', 'libsignal::abort+0x12'], timestamp: Date.now() - 7200000, memoryUsageMB: 8.2, cpuTimeSec: 55, severity: 'medium', resolved: true, restartAttempted: true, restartSucceeded: true },
  { id: 'crash-003', pid: 3050, processName: 'pkgd', signal: 'SIGKILL', exitCode: 137, stackTrace: ['pkgd::resolve_deps+0x882', 'pkgd::fetch_manifest+0x3a1', 'oom_killer+0x10'], timestamp: Date.now() - 86400000, memoryUsageMB: 512, cpuTimeSec: 320, severity: 'critical', resolved: false, restartAttempted: true, restartSucceeded: false },
  { id: 'crash-004', pid: 1201, processName: 'btd', signal: 'SIGBUS', exitCode: 135, stackTrace: ['btd::pair_device+0x120', 'btd::sdp_query+0x88'], timestamp: Date.now() - 172800000, memoryUsageMB: 12, cpuTimeSec: 30, severity: 'low', resolved: true, restartAttempted: true, restartSucceeded: true },
];

class CrashDaemon {
  private crashes: CrashDump[] = [...CRASHES];
  private safeModeActive = false;
  private consecutiveCrashCount = new Map<string, number>();

  reportCrash(dump: Omit<CrashDump, 'id'>): CrashDump {
    const crash: CrashDump = { ...dump, id: `crash-${Date.now().toString(36)}` };
    this.crashes.unshift(crash);
    const count = (this.consecutiveCrashCount.get(dump.processName) || 0) + 1;
    this.consecutiveCrashCount.set(dump.processName, count);
    if (count >= 3) this.safeModeActive = true;
    return crash;
  }

  getCrashes(limit = 50): CrashDump[] { return this.crashes.slice(0, limit); }
  getCrashById(id: string): CrashDump | undefined { return this.crashes.find(c => c.id === id); }
  getRecentCrashCount(windowMs = 3600000): number { const cutoff = Date.now() - windowMs; return this.crashes.filter(c => c.timestamp > cutoff).length; }
  isSafeModeActive(): boolean { return this.safeModeActive; }
  clearSafeMode(): void { this.safeModeActive = false; this.consecutiveCrashCount.clear(); }

  getCrashFrequency(): { process: string; count: number; lastCrash: number }[] {
    const freq = new Map<string, { count: number; lastCrash: number }>();
    this.crashes.forEach(c => {
      const f = freq.get(c.processName) || { count: 0, lastCrash: 0 };
      f.count++;
      f.lastCrash = Math.max(f.lastCrash, c.timestamp);
      freq.set(c.processName, f);
    });
    return [...freq.entries()].map(([process, v]) => ({ process, ...v })).sort((a, b) => b.count - a.count);
  }

  exportDiagnosticBundle(): DiagnosticBundle {
    return {
      id: `diag-${Date.now().toString(36)}`,
      createdAt: Date.now(),
      crashes: this.crashes.slice(0, 20),
      systemLogs: ['[INFO] System boot completed in 2.4s', '[WARN] wifid restarted after crash', '[INFO] healthd reports score 87/100', '[ERROR] pkgd OOM killed — memory limit exceeded'],
      configSnapshot: { safeModeActive: this.safeModeActive, totalCrashes: this.crashes.length },
      healthScore: this.safeModeActive ? 40 : 87,
      safeModeTriggered: this.safeModeActive,
    };
  }
}

export const crashd = new CrashDaemon();
