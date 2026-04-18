// ═══════════════════════════════════════════════════════════════
// SITA OS — Client Intelligence Engine
// Deep client relationship analysis, churn prediction, LTV modeling
// ═══════════════════════════════════════════════════════════════

export interface ClientProfile {
  id: string;
  name: string;
  company: string;
  revenue: number;
  lifetime: number; // months
  lastContact: number; // days ago
  satisfaction: number; // 0-100
  engagementScore: number; // 0-100
  churnRisk: number; // 0-1
  sentiment: "positive" | "neutral" | "negative" | "unknown";
  tier: "platinum" | "gold" | "silver" | "bronze";
  tags: string[];
  revenueHistory: { month: string; amount: number }[];
  interactions: ClientInteraction[];
  healthSignals: HealthSignal[];
}

export interface ClientInteraction {
  id: string;
  type: "call" | "email" | "meeting" | "support" | "invoice" | "proposal";
  date: string;
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  advisorInsight?: string;
}

export interface HealthSignal {
  id: string;
  type: "engagement_drop" | "payment_delay" | "support_spike" | "expansion" | "referral" | "complaint";
  severity: "info" | "warning" | "critical";
  message: string;
  detectedAt: string;
  resolved: boolean;
}

export interface ClientSegment {
  name: string;
  count: number;
  totalRevenue: number;
  avgSatisfaction: number;
  avgChurnRisk: number;
  color: string;
}

export interface ClientIntelligenceSnapshot {
  totalClients: number;
  totalRevenue: number;
  avgSatisfaction: number;
  avgChurnRisk: number;
  atRiskClients: number;
  expansionOpportunities: number;
  segments: ClientSegment[];
  topClients: ClientProfile[];
  atRiskList: ClientProfile[];
  recentSignals: HealthSignal[];
  npsScore: number;
  retentionRate: number;
  ltvAvg: number;
}

function generateClients(): ClientProfile[] {
  const clients: ClientProfile[] = [
    {
      id: "c1", name: "Sarah Chen", company: "Atlas Corp", revenue: 148000, lifetime: 24,
      lastContact: 3, satisfaction: 92, engagementScore: 88, churnRisk: 0.05,
      sentiment: "positive", tier: "platinum", tags: ["enterprise", "long-term", "referral-source"],
      revenueHistory: [
        { month: "Nov", amount: 11000 }, { month: "Dec", amount: 12500 },
        { month: "Jan", amount: 11800 }, { month: "Feb", amount: 13200 },
        { month: "Mar", amount: 14500 }, { month: "Apr", amount: 15000 },
      ],
      interactions: [
        { id: "i1", type: "meeting", date: "2026-04-12", summary: "Quarterly business review — expansion discussed", sentiment: "positive", advisorInsight: "Client signaled budget increase for Q3" },
        { id: "i2", type: "email", date: "2026-04-10", summary: "Follow-up on new service proposal", sentiment: "positive" },
      ],
      healthSignals: [
        { id: "hs1", type: "expansion", severity: "info", message: "Client discussing 40% budget increase for next quarter", detectedAt: "2026-04-12", resolved: false },
        { id: "hs2", type: "referral", severity: "info", message: "Referred 2 new prospects this month", detectedAt: "2026-04-08", resolved: false },
      ],
    },
    {
      id: "c2", name: "Marcus Webb", company: "Meridian LLC", revenue: 86000, lifetime: 18,
      lastContact: 28, satisfaction: 55, engagementScore: 32, churnRisk: 0.72,
      sentiment: "negative", tier: "gold", tags: ["mid-market", "at-risk"],
      revenueHistory: [
        { month: "Nov", amount: 8200 }, { month: "Dec", amount: 7800 },
        { month: "Jan", amount: 7100 }, { month: "Feb", amount: 6500 },
        { month: "Mar", amount: 5800 }, { month: "Apr", amount: 4200 },
      ],
      interactions: [
        { id: "i3", type: "support", date: "2026-03-18", summary: "Escalated complaint about delivery delays", sentiment: "negative", advisorInsight: "Urgent retention intervention needed" },
      ],
      healthSignals: [
        { id: "hs3", type: "engagement_drop", severity: "critical", message: "Engagement dropped 60% in 90 days", detectedAt: "2026-04-01", resolved: false },
        { id: "hs4", type: "payment_delay", severity: "warning", message: "Last 2 invoices paid 15+ days late", detectedAt: "2026-03-28", resolved: false },
        { id: "hs5", type: "complaint", severity: "critical", message: "Unresolved escalation from March", detectedAt: "2026-03-18", resolved: false },
      ],
    },
    {
      id: "c3", name: "Priya Sharma", company: "Nova Inc", revenue: 52000, lifetime: 12,
      lastContact: 5, satisfaction: 90, engagementScore: 85, churnRisk: 0.08,
      sentiment: "positive", tier: "silver", tags: ["growing", "tech"],
      revenueHistory: [
        { month: "Nov", amount: 3200 }, { month: "Dec", amount: 3800 },
        { month: "Jan", amount: 4500 }, { month: "Feb", amount: 5200 },
        { month: "Mar", amount: 6100 }, { month: "Apr", amount: 7200 },
      ],
      interactions: [
        { id: "i4", type: "meeting", date: "2026-04-10", summary: "Onboarding new team members to platform", sentiment: "positive" },
      ],
      healthSignals: [
        { id: "hs6", type: "expansion", severity: "info", message: "Revenue growing 25% month-over-month", detectedAt: "2026-04-05", resolved: false },
      ],
    },
    {
      id: "c4", name: "James Morton", company: "Cascade Group", revenue: 38000, lifetime: 8,
      lastContact: 35, satisfaction: 62, engagementScore: 40, churnRisk: 0.48,
      sentiment: "neutral", tier: "silver", tags: ["consulting"],
      revenueHistory: [
        { month: "Nov", amount: 4800 }, { month: "Dec", amount: 4600 },
        { month: "Jan", amount: 4800 }, { month: "Feb", amount: 4500 },
        { month: "Mar", amount: 4200 }, { month: "Apr", amount: 4000 },
      ],
      interactions: [
        { id: "i5", type: "email", date: "2026-03-10", summary: "Requested scope reduction for next quarter", sentiment: "neutral", advisorInsight: "Possible budget pressure — proactive outreach recommended" },
      ],
      healthSignals: [
        { id: "hs7", type: "engagement_drop", severity: "warning", message: "No contact in 35 days", detectedAt: "2026-04-14", resolved: false },
      ],
    },
    {
      id: "c5", name: "Elena Vasquez", company: "Pinnacle Health", revenue: 210000, lifetime: 36,
      lastContact: 7, satisfaction: 88, engagementScore: 78, churnRisk: 0.10,
      sentiment: "positive", tier: "platinum", tags: ["healthcare", "enterprise", "long-term"],
      revenueHistory: [
        { month: "Nov", amount: 17000 }, { month: "Dec", amount: 17500 },
        { month: "Jan", amount: 18000 }, { month: "Feb", amount: 17800 },
        { month: "Mar", amount: 18500 }, { month: "Apr", amount: 19000 },
      ],
      interactions: [
        { id: "i6", type: "call", date: "2026-04-08", summary: "Discussed compliance requirements for new module", sentiment: "positive" },
      ],
      healthSignals: [],
    },
    {
      id: "c6", name: "David Park", company: "Vertex Studios", revenue: 22000, lifetime: 6,
      lastContact: 12, satisfaction: 75, engagementScore: 65, churnRisk: 0.22,
      sentiment: "neutral", tier: "bronze", tags: ["creative", "new"],
      revenueHistory: [
        { month: "Nov", amount: 0 }, { month: "Dec", amount: 2800 },
        { month: "Jan", amount: 3500 }, { month: "Feb", amount: 3800 },
        { month: "Mar", amount: 4200 }, { month: "Apr", amount: 4500 },
      ],
      interactions: [
        { id: "i7", type: "proposal", date: "2026-04-03", summary: "Sent expanded services proposal", sentiment: "positive" },
      ],
      healthSignals: [],
    },
  ];
  return clients;
}

class ClientIntelligenceEngine {
  private clients: ClientProfile[];

  constructor() {
    this.clients = generateClients();
  }

  getSnapshot(): ClientIntelligenceSnapshot {
    const totalRevenue = this.clients.reduce((sum, c) => sum + c.revenue, 0);
    const avgSatisfaction = Math.round(this.clients.reduce((sum, c) => sum + c.satisfaction, 0) / this.clients.length);
    const avgChurnRisk = +(this.clients.reduce((sum, c) => sum + c.churnRisk, 0) / this.clients.length).toFixed(2);
    const atRiskClients = this.clients.filter(c => c.churnRisk > 0.4);
    const expansionClients = this.clients.filter(c => c.healthSignals.some(s => s.type === "expansion"));
    const allSignals = this.clients.flatMap(c => c.healthSignals).sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));

    const segments: ClientSegment[] = [
      { name: "Platinum", count: this.clients.filter(c => c.tier === "platinum").length, totalRevenue: this.clients.filter(c => c.tier === "platinum").reduce((s, c) => s + c.revenue, 0), avgSatisfaction: this.avgField(this.clients.filter(c => c.tier === "platinum"), "satisfaction"), avgChurnRisk: this.avgField(this.clients.filter(c => c.tier === "platinum"), "churnRisk"), color: "hsl(265 55% 58%)" },
      { name: "Gold", count: this.clients.filter(c => c.tier === "gold").length, totalRevenue: this.clients.filter(c => c.tier === "gold").reduce((s, c) => s + c.revenue, 0), avgSatisfaction: this.avgField(this.clients.filter(c => c.tier === "gold"), "satisfaction"), avgChurnRisk: this.avgField(this.clients.filter(c => c.tier === "gold"), "churnRisk"), color: "hsl(38 85% 58%)" },
      { name: "Silver", count: this.clients.filter(c => c.tier === "silver").length, totalRevenue: this.clients.filter(c => c.tier === "silver").reduce((s, c) => s + c.revenue, 0), avgSatisfaction: this.avgField(this.clients.filter(c => c.tier === "silver"), "satisfaction"), avgChurnRisk: this.avgField(this.clients.filter(c => c.tier === "silver"), "churnRisk"), color: "hsl(220 15% 65%)" },
      { name: "Bronze", count: this.clients.filter(c => c.tier === "bronze").length, totalRevenue: this.clients.filter(c => c.tier === "bronze").reduce((s, c) => s + c.revenue, 0), avgSatisfaction: this.avgField(this.clients.filter(c => c.tier === "bronze"), "satisfaction"), avgChurnRisk: this.avgField(this.clients.filter(c => c.tier === "bronze"), "churnRisk"), color: "hsl(25 60% 50%)" },
    ];

    return {
      totalClients: this.clients.length,
      totalRevenue, avgSatisfaction, avgChurnRisk,
      atRiskClients: atRiskClients.length,
      expansionOpportunities: expansionClients.length,
      segments,
      topClients: [...this.clients].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      atRiskList: atRiskClients,
      recentSignals: allSignals.slice(0, 8),
      npsScore: 72,
      retentionRate: 94.2,
      ltvAvg: Math.round(totalRevenue / this.clients.length * 2.5),
    };
  }

  getClients(): ClientProfile[] { return this.clients; }
  getClient(id: string): ClientProfile | undefined { return this.clients.find(c => c.id === id); }

  resolveSignal(clientId: string, signalId: string): void {
    const client = this.clients.find(c => c.id === clientId);
    if (!client) return;
    const signal = client.healthSignals.find(s => s.id === signalId);
    if (signal) signal.resolved = true;
  }

  private avgField(clients: ClientProfile[], field: "satisfaction" | "churnRisk"): number {
    if (clients.length === 0) return 0;
    return +(clients.reduce((s, c) => s + c[field], 0) / clients.length).toFixed(2);
  }
}

let instance: ClientIntelligenceEngine | null = null;
export function getClientIntelligenceEngine(): ClientIntelligenceEngine {
  if (!instance) instance = new ClientIntelligenceEngine();
  return instance;
}
