// SITA OS — Opportunity Packet Service
import type { ServiceBoardroomPacket } from "./business-packet.service";

export function generateOpportunityPacket(): ServiceBoardroomPacket {
  return {
    id: crypto.randomUUID(), domain: "cross-domain", generatedAt: new Date().toISOString(), confidence: 0.72,
    staleWarnings: [],
    sections: [
      { title: "Revenue Opportunities", content: "3 upsell opportunities worth $50K combined.", dataPoints: { count: 3, totalValue: 50000 }, confidence: 0.75 },
      { title: "Cost Savings", content: "Subscription consolidation could save $1,500/yr.", dataPoints: { savingsAnnual: 1500 }, confidence: 0.8 },
      { title: "Risk Mitigation", content: "2 accounts need proactive outreach to prevent churn.", dataPoints: { atRiskAccounts: 2, revenuAtRisk: 45000 }, confidence: 0.7 },
    ],
    advisorTracks: [
      { advisorId: "business-advisor", position: "Prioritize Acme Corp renewal — highest value at risk", confidence: 0.82 },
      { advisorId: "money-advisor", position: "Cancel unused SaaS tools — immediate $125/mo savings", confidence: 0.88 },
    ],
  };
}
