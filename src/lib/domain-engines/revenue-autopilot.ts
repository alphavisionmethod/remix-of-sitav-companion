// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Autopilot Engine
// Leakage detection, recovery, opportunity ranking, value ledger
// Pure deterministic functions — no side effects
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────────

export interface LeakageItem {
  id: string;
  type: "missed-callback" | "uncontacted-lead" | "quote-no-close" | "cold-repeat" | "invoice-not-chased" | "booking-unconfirmed" | "no-show-risk" | "abandoned-followup" | "renewal-leakage" | "subscription-waste" | "underused-capacity";
  entityId: string;
  entityName: string;
  estimatedValue: number;
  daysSinceLastAction: number;
  severity: "low" | "medium" | "high" | "critical";
  recoverable: boolean;
  suggestedAction: string;
  detectedAt: number;
}

export interface RecoveryAction {
  id: string;
  leakageId: string;
  type: "callback-campaign" | "quote-nudge" | "payment-reminder" | "reactivation" | "cancellation-fill" | "review-request" | "referral-request" | "upsell-prompt" | "spend-reduction" | "invoice-escalation";
  status: "suggested" | "approved" | "in-progress" | "completed" | "failed" | "skipped";
  estimatedRecovery: number;
  actualRecovery?: number;
  approvalRequired: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface RankedOpportunity {
  id: string;
  name: string;
  source: "leakage" | "pipeline" | "reactivation" | "upsell" | "referral" | "capacity-fill";
  probability: number;        // 0-1
  estimatedValue: number;
  urgencyScore: number;       // 0-100
  effortScore: number;        // 0-100, lower = easier
  trustRequirement: "low" | "medium" | "high" | "critical";
  cashImpactDays: number;     // days until cash impact
  compositeScore: number;     // 0-100 calculated
  suggestedAction: string;
}

export interface RecoveredValueEntry {
  id: string;
  category: "revenue-recovered" | "fees-avoided" | "waste-canceled" | "capacity-filled" | "time-saved" | "opportunity-revived";
  amount: number;
  description: string;
  source: string;
  recoveredAt: number;
  proofId?: string;
}

export interface RevenueAutopilotSummary {
  totalLeakageDetected: number;
  totalRecoverable: number;
  activeRecoveryActions: number;
  totalRecovered: number;
  recoveryRate: number;
  topLeakageTypes: { type: string; count: number; value: number }[];
  rankedOpportunities: RankedOpportunity[];
  recentRecoveries: RecoveredValueEntry[];
  healthScore: number;
}

// ── Leakage Detection ───────────────────────────────────────────

export function detectLeakage(params: {
  leads: { id: string; name: string; status: string; lastContactDays: number; estimatedValue: number }[];
  quotes: { id: string; name: string; sentDays: number; value: number; hasResponse: boolean; closed: boolean }[];
  invoices: { id: string; customerName: string; amount: number; overdueDays: number; chasedRecently: boolean }[];
  customers: { id: string; name: string; lastInteractionDays: number; avgMonthlyRevenue: number; isRepeat: boolean }[];
  bookings: { id: string; name: string; confirmed: boolean; dateTs: number; noShowRisk: number }[];
  subscriptions: { id: string; name: string; monthlyCost: number; lastUsedDays: number; utilization: number }[];
}): LeakageItem[] {
  const items: LeakageItem[] = [];
  const now = Date.now();

  // Uncontacted leads
  params.leads.filter(l => l.status === "new" && l.lastContactDays > 2).forEach(l => {
    items.push({
      id: `leak-lead-${l.id}`, type: "uncontacted-lead", entityId: l.id, entityName: l.name,
      estimatedValue: l.estimatedValue, daysSinceLastAction: l.lastContactDays,
      severity: l.lastContactDays > 7 ? "critical" : l.lastContactDays > 4 ? "high" : "medium",
      recoverable: l.lastContactDays < 14, suggestedAction: "Launch initial outreach sequence",
      detectedAt: now,
    });
  });

  // Quotes with no close loop
  params.quotes.filter(q => !q.closed && q.sentDays > 3 && !q.hasResponse).forEach(q => {
    items.push({
      id: `leak-quote-${q.id}`, type: "quote-no-close", entityId: q.id, entityName: q.name,
      estimatedValue: q.value, daysSinceLastAction: q.sentDays,
      severity: q.sentDays > 14 ? "critical" : q.sentDays > 7 ? "high" : "medium",
      recoverable: q.sentDays < 30, suggestedAction: "Send follow-up nudge with updated terms",
      detectedAt: now,
    });
  });

  // Invoices not chased
  params.invoices.filter(i => i.overdueDays > 0 && !i.chasedRecently).forEach(i => {
    items.push({
      id: `leak-inv-${i.id}`, type: "invoice-not-chased", entityId: i.id, entityName: i.customerName,
      estimatedValue: i.amount, daysSinceLastAction: i.overdueDays,
      severity: i.overdueDays > 30 ? "critical" : i.overdueDays > 14 ? "high" : "medium",
      recoverable: i.overdueDays < 90, suggestedAction: `Escalate collection — ${i.overdueDays} days overdue`,
      detectedAt: now,
    });
  });

  // Cold repeat customers
  params.customers.filter(c => c.isRepeat && c.lastInteractionDays > 30).forEach(c => {
    items.push({
      id: `leak-cold-${c.id}`, type: "cold-repeat", entityId: c.id, entityName: c.name,
      estimatedValue: c.avgMonthlyRevenue * 3, daysSinceLastAction: c.lastInteractionDays,
      severity: c.lastInteractionDays > 90 ? "critical" : c.lastInteractionDays > 60 ? "high" : "medium",
      recoverable: c.lastInteractionDays < 180, suggestedAction: "Launch reactivation sequence",
      detectedAt: now,
    });
  });

  // No-show risk bookings
  params.bookings.filter(b => !b.confirmed && b.noShowRisk > 0.3).forEach(b => {
    items.push({
      id: `leak-noshow-${b.id}`, type: "no-show-risk", entityId: b.id, entityName: b.name,
      estimatedValue: 200, daysSinceLastAction: 0,
      severity: b.noShowRisk > 0.7 ? "high" : "medium",
      recoverable: true, suggestedAction: "Send confirmation reminder with reschedule option",
      detectedAt: now,
    });
  });

  // Subscription waste
  params.subscriptions.filter(s => s.utilization < 0.2 && s.lastUsedDays > 30).forEach(s => {
    items.push({
      id: `leak-sub-${s.id}`, type: "subscription-waste", entityId: s.id, entityName: s.name,
      estimatedValue: s.monthlyCost * 12, daysSinceLastAction: s.lastUsedDays,
      severity: s.utilization < 0.05 ? "high" : "medium",
      recoverable: true, suggestedAction: `Cancel or downgrade — ${Math.round(s.utilization * 100)}% utilized`,
      detectedAt: now,
    });
  });

  return items.sort((a, b) => b.estimatedValue - a.estimatedValue);
}

// ── Opportunity Ranking ─────────────────────────────────────────

export function rankOpportunities(items: Omit<RankedOpportunity, "compositeScore">[]): RankedOpportunity[] {
  return items.map(item => {
    const valueNorm = Math.min(item.estimatedValue / 50000, 1) * 30;
    const probWeight = item.probability * 25;
    const urgencyWeight = (item.urgencyScore / 100) * 20;
    const effortBonus = ((100 - item.effortScore) / 100) * 15;
    const cashBonus = Math.max(0, (30 - item.cashImpactDays) / 30) * 10;
    const compositeScore = Math.round(Math.min(100, valueNorm + probWeight + urgencyWeight + effortBonus + cashBonus));
    return { ...item, compositeScore };
  }).sort((a, b) => b.compositeScore - a.compositeScore);
}

// ── Recovery Suggestions ────────────────────────────────────────

export function suggestRecoveryActions(leakage: LeakageItem[]): RecoveryAction[] {
  const typeToAction: Record<string, RecoveryAction["type"]> = {
    "uncontacted-lead": "callback-campaign",
    "quote-no-close": "quote-nudge",
    "invoice-not-chased": "payment-reminder",
    "cold-repeat": "reactivation",
    "no-show-risk": "cancellation-fill",
    "subscription-waste": "spend-reduction",
    "abandoned-followup": "callback-campaign",
    "renewal-leakage": "reactivation",
    "booking-unconfirmed": "cancellation-fill",
    "missed-callback": "callback-campaign",
    "underused-capacity": "upsell-prompt",
  };

  return leakage.filter(l => l.recoverable).map(l => ({
    id: `recovery-${l.id}`,
    leakageId: l.id,
    type: typeToAction[l.type] ?? "callback-campaign",
    status: "suggested" as const,
    estimatedRecovery: l.estimatedValue * (l.severity === "critical" ? 0.3 : l.severity === "high" ? 0.5 : 0.7),
    approvalRequired: l.estimatedValue > 5000 || l.severity === "critical",
    createdAt: Date.now(),
  }));
}

// ── Recovered Value Ledger ──────────────────────────────────────

export function computeRecoveredValueSummary(entries: RecoveredValueEntry[]): {
  totalRecovered: number;
  byCategory: Record<string, number>;
  last30Days: number;
  trend: "up" | "down" | "flat";
} {
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const sixtyDays = 60 * 24 * 60 * 60 * 1000;

  const totalRecovered = entries.reduce((s, e) => s + e.amount, 0);
  const byCategory: Record<string, number> = {};
  entries.forEach(e => { byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount; });

  const last30 = entries.filter(e => now - e.recoveredAt < thirtyDays).reduce((s, e) => s + e.amount, 0);
  const prev30 = entries.filter(e => now - e.recoveredAt >= thirtyDays && now - e.recoveredAt < sixtyDays).reduce((s, e) => s + e.amount, 0);

  const trend = last30 > prev30 * 1.1 ? "up" : last30 < prev30 * 0.9 ? "down" : "flat";

  return { totalRecovered, byCategory, last30Days: last30, trend };
}

// ── Full Autopilot Summary ──────────────────────────────────────

export function computeAutopilotSummary(
  leakage: LeakageItem[],
  recoveryActions: RecoveryAction[],
  recoveredEntries: RecoveredValueEntry[],
): RevenueAutopilotSummary {
  const totalLeakageDetected = leakage.reduce((s, l) => s + l.estimatedValue, 0);
  const totalRecoverable = leakage.filter(l => l.recoverable).reduce((s, l) => s + l.estimatedValue, 0);
  const activeRecoveryActions = recoveryActions.filter(r => r.status === "in-progress" || r.status === "approved").length;
  const totalRecovered = recoveredEntries.reduce((s, e) => s + e.amount, 0);
  const recoveryRate = totalLeakageDetected > 0 ? totalRecovered / totalLeakageDetected : 0;

  // Aggregate leakage by type
  const typeMap = new Map<string, { count: number; value: number }>();
  leakage.forEach(l => {
    const entry = typeMap.get(l.type) ?? { count: 0, value: 0 };
    entry.count++;
    entry.value += l.estimatedValue;
    typeMap.set(l.type, entry);
  });
  const topLeakageTypes = Array.from(typeMap.entries())
    .map(([type, { count, value }]) => ({ type, count, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const healthScore = Math.round(Math.min(100, Math.max(0,
    80 - (leakage.filter(l => l.severity === "critical").length * 10)
    + (recoveryRate * 30)
    - (leakage.length > 20 ? 15 : 0)
  )));

  return {
    totalLeakageDetected, totalRecoverable, activeRecoveryActions, totalRecovered,
    recoveryRate, topLeakageTypes, rankedOpportunities: [], recentRecoveries: recoveredEntries.slice(0, 10),
    healthScore,
  };
}
