// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Revenue Autopilot
// ═══════════════════════════════════════════════════════════════

import type { RecoveredValueEntry, RankedOpportunity } from "@/lib/domain-engines/revenue-autopilot";

export const MOCK_RECOVERED_VALUES: RecoveredValueEntry[] = [
  { id: "rv1", category: "revenue-recovered", amount: 1800, description: "Invoice #1035 collected after reminder", source: "overdue-followup", recoveredAt: Date.now() - 864e5 * 3 },
  { id: "rv2", category: "revenue-recovered", amount: 45000, description: "TechStart LLC renewed after outreach", source: "churn-prevention", recoveredAt: Date.now() - 864e5 * 7 },
  { id: "rv3", category: "fees-avoided", amount: 2400, description: "Underpriced service tier adjusted", source: "pricing-correction", recoveredAt: Date.now() - 864e5 * 14 },
];

export const MOCK_RAW_OPPORTUNITIES = [
  { id: "o1", name: "Acme Corp enterprise expansion", source: "pipeline" as const, probability: 0.65, estimatedValue: 45000, urgencyScore: 80, effortScore: 40, trustRequirement: "medium" as const, cashImpactDays: 30, suggestedAction: "Send updated proposal" },
  { id: "o2", name: "Johnson & Co reactivation", source: "reactivation" as const, probability: 0.55, estimatedValue: 12600, urgencyScore: 60, effortScore: 20, trustRequirement: "low" as const, cashImpactDays: 14, suggestedAction: "Launch reactivation email" },
  { id: "o3", name: "TechVentures overdue collection", source: "leakage" as const, probability: 0.8, estimatedValue: 15000, urgencyScore: 95, effortScore: 30, trustRequirement: "high" as const, cashImpactDays: 7, suggestedAction: "Escalate with collections ladder" },
  { id: "o4", name: "Premier Design upsell", source: "upsell" as const, probability: 0.4, estimatedValue: 8400, urgencyScore: 40, effortScore: 25, trustRequirement: "low" as const, cashImpactDays: 45, suggestedAction: "Propose premium tier" },
];

export const MOCK_LEAKAGE_INPUT = {
  leads: [
    { id: "l1", name: "David Park", status: "new", lastContactDays: 5, estimatedValue: 12000 },
    { id: "l2", name: "Lisa Chen", status: "new", lastContactDays: 9, estimatedValue: 28000 },
    { id: "l3", name: "Mike Ross", status: "new", lastContactDays: 3, estimatedValue: 8000 },
  ],
  quotes: [
    { id: "q1", name: "Enterprise Plan — Acme Corp", sentDays: 12, value: 45000, hasResponse: false, closed: false },
    { id: "q2", name: "Starter Package — StartupXYZ", sentDays: 5, value: 6000, hasResponse: false, closed: false },
  ],
  invoices: [
    { id: "i1", customerName: "Sarah Chen", amount: 8500, overdueDays: 22, chasedRecently: false },
    { id: "i2", customerName: "TechVentures", amount: 15000, overdueDays: 45, chasedRecently: false },
  ],
  customers: [
    { id: "c1", name: "Johnson & Co", lastInteractionDays: 75, avgMonthlyRevenue: 4200, isRepeat: true },
    { id: "c2", name: "Premier Design", lastInteractionDays: 45, avgMonthlyRevenue: 2800, isRepeat: true },
  ],
  bookings: [
    { id: "b1", name: "Strategy Session — Alex", confirmed: false, dateTs: Date.now() + 86400000, noShowRisk: 0.55 },
  ],
  subscriptions: [
    { id: "s1", name: "Analytics Pro", monthlyCost: 89, lastUsedDays: 60, utilization: 0.08 },
    { id: "s2", name: "Design Cloud", monthlyCost: 149, lastUsedDays: 45, utilization: 0.12 },
  ],
};
