// ═══════════════════════════════════════════════════════════════
// SITA OS — Playbook Simulation Engine
// Pure function that walks a PlaybookDraft through mock customers
// producing per-step outcomes for preview before activation.
// ═══════════════════════════════════════════════════════════════

import type { AutoActionType } from "./autopilot-engine";

// ── Types ────────────────────────────────────────────────────────

export interface MockCustomer {
  id: string;
  name: string;
  healthScore: number;
  ltv: number;
  segment: string;
  daysOverdue: number;
  lastContactDays: number;
  dealValue: number;
}

export interface StepOutcome {
  stepId: string;
  stepIndex: number;
  stepName: string;
  stepType: "action" | "condition" | "delay" | "gate";
  action?: AutoActionType;
  customersAffected: MockCustomer[];
  customersFiltered: MockCustomer[];
  predictedResponseRate: number;
  revenueDelta: number;
  healthDelta: number;
  narrative: string;
  delayLabel?: string;
  branchResults?: { label: string; customers: MockCustomer[] }[];
}

export interface SimulationResult {
  steps: StepOutcome[];
  totalReach: number;
  expectedRevenue: number;
  avgHealthImprovement: number;
  timelineDays: number;
  conversionRate: number;
}

// ── Shared builder types (mirrored from PlaybookBuilder) ─────────

interface BuilderCondition {
  id: string;
  field: string;
  operator: "gt" | "lt" | "eq" | "contains" | "between" | "exists" | "not_eq";
  value: string;
}

interface BuilderStep {
  id: string;
  type: "action" | "condition" | "delay" | "gate";
  action?: AutoActionType;
  name: string;
  description: string;
  config: Record<string, string>;
  delay?: string;
  approvalRequired: boolean;
  enabled: boolean;
  conditions: BuilderCondition[];
  branches?: { label: string; steps: BuilderStep[] }[];
}

interface BuilderTrigger {
  type: "event" | "schedule" | "threshold" | "manual";
  event?: string;
  schedule?: string;
  threshold?: { field: string; operator: string; value: string };
}

export interface PlaybookDraftSim {
  id: string;
  name: string;
  description: string;
  category: "recovery" | "growth" | "retention" | "efficiency";
  trigger: BuilderTrigger;
  steps: BuilderStep[];
  createdAt: number;
  updatedAt: number;
}

// ── Mock customer pool ───────────────────────────────────────────

export const CUSTOMERS: MockCustomer[] = [
  { id: "MC-1", name: "Horizon Media", healthScore: 32, ltv: 18400, segment: "enterprise", daysOverdue: 22, lastContactDays: 15, dealValue: 4800 },
  { id: "MC-2", name: "Petal & Bloom", healthScore: 58, ltv: 6200, segment: "smb", daysOverdue: 8, lastContactDays: 5, dealValue: 1200 },
  { id: "MC-3", name: "Cascade Labs", healthScore: 75, ltv: 42000, segment: "enterprise", daysOverdue: 0, lastContactDays: 2, dealValue: 9600 },
  { id: "MC-4", name: "Juniper & Co", healthScore: 41, ltv: 11500, segment: "mid-market", daysOverdue: 35, lastContactDays: 30, dealValue: 3200 },
  { id: "MC-5", name: "RedThread IO", healthScore: 22, ltv: 8900, segment: "smb", daysOverdue: 45, lastContactDays: 42, dealValue: 2400 },
];

// ── Condition evaluator ──────────────────────────────────────────

const getField = (c: MockCustomer, field: string): number | string => {
  const map: Record<string, number | string> = {
    "customer.ltv": c.ltv,
    "customer.health_score": c.healthScore,
    "customer.segment": c.segment,
    "customer.last_contact_days": c.lastContactDays,
    "invoice.amount": c.dealValue,
    "invoice.days_overdue": c.daysOverdue,
    "lead.score": c.healthScore,
    "deal.value": c.dealValue,
  };
  return map[field] ?? 0;
};

const evaluateCondition = (c: MockCustomer, cond: BuilderCondition): boolean => {
  const val = getField(c, cond.field);
  const target = parseFloat(cond.value) || 0;
  switch (cond.operator) {
    case "gt": return typeof val === "number" && val > target;
    case "lt": return typeof val === "number" && val < target;
    case "eq": return String(val) === cond.value;
    case "not_eq": return String(val) !== cond.value;
    case "contains": return String(val).toLowerCase().includes(cond.value.toLowerCase());
    case "exists": return val !== 0 && val !== "";
    default: return true;
  }
};

const evaluateAllConditions = (c: MockCustomer, conditions: BuilderCondition[]): boolean =>
  conditions.every(cond => evaluateCondition(c, cond));

// ── Response rate heuristics ─────────────────────────────────────

const ACTION_RESPONSE_RATES: Record<string, number> = {
  email: 0.35, sms: 0.48, call: 0.62, task: 1.0,
  escalation: 0.85, discount: 0.55, "follow-up": 0.40, upsell: 0.25,
};

// ── Delay parser ─────────────────────────────────────────────────

const parseDays = (delay?: string): number => {
  if (!delay) return 0;
  const match = delay.match(/(\d+)\s*(hour|day|week)/i);
  if (!match) return 1;
  const n = parseInt(match[1]);
  if (match[2].startsWith("hour")) return n / 24;
  if (match[2].startsWith("week")) return n * 7;
  return n;
};

// ── Main simulator ───────────────────────────────────────────────

export function simulatePlaybook(
  draft: PlaybookDraftSim,
  customers: MockCustomer[] = CUSTOMERS,
): SimulationResult {
  const steps: StepOutcome[] = [];
  let activeCustomers = [...customers];
  let totalRevenue = 0;
  let totalHealthDelta = 0;
  let totalDays = 0;

  for (let i = 0; i < draft.steps.length; i++) {
    const step = draft.steps[i];
    if (!step.enabled) continue;

    const outcome: StepOutcome = {
      stepId: step.id,
      stepIndex: i,
      stepName: step.name,
      stepType: step.type,
      action: step.action,
      customersAffected: [],
      customersFiltered: [],
      predictedResponseRate: 0,
      revenueDelta: 0,
      healthDelta: 0,
      narrative: "",
    };

    switch (step.type) {
      case "action": {
        outcome.customersAffected = [...activeCustomers];
        const rate = ACTION_RESPONSE_RATES[step.action || "email"] || 0.3;
        outcome.predictedResponseRate = rate;
        const respondents = Math.round(activeCustomers.length * rate);
        const avgDeal = activeCustomers.reduce((s, c) => s + c.dealValue, 0) / (activeCustomers.length || 1);
        outcome.revenueDelta = respondents * avgDeal * 0.3;
        outcome.healthDelta = respondents * 5;
        outcome.narrative = `${step.name} sent to ${activeCustomers.length} customer(s). ~${respondents} expected to respond (${(rate * 100).toFixed(0)}% rate). Projected +$${outcome.revenueDelta.toLocaleString()} revenue impact.`;
        totalRevenue += outcome.revenueDelta;
        totalHealthDelta += outcome.healthDelta;
        break;
      }

      case "condition": {
        const pass = activeCustomers.filter(c => evaluateAllConditions(c, step.conditions));
        const fail = activeCustomers.filter(c => !evaluateAllConditions(c, step.conditions));
        outcome.customersAffected = pass;
        outcome.customersFiltered = fail;
        outcome.branchResults = [
          { label: step.branches?.[0]?.label || "If True", customers: pass },
          { label: step.branches?.[1]?.label || "If False", customers: fail },
        ];
        outcome.narrative = `Condition check: ${pass.length} pass, ${fail.length} filtered out. ${pass.map(c => c.name).join(", ")} continue to next step.`;
        activeCustomers = pass; // continue with passing customers
        break;
      }

      case "delay": {
        const days = parseDays(step.delay);
        totalDays += days;
        outcome.customersAffected = [...activeCustomers];
        outcome.delayLabel = step.delay;
        outcome.narrative = `Waiting ${step.delay}. ${activeCustomers.length} customer(s) remain in the pipeline. Total elapsed: ${totalDays.toFixed(1)} days.`;
        break;
      }

      case "gate": {
        outcome.customersAffected = [...activeCustomers];
        outcome.narrative = `⏸ Execution pauses for human approval. ${activeCustomers.length} customer(s) queued. Owner will be notified via in-app alert and email.`;
        break;
      }
    }

    steps.push(outcome);
  }

  const totalReach = customers.length;
  const avgHealth = steps.length ? totalHealthDelta / totalReach : 0;
  const actionSteps = steps.filter(s => s.stepType === "action");
  const avgConversion = actionSteps.length
    ? actionSteps.reduce((s, o) => s + o.predictedResponseRate, 0) / actionSteps.length
    : 0;

  return {
    steps,
    totalReach,
    expectedRevenue: totalRevenue,
    avgHealthImprovement: avgHealth,
    timelineDays: totalDays,
    conversionRate: avgConversion,
  };
}
