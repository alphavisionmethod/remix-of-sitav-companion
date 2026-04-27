// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Mobile Shell Pages (Phase 6 Truth Closure)
// Demo fixtures previously inlined into MobileBoardroom,
// MobileDeviceTrust, and MobileQuickCapture. Gated via isDemo
// in their consuming pages.
// ═══════════════════════════════════════════════════════════════
import "./_demo-source-marker";

export const MOCK_MOBILE_BOARDROOM_ADVISORS = [
  { id: "biz-1", advisorId: "strategy", name: "Strategy", domain: "business", role: "Business Strategy Advisor", status: "active" as const, confidence: 82, mission: "Revenue up 12% MTD. 3 deals closing worth $28K.", specialAbility: "Pipeline forecasting" },
  { id: "fin-1", advisorId: "finance", name: "Finance", domain: "money", role: "Financial Operations Advisor", status: "active" as const, confidence: 91, mission: "Cash position healthy. $8,240 safe-to-spend.", specialAbility: "Waste detection" },
  { id: "ops-1", advisorId: "concierge", name: "Operations", domain: "concierge", role: "Household Ops Advisor", status: "active" as const, confidence: 74, mission: "6 active tasks, 1 overdue. Calendar conflict Thursday.", specialAbility: "Schedule optimization" },
  { id: "growth-1", advisorId: "growth", name: "Growth", domain: "growth", role: "Growth & Opportunity Advisor", status: "idle" as const, confidence: 68, mission: "Monitoring 3 market signals for expansion.", specialAbility: "Market signal detection" },
  { id: "risk-1", advisorId: "trust", name: "Risk", domain: "trust", role: "Risk & Trust Advisor", status: "active" as const, confidence: 88, mission: "No critical risks. 1 compliance item due.", specialAbility: "Compliance scanning" },
];

export const MOCK_MOBILE_DEVICES = [
  { id: "dev-001", name: "This iPhone", platform: "iOS 18", trustLevel: "hardware-attested" as const, enrolledAt: "2026-03-15T10:00:00Z", lastSeenAt: "2026-04-09T08:30:00Z", isCurrentDevice: true, capabilities: ["biometric", "secure-enclave", "push"], fingerprint: "a3f8...c2d1" },
  { id: "dev-002", name: "MacBook Pro", platform: "macOS 15", trustLevel: "verified" as const, enrolledAt: "2026-03-10T14:00:00Z", lastSeenAt: "2026-04-08T22:15:00Z", isCurrentDevice: false, capabilities: ["biometric", "tpm", "push"], fingerprint: "b7e2...f4a9" },
  { id: "dev-003", name: "Work Laptop", platform: "Windows 11", trustLevel: "basic" as const, enrolledAt: "2026-04-01T09:00:00Z", lastSeenAt: "2026-04-07T17:00:00Z", isCurrentDevice: false, capabilities: ["push"], fingerprint: "c1d4...e8b3" },
];

export const MOCK_MOBILE_RECENT_CAPTURES = [
  { id: "cap-1", type: "note" as const, content: "Follow up with Johnson account re: Q2 renewal", timestamp: "2026-04-09T08:15:00Z", handedOff: true, workflowTarget: "tasks" },
  { id: "cap-2", type: "photo" as const, content: "Receipt scan — office supplies", timestamp: "2026-04-08T14:30:00Z", handedOff: true, workflowTarget: "receipts" },
  { id: "cap-3", type: "note" as const, content: "Meeting notes: product roadmap sync", timestamp: "2026-04-08T11:00:00Z", handedOff: false },
];
