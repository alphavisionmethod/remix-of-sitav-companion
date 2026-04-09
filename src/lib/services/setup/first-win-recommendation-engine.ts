// ═══════════════════════════════════════════════════════════════
// SITA OS — First Win Recommendation Engine
// Generates personalized first-win experiences
// ═══════════════════════════════════════════════════════════════

import type {
  FirstWinProfile, FirstWinOption, UseModeProfile, WorldModel,
  TrustProfile, ConnectionProfile, StarterProfile,
} from "@/packages/contracts/specialized/setup-data-models";
import type { DomainId } from "@/packages/contracts/_contract-scaffold";

export class FirstWinRecommendationEngine {
  recommendFirstWins(context: {
    useMode: UseModeProfile;
    worldModel: WorldModel;
    trustProfile: TrustProfile;
    connections: ConnectionProfile;
    starter?: StarterProfile;
  }): FirstWinProfile {
    const options: FirstWinOption[] = [];
    const mode = context.useMode.selectedMode;
    const hasCalendar = context.connections.connectedServices.some(s => s.serviceType === "calendar");
    const hasEmail = context.connections.connectedServices.some(s => s.serviceType === "email");
    const hasCRM = context.connections.connectedServices.some(s => s.serviceType === "crm");
    const hasBank = context.connections.connectedServices.some(s => s.serviceType === "bank");

    if (hasCalendar) {
      options.push({
        id: "daily-brief",
        label: "Your First Daily Brief",
        description: "SITA prepares a personalized summary of your day",
        domain: "platform" as DomainId,
        confidence: 0.9,
        reason: "Calendar connected — your schedule is ready to brief",
        preparedArtifacts: ["daily-summary", "priorities-list"],
      });
    }

    if ((mode === "business" || mode === "full") && hasCRM) {
      options.push({
        id: "pipeline-snapshot",
        label: "Pipeline Health Check",
        description: "SITA analyzes your revenue pipeline and surfaces risks",
        domain: "business" as DomainId,
        confidence: 0.85,
        reason: "CRM connected — pipeline data available for analysis",
        preparedArtifacts: ["pipeline-report", "at-risk-list"],
      });
    }

    if ((mode === "money" || mode === "full") && hasBank) {
      options.push({
        id: "money-clarity",
        label: "Money Clarity Snapshot",
        description: "See your upcoming bills, cash position, and obligations",
        domain: "finance" as DomainId,
        confidence: 0.85,
        reason: "Bank connected — financial data ready",
        preparedArtifacts: ["cash-position", "bills-calendar"],
      });
    }

    if (hasEmail) {
      options.push({
        id: "followup-queue",
        label: "Follow-Up Detection",
        description: "SITA finds messages that need your response",
        domain: "platform" as DomainId,
        confidence: 0.8,
        reason: "Email connected — follow-up patterns detectable",
        preparedArtifacts: ["followup-list"],
      });
    }

    // Fallback if no connections
    if (options.length === 0) {
      options.push({
        id: "environment-tour",
        label: "Guided Environment Tour",
        description: "Explore what SITA can do for you with a personalized walkthrough",
        domain: "platform" as DomainId,
        confidence: 0.7,
        reason: "Let's explore your new environment together",
        preparedArtifacts: ["tour-sequence"],
      });
    }

    const best = options.sort((a, b) => b.confidence - a.confidence)[0];

    return {
      recommendedWins: options,
      selectedWin: best?.id,
      selectionReason: best?.reason,
      preparedArtifacts: best?.preparedArtifacts || [],
      confidenceScore: best?.confidence || 0,
      visibleDesktopModule: best?.domain,
      boardroomSeed: { firstWinId: best?.id, domain: best?.domain },
    };
  }

  prepareSelectedFirstWin(selection: string, context: Record<string, unknown>): {
    workflowId: string;
    artifacts: string[];
    readyForDesktop: boolean;
  } {
    return {
      workflowId: `first-win-${selection}`,
      artifacts: [`${selection}-summary`, `${selection}-actions`],
      readyForDesktop: true,
    };
  }
}

export const firstWinRecommendationEngine = new FirstWinRecommendationEngine();
