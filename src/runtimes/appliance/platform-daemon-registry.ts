// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Daemon Registry
// Registry of OS-layer daemons with dependency graph and
// degradation behavior when each daemon fails.
// ═══════════════════════════════════════════════════════════════

export type DaemonStatus = "running" | "degraded" | "stopped" | "unknown";

export interface PlatformDaemon {
  daemonId: string;
  name: string;
  description: string;
  /** systemd unit name (if applicable). */
  unitName: string | null;
  /** Implementation location on disk. */
  implementationLocation: string | null;
  /** Is this daemon implemented today? */
  implemented: boolean;
  /** Daemons that must be running before this one starts. */
  dependsOn: readonly string[];
  /** What happens to the system when this daemon fails. */
  degradationImpact: string;
  /** Is the system still usable without this daemon? */
  systemUsableWithout: boolean;
  /** Kill-switch reference if one exists. */
  killSwitchRef: string | null;
  /** Runbook reference for recovery. */
  runbookRef: string | null;
}

export const PLATFORM_DAEMON_REGISTRY: readonly PlatformDaemon[] = [
  {
    daemonId: "healthd",
    name: "Health Daemon",
    description: "Monitors system health metrics, disk space, memory, service status.",
    unitName: "sita-healthd.service",
    implementationLocation: "scripts/release/iso/sita-metrics-agent.sh",
    implemented: true,
    dependsOn: [],
    degradationImpact: "Health metrics unavailable. No proactive alerts. System still functional.",
    systemUsableWithout: true,
    killSwitchRef: null,
    runbookRef: "RB-012",
  },
  {
    daemonId: "settingsd",
    name: "Settings Daemon",
    description: "Manages appliance configuration, network settings, timezone.",
    unitName: "sita-settingsd.service",
    implementationLocation: null,
    implemented: false,
    dependsOn: [],
    degradationImpact: "Settings changes unavailable. Current config remains active.",
    systemUsableWithout: true,
    killSwitchRef: null,
    runbookRef: null,
  },
  {
    daemonId: "crashd",
    name: "Crash Daemon",
    description: "Collects crash reports, core dumps, and evidence bundles.",
    unitName: "sita-crashd.service",
    implementationLocation: null,
    implemented: false,
    dependsOn: ["healthd"],
    degradationImpact: "Crash evidence not collected. Post-mortem analysis unavailable.",
    systemUsableWithout: true,
    killSwitchRef: null,
    runbookRef: null,
  },
  {
    daemonId: "timed",
    name: "Time Daemon",
    description: "NTP synchronization and clock management.",
    unitName: "systemd-timesyncd.service",
    implementationLocation: null,
    implemented: true,
    dependsOn: [],
    degradationImpact: "Clock drift possible. Certificate validation and TTLs may fail.",
    systemUsableWithout: false,
    killSwitchRef: null,
    runbookRef: null,
    // Note: Uses Ubuntu's systemd-timesyncd, not a custom daemon
  },
  {
    daemonId: "accessibilityd",
    name: "Accessibility Daemon",
    description: "Screen reader support, high contrast, keyboard navigation assistance.",
    unitName: "sita-accessibilityd.service",
    implementationLocation: null,
    implemented: false,
    dependsOn: [],
    degradationImpact: "Accessibility features unavailable. Core system still works.",
    systemUsableWithout: true,
    killSwitchRef: null,
    runbookRef: null,
  },
  {
    daemonId: "ota-agent",
    name: "OTA Update Agent",
    description: "Checks for and applies over-the-air updates.",
    unitName: "sita-ota-agent.service",
    implementationLocation: "scripts/release/iso/sita-ota-agent.sh",
    implemented: true,
    dependsOn: ["healthd"],
    degradationImpact: "No automatic updates. Manual update via recovery required.",
    systemUsableWithout: true,
    killSwitchRef: "KS-OTA",
    runbookRef: "RB-015",
  },
  {
    daemonId: "recovery-agent",
    name: "Recovery Agent",
    description: "Manages backup, restore, and disaster recovery procedures.",
    unitName: "sita-recovery.service",
    implementationLocation: "scripts/release/iso/sita-backup.sh",
    implemented: true,
    dependsOn: [],
    degradationImpact: "Automated backups and restore unavailable. Manual recovery only.",
    systemUsableWithout: true,
    killSwitchRef: null,
    runbookRef: "RB-016",
  },
] as const;

export function getDaemon(daemonId: string): PlatformDaemon | undefined {
  return PLATFORM_DAEMON_REGISTRY.find((d) => d.daemonId === daemonId);
}

export function getImplementedDaemons(): PlatformDaemon[] {
  return PLATFORM_DAEMON_REGISTRY.filter((d) => d.implemented);
}

export function getRoadmapDaemons(): PlatformDaemon[] {
  return PLATFORM_DAEMON_REGISTRY.filter((d) => !d.implemented);
}

/** Get dependency order (topological sort). */
export function getDaemonStartOrder(): string[] {
  const visited = new Set<string>();
  const order: string[] = [];
  const daemons = new Map(PLATFORM_DAEMON_REGISTRY.map((d) => [d.daemonId, d]));

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const d = daemons.get(id);
    if (d) for (const dep of d.dependsOn) visit(dep);
    order.push(id);
  }

  for (const d of PLATFORM_DAEMON_REGISTRY) visit(d.daemonId);
  return order;
}

/** Which daemons are critical (system NOT usable without them)? */
export function getCriticalDaemons(): PlatformDaemon[] {
  return PLATFORM_DAEMON_REGISTRY.filter((d) => !d.systemUsableWithout);
}