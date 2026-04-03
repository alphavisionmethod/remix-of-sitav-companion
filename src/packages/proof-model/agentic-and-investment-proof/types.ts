export interface InvestmentProof {
  id: string;
  tradeId: string;
  asset: string;
  direction: "buy" | "sell";
  amountCents: number;
  venue: string;
  executionPrice: number;
  thesisId?: string;
  riskBudgetSnapshot: { used: number; remaining: number };
  complianceCheckPassed: boolean;
  approvalId: string;
  executedAt: string;
  hash: string;
  previousHash: string;
}

export interface SimulationProof {
  id: string;
  scenarioName: string;
  inputs: Record<string, unknown>;
  outputSummary: string;
  projectedImpactCents: number;
  riskLevel: string;
  confidence: number;
  modelVersion: string;
  simulatedAt: string;
  hash: string;
  requestedBy: string;
}

export interface ExecutionIntentProof {
  id: string;
  intentId: string;
  tradeReviewId: string;
  asset: string;
  direction: "buy" | "sell";
  amountCents: number;
  venue: string;
  orderType: string;
  approvedBy: string;
  approvedAt: string;
  submittedAt?: string;
  status: "approved" | "submitted" | "filled" | "cancelled";
  hash: string;
}

export interface RegimeReviewProof {
  id: string;
  regime: string;
  previousRegime: string;
  transitionSignals: { indicator: string; value: number }[];
  postureChange: string;
  reviewedAt: string;
  reviewedBy: string;
  confidence: number;
  hash: string;
  linkedDecisionIds: string[];
}
