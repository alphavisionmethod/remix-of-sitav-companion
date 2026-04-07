// SITA OS — Committee Packet Service
import type { ServiceBoardroomPacket } from "./business-packet.service";

export function generateCommitteePacket(): ServiceBoardroomPacket {
  return {
    id: crypto.randomUUID(), domain: "finance", generatedAt: new Date().toISOString(), confidence: 0.85,
    staleWarnings: [],
    sections: [
      { title: "Portfolio Overview", content: "Total AUM $243K. YTD return 8.2%. Sharpe 1.4.", dataPoints: { aum: 243000, ytdReturn: 8.2, sharpe: 1.4 }, confidence: 0.9 },
      { title: "Risk Assessment", content: "Portfolio VaR (95%) $12K. Max drawdown 6.8%.", dataPoints: { var95: 12000, maxDrawdown: 6.8 }, confidence: 0.88 },
      { title: "Market Regime", content: "Current regime: BULL. Transition probability to sideways: 25%.", dataPoints: { regime: "bull", transitionProb: 0.25 }, confidence: 0.72 },
    ],
    advisorTracks: [
      { advisorId: "money-advisor", position: "Maintain current allocation — regime supports growth positioning", confidence: 0.82 },
      { advisorId: "strategy-advisor", position: "Consider hedging 10% of equity exposure given regime transition risk", confidence: 0.68, dissent: "money-advisor disagrees — sees transition probability as low" },
    ],
  };
}

