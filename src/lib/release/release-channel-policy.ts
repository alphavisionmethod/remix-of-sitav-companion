// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Channel Policy
// Channel definitions, promotion rules, migration semantics.
// ═══════════════════════════════════════════════════════════════

export type ChannelId = "dev" | "internal" | "beta" | "stable";

export interface ReleaseChannel {
  readonly id: ChannelId;
  readonly label: string;
  readonly audience: string;
  readonly autoUpdateEnabled: boolean;
  readonly requiresSigning: boolean;
  readonly requiresNotarization: boolean;
  readonly retentionDays: number;
  readonly slaTarget: string;
}

export interface ChannelPromotionRule {
  readonly from: ChannelId;
  readonly to: ChannelId;
  readonly conditions: string[];
  readonly approvalRequired: boolean;
  readonly approver: string;
  readonly automatable: boolean;
}

export interface ChannelMigrationSemantics {
  readonly from: ChannelId;
  readonly to: ChannelId;
  readonly direction: "promotion" | "demotion";
  readonly dataMigrationSafe: boolean;
  readonly rollbackSupported: boolean;
  readonly userActionRequired: string;
  readonly operatorActionRequired: string;
  readonly constraints: string[];
}

export const RELEASE_CHANNELS: readonly ReleaseChannel[] = [
  {
    id: "dev",
    label: "Development",
    audience: "Internal engineering only",
    autoUpdateEnabled: true,
    requiresSigning: false,
    requiresNotarization: false,
    retentionDays: 7,
    slaTarget: "Best effort",
  },
  {
    id: "internal",
    label: "Internal Testing",
    audience: "QA, product, and design teams",
    autoUpdateEnabled: true,
    requiresSigning: false,
    requiresNotarization: false,
    retentionDays: 30,
    slaTarget: "Next business day response",
  },
  {
    id: "beta",
    label: "Beta",
    audience: "Selected external testers and early adopters",
    autoUpdateEnabled: true,
    requiresSigning: true,
    requiresNotarization: true,
    retentionDays: 90,
    slaTarget: "4-hour response for P0/P1",
  },
  {
    id: "stable",
    label: "Stable / Production",
    audience: "All customers",
    autoUpdateEnabled: true,
    requiresSigning: true,
    requiresNotarization: true,
    retentionDays: 365,
    slaTarget: "1-hour response for P0, 4-hour for P1",
  },
];

export const CHANNEL_PROMOTION_RULES: readonly ChannelPromotionRule[] = [
  {
    from: "dev",
    to: "internal",
    conditions: ["CI green on all BLOCK gates", "No P0/P1 regressions in dev"],
    approvalRequired: false,
    approver: "Automated",
    automatable: true,
  },
  {
    from: "internal",
    to: "beta",
    conditions: ["All BLOCK + ADVISORY gates green", "QA sign-off", "No open P0/P1 issues", "Signing credentials available for target platforms"],
    approvalRequired: true,
    approver: "Release manager",
    automatable: false,
  },
  {
    from: "beta",
    to: "stable",
    conditions: ["Minimum 72h soak in beta", "Error rate ≤ baseline", "No open P0/P1/P2 issues", "Release health score ≥ 95", "Rollback tested"],
    approvalRequired: true,
    approver: "Release manager + engineering lead",
    automatable: false,
  },
];

export const CHANNEL_MIGRATION_SEMANTICS: readonly ChannelMigrationSemantics[] = [
  {
    from: "dev",
    to: "internal",
    direction: "promotion",
    dataMigrationSafe: true,
    rollbackSupported: true,
    userActionRequired: "None (auto-update)",
    operatorActionRequired: "Approve promotion",
    constraints: [],
  },
  {
    from: "internal",
    to: "beta",
    direction: "promotion",
    dataMigrationSafe: true,
    rollbackSupported: true,
    userActionRequired: "None (auto-update)",
    operatorActionRequired: "Verify signing, approve promotion",
    constraints: ["Signing must be active for darwin/win32 targets"],
  },
  {
    from: "beta",
    to: "stable",
    direction: "promotion",
    dataMigrationSafe: true,
    rollbackSupported: true,
    userActionRequired: "None (auto-update)",
    operatorActionRequired: "Dual-approval required",
    constraints: ["72h soak period enforced", "Rollback drill must have passed"],
  },
  {
    from: "stable",
    to: "beta",
    direction: "demotion",
    dataMigrationSafe: true,
    rollbackSupported: false,
    userActionRequired: "Opt-in via settings change",
    operatorActionRequired: "None",
    constraints: ["User accepts beta terms", "Data format may change"],
  },
  {
    from: "beta",
    to: "dev",
    direction: "demotion",
    dataMigrationSafe: false,
    rollbackSupported: false,
    userActionRequired: "Manual channel switch + data backup",
    operatorActionRequired: "None",
    constraints: ["Data loss possible", "Not recommended for production data"],
  },
];

export function getChannel(id: ChannelId): ReleaseChannel | undefined {
  return RELEASE_CHANNELS.find((c) => c.id === id);
}

export function getPromotionRule(from: ChannelId, to: ChannelId): ChannelPromotionRule | undefined {
  return CHANNEL_PROMOTION_RULES.find((r) => r.from === from && r.to === to);
}

export function getMigrationSemantics(from: ChannelId, to: ChannelId): ChannelMigrationSemantics | undefined {
  return CHANNEL_MIGRATION_SEMANTICS.find((m) => m.from === from && m.to === to);
}