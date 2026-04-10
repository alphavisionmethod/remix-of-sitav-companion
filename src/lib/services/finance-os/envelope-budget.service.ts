// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Envelope Budget Service
// YNAB-style envelope allocation, rollover, overspend recovery
// ═══════════════════════════════════════════════════════════════

import type { EnvelopeBudget, EnvelopeGroup, Envelope, EnvelopeAllocationRule } from "@/packages/finance-contracts";

/** Default envelope groups for new users */
export function createDefaultEnvelopes(monthlyIncomeCents: number): EnvelopeBudget {
  const groups: EnvelopeGroup[] = [
    makeGroup("essentials", "Essentials", 0, [
      env("rent", "Rent / Mortgage", Math.round(monthlyIncomeCents * 0.30), "housing"),
      env("utilities", "Utilities", Math.round(monthlyIncomeCents * 0.05), "utilities"),
      env("groceries", "Groceries", Math.round(monthlyIncomeCents * 0.10), "food"),
      env("insurance", "Insurance", Math.round(monthlyIncomeCents * 0.05), "insurance"),
      env("transportation", "Transportation", Math.round(monthlyIncomeCents * 0.08), "transport"),
    ]),
    makeGroup("lifestyle", "Lifestyle", 1, [
      env("dining", "Dining Out", Math.round(monthlyIncomeCents * 0.05), "food"),
      env("entertainment", "Entertainment", Math.round(monthlyIncomeCents * 0.03), "entertainment"),
      env("personal", "Personal Care", Math.round(monthlyIncomeCents * 0.02), "personal"),
      env("subscriptions", "Subscriptions", Math.round(monthlyIncomeCents * 0.02), "subscriptions"),
    ]),
    makeGroup("savings-goals", "Savings & Goals", 2, [
      env("emergency", "Emergency Fund", Math.round(monthlyIncomeCents * 0.10), "savings"),
      env("vacation", "Vacation Fund", Math.round(monthlyIncomeCents * 0.03), "goals"),
      env("investments", "Investments", Math.round(monthlyIncomeCents * 0.05), "investments"),
    ]),
    makeGroup("debt", "Debt Payments", 3, [
      env("debt-min", "Minimum Payments", Math.round(monthlyIncomeCents * 0.08), "debt"),
      env("debt-extra", "Extra Debt Payment", Math.round(monthlyIncomeCents * 0.04), "debt"),
    ]),
  ];

  const totalAllocated = groups.reduce((s, g) => s + g.totalAllocatedCents, 0);

  return {
    id: crypto.randomUUID(),
    period: new Date().toISOString().slice(0, 7),
    totalIncomeCents: monthlyIncomeCents,
    totalAllocatedCents: totalAllocated,
    unallocatedCents: monthlyIncomeCents - totalAllocated,
    groups,
    rolloverFromPriorCents: 0,
    paceStatus: "on-track",
  };
}

/** Allocate income to envelopes based on rules */
export function allocateIncome(
  budget: EnvelopeBudget,
  rules: EnvelopeAllocationRule[],
  incomeCents: number
): EnvelopeBudget {
  const envelopeMap = new Map<string, Envelope>();
  for (const g of budget.groups) {
    for (const e of g.envelopes) {
      envelopeMap.set(e.id, { ...e });
    }
  }

  let remaining = incomeCents;
  const sorted = [...rules].sort((a, b) => a.priority - b.priority);

  // Fixed first
  for (const rule of sorted.filter(r => r.type === "fixed")) {
    const env = envelopeMap.get(rule.envelopeId);
    if (env && rule.valueCents) {
      const alloc = Math.min(rule.valueCents, remaining);
      env.allocatedCents += alloc;
      env.availableCents = env.allocatedCents - env.spentCents + env.rolloverCents;
      env.isOverspent = env.availableCents < 0;
      remaining -= alloc;
    }
  }

  // Percentage next
  for (const rule of sorted.filter(r => r.type === "percentage")) {
    const env = envelopeMap.get(rule.envelopeId);
    if (env && rule.percentOfIncome) {
      const alloc = Math.min(Math.round(incomeCents * rule.percentOfIncome / 100), remaining);
      env.allocatedCents += alloc;
      env.availableCents = env.allocatedCents - env.spentCents + env.rolloverCents;
      env.isOverspent = env.availableCents < 0;
      remaining -= alloc;
    }
  }

  // Remainder
  for (const rule of sorted.filter(r => r.type === "remainder")) {
    const env = envelopeMap.get(rule.envelopeId);
    if (env && remaining > 0) {
      env.allocatedCents += remaining;
      env.availableCents = env.allocatedCents - env.spentCents + env.rolloverCents;
      env.isOverspent = env.availableCents < 0;
      remaining = 0;
    }
  }

  // Rebuild groups
  const newGroups = budget.groups.map(g => {
    const newEnvelopes = g.envelopes.map(e => envelopeMap.get(e.id) || e);
    return {
      ...g,
      envelopes: newEnvelopes,
      totalAllocatedCents: newEnvelopes.reduce((s, e) => s + e.allocatedCents, 0),
      totalSpentCents: newEnvelopes.reduce((s, e) => s + e.spentCents, 0),
    };
  });

  const totalAllocated = newGroups.reduce((s, g) => s + g.totalAllocatedCents, 0);

  return {
    ...budget,
    totalIncomeCents: incomeCents,
    totalAllocatedCents: totalAllocated,
    unallocatedCents: incomeCents - totalAllocated,
    groups: newGroups,
  };
}

/** Apply rollover from prior month */
export function applyRollover(current: EnvelopeBudget, prior: EnvelopeBudget): EnvelopeBudget {
  const priorMap = new Map<string, Envelope>();
  for (const g of prior.groups) {
    for (const e of g.envelopes) {
      priorMap.set(e.id, e);
    }
  }

  let totalRollover = 0;
  const newGroups = current.groups.map(g => {
    const newEnvelopes = g.envelopes.map(e => {
      const priorEnv = priorMap.get(e.id);
      const rollover = priorEnv ? Math.max(0, priorEnv.availableCents) : 0;
      totalRollover += rollover;
      return {
        ...e,
        rolloverCents: rollover,
        availableCents: e.allocatedCents - e.spentCents + rollover,
        isOverspent: (e.allocatedCents - e.spentCents + rollover) < 0,
      };
    });
    return {
      ...g,
      envelopes: newEnvelopes,
      totalAllocatedCents: newEnvelopes.reduce((s, e) => s + e.allocatedCents, 0),
      totalSpentCents: newEnvelopes.reduce((s, e) => s + e.spentCents, 0),
    };
  });

  return { ...current, groups: newGroups, rolloverFromPriorCents: totalRollover };
}

/** Compute budget pace status */
export function computePaceStatus(budget: EnvelopeBudget, dayOfMonth: number, daysInMonth: number): EnvelopeBudget["paceStatus"] {
  const pctThrough = dayOfMonth / daysInMonth;
  const totalSpent = budget.groups.reduce((s, g) => s + g.totalSpentCents, 0);
  const pctSpent = budget.totalAllocatedCents > 0 ? totalSpent / budget.totalAllocatedCents : 0;

  if (pctSpent < pctThrough * 0.85) return "ahead";
  if (pctSpent > pctThrough * 1.15) return "behind";
  return "on-track";
}

// ── Helpers ──

function env(id: string, name: string, allocated: number, category: string): Envelope {
  return {
    id, name, allocatedCents: allocated, spentCents: 0, availableCents: allocated,
    rolloverCents: 0, isOverspent: false, category,
  };
}

function makeGroup(id: string, name: string, sortOrder: number, envelopes: Envelope[]): EnvelopeGroup {
  return {
    id, name, sortOrder, envelopes,
    totalAllocatedCents: envelopes.reduce((s, e) => s + e.allocatedCents, 0),
    totalSpentCents: 0,
  };
}
