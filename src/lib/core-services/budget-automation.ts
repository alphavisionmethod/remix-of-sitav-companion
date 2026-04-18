// ═══════════════════════════════════════════════════════════════
// SITA OS — Budget Automation Service
// Automated budget monitoring, alerts, rebalancing, categorization,
// spending rules, and AI-powered recommendations
// Canonical contracts: AlertSeverity from contracts/specialized
// ═══════════════════════════════════════════════════════════════

import type { AlertSeverity as CanonicalAlertSeverity } from "@/packages/contracts/specialized/observability-metric-contracts";

export type { CanonicalAlertSeverity };

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertType = "over-budget" | "approaching-limit" | "unusual-spend" | "recurring-increase" | "savings-opportunity" | "category-drift";
export type AutoActionType = "pause-spending" | "reallocate" | "notify" | "escalate" | "auto-save" | "reduce-allocation";

export interface BudgetAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  category: string;
  message: string;
  currentSpend: number;
  budgetLimit: number;
  percentUsed: number;
  suggestedAction: string;
  autoActionTaken?: AutoActionType;
  acknowledged: boolean;
  createdAt: number;
}

export interface SpendingRule {
  id: string;
  name: string;
  category: string;
  condition: "exceeds" | "approaches" | "unusual-spike" | "recurring-increase";
  threshold: number;
  action: AutoActionType;
  enabled: boolean;
  lastTriggered?: number;
  triggerCount: number;
}

export interface BudgetRebalanceProposal {
  id: string;
  fromCategory: string;
  toCategory: string;
  amount: number;
  reason: string;
  confidence: number;
  impact: string;
  status: "proposed" | "approved" | "rejected" | "applied";
  createdAt: number;
}

export interface AutoSaveRule {
  id: string;
  name: string;
  sourceCategory: string;
  targetReserve: string;
  trigger: "surplus-detected" | "end-of-period" | "under-budget" | "round-up";
  amount: number | "surplus";
  enabled: boolean;
  totalSaved: number;
  lastExecuted?: number;
}

export interface CategoryPattern {
  category: string;
  avgMonthly: number;
  trend: "increasing" | "decreasing" | "stable" | "volatile";
  trendPct: number;
  seasonalPeak?: string;
  anomalyScore: number;
}

export interface BudgetAutomationSummary {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  rulesEnabled: number;
  autoActionsTaken: number;
  proposalsPending: number;
  totalAutoSaved: number;
  categoriesMonitored: number;
  healthScore: number;
}

// ── Budget Automation Service ───────────────────────────────────

export class BudgetAutomationService {
  private alerts: BudgetAlert[] = [];
  private rules: SpendingRule[] = [];
  private proposals: BudgetRebalanceProposal[] = [];
  private autoSaveRules: AutoSaveRule[] = [];
  private patterns: CategoryPattern[] = [];
  private autoActionLog: { action: AutoActionType; category: string; timestamp: number; details: string }[] = [];

  constructor() {
    this.initializeDefaultRules();
    this.initializeAutoSaveRules();
    this.initializePatterns();
  }

  // ── Budget Monitoring ─────────────────────────────────────────

  evaluateBudgets(budgets: { category: string; allocated: number; spent: number; period: string }[]): BudgetAlert[] {
    const newAlerts: BudgetAlert[] = [];

    for (const budget of budgets) {
      const pct = budget.allocated > 0 ? (budget.spent / budget.allocated) * 100 : 0;

      // Check spending rules
      for (const rule of this.rules.filter(r => r.enabled)) {
        if (rule.category !== "*" && rule.category !== budget.category) continue;

        let triggered = false;
        if (rule.condition === "exceeds" && pct > rule.threshold) triggered = true;
        if (rule.condition === "approaches" && pct > rule.threshold && pct <= 100) triggered = true;

        if (triggered) {
          const alert = this.createAlert(budget, pct, rule);
          newAlerts.push(alert);

          // Execute auto-action
          if (rule.action !== "notify") {
            this.executeAutoAction(rule.action, budget.category, budget);
            alert.autoActionTaken = rule.action;
          }

          rule.lastTriggered = Date.now();
          rule.triggerCount++;
        }
      }

      // Check for unusual spending patterns
      const pattern = this.patterns.find(p => p.category === budget.category);
      if (pattern && pattern.anomalyScore > 0.7 && budget.spent > pattern.avgMonthly * 1.5) {
        newAlerts.push({
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
          type: "unusual-spend",
          severity: "warning",
          category: budget.category,
          message: `Unusual spending in ${budget.category}: $${budget.spent.toLocaleString()} vs avg $${pattern.avgMonthly.toLocaleString()}`,
          currentSpend: budget.spent,
          budgetLimit: budget.allocated,
          percentUsed: pct,
          suggestedAction: "Review recent transactions for accuracy",
          acknowledged: false,
          createdAt: Date.now(),
        });
      }
    }

    this.alerts.push(...newAlerts);
    return newAlerts;
  }

  // ── Auto Rebalance ────────────────────────────────────────────

  generateRebalanceProposals(budgets: { category: string; allocated: number; spent: number }[]): BudgetRebalanceProposal[] {
    const proposals: BudgetRebalanceProposal[] = [];
    const overBudget = budgets.filter(b => b.spent > b.allocated * 0.95);
    const underBudget = budgets.filter(b => b.spent < b.allocated * 0.6 && b.allocated > 0);

    for (const over of overBudget) {
      const surplus = underBudget.find(u => (u.allocated - u.spent) >= (over.spent - over.allocated) * 0.5);
      if (surplus) {
        const amount = Math.min(surplus.allocated - surplus.spent, over.spent - over.allocated) * 0.7;
        if (amount > 50) {
          proposals.push({
            id: `rbl-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
            fromCategory: surplus.category,
            toCategory: over.category,
            amount: Math.round(amount),
            reason: `${over.category} is at ${Math.round((over.spent / over.allocated) * 100)}% utilization while ${surplus.category} is only at ${Math.round((surplus.spent / surplus.allocated) * 100)}%`,
            confidence: 0.8,
            impact: `Relieves ${over.category} pressure by $${Math.round(amount).toLocaleString()}`,
            status: "proposed",
            createdAt: Date.now(),
          });
        }
      }
    }

    this.proposals.push(...proposals);
    return proposals;
  }

  approveProposal(proposalId: string): BudgetRebalanceProposal | null {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal || proposal.status !== "proposed") return null;
    proposal.status = "approved";
    this.logAutoAction("reallocate", proposal.toCategory, `Approved rebalance: $${proposal.amount} from ${proposal.fromCategory} to ${proposal.toCategory}`);
    return proposal;
  }

  rejectProposal(proposalId: string): BudgetRebalanceProposal | null {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal || proposal.status !== "proposed") return null;
    proposal.status = "rejected";
    return proposal;
  }

  // ── Auto-Save ─────────────────────────────────────────────────

  executeAutoSave(budgets: { category: string; allocated: number; spent: number }[]): { ruleId: string; amount: number; targetReserve: string }[] {
    const executed: { ruleId: string; amount: number; targetReserve: string }[] = [];

    for (const rule of this.autoSaveRules.filter(r => r.enabled)) {
      const budget = budgets.find(b => b.category === rule.sourceCategory);
      if (!budget) continue;

      let saveAmount = 0;
      if (rule.trigger === "under-budget" && budget.spent < budget.allocated * 0.85) {
        saveAmount = typeof rule.amount === "number" ? rule.amount : (budget.allocated - budget.spent) * 0.5;
      } else if (rule.trigger === "surplus-detected" && budget.spent < budget.allocated * 0.7) {
        saveAmount = (budget.allocated - budget.spent) * 0.3;
      }

      if (saveAmount > 10) {
        rule.totalSaved += saveAmount;
        rule.lastExecuted = Date.now();
        executed.push({ ruleId: rule.id, amount: Math.round(saveAmount), targetReserve: rule.targetReserve });
        this.logAutoAction("auto-save", rule.sourceCategory, `Auto-saved $${Math.round(saveAmount)} to ${rule.targetReserve}`);
      }
    }

    return executed;
  }

  // ── Rules Management ──────────────────────────────────────────

  getRules(): SpendingRule[] { return this.rules; }
  getAutoSaveRules(): AutoSaveRule[] { return this.autoSaveRules; }

  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) rule.enabled = enabled;
  }

  toggleAutoSaveRule(ruleId: string, enabled: boolean): void {
    const rule = this.autoSaveRules.find(r => r.id === ruleId);
    if (rule) rule.enabled = enabled;
  }

  addRule(rule: Omit<SpendingRule, "id" | "triggerCount">): SpendingRule {
    const newRule: SpendingRule = { ...rule, id: `rule-${Date.now()}`, triggerCount: 0 };
    this.rules.push(newRule);
    return newRule;
  }

  // ── Alerts ────────────────────────────────────────────────────

  getAlerts(unacknowledgedOnly = false): BudgetAlert[] {
    return unacknowledgedOnly ? this.alerts.filter(a => !a.acknowledged) : this.alerts;
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) alert.acknowledged = true;
  }

  getProposals(status?: BudgetRebalanceProposal["status"]): BudgetRebalanceProposal[] {
    return status ? this.proposals.filter(p => p.status === status) : this.proposals;
  }

  getPatterns(): CategoryPattern[] { return this.patterns; }

  // ── Summary ───────────────────────────────────────────────────

  getSummary(): BudgetAutomationSummary {
    return {
      totalAlerts: this.alerts.length,
      activeAlerts: this.alerts.filter(a => !a.acknowledged).length,
      criticalAlerts: this.alerts.filter(a => a.severity === "critical" && !a.acknowledged).length,
      rulesEnabled: this.rules.filter(r => r.enabled).length,
      autoActionsTaken: this.autoActionLog.length,
      proposalsPending: this.proposals.filter(p => p.status === "proposed").length,
      totalAutoSaved: this.autoSaveRules.reduce((s, r) => s + r.totalSaved, 0),
      categoriesMonitored: this.patterns.length,
      healthScore: this.computeHealthScore(),
    };
  }

  getHealth(): { status: "healthy"; alerts: number; rules: number } {
    return { status: "healthy", alerts: this.alerts.length, rules: this.rules.length };
  }

  // ── Private ───────────────────────────────────────────────────

  private createAlert(budget: { category: string; allocated: number; spent: number }, pct: number, rule: SpendingRule): BudgetAlert {
    const severity: AlertSeverity = pct > 120 ? "critical" : pct > 100 ? "warning" : "info";
    const type: AlertType = pct > 100 ? "over-budget" : "approaching-limit";
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
      type, severity,
      category: budget.category,
      message: `${budget.category}: ${pct.toFixed(0)}% of budget used ($${budget.spent.toLocaleString()} / $${budget.allocated.toLocaleString()})`,
      currentSpend: budget.spent,
      budgetLimit: budget.allocated,
      percentUsed: pct,
      suggestedAction: pct > 100 ? `Reduce ${budget.category} spending or reallocate from surplus categories` : `Monitor ${budget.category} — approaching limit`,
      acknowledged: false,
      createdAt: Date.now(),
    };
  }

  private executeAutoAction(action: AutoActionType, category: string, budget: { allocated: number; spent: number }): void {
    this.logAutoAction(action, category, `Auto-action triggered: ${action} for ${category} at ${Math.round((budget.spent / budget.allocated) * 100)}% utilization`);
  }

  private logAutoAction(action: AutoActionType, category: string, details: string): void {
    this.autoActionLog.push({ action, category, timestamp: Date.now(), details });
  }

  private computeHealthScore(): number {
    const criticals = this.alerts.filter(a => a.severity === "critical" && !a.acknowledged).length;
    const warnings = this.alerts.filter(a => a.severity === "warning" && !a.acknowledged).length;
    return Math.max(0, 100 - criticals * 25 - warnings * 10);
  }

  private initializeDefaultRules(): void {
    this.rules = [
      { id: "rule-over-100", name: "Over Budget Alert", category: "*", condition: "exceeds", threshold: 100, action: "notify", enabled: true, triggerCount: 0 },
      { id: "rule-over-120", name: "Critical Overspend", category: "*", condition: "exceeds", threshold: 120, action: "escalate", enabled: true, triggerCount: 0 },
      { id: "rule-approach-85", name: "Approaching Limit", category: "*", condition: "approaches", threshold: 85, action: "notify", enabled: true, triggerCount: 0 },
      { id: "rule-food-over", name: "Food Budget Guard", category: "Food & Dining", condition: "exceeds", threshold: 100, action: "pause-spending", enabled: true, triggerCount: 0 },
      { id: "rule-subs-spike", name: "Subscription Spike", category: "Subscriptions", condition: "exceeds", threshold: 110, action: "escalate", enabled: true, triggerCount: 0 },
      { id: "rule-entertainment", name: "Entertainment Cap", category: "Entertainment", condition: "exceeds", threshold: 100, action: "notify", enabled: true, triggerCount: 0 },
    ];
  }

  private initializeAutoSaveRules(): void {
    this.autoSaveRules = [
      { id: "as-surplus", name: "Surplus Sweep", sourceCategory: "Entertainment", targetReserve: "Emergency Fund", trigger: "surplus-detected", amount: "surplus", enabled: true, totalSaved: 240 },
      { id: "as-transport", name: "Transport Savings", sourceCategory: "Transportation", targetReserve: "Growth Fund", trigger: "under-budget", amount: 50, enabled: true, totalSaved: 160 },
      { id: "as-eom", name: "End of Month Sweep", sourceCategory: "Food & Dining", targetReserve: "Emergency Fund", trigger: "under-budget", amount: "surplus", enabled: false, totalSaved: 0 },
    ];
  }

  private initializePatterns(): void {
    this.patterns = [
      { category: "Housing", avgMonthly: 2450, trend: "stable", trendPct: 0.5, anomalyScore: 0.1 },
      { category: "Food & Dining", avgMonthly: 1180, trend: "increasing", trendPct: 5.2, seasonalPeak: "December", anomalyScore: 0.4 },
      { category: "Transportation", avgMonthly: 680, trend: "decreasing", trendPct: -3.1, anomalyScore: 0.2 },
      { category: "Subscriptions", avgMonthly: 340, trend: "increasing", trendPct: 8.5, anomalyScore: 0.7 },
      { category: "Entertainment", avgMonthly: 350, trend: "volatile", trendPct: 12.3, seasonalPeak: "Summer", anomalyScore: 0.6 },
      { category: "Savings", avgMonthly: 2000, trend: "stable", trendPct: 0, anomalyScore: 0.0 },
      { category: "Utilities", avgMonthly: 280, trend: "stable", trendPct: 1.2, seasonalPeak: "August", anomalyScore: 0.15 },
      { category: "Insurance", avgMonthly: 450, trend: "stable", trendPct: 2.0, anomalyScore: 0.05 },
    ];
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createBudgetAutomation(): BudgetAutomationService {
  return new BudgetAutomationService();
}
