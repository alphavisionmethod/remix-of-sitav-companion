// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Trust Enforcer
// AI tool-call boundary enforcement, prompt sanitization,
// capability scoping, budget gate, output validation, audit receipts
// ═══════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────

export type AIActionResult = "allowed" | "denied" | "downgraded" | "budget-exceeded" | "scope-violation" | "output-rejected";

export interface AIActionRequest {
  requestId: string;
  userId: string;
  capabilityId: string;
  promptFamily: string;
  modelRequested: string;
  toolCalls: AIToolCall[];
  estimatedCostCents: number;
  riskTier: "standard" | "elevated" | "critical";
  inputTokenEstimate: number;
  context: AIActionContext;
}

export interface AIToolCall {
  toolName: string;
  arguments: Record<string, unknown>;
  requiredScope: string;
  sideEffecting: boolean;
  reversible: boolean;
}

export interface AIActionContext {
  domain: string;
  surface: string;
  sessionId: string | null;
  trustRing: number;
  autonomyLevel: number;
  correlationId: string | null;
}

export interface AIActionDecision {
  result: AIActionResult;
  requestId: string;
  timestamp: string;
  modelApproved: string | null;
  modelDowngradedFrom: string | null;
  toolCallDecisions: AIToolCallDecision[];
  budgetRemaining: number | null;
  reason: string;
  receiptId: string;
  recommendations: string[];
}

export interface AIToolCallDecision {
  toolName: string;
  allowed: boolean;
  reason: string;
  scopeValid: boolean;
  sanitized: boolean;
}

export interface AITrustPolicy {
  id: string;
  name: string;
  maxCostCentsPerCall: number;
  maxTokensPerCall: number;
  maxToolCallsPerInvocation: number;
  allowedTools: string[];
  forbiddenTools: string[];
  requireApprovalAboveCost: number;
  requireApprovalForSideEffects: boolean;
  maxAutonomyLevel: number;
  allowedModels: string[];
  fallbackModel: string;
  inputSanitizationEnabled: boolean;
  outputValidationEnabled: boolean;
  maxInputLength: number;
  forbiddenInputPatterns: RegExp[];
  piiRedactionEnabled: boolean;
}

export interface AIAuditReceipt {
  id: string;
  requestId: string;
  timestamp: string;
  userId: string;
  capabilityId: string;
  promptFamily: string;
  modelUsed: string;
  toolCallCount: number;
  costCents: number;
  tokensUsed: number;
  result: AIActionResult;
  decision: AIActionDecision;
  inputHash: string;
  outputHash: string | null;
  verificationOutcome: string | null;
}

export interface AIEnforcerMetrics {
  totalRequests: number;
  allowed: number;
  denied: number;
  downgraded: number;
  budgetExceeded: number;
  scopeViolations: number;
  outputRejections: number;
  totalCostCents: number;
  totalTokens: number;
  byCapability: Record<string, number>;
  byModel: Record<string, number>;
}

// ── Sanitizer ──────────────────────────────────────────────────

const PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/g,                    // SSN
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email (mark, don't remove)
];

function sanitizeInput(text: string, policy: AITrustPolicy): { sanitized: string; redactions: number } {
  if (!policy.inputSanitizationEnabled) return { sanitized: text, redactions: 0 };

  let result = text;
  let redactions = 0;

  // Length enforcement
  if (result.length > policy.maxInputLength) {
    result = result.slice(0, policy.maxInputLength);
    redactions++;
  }

  // Forbidden patterns
  for (const pattern of policy.forbiddenInputPatterns) {
    if (pattern.test(result)) {
      result = result.replace(pattern, "[REDACTED]");
      redactions++;
    }
  }

  // PII redaction
  if (policy.piiRedactionEnabled) {
    for (const piiPattern of PII_PATTERNS) {
      const matches = result.match(piiPattern);
      if (matches) {
        result = result.replace(piiPattern, "[PII-REDACTED]");
        redactions += matches.length;
      }
    }
  }

  return { sanitized: result, redactions };
}

// ── Engine ─────────────────────────────────────────────────────

export class AITrustEnforcer {
  private policies: Map<string, AITrustPolicy> = new Map();
  private receipts: AIAuditReceipt[] = [];
  private metrics: AIEnforcerMetrics = {
    totalRequests: 0, allowed: 0, denied: 0, downgraded: 0,
    budgetExceeded: 0, scopeViolations: 0, outputRejections: 0,
    totalCostCents: 0, totalTokens: 0, byCapability: {}, byModel: {},
  };
  private receiptCounter = 0;
  private readonly maxReceipts = 10_000;
  private listeners: Array<(receipt: AIAuditReceipt) => void> = [];

  constructor() {
    this.registerDefaultPolicies();
  }

  // ── Core Evaluation ────────────────────────────────────────

  evaluate(request: AIActionRequest): AIActionDecision {
    this.metrics.totalRequests++;
    this.metrics.byCapability[request.capabilityId] = (this.metrics.byCapability[request.capabilityId] ?? 0) + 1;

    const policy = this.resolvePolicy(request);
    const recommendations: string[] = [];
    const toolDecisions: AIToolCallDecision[] = [];

    // 1. Budget check
    if (request.estimatedCostCents > policy.maxCostCentsPerCall) {
      this.metrics.budgetExceeded++;
      return this.createDecision(request, "budget-exceeded", null, null, toolDecisions, `Cost ${request.estimatedCostCents}¢ exceeds limit ${policy.maxCostCentsPerCall}¢`, recommendations);
    }

    // 2. Token limit
    if (request.inputTokenEstimate > policy.maxTokensPerCall) {
      this.metrics.denied++;
      return this.createDecision(request, "denied", null, null, toolDecisions, `Token estimate ${request.inputTokenEstimate} exceeds limit ${policy.maxTokensPerCall}`, recommendations);
    }

    // 3. Tool call count
    if (request.toolCalls.length > policy.maxToolCallsPerInvocation) {
      this.metrics.denied++;
      return this.createDecision(request, "denied", null, null, toolDecisions, `Too many tool calls: ${request.toolCalls.length} > ${policy.maxToolCallsPerInvocation}`, recommendations);
    }

    // 4. Autonomy level check
    if (request.context.autonomyLevel > policy.maxAutonomyLevel) {
      this.metrics.denied++;
      return this.createDecision(request, "denied", null, null, toolDecisions, `Autonomy level ${request.context.autonomyLevel} exceeds max ${policy.maxAutonomyLevel}`, recommendations);
    }

    // 5. Evaluate each tool call
    for (const tool of request.toolCalls) {
      const toolDecision = this.evaluateToolCall(tool, policy, request);
      toolDecisions.push(toolDecision);
      if (!toolDecision.allowed) {
        this.metrics.scopeViolations++;
        return this.createDecision(request, "scope-violation", null, null, toolDecisions, `Tool ${tool.toolName}: ${toolDecision.reason}`, recommendations);
      }
    }

    // 6. Model validation / downgrade
    let modelApproved = request.modelRequested;
    let modelDowngradedFrom: string | null = null;

    if (!policy.allowedModels.includes(request.modelRequested) && !policy.allowedModels.includes("*")) {
      if (policy.fallbackModel) {
        modelDowngradedFrom = request.modelRequested;
        modelApproved = policy.fallbackModel;
        recommendations.push(`Model downgraded from ${modelDowngradedFrom} to ${modelApproved}`);
        this.metrics.downgraded++;
        this.metrics.byModel[modelApproved] = (this.metrics.byModel[modelApproved] ?? 0) + 1;
        return this.createDecision(request, "downgraded", modelApproved, modelDowngradedFrom, toolDecisions, "Model not in allowed list — downgraded to fallback", recommendations);
      }
      this.metrics.denied++;
      return this.createDecision(request, "denied", null, null, toolDecisions, `Model ${request.modelRequested} not allowed`, recommendations);
    }

    // 7. Approval required check
    if (request.estimatedCostCents > policy.requireApprovalAboveCost) {
      recommendations.push("Human approval recommended due to cost");
    }
    if (policy.requireApprovalForSideEffects && request.toolCalls.some((t) => t.sideEffecting)) {
      recommendations.push("Human approval recommended for side-effecting tool calls");
    }

    this.metrics.allowed++;
    this.metrics.totalCostCents += request.estimatedCostCents;
    this.metrics.totalTokens += request.inputTokenEstimate;
    this.metrics.byModel[modelApproved] = (this.metrics.byModel[modelApproved] ?? 0) + 1;

    return this.createDecision(request, "allowed", modelApproved, modelDowngradedFrom, toolDecisions, "All checks passed", recommendations);
  }

  // ── Output Validation ──────────────────────────────────────

  validateOutput(requestId: string, output: unknown): { valid: boolean; reason: string } {
    if (output === null || output === undefined) return { valid: false, reason: "Null output" };
    if (typeof output === "string" && output.length > 500_000) return { valid: false, reason: "Output too large" };

    // Check for common injection patterns in output
    if (typeof output === "string") {
      if (/<script/i.test(output)) return { valid: false, reason: "Script injection detected in output" };
    }

    return { valid: true, reason: "Output validated" };
  }

  // ── Policy Management ──────────────────────────────────────

  registerPolicy(policy: AITrustPolicy): void {
    this.policies.set(policy.id, policy);
  }

  // ── Queries ────────────────────────────────────────────────

  getReceipts(limit = 100): AIAuditReceipt[] {
    return this.receipts.slice(-limit);
  }

  getMetrics(): AIEnforcerMetrics {
    return { ...this.metrics };
  }

  // ── Events ─────────────────────────────────────────────────

  onReceipt(listener: (receipt: AIAuditReceipt) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  // ── Internal ───────────────────────────────────────────────

  private evaluateToolCall(tool: AIToolCall, policy: AITrustPolicy, request: AIActionRequest): AIToolCallDecision {
    if (policy.forbiddenTools.includes(tool.toolName)) {
      return { toolName: tool.toolName, allowed: false, reason: "Tool is forbidden", scopeValid: false, sanitized: false };
    }
    if (policy.allowedTools.length > 0 && !policy.allowedTools.includes(tool.toolName) && !policy.allowedTools.includes("*")) {
      return { toolName: tool.toolName, allowed: false, reason: "Tool not in allowed list", scopeValid: false, sanitized: false };
    }
    if (!request.context.sessionId && tool.sideEffecting) {
      return { toolName: tool.toolName, allowed: false, reason: "Side-effecting tool requires session", scopeValid: false, sanitized: false };
    }

    // Sanitize arguments
    let sanitized = false;
    for (const [key, value] of Object.entries(tool.arguments)) {
      if (typeof value === "string") {
        const result = sanitizeInput(value, policy);
        if (result.redactions > 0) {
          tool.arguments[key] = result.sanitized;
          sanitized = true;
        }
      }
    }

    return { toolName: tool.toolName, allowed: true, reason: "Allowed", scopeValid: true, sanitized };
  }

  private resolvePolicy(request: AIActionRequest): AITrustPolicy {
    // Check risk-tier specific policy first
    const riskPolicy = this.policies.get(`risk-${request.riskTier}`);
    if (riskPolicy) return riskPolicy;
    return this.policies.get("default") ?? this.createFallbackPolicy();
  }

  private createDecision(request: AIActionRequest, result: AIActionResult, modelApproved: string | null, modelDowngradedFrom: string | null, toolDecisions: AIToolCallDecision[], reason: string, recommendations: string[]): AIActionDecision {
    const receiptId = `air-${++this.receiptCounter}-${Date.now()}`;

    const decision: AIActionDecision = {
      result, requestId: request.requestId, timestamp: new Date().toISOString(),
      modelApproved, modelDowngradedFrom, toolCallDecisions: toolDecisions,
      budgetRemaining: null, reason, receiptId, recommendations,
    };

    const receipt: AIAuditReceipt = {
      id: receiptId, requestId: request.requestId, timestamp: decision.timestamp,
      userId: request.userId, capabilityId: request.capabilityId,
      promptFamily: request.promptFamily, modelUsed: modelApproved ?? request.modelRequested,
      toolCallCount: request.toolCalls.length, costCents: request.estimatedCostCents,
      tokensUsed: request.inputTokenEstimate, result, decision,
      inputHash: `sha256:${request.requestId}`, outputHash: null, verificationOutcome: null,
    };

    this.receipts.push(receipt);
    if (this.receipts.length > this.maxReceipts) this.receipts = this.receipts.slice(-this.maxReceipts);

    for (const l of this.listeners) {
      try { l(receipt); } catch { /* isolation */ }
    }

    return decision;
  }

  private createFallbackPolicy(): AITrustPolicy {
    return {
      id: "fallback", name: "Fallback — Restrictive",
      maxCostCentsPerCall: 10, maxTokensPerCall: 4000, maxToolCallsPerInvocation: 3,
      allowedTools: [], forbiddenTools: [],
      requireApprovalAboveCost: 5, requireApprovalForSideEffects: true,
      maxAutonomyLevel: 2, allowedModels: ["*"], fallbackModel: "google/gemini-2.5-flash-lite",
      inputSanitizationEnabled: true, outputValidationEnabled: true,
      maxInputLength: 10_000, forbiddenInputPatterns: [/<script/i], piiRedactionEnabled: true,
    };
  }

  private registerDefaultPolicies(): void {
    this.registerPolicy({
      id: "default", name: "Default AI Policy",
      maxCostCentsPerCall: 50, maxTokensPerCall: 32_000, maxToolCallsPerInvocation: 10,
      allowedTools: ["*"], forbiddenTools: ["system.exec", "system.delete-all", "system.format"],
      requireApprovalAboveCost: 25, requireApprovalForSideEffects: true,
      maxAutonomyLevel: 5, allowedModels: ["*"], fallbackModel: "google/gemini-2.5-flash",
      inputSanitizationEnabled: true, outputValidationEnabled: true,
      maxInputLength: 100_000, forbiddenInputPatterns: [/<script/i, /javascript:/i], piiRedactionEnabled: true,
    });
    this.registerPolicy({
      id: "risk-critical", name: "Critical Risk Policy",
      maxCostCentsPerCall: 100, maxTokensPerCall: 64_000, maxToolCallsPerInvocation: 5,
      allowedTools: ["*"], forbiddenTools: ["system.exec", "system.delete-all", "system.format", "admin.override"],
      requireApprovalAboveCost: 10, requireApprovalForSideEffects: true,
      maxAutonomyLevel: 3, allowedModels: ["openai/gpt-5", "google/gemini-2.5-pro"],
      fallbackModel: "google/gemini-2.5-pro", inputSanitizationEnabled: true,
      outputValidationEnabled: true, maxInputLength: 50_000,
      forbiddenInputPatterns: [/<script/i, /javascript:/i, /eval\s*\(/i], piiRedactionEnabled: true,
    });
    this.registerPolicy({
      id: "risk-standard", name: "Standard Risk Policy",
      maxCostCentsPerCall: 25, maxTokensPerCall: 16_000, maxToolCallsPerInvocation: 15,
      allowedTools: ["*"], forbiddenTools: ["system.exec"],
      requireApprovalAboveCost: 50, requireApprovalForSideEffects: false,
      maxAutonomyLevel: 7, allowedModels: ["*"], fallbackModel: "google/gemini-2.5-flash-lite",
      inputSanitizationEnabled: true, outputValidationEnabled: true,
      maxInputLength: 200_000, forbiddenInputPatterns: [/<script/i], piiRedactionEnabled: false,
    });
  }
}

export function createAITrustEnforcer(): AITrustEnforcer {
  return new AITrustEnforcer();
}
