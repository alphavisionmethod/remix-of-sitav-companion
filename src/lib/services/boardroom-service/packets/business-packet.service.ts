// SITA OS — Business Packet Service
import type { DomainId } from "@/packages/contracts";
export interface ServiceBoardroomPacket { id: string; domain: DomainId; generatedAt: string; sections: PacketSection[]; advisorTracks: AdvisorTrack[]; confidence: number; staleWarnings: string[] }
export interface PacketSection { title: string; content: string; dataPoints: Record<string, unknown>; confidence: number }
export interface AdvisorTrack { advisorId: string; position: string; confidence: number; dissent?: string }

export function generateBusinessPacket(): ServiceBoardroomPacket {
  return {
    id: crypto.randomUUID(), domain: "business", generatedAt: new Date().toISOString(), confidence: 0.84,
    staleWarnings: [],
    sections: [
      { title: "Pipeline Health", content: "23 active deals worth $1.24M weighted. 3 deals stalled >14 days.", dataPoints: { deals: 23, weightedValue: 1245000, stalledDeals: 3 }, confidence: 0.88 },
      { title: "Customer Health", content: "5 accounts at risk representing $234K ARR. Avg health score: 74.", dataPoints: { atRisk: 5, avgHealth: 74, churnRiskArr: 234000 }, confidence: 0.82 },
      { title: "Revenue Trajectory", content: "MTD $873K vs $1.12M target. YoY growth 18.5%.", dataPoints: { mtd: 873000, target: 1120000, yoyGrowth: 18.5 }, confidence: 0.9 },
    ],
    advisorTracks: [
      { advisorId: "business-advisor", position: "Focus retention on top 5 at-risk accounts — $234K ARR exposure", confidence: 0.85 },
      { advisorId: "strategy-advisor", position: "Prioritize upsell to healthy accounts before quarter end", confidence: 0.78 },
    ],
  };
}

