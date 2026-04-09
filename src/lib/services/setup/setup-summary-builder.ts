// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Summary Builder
// Builds arrival summary and handoff payloads
// ═══════════════════════════════════════════════════════════════

import type {
  ArrivalSummary, DeferredSetupItem, OwnershipProfile, UseModeProfile,
  TrustProfile, AdvisorProfile, ConnectionProfile, FirstWinProfile,
  PrivacyProfile, WorldModel, StarterProfile, SecurityBaseline, AccessProfile,
} from "@/packages/contracts/specialized/setup-data-models";
import type {
  DesktopHandoffPayload, BoardroomHandoffPayload, TrustCenterHandoffPayload,
  CompletionCenterHandoffPayload, UnifiedSetupHandoff, DesktopPersonalizationModel,
} from "@/packages/contracts/specialized/setup-handoff-contracts";

export interface SetupSummaryContext {
  ownership: OwnershipProfile;
  useMode: UseModeProfile;
  trust: TrustProfile;
  advisors: AdvisorProfile;
  connections: ConnectionProfile;
  firstWin: FirstWinProfile;
  privacy: PrivacyProfile;
  worldModel: WorldModel;
  starter: StarterProfile;
  security: SecurityBaseline;
  access: AccessProfile;
  deferredItems: DeferredSetupItem[];
  skippedStages: string[];
  locale: string;
  region: string;
}

export class SetupSummaryBuilder {
  buildArrivalSummary(ctx: SetupSummaryContext): ArrivalSummary {
    return {
      activeMode: ctx.useMode.selectedMode,
      activeAdvisors: ctx.advisors.activeAdvisors.filter(a => a.active).map(a => a.advisorId),
      trustMode: ctx.trust.autonomyLevel,
      connectedSystems: ctx.connections.connectedServices.filter(s => s.status === "connected").map(s => s.displayName),
      preparedWorkflow: ctx.firstWin.selectedWin,
      privacyBaselineSummary: this.summarizePrivacy(ctx.privacy),
      deferredItems: ctx.deferredItems,
      desktopPreviewModel: {
        mode: ctx.useMode.selectedMode,
        advisorCount: ctx.advisors.activeAdvisors.filter(a => a.active).length,
        connectedCount: ctx.connections.connectedServices.filter(s => s.status === "connected").length,
      },
      welcomePriorities: this.buildWelcomePriorities(ctx),
    };
  }

  buildDesktopHandoff(ctx: SetupSummaryContext): DesktopHandoffPayload {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night" as const;

    const personalization: DesktopPersonalizationModel = {
      primaryMode: ctx.useMode.selectedMode,
      activeDomains: ctx.useMode.modulePriority,
      trustMode: ctx.trust.autonomyLevel,
      activeAdvisorCount: ctx.advisors.activeAdvisors.filter(a => a.active).length,
      connectedServiceCount: ctx.connections.connectedServices.filter(s => s.status === "connected").length,
      timeOfDay,
      locale: ctx.locale,
      region: ctx.region,
    };

    return {
      ownershipProfile: ctx.ownership,
      useModeProfile: ctx.useMode,
      trustProfile: ctx.trust,
      advisorProfile: ctx.advisors,
      connectedSystems: ctx.connections.connectedServices.filter(s => s.status === "connected").map(s => s.serviceId),
      firstWinProfile: ctx.firstWin,
      arrivalSummary: this.buildArrivalSummary(ctx),
      personalizationPreview: personalization,
      setupCompletedAt: new Date().toISOString(),
    };
  }

  buildBoardroomHandoff(ctx: SetupSummaryContext): BoardroomHandoffPayload {
    return {
      activeDomains: ctx.useMode.modulePriority,
      worldModel: ctx.worldModel,
      advisorActivation: ctx.advisors,
      connectionReadiness: ctx.connections.importedDataReadiness,
      firstSummarySeed: ctx.firstWin.boardroomSeed || {},
      firstPriorities: this.buildWelcomePriorities(ctx),
      starterProfile: ctx.starter,
    };
  }

  buildTrustCenterHandoff(ctx: SetupSummaryContext): TrustCenterHandoffPayload {
    return {
      trustProfile: ctx.trust,
      privacyProfile: ctx.privacy,
      approvalPolicies: ctx.trust.approvalRules,
      proofDefaults: {
        proofModeEnabled: ctx.trust.proofModeEnabled,
        receiptRetention: "90d",
        auditLevel: "standard",
      },
      securityBaseline: ctx.security,
      accessProfile: ctx.access,
    };
  }

  buildCompletionCenterHandoff(ctx: SetupSummaryContext): CompletionCenterHandoffPayload {
    return {
      deferredItems: ctx.deferredItems,
      skippedStages: ctx.skippedStages,
      incompleteOptionalItems: ctx.deferredItems.filter(d => d.urgency === "low").map(d => d.itemId),
      setupCompletedAt: new Date().toISOString(),
      completionPercentage: 100 - (ctx.deferredItems.length * 3),
    };
  }

  buildUnifiedHandoff(ctx: SetupSummaryContext): UnifiedSetupHandoff {
    return {
      desktop: this.buildDesktopHandoff(ctx),
      boardroom: this.buildBoardroomHandoff(ctx),
      trustCenter: this.buildTrustCenterHandoff(ctx),
      completionCenter: this.buildCompletionCenterHandoff(ctx),
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
    };
  }

  private summarizePrivacy(privacy: PrivacyProfile): string {
    const levels = [privacy.calendarAwareness, privacy.communicationAwareness, privacy.fileAwareness, privacy.moneyAwareness];
    const fullCount = levels.filter(l => l === "full").length;
    if (fullCount === levels.length) return "Full awareness enabled across all domains";
    if (fullCount > 0) return `Awareness enabled for ${fullCount} of ${levels.length} domains`;
    return "Minimal awareness — privacy-first mode";
  }

  private buildWelcomePriorities(ctx: SetupSummaryContext): string[] {
    const priorities: string[] = [];
    if (ctx.firstWin.selectedWin) priorities.push(`First win: ${ctx.firstWin.selectedWin}`);
    if (ctx.connections.connectedServices.length > 0) priorities.push("Review connected service insights");
    if (ctx.deferredItems.length > 0) priorities.push("Complete deferred setup items");
    priorities.push("Explore your environment");
    return priorities;
  }
}

export const setupSummaryBuilder = new SetupSummaryBuilder();
