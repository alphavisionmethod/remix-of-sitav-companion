// ═══════════════════════════════════════════════════════════════
// SITA OS — Global Contracts Registry
// Centralized task definitions consumed by ConscienceGate,
// Pipeline Orchestrator, ModelRouter, and Desk
// ═══════════════════════════════════════════════════════════════

import type { DomainId, RiskTier } from "@/packages/contracts/_contract-scaffold";

// ── Task Contract Interface ────────────────────────────────────

export type BudgetClass = "micro" | "standard" | "premium" | "critical";
export type RoutingClass = "fast" | "balanced" | "quality" | "deterministic";
export type TaskPriority = "low" | "normal" | "high" | "critical";

export interface TaskInputSchema {
  required: string[];
  optional?: string[];
  maxTokens?: number;
}

export interface TaskOutputSchema {
  format: "text" | "structured" | "numeric" | "mixed";
  requiredFields?: string[];
  validationRules?: string[];
}

export interface EvidenceRequirements {
  requiresEvidence: boolean;
  minSources?: number;
  requiresCitation?: boolean;
  requiresProvenanceChain?: boolean;
  allowedSourceTypes?: string[];
}

export interface TaskContract {
  taskType: string;
  displayName: string;
  domain: DomainId;
  description: string;
  riskTier: RiskTier;
  budgetClass: BudgetClass;
  routingClass: RoutingClass;
  priority: TaskPriority;

  inputSchema: TaskInputSchema;
  outputSchema: TaskOutputSchema;
  evidenceRequirements: EvidenceRequirements;

  allowedProviders: string[];
  allowedModels: string[];

  requiresRetrieval: boolean;
  requiresDeterministicVerification: boolean;
  requiresCritique: boolean;
  requiresApproval: boolean;
  requiresReceipt: boolean;

  maxLatencyMs: number;
  maxCostCents: number;
  ttlSeconds: number;

  tags: string[];
}

// ── 15 Canonical Task Contracts ────────────────────────────────

const CONTRACT_DEFAULTS: Pick<TaskContract, "allowedProviders" | "allowedModels" | "requiresReceipt" | "ttlSeconds"> = {
  allowedProviders: ["openai", "anthropic"],
  allowedModels: ["gpt-4o", "gpt-4o-mini", "claude-sonnet"],
  requiresReceipt: true,
  ttlSeconds: 300,
};

export const GLOBAL_TASK_REGISTRY: Record<string, TaskContract> = {
  "chat-query": {
    taskType: "chat-query",
    displayName: "Chat Query",
    domain: "concierge",
    description: "General conversational query to AI advisor",
    riskTier: "standard",
    budgetClass: "standard",
    routingClass: "balanced",
    priority: "normal",
    inputSchema: { required: ["message"], optional: ["conversationHistory", "context"] },
    outputSchema: { format: "text" },
    evidenceRequirements: { requiresEvidence: false },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: false,
    requiresDeterministicVerification: false,
    requiresCritique: false,
    requiresApproval: false,
    maxLatencyMs: 10000,
    maxCostCents: 5,
    tags: ["conversational", "general"],
  },

  "file-assist": {
    taskType: "file-assist",
    displayName: "File AI Assist",
    domain: "platform",
    description: "AI-powered file analysis, summarization, or extraction",
    riskTier: "standard",
    budgetClass: "standard",
    routingClass: "quality",
    priority: "normal",
    inputSchema: { required: ["fileIds", "intent"], optional: ["context"], maxTokens: 32000 },
    outputSchema: { format: "mixed", requiredFields: ["summary", "findings"] },
    evidenceRequirements: { requiresEvidence: true, minSources: 1, requiresCitation: true, allowedSourceTypes: ["file"] },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: true,
    requiresDeterministicVerification: false,
    requiresCritique: true,
    requiresApproval: false,
    maxLatencyMs: 30000,
    maxCostCents: 15,
    tags: ["files", "retrieval", "analysis"],
  },

  "boardroom-synthesis": {
    taskType: "boardroom-synthesis",
    displayName: "Boardroom Synthesis",
    domain: "cross-domain",
    description: "Cross-domain executive synthesis for boardroom decisions",
    riskTier: "elevated",
    budgetClass: "premium",
    routingClass: "quality",
    priority: "high",
    inputSchema: { required: ["domains", "question"], optional: ["timeframe", "metrics"] },
    outputSchema: { format: "structured", requiredFields: ["synthesis", "recommendations", "confidence", "evidence"] },
    evidenceRequirements: { requiresEvidence: true, minSources: 3, requiresCitation: true, requiresProvenanceChain: true },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: true,
    requiresDeterministicVerification: false,
    requiresCritique: true,
    requiresApproval: false,
    maxLatencyMs: 45000,
    maxCostCents: 50,
    tags: ["executive", "synthesis", "cross-domain"],
  },

  "financial-calculation": {
    taskType: "financial-calculation",
    displayName: "Financial Calculation",
    domain: "finance",
    description: "Deterministic financial computation with audit trail",
    riskTier: "critical",
    budgetClass: "micro",
    routingClass: "deterministic",
    priority: "critical",
    inputSchema: { required: ["calculationType", "inputs"], optional: ["regime", "currency"] },
    outputSchema: { format: "numeric", requiredFields: ["result", "formula", "proof"], validationRules: ["deterministic-match"] },
    evidenceRequirements: { requiresEvidence: true, requiresProvenanceChain: true },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: false,
    requiresDeterministicVerification: true,
    requiresCritique: true,
    requiresApproval: false,
    maxLatencyMs: 5000,
    maxCostCents: 2,
    tags: ["finance", "deterministic", "math-os"],
  },

  "recommendation-generate": {
    taskType: "recommendation-generate",
    displayName: "Generate Recommendation",
    domain: "cross-domain",
    description: "AI-generated actionable recommendation with evidence",
    riskTier: "elevated",
    budgetClass: "standard",
    routingClass: "quality",
    priority: "normal",
    inputSchema: { required: ["domain", "context"], optional: ["constraints", "history"] },
    outputSchema: { format: "structured", requiredFields: ["recommendation", "rationale", "confidence", "risks"] },
    evidenceRequirements: { requiresEvidence: true, minSources: 2, requiresCitation: true },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: true,
    requiresDeterministicVerification: false,
    requiresCritique: true,
    requiresApproval: true,
    maxLatencyMs: 20000,
    maxCostCents: 20,
    tags: ["recommendation", "action"],
  },

  "connector-action": {
    taskType: "connector-action",
    displayName: "Connector Action",
    domain: "platform",
    description: "Execute external connector/tool action with approval",
    riskTier: "critical",
    budgetClass: "micro",
    routingClass: "fast",
    priority: "high",
    inputSchema: { required: ["connectorId", "action", "params"] },
    outputSchema: { format: "structured", requiredFields: ["result", "sideEffects"] },
    evidenceRequirements: { requiresEvidence: false },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: false,
    requiresDeterministicVerification: false,
    requiresCritique: false,
    requiresApproval: true,
    maxLatencyMs: 15000,
    maxCostCents: 1,
    tags: ["connector", "external", "action"],
  },

  "approval-review": {
    taskType: "approval-review",
    displayName: "Approval Review",
    domain: "platform",
    description: "Review and process approval request",
    riskTier: "elevated",
    budgetClass: "micro",
    routingClass: "fast",
    priority: "high",
    inputSchema: { required: ["approvalId", "decision"], optional: ["reason"] },
    outputSchema: { format: "structured", requiredFields: ["status", "receipt"] },
    evidenceRequirements: { requiresEvidence: false },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: false,
    requiresDeterministicVerification: false,
    requiresCritique: false,
    requiresApproval: false,
    maxLatencyMs: 5000,
    maxCostCents: 0,
    tags: ["approval", "governance"],
  },

  "document-analysis": {
    taskType: "document-analysis",
    displayName: "Document Analysis",
    domain: "platform",
    description: "Deep analysis of uploaded documents",
    riskTier: "standard",
    budgetClass: "premium",
    routingClass: "quality",
    priority: "normal",
    inputSchema: { required: ["documentId", "analysisType"], optional: ["focusAreas"], maxTokens: 64000 },
    outputSchema: { format: "structured", requiredFields: ["analysis", "keyFindings", "confidence"] },
    evidenceRequirements: { requiresEvidence: true, minSources: 1, requiresCitation: true, allowedSourceTypes: ["document"] },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: true,
    requiresDeterministicVerification: false,
    requiresCritique: true,
    requiresApproval: false,
    maxLatencyMs: 60000,
    maxCostCents: 30,
    tags: ["document", "analysis", "retrieval"],
  },

  "email-draft": {
    taskType: "email-draft",
    displayName: "Email Draft",
    domain: "concierge",
    description: "Draft email based on context and instructions",
    riskTier: "standard",
    budgetClass: "standard",
    routingClass: "balanced",
    priority: "normal",
    inputSchema: { required: ["intent", "recipient"], optional: ["tone", "context", "attachmentRefs"] },
    outputSchema: { format: "structured", requiredFields: ["subject", "body"] },
    evidenceRequirements: { requiresEvidence: false },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: false,
    requiresDeterministicVerification: false,
    requiresCritique: false,
    requiresApproval: false,
    maxLatencyMs: 15000,
    maxCostCents: 8,
    tags: ["email", "draft", "communication"],
  },

  "scenario-simulation": {
    taskType: "scenario-simulation",
    displayName: "Scenario Simulation",
    domain: "business",
    description: "Business scenario simulation with financial modeling",
    riskTier: "elevated",
    budgetClass: "premium",
    routingClass: "quality",
    priority: "normal",
    inputSchema: { required: ["scenario", "variables"], optional: ["constraints", "timeframe"] },
    outputSchema: { format: "structured", requiredFields: ["outcomes", "risks", "confidence", "assumptions"] },
    evidenceRequirements: { requiresEvidence: true, minSources: 2, requiresCitation: true },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: true,
    requiresDeterministicVerification: true,
    requiresCritique: true,
    requiresApproval: false,
    maxLatencyMs: 45000,
    maxCostCents: 40,
    tags: ["simulation", "scenario", "business"],
  },

  "kpi-calculation": {
    taskType: "kpi-calculation",
    displayName: "KPI Calculation",
    domain: "finance",
    description: "Deterministic KPI computation from data sources",
    riskTier: "critical",
    budgetClass: "micro",
    routingClass: "deterministic",
    priority: "high",
    inputSchema: { required: ["kpiType", "dataSource", "period"] },
    outputSchema: { format: "numeric", requiredFields: ["value", "formula", "dataPoints", "proof"], validationRules: ["deterministic-match"] },
    evidenceRequirements: { requiresEvidence: true, requiresProvenanceChain: true },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: true,
    requiresDeterministicVerification: true,
    requiresCritique: true,
    requiresApproval: false,
    maxLatencyMs: 10000,
    maxCostCents: 3,
    tags: ["kpi", "finance", "deterministic", "math-os"],
  },

  "tax-estimation": {
    taskType: "tax-estimation",
    displayName: "Tax Estimation",
    domain: "finance",
    description: "Tax computation with regime-aware deterministic logic",
    riskTier: "critical",
    budgetClass: "micro",
    routingClass: "deterministic",
    priority: "critical",
    inputSchema: { required: ["taxType", "jurisdiction", "inputs"] },
    outputSchema: { format: "numeric", requiredFields: ["amount", "breakdown", "regime", "proof"], validationRules: ["deterministic-match", "regime-valid"] },
    evidenceRequirements: { requiresEvidence: true, requiresProvenanceChain: true },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: false,
    requiresDeterministicVerification: true,
    requiresCritique: true,
    requiresApproval: false,
    maxLatencyMs: 5000,
    maxCostCents: 2,
    tags: ["tax", "finance", "deterministic", "math-os", "compliance"],
  },

  "executive-briefing": {
    taskType: "executive-briefing",
    displayName: "Executive Briefing",
    domain: "cross-domain",
    description: "Generate executive-level briefing across domains",
    riskTier: "elevated",
    budgetClass: "premium",
    routingClass: "quality",
    priority: "high",
    inputSchema: { required: ["topics"], optional: ["timeframe", "audience", "depth"] },
    outputSchema: { format: "structured", requiredFields: ["summary", "highlights", "risks", "actions", "confidence"] },
    evidenceRequirements: { requiresEvidence: true, minSources: 3, requiresCitation: true, requiresProvenanceChain: true },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: true,
    requiresDeterministicVerification: false,
    requiresCritique: true,
    requiresApproval: false,
    maxLatencyMs: 45000,
    maxCostCents: 50,
    tags: ["executive", "briefing", "synthesis"],
  },

  "risk-assessment": {
    taskType: "risk-assessment",
    displayName: "Risk Assessment",
    domain: "business",
    description: "Comprehensive risk evaluation with evidence grounding",
    riskTier: "elevated",
    budgetClass: "standard",
    routingClass: "quality",
    priority: "high",
    inputSchema: { required: ["riskDomain", "context"], optional: ["historicalData", "constraints"] },
    outputSchema: { format: "structured", requiredFields: ["riskScore", "factors", "mitigations", "confidence"] },
    evidenceRequirements: { requiresEvidence: true, minSources: 2, requiresCitation: true },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: true,
    requiresDeterministicVerification: false,
    requiresCritique: true,
    requiresApproval: false,
    maxLatencyMs: 30000,
    maxCostCents: 25,
    tags: ["risk", "assessment", "business"],
  },

  "workflow-step": {
    taskType: "workflow-step",
    displayName: "Workflow Step Execution",
    domain: "platform",
    description: "Execute a single workflow step with tool/connector access",
    riskTier: "elevated",
    budgetClass: "standard",
    routingClass: "fast",
    priority: "high",
    inputSchema: { required: ["workflowId", "stepId", "inputs"] },
    outputSchema: { format: "structured", requiredFields: ["result", "status", "sideEffects"] },
    evidenceRequirements: { requiresEvidence: false },
    ...CONTRACT_DEFAULTS,
    requiresRetrieval: false,
    requiresDeterministicVerification: false,
    requiresCritique: false,
    requiresApproval: true,
    maxLatencyMs: 30000,
    maxCostCents: 10,
    tags: ["workflow", "execution", "step"],
  },
};

// ── Registry Access Functions ──────────────────────────────────

export function getTaskContract(taskType: string): TaskContract | undefined {
  return GLOBAL_TASK_REGISTRY[taskType];
}

export function getTaskContractOrThrow(taskType: string): TaskContract {
  const contract = GLOBAL_TASK_REGISTRY[taskType];
  if (!contract) throw new Error(`[GlobalContractsRegistry] Unknown task type: ${taskType}`);
  return contract;
}

export function validateTaskInput(taskType: string, input: Record<string, unknown>): { valid: boolean; missing: string[]; errors: string[] } {
  const contract = getTaskContract(taskType);
  if (!contract) return { valid: false, missing: [], errors: [`Unknown task type: ${taskType}`] };

  const missing = contract.inputSchema.required.filter((field) => !(field in input) || input[field] === undefined || input[field] === null);
  const errors: string[] = [];

  if (contract.inputSchema.maxTokens) {
    const estimatedTokens = JSON.stringify(input).length / 4;
    if (estimatedTokens > contract.inputSchema.maxTokens) {
      errors.push(`Input exceeds max token estimate: ${estimatedTokens} > ${contract.inputSchema.maxTokens}`);
    }
  }

  return { valid: missing.length === 0 && errors.length === 0, missing, errors };
}

export function getRoutingPolicy(taskType: string): { routingClass: RoutingClass; budgetClass: BudgetClass; allowedProviders: string[]; allowedModels: string[]; maxLatencyMs: number; maxCostCents: number } | undefined {
  const contract = getTaskContract(taskType);
  if (!contract) return undefined;
  return {
    routingClass: contract.routingClass,
    budgetClass: contract.budgetClass,
    allowedProviders: contract.allowedProviders,
    allowedModels: contract.allowedModels,
    maxLatencyMs: contract.maxLatencyMs,
    maxCostCents: contract.maxCostCents,
  };
}

export function listTaskTypes(): string[] {
  return Object.keys(GLOBAL_TASK_REGISTRY);
}

export function getTasksByDomain(domain: DomainId): TaskContract[] {
  return Object.values(GLOBAL_TASK_REGISTRY).filter((c) => c.domain === domain);
}

export function getTasksByRiskTier(tier: RiskTier): TaskContract[] {
  return Object.values(GLOBAL_TASK_REGISTRY).filter((c) => c.riskTier === tier);
}

export function getDeterministicTasks(): TaskContract[] {
  return Object.values(GLOBAL_TASK_REGISTRY).filter((c) => c.requiresDeterministicVerification);
}

export function getCritiquableTasks(): TaskContract[] {
  return Object.values(GLOBAL_TASK_REGISTRY).filter((c) => c.requiresCritique);
}

export function getApprovalRequiredTasks(): TaskContract[] {
  return Object.values(GLOBAL_TASK_REGISTRY).filter((c) => c.requiresApproval);
}
