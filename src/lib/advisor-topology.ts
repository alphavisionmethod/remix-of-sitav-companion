// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Topology
// Canonical advisor rosters per domain with roles and specializations
// ═══════════════════════════════════════════════════════════════

export interface AdvisorRole {
  id: string;
  name: string;
  role: string;
  specialty: string;
  accentColor: string;
  emoji: string;
  avatarUrl: string;
}

function makeAvatarUrl(name: string, accentColor: string): string {
  const bg = accentColor.replace(/[^0-9a-fA-F]/g, "").slice(0, 6) || "7c3aed";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=128&bold=true&format=svg`;
}

// Map accent HSL to hex for avatar generation
const accentHexMap: Record<string, string> = {
  "hsl(265 55% 58%)": "7c5cbf",
  "hsl(210 70% 55%)": "3b82c4",
  "hsl(38 85% 58%)": "d4a030",
  "hsl(0 70% 55%)": "c44040",
  "hsl(152 55% 48%)": "3dab78",
  "hsl(280 50% 55%)": "9945b8",
  "hsl(180 50% 45%)": "3aa3a3",
  "hsl(285 55% 55%)": "a040c0",
};

function hslToHex(hsl: string): string {
  return accentHexMap[hsl] || "7c3aed";
}

function avatarUrl(name: string, hsl: string): string {
  const hex = hslToHex(hsl);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${hex}&color=fff&size=128&bold=true&format=svg&rounded=true`;
}

export interface DomainAdvisorRoster {
  domain: string;
  label: string;
  advisors: AdvisorRole[];
}

export const ADVISOR_ROSTERS: Record<string, DomainAdvisorRoster> = {
  business: {
    domain: "business",
    label: "Business Advisory Board",
    advisors: [
      { id: "biz-revenue", name: "Revenue Advisor", role: "Revenue & Growth", specialty: "Revenue optimization, upsell timing, pricing strategy", accentColor: "hsl(265 55% 58%)", emoji: "📈", avatarUrl: avatarUrl("Revenue Advisor", "hsl(265 55% 58%)") },
      { id: "biz-relationship", name: "Relationship Advisor", role: "CRM & Retention", specialty: "Customer health, churn prevention, engagement scoring", accentColor: "hsl(210 70% 55%)", emoji: "🤝", avatarUrl: avatarUrl("Relationship Advisor", "hsl(210 70% 55%)") },
      { id: "biz-followthrough", name: "Follow-Through Advisor", role: "Execution & Tasks", specialty: "Pipeline velocity, task completion, deadline tracking", accentColor: "hsl(38 85% 58%)", emoji: "✅", avatarUrl: avatarUrl("Follow-Through Advisor", "hsl(38 85% 58%)") },
      { id: "biz-support", name: "Support Advisor", role: "Support & Escalation", specialty: "Queue pressure, SLA compliance, resolution speed", accentColor: "hsl(0 70% 55%)", emoji: "🎧", avatarUrl: avatarUrl("Support Advisor", "hsl(0 70% 55%)") },
      { id: "biz-collections", name: "Collections Advisor", role: "AR & Collections", specialty: "Invoice aging, payment patterns, collection strategy", accentColor: "hsl(152 55% 48%)", emoji: "💰", avatarUrl: avatarUrl("Collections Advisor", "hsl(152 55% 48%)") },
      { id: "biz-operations", name: "Operations Advisor", role: "Ops & Efficiency", specialty: "Process bottlenecks, resource allocation, automation ROI", accentColor: "hsl(280 50% 55%)", emoji: "⚙️", avatarUrl: avatarUrl("Operations Advisor", "hsl(280 50% 55%)") },
    ],
  },
  finance: {
    domain: "finance",
    label: "Finance Advisory Board",
    advisors: [
      { id: "fin-obligations", name: "Obligations Advisor", role: "Bills & Payments", specialty: "Payment timing, obligation scheduling, cash preservation", accentColor: "hsl(152 55% 48%)", emoji: "📋", avatarUrl: avatarUrl("Obligations Advisor", "hsl(152 55% 48%)") },
      { id: "fin-spending", name: "Spending Advisor", role: "Spending Intelligence", specialty: "Pattern detection, waste identification, category analysis", accentColor: "hsl(38 85% 58%)", emoji: "💳", avatarUrl: avatarUrl("Spending Advisor", "hsl(38 85% 58%)") },
      { id: "fin-planning", name: "Planning Advisor", role: "Budget & Forecast", specialty: "Budget adherence, scenario modeling, projection accuracy", accentColor: "hsl(210 70% 55%)", emoji: "📊", avatarUrl: avatarUrl("Planning Advisor", "hsl(210 70% 55%)") },
      { id: "fin-reserve", name: "Reserve Advisor", role: "Savings & Reserves", specialty: "Emergency fund health, savings velocity, target tracking", accentColor: "hsl(265 55% 58%)", emoji: "🏦", avatarUrl: avatarUrl("Reserve Advisor", "hsl(265 55% 58%)") },
      { id: "fin-approvals", name: "Approvals Advisor", role: "Payment Review", specialty: "Approval workflow, risk flagging, authorization patterns", accentColor: "hsl(0 70% 55%)", emoji: "✓", avatarUrl: avatarUrl("Approvals Advisor", "hsl(0 70% 55%)") },
      { id: "fin-receivables", name: "Receivables Advisor", role: "Income & AR", specialty: "Income timing, receivable aging, collection optimization", accentColor: "hsl(180 50% 45%)", emoji: "📥", avatarUrl: avatarUrl("Receivables Advisor", "hsl(180 50% 45%)") },
    ],
  },
  concierge: {
    domain: "concierge",
    label: "Concierge Advisory Board",
    advisors: [
      { id: "con-lifeadmin", name: "Life Admin Advisor", role: "Admin Relief", specialty: "Document deadlines, renewal tracking, compliance", accentColor: "hsl(285 55% 55%)", emoji: "📝", avatarUrl: avatarUrl("Life Admin Advisor", "hsl(285 55% 55%)") },
      { id: "con-travel", name: "Travel Advisor", role: "Travel & Planning", specialty: "Trip preparation, booking optimization, document readiness", accentColor: "hsl(210 70% 55%)", emoji: "✈️", avatarUrl: avatarUrl("Travel Advisor", "hsl(210 70% 55%)") },
      { id: "con-logistics", name: "Logistics Advisor", role: "Errands & Routes", specialty: "Errand batching, route optimization, time savings", accentColor: "hsl(38 85% 58%)", emoji: "🚗", avatarUrl: avatarUrl("Logistics Advisor", "hsl(38 85% 58%)") },
      { id: "con-support", name: "Support Load Advisor", role: "Burden Reduction", specialty: "Task delegation, automation opportunities, load balancing", accentColor: "hsl(0 70% 55%)", emoji: "⚖️", avatarUrl: avatarUrl("Support Load Advisor", "hsl(0 70% 55%)") },
      { id: "con-prep", name: "Prep Advisor", role: "Preparation", specialty: "Appointment prep, document gathering, checklist management", accentColor: "hsl(152 55% 48%)", emoji: "📦", avatarUrl: avatarUrl("Prep Advisor", "hsl(152 55% 48%)") },
      { id: "con-household", name: "Household Advisor", role: "Home & Family", specialty: "Household coordination, family scheduling, resource sharing", accentColor: "hsl(265 55% 58%)", emoji: "🏠", avatarUrl: avatarUrl("Household Advisor", "hsl(265 55% 58%)") },
    ],
  },
};

export function getAdvisorRoster(domain: string): DomainAdvisorRoster {
  return ADVISOR_ROSTERS[domain] || ADVISOR_ROSTERS.business;
}
