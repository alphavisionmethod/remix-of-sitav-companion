// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Boardroom
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/components/mobile/MobileShell";
import { MobileAdvisorBoard } from "@/components/advisors/MobileAdvisorBoard";
import type { AdvisorConfig } from "@/components/advisors/AdvisorCouncilShell";

const MOBILE_ADVISORS: AdvisorConfig[] = [
  { id: "biz-1", advisorId: "strategy", name: "Strategy", domain: "business", role: "Business Strategy Advisor", status: "active", confidence: 82, mission: "Revenue up 12% MTD. 3 deals closing worth $28K.", specialAbility: "Pipeline forecasting" },
  { id: "fin-1", advisorId: "finance", name: "Finance", domain: "money", role: "Financial Operations Advisor", status: "active", confidence: 91, mission: "Cash position healthy. $8,240 safe-to-spend.", specialAbility: "Waste detection" },
  { id: "ops-1", advisorId: "concierge", name: "Operations", domain: "concierge", role: "Household Ops Advisor", status: "active", confidence: 74, mission: "6 active tasks, 1 overdue. Calendar conflict Thursday.", specialAbility: "Schedule optimization" },
  { id: "growth-1", advisorId: "growth", name: "Growth", domain: "growth", role: "Growth & Opportunity Advisor", status: "idle", confidence: 68, mission: "Monitoring 3 market signals for expansion.", specialAbility: "Market signal detection" },
  { id: "risk-1", advisorId: "trust", name: "Risk", domain: "trust", role: "Risk & Trust Advisor", status: "active", confidence: 88, mission: "No critical risks. 1 compliance item due.", specialAbility: "Compliance scanning" },
];

const MobileBoardroom = () => (
  <MobileShell title="Boardroom">
    <MobileAdvisorBoard advisors={MOBILE_ADVISORS} />
  </MobileShell>
);

export default MobileBoardroom;
