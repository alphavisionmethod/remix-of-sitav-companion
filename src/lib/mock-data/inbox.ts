// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Inbox Capture
// ═══════════════════════════════════════════════════════════════

export const MOCK_INBOX_ITEMS = [
  { id: "ic1", rawText: "Schedule dentist appointment for kids next week", capturedAt: Date.now() - 3600000, source: "voice" as const, status: "pending" as const, suggestedDomain: "concierge" },
  { id: "ic2", rawText: "Follow up with Sarah Chen about the proposal", capturedAt: Date.now() - 7200000, source: "manual" as const, status: "routed" as const, suggestedDomain: "business" },
  { id: "ic3", rawText: "AWS bill is higher than usual this month — $520", capturedAt: Date.now() - 10800000, source: "email" as const, status: "pending" as const, suggestedDomain: "finance" },
  { id: "ic4", rawText: "Research summer camp options for July", capturedAt: Date.now() - 14400000, source: "manual" as const, status: "pending" as const, suggestedDomain: "concierge" },
  { id: "ic5", rawText: "New lead from website: techflow.io contact form", capturedAt: Date.now() - 18000000, source: "webhook" as const, status: "routed" as const, suggestedDomain: "business" },
];
