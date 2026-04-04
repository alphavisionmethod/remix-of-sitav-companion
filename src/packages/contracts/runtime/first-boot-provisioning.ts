// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: First-Boot Provisioning Contracts
// Typed contracts for the entire first-boot lifecycle
// ═══════════════════════════════════════════════════════════════

// ── First-Boot Envelope ──────────────────────────────────────
// Wraps the entire first-boot lifecycle as a single auditable unit

export type FirstBootPhase =
  | "hardware-detection"
  | "secure-foundation"
  | "language-region"
  | "network-setup"
  | "device-readiness"
  | "device-ownership"
  | "account-environment"
  | "restore-preview"
  | "access-protection"
  | "privacy-transparency"
  | "quick-identity"
  | "deep-world-modeling"
  | "primary-use-mode"
  | "trust-calibration"
  | "advisor-activation"
  | "first-connections"
  | "first-win-setup"
  | "arrival-prep"
  | "desktop-transition";

export type FirstBootOutcome =
  | "completed"
  | "completed-with-deferred"
  | "interrupted"
  | "failed"
  | "resumed";

export interface FirstBootEnvelope {
  id: string;
  deviceId: string;
  tenantId: string;
  startedAt: string;
  completedAt?: string;
  outcome: FirstBootOutcome;
  currentPhase: FirstBootPhase;
  completedPhases: FirstBootPhase[];
  skippedPhases: FirstBootPhase[];
  deferredItems: DeferredSetupItem[];
  checkpointHash: string;
  resumeToken?: string;
}

export interface DeferredSetupItem {
  id: string;
  phase: FirstBootPhase;
  label: string;
  priority: "critical" | "recommended" | "optional";
  deferredAt: string;
  reminderAfter?: string;
}

// ── Network Contract ─────────────────────────────────────────
// Network discovery, captive portal, connectivity proof

export type NetworkDiscoveryMethod = "scan" | "manual" | "ethernet-auto" | "cellular";
export type CaptivePortalState = "none" | "detected" | "authenticating" | "authenticated" | "failed";

export interface FirstBootNetworkContract {
  discoveryMethod: NetworkDiscoveryMethod;
  availableNetworks: DiscoveredNetwork[];
  selectedNetwork?: string;
  captivePortal: CaptivePortalState;
  connectivityProof: ConnectivityProof;
  offlineModeSelected: boolean;
}

export interface DiscoveredNetwork {
  ssid: string;
  signalStrength: number; // 0-100
  secured: boolean;
  securityType: "open" | "wep" | "wpa2" | "wpa3" | "enterprise";
  known: boolean;
}

export interface ConnectivityProof {
  tested: boolean;
  reachable: boolean;
  latencyMs?: number;
  dnsResolved: boolean;
  cloudReachable: boolean;
  testedAt: string;
}

// ── Trust Contract ───────────────────────────────────────────
// TPM attestation, secure-boot verification, trust baseline

export type TpmStatus = "present-2.0" | "present-legacy" | "absent" | "error";
export type SecureBootStatus = "enabled" | "disabled" | "unsupported" | "error";

export interface FirstBootTrustContract {
  tpmStatus: TpmStatus;
  secureBootStatus: SecureBootStatus;
  bootChainAttestation: BootChainAttestation;
  trustBaseline: TrustBaseline;
  hardwareTrustScore: number; // 0-100
}

export interface BootChainAttestation {
  firmwareVerified: boolean;
  shimVerified: boolean;
  bootloaderVerified: boolean;
  kernelVerified: boolean;
  initramfsVerified: boolean;
  rootfsVerified: boolean;
  pcrMeasurements: Record<string, string>; // PCR index → hash
  eventLogHash: string;
  attestedAt: string;
}

export interface TrustBaseline {
  level: "full-hardware" | "partial-hardware" | "software-only";
  encryptionReady: boolean;
  integrityVerified: boolean;
  recoveryReady: boolean;
  keyDerivationMethod: "tpm-sealed" | "password-derived" | "hybrid";
  baselineHash: string;
  establishedAt: string;
}

// ── Secrets Contract ─────────────────────────────────────────
// Key generation, vault initialization, recovery key derivation

export type VaultState = "uninitialized" | "initializing" | "ready" | "locked" | "error";

export interface FirstBootSecretsContract {
  vaultState: VaultState;
  keyGeneration: KeyGenerationRecord;
  recoveryKey: RecoveryKeyRecord;
  encryptionScope: EncryptionScope;
}

export interface KeyGenerationRecord {
  masterKeyGenerated: boolean;
  derivedKeys: DerivedKeyInfo[];
  entropy: EntropySource;
  generatedAt?: string;
}

export interface DerivedKeyInfo {
  purpose: "disk-encryption" | "data-at-rest" | "communication" | "proof-signing" | "backup";
  algorithm: string;
  keyId: string;
  createdAt: string;
}

export interface EntropySource {
  hardware: boolean; // RDRAND / RDSEED
  tpm: boolean;
  userInput: boolean; // mouse movement, key timing
  combined: boolean;
}

export interface RecoveryKeyRecord {
  generated: boolean;
  method: "printable-key" | "recovery-phrase" | "escrow" | "none";
  backedUp: boolean;
  verifiedByUser: boolean;
  generatedAt?: string;
}

export interface EncryptionScope {
  fullDisk: boolean;
  homePartition: boolean;
  swapEncrypted: boolean;
  tempEncrypted: boolean;
}

// ── Runtime Bootstrap Contract ───────────────────────────────
// Service startup order, capability loading, proof chain init

export type RuntimeBootstrapState =
  | "pre-init"
  | "loading-capabilities"
  | "initializing-proof-chain"
  | "starting-services"
  | "ready"
  | "degraded"
  | "failed";

export interface FirstBootRuntimeBootstrap {
  state: RuntimeBootstrapState;
  serviceStartupOrder: ServiceStartupEntry[];
  capabilitiesLoaded: string[];
  capabilitiesFailed: CapabilityFailure[];
  proofChainInitialized: boolean;
  proofChainGenesisHash: string;
  bootDurationMs: number;
  degradedCapabilities: string[];
}

export interface ServiceStartupEntry {
  serviceId: string;
  order: number;
  dependsOn: string[];
  startedAt?: string;
  durationMs?: number;
  status: "pending" | "starting" | "running" | "failed" | "skipped";
  error?: string;
}

export interface CapabilityFailure {
  capabilityId: string;
  reason: string;
  recoverable: boolean;
  fallback?: string;
}
