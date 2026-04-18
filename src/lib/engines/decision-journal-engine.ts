// ═══════════════════════════════════════════════════════════════
// SITA OS — Decision Journal Engine
// Tracks every strategic decision, its rationale, and outcomes
// ═══════════════════════════════════════════════════════════════

export type DecisionOutcome = "pending" | "successful" | "partially_successful" | "failed" | "superseded";
export type DecisionCategory = "revenue" | "cost" | "growth" | "risk" | "operations" | "client" | "strategy";

export interface DecisionEntry {
  id: string;
  title: string;
  description: string;
  category: DecisionCategory;
  advisorId: string;
  advisorName: string;
  decidedAt: string;
  rationale: string;
  alternatives: string[];
  expectedOutcome: string;
  actualOutcome: string;
  outcome: DecisionOutcome;
  confidence: number;
  impact: number; // dollars, positive or negative
  lessonsLearned: string;
  tags: string[];
  linkedDecisions: string[];
}

export interface DecisionJournalSnapshot {
  totalDecisions: number;
  successRate: number;
  totalImpact: number;
  avgConfidence: number;
  categoryBreakdown: { category: DecisionCategory; count: number; successRate: number; impact: number }[];
  recentDecisions: DecisionEntry[];
  pendingReview: DecisionEntry[];
  topLessons: string[];
  monthlyHistory: { month: string; decisions: number; successRate: number; impact: number }[];
}

function generateDecisions(): DecisionEntry[] {
  return [
    {
      id: "d1", title: "Implement tiered pricing model", description: "Restructured pricing from flat-rate to 3-tier model based on usage and value delivered",
      category: "revenue", advisorId: "cfo-advisor", advisorName: "CFO Advisor",
      decidedAt: "2026-02-15", rationale: "Analysis showed 40% of clients were underpaying relative to value received. Tiered model captures more value while maintaining fairness.",
      alternatives: ["Keep flat rate with annual increase", "Usage-only billing", "Value-based custom pricing"],
      expectedOutcome: "15-20% revenue increase within 2 quarters", actualOutcome: "18% revenue increase achieved in 6 weeks, 2 clients upgraded voluntarily",
      outcome: "successful", confidence: 0.85, impact: 42000, lessonsLearned: "Clients responded better to clear value tiers than expected. Transparency in pricing builds trust.",
      tags: ["pricing", "revenue", "strategic"], linkedDecisions: ["d5"],
    },
    {
      id: "d2", title: "Aggressive collection on 60+ day receivables", description: "Implemented automated collection workflow for invoices overdue by 60+ days",
      category: "cost", advisorId: "cfo-advisor", advisorName: "CFO Advisor",
      decidedAt: "2026-03-01", rationale: "Cash flow analysis showed $48K in aging receivables threatening runway. Early intervention reduces write-offs.",
      alternatives: ["Send reminders only", "Hire collection agency", "Offer payment plans first"],
      expectedOutcome: "Recover 70%+ of outstanding receivables", actualOutcome: "Recovered $36K (75%) within 30 days, maintained all client relationships",
      outcome: "successful", confidence: 0.78, impact: 36000, lessonsLearned: "Structured escalation (reminder → call → plan) works better than aggressive collection. Relationship preservation matters.",
      tags: ["collections", "cash-flow"], linkedDecisions: [],
    },
    {
      id: "d3", title: "Launch LinkedIn thought leadership campaign", description: "Weekly content series positioning as industry expert in target vertical",
      category: "growth", advisorId: "growth-strategist", advisorName: "Growth Strategist",
      decidedAt: "2026-01-20", rationale: "Competitor analysis showed gap in educational content for our target market. Low-cost, high-leverage growth channel.",
      alternatives: ["Paid advertising focus", "Conference speaking circuit", "Referral incentive program"],
      expectedOutcome: "5-8 qualified leads per month from organic", actualOutcome: "Averaging 6 leads/month, 2 closed deals directly attributed",
      outcome: "successful", confidence: 0.72, impact: 28000, lessonsLearned: "Consistency matters more than individual post quality. Case studies perform 3x better than thought pieces.",
      tags: ["marketing", "content", "lead-gen"], linkedDecisions: ["d6"],
    },
    {
      id: "d4", title: "Delay expansion into healthcare vertical", description: "Postponed healthcare market entry by 6 months to strengthen existing operations",
      category: "strategy", advisorId: "risk-advisor", advisorName: "Risk & Compliance Advisor",
      decidedAt: "2026-03-10", rationale: "Compliance requirements for healthcare are 3x more complex. Current team lacks bandwidth. Rushing creates liability.",
      alternatives: ["Enter immediately with consultant support", "Partner with healthcare specialist firm", "Abandon healthcare entirely"],
      expectedOutcome: "Stronger foundation for expansion, reduced compliance risk", actualOutcome: "Ongoing — team building compliance knowledge, preliminary vendor relationships established",
      outcome: "pending", confidence: 0.88, impact: 0, lessonsLearned: "",
      tags: ["expansion", "risk", "healthcare"], linkedDecisions: [],
    },
    {
      id: "d5", title: "Automate client onboarding workflow", description: "Built self-service onboarding portal replacing manual 5-step process",
      category: "operations", advisorId: "operations-advisor", advisorName: "Operations Advisor",
      decidedAt: "2026-02-28", rationale: "Manual onboarding took 12 hours per client. Automation reduces to 2 hours with better consistency.",
      alternatives: ["Hire dedicated onboarding specialist", "Outsource onboarding", "Keep manual with checklist"],
      expectedOutcome: "80% reduction in onboarding time, improved client satisfaction", actualOutcome: "Reduced onboarding from 12 to 3 hours. NPS for new clients increased from 72 to 88.",
      outcome: "successful", confidence: 0.82, impact: 15000, lessonsLearned: "Self-service with human touchpoints at key moments beats fully manual or fully automated.",
      tags: ["automation", "onboarding", "efficiency"], linkedDecisions: ["d1"],
    },
    {
      id: "d6", title: "Proactive churn intervention for Meridian LLC", description: "Initiated retention protocol after engagement drop detected",
      category: "client", advisorId: "client-advisor", advisorName: "Client Success Advisor",
      decidedAt: "2026-04-02", rationale: "Engagement metrics dropped 60% in 90 days. Historical pattern matches pre-churn behavior. Proactive outreach has 65% save rate.",
      alternatives: ["Wait for client to raise concerns", "Offer immediate discount", "Assign dedicated account manager"],
      expectedOutcome: "Retain client and identify root cause", actualOutcome: "Meeting scheduled but not yet held",
      outcome: "pending", confidence: 0.75, impact: 0, lessonsLearned: "",
      tags: ["retention", "churn", "client-success"], linkedDecisions: [],
    },
    {
      id: "d7", title: "Renegotiate SaaS tool stack", description: "Consolidated 6 SaaS tools into 3 with annual commitments for savings",
      category: "cost", advisorId: "operations-advisor", advisorName: "Operations Advisor",
      decidedAt: "2026-01-15", rationale: "Tool audit revealed 40% overlap in functionality. Consolidation saves $18K/year and reduces context switching.",
      alternatives: ["Keep all tools", "Build in-house replacements", "Switch to all-in-one platform"],
      expectedOutcome: "$15-20K annual savings", actualOutcome: "$18.2K saved annually, team reports improved workflow",
      outcome: "successful", confidence: 0.80, impact: 18200, lessonsLearned: "Annual audit of tool spend should be standard practice. Team input on consolidation prevents productivity loss.",
      tags: ["cost-optimization", "tools", "efficiency"], linkedDecisions: [],
    },
  ];
}

class DecisionJournalEngine {
  private decisions: DecisionEntry[];

  constructor() {
    this.decisions = generateDecisions();
  }

  getSnapshot(): DecisionJournalSnapshot {
    const completed = this.decisions.filter(d => d.outcome !== "pending");
    const successful = completed.filter(d => d.outcome === "successful" || d.outcome === "partially_successful");
    const totalImpact = this.decisions.reduce((s, d) => s + d.impact, 0);

    const categories: DecisionCategory[] = ["revenue", "cost", "growth", "risk", "operations", "client", "strategy"];
    const categoryBreakdown = categories.map(cat => {
      const catDecisions = this.decisions.filter(d => d.category === cat);
      const catCompleted = catDecisions.filter(d => d.outcome !== "pending");
      const catSuccess = catCompleted.filter(d => d.outcome === "successful" || d.outcome === "partially_successful");
      return {
        category: cat,
        count: catDecisions.length,
        successRate: catCompleted.length > 0 ? +(catSuccess.length / catCompleted.length).toFixed(2) : 0,
        impact: catDecisions.reduce((s, d) => s + d.impact, 0),
      };
    }).filter(c => c.count > 0);

    const lessons = completed.filter(d => d.lessonsLearned).map(d => d.lessonsLearned);

    return {
      totalDecisions: this.decisions.length,
      successRate: completed.length > 0 ? +(successful.length / completed.length).toFixed(2) : 0,
      totalImpact, avgConfidence: +(this.decisions.reduce((s, d) => s + d.confidence, 0) / this.decisions.length).toFixed(2),
      categoryBreakdown,
      recentDecisions: [...this.decisions].sort((a, b) => b.decidedAt.localeCompare(a.decidedAt)),
      pendingReview: this.decisions.filter(d => d.outcome === "pending"),
      topLessons: lessons.slice(0, 5),
      monthlyHistory: [
        { month: "Jan", decisions: 2, successRate: 1.0, impact: 33200 },
        { month: "Feb", decisions: 2, successRate: 1.0, impact: 57000 },
        { month: "Mar", decisions: 2, successRate: 0.5, impact: 36000 },
        { month: "Apr", decisions: 1, successRate: 0, impact: 0 },
      ],
    };
  }

  getDecisions(): DecisionEntry[] { return this.decisions; }
  getDecision(id: string): DecisionEntry | undefined { return this.decisions.find(d => d.id === id); }

  updateOutcome(id: string, outcome: DecisionOutcome, actualOutcome: string, impact: number, lessons: string): void {
    const decision = this.decisions.find(d => d.id === id);
    if (!decision) return;
    decision.outcome = outcome;
    decision.actualOutcome = actualOutcome;
    decision.impact = impact;
    decision.lessonsLearned = lessons;
  }
}

let instance: DecisionJournalEngine | null = null;
export function getDecisionJournalEngine(): DecisionJournalEngine {
  if (!instance) instance = new DecisionJournalEngine();
  return instance;
}
