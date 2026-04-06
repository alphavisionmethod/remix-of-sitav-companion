// ═══════════════════════════════════════════════════════════════
// SITA OS — MSA Contract: Device Family Architecture
// Canonical device families, wearable adapters, surface strategy
// ═══════════════════════════════════════════════════════════════

export type DeviceFamilyKey =
  | "phone" | "tablet" | "desktop" | "smartwatch"
  | "ring" | "sports_band" | "headset" | "ambient_display" | "voice_endpoint" | "other";

export type InteractionClass = "active_touch" | "glanceable" | "passive_signal" | "immersive" | "voice_only" | "ambient";

export type SensorClass = "full" | "limited" | "health_only" | "motion_only" | "none";

export type NativeRequirementLevel = "web_only" | "web_preferred" | "native_preferred" | "native_required";

export type DeviceRoleInOS =
  | "primary_execution"   // phone, tablet, desktop
  | "quick_action"        // smartwatch
  | "signal_provider"     // ring, sports_band
  | "immersive_workspace" // headset
  | "ambient_presence"    // ambient_display, voice_endpoint
  ;

export type ConnectionState = "connected" | "disconnected" | "pairing" | "error" | "unknown";

export type TrustClass = "basic" | "trusted" | "approval_capable" | "high_trust" | "restricted";

export type WearablePrimaryRole = "notification_filter" | "micro_action" | "signal_source" | "readiness_indicator" | "context_input";

// ── Device Family Record ──
export interface DeviceFamilyRecord {
  deviceFamilyId: string;
  deviceFamilyKey: DeviceFamilyKey;
  name: string;
  description: string;
  interactionClass: InteractionClass;
  sensorClass: SensorClass;
  trustSupportLevel: TrustClass;
  nativeRequirementLevel: NativeRequirementLevel;
  roleInOS: DeviceRoleInOS;
  createdAt: string;
  updatedAt: string;
}

// ── Connected Device Record ──
export interface ConnectedDeviceRecord {
  connectedDeviceId: string;
  userId: string;
  entityId?: string;
  deviceFamilyId: string;
  providerFamilyId?: string;
  deviceLabel: string;
  deviceModel?: string;
  platform: "ios" | "android" | "watchos" | "wearos" | "web" | "desktop" | "visionos" | "other";
  deviceIdentifier?: string;
  trustLevel: TrustClass;
  connectionState: ConnectionState;
  batteryAwareRoutingEnabled: boolean;
  interruptionEligible: boolean;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}

// ── Device Trust Record ──
export interface DeviceTrustRecord {
  deviceTrustId: string;
  connectedDeviceId: string;
  trustClass: TrustClass;
  biometricCapable: boolean;
  deviceBoundApprovalEnabled: boolean;
  approvalClassesAllowed: string[];
  lastTrustVerificationAt?: string;
  downgradedAt?: string;
  downgradeReason?: string;
  createdAt: string;
}

// ── Presence State Record ──
export interface PresenceStateRecord {
  presenceStateId: string;
  userId: string;
  activeDeviceId?: string;
  activeSurface: string;
  focusState: "available" | "focused" | "dnd" | "meeting" | "away" | "offline";
  interruptionTolerance: "high" | "medium" | "low" | "none";
  currentContextType?: string;
  handoffEligible: boolean;
  sessionState: Record<string, unknown>;
  updatedAt: string;
}

// ── Handoff Session Record ──
export interface HandoffSessionRecord {
  handoffSessionId: string;
  userId: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  sourceSurface: string;
  targetSurface: string;
  contextPayloadRef?: string;
  handoffState: "initiated" | "accepted" | "completed" | "failed" | "expired";
  startedAt: string;
  completedAt?: string;
}

// ── Surface Strategy Matrix ──
export type SurfacePrimacy = "web_first" | "mobile_primary" | "wearable_primary" | "ring_signal" | "native_best" | "cross_surface";

export interface SurfaceStrategyEntry {
  experienceKey: string;
  displayName: string;
  primacy: SurfacePrimacy;
  bestSurfaces: DeviceFamilyKey[];
  description: string;
  nativeRequired: boolean;
}

/** Canonical surface strategy matrix */
export const SURFACE_STRATEGY_MATRIX: SurfaceStrategyEntry[] = [
  // Web-first
  { experienceKey: "boardroom", displayName: "Full Boardroom", primacy: "web_first", bestSurfaces: ["desktop", "tablet"], description: "Deep strategy and decision workspace", nativeRequired: false },
  { experienceKey: "admin_tools", displayName: "Admin & Ops Tools", primacy: "web_first", bestSurfaces: ["desktop"], description: "System configuration and governance", nativeRequired: false },
  { experienceKey: "ai_engineering", displayName: "AI Engineering Center", primacy: "web_first", bestSurfaces: ["desktop"], description: "AI team management and debugging", nativeRequired: false },
  { experienceKey: "workflow_builder", displayName: "Workflow Builder", primacy: "web_first", bestSurfaces: ["desktop", "tablet"], description: "Complex workflow construction", nativeRequired: false },
  { experienceKey: "finance_workspace", displayName: "Investment & Finance", primacy: "web_first", bestSurfaces: ["desktop"], description: "Data-dense financial workspaces", nativeRequired: false },

  // Mobile-primary
  { experienceKey: "approvals", displayName: "Approvals", primacy: "mobile_primary", bestSurfaces: ["phone", "tablet"], description: "Quick approval/deny actions", nativeRequired: false },
  { experienceKey: "alerts", displayName: "Alerts & Triage", primacy: "mobile_primary", bestSurfaces: ["phone"], description: "Alert management and triage", nativeRequired: false },
  { experienceKey: "advisor_chat", displayName: "Advisor Chat", primacy: "mobile_primary", bestSurfaces: ["phone", "tablet"], description: "AI assistant conversations", nativeRequired: false },
  { experienceKey: "daily_pulse", displayName: "Daily Pulse", primacy: "mobile_primary", bestSurfaces: ["phone"], description: "Morning summary and priorities", nativeRequired: false },
  { experienceKey: "quick_capture", displayName: "Quick Capture", primacy: "mobile_primary", bestSurfaces: ["phone"], description: "Fast upload and note capture", nativeRequired: false },

  // Wearable-primary
  { experienceKey: "micro_approvals", displayName: "Micro-Approvals", primacy: "wearable_primary", bestSurfaces: ["smartwatch"], description: "One-tap approve/deny on watch", nativeRequired: true },
  { experienceKey: "urgent_nudges", displayName: "Urgent Nudges", primacy: "wearable_primary", bestSurfaces: ["smartwatch"], description: "Filtered urgent-only haptic alerts", nativeRequired: true },
  { experienceKey: "glance_summary", displayName: "Glance Summary", primacy: "wearable_primary", bestSurfaces: ["smartwatch"], description: "What matters now at a glance", nativeRequired: true },

  // Ring/band signal role
  { experienceKey: "readiness_signal", displayName: "Readiness Signal", primacy: "ring_signal", bestSurfaces: ["ring", "sports_band"], description: "Body/activity signal ingestion", nativeRequired: true },
  { experienceKey: "interruption_context", displayName: "Interruption Context", primacy: "ring_signal", bestSurfaces: ["ring", "sports_band"], description: "Workout/sleep/stress context input", nativeRequired: true },

  // Cross-surface
  { experienceKey: "identity", displayName: "Identity & Auth", primacy: "cross_surface", bestSurfaces: ["phone", "desktop", "tablet", "smartwatch"], description: "Coherent identity everywhere", nativeRequired: false },
  { experienceKey: "memory", displayName: "Memory & Context", primacy: "cross_surface", bestSurfaces: ["phone", "desktop", "tablet"], description: "Continuous memory across surfaces", nativeRequired: false },
  { experienceKey: "notifications", displayName: "Notification Routing", primacy: "cross_surface", bestSurfaces: ["phone", "smartwatch", "desktop"], description: "Calm multi-device notification delivery", nativeRequired: false },
  { experienceKey: "trust_state", displayName: "Trust State", primacy: "cross_surface", bestSurfaces: ["phone", "desktop", "smartwatch"], description: "Trust and proof portability", nativeRequired: false },
];

// ── Device Roadmap Phases ──
export type RoadmapPhaseKey = "phase_0" | "phase_1" | "phase_2" | "phase_3" | "phase_4" | "phase_5" | "phase_6";

export interface DeviceRoadmapPhase {
  phaseKey: RoadmapPhaseKey;
  name: string;
  description: string;
  primaryDevices: DeviceFamilyKey[];
  prerequisites: RoadmapPhaseKey[];
  deliverables: string[];
  status: "active" | "planned" | "future";
}

export const DEVICE_ROADMAP: DeviceRoadmapPhase[] = [
  {
    phaseKey: "phase_0", name: "Web-First Sovereign Truth", description: "Core runtime truth on web shell",
    primaryDevices: ["desktop", "tablet"], prerequisites: [], status: "active",
    deliverables: ["Persistence", "AI runtime", "Connectors", "Provider families", "Dual reality", "Capability contracts", "Notification grammar"],
  },
  {
    phaseKey: "phase_1", name: "Mobile-Ready Architecture", description: "Structural mobile portability without native dependency",
    primaryDevices: ["phone"], prerequisites: ["phase_0"], status: "active",
    deliverables: ["Device-aware sessions", "Notification routing", "Micro-action model", "Trust escalation", "Connected device registry", "Push-ready events"],
  },
  {
    phaseKey: "phase_2", name: "iPhone / Android App Shell", description: "First real mobile surfaces on sovereign runtime",
    primaryDevices: ["phone"], prerequisites: ["phase_1"], status: "planned",
    deliverables: ["Approvals", "Advisor chat", "Command center", "Money snapshots", "Boardroom summaries", "Tasks", "Files", "Quick actions"],
  },
  {
    phaseKey: "phase_3", name: "Apple Watch / Wear OS Layer", description: "Glanceable and micro-action wearable flows",
    primaryDevices: ["smartwatch"], prerequisites: ["phase_2"], status: "planned",
    deliverables: ["Filtered notifications", "Micro-approvals", "Quick deferrals", "Glanceable readiness", "Context-aware escalation"],
  },
  {
    phaseKey: "phase_4", name: "Rings / Bands / Health-Readiness", description: "Body and readiness signal ingestion with consent",
    primaryDevices: ["ring", "sports_band"], prerequisites: ["phase_3"], status: "future",
    deliverables: ["Signal ingestion", "Privacy controls", "Readiness inference", "Interruption routing", "Wellness-aware scheduling"],
  },
  {
    phaseKey: "phase_5", name: "Desktop Command Center", description: "Elite high-productivity command surfaces",
    primaryDevices: ["desktop"], prerequisites: ["phase_1"], status: "planned",
    deliverables: ["Boardroom", "Planning", "Multi-panel execution", "AI engineering", "Strategy rooms"],
  },
  {
    phaseKey: "phase_6", name: "Spatial / AR/VR Environments", description: "Immersive command and decision spaces",
    primaryDevices: ["headset"], prerequisites: ["phase_5"], status: "future",
    deliverables: ["Boardroom room", "Strategy room", "Portfolio simulation", "Graph navigation", "Ambient advisor presence"],
  },
];
