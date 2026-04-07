// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Chain Orchestrator
// Extracted from core-services/index.ts
// Orchestrates: Intent → Policy → Workflow → Execution →
//               Verification → Receipt → Projection → Memory → Events
// With DB persistence at every step
// ═══════════════════════════════════════════════════════════════

import { evaluatePolicy, classifyRiskTier, type PolicyContext, type PolicyEvaluationResult } from "./policy-engine";
import { ExecutorService, createEnvelope, type ExecutionEnvelope } from "./executor-service";
import { ReceiptService, type Receipt } from "./receipt-service";
import type { ActionEnvelope as KernelActionEnvelope } from "@/packages/contracts/kernel/action-envelope";
import { WorkflowEngine, type WorkflowInstance, type ServiceWorkflowState as WorkflowState } from "./workflow-engine";
import { ProjectionService, type ProjectionEvent } from "./projection-service";
import { EventBus } from "./event-bus";
import { MemoryService } from "./memory-service";
import { VerificationEngine } from "./verification-engine";
import { TrustStateService } from "./trust-state-service";
import {
  persistChainReceipt,
  persistChainProof,
  persistChainEnvelope,
  persistChainProjection,
  persistChainApproval,
  persistChainEvent,
} from "./canonical-chain-persistence";
import {
  validateOwnerBoundary,
  validateIntake,
  validateSpec,
  validateCapabilityRegistration,
  validateSchemaRegistry,
  type OwnerBoundaryDeclaration,
  type FeatureIntake,
  type FeatureSpec,
  type CapabilityRegistration,
  type FeatureSchemaRegistry,
  type FeatureRiskTier,
} from "@/packages/feature-governance";

export interface CanonicalChainResult {
  correlationId: string;
  policyResult: PolicyEvaluationResult;
  workflow: WorkflowInstance;
  envelope?: ExecutionEnvelope;
  receipt?: Receipt;
  blocked: boolean;
  blockReason?: string;
  verificationPassed?: boolean;
  governanceErrors?: string[];
}

export interface CanonicalChainInput {
  intent: string;
  domain: string;
  capabilityId: string;
  payload: Record<string, unknown>;
  amount?: number;
  isSimulation?: boolean;
  hasStaleSources?: boolean;
  contradictionCount?: number;
  expectedResult?: Record<string, unknown>;
  governance?: {
    ownerDeclaration?: OwnerBoundaryDeclaration;
    intake?: Partial<FeatureIntake>;
    spec?: Partial<FeatureSpec>;
    capabilityRegistrations?: Partial<CapabilityRegistration>[];
    schemaRegistry?: Partial<FeatureSchemaRegistry>;
    riskTier?: FeatureRiskTier;
  };
}

export class CanonicalChainOrchestrator {
  private userId: string | null = null;

  constructor(
    private executor: ExecutorService,
    private receipts: ReceiptService,
    private workflows: WorkflowEngine,
    private projections: ProjectionService,
    private eventBus?: EventBus,
    private memory?: MemoryService,
    private verification?: VerificationEngine,
    private trustState?: TrustStateService
  ) {}

  /** Set the authenticated user ID for persistence */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  async execute(input: CanonicalChainInput): Promise<CanonicalChainResult> {
    const correlationId = crypto.randomUUID();

    // 0. Feature Governance Gate
    if (input.governance) {
      const governanceErrors: string[] = [];

      if (input.governance.ownerDeclaration) {
        const ownerResult = validateOwnerBoundary(input.governance.ownerDeclaration);
        governanceErrors.push(...ownerResult.errors);
      }
      if (input.governance.intake) {
        const intakeErrors = validateIntake(input.governance.intake);
        governanceErrors.push(...intakeErrors);
      }
      if (input.governance.spec) {
        const specErrors = validateSpec(input.governance.spec);
        governanceErrors.push(...specErrors);
      }
      if (input.governance.capabilityRegistrations) {
        for (const capReg of input.governance.capabilityRegistrations) {
          const capErrors = validateCapabilityRegistration(capReg);
          governanceErrors.push(...capErrors.map(e => `Capability: ${e}`));
        }
      }
      if (input.governance.schemaRegistry) {
        const tier = input.governance.riskTier ?? "R0";
        const schemaErrors = validateSchemaRegistry(input.governance.schemaRegistry, tier);
        governanceErrors.push(...schemaErrors.map(e => `Schema: ${e}`));
      }

      if (governanceErrors.length > 0) {
        await this.emitEvent("governance.rejected.v1", { errors: governanceErrors, capabilityId: input.capabilityId }, correlationId);
        const workflow = this.workflows.createWorkflow(input.capabilityId, input.payload, correlationId);
        this.workflows.transition(workflow.id, "failed", `Governance validation failed: ${governanceErrors.length} error(s)`);
        return {
          correlationId,
          policyResult: { effect: "deny", reason: "Governance validation failed", matchedRule: null, evaluatedRules: 0, evaluationTimeMs: 0 },
          workflow: this.workflows.getWorkflow(workflow.id)!,
          blocked: true,
          blockReason: `Governance gate: ${governanceErrors.join("; ")}`,
          governanceErrors,
        };
      }
      await this.emitEvent("governance.passed.v1", { capabilityId: input.capabilityId }, correlationId);
    }

    await this.emitEvent("intent.received.v1", { intent: input.intent, domain: input.domain, capabilityId: input.capabilityId }, correlationId);

    // 1. Create workflow
    const workflow = this.workflows.createWorkflow(input.capabilityId, input.payload, correlationId);
    this.workflows.transition(workflow.id, "proposed", "Intent classified");

    // 2. Evaluate policy
    const riskTier = classifyRiskTier(input.domain, input.capabilityId, input.amount);
    const policyContext: PolicyContext = {
      domain: input.domain, capabilityId: input.capabilityId, riskTier,
      amount: input.amount, isSimulation: input.isSimulation,
      hasStaleSources: input.hasStaleSources, contradictionCount: input.contradictionCount,
    };
    const policyResult = evaluatePolicy(policyContext);
    await this.emitEvent("policy.evaluated.v1", { effect: policyResult.effect, riskTier, rule: policyResult.matchedRule?.id }, correlationId);

    // 3. Handle policy decision
    if (policyResult.effect === "deny") {
      this.workflows.transition(workflow.id, "failed", policyResult.reason);
      const refusalReceipt = await this.receipts.createReceipt(correlationId, "refusal", {
        reason: policyResult.reason, riskTier, policyRule: policyResult.matchedRule?.id,
      });
      this.trustState?.reportFlag(input.domain, "policy-violation", "canonical-chain", policyResult.reason);
      await this.emitEvent("execution.denied.v1", { reason: policyResult.reason }, correlationId);
      // Persist refusal receipt
      if (this.userId) {
        persistChainReceipt(this.userId, refusalReceipt, input.domain).catch(() => {});
        persistChainEvent(this.userId, "execution.denied.v1", { reason: policyResult.reason }, correlationId, input.domain).catch(() => {});
      }
      return { correlationId, policyResult, workflow: this.workflows.getWorkflow(workflow.id)!, receipt: refusalReceipt, blocked: true, blockReason: policyResult.reason };
    }

    if (policyResult.effect === "require-approval" || policyResult.effect === "require-dual-approval") {
      this.workflows.transition(workflow.id, "drafted", "Policy requires approval");
      this.workflows.transition(workflow.id, "approval-requested", policyResult.reason);
      const approvalReceipt = await this.receipts.createReceipt(correlationId, "approval-record", {
        effect: policyResult.effect, reason: policyResult.reason, riskTier, awaitingApproval: true,
      });
      await this.emitEvent("approval.requested.v1", { effect: policyResult.effect, reason: policyResult.reason }, correlationId);
      // Persist approval request
      if (this.userId) {
        persistChainReceipt(this.userId, approvalReceipt, input.domain).catch(() => {});
        persistChainApproval(this.userId, correlationId, `${input.intent} (${input.capabilityId})`, input.payload, riskTier, input.domain).catch(() => {});
      }
      return {
        correlationId, policyResult, workflow: this.workflows.getWorkflow(workflow.id)!, receipt: approvalReceipt,
        blocked: true, blockReason: `Awaiting ${policyResult.effect === "require-dual-approval" ? "dual " : ""}approval: ${policyResult.reason}`,
      };
    }

    if (policyResult.effect === "require-simulation" && !input.isSimulation) {
      this.workflows.transition(workflow.id, "drafted", "Policy requires simulation");
      return { correlationId, policyResult, workflow: this.workflows.getWorkflow(workflow.id)!, blocked: true, blockReason: "Simulation required before execution" };
    }

    // 4. Execute — with placeholder receipt lifecycle
    this.workflows.transition(workflow.id, "drafted", "Policy allowed");
    this.workflows.transition(workflow.id, "simulated", "Auto-simulated (policy allowed)");
    this.workflows.transition(workflow.id, "queued", "Ready for execution");
    this.workflows.transition(workflow.id, "executing", "Starting execution");

    // Create placeholder receipt BEFORE execution (sacred invariant)
    const placeholderReceipt = await this.receipts.createPlaceholder(
      correlationId, input.capabilityId, undefined
    );

    const envelope = createEnvelope(input.capabilityId, input.payload, {
      correlationId, mode: input.isSimulation ? "simulation" : "real",
      policyProof: { effect: policyResult.effect, rule: policyResult.matchedRule?.id },
    });

    // Mark placeholder as executing
    this.receipts.markExecuting(placeholderReceipt.id);

    const executedEnvelope = await this.executor.execute(envelope);

    // Finalize placeholder receipt
    await this.receipts.finalizeReceipt(placeholderReceipt.id, {
      status: executedEnvelope.status,
      envelopeId: executedEnvelope.id,
    }, executedEnvelope.status === "failed" ? "failed" : "completed");

    // 5. Persist envelope
    if (this.userId) {
      persistChainEnvelope(this.userId, executedEnvelope, correlationId).catch(() => {});
    }

    // 6. Handle result
    if (executedEnvelope.status === "failed") {
      this.workflows.transition(workflow.id, "failed", "Execution failed", { errorDetails: executedEnvelope.errorDetails });
      await this.emitEvent("execution.failed.v1", { error: executedEnvelope.errorDetails }, correlationId);
    } else {
      let verificationPassed = true;
      if (this.verification && executedEnvelope.result) {
        const verResult = this.verification.verify(correlationId, input.capabilityId, executedEnvelope.id, input.expectedResult ?? {}, executedEnvelope.result as Record<string, unknown>);
        verificationPassed = verResult.passed;
        // Persist verification proof
        if (this.userId) {
          persistChainProof(this.userId, correlationId, verificationPassed ? "verification-passed" : "verification-failed", input.capabilityId, { passed: verificationPassed, rollbackRecommended: verResult.rollbackRecommended }, input.domain).catch(() => {});
        }
        if (verResult.rollbackRecommended) {
          this.workflows.transition(workflow.id, "failed", `Verification failed: ${verResult.rollbackReason}`);
          await this.emitEvent("verification.failed.v1", { reason: verResult.rollbackReason, rollbackRecommended: true }, correlationId);
          const failReceipt = await this.receipts.createReceipt(correlationId, "verification-failure", { capabilityId: input.capabilityId, rollbackRecommended: true, reason: verResult.rollbackReason });
          if (this.userId) persistChainReceipt(this.userId, failReceipt, input.domain).catch(() => {});
          return { correlationId, policyResult, workflow: this.workflows.getWorkflow(workflow.id)!, envelope: executedEnvelope, receipt: failReceipt, blocked: false, verificationPassed: false };
        }
      }

      this.workflows.transition(workflow.id, "completed", "Execution succeeded", { result: executedEnvelope.result });
      await this.emitEvent("execution.completed.v1", { status: "success", verificationPassed }, correlationId);

      if (this.memory && executedEnvelope.result) {
        this.memory.store(`execution.${input.capabilityId}`, executedEnvelope.result, { source: "canonical-chain", tags: [input.domain, input.capabilityId], confidence: 1.0 });
      }
      this.trustState?.recordVerification(input.domain, "canonical-chain");
    }

    // 7. Receipt + persist
    const receipt = await this.receipts.createReceipt(correlationId, "execution-summary", {
      capabilityId: input.capabilityId, mode: envelope.mode, status: executedEnvelope.status,
      result: executedEnvelope.result, durationMs: executedEnvelope.durationMs,
    }, { capabilityId: input.capabilityId, envelopeId: executedEnvelope.id });
    await this.emitEvent("receipt.created.v1", { receiptId: receipt.id }, correlationId);
    if (this.userId) {
      persistChainReceipt(this.userId, receipt, input.domain).catch(() => {});
    }

    // 8. Projections + persist
    const projEvent: ProjectionEvent = {
      id: crypto.randomUUID(), topic: `execution.completed.v1`,
      payload: { domain: input.domain, capabilityId: input.capabilityId, ...executedEnvelope.result },
      timestamp: Date.now(), source: "canonical-chain",
    };
    const dailyProj = this.projections.applyEvent("daily-pulse", "default", projEvent);
    if (this.userId) {
      persistChainProjection(this.userId, dailyProj, input.domain).catch(() => {});
    }
    if (input.domain === "finance") {
      const finProj = this.projections.applyEvent("finance-dashboard", "default", projEvent);
      if (this.userId) persistChainProjection(this.userId, finProj, "finance").catch(() => {});
    }

    return { correlationId, policyResult, workflow: this.workflows.getWorkflow(workflow.id)!, envelope: executedEnvelope, receipt, blocked: false, verificationPassed: true };
  }

  private async emitEvent(topic: string, payload: Record<string, unknown>, correlationId: string): Promise<void> {
    if (this.eventBus) {
      await this.eventBus.publish(topic, payload, { source: "canonical-chain", correlationId });
    }
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createCanonicalChain(options?: { withEventBus?: boolean; withMemory?: boolean; withVerification?: boolean; withTrust?: boolean }) {
  const executor = new ExecutorService();
  const receipts = new ReceiptService();
  const workflows = new WorkflowEngine();
  const projections = new ProjectionService();
  const eventBus = options?.withEventBus !== false ? new EventBus() : undefined;
  const memory = options?.withMemory !== false ? new MemoryService() : undefined;
  const verification = options?.withVerification !== false ? new VerificationEngine() : undefined;
  const trustState = options?.withTrust !== false ? new TrustStateService() : undefined;
  return { orchestrator: new CanonicalChainOrchestrator(executor, receipts, workflows, projections, eventBus, memory, verification, trustState), executor, receipts, workflows, projections, eventBus, memory, verification, trustState };
}
