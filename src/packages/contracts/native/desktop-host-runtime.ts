// ═══════════════════════════════════════════════════════════════
// SITA OS — Native: Desktop Host Runtime Contract
// Defines what the Electron host owns vs. what the renderer owns
// No policy or execution logic in surfaces
// ═══════════════════════════════════════════════════════════════

// ── Host Capabilities ────────────────────────────────────────
// Native capabilities only the Electron main process can provide

export interface DesktopHostCapabilities {
  fileSystem: FileSystemCapability;
  biometrics: BiometricCapability;
  notifications: NotificationCapability;
  tray: TrayCapability;
  autoUpdate: AutoUpdateCapability;
  deepLink: DeepLinkCapability;
  hardwareProbe: HardwareProbeCapability;
  clipboard: ClipboardCapability;
}

export interface FileSystemCapability {
  available: boolean;
  readAccess: boolean;
  writeAccess: boolean;
  watchSupported: boolean;
  sandboxed: boolean;
  allowedPaths: string[];
  maxFileSizeMB: number;
}

export interface BiometricCapability {
  available: boolean;
  methods: Array<"fingerprint" | "face" | "iris" | "pin">;
  enrolled: boolean;
  fallbackToPassword: boolean;
}

export interface NotificationCapability {
  available: boolean;
  supportsActions: boolean;
  supportsImages: boolean;
  maxVisible: number;
  soundSupported: boolean;
}

export interface TrayCapability {
  available: boolean;
  supportsMenu: boolean;
  supportsBadge: boolean;
  supportsProgress: boolean;
}

export interface AutoUpdateCapability {
  available: boolean;
  channel: "stable" | "beta" | "canary";
  autoDownload: boolean;
  autoInstall: boolean;
  lastCheckedAt?: string;
}

export interface DeepLinkCapability {
  available: boolean;
  registeredProtocols: string[];
  handleInForeground: boolean;
}

export interface HardwareProbeCapability {
  available: boolean;
  tpmAccess: boolean;
  secureEnclaveAccess: boolean;
  gpuAcceleration: boolean;
  displayInfo: boolean;
}

export interface ClipboardCapability {
  available: boolean;
  supportsRichText: boolean;
  supportsImages: boolean;
  supportsFiles: boolean;
  historyEnabled: boolean;
}

// ── Proof Relay ──────────────────────────────────────────────
// How the native host relays proofs to the canonical proof chain

export type ProofRelayMode = "direct" | "batched" | "deferred";

export interface DesktopProofRelay {
  mode: ProofRelayMode;
  batchIntervalMs: number;
  localBufferMaxSize: number;
  localBufferPath: string;
  encryptLocalBuffer: boolean;
  syncOnReconnect: boolean;
  maxRetries: number;
  retryBackoffMs: number;
}

// ── Degraded Modes ───────────────────────────────────────────
// Desktop-specific degraded operation modes

export type DesktopDegradedReason =
  | "offline"
  | "no-cloud"
  | "limited-trust"
  | "low-battery"
  | "disk-full"
  | "gpu-unavailable";

export interface DesktopDegradedMode {
  reason: DesktopDegradedReason;
  active: boolean;
  enteredAt?: string;
  userNotified: boolean;
  affectedCapabilities: string[];
  availableFallbacks: DesktopFallback[];
  autoRecovery: boolean;
  recoveryCheckIntervalMs: number;
}

export interface DesktopFallback {
  capability: string;
  fallbackType: "local-cache" | "reduced-fidelity" | "queue" | "disable";
  description: string;
}

// ── Host Configuration ───────────────────────────────────────
// What the native host owns — renderer must NOT duplicate

export interface DesktopHostConfig {
  hostOwns: HostOwnedDomain[];
  rendererOwns: RendererOwnedDomain[];
  ipcBoundary: IPCBoundaryRule[];
}

export type HostOwnedDomain =
  | "file-system-access"
  | "biometric-auth"
  | "tpm-attestation"
  | "system-notifications"
  | "tray-management"
  | "auto-update"
  | "deep-link-handling"
  | "hardware-probe"
  | "proof-local-buffer"
  | "window-management"
  | "native-clipboard";

export type RendererOwnedDomain =
  | "ui-rendering"
  | "state-management"
  | "routing"
  | "command-composition"
  | "proof-display"
  | "approval-ui"
  | "shell-grammar"
  | "capability-ui";

export interface IPCBoundaryRule {
  channel: string;
  direction: "host-to-renderer" | "renderer-to-host" | "bidirectional";
  payloadContract: string;
  proofRequired: boolean;
  maxPayloadBytes: number;
  rateLimit?: { maxPerSecond: number };
}
