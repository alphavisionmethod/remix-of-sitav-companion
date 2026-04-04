// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Install, Update, & Recovery Contracts
// Appliance + ISO parallel lanes with strict failure semantics,
// rollback evidence, and recovery outcome manifests
// ═══════════════════════════════════════════════════════════════

// ── Shared Types ────────────────────────────────────────────

export type InstallerLane = "appliance" | "iso";

export type UpdateChannel = "critical-security" | "essential" | "feature" | "beta";

export type RecoveryType =
  | "partition-rollback"
  | "checkpoint-restore"
  | "factory-reset"
  | "network-recovery"
  | "manual-intervention";

// ── Installer Profile (shared shape) ────────────────────────

export interface InstallerProfileBase {
  id: string;
  lane: InstallerLane;
  version: string;
  createdAt: string;
  targetDevice: string;
  partitionScheme: PartitionScheme;
  preflightGates: PreflightGate[];
  rollbackInvariants: RollbackInvariant[];
  postInstallChecks: PostInstallCheck[];
}

// ── Appliance Installer Profile ─────────────────────────────

export interface ApplianceInstallerProfile extends InstallerProfileBase {
  lane: "appliance";
  applianceModel: string;
  firmwareVersion: string;
  oem: string;
  preloadedCapabilities: string[];
  networkProvisioningMode: "dhcp" | "static" | "cloud-enroll";
  updateChannel: UpdateChannel;
  rollbackPartition: string;
}

// ── ISO Installer Profile ───────────────────────────────────

export interface ISOInstallerProfile extends InstallerProfileBase {
  lane: "iso";
  isoVersion: string;
  isoHash: string;
  bootMode: "uefi" | "legacy-bios" | "hybrid";
  secureBootAssumptions: SecureBootAssumption[];
  hardwareSupportTier: HardwareSupportTier;
  firstBootHandoff: FirstBootHandoffContract;
  recoveryPrerequisites: RecoveryPrerequisite[];
}

// ── Partition Scheme ────────────────────────────────────────

export interface PartitionScheme {
  type: "ab-slot" | "single" | "btrfs-snapshot";
  rootPartition: string;
  dataPartition: string;
  recoveryPartition?: string;
  swapPartition?: string;
  encryption: "luks2-tpm" | "luks2-password" | "none";
  verityEnabled: boolean;
}

// ── Preflight Gates ─────────────────────────────────────────

export type PreflightGateType =
  | "disk-space"
  | "power-state"
  | "network-connectivity"
  | "hardware-compatibility"
  | "secure-boot-status"
  | "tpm-status"
  | "existing-data-backup"
  | "partition-integrity"
  | "firmware-version";

export interface PreflightGate {
  type: PreflightGateType;
  required: boolean;
  description: string;
  minimumValue?: string;
  checkScript?: string;
  failureAction: "block" | "warn" | "degrade";
  failureMessage: string;
}

// ── Rollback Invariants ─────────────────────────────────────

export interface RollbackInvariant {
  id: string;
  description: string;
  condition: string;
  verificationMethod: "hash-compare" | "boot-test" | "service-health" | "data-integrity";
  required: boolean;
  failureSeverity: "warning" | "error" | "critical";
}

// ── Post-Install / Post-Update Checks ───────────────────────

export interface PostInstallCheck {
  id: string;
  name: string;
  description: string;
  type: "boot-verify" | "service-health" | "data-migration" | "connectivity" | "attestation";
  timeoutMs: number;
  retryable: boolean;
  maxRetries: number;
}

export interface PostUpdateOutcome {
  id: string;
  updateId: string;
  fromVersion: string;
  toVersion: string;
  channel: UpdateChannel;
  appliedAt: string;
  completedAt?: string;
  outcome: "success" | "partial" | "failed" | "rolled-back";
  checksResults: { checkId: string; passed: boolean; details?: string }[];
  rollbackTriggered: boolean;
  rollbackReason?: string;
  proofId: string;
  rebootRequired: boolean;
  rebootCompleted: boolean;
}

// ── Secure Boot Assumptions (ISO) ───────────────────────────

export interface SecureBootAssumption {
  requirement: string;
  present: boolean;
  fallbackBehavior: "reduced-trust" | "block-install" | "user-warning";
  verificationMethod: string;
}

// ── Hardware Support Tier (ISO) ─────────────────────────────

export type HardwareSupportTier = {
  tier: "certified" | "supported" | "community" | "unsupported";
  cpu: { architecture: string; minCores: number; features: string[] };
  memory: { minGB: number; recommendedGB: number };
  storage: { minGB: number; type: ("nvme" | "ssd" | "hdd")[] };
  tpm: { required: boolean; minVersion: string };
  gpu: { required: boolean; drivers: string[] };
  network: { required: boolean; types: ("ethernet" | "wifi" | "cellular")[] };
};

// ── First Boot Handoff (ISO → SITA Runtime) ─────────────────

export interface FirstBootHandoffContract {
  handoffPoint: string;
  requiredState: {
    partitionsFormatted: boolean;
    bootloaderInstalled: boolean;
    kernelInstalled: boolean;
    initramfsGenerated: boolean;
    networkConfigured: boolean;
    userCreated: boolean;
  };
  handoffData: {
    deviceId: string;
    installationId: string;
    installerVersion: string;
    partitionMap: Record<string, string>;
    networkConfig: Record<string, unknown>;
    hardwareProfile: Record<string, unknown>;
  };
  verificationHash: string;
}

// ── Recovery Prerequisites (ISO) ────────────────────────────

export interface RecoveryPrerequisite {
  id: string;
  description: string;
  type: "media" | "network" | "data" | "firmware" | "key";
  required: boolean;
  available: boolean;
  verificationMethod: string;
  missingAction: "block-recovery" | "partial-recovery" | "user-guidance";
}

// ── Recovery Outcome Manifest ───────────────────────────────

export interface RecoveryOutcomeManifest {
  id: string;
  deviceId: string;
  recoveryType: RecoveryType;
  initiatedAt: string;
  completedAt?: string;
  outcome: "success" | "partial" | "failed" | "aborted";

  /** What was recovered */
  recoveredComponents: {
    component: string;
    status: "restored" | "rebuilt" | "lost" | "skipped";
    dataLoss: boolean;
    details?: string;
  }[];

  /** Rollback evidence chain */
  rollbackEvidence: {
    previousVersion: string;
    restoredVersion: string;
    partitionSwapped: boolean;
    attestationVerified: boolean;
    proofChainIntact: boolean;
    proofIds: string[];
  };

  /** Prerequisites that were checked */
  prerequisiteResults: {
    prerequisiteId: string;
    met: boolean;
    details?: string;
  }[];

  /** Strict failure semantics */
  failures: RecoveryFailure[];

  /** Post-recovery state */
  postRecoveryState: {
    bootable: boolean;
    servicesHealthy: boolean;
    dataIntact: boolean;
    trustBaselineRestored: boolean;
    proofChainContinuity: boolean;
  };

  proofId: string;
  operatorNotified: boolean;
}

export interface RecoveryFailure {
  id: string;
  component: string;
  severity: "warning" | "error" | "critical" | "fatal";
  description: string;
  cause: string;
  missingEvidence: string[];
  missingPrerequisites: string[];
  suggestedAction: string;
  recoverable: boolean;
}

// ── Deterministic Recovery Checks ───────────────────────────

export interface DeterministicRecoveryCheck {
  id: string;
  name: string;
  description: string;
  lane: InstallerLane;
  checkType: "pre-recovery" | "during-recovery" | "post-recovery";
  assertion: string;
  failureSemantics: "block" | "warn-continue" | "abort-with-evidence";
  evidenceRequired: string[];
}

export const DETERMINISTIC_RECOVERY_CHECKS: DeterministicRecoveryCheck[] = [
  { id: "drc-01", name: "Rollback partition integrity", description: "Verify rollback partition is bootable and hash-verified", lane: "appliance", checkType: "pre-recovery", assertion: "dm-verity hash matches known-good snapshot", failureSemantics: "block", evidenceRequired: ["partition-hash", "verity-root-hash"] },
  { id: "drc-02", name: "Recovery media present", description: "ISO recovery media is accessible and verified", lane: "iso", checkType: "pre-recovery", assertion: "ISO hash matches signed manifest", failureSemantics: "block", evidenceRequired: ["iso-hash", "signature-verification"] },
  { id: "drc-03", name: "Data partition backup", description: "User data has been snapshotted before recovery", lane: "appliance", checkType: "pre-recovery", assertion: "btrfs snapshot or tar backup exists", failureSemantics: "warn-continue", evidenceRequired: ["snapshot-id", "backup-timestamp"] },
  { id: "drc-04", name: "Boot attestation post-recovery", description: "Full measured boot attestation passes after recovery", lane: "appliance", checkType: "post-recovery", assertion: "TPM PCR measurements match expected values", failureSemantics: "abort-with-evidence", evidenceRequired: ["pcr-log", "attestation-report"] },
  { id: "drc-05", name: "Proof chain continuity", description: "Lifecycle proof chain is intact after rollback", lane: "appliance", checkType: "post-recovery", assertion: "Chain hash links are unbroken", failureSemantics: "abort-with-evidence", evidenceRequired: ["chain-head-hash", "chain-verification-report"] },
  { id: "drc-06", name: "First-boot handoff integrity", description: "ISO installer handoff data is complete and verified", lane: "iso", checkType: "during-recovery", assertion: "All required handoff fields present and hash-verified", failureSemantics: "block", evidenceRequired: ["handoff-hash", "partition-map"] },
];
