// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Intelligence Packet Compiler
// Creates compact, reusable domain packets for agents
// instead of giant raw prompts.
// ═══════════════════════════════════════════════════════════════

export type DomainId =
  | "admin-ops"
  | "engineering"
  | "revenue-business"
  | "digital-presence"
  | "investment-finance"
  | "concierge-household"
  | "connectors-integrations"
  | "launch-deployment"
  | "compliance-trust";

export interface DomainIntelligencePacket {
  packetId: string;
  domain: DomainId;
  tenantId: string;
  compiledAt: string;
  expiresAt: string;
  version: number;

  // Canonical state
  canonicalState: Record<string, unknown>;
  stateHash: string;

  // Recent changes
  recentChanges: DomainChange[];
  changeSince: string;

  // Active constraints & risks
  activeConstraints: string[];
  activeRisks: DomainRisk[];

  // Evidence
  evidenceRefs: string[];

  // Prior recommendations
  previousRecommendations: PriorRecommendation[];

  // Unresolved
  unresolvedQuestions: string[];

  // Confidence
  confidenceProfile: ConfidenceProfile;

  // Efficiency
  tokenCount: number;                 // target: minimal
  compressionRatio: number;           // vs raw history
}

export interface DomainChange {
  field: string;
  description: string;
  materiality: "low" | "medium" | "high";
  timestamp: string;
}

export interface DomainRisk {
  riskId: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  mitigationStatus: "unmitigated" | "partial" | "mitigated";
}

export interface PriorRecommendation {
  recommendationId: string;
  content: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  confidence: number;
  createdAt: string;
}

export interface ConfidenceProfile {
  overall: number;                    // 0-100
  dataFreshness: number;
  reasoningQuality: number;
  evidenceStrength: number;
  consistencyScore: number;
}

// ── Compiler ────────────────────────────────────────────────

export function compileDomainPacket(
  domain: DomainId,
  tenantId: string,
  state: Record<string, unknown>,
  changes: DomainChange[],
  risks: DomainRisk[],
  priorRecs: PriorRecommendation[],
  unresolvedQuestions: string[],
  ttlMinutes: number = 60,
): DomainIntelligencePacket {
  const now = new Date();
  const stateStr = JSON.stringify(state);
  const hash = simpleHash(stateStr);

  return {
    packetId: `dip-${domain}-${Date.now()}`,
    domain,
    tenantId,
    compiledAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ttlMinutes * 60000).toISOString(),
    version: 1,
    canonicalState: state,
    stateHash: hash,
    recentChanges: changes,
    changeSince: new Date(now.getTime() - 24 * 3600000).toISOString(),
    activeConstraints: [],
    activeRisks: risks,
    evidenceRefs: [],
    previousRecommendations: priorRecs,
    unresolvedQuestions,
    confidenceProfile: {
      overall: 75,
      dataFreshness: 80,
      reasoningQuality: 70,
      evidenceStrength: 72,
      consistencyScore: 78,
    },
    tokenCount: Math.round(stateStr.length / 4),
    compressionRatio: 0.15, // target: 85% reduction vs raw
  };
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return `h-${Math.abs(h).toString(36)}`;
}

// ── Packet Freshness Check ──────────────────────────────────

export function isPacketFresh(packet: DomainIntelligencePacket): boolean {
  return new Date(packet.expiresAt).getTime() > Date.now();
}

export function packetNeedsRecompile(packet: DomainIntelligencePacket, currentStateHash: string): boolean {
  if (!isPacketFresh(packet)) return true;
  if (packet.stateHash !== currentStateHash) return true;
  return false;
}
