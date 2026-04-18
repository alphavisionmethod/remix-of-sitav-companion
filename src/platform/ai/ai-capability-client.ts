// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Capability Client
// The ONE canonical client for all AI invocations across SITA OS
// No surface may call providers directly. All AI routes through here.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { normalizeGatewayResponse } from "./ai-response-normalizer";
import type { AICapabilityRequest, AIResponseEnvelope } from "./ai-state-types";
import { enforceAIBudget } from "@/lib/ai-gateway/budget-gate";
import { getTaskContract } from "@/lib/contracts/global-contracts-registry";
import { pipelineOrchestrator } from "@/lib/services/canonical-pipeline/pipeline-orchestrator";
import {
  gradeEvidence,
  checkGrounding,
  logGroundingCheck,
  createNegativeReceipt,
  refuseForWeakEvidence,
  buildAssumptionSet,
  createAssumption,
  runSentinelCheck,
  logSentinelReport,
} from "@/lib/services/epistemic-firewall";
import type { EvidenceItem, NegativeReceipt, Assumption } from "@/lib/services/epistemic-firewall";

const AI_GATEWAY_FUNCTION = "ai-gateway";

/** Extended response envelope with trust metadata */
export interface TrustEnrichedResponse extends AIResponseEnvelope {
  trustMetadata?: {
    pipelineUsed: boolean;
    pipelineId?: string;
    evidenceGrade?: string;
    evidenceSufficient?: boolean;
    groundingPassed?: boolean;
    groundingViolations?: number;
    sentinelHealthy?: boolean;
    sentinelViolations?: number;
    assumptions?: Array<{ statement: string; impact: string; confidence: number }>;
    negativeReceipt?: NegativeReceipt;
    caveats?: string[];
  };
}

/**
 * Invoke an AI capability through the sovereign gateway.
 * This is the ONLY function any frontend surface should use.
 *
 * If a registered contract exists for the capabilityKey, the request
 * is routed through the PipelineOrchestrator (ConscienceGate → Retrieval →
 * Routing → Inference → Critique → Receipt → Sentinel).
 * Otherwise, the direct gateway path is used with post-hoc trust checks.
 */
export async function invokeAICapability(
  request: AICapabilityRequest,
): Promise<TrustEnrichedResponse> {
  const { capabilityKey, messages, taskClass, maxTokens, temperature, stream, surface, intent, traceRequested, receiptRequested } = request;

  try {
    // Budget gate check before invocation
    const budgetCheck = await enforceAIBudget(capabilityKey, 0.05);
    if (!budgetCheck.allowed) {
      return normalizeGatewayResponse(
        { error: `Budget policy blocked: ${budgetCheck.reason}` },
        capabilityKey,
        429,
      ) as TrustEnrichedResponse;
    }

    // ── Check for registered contract → pipeline path ──
    const contract = getTaskContract(capabilityKey);
    if (contract) {
      return await invokeThroughPipeline(request, contract);
    }

    // ── Direct gateway path (no contract, e.g. simple chat) ──
    const result = await invokeDirectGateway(request);

    // Post-hoc trust checks on direct path responses
    return enrichResponseWithTrustChecks(result, capabilityKey);
  } catch (err) {
    return normalizeGatewayResponse(
      { error: err instanceof Error ? err.message : "Network error" },
      capabilityKey,
      0,
    ) as TrustEnrichedResponse;
  }
}

/**
 * Route through PipelineOrchestrator when a contract exists.
 */
async function invokeThroughPipeline(
  request: AICapabilityRequest,
  contract: ReturnType<typeof getTaskContract> & {},
): Promise<TrustEnrichedResponse> {
  const correlationId = crypto.randomUUID();

  try {
    const pipelineResult = await pipelineOrchestrator.execute({
      taskType: request.capabilityKey,
      userId: "current-user", // Will be enriched by auth context
      tenantId: "default",
      input: {
        messages: request.messages,
        taskClass: request.taskClass,
        maxTokens: request.maxTokens,
        temperature: request.temperature,
        surface: request.surface,
        intent: request.intent,
      },
      correlationId,
    });

    // Run sentinel checks after pipeline completion
    const sentinelReport = runSentinelCheck({
      taskType: request.capabilityKey,
      domain: contract.domain,
      riskTier: contract.riskTier,
      hasReceipt: true,
      passedPolicyGate: pipelineResult.gateVerdict?.decision !== "block",
      passedCostGate: true, // Budget gate already passed
      hasEvidenceGrade: !!pipelineResult.retrievalContext,
      deterministicVerified: contract.requiresDeterministicVerification
        ? pipelineResult.status === "completed"
        : undefined,
      hasCiteCheck: contract.requiresCritique ? pipelineResult.critiqueResult?.passed : undefined,
      correlationId,
      routedThroughBrain: true,
      providerCalled: true,
    }, ["runtime"]);
    logSentinelReport(sentinelReport);

    // If sentinel blocks, emit negative receipt
    if (!sentinelReport.overallHealthy) {
      const blockedInvariants = sentinelReport.results.filter(r => !r.passed && (r.severity === "block" || r.severity === "critical"));
      const negReceipt = createNegativeReceipt({
        taskType: request.capabilityKey,
        domain: contract.domain,
        riskTier: contract.riskTier,
        correlationId,
        blockedAction: `Pipeline execution for ${request.capabilityKey}`,
        blockedDescription: `Sentinel invariant check failed: ${blockedInvariants.map(r => r.message).join("; ")}`,
        refusalReasons: ["invariant-violated"],
        policyTriggered: blockedInvariants.map(r => r.invariantId),
        details: `${blockedInvariants.length} invariant(s) violated after pipeline execution.`,
        missingRequirements: blockedInvariants.map(r => r.message),
        suggestedActions: [
          { action: "Review invariant violations", description: "Check the Epistemic Firewall admin board for details.", actionType: "escalate" },
        ],
        gateSource: "sentinel",
        severity: blockedInvariants.some(r => r.severity === "critical") ? "critical" : "warning",
      });

      return {
        status: "error",
        mode: "unavailable",
        capabilityKey: request.capabilityKey,
        content: "",
        fallbackOccurred: false,
        timestamp: new Date().toISOString(),
        userFacingMessage: "This request was blocked by safety checks. Please review the details.",
        trustMetadata: {
          pipelineUsed: true,
          pipelineId: pipelineResult.pipelineId,
          sentinelHealthy: false,
          sentinelViolations: blockedInvariants.length,
          negativeReceipt: negReceipt,
        },
      };
    }

    // Build trust metadata from pipeline context
    const inferenceOutput = pipelineResult.inferenceResult as Record<string, unknown> | undefined;
    const content = String((inferenceOutput?.output as Record<string, unknown>)?.content ?? "");

    // Run grounding check on finance/business domains
    let groundingResult;
    if (["finance", "business"].includes(contract.domain) && content) {
      groundingResult = checkGrounding(content, contract.domain);
      logGroundingCheck(groundingResult);

      if (!groundingResult.passed && contract.requiresDeterministicVerification) {
        const negReceipt = createNegativeReceipt({
          taskType: request.capabilityKey,
          domain: contract.domain,
          riskTier: contract.riskTier,
          correlationId,
          blockedAction: `Release ${request.capabilityKey} response`,
          blockedDescription: `${groundingResult.blockedCount} ungrounded deterministic field(s) detected`,
          refusalReasons: ["domain-requires-deterministic"],
          policyTriggered: ["tool-grounding-enforcement"],
          details: `Response contains ${groundingResult.blockedCount} value(s) that should come from deterministic tools, not LLM generation.`,
          missingRequirements: groundingResult.violations.filter(v => v.severity === "block").map(v => v.message),
          suggestedActions: [
            { action: "Provide source data", description: "Connect verified data sources for these values.", actionType: "provide-data" },
          ],
          gateSource: "sentinel",
          severity: "warning",
        });

        return {
          status: "error",
          mode: "unavailable",
          capabilityKey: request.capabilityKey,
          content: "",
          fallbackOccurred: false,
          timestamp: new Date().toISOString(),
          userFacingMessage: "Response blocked: contains unverified numerical claims that require deterministic calculation.",
          trustMetadata: {
            pipelineUsed: true,
            pipelineId: pipelineResult.pipelineId,
            groundingPassed: false,
            groundingViolations: groundingResult.blockedCount,
            negativeReceipt: negReceipt,
          },
        };
      }
    }

    // Collect assumptions for this correlation
    const assumptionSet = buildAssumptionSet(correlationId, contract.domain, request.capabilityKey);

    // Build caveats
    const caveats: string[] = [];
    if (pipelineResult.gateVerdict?.decision === "caveat") {
      caveats.push(...(pipelineResult.gateVerdict.reasons || []));
    }
    if (pipelineResult.critiqueResult && !pipelineResult.critiqueResult.passed) {
      caveats.push(`Critique: ${pipelineResult.critiqueResult.recommendation}`);
    }
    if (groundingResult && groundingResult.warningCount > 0) {
      caveats.push(`${groundingResult.warningCount} value(s) may lack tool-backed verification`);
    }

    const status = pipelineResult.status === "completed" ? "success_real" as const
      : pipelineResult.status === "caveat" ? "success_partial" as const
      : "error" as const;

    return {
      status,
      mode: status.startsWith("success_") ? "real" : "unavailable",
      capabilityKey: request.capabilityKey,
      content,
      fallbackOccurred: false,
      timestamp: new Date().toISOString(),
      usageSummary: inferenceOutput ? {
        inputTokens: 0,
        outputTokens: 0,
        costCents: Number(inferenceOutput.costCents ?? 0),
        latencyMs: pipelineResult.totalDurationMs ?? 0,
        cached: false,
      } : undefined,
      trustMetadata: {
        pipelineUsed: true,
        pipelineId: pipelineResult.pipelineId,
        evidenceGrade: undefined, // Will be enriched when Mnemosyne context assembly is wired
        groundingPassed: groundingResult?.passed,
        groundingViolations: groundingResult?.violations.length ?? 0,
        sentinelHealthy: sentinelReport.overallHealthy,
        sentinelViolations: sentinelReport.failed,
        assumptions: assumptionSet.assumptions.map(a => ({
          statement: a.statement,
          impact: a.impact,
          confidence: a.confidence,
        })),
        caveats: caveats.length > 0 ? caveats : undefined,
      },
    };
  } catch (err) {
    // Pipeline failed — fall back to direct gateway
    console.warn("[AICapabilityClient] Pipeline failed, falling back to direct gateway:", err);
    const result = await invokeDirectGateway({
      ...request,
    });
    return {
      ...result,
      trustMetadata: {
        pipelineUsed: false,
        caveats: ["Pipeline unavailable — direct gateway used without full trust checks"],
      },
    } as TrustEnrichedResponse;
  }
}

/**
 * Direct gateway invocation (no pipeline, for simple chat / no contract).
 */
async function invokeDirectGateway(
  request: AICapabilityRequest,
): Promise<AIResponseEnvelope> {
  const { capabilityKey, messages, taskClass, maxTokens, temperature, stream, surface, intent, traceRequested, receiptRequested } = request;

  const { data, error } = await supabase.functions.invoke(AI_GATEWAY_FUNCTION, {
    body: {
      capabilityId: capabilityKey,
      taskClass: taskClass ?? "balanced_assistant",
      messages,
      stream: stream ?? false,
      maxTokens,
      temperature,
      surface,
      intent,
      traceRequested,
      receiptRequested,
    },
  });

  if (error) {
    const status = Number((error as Record<string, unknown>)?.status ?? 500);
    const errorBody = typeof data === "object" ? data : { error: error.message };
    return normalizeGatewayResponse(errorBody ?? {}, capabilityKey, status);
  }

  return normalizeGatewayResponse(data, capabilityKey, 200);
}

/**
 * Enrich direct gateway responses with post-hoc trust checks
 * (grounding on finance/business content).
 */
function enrichResponseWithTrustChecks(
  response: AIResponseEnvelope,
  capabilityKey: string,
): TrustEnrichedResponse {
  // Only run grounding on successful responses with content
  if (!response.content || !response.status.startsWith("success_")) {
    return { ...response, trustMetadata: { pipelineUsed: false } };
  }

  // For direct path, run lightweight grounding check on finance-related keys
  const isFinanceRelated = capabilityKey.includes("finance") || capabilityKey.includes("tax") || capabilityKey.includes("kpi");
  const isBusinessRelated = capabilityKey.includes("business") || capabilityKey.includes("boardroom");

  if (isFinanceRelated || isBusinessRelated) {
    const domain = isFinanceRelated ? "finance" as const : "business" as const;
    const groundingResult = checkGrounding(response.content, domain);
    logGroundingCheck(groundingResult);

    const caveats: string[] = [];
    if (groundingResult.warningCount > 0) {
      caveats.push(`${groundingResult.warningCount} value(s) may lack verified backing`);
    }
    if (groundingResult.blockedCount > 0) {
      caveats.push(`${groundingResult.blockedCount} value(s) need deterministic verification`);
    }

    return {
      ...response,
      trustMetadata: {
        pipelineUsed: false,
        groundingPassed: groundingResult.passed,
        groundingViolations: groundingResult.violations.length,
        caveats: caveats.length > 0 ? caveats : undefined,
      },
    };
  }

  return { ...response, trustMetadata: { pipelineUsed: false } };
}

/**
 * Invoke a one-shot synthesis capability (boardroom summary, daily pulse, etc.)
 */
export async function invokeSynthesis(
  capabilityKey: string,
  systemPrompt: string,
  userPrompt: string,
  options?: {
    taskClass?: AICapabilityRequest["taskClass"];
    maxTokens?: number;
    temperature?: number;
  },
): Promise<TrustEnrichedResponse> {
  return invokeAICapability({
    capabilityKey,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    taskClass: options?.taskClass ?? "balanced_assistant",
    maxTokens: options?.maxTokens,
    temperature: options?.temperature,
    surface: "web.admin",
    intent: "summarize",
  });
}

/**
 * Invoke a utility AI capability (classify, extract, transform)
 */
export async function invokeUtility(
  capabilityKey: string,
  systemPrompt: string,
  content: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  },
): Promise<TrustEnrichedResponse> {
  return invokeAICapability({
    capabilityKey,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: content },
    ],
    taskClass: "cheap_utility",
    maxTokens: options?.maxTokens ?? 500,
    temperature: options?.temperature ?? 0,
    surface: "web.utility",
    intent: "extract",
  });
}
