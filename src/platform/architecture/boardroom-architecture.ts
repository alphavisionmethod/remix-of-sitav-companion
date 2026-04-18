// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Product Architecture
// Governed strategic decision environment, not decorative chat.
// ═══════════════════════════════════════════════════════════════

export interface BoardroomSession {
  sessionId: string;
  tenantId: string;
  topic: string;
  type: "strategy" | "crisis" | "investment" | "operational" | "risk-review" | "quarterly";
  status: "convening" | "deliberating" | "voting" | "decided" | "executing" | "closed";
  convener: string;                  // who opened the session
  participants: BoardroomParticipant[];
  proposals: BoardroomProposal[];
  dissents: BoardroomDissent[];
  simulations: BoardroomSimulation[];
  evidencePack: string[];            // proof IDs
  decision?: BoardroomDecision;
  minutes: BoardroomMinutes;
  followThrough: FollowThroughItem[];
  createdAt: string;
  closedAt?: string;
}

export interface BoardroomParticipant {
  principalId: string;
  role: "chair" | "advisor" | "stakeholder" | "observer";
  advisorId?: string;               // if AI advisor
  domain?: string;
  votingRights: boolean;
}

export interface BoardroomProposal {
  proposalId: string;
  title: string;
  summary: string;
  rationale: string;
  options: ProposalOptionItem[];
  riskAnalysis: string;
  costEstimate: number;
  evidenceRefs: string[];
  advisorRecommendations: Array<{
    advisorId: string;
    recommendation: string;
    confidence: number;
    dissent: boolean;
  }>;
  simulationResults?: string;
  status: "draft" | "presented" | "debated" | "voted" | "approved" | "rejected";
  createdAt: string;
}

export interface ProposalOptionItem {
  optionId: string;
  label: string;
  description: string;
  pros: string[];
  cons: string[];
  estimatedImpact: string;
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface BoardroomDissent {
  dissentId: string;
  participantId: string;
  proposalId: string;
  reason: string;
  alternativeProposal?: string;
  severity: "minor" | "significant" | "blocking";
  acknowledged: boolean;
  resolvedAt?: string;
  createdAt: string;
}

export interface BoardroomSimulation {
  simulationId: string;
  proposalId: string;
  scenario: string;
  inputs: Record<string, unknown>;
  projectedOutcome: string;
  confidenceScore: number;
  riskFactors: string[];
  executedAt: string;
}

export interface BoardroomDecision {
  decisionId: string;
  selectedProposalId: string;
  selectedOptionId?: string;
  votingRecord: Array<{
    participantId: string;
    vote: "approve" | "reject" | "abstain";
    reason?: string;
  }>;
  consensusScore: number;
  conditions: string[];              // conditions attached to approval
  approvalRoutingRequired: boolean;
  approvalId?: string;               // links to approval-service
  decidedAt: string;
}

export interface BoardroomMinutes {
  minutesId: string;
  sessionId: string;
  summary: string;
  keyDiscussions: Array<{ topic: string; outcome: string }>;
  decisionsRecorded: string[];
  actionItems: string[];
  dissentsRecorded: string[];
  receiptIds: string[];              // formal receipts generated
  generatedAt: string;
}

export interface FollowThroughItem {
  itemId: string;
  sessionId: string;
  decisionId: string;
  action: string;
  assignedTo: string;
  capabilityId?: string;             // links to capability contract
  status: "pending" | "in-progress" | "completed" | "blocked" | "overdue";
  dueDate?: string;
  completedAt?: string;
  proofId?: string;                  // proof of completion
}

// ── Boardroom → Execution Chain Bridge ──────────────────────

export interface BoardroomActionPackage {
  packageId: string;
  sessionId: string;
  decisionId: string;
  followThroughItems: FollowThroughItem[];
  capabilityContracts: string[];     // capability IDs to execute
  proposalId: string;
  evidencePack: string[];
  approvalId?: string;
  status: "ready" | "executing" | "completed" | "partial" | "blocked";
  createdAt: string;
}

export function createActionPackage(
  session: BoardroomSession,
): BoardroomActionPackage | null {
  if (!session.decision) return null;

  const readyItems = session.followThrough.filter(f => f.status === "pending" && f.capabilityId);

  return {
    packageId: crypto.randomUUID(),
    sessionId: session.sessionId,
    decisionId: session.decision.decisionId,
    followThroughItems: readyItems,
    capabilityContracts: readyItems.map(f => f.capabilityId!),
    proposalId: session.decision.selectedProposalId,
    evidencePack: session.evidencePack,
    approvalId: session.decision.approvalId,
    status: "ready",
    createdAt: new Date().toISOString(),
  };
}
