// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Stale Lead Detector
// ═══════════════════════════════════════════════════════════════

import type { Lead, StaleLeadState } from "@/domains/business";

export interface StaleLeadReport {
  totalLeads: number;
  staleCount: number;
  stalePercentage: number;
  byAction: Record<string, number>;
  totalAtRiskValueCents: number;
  generatedAt: string;
}

export function detectStaleLeads(leads: Lead[], thresholdDays: number = 14): StaleLeadState[] {
  const now = Date.now();
  return leads
    .map(lead => {
      const daysSinceContact = lead.lastContact ? Math.floor((now - new Date(lead.lastContact).getTime()) / 86400000) : 999;
      if (daysSinceContact < thresholdDays) return null;

      let recommendedAction: StaleLeadState["recommendedAction"] = "re-engage";
      if (daysSinceContact > 90) recommendedAction = "archive";
      else if (daysSinceContact > 60) recommendedAction = "reassign";
      else if (daysSinceContact > 30) recommendedAction = "escalate";

      return {
        leadId: lead.id,
        daysSinceLastContact: daysSinceContact,
        daysSinceCapture: daysSinceContact,
        lastActivityType: lead.status,
        staleSince: new Date(now - daysSinceContact * 86400000).toISOString(),
        recommendedAction,
        reengagementScore: Math.max(0, 100 - daysSinceContact),
        estimatedValueCents: lead.score * 100,
        reason: `No contact in ${daysSinceContact} days`,
      } as StaleLeadState;
    })
    .filter(Boolean) as StaleLeadState[];
}

export function buildStaleLeadReport(leads: Lead[]): StaleLeadReport {
  const staleLeads = detectStaleLeads(leads);
  const byAction = staleLeads.reduce((acc, s) => {
    acc[s.recommendedAction] = (acc[s.recommendedAction] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalLeads: leads.length,
    staleCount: staleLeads.length,
    stalePercentage: leads.length > 0 ? Math.round((staleLeads.length / leads.length) * 100) : 0,
    byAction,
    totalAtRiskValueCents: staleLeads.reduce((s, l) => s + l.estimatedValueCents, 0),
    generatedAt: new Date().toISOString(),
  };
}

