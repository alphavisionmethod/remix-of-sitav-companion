// SITA OS — Finance Packet Service
import type { DomainId } from "@/packages/contracts";
import type { ServiceBoardroomPacket } from "./business-packet.service";

export function generateFinancePacket(): ServiceBoardroomPacket {
  return {
    id: crypto.randomUUID(), domain: "finance", generatedAt: new Date().toISOString(), confidence: 0.91,
    staleWarnings: ["Investment positions 6h stale"],
    sections: [
      { title: "Cash Position", content: "Total liquid: $232K. Checking $145K, Savings $87K.", dataPoints: { totalLiquid: 232000, checking: 145000, savings: 87000 }, confidence: 0.95 },
      { title: "Obligations", content: "$3,450 due within 7 days. 1 overdue invoice ($890).", dataPoints: { dueSoon: 3450, overdueCount: 1, overdueAmount: 890 }, confidence: 0.92 },
      { title: "Reserves", content: "Emergency fund 69% funded ($87K of $126K target).", dataPoints: { funded: 87000, target: 126000, pct: 69 }, confidence: 0.95 },
      { title: "Subscriptions", content: "3 flagged as potential waste ($125/mo combined).", dataPoints: { flagged: 3, wasteMonthlyCents: 12500 }, confidence: 0.78 },
    ],
    advisorTracks: [
      { advisorId: "money-advisor", position: "Allocate $5K to reserves this month to reach 73% funded", confidence: 0.92 },
      { advisorId: "strategy-advisor", position: "Review subscription waste — $1,500/yr potential savings", confidence: 0.8 },
    ],
  };
}
