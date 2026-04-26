// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Lead Scoring Service
// ═══════════════════════════════════════════════════════════════

import type { Lead } from "@/domains/business";
import type { StaleLeadState } from "@/domains/business";

export interface ScoredLeadResult {
  lead: Lead;
  compositeScore: number;
  breakdown: { engagement: number; recency: number; fit: number };
  scoredAt: string;
}

export function scoreLead(lead: Lead): ScoredLeadResult {
  const engagement = lead.status === "qualified" ? 90 : lead.status === "nurturing" ? 60 : 30;
  const recency = lead.lastContact ? Math.max(0, 100 - Math.floor((Date.now() - new Date(lead.lastContact).getTime()) / 86400000) * 2) : 20;
  const fit = 50;
  const total = Math.round(engagement * 0.4 + recency * 0.35 + fit * 0.25);

  return { lead: { ...lead, score: total }, compositeScore: total, breakdown: { engagement, recency, fit }, scoredAt: new Date().toISOString() };
}

export function detectStaleLead(lead: Lead): StaleLeadState | null {
  const daysSinceContact = lead.lastContact ? Math.floor((Date.now() - new Date(lead.lastContact).getTime()) / 86400000) : 999;
  if (daysSinceContact < 14) return null;

  let recommendedAction: StaleLeadState["recommendedAction"] = "re-engage";
  if (daysSinceContact > 90) recommendedAction = "archive";
  else if (daysSinceContact > 60) recommendedAction = "reassign";
  else if (daysSinceContact > 30) recommendedAction = "escalate";

  return {
    leadId: lead.id, daysSinceLastContact: daysSinceContact, daysSinceCapture: daysSinceContact,
    lastActivityType: lead.status, staleSince: new Date(Date.now() - daysSinceContact * 86400000).toISOString(),
    recommendedAction, reengagementScore: Math.max(0, 100 - daysSinceContact),
    estimatedValueCents: lead.score * 100, reason: `No contact in ${daysSinceContact} days`,
  };
}

export function buildCallbackQueue(leads: Lead[]): Lead[] {
  return leads.filter(l => l.status === "qualified" || l.status === "nurturing").sort((a, b) => b.score - a.score).slice(0, 20);
}

