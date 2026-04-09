// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Calibration Service
// Computes trust profiles and workflow previews
// ═══════════════════════════════════════════════════════════════

import type {
  TrustProfile, AutonomyLevel, ActionPolicy, ApprovalRule,
  OwnershipProfile, PrivacyProfile, StarterProfile,
} from "@/packages/contracts/specialized/setup-data-models";

export class TrustCalibrationService {
  getRecommendedTrustProfile(context: {
    ownership?: OwnershipProfile;
    privacy?: PrivacyProfile;
    starter?: StarterProfile;
  }): TrustProfile {
    const isManaged = context.ownership?.ownershipType === "managed";
    const isCautious = context.privacy?.privacyPresetSource === "managed" || context.starter?.preferredSupportStyle === "hands-off";

    const autonomyLevel: AutonomyLevel = isManaged ? "suggest" : isCautious ? "suggest" : "ask";
    const defaultPolicy: ActionPolicy = isManaged ? "always-ask" : "suggest";

    return {
      autonomyLevel,
      calendarActionPolicy: defaultPolicy,
      communicationActionPolicy: isManaged ? "always-ask" : "suggest",
      financeActionPolicy: "always-ask", // always cautious with money
      notificationIntensity: isCautious ? "minimal" : "balanced",
      escalationStyle: "batched",
      householdPermissionRules: {},
      businessPermissionRules: {},
      automationBoundaries: {},
      proofModeEnabled: true,
      approvalRules: this.buildDefaultApprovalRules(autonomyLevel),
    };
  }

  buildTrustProfile(input: {
    autonomyLevel: AutonomyLevel;
    calendarPolicy?: ActionPolicy;
    communicationPolicy?: ActionPolicy;
    financePolicy?: ActionPolicy;
    notificationIntensity?: "minimal" | "balanced" | "full";
    escalationStyle?: "immediate" | "batched" | "daily-summary";
    spendingThreshold?: number;
    proofMode?: boolean;
  }): TrustProfile {
    return {
      autonomyLevel: input.autonomyLevel,
      calendarActionPolicy: input.calendarPolicy || "suggest",
      communicationActionPolicy: input.communicationPolicy || "suggest",
      financeActionPolicy: input.financePolicy || "always-ask",
      notificationIntensity: input.notificationIntensity || "balanced",
      escalationStyle: input.escalationStyle || "batched",
      householdPermissionRules: {},
      businessPermissionRules: {},
      automationBoundaries: {},
      proofModeEnabled: input.proofMode ?? true,
      spendingThreshold: input.spendingThreshold,
      approvalRules: this.buildDefaultApprovalRules(input.autonomyLevel),
    };
  }

  previewWorkflowForTrustLevel(level: AutonomyLevel, domain: string): {
    description: string;
    steps: string[];
    approvalRequired: boolean;
  } {
    const workflows: Record<AutonomyLevel, { description: string; steps: string[]; approvalRequired: boolean }> = {
      observe: {
        description: `SITA watches ${domain} activity and reports observations.`,
        steps: ["Monitor activity", "Generate insights", "Present findings", "No action taken"],
        approvalRequired: false,
      },
      suggest: {
        description: `SITA suggests actions for ${domain} but waits for your decision.`,
        steps: ["Analyze context", "Draft recommendation", "Present suggestion", "Wait for approval"],
        approvalRequired: true,
      },
      simulate: {
        description: `SITA simulates ${domain} actions and shows projected outcomes.`,
        steps: ["Analyze context", "Run simulation", "Show projected outcome", "Ask to proceed"],
        approvalRequired: true,
      },
      ask: {
        description: `SITA prepares ${domain} actions and asks before executing.`,
        steps: ["Analyze context", "Prepare action", "Request approval", "Execute on approval"],
        approvalRequired: true,
      },
      auto: {
        description: `SITA handles ${domain} actions automatically with proof receipts.`,
        steps: ["Analyze context", "Execute action", "Generate receipt", "Log proof"],
        approvalRequired: false,
      },
    };
    return workflows[level];
  }

  private buildDefaultApprovalRules(level: AutonomyLevel): ApprovalRule[] {
    if (level === "auto") {
      return [
        { domain: "finance", action: "spend", requiresApproval: true, threshold: 100 },
        { domain: "communication", action: "send-external", requiresApproval: false },
      ];
    }
    return [
      { domain: "finance", action: "spend", requiresApproval: true },
      { domain: "communication", action: "send-external", requiresApproval: true },
      { domain: "calendar", action: "modify", requiresApproval: level !== "ask" },
    ];
  }
}

export const trustCalibrationService = new TrustCalibrationService();
