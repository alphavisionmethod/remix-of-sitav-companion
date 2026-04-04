// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Autopilot Service
// Lead scoring, pipeline automation, revenue recovery loops
// ═══════════════════════════════════════════════════════════════

import type { PipelineStage, PlaybookRule, RecoveryLoop, LeadScore, LeadSignal } from "@/packages/contracts/domain-types/revenue-autopilot";

export type { PipelineStage, PlaybookRule, RecoveryLoop, LeadScore, LeadSignal };

export class RevenueAutopilotService {
  private stages: Map<string, PipelineStage> = new Map();
  private playbooks: Map<string, PlaybookRule> = new Map();
  private recoveryLoops: Map<string, RecoveryLoop> = new Map();
  private leadScores: Map<string, LeadScore> = new Map();

  // ── Pipeline ───────────────────────────────────────────────────
  addStage(stage: PipelineStage): void {
    this.stages.set(stage.id, stage);
  }

  getStages(): PipelineStage[] {
    return Array.from(this.stages.values()).sort((a, b) => a.order - b.order);
  }

  getPipelineSummary(): { totalValue: number; stageBreakdown: { name: string; value: number; count: number }[]; avgConversion: number } {
    const stages = this.getStages();
    return {
      totalValue: stages.reduce((s, st) => s + st.totalValue, 0),
      stageBreakdown: stages.map(s => ({ name: s.name, value: s.totalValue, count: s.entryCount })),
      avgConversion: stages.length > 0 ? stages.reduce((s, st) => s + st.conversionRate, 0) / stages.length : 0,
    };
  }

  // ── Playbooks ──────────────────────────────────────────────────
  addPlaybook(rule: PlaybookRule): void {
    this.playbooks.set(rule.id, rule);
  }

  getPlaybooks(enabled?: boolean): PlaybookRule[] {
    let rules = Array.from(this.playbooks.values());
    if (enabled !== undefined) rules = rules.filter(r => r.enabled === enabled);
    return rules.sort((a, b) => b.priority - a.priority);
  }

  triggerPlaybook(ruleId: string): PlaybookRule | null {
    const rule = this.playbooks.get(ruleId);
    if (!rule || !rule.enabled) return null;
    rule.executionCount++;
    rule.lastTriggered = new Date().toISOString();
    rule.updatedAt = new Date().toISOString();
    return rule;
  }

  // ── Recovery Loops ─────────────────────────────────────────────
  createRecoveryLoop(loop: Omit<RecoveryLoop, "id" | "createdAt" | "updatedAt">): RecoveryLoop {
    const full: RecoveryLoop = {
      ...loop,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.recoveryLoops.set(full.id, full);
    return full;
  }

  getActiveLoops(): RecoveryLoop[] {
    return Array.from(this.recoveryLoops.values()).filter(l => l.status === "active");
  }

  getRecoveryStats(): { activeLoops: number; totalRecovered: number; avgRecoveryRate: number } {
    const loops = Array.from(this.recoveryLoops.values());
    const completed = loops.filter(l => l.status === "completed");
    return {
      activeLoops: loops.filter(l => l.status === "active").length,
      totalRecovered: completed.reduce((s, l) => s + l.recoveredValue, 0),
      avgRecoveryRate: completed.length > 0
        ? completed.reduce((s, l) => s + (l.recoveredValue / Math.max(l.originalValue, 1)), 0) / completed.length
        : 0,
    };
  }

  // ── Lead Scoring ───────────────────────────────────────────────
  scoreLeads(leadId: string, signals: LeadSignal[]): LeadScore {
    const totalScore = signals.reduce((s, sig) => s + sig.weight * (typeof sig.value === "number" ? sig.value : 1), 0);
    const normalized = Math.min(100, Math.max(0, totalScore));

    const score: LeadScore = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      tenantId: "",
      leadId,
      score: normalized,
      signals,
      predictedConversion: normalized / 100 * 0.8,
      segment: normalized >= 75 ? "hot" : normalized >= 50 ? "warm" : normalized >= 25 ? "cool" : "cold",
      lastScored: new Date().toISOString(),
    };

    this.leadScores.set(leadId, score);
    return score;
  }

  getLeadScore(leadId: string): LeadScore | null {
    return this.leadScores.get(leadId) ?? null;
  }

  getHotLeads(): LeadScore[] {
    return Array.from(this.leadScores.values()).filter(l => l.segment === "hot").sort((a, b) => b.score - a.score);
  }
}

export function createRevenueAutopilot(): RevenueAutopilotService {
  return new RevenueAutopilotService();
}
