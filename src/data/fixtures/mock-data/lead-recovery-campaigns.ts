// ═══════════════════════════════════════════════════════════════
// SITA OS — Lead Recovery Campaigns (DEMO FIXTURE)
//
// These rows are demo-only. They are ONLY consumed by
// `LeadRecovery.tsx` when reality mode reports `isDemo === true`
// (Demo / Dev-Demo / Sandbox). They never feed live operator state.
// See `src/data/fixtures/mock-data/_demo-source-marker.ts`.
// ═══════════════════════════════════════════════════════════════

export interface LeadRecoveryCampaignFixture {
  id: number;
  name: string;
  status: "active" | "paused" | "draft";
  leads: number;
  recovered: number;
  revenue: string;
  costPerRecovery: string;
  roi: string;
  sequence: string;
  channels: ReadonlyArray<string>;
}

export const LEAD_RECOVERY_CAMPAIGNS: ReadonlyArray<LeadRecoveryCampaignFixture> = [
  { id: 1, name: "Cold Lead Winback",            status: "active", leads: 23, recovered: 4, revenue: "$18,400", costPerRecovery: "$12.50", roi: "32x", sequence: "5 emails over 14 days",        channels: ["email", "sms"] },
  { id: 2, name: "Proposal Follow-up",           status: "active", leads:  8, recovered: 2, revenue: "$9,200",  costPerRecovery: "$8.00",  roi: "28x", sequence: "3 emails + call reminder",     channels: ["email", "phone"] },
  { id: 3, name: "Past Client Re-engagement",    status: "paused", leads: 45, recovered: 7, revenue: "$31,500", costPerRecovery: "$15.00", roi: "20x", sequence: "Quarterly check-in",           channels: ["email", "linkedin"] },
  { id: 4, name: "Free Consultation Offer",      status: "draft",  leads:  0, recovered: 0, revenue: "$0",      costPerRecovery: "—",      roi: "—",   sequence: "Lead magnet + 4 nurture emails", channels: ["email"] },
] as const;