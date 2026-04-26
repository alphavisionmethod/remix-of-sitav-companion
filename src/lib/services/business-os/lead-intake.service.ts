// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Lead Intake Service
// ═══════════════════════════════════════════════════════════════

import type { Lead } from "@/domains/business";

export interface LeadIntakePayload {
  name: string;
  email: string;
  phone?: string;
  source: "website" | "referral" | "cold-outreach" | "event" | "inbound" | "partner";
  notes?: string;
  estimatedValue?: number;
}

export function createLead(payload: LeadIntakePayload): Lead {
  return {
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: payload.name,
    email: payload.email,
    status: "new",
    score: 0,
    lastContact: new Date().toISOString(),
  };
}

export function deduplicateLeads(leads: Lead[], newLead: Lead): { isDuplicate: boolean; existingLead?: Lead } {
  const match = leads.find(l => l.email.toLowerCase() === newLead.email.toLowerCase());
  return match ? { isDuplicate: true, existingLead: match } : { isDuplicate: false };
}

export function trackLeadSource(leads: Lead[]): Record<string, number> {
  return leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

