// ═══════════════════════════════════════════════════════════════
// SITA OS — World Model Service
// Manages the world model lifecycle during setup
// ═══════════════════════════════════════════════════════════════

import type { WorldModel, WorldModelDomainState } from "@/packages/contracts/specialized/setup-data-models";

const DOMAIN_KEYS = [
  "life-rhythm", "household", "work", "money", "communication",
  "goals-stressors", "planning", "stress-slippage",
] as const;

export class WorldModelService {
  private model: WorldModel;

  constructor() {
    this.model = this.createEmpty();
  }

  private createEmpty(): WorldModel {
    return {
      supportDomains: [],
      inferredNeeds: [],
      explicitNeeds: [],
      confidenceByDomain: {},
      sensitivityByDomain: {},
      completionByDomain: {},
      domains: {},
    };
  }

  initializeWorldModel(): WorldModel {
    this.model = this.createEmpty();
    return this.model;
  }

  updateDomain(domainKey: string, responses: Record<string, unknown>): WorldModel {
    const existing = this.model.domains[domainKey] || { responses: {}, confidence: 0, sensitivity: "low", completeness: 0 };
    const merged = { ...existing.responses, ...responses };
    const completeness = Math.min(1, Object.keys(merged).length / 5); // estimate
    const confidence = completeness * 0.8;

    const state: WorldModelDomainState = {
      responses: merged,
      confidence,
      sensitivity: this.inferSensitivity(domainKey),
      completeness,
    };

    this.model.domains[domainKey] = state;
    this.model.confidenceByDomain[domainKey] = confidence;
    this.model.sensitivityByDomain[domainKey] = state.sensitivity;
    this.model.completionByDomain[domainKey] = completeness;

    // Map to named fields
    if (domainKey === "life-rhythm") this.model.lifeRhythm = merged;
    if (domainKey === "household") this.model.householdContext = merged;
    if (domainKey === "work") this.model.workContext = merged;
    if (domainKey === "money") this.model.moneyContext = merged;
    if (domainKey === "communication") this.model.communicationStyle = merged;
    if (domainKey === "goals-stressors") this.model.goalsAndStressors = merged;

    this.model.supportDomains = this.inferSupportDomains(this.model);
    return this.model;
  }

  inferSupportDomains(worldModel: WorldModel): string[] {
    const domains: string[] = [];
    if (worldModel.workContext && Object.keys(worldModel.workContext).length > 0) domains.push("business");
    if (worldModel.moneyContext && Object.keys(worldModel.moneyContext).length > 0) domains.push("finance");
    if (worldModel.householdContext && Object.keys(worldModel.householdContext).length > 0) domains.push("concierge");
    return domains;
  }

  summarizeModel(worldModel: WorldModel): { totalDomains: number; avgConfidence: number; avgCompleteness: number } {
    const domains = Object.keys(worldModel.domains);
    const totalDomains = domains.length;
    const avgConfidence = totalDomains > 0
      ? domains.reduce((sum, d) => sum + (worldModel.confidenceByDomain[d] || 0), 0) / totalDomains
      : 0;
    const avgCompleteness = totalDomains > 0
      ? domains.reduce((sum, d) => sum + (worldModel.completionByDomain[d] || 0), 0) / totalDomains
      : 0;
    return { totalDomains, avgConfidence, avgCompleteness };
  }

  getModel(): WorldModel {
    return this.model;
  }

  loadFrom(data: Partial<WorldModel>): void {
    this.model = { ...this.createEmpty(), ...data };
  }

  private inferSensitivity(domainKey: string): "low" | "medium" | "high" {
    if (["money", "goals-stressors"].includes(domainKey)) return "high";
    if (["household", "work"].includes(domainKey)) return "medium";
    return "low";
  }
}

export const worldModelService = new WorldModelService();
