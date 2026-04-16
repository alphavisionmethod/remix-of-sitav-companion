// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Background Task Contract
// OS-aware policy for what may run when app is not foregrounded.
// ═══════════════════════════════════════════════════════════════

export type BackgroundTaskKind =
  | "sync-replay"           // drain offline queue
  | "push-refresh"          // silent push triggered hydration
  | "trust-attestation"     // periodic device-integrity check
  | "boardroom-prefetch"    // preload tomorrow's boardroom
  | "diagnostics-flush";    // ship lifecycle telemetry

export type BackgroundTaskConstraint =
  | "requires-network"
  | "requires-unmetered-network"
  | "requires-charging"
  | "requires-idle"
  | "requires-storage-headroom";

export interface BackgroundTaskSpec {
  kind: BackgroundTaskKind;
  /** Earliest interval the OS may schedule this task at. */
  minIntervalSeconds: number;
  /** Hard deadline beyond which the task is skipped, not retried. */
  maxLatencySeconds: number;
  constraints: ReadonlyArray<BackgroundTaskConstraint>;
  /** Whether the task may run via silent push trigger. */
  silentPushEligible: boolean;
  /** Battery-aware throttle: skip when battery below this percentage. */
  minBatteryPercent: number;
  description: string;
}

export const BACKGROUND_TASK_REGISTRY: ReadonlyArray<BackgroundTaskSpec> = [
  {
    kind: "sync-replay",
    minIntervalSeconds: 15 * 60,
    maxLatencySeconds: 60 * 60,
    constraints: ["requires-network"],
    silentPushEligible: true,
    minBatteryPercent: 15,
    description: "Drain pending offline mutation queue.",
  },
  {
    kind: "push-refresh",
    minIntervalSeconds: 60,
    maxLatencySeconds: 5 * 60,
    constraints: ["requires-network"],
    silentPushEligible: true,
    minBatteryPercent: 5,
    description: "Hydrate cache after silent push.",
  },
  {
    kind: "trust-attestation",
    minIntervalSeconds: 6 * 60 * 60,
    maxLatencySeconds: 24 * 60 * 60,
    constraints: ["requires-network"],
    silentPushEligible: false,
    minBatteryPercent: 20,
    description: "Refresh device integrity verdict.",
  },
  {
    kind: "boardroom-prefetch",
    minIntervalSeconds: 4 * 60 * 60,
    maxLatencySeconds: 24 * 60 * 60,
    constraints: ["requires-unmetered-network", "requires-charging"],
    silentPushEligible: false,
    minBatteryPercent: 30,
    description: "Pre-warm tomorrow's boardroom data overnight.",
  },
  {
    kind: "diagnostics-flush",
    minIntervalSeconds: 60 * 60,
    maxLatencySeconds: 12 * 60 * 60,
    constraints: ["requires-network"],
    silentPushEligible: false,
    minBatteryPercent: 15,
    description: "Ship buffered diagnostics to backend.",
  },
] as const;
