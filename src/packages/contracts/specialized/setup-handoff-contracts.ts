// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Handoff Contracts
// Typed payloads for downstream system handoff after setup
// ═══════════════════════════════════════════════════════════════

import type {
  OwnershipProfile, PrivacyProfile, TrustProfile, AdvisorProfile,
  ConnectionProfile, FirstWinProfile, UseModeProfile, ArrivalSummary,
  WorldModel, SetupDeferredItem, StarterProfile, SecurityBaseline,
  AccessProfile, AutonomyLevel,
} from "./setup-data-models";

// ── Desktop Handoff ─────────────────────────────────────────

export interface DesktopHandoffPayload {
  ownershipProfile: OwnershipProfile;
  useModeProfile: UseModeProfile;
  trustProfile: TrustProfile;
  advisorProfile: AdvisorProfile;
  connectedSystems: string[];
  firstWinProfile: FirstWinProfile;
  arrivalSummary: ArrivalSummary;
  personalizationPreview: DesktopPersonalizationModel;
  setupCompletedAt: string;
}

export interface DesktopPersonalizationModel {
  primaryMode: string;
  activeDomains: string[];
  trustMode: AutonomyLevel;
  activeAdvisorCount: number;
  connectedServiceCount: number;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  locale: string;
  region: string;
}

// ── Boardroom Handoff ───────────────────────────────────────

export interface BoardroomHandoffPayload {
  activeDomains: string[];
  worldModel: WorldModel;
  advisorActivation: AdvisorProfile;
  connectionReadiness: Record<string, "ready" | "partial" | "empty">;
  firstSummarySeed: Record<string, unknown>;
  firstPriorities: string[];
  starterProfile: StarterProfile;
}

// ── Trust Center Handoff ────────────────────────────────────

export interface TrustCenterHandoffPayload {
  trustProfile: TrustProfile;
  privacyProfile: PrivacyProfile;
  approvalPolicies: TrustProfile["approvalRules"];
  proofDefaults: {
    proofModeEnabled: boolean;
    receiptRetention: "30d" | "90d" | "1y" | "forever";
    auditLevel: "minimal" | "standard" | "full";
  };
  securityBaseline: SecurityBaseline;
  accessProfile: AccessProfile;
}

// ── Completion Center Handoff ───────────────────────────────

export interface CompletionCenterHandoffPayload {
  deferredItems: SetupDeferredItem[];
  skippedStages: string[];
  incompleteOptionalItems: string[];
  setupCompletedAt: string;
  completionPercentage: number;
}

// ── Unified Handoff (all downstream consumers) ──────────────

export interface UnifiedSetupHandoff {
  desktop: DesktopHandoffPayload;
  boardroom: BoardroomHandoffPayload;
  trustCenter: TrustCenterHandoffPayload;
  completionCenter: CompletionCenterHandoffPayload;
  version: string;
  generatedAt: string;
}
