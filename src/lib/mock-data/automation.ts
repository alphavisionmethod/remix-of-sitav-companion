// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Automation Center
// ═══════════════════════════════════════════════════════════════

export const MOCK_AUTOMATION_RULES = [
  { id: "1", name: "Send invoice reminders", trigger_event: "3 days before due date", steps: [{ action: "Email reminder to customer" }], active: true, domain: "Business" },
  { id: "2", name: "Auto-approve bills under $200", trigger_event: "New bill detected", steps: [{ action: "Pay if under threshold" }], active: true, domain: "Money" },
  { id: "3", name: "Grocery restock alerts", trigger_event: "Consumption pattern detected", steps: [{ action: "Create shopping list" }], active: true, domain: "Household" },
  { id: "4", name: "Lead follow-up drafts", trigger_event: "No contact in 24h", steps: [{ action: "Draft follow-up email" }], active: true, domain: "Business" },
  { id: "5", name: "Travel conflict detection", trigger_event: "New booking", steps: [{ action: "Alert if conflict" }], active: false, domain: "Concierge" },
];

export const MOCK_DELEGATIONS = [
  { action: "Invoice reminders", level: "Fully delegated", approvalNeeded: false, threshold: "All amounts" },
  { action: "Bill payments", level: "Threshold-based", approvalNeeded: true, threshold: "Under $200 auto, over $200 approval" },
  { action: "Lead follow-ups", level: "Draft for review", approvalNeeded: true, threshold: "All outbound comms" },
  { action: "Grocery orders", level: "Fully delegated", approvalNeeded: false, threshold: "Under $100" },
  { action: "Calendar scheduling", level: "Suggest only", approvalNeeded: true, threshold: "All changes" },
  { action: "Subscription cancellations", level: "Approval required", approvalNeeded: true, threshold: "Always" },
];
