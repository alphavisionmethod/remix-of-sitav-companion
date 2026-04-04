// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Next Best Action
// ═══════════════════════════════════════════════════════════════

export type NBACategory = "retention" | "expansion" | "engagement" | "support" | "onboarding" | "renewal";

export interface NextBestAction {
  id: string;
  customerId: string;
  category: NBACategory;
  action: string;
  reasoning: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedImpactCents?: number;
  confidence: number;
  suggestedBy: "advisor" | "system" | "playbook";
  dueBy?: string;
}
