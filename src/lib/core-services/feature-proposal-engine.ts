// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Proposal Engine
// Structured proposal system: create/review/approve/reject
// proposals for workflows, packs, dashboards, shell spaces
// with simulation-first execution and receipt trails
// ═══════════════════════════════════════════════════════════════

import { createReceiptService, type ReceiptService } from "./receipt-service";

// ── Types ───────────────────────────────────────────────────────

export type ProposalCategory = "workflow" | "pack" | "dashboard" | "shell-space" | "automation" | "integration";
export type ProposalStatus = "draft" | "simulated" | "previewed" | "approved" | "rejected" | "executed" | "rolled-back";
export type ProposalRisk = "low" | "medium" | "high" | "critical";

export interface ProposalChange {
  target: string;
  action: "create" | "modify" | "remove" | "configure";
  description: string;
  reversible: boolean;
  impactedModules: string[];
}

export interface SimulationResult {
  passed: boolean;
  warnings: string[];
  estimatedImpact: string;
  sideEffects: string[];
  rollbackSteps: string[];
  durationMs: number;
}

export interface FeatureProposal {
  id: string;
  title: string;
  description: string;
  category: ProposalCategory;
  status: ProposalStatus;
  risk: ProposalRisk;
  proposedBy: "sita" | "user";
  changes: ProposalChange[];
  simulation?: SimulationResult;
  receiptId?: string;
  reasoning: string;
  createdAt: number;
  updatedAt: number;
}

// ── Risk Classification ─────────────────────────────────────────

function classifyRisk(changes: ProposalChange[]): ProposalRisk {
  const hasIrreversible = changes.some((c) => !c.reversible);
  const highImpact = changes.some((c) => c.impactedModules.length > 2);
  const isRemoval = changes.some((c) => c.action === "remove");

  if (hasIrreversible && isRemoval) return "critical";
  if (hasIrreversible || highImpact) return "high";
  if (changes.length > 3) return "medium";
  return "low";
}

// ── Feature Proposal Engine ─────────────────────────────────────

export class FeatureProposalEngine {
  private proposals: FeatureProposal[] = [];
  private receipts: ReceiptService;

  constructor(receiptService?: ReceiptService) {
    this.receipts = receiptService ?? createReceiptService();
  }

  // ── Create ─────────────────────────────────────────────────────

  propose(
    title: string,
    description: string,
    category: ProposalCategory,
    changes: ProposalChange[],
    reasoning: string,
    proposedBy: "sita" | "user" = "sita"
  ): FeatureProposal {
    const proposal: FeatureProposal = {
      id: crypto.randomUUID(),
      title,
      description,
      category,
      status: "draft",
      risk: classifyRisk(changes),
      proposedBy,
      changes,
      reasoning,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.proposals.push(proposal);
    return proposal;
  }

  // ── Simulate ───────────────────────────────────────────────────

  async simulate(proposalId: string): Promise<SimulationResult | null> {
    const proposal = this.proposals.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "draft") return null;

    // Scaffold: deterministic simulation based on risk
    const result: SimulationResult = {
      passed: proposal.risk !== "critical",
      warnings: proposal.risk === "high" ? ["High-impact changes detected — review carefully"] : [],
      estimatedImpact: `Affects ${proposal.changes.reduce((sum, c) => sum + c.impactedModules.length, 0)} modules`,
      sideEffects: proposal.changes.filter((c) => !c.reversible).map((c) => `Irreversible: ${c.description}`),
      rollbackSteps: proposal.changes.filter((c) => c.reversible).map((c) => `Undo: ${c.description}`),
      durationMs: Math.floor(Math.random() * 200) + 50,
    };

    proposal.simulation = result;
    proposal.status = "simulated";
    proposal.updatedAt = Date.now();
    return result;
  }

  // ── Preview ────────────────────────────────────────────────────

  preview(proposalId: string): FeatureProposal | null {
    const proposal = this.proposals.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "simulated") return null;

    proposal.status = "previewed";
    proposal.updatedAt = Date.now();
    return { ...proposal };
  }

  // ── Approve / Reject ───────────────────────────────────────────

  async approve(proposalId: string): Promise<boolean> {
    const proposal = this.proposals.find((p) => p.id === proposalId);
    if (!proposal || !["simulated", "previewed"].includes(proposal.status)) return false;
    if (!proposal.simulation?.passed) return false;

    proposal.status = "approved";
    proposal.updatedAt = Date.now();

    await this.receipts.createReceipt(proposalId, "approval-record", {
      title: proposal.title,
      category: proposal.category,
      risk: proposal.risk,
      changesCount: proposal.changes.length,
    });

    return true;
  }

  reject(proposalId: string, reason?: string): boolean {
    const proposal = this.proposals.find((p) => p.id === proposalId);
    if (!proposal || proposal.status === "executed") return false;

    proposal.status = "rejected";
    proposal.updatedAt = Date.now();
    return true;
  }

  // ── Execute ────────────────────────────────────────────────────

  async execute(proposalId: string): Promise<{ success: boolean; receiptId?: string }> {
    const proposal = this.proposals.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "approved") return { success: false };

    const receipt = await this.receipts.createReceipt(proposalId, "execution-summary", {
      title: proposal.title,
      category: proposal.category,
      changes: proposal.changes.map((c) => c.description),
      risk: proposal.risk,
    });

    proposal.status = "executed";
    proposal.receiptId = receipt.id;
    proposal.updatedAt = Date.now();

    return { success: true, receiptId: receipt.id };
  }

  // ── Rollback ───────────────────────────────────────────────────

  async rollback(proposalId: string): Promise<boolean> {
    const proposal = this.proposals.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "executed") return false;

    const allReversible = proposal.changes.every((c) => c.reversible);
    if (!allReversible) return false;

    proposal.status = "rolled-back";
    proposal.updatedAt = Date.now();

    await this.receipts.createReceipt(proposalId, "refusal", {
      title: proposal.title,
      reason: "Rollback executed",
    });

    return true;
  }

  // ── Queries ────────────────────────────────────────────────────

  getProposals(status?: ProposalStatus): FeatureProposal[] {
    if (status) return this.proposals.filter((p) => p.status === status);
    return [...this.proposals];
  }

  getProposal(id: string): FeatureProposal | null {
    return this.proposals.find((p) => p.id === id) ?? null;
  }

  getPendingCount(): number {
    return this.proposals.filter((p) => ["draft", "simulated", "previewed"].includes(p.status)).length;
  }

  // ── SITA Auto-Proposals (contextual) ───────────────────────────

  generateContextualProposals(module: string): FeatureProposal[] {
    const proposals: FeatureProposal[] = [];

    if (module === "finance") {
      proposals.push(
        this.propose(
          "Auto-categorize recurring expenses",
          "Create a workflow that automatically tags recurring transactions by vendor pattern.",
          "workflow",
          [{ target: "expense-categorizer", action: "create", description: "Add pattern-based expense categorization", reversible: true, impactedModules: ["finance"] }],
          "Detected 23 uncategorized recurring charges in the last 30 days."
        )
      );
    }

    if (module === "business") {
      proposals.push(
        this.propose(
          "Lead scoring dashboard widget",
          "Add a visual lead scoring widget to the pipeline view.",
          "dashboard",
          [{ target: "pipeline-dashboard", action: "modify", description: "Add lead score heatmap widget", reversible: true, impactedModules: ["business"] }],
          "Your pipeline has 45+ leads — a scoring view would help prioritize."
        )
      );
    }

    if (module === "dashboard") {
      proposals.push(
        this.propose(
          "Weekly digest automation",
          "Schedule an automated weekly email digest of key metrics.",
          "automation",
          [{ target: "digest-scheduler", action: "create", description: "Create weekly metric digest workflow", reversible: true, impactedModules: ["dashboard", "notifications"] }],
          "You check the dashboard daily — a weekly summary could save time."
        )
      );
    }

    return proposals;
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createFeatureProposalEngine(receiptService?: ReceiptService): FeatureProposalEngine {
  return new FeatureProposalEngine(receiptService);
}
