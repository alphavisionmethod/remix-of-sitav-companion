// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Contacts Service
// ═══════════════════════════════════════════════════════════════

import type { CRMContact } from "@/packages/business-contracts";

export interface ContactTimelineEntry {
  id: string;
  contactId: string;
  type: "call" | "email" | "meeting" | "note" | "deal-update" | "task";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export function buildContactTimeline(contactId: string): ContactTimelineEntry[] {
  const now = Date.now();
  return [
    { id: `tl-1`, contactId, type: "email", title: "Follow-up email sent", description: "Re: Q2 proposal review", timestamp: new Date(now - 2 * 86400000).toISOString() },
    { id: `tl-2`, contactId, type: "call", title: "Discovery call", description: "30min — discussed requirements and timeline", timestamp: new Date(now - 5 * 86400000).toISOString() },
    { id: `tl-3`, contactId, type: "meeting", title: "In-person demo", description: "Product walkthrough with stakeholders", timestamp: new Date(now - 10 * 86400000).toISOString() },
    { id: `tl-4`, contactId, type: "deal-update", title: "Deal moved to negotiation", description: "Proposal accepted — entering contract review", timestamp: new Date(now - 12 * 86400000).toISOString() },
  ];
}

export function enrichContact(contact: CRMContact): CRMContact & { enriched: boolean; socialProfiles: string[] } {
  return { ...contact, enriched: true, socialProfiles: ["linkedin", "twitter"] };
}

export function mergeContacts(primary: CRMContact, duplicate: CRMContact): CRMContact {
  return { ...primary, email: primary.email || duplicate.email };
}
