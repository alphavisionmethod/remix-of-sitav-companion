// ═══════════════════════════════════════════════════════════════
// SITA OS — System Daemon Registry
// Canonical daemon definitions with health probes,
// restart policies, resource limits, and lifecycle hooks
// ═══════════════════════════════════════════════════════════════

import type { RestartPolicy, BootTarget } from "./init-system";

export type DaemonHealth = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface ResourceLimits {
  maxMemoryMB: number;
  maxCpuPercent: number;
  maxFileDescriptors: number;
  maxThreads: number;
}

export interface DaemonDefinition {
  id: string;
  description: string;
  target: BootTarget;
  dependencies: string[];
  restartPolicy: RestartPolicy;
  watchdogMs: number;
  resourceLimits: ResourceLimits;
  health: DaemonHealth;
  lastHealthCheck?: number;
  capabilities: string[];
  critical: boolean; // if true, system enters degraded mode on failure
}

/** Canonical system daemons for SITA OS */
const SYSTEM_DAEMONS: DaemonDefinition[] = [
  {
    id: "sita-watchdogd",
    description: "Hardware/software watchdog — monitors system health and triggers recovery",
    target: "basic.target",
    dependencies: [],
    restartPolicy: "always",
    watchdogMs: 5000,
    resourceLimits: { maxMemoryMB: 16, maxCpuPercent: 2, maxFileDescriptors: 64, maxThreads: 2 },
    health: "unknown",
    capabilities: ["CAP_SYS_BOOT", "CAP_KILL"],
    critical: true,
  },
  {
    id: "sita-journald",
    description: "Structured journal daemon — kernel/service log aggregation and persistence",
    target: "basic.target",
    dependencies: [],
    restartPolicy: "always",
    watchdogMs: 10000,
    resourceLimits: { maxMemoryMB: 128, maxCpuPercent: 5, maxFileDescriptors: 256, maxThreads: 4 },
    health: "unknown",
    capabilities: ["CAP_SYSLOG", "CAP_DAC_READ_SEARCH"],
    critical: true,
  },
  {
    id: "sita-deviced",
    description: "Device manager — udev-equivalent, hotplug, driver binding",
    target: "basic.target",
    dependencies: ["sita-journald"],
    restartPolicy: "always",
    watchdogMs: 15000,
    resourceLimits: { maxMemoryMB: 64, maxCpuPercent: 5, maxFileDescriptors: 512, maxThreads: 8 },
    health: "unknown",
    capabilities: ["CAP_SYS_ADMIN", "CAP_MKNOD"],
    critical: true,
  },
  {
    id: "sita-networkd",
    description: "Network manager — interface config, DHCP, DNS resolution, VPN",
    target: "network.target",
    dependencies: ["sita-deviced", "sita-journald"],
    restartPolicy: "always",
    watchdogMs: 30000,
    resourceLimits: { maxMemoryMB: 64, maxCpuPercent: 5, maxFileDescriptors: 256, maxThreads: 8 },
    health: "unknown",
    capabilities: ["CAP_NET_ADMIN", "CAP_NET_RAW", "CAP_NET_BIND_SERVICE"],
    critical: true,
  },
  {
    id: "sita-resolved",
    description: "DNS resolver daemon — DNSSEC, caching, split DNS",
    target: "network.target",
    dependencies: ["sita-networkd"],
    restartPolicy: "always",
    watchdogMs: 30000,
    resourceLimits: { maxMemoryMB: 32, maxCpuPercent: 3, maxFileDescriptors: 128, maxThreads: 4 },
    health: "unknown",
    capabilities: ["CAP_NET_BIND_SERVICE"],
    critical: false,
  },
  {
    id: "sita-sessiond",
    description: "Session manager — user sessions, seat management, idle tracking",
    target: "sita-runtime.target",
    dependencies: ["sita-journald", "sita-networkd"],
    restartPolicy: "always",
    watchdogMs: 30000,
    resourceLimits: { maxMemoryMB: 48, maxCpuPercent: 3, maxFileDescriptors: 256, maxThreads: 4 },
    health: "unknown",
    capabilities: ["CAP_SYS_ADMIN", "CAP_AUDIT_WRITE"],
    critical: false,
  },
  {
    id: "sita-crond",
    description: "Scheduled task daemon — recurring jobs, maintenance windows, cleanup",
    target: "sita-runtime.target",
    dependencies: ["sita-journald"],
    restartPolicy: "on-failure",
    watchdogMs: 60000,
    resourceLimits: { maxMemoryMB: 32, maxCpuPercent: 5, maxFileDescriptors: 128, maxThreads: 4 },
    health: "unknown",
    capabilities: ["CAP_SETUID", "CAP_SETGID"],
    critical: false,
  },
  {
    id: "sita-updated",
    description: "Update daemon — A/B partition updates, package sync, rollback",
    target: "sita-runtime.target",
    dependencies: ["sita-networkd", "sita-journald"],
    restartPolicy: "on-failure",
    watchdogMs: 60000,
    resourceLimits: { maxMemoryMB: 128, maxCpuPercent: 10, maxFileDescriptors: 256, maxThreads: 8 },
    health: "unknown",
    capabilities: ["CAP_SYS_ADMIN", "CAP_FOWNER"],
    critical: false,
  },
  {
    id: "sita-tpmd",
    description: "TPM manager daemon — key sealing, attestation, PCR management",
    target: "security.target",
    dependencies: ["sita-deviced"],
    restartPolicy: "on-failure",
    watchdogMs: 30000,
    resourceLimits: { maxMemoryMB: 32, maxCpuPercent: 2, maxFileDescriptors: 64, maxThreads: 2 },
    health: "unknown",
    capabilities: ["CAP_SYS_ADMIN"],
    critical: false,
  },
  {
    id: "sita-polkitd",
    description: "Policy kit daemon — privilege escalation authorization",
    target: "security.target",
    dependencies: ["sita-journald"],
    restartPolicy: "always",
    watchdogMs: 30000,
    resourceLimits: { maxMemoryMB: 32, maxCpuPercent: 2, maxFileDescriptors: 64, maxThreads: 2 },
    health: "unknown",
    capabilities: [],
    critical: false,
  },
];

export class DaemonRegistry {
  private daemons: Map<string, DaemonDefinition> = new Map();

  constructor() {
    for (const d of SYSTEM_DAEMONS) {
      this.daemons.set(d.id, { ...d });
    }
  }

  get(id: string): DaemonDefinition | undefined {
    return this.daemons.get(id);
  }

  getAll(): DaemonDefinition[] {
    return [...this.daemons.values()];
  }

  getCritical(): DaemonDefinition[] {
    return this.getAll().filter(d => d.critical);
  }

  getByTarget(target: BootTarget): DaemonDefinition[] {
    return this.getAll().filter(d => d.target === target);
  }

  updateHealth(id: string, health: DaemonHealth): void {
    const d = this.daemons.get(id);
    if (d) {
      d.health = health;
      d.lastHealthCheck = Date.now();
    }
  }

  checkAllHealth(): Array<{ id: string; health: DaemonHealth }> {
    return this.getAll().map(d => ({
      id: d.id,
      health: d.health,
    }));
  }

  isSystemHealthy(): boolean {
    return this.getCritical().every(d => d.health === "healthy");
  }

  getStats() {
    const all = this.getAll();
    return {
      totalDaemons: all.length,
      critical: this.getCritical().length,
      healthy: all.filter(d => d.health === "healthy").length,
      degraded: all.filter(d => d.health === "degraded").length,
      unhealthy: all.filter(d => d.health === "unhealthy").length,
      systemHealthy: this.isSystemHealthy(),
    };
  }
}
