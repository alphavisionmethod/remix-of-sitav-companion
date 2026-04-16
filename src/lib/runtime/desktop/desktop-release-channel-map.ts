// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Release Channel Map
// Channel registry: dev/internal/beta/production + min-version
// ═══════════════════════════════════════════════════════════════

export type ReleaseChannelId = "dev" | "internal" | "beta" | "production";

export interface ReleaseChannel {
  id: ReleaseChannelId;
  name: string;
  description: string;
  updateFeedUrl: string;
  autoUpdate: boolean;
  forceUpdateEnabled: boolean;
  telemetryLevel: "full" | "standard" | "minimal" | "none";
  audience: string;
  minimumVersionPolicy: MinimumVersionPolicy;
}

export interface MinimumVersionPolicy {
  /** Minimum version allowed to run without force-update */
  minimumVersion: string;
  /** Grace period in days after a new minimum is set */
  gracePeriodDays: number;
  /** What happens when below minimum */
  belowMinimumBehavior: "force-update" | "nag-banner" | "block-launch";
}

export const RELEASE_CHANNELS: readonly ReleaseChannel[] = [
  {
    id: "dev",
    name: "Development",
    description: "Local development builds with hot reload. No update feed.",
    updateFeedUrl: "",
    autoUpdate: false,
    forceUpdateEnabled: false,
    telemetryLevel: "full",
    audience: "Engineers only",
    minimumVersionPolicy: { minimumVersion: "0.0.0", gracePeriodDays: 0, belowMinimumBehavior: "nag-banner" },
  },
  {
    id: "internal",
    name: "Internal",
    description: "Internal testing builds for QA and dogfooding. Frequent updates.",
    updateFeedUrl: "https://releases.sita.app/internal",
    autoUpdate: true,
    forceUpdateEnabled: true,
    telemetryLevel: "full",
    audience: "Internal team and trusted testers",
    minimumVersionPolicy: { minimumVersion: "0.1.0", gracePeriodDays: 1, belowMinimumBehavior: "force-update" },
  },
  {
    id: "beta",
    name: "Beta",
    description: "Pre-release builds for beta program participants. Weekly cadence.",
    updateFeedUrl: "https://releases.sita.app/beta",
    autoUpdate: true,
    forceUpdateEnabled: false,
    telemetryLevel: "standard",
    audience: "Beta program participants",
    minimumVersionPolicy: { minimumVersion: "0.5.0", gracePeriodDays: 7, belowMinimumBehavior: "nag-banner" },
  },
  {
    id: "production",
    name: "Production",
    description: "Stable release for all users. Monthly cadence with patch releases.",
    updateFeedUrl: "https://releases.sita.app/stable",
    autoUpdate: true,
    forceUpdateEnabled: true,
    telemetryLevel: "minimal",
    audience: "All users",
    minimumVersionPolicy: { minimumVersion: "1.0.0", gracePeriodDays: 14, belowMinimumBehavior: "force-update" },
  },
] as const;

/** Get channel configuration by ID */
export function getReleaseChannel(id: ReleaseChannelId): ReleaseChannel {
  const ch = RELEASE_CHANNELS.find((c) => c.id === id);
  if (!ch) throw new Error(`Unknown release channel: ${id}`);
  return ch;
}

/** Determine current channel from environment or build config */
export function getCurrentReleaseChannel(): ReleaseChannelId {
  if (typeof process !== "undefined" && typeof process.env === "object") {
    const env = (process.env as Record<string, string | undefined>).SITA_RELEASE_CHANNEL;
    if (env && ["dev", "internal", "beta", "production"].includes(env)) {
      return env as ReleaseChannelId;
    }
  }
  // Default to production for packaged apps, dev for development
  if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).electron) {
    return "production";
  }
  return "dev";
}

/** Check if current version is below minimum for a channel */
export function isBelowMinimumVersion(currentVersion: string, channel: ReleaseChannelId): boolean {
  const ch = getReleaseChannel(channel);
  return compareVersions(currentVersion, ch.minimumVersionPolicy.minimumVersion) < 0;
}

/** Simple semver comparison: returns -1, 0, or 1 */
function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const va = pa[i] || 0;
    const vb = pb[i] || 0;
    if (va < vb) return -1;
    if (va > vb) return 1;
  }
  return 0;
}
