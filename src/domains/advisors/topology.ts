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

// Deterministic photorealistic portraits via pravatar.cc
// Each advisor gets a unique seed for a consistent, professional headshot
const AVATAR_SEEDS: Record<string, number> = {
  "biz-revenue": 12,
  "biz-relationship": 32,
  "biz-followthrough": 52,
  "biz-support": 15,
  "biz-collections": 60,
  "biz-operations": 68,
  "fin-obligations": 25,
  "fin-spending": 44,
  "fin-planning": 36,
  "fin-reserve": 50,
  "fin-approvals": 20,
  "fin-receivables": 57,
  "con-lifeadmin": 29,
  "con-travel": 47,
  "con-logistics": 53,
  "con-support": 38,
  "con-prep": 65,
  "con-household": 42,
};

function photorealisticAvatar(id: string, size = 128): string {
  const seed = AVATAR_SEEDS[id] || 1;
  return `https://i.pravatar.cc/${size}?img=${seed}`;
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
      { id: "biz-revenue", name: "Revenue Advisor", role: "Revenue & Growth", specialty: "Revenue optimization, upsell timing, pricing strategy", accentColor: "hsl(265 55% 58%)", emoji: "📈", avatarUrl: photorealisticAvatar("biz-revenue") },
      { id: "biz-relationship", name: "Relationship Advisor", role: "CRM & Retention", specialty: "Customer health, churn prevention, engagement scoring", accentColor: "hsl(210 70% 55%)", emoji: "🤝", avatarUrl: photorealisticAvatar("biz-relationship") },
      { id: "biz-followthrough", name: "Follow-Through Advisor", role: "Execution & Tasks", specialty: "Pipeline velocity, task completion, deadline tracking", accentColor: "hsl(38 85% 58%)", emoji: "✅", avatarUrl: photorealisticAvatar("biz-followthrough") },
      { id: "biz-support", name: "Support Advisor", role: "Support & Escalation", specialty: "Queue pressure, SLA compliance, resolution speed", accentColor: "hsl(0 70% 55%)", emoji: "🎧", avatarUrl: photorealisticAvatar("biz-support") },
      { id: "biz-collections", name: "Collections Advisor", role: "AR & Collections", specialty: "Invoice aging, payment patterns, collection strategy", accentColor: "hsl(152 55% 48%)", emoji: "💰", avatarUrl: photorealisticAvatar("biz-collections") },
      { id: "biz-operations", name: "Operations Advisor", role: "Ops & Efficiency", specialty: "Process bottlenecks, resource allocation, automation ROI", accentColor: "hsl(280 50% 55%)", emoji: "⚙️", avatarUrl: photorealisticAvatar("biz-operations") },
    ],
  },
  finance: {
    domain: "finance",
    label: "Finance Advisory Board",
    advisors: [
      { id: "fin-obligations", name: "Obligations Advisor", role: "Bills & Payments", specialty: "Payment timing, obligation scheduling, cash preservation", accentColor: "hsl(152 55% 48%)", emoji: "📋", avatarUrl: photorealisticAvatar("fin-obligations") },
      { id: "fin-spending", name: "Spending Advisor", role: "Spending Intelligence", specialty: "Pattern detection, waste identification, category analysis", accentColor: "hsl(38 85% 58%)", emoji: "💳", avatarUrl: photorealisticAvatar("fin-spending") },
      { id: "fin-planning", name: "Planning Advisor", role: "Budget & Forecast", specialty: "Budget adherence, scenario modeling, projection accuracy", accentColor: "hsl(210 70% 55%)", emoji: "📊", avatarUrl: photorealisticAvatar("fin-planning") },
      { id: "fin-reserve", name: "Reserve Advisor", role: "Savings & Reserves", specialty: "Emergency fund health, savings velocity, target tracking", accentColor: "hsl(265 55% 58%)", emoji: "🏦", avatarUrl: photorealisticAvatar("fin-reserve") },
      { id: "fin-approvals", name: "Approvals Advisor", role: "Payment Review", specialty: "Approval workflow, risk flagging, authorization patterns", accentColor: "hsl(0 70% 55%)", emoji: "✓", avatarUrl: photorealisticAvatar("fin-approvals") },
      { id: "fin-receivables", name: "Receivables Advisor", role: "Income & AR", specialty: "Income timing, receivable aging, collection optimization", accentColor: "hsl(180 50% 45%)", emoji: "📥", avatarUrl: photorealisticAvatar("fin-receivables") },
    ],
  },
  concierge: {
    domain: "concierge",
    label: "Concierge Advisory Board",
    advisors: [
      { id: "con-lifeadmin", name: "Life Admin Advisor", role: "Admin Relief", specialty: "Document deadlines, renewal tracking, compliance", accentColor: "hsl(285 55% 55%)", emoji: "📝", avatarUrl: photorealisticAvatar("con-lifeadmin") },
      { id: "con-travel", name: "Travel Advisor", role: "Travel & Planning", specialty: "Trip preparation, booking optimization, document readiness", accentColor: "hsl(210 70% 55%)", emoji: "✈️", avatarUrl: photorealisticAvatar("con-travel") },
      { id: "con-logistics", name: "Logistics Advisor", role: "Errands & Routes", specialty: "Errand batching, route optimization, time savings", accentColor: "hsl(38 85% 58%)", emoji: "🚗", avatarUrl: photorealisticAvatar("con-logistics") },
      { id: "con-support", name: "Support Load Advisor", role: "Burden Reduction", specialty: "Task delegation, automation opportunities, load balancing", accentColor: "hsl(0 70% 55%)", emoji: "⚖️", avatarUrl: photorealisticAvatar("con-support") },
      { id: "con-prep", name: "Prep Advisor", role: "Preparation", specialty: "Appointment prep, document gathering, checklist management", accentColor: "hsl(152 55% 48%)", emoji: "📦", avatarUrl: photorealisticAvatar("con-prep") },
      { id: "con-household", name: "Household Advisor", role: "Home & Family", specialty: "Household coordination, family scheduling, resource sharing", accentColor: "hsl(265 55% 58%)", emoji: "🏠", avatarUrl: photorealisticAvatar("con-household") },
    ],
  },
};

export function getAdvisorRoster(domain: string): DomainAdvisorRoster {
  return ADVISOR_ROSTERS[domain] || ADVISOR_ROSTERS.business;
}
