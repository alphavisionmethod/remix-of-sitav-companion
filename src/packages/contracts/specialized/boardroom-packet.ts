// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Boardroom Packet
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export interface BoardroomSection {
  id: string;
  title: string;
  content: string;
  priority: number;
  confidence: number;
  dataFreshness: string;
}

export interface AdvisorTrack {
  advisorId: string;
  domain: DomainId;
  position: string;
  confidence: number;
  reasoning: string[];
  recommendations: string[];
}

export interface Disagreement {
  topic: string;
  advisorA: { id: string; position: string; confidence: number };
  advisorB: { id: string; position: string; confidence: number };
  severity: "material" | "minor";
}

export interface CarryoverItem {
  id: string;
  topic: string;
  fromSessionId: string;
  ageCount: number;
  status: "open" | "resolved" | "escalated";
}

export interface DecisionRecord {
  id: string;
  sessionId: string;
  topic: string;
  decision: string;
  advisorInputs: string[];
  outcome?: string;
  timestamp: string;
}

export interface SpecializedBoardroomPacket {
  id: string;
  templateId: string;
  domain: DomainId;
  generatedAt: string;
  sections: BoardroomSection[];
  advisorTracks: AdvisorTrack[];
  disagreements: Disagreement[];
  carryoverItems: CarryoverItem[];
  decisionMemory: DecisionRecord[];
  confidenceScore: number;
}
