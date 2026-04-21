// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Scenario Presets
// Three flagship simulation families: Business, Concierge, Finance
// ═══════════════════════════════════════════════════════════════

import type { SimulationVariable } from "./monte-carlo-engine";

export type ScenarioDomain = "business" | "concierge" | "finance";

export interface DomainScenario {
  id: string;
  label: string;
  domain: ScenarioDomain;
  question: string;
  description: string;
  variables: SimulationVariable[];
  formula: (v: Record<string, number>) => number;
  popular?: boolean;
}

export const DOMAIN_SCENARIOS: DomainScenario[] = [
  // ── Business ─────────────────────────────────────────────────
  {
    id: "biz-delay-hire",
    label: "Delay a Key Hire",
    domain: "business",
    question: "What happens if I delay this hire by 3–6 months?",
    description: "Model the cashflow saved vs. revenue lost from delayed capacity.",
    variables: [
      { id: "monthlySalary", label: "Monthly Salary Cost", min: 3000, max: 20000, mean: 8000, stdDev: 3000, distribution: "normal" },
      { id: "delayMonths", label: "Delay (months)", min: 1, max: 12, mean: 4, stdDev: 2, distribution: "normal" },
      { id: "revPerEmployee", label: "Monthly Revenue / Employee", min: 5000, max: 50000, mean: 15000, stdDev: 8000, distribution: "normal" },
      { id: "hiringCost", label: "One-time Hiring Cost", min: 2000, max: 30000, mean: 10000, stdDev: 5000, distribution: "normal" },
    ],
    formula: (v) => (v.monthlySalary * v.delayMonths + v.hiringCost) - (v.revPerEmployee * v.delayMonths),
    popular: true,
  },
  {
    id: "biz-cut-saas",
    label: "Cut SaaS Spend",
    domain: "business",
    question: "What if I consolidate or cut SaaS tools?",
    description: "Net savings after accounting for productivity impact.",
    variables: [
      { id: "currentMonthly", label: "Current SaaS Spend / mo", min: 500, max: 20000, mean: 5000, stdDev: 2000, distribution: "normal" },
      { id: "cutPercent", label: "Cut %", min: 10, max: 80, mean: 30, stdDev: 15, distribution: "normal" },
      { id: "productivityHit", label: "Productivity Loss %", min: 0, max: 30, mean: 5, stdDev: 5, distribution: "normal" },
      { id: "teamSize", label: "Team Size", min: 1, max: 50, mean: 10, stdDev: 5, distribution: "normal" },
    ],
    formula: (v) => {
      const annualSaved = v.currentMonthly * (v.cutPercent / 100) * 12;
      const prodCost = v.teamSize * 5000 * (v.productivityHit / 100);
      return annualSaved - prodCost;
    },
    popular: true,
  },
  {
    id: "biz-payment-timing",
    label: "Restructure Payment Timing",
    domain: "business",
    question: "What if I shift invoice terms from net-60 to net-30?",
    description: "Model cashflow improvement from faster collections.",
    variables: [
      { id: "monthlyRevenue", label: "Monthly Revenue", min: 10000, max: 500000, mean: 80000, stdDev: 30000, distribution: "normal" },
      { id: "currentDSO", label: "Current DSO (days)", min: 30, max: 120, mean: 60, stdDev: 15, distribution: "normal" },
      { id: "targetDSO", label: "Target DSO (days)", min: 15, max: 60, mean: 30, stdDev: 10, distribution: "normal" },
      { id: "lostClientPct", label: "Client Churn from Change %", min: 0, max: 20, mean: 5, stdDev: 3, distribution: "normal" },
    ],
    formula: (v) => {
      const cashUnlocked = v.monthlyRevenue * ((v.currentDSO - v.targetDSO) / 30);
      const lostRev = v.monthlyRevenue * (v.lostClientPct / 100) * 12;
      return cashUnlocked * 12 - lostRev;
    },
  },
  {
    id: "biz-adopt-sita",
    label: "Adopt SITA as Operating Layer",
    domain: "business",
    question: "What's the ROI of consolidating operations into SITA OS?",
    description: "Model time savings, tool consolidation, and decision quality improvement.",
    variables: [
      { id: "hoursPerWeek", label: "Admin Hours Saved / Week", min: 2, max: 30, mean: 10, stdDev: 5, distribution: "normal" },
      { id: "hourlyRate", label: "Effective Hourly Rate ($)", min: 25, max: 200, mean: 75, stdDev: 30, distribution: "normal" },
      { id: "toolsCut", label: "Tools Consolidated", min: 1, max: 15, mean: 5, stdDev: 3, distribution: "normal" },
      { id: "avgToolCost", label: "Avg Tool Cost / mo", min: 20, max: 500, mean: 100, stdDev: 60, distribution: "normal" },
    ],
    formula: (v) => {
      const timeSavings = v.hoursPerWeek * v.hourlyRate * 52;
      const toolSavings = v.toolsCut * v.avgToolCost * 12;
      return timeSavings + toolSavings;
    },
    popular: true,
  },
  {
    id: "biz-obligation-slip",
    label: "Slip an Obligation",
    domain: "business",
    question: "What if this deliverable slips by 2–4 weeks?",
    description: "Model the penalty cost vs. quality gained from additional time.",
    variables: [
      { id: "contractValue", label: "Contract Value ($)", min: 5000, max: 500000, mean: 50000, stdDev: 30000, distribution: "normal" },
      { id: "slipWeeks", label: "Slip Duration (weeks)", min: 1, max: 8, mean: 3, stdDev: 1.5, distribution: "normal" },
      { id: "penaltyPctPerWeek", label: "Penalty % / Week", min: 0, max: 5, mean: 1, stdDev: 0.5, distribution: "normal" },
      { id: "qualityGainPct", label: "Quality Improvement %", min: 5, max: 40, mean: 15, stdDev: 8, distribution: "normal" },
    ],
    formula: (v) => {
      const penaltyCost = v.contractValue * (v.penaltyPctPerWeek / 100) * v.slipWeeks;
      const qualityValue = v.contractValue * (v.qualityGainPct / 100);
      return qualityValue - penaltyCost;
    },
  },

  // ── Concierge / Life ──────────────────────────────────────────
  {
    id: "con-shift-obligations",
    label: "Shift Obligations",
    domain: "concierge",
    question: "What if I redistribute this week's commitments?",
    description: "Model stress reduction vs. social cost of rescheduling.",
    variables: [
      { id: "obligationCount", label: "Obligations to Shift", min: 1, max: 10, mean: 3, stdDev: 1.5, distribution: "normal" },
      { id: "stressPerObligation", label: "Stress Score Each (1-10)", min: 1, max: 10, mean: 6, stdDev: 2, distribution: "normal" },
      { id: "socialCost", label: "Social Cost Each (1-10)", min: 1, max: 10, mean: 3, stdDev: 2, distribution: "normal" },
      { id: "freeHoursGained", label: "Free Hours Gained", min: 0.5, max: 8, mean: 3, stdDev: 1.5, distribution: "normal" },
    ],
    formula: (v) => {
      const stressRelief = v.obligationCount * v.stressPerObligation;
      const socialPenalty = v.obligationCount * v.socialCost;
      return (stressRelief - socialPenalty) + v.freeHoursGained * 10;
    },
    popular: true,
  },
  {
    id: "con-automate-approvals",
    label: "Automate More Approvals",
    domain: "concierge",
    question: "What if I let SITA auto-approve low-risk decisions?",
    description: "Model time savings vs. autonomy risk from delegation.",
    variables: [
      { id: "dailyApprovals", label: "Daily Approval Requests", min: 2, max: 30, mean: 10, stdDev: 5, distribution: "normal" },
      { id: "minPerApproval", label: "Minutes per Approval", min: 1, max: 15, mean: 5, stdDev: 3, distribution: "normal" },
      { id: "autoPct", label: "% Auto-Approved", min: 20, max: 90, mean: 60, stdDev: 15, distribution: "normal" },
      { id: "riskPct", label: "Error Risk %", min: 0.1, max: 5, mean: 1, stdDev: 1, distribution: "normal" },
    ],
    formula: (v) => {
      const timeSavedPerDay = (v.dailyApprovals * v.autoPct / 100) * v.minPerApproval;
      const annualHours = timeSavedPerDay * 365 / 60;
      const riskCost = v.dailyApprovals * (v.autoPct / 100) * (v.riskPct / 100) * 50;
      return annualHours * 50 - riskCost * 365;
    },
  },
  {
    id: "con-delegate-sita",
    label: "Delegate to SITA",
    domain: "concierge",
    question: "What conflicts disappear if SITA coordinates my schedule?",
    description: "Model scheduling conflict reduction and cognitive load savings.",
    variables: [
      { id: "weeklyConflicts", label: "Weekly Scheduling Conflicts", min: 1, max: 10, mean: 4, stdDev: 2, distribution: "normal" },
      { id: "resolutionMin", label: "Minutes to Resolve Each", min: 5, max: 30, mean: 15, stdDev: 8, distribution: "normal" },
      { id: "sitaAccuracy", label: "SITA Resolution Accuracy %", min: 60, max: 99, mean: 85, stdDev: 8, distribution: "normal" },
      { id: "cogLoadReduction", label: "Cognitive Load Reduction (1-10)", min: 1, max: 10, mean: 6, stdDev: 2, distribution: "normal" },
    ],
    formula: (v) => {
      const conflictsResolved = v.weeklyConflicts * (v.sitaAccuracy / 100) * 52;
      const timeSaved = conflictsResolved * v.resolutionMin / 60;
      return timeSaved * 50 + v.cogLoadReduction * 500;
    },
  },

  // ── Finance / Planning ────────────────────────────────────────
  {
    id: "fin-accelerate-debt",
    label: "Accelerate Debt Paydown",
    domain: "finance",
    question: "What if I pay an extra $500/mo toward this debt?",
    description: "Model interest saved and months shaved off the paydown.",
    variables: [
      { id: "balance", label: "Current Balance ($)", min: 1000, max: 100000, mean: 25000, stdDev: 15000, distribution: "normal" },
      { id: "apr", label: "APR %", min: 3, max: 30, mean: 15, stdDev: 6, distribution: "normal" },
      { id: "currentPayment", label: "Current Monthly Payment", min: 100, max: 3000, mean: 500, stdDev: 200, distribution: "normal" },
      { id: "extraPayment", label: "Extra Monthly Payment", min: 100, max: 2000, mean: 500, stdDev: 200, distribution: "normal" },
    ],
    formula: (v) => {
      const monthlyRate = v.apr / 100 / 12;
      const monthsNormal = Math.log(v.currentPayment / (v.currentPayment - v.balance * monthlyRate)) / Math.log(1 + monthlyRate);
      const totalPayment = v.currentPayment + v.extraPayment;
      const monthsAccel = Math.log(totalPayment / (totalPayment - v.balance * monthlyRate)) / Math.log(1 + monthlyRate);
      const saved = (monthsNormal * v.currentPayment) - (monthsAccel * totalPayment);
      return isFinite(saved) ? saved : 0;
    },
    popular: true,
  },
  {
    id: "fin-compare-mortgage",
    label: "Compare Mortgage Paths",
    domain: "finance",
    question: "15-year vs 30-year mortgage — total cost difference?",
    description: "Model total interest paid under different term lengths.",
    variables: [
      { id: "principal", label: "Loan Amount ($)", min: 100000, max: 1000000, mean: 350000, stdDev: 100000, distribution: "normal" },
      { id: "rate15", label: "15-Year Rate %", min: 3, max: 8, mean: 5.5, stdDev: 1, distribution: "normal" },
      { id: "rate30", label: "30-Year Rate %", min: 4, max: 9, mean: 6.5, stdDev: 1, distribution: "normal" },
    ],
    formula: (v) => {
      const calc = (p: number, r: number, n: number) => {
        const mr = r / 100 / 12;
        const payment = p * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
        return payment * n - p;
      };
      const interest15 = calc(v.principal, v.rate15, 180);
      const interest30 = calc(v.principal, v.rate30, 360);
      return interest30 - interest15; // positive = 30yr costs more
    },
  },
  {
    id: "fin-rebalance",
    label: "Rebalance Allocation",
    domain: "finance",
    question: "What if I shift from 60/40 stocks/bonds to 80/20?",
    description: "Model expected return difference over 10 years with risk.",
    variables: [
      { id: "portfolio", label: "Portfolio Value ($)", min: 10000, max: 2000000, mean: 200000, stdDev: 100000, distribution: "normal" },
      { id: "stockReturn", label: "Expected Stock Return %", min: 4, max: 15, mean: 9, stdDev: 3, distribution: "normal" },
      { id: "bondReturn", label: "Expected Bond Return %", min: 1, max: 7, mean: 4, stdDev: 1.5, distribution: "normal" },
      { id: "currentStock", label: "Current Stock %", min: 20, max: 80, mean: 60, stdDev: 10, distribution: "normal" },
      { id: "targetStock", label: "Target Stock %", min: 40, max: 100, mean: 80, stdDev: 10, distribution: "normal" },
    ],
    formula: (v) => {
      const years = 10;
      const currentReturn = (v.currentStock / 100) * v.stockReturn + ((100 - v.currentStock) / 100) * v.bondReturn;
      const targetReturn = (v.targetStock / 100) * v.stockReturn + ((100 - v.targetStock) / 100) * v.bondReturn;
      const currentValue = v.portfolio * Math.pow(1 + currentReturn / 100, years);
      const targetValue = v.portfolio * Math.pow(1 + targetReturn / 100, years);
      return targetValue - currentValue;
    },
  },
  {
    id: "fin-budget-rule",
    label: "Change Budget Rule",
    domain: "finance",
    question: "What if I change my savings rate from 10% to 20%?",
    description: "Model 10-year wealth difference from a higher savings rate.",
    variables: [
      { id: "monthlyIncome", label: "Monthly Income ($)", min: 2000, max: 30000, mean: 7000, stdDev: 3000, distribution: "normal" },
      { id: "currentSavePct", label: "Current Savings %", min: 0, max: 40, mean: 10, stdDev: 5, distribution: "normal" },
      { id: "targetSavePct", label: "Target Savings %", min: 5, max: 50, mean: 20, stdDev: 5, distribution: "normal" },
      { id: "returnRate", label: "Investment Return %", min: 3, max: 12, mean: 7, stdDev: 2, distribution: "normal" },
    ],
    formula: (v) => {
      const months = 120;
      const mr = v.returnRate / 100 / 12;
      const fv = (pmt: number) => pmt * ((Math.pow(1 + mr, months) - 1) / mr);
      const currentWealth = fv(v.monthlyIncome * v.currentSavePct / 100);
      const targetWealth = fv(v.monthlyIncome * v.targetSavePct / 100);
      return targetWealth - currentWealth;
    },
  },
];

export function getScenariosByDomain(domain: ScenarioDomain): DomainScenario[] {
  return DOMAIN_SCENARIOS.filter((s) => s.domain === domain);
}

export function getScenarioById(id: string): DomainScenario | undefined {
  return DOMAIN_SCENARIOS.find((s) => s.id === id);
}

export function getPopularScenarios(): DomainScenario[] {
  return DOMAIN_SCENARIOS.filter((s) => s.popular);
}

export const DOMAIN_META: Record<ScenarioDomain, { label: string; description: string; color: string }> = {
  business: { label: "Business", description: "Operations, hiring, SaaS, and strategic decisions", color: "text-blue-400" },
  concierge: { label: "Concierge", description: "Life coordination, scheduling, and delegation", color: "text-purple-400" },
  finance: { label: "Finance", description: "Debt, investments, budgeting, and planning", color: "text-emerald-400" },
};