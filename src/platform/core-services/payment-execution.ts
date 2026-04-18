// ═══════════════════════════════════════════════════════════════
// SITA OS — Payment Execution Service
// Policy-gated payment orchestration with approval, simulation,
// receipt generation, and fraud pre-check
// ═══════════════════════════════════════════════════════════════

export type PaymentMethod = "ach" | "wire" | "card" | "check" | "crypto" | "internal-transfer";
export type PaymentStatus = "draft" | "pending-approval" | "approved" | "processing" | "completed" | "failed" | "reversed" | "held-for-review";

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  fromAccountId: string;
  toAccountId?: string;
  recipientName: string;
  method: PaymentMethod;
  description: string;
  invoiceId?: string;
  scheduledDate?: number;
  recurring?: boolean;
  frequency?: "weekly" | "biweekly" | "monthly" | "quarterly";
}

export interface PaymentExecution {
  id: string;
  intentId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  method: PaymentMethod;
  recipientName: string;
  approvalRequired: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
  approvedBy?: string;
  fraudCheckResult?: FraudCheckResult;
  simulationResult?: PaymentSimulation;
  receiptId?: string;
  executedAt?: number;
  createdAt: number;
  errorDetails?: string;
}

export interface PaymentSimulation {
  projectedBalance: number;
  safeToSpend: boolean;
  impactsReserves: boolean;
  cashPositionAfter: number;
  riskFlags: string[];
  recommendation: "proceed" | "delay" | "split" | "reject";
  alternativeDate?: number;
}

export interface FraudCheckResult {
  passed: boolean;
  score: number;          // 0-100, higher = riskier
  flags: string[];
  requiresManualReview: boolean;
}

// ── Fraud Pre-Check ─────────────────────────────────────────────

export function performFraudCheck(intent: PaymentIntent, historicalPayments: PaymentExecution[] = []): FraudCheckResult {
  const flags: string[] = [];
  let score = 0;

  // Large amount
  if (intent.amount > 10000) { score += 20; flags.push("Large payment amount"); }
  if (intent.amount > 50000) { score += 30; flags.push("Very large payment — elevated review"); }

  // New recipient
  const knownRecipients = new Set(historicalPayments.map(p => p.recipientName.toLowerCase()));
  if (!knownRecipients.has(intent.recipientName.toLowerCase())) {
    score += 15;
    flags.push("New recipient — not in payment history");
  }

  // Crypto
  if (intent.method === "crypto") { score += 25; flags.push("Crypto payment method — irreversible"); }

  // Wire
  if (intent.method === "wire") { score += 10; flags.push("Wire transfer — difficult to reverse"); }

  // Unusual timing
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) { score += 10; flags.push("Unusual payment time"); }

  // Rapid successive payments
  const recentPayments = historicalPayments.filter(p => p.executedAt && Date.now() - p.executedAt < 3600000);
  if (recentPayments.length > 3) { score += 20; flags.push("Multiple payments in last hour"); }

  return {
    passed: score < 50,
    score: Math.min(100, score),
    flags,
    requiresManualReview: score >= 30,
  };
}

// ── Payment Simulation ──────────────────────────────────────────

export function simulatePayment(intent: PaymentIntent, currentBalance: number, reserveMinimum: number): PaymentSimulation {
  const projectedBalance = currentBalance - intent.amount;
  const safeToSpend = projectedBalance > reserveMinimum;
  const impactsReserves = projectedBalance < reserveMinimum * 1.2;
  const riskFlags: string[] = [];

  if (!safeToSpend) riskFlags.push("Payment would breach reserve minimum");
  if (impactsReserves) riskFlags.push("Payment impacts reserve buffer zone");
  if (projectedBalance < 0) riskFlags.push("Insufficient funds");

  let recommendation: PaymentSimulation["recommendation"] = "proceed";
  if (projectedBalance < 0) recommendation = "reject";
  else if (!safeToSpend) recommendation = "delay";
  else if (impactsReserves && intent.amount > 5000) recommendation = "split";

  return {
    projectedBalance,
    safeToSpend,
    impactsReserves,
    cashPositionAfter: projectedBalance,
    riskFlags,
    recommendation,
    alternativeDate: recommendation === "delay" ? Date.now() + 7 * 86400000 : undefined,
  };
}

// ── Payment Execution Service ───────────────────────────────────

export class PaymentExecutionService {
  private executions = new Map<string, PaymentExecution>();
  private history: PaymentExecution[] = [];

  async preparePayment(intent: PaymentIntent, currentBalance: number, reserveMinimum: number): Promise<PaymentExecution> {
    const fraudCheck = performFraudCheck(intent, this.history);
    const simulation = simulatePayment(intent, currentBalance, reserveMinimum);

    const approvalRequired = intent.amount > 500 || fraudCheck.requiresManualReview || !simulation.safeToSpend || intent.method === "wire" || intent.method === "crypto";

    const status: PaymentStatus =
      fraudCheck.score >= 70 ? "held-for-review" :
      approvalRequired ? "pending-approval" : "approved";

    const execution: PaymentExecution = {
      id: crypto.randomUUID(),
      intentId: intent.id,
      status,
      amount: intent.amount,
      currency: intent.currency,
      method: intent.method,
      recipientName: intent.recipientName,
      approvalRequired,
      approvalStatus: approvalRequired ? "pending" : "approved",
      fraudCheckResult: fraudCheck,
      simulationResult: simulation,
      createdAt: Date.now(),
    };

    this.executions.set(execution.id, execution);
    return execution;
  }

  async approvePayment(executionId: string, approvedBy: string): Promise<PaymentExecution | undefined> {
    const exec = this.executions.get(executionId);
    if (!exec || exec.status !== "pending-approval") return undefined;

    exec.approvalStatus = "approved";
    exec.approvedBy = approvedBy;
    exec.status = "approved";
    return exec;
  }

  async executePayment(executionId: string): Promise<PaymentExecution | undefined> {
    const exec = this.executions.get(executionId);
    if (!exec || exec.status !== "approved") return undefined;

    exec.status = "processing";

    // Simulate execution delay
    exec.status = "completed";
    exec.executedAt = Date.now();
    exec.receiptId = `rcpt-${exec.id.slice(0, 8)}`;
    this.history.push(exec);

    return exec;
  }

  getExecution(id: string): PaymentExecution | undefined {
    return this.executions.get(id);
  }

  getHistory(): PaymentExecution[] {
    return [...this.history];
  }
}
