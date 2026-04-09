// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Recommendation Engine
// Recommends advisors based on use mode, world model, trust
// ═══════════════════════════════════════════════════════════════

import type { AdvisorProfile, AdvisorActivation, UseModeProfile, WorldModel, TrustProfile } from "@/packages/contracts/specialized/setup-data-models";

const ADVISOR_CATALOG: Omit<AdvisorActivation, "active" | "activityLevel">[] = [
  { advisorId: "ops-advisor", displayName: "Operations Advisor", domain: "business" },
  { advisorId: "revenue-advisor", displayName: "Revenue Advisor", domain: "business" },
  { advisorId: "finance-advisor", displayName: "Finance Advisor", domain: "finance" },
  { advisorId: "budget-advisor", displayName: "Budget Advisor", domain: "finance" },
  { advisorId: "household-advisor", displayName: "Household Advisor", domain: "concierge" },
  { advisorId: "schedule-advisor", displayName: "Schedule Advisor", domain: "concierge" },
  { advisorId: "wellness-advisor", displayName: "Wellness Advisor", domain: "concierge" },
  { advisorId: "communication-advisor", displayName: "Communication Advisor", domain: "platform" },
];

export class AdvisorRecommendationEngine {
  recommendAdvisors(
    useMode: UseModeProfile,
    worldModel: WorldModel,
    trustProfile: TrustProfile,
  ): AdvisorProfile {
    const domainPriority = useMode.modulePriority;
    const supportDomains = worldModel.supportDomains;

    const activations: AdvisorActivation[] = ADVISOR_CATALOG.map(advisor => {
      const domainRelevant = domainPriority.includes(advisor.domain as any) || supportDomains.includes(advisor.domain);
      const active = domainRelevant;
      const activityLevel = trustProfile.autonomyLevel === "auto" ? "proactive"
        : trustProfile.autonomyLevel === "observe" ? "quiet" : "balanced" as const;

      return { ...advisor, active, activityLevel };
    });

    const priorityMap: Record<string, number> = {};
    const activityLevels: Record<string, "quiet" | "balanced" | "proactive"> = {};
    const surfaceMap: Record<string, string[]> = {};

    activations.forEach((a, i) => {
      priorityMap[a.advisorId] = activations.length - i;
      activityLevels[a.advisorId] = a.activityLevel;
      surfaceMap[a.advisorId] = ["boardroom", "desktop"];
    });

    return {
      activeAdvisors: activations,
      advisorPriorityMap: priorityMap,
      advisorActivityLevels: activityLevels,
      advisorSurfaceMap: surfaceMap,
      samplePreviewSeen: false,
    };
  }
}

export const advisorRecommendationEngine = new AdvisorRecommendationEngine();
