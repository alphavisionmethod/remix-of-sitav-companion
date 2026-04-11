// ═══════════════════════════════════════════════════════════════
// SITA OS — Security: Application Isolation
// Per-app namespaces, cgroups v2, private mounts, crash isolation
// ═══════════════════════════════════════════════════════════════

export interface CgroupLimits {
  cpuQuotaPercent: number;    // 0-100 per core (200 = 2 cores)
  cpuPeriodUs: number;        // Scheduling period
  memoryMaxBytes: number;
  memorySwapMaxBytes: number;
  ioReadBps: number;
  ioWriteBps: number;
  pidsMax: number;
  netClsBandwidthMbps: number;
}

export type IsolationLevel = "none" | "basic" | "standard" | "strict" | "maximum";

export interface AppSandbox {
  id: string;
  pid: number;
  appName: string;
  isolationLevel: IsolationLevel;
  // Namespace isolation
  namespaces: {
    pid: boolean;
    net: boolean;
    mnt: boolean;
    user: boolean;
    ipc: boolean;
    uts: boolean;
    cgroup: boolean;
  };
  // Filesystem
  rootfs: string;
  privateTmp: boolean;
  privateHome: string;
  readOnlyBindMounts: string[];
  hiddenPaths: string[];
  allowedPaths: string[];
  // Resource limits
  cgroup: CgroupLimits;
  // Network
  networkPolicy: {
    allowOutbound: boolean;
    allowInbound: boolean;
    allowedPorts: number[];
    allowedHosts: string[];
    dnsAllowed: boolean;
  };
  // State
  state: "creating" | "running" | "suspended" | "crashed" | "terminated";
  crashCount: number;
  lastCrashAt: number | null;
  createdAt: number;
}

// ── Isolation Level Presets ────────────────────────────────────

const ISOLATION_PRESETS: Record<IsolationLevel, Partial<AppSandbox>> = {
  none: {
    namespaces: { pid: false, net: false, mnt: false, user: false, ipc: false, uts: false, cgroup: false },
    privateTmp: false,
    readOnlyBindMounts: [],
    hiddenPaths: [],
    cgroup: { cpuQuotaPercent: -1, cpuPeriodUs: 100000, memoryMaxBytes: -1, memorySwapMaxBytes: -1, ioReadBps: -1, ioWriteBps: -1, pidsMax: -1, netClsBandwidthMbps: -1 },
    networkPolicy: { allowOutbound: true, allowInbound: true, allowedPorts: [], allowedHosts: [], dnsAllowed: true },
  },
  basic: {
    namespaces: { pid: true, net: false, mnt: false, user: false, ipc: false, uts: false, cgroup: true },
    privateTmp: true,
    readOnlyBindMounts: [],
    hiddenPaths: ["/proc/kcore"],
    cgroup: { cpuQuotaPercent: 200, cpuPeriodUs: 100000, memoryMaxBytes: 4 * 1024 ** 3, memorySwapMaxBytes: 2 * 1024 ** 3, ioReadBps: -1, ioWriteBps: -1, pidsMax: 512, netClsBandwidthMbps: -1 },
    networkPolicy: { allowOutbound: true, allowInbound: false, allowedPorts: [], allowedHosts: [], dnsAllowed: true },
  },
  standard: {
    namespaces: { pid: true, net: false, mnt: true, user: false, ipc: true, uts: false, cgroup: true },
    privateTmp: true,
    readOnlyBindMounts: ["/usr", "/lib", "/bin"],
    hiddenPaths: ["/proc/kcore", "/sys/firmware"],
    cgroup: { cpuQuotaPercent: 100, cpuPeriodUs: 100000, memoryMaxBytes: 2 * 1024 ** 3, memorySwapMaxBytes: 1024 ** 3, ioReadBps: 100 * 1024 ** 2, ioWriteBps: 50 * 1024 ** 2, pidsMax: 256, netClsBandwidthMbps: 100 },
    networkPolicy: { allowOutbound: true, allowInbound: false, allowedPorts: [], allowedHosts: [], dnsAllowed: true },
  },
  strict: {
    namespaces: { pid: true, net: true, mnt: true, user: true, ipc: true, uts: true, cgroup: true },
    privateTmp: true,
    readOnlyBindMounts: ["/usr", "/lib", "/bin", "/etc"],
    hiddenPaths: ["/proc/kcore", "/sys/firmware", "/dev/mem", "/dev/kmsg"],
    cgroup: { cpuQuotaPercent: 50, cpuPeriodUs: 100000, memoryMaxBytes: 1024 ** 3, memorySwapMaxBytes: 512 * 1024 ** 2, ioReadBps: 50 * 1024 ** 2, ioWriteBps: 25 * 1024 ** 2, pidsMax: 128, netClsBandwidthMbps: 50 },
    networkPolicy: { allowOutbound: false, allowInbound: false, allowedPorts: [443], allowedHosts: [], dnsAllowed: true },
  },
  maximum: {
    namespaces: { pid: true, net: true, mnt: true, user: true, ipc: true, uts: true, cgroup: true },
    privateTmp: true,
    readOnlyBindMounts: ["/usr", "/lib", "/bin", "/etc", "/opt"],
    hiddenPaths: ["/proc/kcore", "/sys/firmware", "/dev/mem", "/dev/kmsg", "/proc/sysrq-trigger", "/proc/sys"],
    cgroup: { cpuQuotaPercent: 25, cpuPeriodUs: 100000, memoryMaxBytes: 512 * 1024 ** 2, memorySwapMaxBytes: 0, ioReadBps: 10 * 1024 ** 2, ioWriteBps: 5 * 1024 ** 2, pidsMax: 64, netClsBandwidthMbps: 10 },
    networkPolicy: { allowOutbound: false, allowInbound: false, allowedPorts: [], allowedHosts: [], dnsAllowed: false },
  },
};

// ── App Isolation Manager ──────────────────────────────────────

export class AppIsolationManager {
  private sandboxes = new Map<number, AppSandbox>();
  private crashLog: { pid: number; appName: string; timestamp: number; signal: string }[] = [];

  createSandbox(pid: number, appName: string, level: IsolationLevel): AppSandbox {
    const preset = ISOLATION_PRESETS[level];
    const sandbox: AppSandbox = {
      id: `sandbox-${pid}-${Date.now()}`,
      pid, appName, isolationLevel: level,
      namespaces: preset.namespaces as AppSandbox["namespaces"],
      rootfs: level === "none" ? "/" : `/sandbox/${pid}/root`,
      privateTmp: preset.privateTmp ?? false,
      privateHome: `/sandbox/${pid}/home`,
      readOnlyBindMounts: preset.readOnlyBindMounts ?? [],
      hiddenPaths: preset.hiddenPaths ?? [],
      allowedPaths: [`/sandbox/${pid}`],
      cgroup: preset.cgroup as CgroupLimits,
      networkPolicy: preset.networkPolicy as AppSandbox["networkPolicy"],
      state: "running",
      crashCount: 0,
      lastCrashAt: null,
      createdAt: Date.now(),
    };
    this.sandboxes.set(pid, sandbox);
    return sandbox;
  }

  reportCrash(pid: number, signal: string): { action: "restart" | "suspend" | "terminate"; isolated: boolean } {
    const sandbox = this.sandboxes.get(pid);
    if (!sandbox) return { action: "terminate", isolated: false };

    sandbox.crashCount++;
    sandbox.lastCrashAt = Date.now();
    sandbox.state = "crashed";
    this.crashLog.push({ pid, appName: sandbox.appName, timestamp: Date.now(), signal });

    // Crash is always isolated due to namespace separation
    if (sandbox.crashCount < 3) {
      sandbox.state = "running";
      return { action: "restart", isolated: true };
    }
    if (sandbox.crashCount < 5) {
      sandbox.state = "suspended";
      return { action: "suspend", isolated: true };
    }
    sandbox.state = "terminated";
    return { action: "terminate", isolated: true };
  }

  terminateSandbox(pid: number): boolean {
    const sandbox = this.sandboxes.get(pid);
    if (!sandbox) return false;
    sandbox.state = "terminated";
    return true;
  }

  checkResourceLimit(pid: number, resource: "memory" | "cpu" | "pids", currentUsage: number): {
    withinLimit: boolean;
    usagePercent: number;
    limit: number;
  } {
    const sandbox = this.sandboxes.get(pid);
    if (!sandbox) return { withinLimit: true, usagePercent: 0, limit: -1 };

    let limit: number;
    switch (resource) {
      case "memory": limit = sandbox.cgroup.memoryMaxBytes; break;
      case "cpu": limit = sandbox.cgroup.cpuQuotaPercent; break;
      case "pids": limit = sandbox.cgroup.pidsMax; break;
    }

    if (limit === -1) return { withinLimit: true, usagePercent: 0, limit };
    const percent = (currentUsage / limit) * 100;
    return { withinLimit: currentUsage <= limit, usagePercent: percent, limit };
  }

  checkNetworkAccess(pid: number, host: string, port: number, direction: "inbound" | "outbound"): boolean {
    const sandbox = this.sandboxes.get(pid);
    if (!sandbox) return true;

    const policy = sandbox.networkPolicy;
    if (direction === "outbound" && !policy.allowOutbound) {
      // Check if port is in allowed list
      if (policy.allowedPorts.length > 0 && policy.allowedPorts.includes(port)) return true;
      if (policy.allowedHosts.length > 0 && policy.allowedHosts.includes(host)) return true;
      return false;
    }
    if (direction === "inbound" && !policy.allowInbound) return false;
    return true;
  }

  getSandbox(pid: number): AppSandbox | undefined { return this.sandboxes.get(pid); }
  listSandboxes(): AppSandbox[] { return Array.from(this.sandboxes.values()); }
  getCrashLog() { return [...this.crashLog]; }

  getStats() {
    const byLevel: Record<string, number> = {};
    const byState: Record<string, number> = {};
    for (const s of this.sandboxes.values()) {
      byLevel[s.isolationLevel] = (byLevel[s.isolationLevel] ?? 0) + 1;
      byState[s.state] = (byState[s.state] ?? 0) + 1;
    }
    return {
      totalSandboxes: this.sandboxes.size,
      byLevel, byState,
      totalCrashes: this.crashLog.length,
    };
  }
}
