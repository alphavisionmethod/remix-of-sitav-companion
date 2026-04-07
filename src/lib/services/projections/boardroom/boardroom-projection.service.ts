// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Projection Service
// Session readiness + packet summaries
// ═══════════════════════════════════════════════════════════════

export interface BoardroomProjection {
  timestamp: string;
  nextSession: { scheduledAt: string; templateId: string; readinessScore: number };
  packetStatus: PacketStatus[];
  carryoverItems: number;
  pendingDecisions: number;
  lastSessionSummary: { date: string; decisions: number; carryovers: number };
}

export interface PacketStatus {
  domain: string;
  packetType: string;
  ready: boolean;
  staleDataWarnings: number;
  lastUpdated: string;
}

export function generateBoardroomProjection(): BoardroomProjection {
  return {
    timestamp: new Date().toISOString(),
    nextSession: {
      scheduledAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      templateId: "weekly-executive",
      readinessScore: 78,
    },
    packetStatus: [
      { domain: "business", packetType: "business-packet", ready: true, staleDataWarnings: 0, lastUpdated: new Date(Date.now() - 3600000).toISOString() },
      { domain: "finance", packetType: "finance-packet", ready: true, staleDataWarnings: 1, lastUpdated: new Date(Date.now() - 7200000).toISOString() },
      { domain: "concierge", packetType: "family-packet", ready: false, staleDataWarnings: 2, lastUpdated: new Date(Date.now() - 86400000).toISOString() },
    ],
    carryoverItems: 3,
    pendingDecisions: 2,
    lastSessionSummary: { date: new Date(Date.now() - 86400000 * 7).toISOString(), decisions: 5, carryovers: 2 },
  };
}

