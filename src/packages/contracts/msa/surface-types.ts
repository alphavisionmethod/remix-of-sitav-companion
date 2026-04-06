// ═══════════════════════════════════════════════════════════════
// SITA OS — MSA Contract: Surface Types
// Canonical surface, shell, and readiness definitions
// ═══════════════════════════════════════════════════════════════

export type SurfaceKey = "web" | "mobile_ios" | "mobile_android" | "desktop" | "spatial" | "voice";

export type SurfaceClass = "active" | "planned" | "experimental" | "deprecated";

export type ReadinessStage = "production" | "beta" | "alpha" | "prototyping" | "planned" | "deprecated";

export type ShellType = "WebShell" | "MobileShell" | "DesktopShell" | "SpatialShell" | "VoiceShell";

export type InputMode = "keyboard" | "mouse" | "touch" | "voice" | "gesture" | "gaze" | "controller" | "stylus";

export type OutputMode = "screen" | "haptic" | "spatial_audio" | "3d_space" | "system_tray" | "audio_spoken";

export interface SurfaceTypeRecord {
  id: string;
  surfaceKey: SurfaceKey;
  displayName: string;
  surfaceClass: SurfaceClass;
  interactionModel: string;
  notificationModel: string;
  inputModes: InputMode[];
  outputModes: OutputMode[];
  offlineSupport: boolean;
  readinessStage: ReadinessStage;
}

export interface ShellImplementationRecord {
  id: string;
  surfaceId: string;
  shellType: ShellType;
  version: string;
  status: "production" | "beta" | "alpha" | "planned" | "deprecated";
  technologyStack: string[];
  routeCount: number;
  componentCount: number;
  capabilityCoveragePct: number;
  boundaryViolations: number;
}

export interface SurfaceReadinessRecord {
  id: string;
  surfaceId: string;
  portabilityScore: number;
  contractCoveragePct: number;
  capabilityCoveragePct: number;
  trustPortability: boolean;
  workflowPortability: boolean;
  receiptPortability: boolean;
  blockers: string[];
}

export interface SurfaceConstraintRecord {
  id: string;
  surfaceId: string;
  constraintType: string;
  constraintKey: string;
  constraintValue: Record<string, unknown>;
  enforced: boolean;
  notes?: string;
}

export interface SurfaceLaunchProfile {
  id: string;
  surfaceId: string;
  launchTargetDate?: string;
  readinessScore: number;
  gateResults: Record<string, unknown>;
  blockers: string[];
  launchStatus: "planning" | "development" | "testing" | "staging" | "launched" | "suspended";
}

export interface SurfacePerformanceProfile {
  targetLcpMs?: number;
  targetFidMs?: number;
  targetCls?: number;
  maxBundleSizeKb?: number;
  offlineCapable: boolean;
}
