// ═══════════════════════════════════════════════════════════════
// SITA OS — Council Orchestrator Service
// Multi-advisor deliberation, consensus building, conflict resolution
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "@/packages/contracts";
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export type VotingPolicy = "majority" | "unanimous" | "weighted" | "supervisor-override";

export type DeliberationStatus = "convened" | "deliberating" | "voting" | "concluded" | "deadlocked" | "escalated";

export interface CouncilSession {
  id: string;
  councilId: string;
  topic: string;
  domain: DomainId;
  status: DeliberationStatus;
  members: CouncilMember[];
  opinions: CouncilOpinion[];
  votingPolicy: VotingPolicy;
  resolution?: CouncilResolution;
  startedAt: string;
  concludedAt?: string;
  durationMs: number;
  escalatedTo?: string;
}

export interface CouncilMember {
  id: string;
  name: string;
  role: "advisor" | "agent" | "supervisor";
  domain: DomainId;
  weight: number;
  voted: boolean;
}

export interface CouncilOpinion {
  memberId: string;
  memberName: string;
  position: "approve" | "reject" | "abstain" | "conditional";
  confidence: number;
  reasoning: string;
  conditions?: string[];
  risks?: string[];
  submittedAt: string;
}

export interface CouncilResolution {
  outcome: "approved" | "rejected" | "conditional" | "escalated" | "deferred";
  consensus: number; // 0-1
  summary: string;
  conditions: string[];
  dissent: string[];
  approvedBy: string[];
  rejectedBy: string[];
  receiptId?: string;
}

export interface ConflictReport {
  sessionId: string;
  conflictingMembers: { memberId: string; position: string }[];
  conflictType: "opinion" | "data" | "policy" | "priority";
  severity: "low" | "medium" | "high";
  resolution?: string;
}

export class CouncilOrchestratorService {
  private sessions: Map<string, CouncilSession> = new Map();
  private conflicts: ConflictReport[] = [];

  convene(councilId: string, topic: string, domain: DomainId, members: CouncilMember[], votingPolicy: VotingPolicy = "majority"): CouncilSession {
    const session: CouncilSession = {
      id: crypto.randomUUID(),
      councilId,
      topic,
      domain,
      status: "convened",
      members,
      opinions: [],
      votingPolicy,
      startedAt: new Date().toISOString(),
      durationMs: 0,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  submitOpinion(sessionId: string, opinion: Omit<CouncilOpinion, "submittedAt">): CouncilSession | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status === "concluded") return null;

    session.opinions.push({ ...opinion, submittedAt: new Date().toISOString() });
    const member = session.members.find(m => m.id === opinion.memberId);
    if (member) member.voted = true;

    session.status = "deliberating";

    // Detect conflicts
    const positions = new Set(session.opinions.map(o => o.position));
    if (positions.has("approve") && positions.has("reject")) {
      this.conflicts.push({
        sessionId,
        conflictingMembers: session.opinions.map(o => ({ memberId: o.memberId, position: o.position })),
        conflictType: "opinion",
        severity: session.opinions.filter(o => o.position === "reject").length > session.members.length / 2 ? "high" : "medium",
      });
    }

    // Auto-conclude if all members voted
    if (session.members.every(m => m.voted)) {
      return this.conclude(sessionId);
    }

    return session;
  }

  conclude(sessionId: string): CouncilSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.status = "voting";
    const resolution = this.resolveVotes(session);
    session.resolution = resolution;
    session.status = resolution.outcome === "escalated" ? "escalated" : "concluded";
    session.concludedAt = new Date().toISOString();
    session.durationMs = new Date(session.concludedAt).getTime() - new Date(session.startedAt).getTime();

    return session;
  }

  getSession(id: string): CouncilSession | null {
    return this.sessions.get(id) ?? null;
  }

  getActiveSessions(): CouncilSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status !== "concluded" && s.status !== "escalated");
  }

  getConflicts(sessionId?: string): ConflictReport[] {
    return sessionId ? this.conflicts.filter(c => c.sessionId === sessionId) : [...this.conflicts];
  }

  getStats(): { totalSessions: number; concluded: number; escalated: number; avgConsensus: number; avgDuration: number } {
    const sessions = Array.from(this.sessions.values());
    const concluded = sessions.filter(s => s.status === "concluded");
    return {
      totalSessions: sessions.length,
      concluded: concluded.length,
      escalated: sessions.filter(s => s.status === "escalated").length,
      avgConsensus: concluded.length > 0 ? concluded.reduce((s, c) => s + (c.resolution?.consensus ?? 0), 0) / concluded.length : 0,
      avgDuration: concluded.length > 0 ? concluded.reduce((s, c) => s + c.durationMs, 0) / concluded.length : 0,
    };
  }

  private resolveVotes(session: CouncilSession): CouncilResolution {
    const approvals = session.opinions.filter(o => o.position === "approve" || o.position === "conditional");
    const rejections = session.opinions.filter(o => o.position === "reject");
    const total = session.opinions.length;

    let outcome: CouncilResolution["outcome"];
    let consensus: number;

    switch (session.votingPolicy) {
      case "unanimous":
        outcome = rejections.length === 0 ? "approved" : total > 0 && approvals.length === 0 ? "rejected" : "escalated";
        consensus = approvals.length / Math.max(total, 1);
        break;
      case "supervisor-override": {
        const supervisor = session.opinions.find(o => session.members.find(m => m.id === o.memberId && m.role === "supervisor"));
        outcome = supervisor ? (supervisor.position === "approve" ? "approved" : "rejected") : (approvals.length > rejections.length ? "approved" : "rejected");
        consensus = supervisor ? 1 : approvals.length / Math.max(total, 1);
        break;
      }
      case "weighted": {
        const weightedApprove = approvals.reduce((s, o) => s + (session.members.find(m => m.id === o.memberId)?.weight ?? 1), 0);
        const weightedTotal = session.members.reduce((s, m) => s + m.weight, 0);
        outcome = weightedApprove >= weightedTotal * 0.5 ? "approved" : "rejected";
        consensus = weightedApprove / Math.max(weightedTotal, 1);
        break;
      }
      default:
        outcome = approvals.length > rejections.length ? "approved" : rejections.length > approvals.length ? "rejected" : "escalated";
        consensus = approvals.length / Math.max(total, 1);
    }

    const conditions = session.opinions
      .filter(o => o.position === "conditional" && o.conditions)
      .flatMap(o => o.conditions ?? []);

    return {
      outcome,
      consensus,
      summary: `${outcome} with ${Math.round(consensus * 100)}% consensus (${approvals.length}/${total} in favor)`,
      conditions,
      dissent: rejections.map(r => `${r.memberName}: ${r.reasoning}`),
      approvedBy: approvals.map(a => a.memberId),
      rejectedBy: rejections.map(r => r.memberId),
    };
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("council-orchestrator", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      sessions: Array.from(this.sessions.entries()),
      conflicts: this.conflicts,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.sessions) this.sessions = new Map(state.sessions as Iterable<[string, never]>) as typeof this.sessions;
    if (state.conflicts) this.conflicts = state.conflicts as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("council-orchestrator");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createCouncilOrchestrator(): CouncilOrchestratorService {
  return new CouncilOrchestratorService();
}

