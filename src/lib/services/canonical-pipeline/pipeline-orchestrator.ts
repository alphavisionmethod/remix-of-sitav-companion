// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Pipeline Orchestrator
// Lightweight 9-stage canonical sequence for AI/task flows
// NOT a second brain — extends brain-core with explicit stages
// ═══════════════════════════════════════════════════════════════

import { conscienceGate, type GateVerdict, type GateRequest } from "@/lib/services/conscience-gate";
import { runCritique, logCritique, type CritiqueResult, type EvidenceSource } from "@/lib/services/conscience-gate/critique-loop";
import { getTaskContractOrThrow } from "@/lib/contracts/global-contracts-registry";

// ── Pipeline Stage Enum ────────────────────────────────────────

export enum PipelineStage {
  INTAKE = "intake",
  CONSCIENCE_GATE = "conscience_gate",
  RETRIEVAL = "retrieval",
  ROUTING = "routing",
  INFERENCE = "inference",
  TOOL_EXECUTION = "tool_execution",
  CRITIQUE = "critique",
  RETURN = "return",
  RECEIPT = "receipt",
}

// ── Pipeline Types ─────────────────────────────────────────────

export type PipelineStatus = "pending" | "running" | "completed" | "failed" | "blocked" | "caveat";

export interface StageRecord {
  stage: PipelineStage;
  status: PipelineStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  decision?: string;
  data?: Record<string, unknown>;
  error?: string;
}

export interface PipelineContext {
  pipelineId: string;
  correlationId: string;
  taskType: string;
  userId: string;
  tenantId: string;
  input: Record<string, unknown>;
  currentStage: PipelineStage;
  status: PipelineStatus;
  stages: StageRecord[];
  gateVerdict?: GateVerdict;
  retrievalContext?: Record<string, unknown>;
  routingDecision?: Record<string, unknown>;
  inferenceResult?: Record<string, unknown>;
  toolResult?: Record<string, unknown>;
  critiqueResult?: CritiqueResult;
  finalOutput?: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
  totalDurationMs?: number;
}

export interface PipelineTrace {
  pipelineId: string;
  correlationId: string;
  taskType: string;
  status: PipelineStatus;
  stages: StageRecord[];
  totalDurationMs: number;
  gateDecision?: string;
  critiqueRecommendation?: string;
  timestamp: string;
}

export interface PipelineRequest {
  taskType: string;
  userId: string;
  tenantId: string;
  input: Record<string, unknown>;
  correlationId?: string;
  evidenceSources?: EvidenceSource[];
  budgetContext?: { remainingCents: number; dailySpendCents: number; monthlySpendCents: number };
  onStageComplete?: (stage: PipelineStage, record: StageRecord) => void;
}

// ── Pipeline Orchestrator ──────────────────────────────────────

export class PipelineOrchestrator {
  private traceLog: PipelineTrace[] = [];

  async execute(request: PipelineRequest): Promise<PipelineContext> {
    const pipelineId = crypto.randomUUID();
    const correlationId = request.correlationId || crypto.randomUUID();
    const startTime = Date.now();

    const ctx: PipelineContext = {
      pipelineId,
      correlationId,
      taskType: request.taskType,
      userId: request.userId,
      tenantId: request.tenantId,
      input: request.input,
      currentStage: PipelineStage.INTAKE,
      status: "running",
      stages: [],
      startedAt: new Date().toISOString(),
    };

    try {
      // Stage 1: INTAKE
      await this.runStage(ctx, PipelineStage.INTAKE, async () => {
        const contract = getTaskContractOrThrow(request.taskType);
        return { decision: "accepted", data: { taskType: contract.taskType, domain: contract.domain, riskTier: contract.riskTier } };
      }, request.onStageComplete);

      // Stage 2: CONSCIENCE_GATE
      await this.runStage(ctx, PipelineStage.CONSCIENCE_GATE, async () => {
        const gateRequest: GateRequest = {
          taskType: request.taskType,
          userId: request.userId,
          tenantId: request.tenantId,
          input: request.input,
          correlationId,
          evidenceSources: request.evidenceSources?.map((s) => ({ type: s.type, id: s.id })),
          budgetContext: request.budgetContext,
        };
        const verdict = await conscienceGate.evaluate(gateRequest);
        ctx.gateVerdict = verdict;

        if (verdict.decision === "block" || verdict.decision === "refuse") {
          throw new Error(`ConscienceGate ${verdict.decision}: ${verdict.reasons.join("; ")}`);
        }
        return { decision: verdict.decision, data: { riskClass: verdict.riskClass, reasons: verdict.reasons } };
      }, request.onStageComplete);

      // Stage 3: RETRIEVAL (conditional)
      if (ctx.gateVerdict?.retrievalRequired) {
        await this.runStage(ctx, PipelineStage.RETRIEVAL, async () => {
          // Delegates to Mnemosyne ContextAssembler in production
          ctx.retrievalContext = { assembled: true, sources: request.evidenceSources?.length || 0 };
          return { decision: "retrieved", data: { sourcesUsed: request.evidenceSources?.length || 0 } };
        }, request.onStageComplete);
      } else {
        this.skipStage(ctx, PipelineStage.RETRIEVAL, "Not required by contract");
      }

      // Stage 4: ROUTING
      await this.runStage(ctx, PipelineStage.ROUTING, async () => {
        const hints = ctx.gateVerdict?.routingHints;
        ctx.routingDecision = {
          provider: hints?.preferredProvider || "openai",
          model: hints?.preferredModel || "gpt-4o-mini",
          routingClass: hints?.routingClass || "balanced",
          deterministicPath: hints?.deterministicPath || false,
        };
        return { decision: "routed", data: ctx.routingDecision };
      }, request.onStageComplete);

      // Stage 5: INFERENCE
      await this.runStage(ctx, PipelineStage.INFERENCE, async () => {
        // In production, delegates to InferenceEngine / ai-gateway edge function
        ctx.inferenceResult = {
          status: "completed",
          model: (ctx.routingDecision as Record<string, unknown>)?.model || "gpt-4o-mini",
          output: request.input, // Placeholder — real inference happens via edge function
          tokensUsed: 0,
          latencyMs: 0,
        };
        return { decision: "inferred", data: { model: (ctx.routingDecision as Record<string, unknown>)?.model } };
      }, request.onStageComplete);

      // Stage 6: TOOL_EXECUTION (conditional)
      if (ctx.gateVerdict?.approvalRequired) {
        await this.runStage(ctx, PipelineStage.TOOL_EXECUTION, async () => {
          // Delegates to DeskExecutor in production
          ctx.toolResult = { status: "pending_approval", message: "Approval required before execution" };
          return { decision: "awaiting_approval", data: ctx.toolResult };
        }, request.onStageComplete);
      } else {
        this.skipStage(ctx, PipelineStage.TOOL_EXECUTION, "No tool execution required");
      }

      // Stage 7: CRITIQUE (conditional)
      if (ctx.gateVerdict?.critiqueRequired) {
        await this.runStage(ctx, PipelineStage.CRITIQUE, async () => {
          const output = (ctx.inferenceResult as Record<string, unknown>) || {};
          const critique = runCritique(output, request.taskType, request.evidenceSources);
          logCritique(critique);
          ctx.critiqueResult = critique;

          if (critique.recommendation === "reject") {
            throw new Error(`CritiqueLoop rejected output: ${critique.issues.map((i) => i.message).join("; ")}`);
          }
          return { decision: critique.recommendation, data: { groundedness: critique.groundednessScore, completeness: critique.completenessScore } };
        }, request.onStageComplete);
      } else {
        this.skipStage(ctx, PipelineStage.CRITIQUE, "Not required by contract");
      }

      // Stage 8: RETURN
      await this.runStage(ctx, PipelineStage.RETURN, async () => {
        ctx.finalOutput = {
          result: ctx.inferenceResult,
          critique: ctx.critiqueResult ? { passed: ctx.critiqueResult.passed, recommendation: ctx.critiqueResult.recommendation } : undefined,
          gate: { decision: ctx.gateVerdict?.decision, riskClass: ctx.gateVerdict?.riskClass },
        };
        return { decision: "returned" };
      }, request.onStageComplete);

      // Stage 9: RECEIPT
      await this.runStage(ctx, PipelineStage.RECEIPT, async () => {
        // In production, persists to ai_inference_receipts table
        return {
          decision: "receipted",
          data: {
            pipelineId,
            correlationId,
            taskType: request.taskType,
            gateDecision: ctx.gateVerdict?.decision,
            critiqueRecommendation: ctx.critiqueResult?.recommendation,
            totalStages: ctx.stages.length,
          },
        };
      }, request.onStageComplete);

      ctx.status = ctx.gateVerdict?.decision === "caveat" ? "caveat" : "completed";
    } catch (error) {
      ctx.status = "failed";
      const lastStage = ctx.stages[ctx.stages.length - 1];
      if (lastStage && !lastStage.completedAt) {
        lastStage.status = "failed";
        lastStage.error = error instanceof Error ? (error as Error)?.message ?? String(error) : "Unknown error";
        lastStage.completedAt = new Date().toISOString();
        lastStage.durationMs = Date.now() - new Date(lastStage.startedAt).getTime();
      }
    }

    ctx.completedAt = new Date().toISOString();
    ctx.totalDurationMs = Date.now() - startTime;

    // Log trace
    const trace: PipelineTrace = {
      pipelineId,
      correlationId,
      taskType: request.taskType,
      status: ctx.status,
      stages: ctx.stages,
      totalDurationMs: ctx.totalDurationMs,
      gateDecision: ctx.gateVerdict?.decision,
      critiqueRecommendation: ctx.critiqueResult?.recommendation,
      timestamp: new Date().toISOString(),
    };
    this.traceLog.push(trace);
    if (this.traceLog.length > 500) this.traceLog = this.traceLog.slice(-250);

    return ctx;
  }

  private async runStage(
    ctx: PipelineContext,
    stage: PipelineStage,
    fn: () => Promise<{ decision: string; data?: Record<string, unknown> }>,
    onComplete?: (stage: PipelineStage, record: StageRecord) => void
  ): Promise<void> {
    const record: StageRecord = {
      stage,
      status: "running",
      startedAt: new Date().toISOString(),
    };
    ctx.stages.push(record);
    ctx.currentStage = stage;

    const result = await fn();
    record.status = "completed";
    record.completedAt = new Date().toISOString();
    record.durationMs = Date.now() - new Date(record.startedAt).getTime();
    record.decision = result.decision;
    record.data = result.data;

    onComplete?.(stage, record);
  }

  private skipStage(ctx: PipelineContext, stage: PipelineStage, reason: string): void {
    ctx.stages.push({
      stage,
      status: "completed",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 0,
      decision: "skipped",
      data: { reason },
    });
  }

  getTraceLog(limit?: number): PipelineTrace[] {
    const log = [...this.traceLog].reverse();
    return limit ? log.slice(0, limit) : log;
  }

  getTraceByCorrelation(correlationId: string): PipelineTrace | undefined {
    return this.traceLog.find((t) => t.correlationId === correlationId);
  }

  getPipelineStats(): { total: number; completed: number; failed: number; blocked: number; avgDurationMs: number } {
    const stats = { total: this.traceLog.length, completed: 0, failed: 0, blocked: 0, avgDurationMs: 0 };
    let totalMs = 0;
    for (const t of this.traceLog) {
      if (t.status === "completed" || t.status === "caveat") stats.completed++;
      else if (t.status === "failed") stats.failed++;
      else if (t.status === "blocked") stats.blocked++;
      totalMs += t.totalDurationMs;
    }
    if (stats.total > 0) stats.avgDurationMs = totalMs / stats.total;
    return stats;
  }
}

export const pipelineOrchestrator = new PipelineOrchestrator();

