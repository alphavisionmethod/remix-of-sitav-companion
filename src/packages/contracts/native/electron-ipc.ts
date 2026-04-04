// ═══════════════════════════════════════════════════════════════
// SITA OS — Electron IPC Contract
// Typed channel definitions shared between main and renderer
// ═══════════════════════════════════════════════════════════════

export type ElectronIPCChannel =
  | "system-info"
  | "deep-link"
  | "notifications"
  | "auto-update"
  | "tray-actions"
  | "window-control"
  | "app-version"
  | "trust-attestation"
  | "proof-emit"
  | "capability-query"
  | "degraded-mode"
  | "policy-check";

export interface SystemInfo {
  platform: string;
  arch: string;
  hostname: string;
  cpuCount: number;
  totalMemoryMB: number;
  freeMemoryMB: number;
  osVersion: string;
  electronVersion: string;
  appVersion: string;
}

export interface DeepLinkPayload {
  protocol: string;
  path: string;
  params: Record<string, string>;
}

export interface UpdateStatus {
  available: boolean;
  currentVersion: string;
  latestVersion?: string;
  downloadUrl?: string;
}

export interface TrayAction {
  id: string;
  label: string;
  accelerator?: string;
}

export interface WindowControlAction {
  type: "minimize" | "maximize" | "close" | "fullscreen" | "restore";
}

// IPC API exposed via contextBridge
export interface ElectronBridgeAPI {
  getSystemInfo: () => Promise<SystemInfo>;
  onDeepLink: (callback: (payload: DeepLinkPayload) => void) => () => void;
  sendNotification: (title: string, body: string) => void;
  checkForUpdates: () => Promise<UpdateStatus>;
  windowControl: (action: WindowControlAction["type"]) => void;
  getAppVersion: () => string;
  platform: string;
}

// ── Native Capability Bridge ─────────────────────────────────
// Maps IPC channels to contract-level operations

export interface NativeCapabilityBridge {
  trustAttestation: {
    channel: "trust-attestation";
    request: { nonce: string };
    response: { attestationHash: string; tpmPresent: boolean; secureBootVerified: boolean; trustScore: number };
  };
  proofEmit: {
    channel: "proof-emit";
    request: { receiptType: string; payload: Record<string, unknown> };
    response: { receiptId: string; chainHash: string; accepted: boolean };
  };
  capabilityQuery: {
    channel: "capability-query";
    request: { capabilityId: string };
    response: { available: boolean; degraded: boolean; fallback?: string };
  };
  degradedMode: {
    channel: "degraded-mode";
    request: { query: true };
    response: { active: boolean; reasons: string[]; affectedCapabilities: string[] };
  };
  policyCheck: {
    channel: "policy-check";
    request: { action: string; target: string; trustScore: number };
    response: { allowed: boolean; requiresApproval: boolean; approvalType?: string; reason?: string };
  };
}

// ── Desktop Host Config ──────────────────────────────────────
// What the native host owns vs renderer — no policy/execution in surfaces

export interface DesktopHostConfigIPC {
  hostOwns: string[];
  rendererOwns: string[];
  boundary: Array<{
    channel: ElectronIPCChannel;
    direction: "host-to-renderer" | "renderer-to-host" | "bidirectional";
    proofRequired: boolean;
  }>;
}
