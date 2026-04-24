// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Registry (STRICT 11-FIELD TOPOLOGY)
//
// Phase 2 of Edge Function Topology Hardening.
//
// Authoritative master registry of all 84 edge functions on disk.
// Every entry carries the full strict topology metadata required
// by the Backend Boundary Hardening prompt:
//
//   id, name, path, category, boundedContext, owner,
//   authModel, requestContract, responseContract,
//   sideEffectClass, allowedCallers, callsInto,
//   runtimeConsequence, migrationStatus
//
// HARD RULE: One function, one BackendCategory.
// ═══════════════════════════════════════════════════════════════

import type { ClassificationVerdict } from "./edge-function-categories";
import type { BoundedContext } from "./edge-function-bounded-contexts";
import type { OwnerTeam } from "./edge-function-owner-map";
import type { AuthRequirement } from "./edge-function-auth-map";

export type EdgeFunctionStatus = "active" | "deprecated" | "experimental" | "internal";
export type EdgeFunctionRuntime = "deno";
export type SideEffectClass = "none" | "low" | "medium" | "high";
export type MigrationStatus = "stable" | "wrapper" | "split-required" | "deprecated" | "merge-pending";

/**
 * Caller class — who is allowed to invoke a function.
 * Mirrors the BackendCategory of the caller plus a few primitive
 * classes (frontend, scheduler, kernel, external-webhook, system).
 */
export type CallerClass =
  | "frontend-user"          // browser user surface
  | "frontend-admin"         // admin console
  | "public-bff"
  | "admin-bff"
  | "domain-function"
  | "orchestration-function"
  | "connector-webhook"
  | "runtime-system"
  | "scheduler"              // cron / agent-scheduler
  | "kernel"                 // os-kernel internal
  | "external-webhook"       // 3rd-party callback
  | "service-internal"       // edge-to-edge invocation
  | "any-authenticated";

export interface EdgeFunctionEntry {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly runtime: EdgeFunctionRuntime;
  readonly status: EdgeFunctionStatus;
  readonly description: string;

  // Strict topology metadata (Phase 2)
  readonly category: ClassificationVerdict;
  readonly boundedContext: BoundedContext;
  readonly owner: OwnerTeam;
  readonly authModel: AuthRequirement;
  readonly requestContract: string | null;
  readonly responseContract: string | null;
  readonly sideEffectClass: SideEffectClass;
  readonly allowedCallers: readonly CallerClass[];
  readonly callsInto: readonly string[];
  readonly runtimeConsequence: string;
  readonly migrationStatus: MigrationStatus;
}

export const EDGE_FUNCTION_REGISTRY: readonly EdgeFunctionEntry[] = [
  // ─── ADMIN PLANE ───────────────────────────────────────────
  { id: "ef.admin-ai-workforce-run", name: "admin-ai-workforce-run", path: "supabase/functions/admin-ai-workforce-run/index.ts", runtime: "deno", status: "active", description: "Triggers AI workforce invocation for admin",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "admin-plane", owner: "admin-governance", authModel: "jwt",
    requestContract: "AdminWorkforceRunInput", responseContract: "AdminWorkforceRunOutput", sideEffectClass: "high",
    allowedCallers: ["admin-bff", "frontend-admin"], callsInto: ["ai-gateway", "agent-executor"],
    runtimeConsequence: "Admin AI workforce dispatch unavailable", migrationStatus: "stable" },

  { id: "ef.admin-api", name: "admin-api", path: "supabase/functions/admin-api/index.ts", runtime: "deno", status: "deprecated", description: "Legacy admin REST API — wrapper to admin-bff-gateway",
    category: "WRAPPER_ONLY", boundedContext: "admin-plane", owner: "admin-governance", authModel: "jwt",
    requestContract: "AdminApiRequest", responseContract: "AdminApiResponse", sideEffectClass: "low",
    allowedCallers: ["frontend-admin", "service-internal"], callsInto: ["admin-bff-gateway"],
    runtimeConsequence: "Legacy admin callers degrade", migrationStatus: "wrapper" },

  { id: "ef.admin-bff-gateway", name: "admin-bff-gateway", path: "supabase/functions/admin-bff-gateway/index.ts", runtime: "deno", status: "active", description: "Canonical Admin BFF — sole admin aggregation entry",
    category: "ADMIN_BFF", boundedContext: "admin-plane", owner: "admin-governance", authModel: "jwt",
    requestContract: "BffGatewayRequest", responseContract: "BffGatewayResponse", sideEffectClass: "low",
    allowedCallers: ["frontend-admin"], callsInto: ["admin-intelligence", "admin-users", "cloud-admin-api"],
    runtimeConsequence: "Admin UI data unavailable", migrationStatus: "stable" },

  { id: "ef.admin-gateway", name: "admin-gateway", path: "supabase/functions/admin-gateway/index.ts", runtime: "deno", status: "deprecated", description: "Legacy admin gateway — wrapper to admin-bff-gateway",
    category: "WRAPPER_ONLY", boundedContext: "admin-plane", owner: "admin-governance", authModel: "jwt",
    requestContract: "GatewayRequest", responseContract: "GatewayResponse", sideEffectClass: "low",
    allowedCallers: ["frontend-admin", "service-internal"], callsInto: ["admin-bff-gateway"],
    runtimeConsequence: "Legacy admin gateway callers degrade", migrationStatus: "wrapper" },

  { id: "ef.admin-intelligence", name: "admin-intelligence", path: "supabase/functions/admin-intelligence/index.ts", runtime: "deno", status: "active", description: "Admin intelligence and analytics",
    category: "DOMAIN_FUNCTION", boundedContext: "admin-plane", owner: "admin-governance", authModel: "jwt",
    requestContract: "IntelligenceRequest", responseContract: "IntelligenceResponse", sideEffectClass: "low",
    allowedCallers: ["admin-bff"], callsInto: ["ai-gateway"],
    runtimeConsequence: "Admin analytics offline", migrationStatus: "stable" },

  { id: "ef.admin-users", name: "admin-users", path: "supabase/functions/admin-users/index.ts", runtime: "deno", status: "active", description: "Admin user management",
    category: "DOMAIN_FUNCTION", boundedContext: "admin-plane", owner: "admin-governance", authModel: "jwt",
    requestContract: "AdminUsersRequest", responseContract: "AdminUsersResponse", sideEffectClass: "high",
    allowedCallers: ["admin-bff"], callsInto: [],
    runtimeConsequence: "Admin user management blocked", migrationStatus: "stable" },

  // ─── ADVISOR COUNCIL ───────────────────────────────────────
  { id: "ef.advisor-agent-loop", name: "advisor-agent-loop", path: "supabase/functions/advisor-agent-loop/index.ts", runtime: "deno", status: "active", description: "Advisor autonomous agent loop",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "advisor-council", owner: "advisor-intelligence", authModel: "jwt",
    requestContract: "AgentLoopInput", responseContract: "AgentLoopOutput", sideEffectClass: "high",
    allowedCallers: ["scheduler", "service-internal"], callsInto: ["agent-executor", "ai-gateway"],
    runtimeConsequence: "Advisor autonomy paused", migrationStatus: "stable" },

  { id: "ef.advisor-avatar-generate", name: "advisor-avatar-generate", path: "supabase/functions/advisor-avatar-generate/index.ts", runtime: "deno", status: "active", description: "Generates advisor avatar images",
    category: "DOMAIN_FUNCTION", boundedContext: "advisor-council", owner: "advisor-intelligence", authModel: "jwt",
    requestContract: "AvatarGenerateInput", responseContract: "AvatarGenerateOutput", sideEffectClass: "low",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: ["ai-gateway"],
    runtimeConsequence: "Advisor avatars unavailable", migrationStatus: "stable" },

  { id: "ef.advisor-conversation", name: "advisor-conversation", path: "supabase/functions/advisor-conversation/index.ts", runtime: "deno", status: "active", description: "Advisor chat conversation endpoint",
    category: "DOMAIN_FUNCTION", boundedContext: "advisor-council", owner: "advisor-intelligence", authModel: "jwt",
    requestContract: "ConversationInput", responseContract: "ConversationOutput", sideEffectClass: "medium",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: ["ai-gateway"],
    runtimeConsequence: "Advisor chat unavailable", migrationStatus: "stable" },

  { id: "ef.advisor-deep-intelligence", name: "advisor-deep-intelligence", path: "supabase/functions/advisor-deep-intelligence/index.ts", runtime: "deno", status: "active", description: "Deep intelligence analysis by advisors",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "advisor-council", owner: "advisor-intelligence", authModel: "jwt",
    requestContract: "DeepIntelligenceInput", responseContract: "DeepIntelligenceOutput", sideEffectClass: "medium",
    allowedCallers: ["scheduler", "service-internal"], callsInto: ["ai-gateway", "brain-core"],
    runtimeConsequence: "Deep advisor reasoning offline", migrationStatus: "stable" },

  { id: "ef.advisor-knowledge-manage", name: "advisor-knowledge-manage", path: "supabase/functions/advisor-knowledge-manage/index.ts", runtime: "deno", status: "active", description: "Manages advisor knowledge base",
    category: "DOMAIN_FUNCTION", boundedContext: "advisor-council", owner: "advisor-intelligence", authModel: "jwt",
    requestContract: "KnowledgeManageInput", responseContract: "KnowledgeManageOutput", sideEffectClass: "medium",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "Knowledge edits blocked", migrationStatus: "stable" },

  { id: "ef.advisor-weekly-report", name: "advisor-weekly-report", path: "supabase/functions/advisor-weekly-report/index.ts", runtime: "deno", status: "active", description: "Generates weekly advisor reports",
    category: "DOMAIN_FUNCTION", boundedContext: "advisor-council", owner: "advisor-intelligence", authModel: "jwt",
    requestContract: "WeeklyReportInput", responseContract: "WeeklyReportOutput", sideEffectClass: "low",
    allowedCallers: ["scheduler", "public-bff"], callsInto: ["ai-gateway"],
    runtimeConsequence: "Weekly reports not generated", migrationStatus: "stable" },

  // ─── AGENT RUNTIME ─────────────────────────────────────────
  { id: "ef.agent-executor", name: "agent-executor", path: "supabase/functions/agent-executor/index.ts", runtime: "deno", status: "active", description: "Sole orchestration choke point — executes agent actions",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: "AgentExecutorInput", responseContract: "AgentExecutorOutput", sideEffectClass: "high",
    allowedCallers: ["orchestration-function", "service-internal", "scheduler"], callsInto: ["domain-function", "connector-webhook"],
    runtimeConsequence: "All execution chains halt — HARD RULE", migrationStatus: "stable" },

  { id: "ef.agent-heartbeat", name: "agent-heartbeat", path: "supabase/functions/agent-heartbeat/index.ts", runtime: "deno", status: "active", description: "Agent liveness heartbeat",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: "HeartbeatResponse", sideEffectClass: "low",
    allowedCallers: ["external-webhook", "service-internal"], callsInto: [],
    runtimeConsequence: "Agent liveness lost", migrationStatus: "stable" },

  { id: "ef.agent-intelligence", name: "agent-intelligence", path: "supabase/functions/agent-intelligence/index.ts", runtime: "deno", status: "active", description: "Agent reasoning service",
    category: "DOMAIN_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: "AgentIntelligenceInput", responseContract: "AgentIntelligenceOutput", sideEffectClass: "low",
    allowedCallers: ["orchestration-function", "service-internal"], callsInto: ["ai-gateway"],
    runtimeConsequence: "Agent reasoning offline", migrationStatus: "stable" },

  { id: "ef.agent-scheduler", name: "agent-scheduler", path: "supabase/functions/agent-scheduler/index.ts", runtime: "deno", status: "active", description: "Schedules agent tasks",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: "SchedulerInput", responseContract: "SchedulerOutput", sideEffectClass: "medium",
    allowedCallers: ["scheduler", "service-internal"], callsInto: ["agent-executor", "advisor-agent-loop"],
    runtimeConsequence: "Agent scheduling stops", migrationStatus: "stable" },

  { id: "ef.agent-signal", name: "agent-signal", path: "supabase/functions/agent-signal/index.ts", runtime: "deno", status: "active", description: "Agent signal ingestion",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: "SignalInput", responseContract: "SignalAck", sideEffectClass: "medium",
    allowedCallers: ["service-internal", "external-webhook"], callsInto: ["agent-executor"],
    runtimeConsequence: "Agent signals lost", migrationStatus: "stable" },

  // ─── AI GATEWAY ────────────────────────────────────────────
  { id: "ef.ai-gateway", name: "ai-gateway", path: "supabase/functions/ai-gateway/index.ts", runtime: "deno", status: "active", description: "Sovereign AI Gateway — model routing and budget",
    category: "DOMAIN_FUNCTION", boundedContext: "ai-gateway", owner: "ai-engineering", authModel: "jwt",
    requestContract: "AiGatewayRequest", responseContract: "AiGatewayResponse", sideEffectClass: "medium",
    allowedCallers: ["any-authenticated", "service-internal", "domain-function", "orchestration-function"], callsInto: ["check-ai-budget"],
    runtimeConsequence: "All AI features degrade", migrationStatus: "stable" },

  { id: "ef.ai-health", name: "ai-health", path: "supabase/functions/ai-health/index.ts", runtime: "deno", status: "active", description: "AI subsystem health check",
    category: "DOMAIN_FUNCTION", boundedContext: "ai-gateway", owner: "ai-engineering", authModel: "anon",
    requestContract: null, responseContract: "HealthCheckResponse", sideEffectClass: "none",
    allowedCallers: ["any-authenticated", "external-webhook"], callsInto: [],
    runtimeConsequence: "AI health observability gap", migrationStatus: "stable" },

  { id: "ef.check-ai-budget", name: "check-ai-budget", path: "supabase/functions/check-ai-budget/index.ts", runtime: "deno", status: "active", description: "AI budget enforcement check",
    category: "DOMAIN_FUNCTION", boundedContext: "ai-gateway", owner: "ai-engineering", authModel: "jwt",
    requestContract: "BudgetCheckInput", responseContract: "BudgetCheckOutput", sideEffectClass: "none",
    allowedCallers: ["service-internal", "domain-function"], callsInto: [],
    runtimeConsequence: "AI budget gate disabled — cost risk", migrationStatus: "stable" },

  // ─── PLATFORM / GENERIC GATEWAYS ───────────────────────────
  { id: "ef.ambient-os-operations", name: "ambient-os-operations", path: "supabase/functions/ambient-os-operations/index.ts", runtime: "deno", status: "active", description: "Ambient OS operations — split required (UX-orch + runtime)",
    category: "SPLIT_REQUIRED", boundedContext: "os-kernel", owner: "os-kernel", authModel: "service-role",
    requestContract: "AmbientOpsInput", responseContract: "AmbientOpsOutput", sideEffectClass: "high",
    allowedCallers: ["service-internal", "kernel"], callsInto: [],
    runtimeConsequence: "Ambient OS background operations stop — phase-5 split pending", migrationStatus: "split-required" },

  { id: "ef.api-gateway", name: "api-gateway", path: "supabase/functions/api-gateway/index.ts", runtime: "deno", status: "deprecated", description: "Legacy public API gateway — wrapper to user-bff-gateway",
    category: "WRAPPER_ONLY", boundedContext: "platform-services", owner: "platform-core", authModel: "api-key",
    requestContract: "ApiGatewayRequest", responseContract: "ApiGatewayResponse", sideEffectClass: "low",
    allowedCallers: ["external-webhook", "frontend-user"], callsInto: ["user-bff-gateway"],
    runtimeConsequence: "External API consumers degrade", migrationStatus: "wrapper" },

  { id: "ef.main", name: "main", path: "supabase/functions/main/index.ts", runtime: "deno", status: "deprecated", description: "Legacy generic entry — deprecate-and-redirect",
    category: "DEPRECATE_AND_REDIRECT", boundedContext: "platform-services", owner: "platform-core", authModel: "anon",
    requestContract: null, responseContract: "MainResponse", sideEffectClass: "none",
    allowedCallers: ["external-webhook"], callsInto: [],
    runtimeConsequence: "Generic entry degrades — phase-4 deprecation pending", migrationStatus: "deprecated" },

  // ─── PUBLIC BFFs ───────────────────────────────────────────
  { id: "ef.user-bff-gateway", name: "user-bff-gateway", path: "supabase/functions/user-bff-gateway/index.ts", runtime: "deno", status: "active", description: "Canonical user-facing BFF — aggregation only",
    category: "PUBLIC_BFF", boundedContext: "user-experience", owner: "user-experience", authModel: "jwt",
    requestContract: "UserBffRequest", responseContract: "UserBffResponse", sideEffectClass: "low",
    allowedCallers: ["frontend-user"], callsInto: ["domain-function"],
    runtimeConsequence: "User dashboard data blocked", migrationStatus: "stable" },

  { id: "ef.intelligence-api", name: "intelligence-api", path: "supabase/functions/intelligence-api/index.ts", runtime: "deno", status: "active", description: "Frontend AI query aggregator (Public BFF)",
    category: "PUBLIC_BFF", boundedContext: "intelligence-pipeline", owner: "ai-engineering", authModel: "jwt",
    requestContract: "IntelligenceApiInput", responseContract: "IntelligenceApiOutput", sideEffectClass: "low",
    allowedCallers: ["frontend-user", "frontend-admin"], callsInto: ["brain-core", "ai-gateway", "advisor-deep-intelligence"],
    runtimeConsequence: "Intelligence UI surfaces blocked", migrationStatus: "stable" },

  { id: "ef.support-gateway", name: "support-gateway", path: "supabase/functions/support-gateway/index.ts", runtime: "deno", status: "active", description: "User support aggregation BFF",
    category: "PUBLIC_BFF", boundedContext: "user-experience", owner: "user-experience", authModel: "jwt",
    requestContract: "SupportRequest", responseContract: "SupportResponse", sideEffectClass: "low",
    allowedCallers: ["frontend-user"], callsInto: [],
    runtimeConsequence: "Support pages unavailable", migrationStatus: "stable" },

  { id: "ef.license-gateway", name: "license-gateway", path: "supabase/functions/license-gateway/index.ts", runtime: "deno", status: "active", description: "License/entitlement aggregation BFF",
    category: "PUBLIC_BFF", boundedContext: "user-experience", owner: "user-experience", authModel: "jwt",
    requestContract: "LicenseGatewayRequest", responseContract: "LicenseGatewayResponse", sideEffectClass: "low",
    allowedCallers: ["frontend-user", "frontend-admin"], callsInto: [],
    runtimeConsequence: "License/entitlement checks blocked", migrationStatus: "stable" },

  // ─── USER DOMAIN FUNCTIONS ─────────────────────────────────
  { id: "ef.booking-manage", name: "booking-manage", path: "supabase/functions/booking-manage/index.ts", runtime: "deno", status: "active", description: "Booking CRUD operations",
    category: "DOMAIN_FUNCTION", boundedContext: "user-experience", owner: "user-experience", authModel: "jwt",
    requestContract: "BookingManageInput", responseContract: "BookingManageOutput", sideEffectClass: "high",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "Booking management blocked", migrationStatus: "stable" },

  { id: "ef.get-weather", name: "get-weather", path: "supabase/functions/get-weather/index.ts", runtime: "deno", status: "active", description: "Weather data fetch",
    category: "DOMAIN_FUNCTION", boundedContext: "user-experience", owner: "user-experience", authModel: "anon",
    requestContract: "WeatherInput", responseContract: "WeatherOutput", sideEffectClass: "none",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "Weather widget shows stale", migrationStatus: "stable" },

  { id: "ef.chat-advisor", name: "chat-advisor", path: "supabase/functions/chat-advisor/index.ts", runtime: "deno", status: "active", description: "Chat-based advisor interaction",
    category: "DOMAIN_FUNCTION", boundedContext: "advisor-council", owner: "advisor-intelligence", authModel: "jwt",
    requestContract: "ChatInput", responseContract: "ChatOutput", sideEffectClass: "low",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: ["ai-gateway"],
    runtimeConsequence: "Advisor chat blocked", migrationStatus: "stable" },

  { id: "ef.personal-brain", name: "personal-brain", path: "supabase/functions/personal-brain/index.ts", runtime: "deno", status: "active", description: "Personal brain intelligence",
    category: "DOMAIN_FUNCTION", boundedContext: "intelligence-pipeline", owner: "ai-engineering", authModel: "jwt",
    requestContract: "PersonalBrainInput", responseContract: "PersonalBrainOutput", sideEffectClass: "medium",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: ["ai-gateway"],
    runtimeConsequence: "Personal intelligence offline", migrationStatus: "stable" },

  { id: "ef.tasks-workflow-api", name: "tasks-workflow-api", path: "supabase/functions/tasks-workflow-api/index.ts", runtime: "deno", status: "active", description: "Tasks/workflow domain API",
    category: "DOMAIN_FUNCTION", boundedContext: "user-experience", owner: "user-experience", authModel: "jwt",
    requestContract: "TasksWorkflowInput", responseContract: "TasksWorkflowOutput", sideEffectClass: "high",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "Task/workflow features blocked", migrationStatus: "stable" },

  { id: "ef.communications-api", name: "communications-api", path: "supabase/functions/communications-api/index.ts", runtime: "deno", status: "active", description: "Communications domain API",
    category: "DOMAIN_FUNCTION", boundedContext: "user-experience", owner: "user-experience", authModel: "jwt",
    requestContract: "CommunicationsInput", responseContract: "CommunicationsOutput", sideEffectClass: "high",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: ["push-dispatch"],
    runtimeConsequence: "Communications send/receive blocked", migrationStatus: "stable" },

  { id: "ef.app-store-api", name: "app-store-api", path: "supabase/functions/app-store-api/index.ts", runtime: "deno", status: "active", description: "App store catalog/install domain API",
    category: "DOMAIN_FUNCTION", boundedContext: "user-experience", owner: "user-experience", authModel: "jwt",
    requestContract: "AppStoreInput", responseContract: "AppStoreOutput", sideEffectClass: "medium",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "App store catalog/install blocked", migrationStatus: "stable" },

  { id: "ef.business-board-api", name: "business-board-api", path: "supabase/functions/business-board-api/index.ts", runtime: "deno", status: "active", description: "Business board decision API",
    category: "DOMAIN_FUNCTION", boundedContext: "intelligence-pipeline", owner: "advisor-intelligence", authModel: "jwt",
    requestContract: "BoardApiRequest", responseContract: "BoardApiResponse", sideEffectClass: "high",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: ["ai-gateway"],
    runtimeConsequence: "Boardroom domain blocked", migrationStatus: "stable" },

  { id: "ef.business-advisor-intelligence", name: "business-advisor-intelligence", path: "supabase/functions/business-advisor-intelligence/index.ts", runtime: "deno", status: "active", description: "Business domain advisor intelligence",
    category: "DOMAIN_FUNCTION", boundedContext: "intelligence-pipeline", owner: "advisor-intelligence", authModel: "jwt",
    requestContract: "BusinessIntelligenceInput", responseContract: "BusinessIntelligenceOutput", sideEffectClass: "medium",
    allowedCallers: ["public-bff", "service-internal"], callsInto: ["ai-gateway"],
    runtimeConsequence: "Business advisor reasoning offline", migrationStatus: "stable" },

  // ─── BRAIN (orchestration) ─────────────────────────────────
  { id: "ef.brain-core", name: "brain-core", path: "supabase/functions/brain-core/index.ts", runtime: "deno", status: "active", description: "Brain orchestration — planner/sequencer",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "intelligence-pipeline", owner: "ai-engineering", authModel: "jwt",
    requestContract: "BrainCoreInput", responseContract: "BrainCoreOutput", sideEffectClass: "high",
    allowedCallers: ["public-bff", "service-internal", "orchestration-function"], callsInto: ["ai-gateway", "agent-executor", "advisor-deep-intelligence"],
    runtimeConsequence: "Core orchestration offline", migrationStatus: "stable" },

  // ─── FINANCE DOMAIN ────────────────────────────────────────
  { id: "ef.cashflow-calculate", name: "cashflow-calculate", path: "supabase/functions/cashflow-calculate/index.ts", runtime: "deno", status: "active", description: "Cash flow calculation engine",
    category: "DOMAIN_FUNCTION", boundedContext: "finance-engine", owner: "finance-engine", authModel: "jwt",
    requestContract: "CashflowInput", responseContract: "CashflowOutput", sideEffectClass: "low",
    allowedCallers: ["public-bff", "frontend-user", "service-internal"], callsInto: [],
    runtimeConsequence: "Cash flow projections fail", migrationStatus: "stable" },

  { id: "ef.cost-alert", name: "cost-alert", path: "supabase/functions/cost-alert/index.ts", runtime: "deno", status: "active", description: "Cost threshold alerting",
    category: "DOMAIN_FUNCTION", boundedContext: "finance-engine", owner: "finance-engine", authModel: "service-role",
    requestContract: "CostAlertInput", responseContract: "CostAlertOutput", sideEffectClass: "medium",
    allowedCallers: ["scheduler", "service-internal"], callsInto: ["push-dispatch"],
    runtimeConsequence: "Cost alerts not triggered", migrationStatus: "stable" },

  { id: "ef.invoice-generate", name: "invoice-generate", path: "supabase/functions/invoice-generate/index.ts", runtime: "deno", status: "active", description: "Invoice PDF generation",
    category: "DOMAIN_FUNCTION", boundedContext: "finance-engine", owner: "finance-engine", authModel: "jwt",
    requestContract: "InvoiceGenerateInput", responseContract: "InvoiceGenerateOutput", sideEffectClass: "medium",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "Invoice generation blocked", migrationStatus: "stable" },

  { id: "ef.msa-operations", name: "msa-operations", path: "supabase/functions/msa-operations/index.ts", runtime: "deno", status: "active", description: "MSA document operations",
    category: "DOMAIN_FUNCTION", boundedContext: "finance-engine", owner: "finance-engine", authModel: "jwt",
    requestContract: "MsaOpsInput", responseContract: "MsaOpsOutput", sideEffectClass: "medium",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "MSA document handling blocked", migrationStatus: "stable" },

  { id: "ef.payment-process", name: "payment-process", path: "supabase/functions/payment-process/index.ts", runtime: "deno", status: "active", description: "Payment processing",
    category: "DOMAIN_FUNCTION", boundedContext: "finance-engine", owner: "finance-engine", authModel: "jwt",
    requestContract: "PaymentProcessInput", responseContract: "PaymentProcessOutput", sideEffectClass: "high",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: ["payment-kill-switch"],
    runtimeConsequence: "Payments cannot process", migrationStatus: "stable" },

  { id: "ef.payment-kill-switch", name: "payment-kill-switch", path: "supabase/functions/payment-kill-switch/index.ts", runtime: "deno", status: "active", description: "Emergency payment kill switch",
    category: "DOMAIN_FUNCTION", boundedContext: "finance-engine", owner: "finance-engine", authModel: "jwt",
    requestContract: "PaymentKillSwitchInput", responseContract: "PaymentKillSwitchOutput", sideEffectClass: "high",
    allowedCallers: ["admin-bff", "service-internal"], callsInto: [],
    runtimeConsequence: "Emergency payment halt unavailable", migrationStatus: "stable" },

  { id: "ef.revenue-caller", name: "revenue-caller", path: "supabase/functions/revenue-caller/index.ts", runtime: "deno", status: "active", description: "Revenue calculation caller",
    category: "DOMAIN_FUNCTION", boundedContext: "finance-engine", owner: "finance-engine", authModel: "jwt",
    requestContract: "RevenueCallerInput", responseContract: "RevenueCallerOutput", sideEffectClass: "low",
    allowedCallers: ["public-bff", "service-internal"], callsInto: [],
    runtimeConsequence: "Revenue projections offline", migrationStatus: "stable" },

  { id: "ef.tax-estimate", name: "tax-estimate", path: "supabase/functions/tax-estimate/index.ts", runtime: "deno", status: "active", description: "Tax estimation calculator",
    category: "DOMAIN_FUNCTION", boundedContext: "finance-engine", owner: "finance-engine", authModel: "jwt",
    requestContract: "TaxEstimateInput", responseContract: "TaxEstimateOutput", sideEffectClass: "low",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "Tax estimates unavailable", migrationStatus: "stable" },

  { id: "ef.investment-portfolio-api", name: "investment-portfolio-api", path: "supabase/functions/investment-portfolio-api/index.ts", runtime: "deno", status: "active", description: "Investment portfolio domain API",
    category: "DOMAIN_FUNCTION", boundedContext: "finance-engine", owner: "finance-engine", authModel: "jwt",
    requestContract: "InvestmentPortfolioInput", responseContract: "InvestmentPortfolioOutput", sideEffectClass: "medium",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "Portfolio features blocked", migrationStatus: "stable" },

  // ─── CLOUD CONTROL PLANE ───────────────────────────────────
  { id: "ef.cloud-admin-api", name: "cloud-admin-api", path: "supabase/functions/cloud-admin-api/index.ts", runtime: "deno", status: "active", description: "Cloud control plane admin (domain-scoped)",
    category: "DOMAIN_FUNCTION", boundedContext: "cloud-infrastructure", owner: "cloud-infrastructure", authModel: "jwt",
    requestContract: "CloudAdminRequest", responseContract: "CloudAdminResponse", sideEffectClass: "high",
    allowedCallers: ["admin-bff"], callsInto: [],
    runtimeConsequence: "Cloud admin operations blocked", migrationStatus: "stable" },

  { id: "ef.cloud-device-api", name: "cloud-device-api", path: "supabase/functions/cloud-device-api/index.ts", runtime: "deno", status: "active", description: "Cloud device registration and management",
    category: "DOMAIN_FUNCTION", boundedContext: "cloud-infrastructure", owner: "cloud-infrastructure", authModel: "jwt",
    requestContract: "CloudDeviceRequest", responseContract: "CloudDeviceResponse", sideEffectClass: "high",
    allowedCallers: ["public-bff", "admin-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "Device registration blocked", migrationStatus: "stable" },

  { id: "ef.cloud-lifecycle-api", name: "cloud-lifecycle-api", path: "supabase/functions/cloud-lifecycle-api/index.ts", runtime: "deno", status: "active", description: "Cloud resource lifecycle management",
    category: "DOMAIN_FUNCTION", boundedContext: "cloud-infrastructure", owner: "cloud-infrastructure", authModel: "jwt",
    requestContract: "LifecycleRequest", responseContract: "LifecycleResponse", sideEffectClass: "high",
    allowedCallers: ["admin-bff"], callsInto: [],
    runtimeConsequence: "Lifecycle ops blocked", migrationStatus: "stable" },

  { id: "ef.cloud-storage-api", name: "cloud-storage-api", path: "supabase/functions/cloud-storage-api/index.ts", runtime: "deno", status: "active", description: "Cloud storage operations",
    category: "DOMAIN_FUNCTION", boundedContext: "cloud-infrastructure", owner: "cloud-infrastructure", authModel: "jwt",
    requestContract: "StorageRequest", responseContract: "StorageResponse", sideEffectClass: "medium",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "Cloud storage ops blocked", migrationStatus: "stable" },

  { id: "ef.cloud-sync-api", name: "cloud-sync-api", path: "supabase/functions/cloud-sync-api/index.ts", runtime: "deno", status: "active", description: "Cloud data synchronization",
    category: "DOMAIN_FUNCTION", boundedContext: "cloud-infrastructure", owner: "cloud-infrastructure", authModel: "jwt",
    requestContract: "SyncRequest", responseContract: "SyncResponse", sideEffectClass: "high",
    allowedCallers: ["service-internal", "frontend-user"], callsInto: [],
    runtimeConsequence: "Sync queue stalls", migrationStatus: "stable" },

  { id: "ef.cloud-tenant-api", name: "cloud-tenant-api", path: "supabase/functions/cloud-tenant-api/index.ts", runtime: "deno", status: "active", description: "Multi-tenant management API",
    category: "DOMAIN_FUNCTION", boundedContext: "cloud-infrastructure", owner: "cloud-infrastructure", authModel: "jwt",
    requestContract: "TenantRequest", responseContract: "TenantResponse", sideEffectClass: "high",
    allowedCallers: ["admin-bff"], callsInto: [],
    runtimeConsequence: "Tenant management blocked", migrationStatus: "stable" },

  { id: "ef.cloud-worker-api", name: "cloud-worker-api", path: "supabase/functions/cloud-worker-api/index.ts", runtime: "deno", status: "active", description: "Cloud worker orchestration",
    category: "DOMAIN_FUNCTION", boundedContext: "cloud-infrastructure", owner: "cloud-infrastructure", authModel: "service-role",
    requestContract: "WorkerRequest", responseContract: "WorkerResponse", sideEffectClass: "high",
    allowedCallers: ["service-internal", "kernel"], callsInto: [],
    runtimeConsequence: "Cloud workers offline", migrationStatus: "stable" },

  // ─── CONNECTOR / WEBHOOK ───────────────────────────────────
  { id: "ef.connector-batch", name: "connector-batch", path: "supabase/functions/connector-batch/index.ts", runtime: "deno", status: "active", description: "Batch connector operations",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-fabric", owner: "connector-integrations", authModel: "jwt",
    requestContract: "ConnectorBatchInput", responseContract: "ConnectorBatchOutput", sideEffectClass: "high",
    allowedCallers: ["scheduler", "service-internal"], callsInto: ["connector-proxy"],
    runtimeConsequence: "Batch syncs paused", migrationStatus: "stable" },

  { id: "ef.connector-discover", name: "connector-discover", path: "supabase/functions/connector-discover/index.ts", runtime: "deno", status: "active", description: "Connector discovery and catalog",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-fabric", owner: "connector-integrations", authModel: "jwt",
    requestContract: "DiscoverInput", responseContract: "DiscoverOutput", sideEffectClass: "low",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "Connector discovery offline", migrationStatus: "stable" },

  { id: "ef.connector-health", name: "connector-health", path: "supabase/functions/connector-health/index.ts", runtime: "deno", status: "active", description: "Connector health monitoring",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-fabric", owner: "connector-integrations", authModel: "jwt",
    requestContract: "HealthInput", responseContract: "HealthOutput", sideEffectClass: "none",
    allowedCallers: ["public-bff", "admin-bff", "scheduler"], callsInto: [],
    runtimeConsequence: "Connector health observability gap", migrationStatus: "stable" },

  { id: "ef.connector-oauth", name: "connector-oauth", path: "supabase/functions/connector-oauth/index.ts", runtime: "deno", status: "active", description: "Connector OAuth flow handler",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-fabric", owner: "connector-integrations", authModel: "jwt",
    requestContract: "OAuthInput", responseContract: "OAuthOutput", sideEffectClass: "high",
    allowedCallers: ["frontend-user", "external-webhook"], callsInto: [],
    runtimeConsequence: "Connector auth flows break", migrationStatus: "stable" },

  { id: "ef.connector-operations", name: "connector-operations", path: "supabase/functions/connector-operations/index.ts", runtime: "deno", status: "active", description: "Connector CRUD operations",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-fabric", owner: "connector-integrations", authModel: "jwt",
    requestContract: "ConnectorOpsInput", responseContract: "ConnectorOpsOutput", sideEffectClass: "high",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "Connector configuration blocked", migrationStatus: "stable" },

  { id: "ef.connector-proxy", name: "connector-proxy", path: "supabase/functions/connector-proxy/index.ts", runtime: "deno", status: "active", description: "Proxies requests to external connectors",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-fabric", owner: "connector-integrations", authModel: "jwt",
    requestContract: "ProxyRequest", responseContract: "ProxyResponse", sideEffectClass: "medium",
    allowedCallers: ["service-internal", "domain-function", "connector-webhook"], callsInto: [],
    runtimeConsequence: "Outbound provider calls blocked", migrationStatus: "stable" },

  { id: "ef.connector-sync", name: "connector-sync", path: "supabase/functions/connector-sync/index.ts", runtime: "deno", status: "active", description: "Connector ingestion sync",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-fabric", owner: "connector-integrations", authModel: "jwt",
    requestContract: "ConnectorSyncInput", responseContract: "ConnectorSyncOutput", sideEffectClass: "high",
    allowedCallers: ["scheduler", "service-internal", "external-webhook"], callsInto: ["connector-proxy", "connector-transform"],
    runtimeConsequence: "Connector ingestion paused", migrationStatus: "stable" },

  { id: "ef.connector-transform", name: "connector-transform", path: "supabase/functions/connector-transform/index.ts", runtime: "deno", status: "active", description: "Transforms connector data formats",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-fabric", owner: "connector-integrations", authModel: "jwt",
    requestContract: "TransformInput", responseContract: "TransformOutput", sideEffectClass: "low",
    allowedCallers: ["service-internal", "connector-webhook"], callsInto: [],
    runtimeConsequence: "Connector transforms degrade", migrationStatus: "stable" },

  { id: "ef.crm-sync", name: "crm-sync", path: "supabase/functions/crm-sync/index.ts", runtime: "deno", status: "active", description: "CRM data synchronization",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-fabric", owner: "connector-integrations", authModel: "jwt",
    requestContract: "CrmSyncInput", responseContract: "CrmSyncOutput", sideEffectClass: "high",
    allowedCallers: ["scheduler", "service-internal"], callsInto: ["connector-proxy"],
    runtimeConsequence: "CRM ingestion paused", migrationStatus: "stable" },

  { id: "ef.provider-family-operations", name: "provider-family-operations", path: "supabase/functions/provider-family-operations/index.ts", runtime: "deno", status: "active", description: "Provider family management",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-fabric", owner: "connector-integrations", authModel: "jwt",
    requestContract: "ProviderFamilyInput", responseContract: "ProviderFamilyOutput", sideEffectClass: "medium",
    allowedCallers: ["admin-bff", "service-internal"], callsInto: [],
    runtimeConsequence: "Provider family ops blocked", migrationStatus: "stable" },

  // ─── RUNTIME / SYSTEM ──────────────────────────────────────
  { id: "ef.os-command", name: "os-command", path: "supabase/functions/os-command/index.ts", runtime: "deno", status: "active", description: "OS command execution channel",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "os-kernel", owner: "os-kernel", authModel: "jwt",
    requestContract: "OsCommandInput", responseContract: "OsCommandOutput", sideEffectClass: "high",
    allowedCallers: ["kernel", "service-internal"], callsInto: [],
    runtimeConsequence: "OS command channel offline — kernel blind", migrationStatus: "stable" },

  { id: "ef.os-status", name: "os-status", path: "supabase/functions/os-status/index.ts", runtime: "deno", status: "active", description: "OS status reporting",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "os-kernel", owner: "os-kernel", authModel: "anon",
    requestContract: null, responseContract: "OsStatusResponse", sideEffectClass: "none",
    allowedCallers: ["kernel", "external-webhook", "service-internal"], callsInto: [],
    runtimeConsequence: "OS status probes fail", migrationStatus: "stable" },

  { id: "ef.os-agent-channel", name: "os-agent-channel", path: "supabase/functions/os-agent-channel/index.ts", runtime: "deno", status: "active", description: "OS agent communication channel",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "os-kernel", owner: "os-kernel", authModel: "service-role",
    requestContract: "AgentChannelInput", responseContract: "AgentChannelOutput", sideEffectClass: "medium",
    allowedCallers: ["kernel", "service-internal"], callsInto: [],
    runtimeConsequence: "OS↔agent channel blocked", migrationStatus: "stable" },

  { id: "ef.runtime-probes", name: "runtime-probes", path: "supabase/functions/runtime-probes/index.ts", runtime: "deno", status: "active", description: "Runtime health probes",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "os-kernel", owner: "os-kernel", authModel: "anon",
    requestContract: null, responseContract: "ProbeResponse", sideEffectClass: "none",
    allowedCallers: ["kernel", "external-webhook"], callsInto: [],
    runtimeConsequence: "Observability gap", migrationStatus: "stable" },

  { id: "ef.db-truth-introspect", name: "db-truth-introspect", path: "supabase/functions/db-truth-introspect/index.ts", runtime: "deno", status: "active", description: "Read-only DB schema/RLS/drift introspection — admin-only",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "jwt",
    requestContract: "DbTruthIntrospectInput", responseContract: "DbTruthIntrospectOutput", sideEffectClass: "none",
    allowedCallers: ["admin-bff", "frontend-admin"], callsInto: [],
    runtimeConsequence: "DbTruthExplorer falls back to static registry view", migrationStatus: "stable" },

  { id: "ef.device-telemetry", name: "device-telemetry", path: "supabase/functions/device-telemetry/index.ts", runtime: "deno", status: "active", description: "Device telemetry ingestion",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "os-kernel", owner: "cloud-infrastructure", authModel: "jwt",
    requestContract: "TelemetryInput", responseContract: "TelemetryAck", sideEffectClass: "low",
    allowedCallers: ["kernel", "external-webhook"], callsInto: [],
    runtimeConsequence: "Device telemetry lost", migrationStatus: "stable" },

  { id: "ef.system-updates", name: "system-updates", path: "supabase/functions/system-updates/index.ts", runtime: "deno", status: "active", description: "System update notifications",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "os-kernel", owner: "os-kernel", authModel: "service-role",
    requestContract: "SystemUpdatesInput", responseContract: "SystemUpdatesOutput", sideEffectClass: "medium",
    allowedCallers: ["kernel", "scheduler"], callsInto: [],
    runtimeConsequence: "System update channel offline", migrationStatus: "stable" },

  { id: "ef.self-healing", name: "self-healing", path: "supabase/functions/self-healing/index.ts", runtime: "deno", status: "active", description: "Self-healing recovery operations",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "os-kernel", owner: "os-kernel", authModel: "service-role",
    requestContract: "SelfHealingInput", responseContract: "SelfHealingOutput", sideEffectClass: "high",
    allowedCallers: ["kernel", "scheduler", "service-internal"], callsInto: [],
    runtimeConsequence: "Auto-recovery disabled", migrationStatus: "stable" },

  // ─── ECOSYSTEM / EVENT / SCHEDULER ─────────────────────────
  { id: "ef.ecosystem-operations", name: "ecosystem-operations", path: "supabase/functions/ecosystem-operations/index.ts", runtime: "deno", status: "active", description: "Ecosystem-wide orchestration ops",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "jwt",
    requestContract: "EcosystemOpsInput", responseContract: "EcosystemOpsOutput", sideEffectClass: "high",
    allowedCallers: ["admin-bff", "scheduler"], callsInto: ["agent-executor"],
    runtimeConsequence: "Ecosystem orchestration paused", migrationStatus: "stable" },

  { id: "ef.event-processor", name: "event-processor", path: "supabase/functions/event-processor/index.ts", runtime: "deno", status: "active", description: "Event processing pipeline",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: "EventInput", responseContract: "EventOutput", sideEffectClass: "high",
    allowedCallers: ["service-internal", "external-webhook", "scheduler"], callsInto: ["agent-executor", "push-dispatch"],
    runtimeConsequence: "Event pipeline stalls", migrationStatus: "stable" },

  { id: "ef.scheduler-dispatch", name: "scheduler-dispatch", path: "supabase/functions/scheduler-dispatch/index.ts", runtime: "deno", status: "active", description: "Scheduled task dispatch",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: "SchedulerDispatchInput", responseContract: "SchedulerDispatchOutput", sideEffectClass: "high",
    allowedCallers: ["scheduler", "service-internal"], callsInto: ["agent-executor", "advisor-agent-loop"],
    runtimeConsequence: "Scheduled tasks not dispatched", migrationStatus: "stable" },

  { id: "ef.digital-twin-engine", name: "digital-twin-engine", path: "supabase/functions/digital-twin-engine/index.ts", runtime: "deno", status: "active", description: "Digital twin orchestration engine",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "intelligence-pipeline", owner: "ai-engineering", authModel: "jwt",
    requestContract: "DigitalTwinInput", responseContract: "DigitalTwinOutput", sideEffectClass: "medium",
    allowedCallers: ["public-bff", "service-internal"], callsInto: ["ai-gateway"],
    runtimeConsequence: "Digital twin simulations offline", migrationStatus: "stable" },

  { id: "ef.simulation-engine-api", name: "simulation-engine-api", path: "supabase/functions/simulation-engine-api/index.ts", runtime: "deno", status: "active", description: "Simulation engine orchestration",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "intelligence-pipeline", owner: "ai-engineering", authModel: "jwt",
    requestContract: "SimulationEngineInput", responseContract: "SimulationEngineOutput", sideEffectClass: "medium",
    allowedCallers: ["public-bff", "service-internal"], callsInto: ["ai-gateway", "brain-core"],
    runtimeConsequence: "What-if simulations offline", migrationStatus: "stable" },

  // ─── PLATFORM / FILES / HEALTH ─────────────────────────────
  { id: "ef.file-ingestion", name: "file-ingestion", path: "supabase/functions/file-ingestion/index.ts", runtime: "deno", status: "active", description: "File upload and ingestion",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "jwt",
    requestContract: "FileIngestionInput", responseContract: "FileIngestionOutput", sideEffectClass: "high",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "File ingestion blocked", migrationStatus: "stable" },

  { id: "ef.seed-user-data", name: "seed-user-data", path: "supabase/functions/seed-user-data/index.ts", runtime: "deno", status: "active", description: "Seeds demo/test user data",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "jwt",
    requestContract: "SeedInput", responseContract: "SeedOutput", sideEffectClass: "high",
    allowedCallers: ["admin-bff", "service-internal"], callsInto: [],
    runtimeConsequence: "Demo seeding unavailable", migrationStatus: "stable" },

  { id: "ef.health-check", name: "health-check", path: "supabase/functions/health-check/index.ts", runtime: "deno", status: "active", description: "Platform health probe",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "anon",
    requestContract: null, responseContract: "HealthCheckResponse", sideEffectClass: "none",
    allowedCallers: ["external-webhook", "any-authenticated", "kernel"], callsInto: [],
    runtimeConsequence: "Health check observability gap", migrationStatus: "stable" },

  // ─── NOTIFICATIONS ─────────────────────────────────────────
  { id: "ef.push-dispatch", name: "push-dispatch", path: "supabase/functions/push-dispatch/index.ts", runtime: "deno", status: "active", description: "Push notification dispatch",
    category: "DOMAIN_FUNCTION", boundedContext: "notification-dispatch", owner: "notification-services", authModel: "service-role",
    requestContract: "PushDispatchInput", responseContract: "PushDispatchOutput", sideEffectClass: "medium",
    allowedCallers: ["service-internal", "domain-function", "scheduler"], callsInto: [],
    runtimeConsequence: "Push notifications delayed", migrationStatus: "stable" },

  { id: "ef.push-track", name: "push-track", path: "supabase/functions/push-track/index.ts", runtime: "deno", status: "active", description: "Push notification tracking",
    category: "DOMAIN_FUNCTION", boundedContext: "notification-dispatch", owner: "notification-services", authModel: "jwt",
    requestContract: "PushTrackInput", responseContract: "PushTrackAck", sideEffectClass: "low",
    allowedCallers: ["public-bff", "frontend-user", "external-webhook"], callsInto: [],
    runtimeConsequence: "Push receipts lost", migrationStatus: "stable" },

  { id: "ef.vapid-public-key", name: "vapid-public-key", path: "supabase/functions/vapid-public-key/index.ts", runtime: "deno", status: "active", description: "Returns VAPID public key for push",
    category: "DOMAIN_FUNCTION", boundedContext: "notification-dispatch", owner: "notification-services", authModel: "anon",
    requestContract: null, responseContract: "VapidKeyResponse", sideEffectClass: "none",
    allowedCallers: ["public-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "Push subscription setup fails", migrationStatus: "stable" },

  // ─── COMPLIANCE ────────────────────────────────────────────
  { id: "ef.gdpr-delete", name: "gdpr-delete", path: "supabase/functions/gdpr-delete/index.ts", runtime: "deno", status: "active", description: "GDPR data deletion handler",
    category: "DOMAIN_FUNCTION", boundedContext: "compliance-privacy", owner: "compliance-security", authModel: "jwt",
    requestContract: "GdprDeleteInput", responseContract: "GdprDeleteOutput", sideEffectClass: "high",
    allowedCallers: ["admin-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "GDPR deletion compliance risk", migrationStatus: "stable" },

  { id: "ef.gdpr-export", name: "gdpr-export", path: "supabase/functions/gdpr-export/index.ts", runtime: "deno", status: "active", description: "GDPR data export handler",
    category: "DOMAIN_FUNCTION", boundedContext: "compliance-privacy", owner: "compliance-security", authModel: "jwt",
    requestContract: "GdprExportInput", responseContract: "GdprExportOutput", sideEffectClass: "medium",
    allowedCallers: ["admin-bff", "frontend-user"], callsInto: [],
    runtimeConsequence: "GDPR export compliance risk", migrationStatus: "stable" },

  { id: "ef.verification-recorder", name: "verification-recorder", path: "supabase/functions/verification-recorder/index.ts", runtime: "deno", status: "active", description: "Records verification/proof results",
    category: "DOMAIN_FUNCTION", boundedContext: "compliance-privacy", owner: "compliance-security", authModel: "jwt",
    requestContract: "VerificationInput", responseContract: "VerificationOutput", sideEffectClass: "medium",
    allowedCallers: ["service-internal", "domain-function"], callsInto: [],
    runtimeConsequence: "Verification proofs lost", migrationStatus: "stable" },

  // ─── AUTO-GENERATED: 117 additional functions ──────────────
  { id: "ef.account-delete", name: "account-delete", path: "supabase/functions/account-delete/index.ts", runtime: "deno", status: "active", description: "account delete",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "high",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "account-delete unavailable", migrationStatus: "stable" },

  { id: "ef.admin-reset-user-setup", name: "admin-reset-user-setup", path: "supabase/functions/admin-reset-user-setup/index.ts", runtime: "deno", status: "active", description: "admin reset user setup",
    category: "DOMAIN_FUNCTION", boundedContext: "admin-plane", owner: "admin-governance", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "admin-reset-user-setup unavailable", migrationStatus: "stable" },

  { id: "ef.admin-revoke-session", name: "admin-revoke-session", path: "supabase/functions/admin-revoke-session/index.ts", runtime: "deno", status: "active", description: "admin revoke session",
    category: "DOMAIN_FUNCTION", boundedContext: "admin-plane", owner: "admin-governance", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "admin-revoke-session unavailable", migrationStatus: "stable" },

  { id: "ef.ai-receipt-completeness-snapshot", name: "ai-receipt-completeness-snapshot", path: "supabase/functions/ai-receipt-completeness-snapshot/index.ts", runtime: "deno", status: "active", description: "ai receipt completeness snapshot",
    category: "DOMAIN_FUNCTION", boundedContext: "ai-gateway", owner: "ai-engineering", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "ai-receipt-completeness-snapshot unavailable", migrationStatus: "stable" },

  { id: "ef.ai-runtime-nightly-verify", name: "ai-runtime-nightly-verify", path: "supabase/functions/ai-runtime-nightly-verify/index.ts", runtime: "deno", status: "active", description: "ai runtime nightly verify",
    category: "DOMAIN_FUNCTION", boundedContext: "ai-gateway", owner: "ai-engineering", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "ai-runtime-nightly-verify unavailable", migrationStatus: "stable" },

  { id: "ef.alert-actions", name: "alert-actions", path: "supabase/functions/alert-actions/index.ts", runtime: "deno", status: "active", description: "alert actions",
    category: "DOMAIN_FUNCTION", boundedContext: "observability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "alert-actions unavailable", migrationStatus: "stable" },

  { id: "ef.alert-ingest", name: "alert-ingest", path: "supabase/functions/alert-ingest/index.ts", runtime: "deno", status: "active", description: "alert ingest",
    category: "DOMAIN_FUNCTION", boundedContext: "observability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "alert-ingest unavailable", migrationStatus: "stable" },

  { id: "ef.alert-route", name: "alert-route", path: "supabase/functions/alert-route/index.ts", runtime: "deno", status: "active", description: "alert route",
    category: "DOMAIN_FUNCTION", boundedContext: "observability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "alert-route unavailable", migrationStatus: "stable" },

  { id: "ef.alert-router", name: "alert-router", path: "supabase/functions/alert-router/index.ts", runtime: "deno", status: "active", description: "alert router",
    category: "DOMAIN_FUNCTION", boundedContext: "observability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "alert-router unavailable", migrationStatus: "stable" },

  { id: "ef.apm-metrics-ingest", name: "apm-metrics-ingest", path: "supabase/functions/apm-metrics-ingest/index.ts", runtime: "deno", status: "active", description: "apm metrics ingest",
    category: "DOMAIN_FUNCTION", boundedContext: "observability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "apm-metrics-ingest unavailable", migrationStatus: "stable" },

  { id: "ef.app-ingest-pwa", name: "app-ingest-pwa", path: "supabase/functions/app-ingest-pwa/index.ts", runtime: "deno", status: "active", description: "app ingest pwa",
    category: "DOMAIN_FUNCTION", boundedContext: "app-ecosystem", owner: "app-platform", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "app-ingest-pwa unavailable", migrationStatus: "stable" },

  { id: "ef.app-ingest-web", name: "app-ingest-web", path: "supabase/functions/app-ingest-web/index.ts", runtime: "deno", status: "active", description: "app ingest web",
    category: "DOMAIN_FUNCTION", boundedContext: "app-ecosystem", owner: "app-platform", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "app-ingest-web unavailable", migrationStatus: "stable" },

  { id: "ef.app-install", name: "app-install", path: "supabase/functions/app-install/index.ts", runtime: "deno", status: "active", description: "app install",
    category: "DOMAIN_FUNCTION", boundedContext: "app-ecosystem", owner: "app-platform", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "app-install unavailable", migrationStatus: "stable" },

  { id: "ef.app-launch-resolve", name: "app-launch-resolve", path: "supabase/functions/app-launch-resolve/index.ts", runtime: "deno", status: "active", description: "app launch resolve",
    category: "DOMAIN_FUNCTION", boundedContext: "app-ecosystem", owner: "app-platform", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "app-launch-resolve unavailable", migrationStatus: "stable" },

  { id: "ef.app-manifest-sync", name: "app-manifest-sync", path: "supabase/functions/app-manifest-sync/index.ts", runtime: "deno", status: "active", description: "app manifest sync",
    category: "DOMAIN_FUNCTION", boundedContext: "app-ecosystem", owner: "app-platform", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "none",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "app-manifest-sync unavailable", migrationStatus: "stable" },

  { id: "ef.app-manifest-verifier", name: "app-manifest-verifier", path: "supabase/functions/app-manifest-verifier/index.ts", runtime: "deno", status: "active", description: "app manifest verifier",
    category: "DOMAIN_FUNCTION", boundedContext: "app-ecosystem", owner: "app-platform", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "none",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "app-manifest-verifier unavailable", migrationStatus: "stable" },

  { id: "ef.app-permissions-sync", name: "app-permissions-sync", path: "supabase/functions/app-permissions-sync/index.ts", runtime: "deno", status: "active", description: "app permissions sync",
    category: "DOMAIN_FUNCTION", boundedContext: "app-ecosystem", owner: "app-platform", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "app-permissions-sync unavailable", migrationStatus: "stable" },

  { id: "ef.app-screenshot-capture", name: "app-screenshot-capture", path: "supabase/functions/app-screenshot-capture/index.ts", runtime: "deno", status: "active", description: "app screenshot capture",
    category: "DOMAIN_FUNCTION", boundedContext: "app-ecosystem", owner: "app-platform", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "app-screenshot-capture unavailable", migrationStatus: "stable" },

  { id: "ef.app-store-catalog", name: "app-store-catalog", path: "supabase/functions/app-store-catalog/index.ts", runtime: "deno", status: "active", description: "app store catalog",
    category: "DOMAIN_FUNCTION", boundedContext: "app-ecosystem", owner: "app-platform", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "app-store-catalog unavailable", migrationStatus: "stable" },

  { id: "ef.app-uninstall", name: "app-uninstall", path: "supabase/functions/app-uninstall/index.ts", runtime: "deno", status: "active", description: "app uninstall",
    category: "DOMAIN_FUNCTION", boundedContext: "app-ecosystem", owner: "app-platform", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "app-uninstall unavailable", migrationStatus: "stable" },

  { id: "ef.app-update-check", name: "app-update-check", path: "supabase/functions/app-update-check/index.ts", runtime: "deno", status: "active", description: "app update check",
    category: "DOMAIN_FUNCTION", boundedContext: "app-ecosystem", owner: "app-platform", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "none",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "app-update-check unavailable", migrationStatus: "stable" },

  { id: "ef.attestation-packet-builder", name: "attestation-packet-builder", path: "supabase/functions/attestation-packet-builder/index.ts", runtime: "deno", status: "active", description: "attestation packet builder",
    category: "DOMAIN_FUNCTION", boundedContext: "release-pipeline", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "attestation-packet-builder unavailable", migrationStatus: "stable" },

  { id: "ef.audit-export-bundler", name: "audit-export-bundler", path: "supabase/functions/audit-export-bundler/index.ts", runtime: "deno", status: "active", description: "audit export bundler",
    category: "DOMAIN_FUNCTION", boundedContext: "compliance", owner: "compliance-security", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "audit-export-bundler unavailable", migrationStatus: "stable" },

  { id: "ef.audit-log-export", name: "audit-log-export", path: "supabase/functions/audit-log-export/index.ts", runtime: "deno", status: "active", description: "audit log export",
    category: "DOMAIN_FUNCTION", boundedContext: "compliance", owner: "compliance-security", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "audit-log-export unavailable", migrationStatus: "stable" },

  { id: "ef.beta-apply", name: "beta-apply", path: "supabase/functions/beta-apply/index.ts", runtime: "deno", status: "active", description: "beta apply",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "beta-apply unavailable", migrationStatus: "stable" },

  { id: "ef.boardroom-cockpit-telemetry", name: "boardroom-cockpit-telemetry", path: "supabase/functions/boardroom-cockpit-telemetry/index.ts", runtime: "deno", status: "active", description: "boardroom cockpit telemetry",
    category: "DOMAIN_FUNCTION", boundedContext: "boardroom", owner: "advisor-intelligence", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "boardroom-cockpit-telemetry unavailable", migrationStatus: "stable" },

  { id: "ef.boardroom-followthrough-dispatch", name: "boardroom-followthrough-dispatch", path: "supabase/functions/boardroom-followthrough-dispatch/index.ts", runtime: "deno", status: "active", description: "boardroom followthrough dispatch",
    category: "DOMAIN_FUNCTION", boundedContext: "boardroom", owner: "advisor-intelligence", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "boardroom-followthrough-dispatch unavailable", migrationStatus: "stable" },

  { id: "ef.boardroom-followthrough-sla", name: "boardroom-followthrough-sla", path: "supabase/functions/boardroom-followthrough-sla/index.ts", runtime: "deno", status: "active", description: "boardroom followthrough sla",
    category: "DOMAIN_FUNCTION", boundedContext: "boardroom", owner: "advisor-intelligence", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "boardroom-followthrough-sla unavailable", migrationStatus: "stable" },

  { id: "ef.boardroom-outcome-record", name: "boardroom-outcome-record", path: "supabase/functions/boardroom-outcome-record/index.ts", runtime: "deno", status: "active", description: "boardroom outcome record",
    category: "DOMAIN_FUNCTION", boundedContext: "boardroom", owner: "advisor-intelligence", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "boardroom-outcome-record unavailable", migrationStatus: "stable" },

  { id: "ef.boardroom-replay", name: "boardroom-replay", path: "supabase/functions/boardroom-replay/index.ts", runtime: "deno", status: "active", description: "boardroom replay",
    category: "DOMAIN_FUNCTION", boundedContext: "boardroom", owner: "advisor-intelligence", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "boardroom-replay unavailable", migrationStatus: "stable" },

  { id: "ef.boardroom-session", name: "boardroom-session", path: "supabase/functions/boardroom-session/index.ts", runtime: "deno", status: "active", description: "boardroom session",
    category: "DOMAIN_FUNCTION", boundedContext: "boardroom", owner: "advisor-intelligence", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "boardroom-session unavailable", migrationStatus: "stable" },

  { id: "ef.canary-chaos-cron", name: "canary-chaos-cron", path: "supabase/functions/canary-chaos-cron/index.ts", runtime: "deno", status: "active", description: "canary chaos cron",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "reliability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "canary-chaos-cron unavailable", migrationStatus: "stable" },

  { id: "ef.chaos-drill-runner", name: "chaos-drill-runner", path: "supabase/functions/chaos-drill-runner/index.ts", runtime: "deno", status: "active", description: "chaos drill runner",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "reliability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "chaos-drill-runner unavailable", migrationStatus: "stable" },

  { id: "ef.compliance-evidence-collector", name: "compliance-evidence-collector", path: "supabase/functions/compliance-evidence-collector/index.ts", runtime: "deno", status: "active", description: "compliance evidence collector",
    category: "DOMAIN_FUNCTION", boundedContext: "compliance", owner: "compliance-security", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "compliance-evidence-collector unavailable", migrationStatus: "stable" },

  { id: "ef.compliance-evidence-cron", name: "compliance-evidence-cron", path: "supabase/functions/compliance-evidence-cron/index.ts", runtime: "deno", status: "active", description: "compliance evidence cron",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "scheduler", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "compliance-evidence-cron unavailable", migrationStatus: "stable" },

  { id: "ef.connector-reauth-tracker", name: "connector-reauth-tracker", path: "supabase/functions/connector-reauth-tracker/index.ts", runtime: "deno", status: "active", description: "connector reauth tracker",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-mesh", owner: "connector-integrations", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "connector-reauth-tracker unavailable", migrationStatus: "stable" },

  { id: "ef.connector-refresh-nightly-verify", name: "connector-refresh-nightly-verify", path: "supabase/functions/connector-refresh-nightly-verify/index.ts", runtime: "deno", status: "active", description: "connector refresh nightly verify",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-mesh", owner: "connector-integrations", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "connector-refresh-nightly-verify unavailable", migrationStatus: "stable" },

  { id: "ef.connector-token-refresh", name: "connector-token-refresh", path: "supabase/functions/connector-token-refresh/index.ts", runtime: "deno", status: "active", description: "connector token refresh",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-mesh", owner: "connector-integrations", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "connector-token-refresh unavailable", migrationStatus: "stable" },

  { id: "ef.crash-report-ingest", name: "crash-report-ingest", path: "supabase/functions/crash-report-ingest/index.ts", runtime: "deno", status: "active", description: "crash report ingest",
    category: "DOMAIN_FUNCTION", boundedContext: "observability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "crash-report-ingest unavailable", migrationStatus: "stable" },

  { id: "ef.cron-receipt-collector", name: "cron-receipt-collector", path: "supabase/functions/cron-receipt-collector/index.ts", runtime: "deno", status: "active", description: "cron receipt collector",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "scheduler", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "cron-receipt-collector unavailable", migrationStatus: "stable" },

  { id: "ef.data-cleanup", name: "data-cleanup", path: "supabase/functions/data-cleanup/index.ts", runtime: "deno", status: "active", description: "data cleanup",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "data-cleanup unavailable", migrationStatus: "stable" },

  { id: "ef.data-export", name: "data-export", path: "supabase/functions/data-export/index.ts", runtime: "deno", status: "active", description: "data export",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "data-export unavailable", migrationStatus: "stable" },

  { id: "ef.db-introspection", name: "db-introspection", path: "supabase/functions/db-introspection/index.ts", runtime: "deno", status: "active", description: "db introspection",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "db-introspection unavailable", migrationStatus: "stable" },

  { id: "ef.desktop-update-manifest", name: "desktop-update-manifest", path: "supabase/functions/desktop-update-manifest/index.ts", runtime: "deno", status: "active", description: "desktop update manifest",
    category: "DOMAIN_FUNCTION", boundedContext: "device-experience", owner: "cloud-infrastructure", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "none",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "desktop-update-manifest unavailable", migrationStatus: "stable" },

  { id: "ef.dr-drill-cron", name: "dr-drill-cron", path: "supabase/functions/dr-drill-cron/index.ts", runtime: "deno", status: "active", description: "dr drill cron",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "reliability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "dr-drill-cron unavailable", migrationStatus: "stable" },

  { id: "ef.dr-drill-executor", name: "dr-drill-executor", path: "supabase/functions/dr-drill-executor/index.ts", runtime: "deno", status: "active", description: "dr drill executor",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "reliability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "dr-drill-executor unavailable", migrationStatus: "stable" },

  { id: "ef.dr-drill-runner", name: "dr-drill-runner", path: "supabase/functions/dr-drill-runner/index.ts", runtime: "deno", status: "active", description: "dr drill runner",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "reliability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "dr-drill-runner unavailable", migrationStatus: "stable" },

  { id: "ef.error-ingest", name: "error-ingest", path: "supabase/functions/error-ingest/index.ts", runtime: "deno", status: "active", description: "error ingest",
    category: "DOMAIN_FUNCTION", boundedContext: "observability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "error-ingest unavailable", migrationStatus: "stable" },

  { id: "ef.escalation-engine", name: "escalation-engine", path: "supabase/functions/escalation-engine/index.ts", runtime: "deno", status: "active", description: "escalation engine",
    category: "DOMAIN_FUNCTION", boundedContext: "observability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "escalation-engine unavailable", migrationStatus: "stable" },

  { id: "ef.evidence-graph-builder", name: "evidence-graph-builder", path: "supabase/functions/evidence-graph-builder/index.ts", runtime: "deno", status: "active", description: "evidence graph builder",
    category: "DOMAIN_FUNCTION", boundedContext: "compliance", owner: "compliance-security", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "evidence-graph-builder unavailable", migrationStatus: "stable" },

  { id: "ef.external-workforce-api", name: "external-workforce-api", path: "supabase/functions/external-workforce-api/index.ts", runtime: "deno", status: "active", description: "external workforce api",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "external-workforce-api unavailable", migrationStatus: "stable" },

  { id: "ef.external-workforce-webhook-dispatcher", name: "external-workforce-webhook-dispatcher", path: "supabase/functions/external-workforce-webhook-dispatcher/index.ts", runtime: "deno", status: "active", description: "external workforce webhook dispatcher",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "webhook-pipeline", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "external-workforce-webhook-dispatcher unavailable", migrationStatus: "stable" },

  { id: "ef.federated-knowledge-aggregator", name: "federated-knowledge-aggregator", path: "supabase/functions/federated-knowledge-aggregator/index.ts", runtime: "deno", status: "active", description: "federated knowledge aggregator",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "federated-knowledge-aggregator unavailable", migrationStatus: "stable" },

  { id: "ef.generate-support-bundle", name: "generate-support-bundle", path: "supabase/functions/generate-support-bundle/index.ts", runtime: "deno", status: "active", description: "generate support bundle",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "generate-support-bundle unavailable", migrationStatus: "stable" },

  { id: "ef.health-beat", name: "health-beat", path: "supabase/functions/health-beat/index.ts", runtime: "deno", status: "active", description: "health beat",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "reliability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "none",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "health-beat unavailable", migrationStatus: "stable" },

  { id: "ef.health-cron", name: "health-cron", path: "supabase/functions/health-cron/index.ts", runtime: "deno", status: "active", description: "health cron",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "reliability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "none",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "health-cron unavailable", migrationStatus: "stable" },

  { id: "ef.health-live", name: "health-live", path: "supabase/functions/health-live/index.ts", runtime: "deno", status: "active", description: "health live",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "reliability", owner: "platform-core", authModel: "anon",
    requestContract: null, responseContract: null, sideEffectClass: "none",
    allowedCallers: ["external-webhook","frontend-user"], callsInto: [],
    runtimeConsequence: "health-live unavailable", migrationStatus: "stable" },

  { id: "ef.health-ready", name: "health-ready", path: "supabase/functions/health-ready/index.ts", runtime: "deno", status: "active", description: "health ready",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "reliability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "none",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "health-ready unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-canary-runner", name: "internal-agent-canary-runner", path: "supabase/functions/internal-agent-canary-runner/index.ts", runtime: "deno", status: "active", description: "internal agent canary runner",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-canary-runner unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-chaos-scheduler", name: "internal-agent-chaos-scheduler", path: "supabase/functions/internal-agent-chaos-scheduler/index.ts", runtime: "deno", status: "active", description: "internal agent chaos scheduler",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-chaos-scheduler unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-consensus-engine", name: "internal-agent-consensus-engine", path: "supabase/functions/internal-agent-consensus-engine/index.ts", runtime: "deno", status: "active", description: "internal agent consensus engine",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-consensus-engine unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-cost-optimizer", name: "internal-agent-cost-optimizer", path: "supabase/functions/internal-agent-cost-optimizer/index.ts", runtime: "deno", status: "active", description: "internal agent cost optimizer",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-cost-optimizer unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-dependency-scanner", name: "internal-agent-dependency-scanner", path: "supabase/functions/internal-agent-dependency-scanner/index.ts", runtime: "deno", status: "active", description: "internal agent dependency scanner",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-dependency-scanner unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-execute-action", name: "internal-agent-execute-action", path: "supabase/functions/internal-agent-execute-action/index.ts", runtime: "deno", status: "active", description: "internal agent execute action",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-execute-action unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-loop", name: "internal-agent-loop", path: "supabase/functions/internal-agent-loop/index.ts", runtime: "deno", status: "active", description: "internal agent loop",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-loop unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-policy-architect", name: "internal-agent-policy-architect", path: "supabase/functions/internal-agent-policy-architect/index.ts", runtime: "deno", status: "active", description: "internal agent policy architect",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-policy-architect unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-reflect", name: "internal-agent-reflect", path: "supabase/functions/internal-agent-reflect/index.ts", runtime: "deno", status: "active", description: "internal agent reflect",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-reflect unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-self-healer", name: "internal-agent-self-healer", path: "supabase/functions/internal-agent-self-healer/index.ts", runtime: "deno", status: "active", description: "internal agent self healer",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-self-healer unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-slo-evaluator", name: "internal-agent-slo-evaluator", path: "supabase/functions/internal-agent-slo-evaluator/index.ts", runtime: "deno", status: "active", description: "internal agent slo evaluator",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-slo-evaluator unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-suggestion-generator", name: "internal-agent-suggestion-generator", path: "supabase/functions/internal-agent-suggestion-generator/index.ts", runtime: "deno", status: "active", description: "internal agent suggestion generator",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-suggestion-generator unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-tenant-federation", name: "internal-agent-tenant-federation", path: "supabase/functions/internal-agent-tenant-federation/index.ts", runtime: "deno", status: "active", description: "internal agent tenant federation",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "internal-agent-tenant-federation unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-trust-evaluator", name: "internal-agent-trust-evaluator", path: "supabase/functions/internal-agent-trust-evaluator/index.ts", runtime: "deno", status: "active", description: "internal agent trust evaluator",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-trust-evaluator unavailable", migrationStatus: "stable" },

  { id: "ef.internal-agent-weekly-digest", name: "internal-agent-weekly-digest", path: "supabase/functions/internal-agent-weekly-digest/index.ts", runtime: "deno", status: "active", description: "internal agent weekly digest",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "agent-runtime", owner: "agent-runtime", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "internal-agent-weekly-digest unavailable", migrationStatus: "stable" },

  { id: "ef.investor-request", name: "investor-request", path: "supabase/functions/investor-request/index.ts", runtime: "deno", status: "active", description: "investor request",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "investor-request unavailable", migrationStatus: "stable" },

  { id: "ef.kill-switch-state", name: "kill-switch-state", path: "supabase/functions/kill-switch-state/index.ts", runtime: "deno", status: "active", description: "kill switch state",
    category: "DOMAIN_FUNCTION", boundedContext: "admin-plane", owner: "admin-governance", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "high",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "kill-switch-state unavailable", migrationStatus: "stable" },

  { id: "ef.kill-switch-toggle", name: "kill-switch-toggle", path: "supabase/functions/kill-switch-toggle/index.ts", runtime: "deno", status: "active", description: "kill switch toggle",
    category: "DOMAIN_FUNCTION", boundedContext: "admin-plane", owner: "admin-governance", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "high",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "kill-switch-toggle unavailable", migrationStatus: "stable" },

  { id: "ef.mobile-deferral-attestor", name: "mobile-deferral-attestor", path: "supabase/functions/mobile-deferral-attestor/index.ts", runtime: "deno", status: "active", description: "mobile deferral attestor",
    category: "DOMAIN_FUNCTION", boundedContext: "device-experience", owner: "cloud-infrastructure", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "mobile-deferral-attestor unavailable", migrationStatus: "stable" },

  { id: "ef.oauth-refresh-probe", name: "oauth-refresh-probe", path: "supabase/functions/oauth-refresh-probe/index.ts", runtime: "deno", status: "active", description: "oauth refresh probe",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-mesh", owner: "connector-integrations", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "oauth-refresh-probe unavailable", migrationStatus: "stable" },

  { id: "ef.onboarding-branch-tracker", name: "onboarding-branch-tracker", path: "supabase/functions/onboarding-branch-tracker/index.ts", runtime: "deno", status: "active", description: "onboarding branch tracker",
    category: "DOMAIN_FUNCTION", boundedContext: "onboarding", owner: "user-experience", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "onboarding-branch-tracker unavailable", migrationStatus: "stable" },

  { id: "ef.onboarding-resume-checkpoint", name: "onboarding-resume-checkpoint", path: "supabase/functions/onboarding-resume-checkpoint/index.ts", runtime: "deno", status: "active", description: "onboarding resume checkpoint",
    category: "DOMAIN_FUNCTION", boundedContext: "onboarding", owner: "user-experience", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "none",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "onboarding-resume-checkpoint unavailable", migrationStatus: "stable" },

  { id: "ef.os-update-manifest", name: "os-update-manifest", path: "supabase/functions/os-update-manifest/index.ts", runtime: "deno", status: "active", description: "os update manifest",
    category: "DOMAIN_FUNCTION", boundedContext: "device-experience", owner: "cloud-infrastructure", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "none",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "os-update-manifest unavailable", migrationStatus: "stable" },

  { id: "ef.owner-copilot-bff", name: "owner-copilot-bff", path: "supabase/functions/owner-copilot-bff/index.ts", runtime: "deno", status: "active", description: "owner copilot bff",
    category: "PUBLIC_BFF", boundedContext: "owner-experience", owner: "user-experience", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "owner-copilot-bff unavailable", migrationStatus: "stable" },

  { id: "ef.owner-copilot-session-tracker", name: "owner-copilot-session-tracker", path: "supabase/functions/owner-copilot-session-tracker/index.ts", runtime: "deno", status: "active", description: "owner copilot session tracker",
    category: "PUBLIC_BFF", boundedContext: "owner-experience", owner: "user-experience", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "owner-copilot-session-tracker unavailable", migrationStatus: "stable" },

  { id: "ef.package-verify", name: "package-verify", path: "supabase/functions/package-verify/index.ts", runtime: "deno", status: "active", description: "package verify",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "package-verify unavailable", migrationStatus: "stable" },

  { id: "ef.press-inquiry", name: "press-inquiry", path: "supabase/functions/press-inquiry/index.ts", runtime: "deno", status: "active", description: "press inquiry",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "press-inquiry unavailable", migrationStatus: "stable" },

  { id: "ef.production-launch-attestor", name: "production-launch-attestor", path: "supabase/functions/production-launch-attestor/index.ts", runtime: "deno", status: "active", description: "production launch attestor",
    category: "DOMAIN_FUNCTION", boundedContext: "release-pipeline", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "production-launch-attestor unavailable", migrationStatus: "stable" },

  { id: "ef.prompt-versioning", name: "prompt-versioning", path: "supabase/functions/prompt-versioning/index.ts", runtime: "deno", status: "active", description: "prompt versioning",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "prompt-versioning unavailable", migrationStatus: "stable" },

  { id: "ef.recovery-evidence-ingest", name: "recovery-evidence-ingest", path: "supabase/functions/recovery-evidence-ingest/index.ts", runtime: "deno", status: "active", description: "recovery evidence ingest",
    category: "DOMAIN_FUNCTION", boundedContext: "compliance", owner: "compliance-security", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "recovery-evidence-ingest unavailable", migrationStatus: "stable" },

  { id: "ef.release-artifact-signer", name: "release-artifact-signer", path: "supabase/functions/release-artifact-signer/index.ts", runtime: "deno", status: "active", description: "release artifact signer",
    category: "DOMAIN_FUNCTION", boundedContext: "release-pipeline", owner: "platform-core", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "release-artifact-signer unavailable", migrationStatus: "stable" },

  { id: "ef.release-artifact-verifier", name: "release-artifact-verifier", path: "supabase/functions/release-artifact-verifier/index.ts", runtime: "deno", status: "active", description: "release artifact verifier",
    category: "DOMAIN_FUNCTION", boundedContext: "release-pipeline", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "release-artifact-verifier unavailable", migrationStatus: "stable" },

  { id: "ef.release-env-gate", name: "release-env-gate", path: "supabase/functions/release-env-gate/index.ts", runtime: "deno", status: "active", description: "release env gate",
    category: "DOMAIN_FUNCTION", boundedContext: "release-pipeline", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "release-env-gate unavailable", migrationStatus: "stable" },

  { id: "ef.release-evidence-graph-snapshot", name: "release-evidence-graph-snapshot", path: "supabase/functions/release-evidence-graph-snapshot/index.ts", runtime: "deno", status: "active", description: "release evidence graph snapshot",
    category: "DOMAIN_FUNCTION", boundedContext: "release-pipeline", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "release-evidence-graph-snapshot unavailable", migrationStatus: "stable" },

  { id: "ef.routing-policy-update", name: "routing-policy-update", path: "supabase/functions/routing-policy-update/index.ts", runtime: "deno", status: "active", description: "routing policy update",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "routing-policy-update unavailable", migrationStatus: "stable" },

  { id: "ef.runbook-drill", name: "runbook-drill", path: "supabase/functions/runbook-drill/index.ts", runtime: "deno", status: "active", description: "runbook drill",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "runbook-drill unavailable", migrationStatus: "stable" },

  { id: "ef.secret-rotation-orchestrator", name: "secret-rotation-orchestrator", path: "supabase/functions/secret-rotation-orchestrator/index.ts", runtime: "deno", status: "active", description: "secret rotation orchestrator",
    category: "DOMAIN_FUNCTION", boundedContext: "security", owner: "compliance-security", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "secret-rotation-orchestrator unavailable", migrationStatus: "stable" },

  { id: "ef.security-anomaly-rotation-trigger", name: "security-anomaly-rotation-trigger", path: "supabase/functions/security-anomaly-rotation-trigger/index.ts", runtime: "deno", status: "active", description: "security anomaly rotation trigger",
    category: "DOMAIN_FUNCTION", boundedContext: "security", owner: "compliance-security", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "security-anomaly-rotation-trigger unavailable", migrationStatus: "stable" },

  { id: "ef.security-council-tick", name: "security-council-tick", path: "supabase/functions/security-council-tick/index.ts", runtime: "deno", status: "active", description: "security council tick",
    category: "DOMAIN_FUNCTION", boundedContext: "security", owner: "compliance-security", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "security-council-tick unavailable", migrationStatus: "stable" },

  { id: "ef.security-fabric-runtime-probe", name: "security-fabric-runtime-probe", path: "supabase/functions/security-fabric-runtime-probe/index.ts", runtime: "deno", status: "active", description: "security fabric runtime probe",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "reliability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "security-fabric-runtime-probe unavailable", migrationStatus: "stable" },

  { id: "ef.security-kill-switch-recommender", name: "security-kill-switch-recommender", path: "supabase/functions/security-kill-switch-recommender/index.ts", runtime: "deno", status: "active", description: "security kill switch recommender",
    category: "DOMAIN_FUNCTION", boundedContext: "admin-plane", owner: "admin-governance", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "high",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "security-kill-switch-recommender unavailable", migrationStatus: "stable" },

  { id: "ef.seed-advisor-registry", name: "seed-advisor-registry", path: "supabase/functions/seed-advisor-registry/index.ts", runtime: "deno", status: "active", description: "seed advisor registry",
    category: "DOMAIN_FUNCTION", boundedContext: "boardroom", owner: "advisor-intelligence", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "seed-advisor-registry unavailable", migrationStatus: "stable" },

  { id: "ef.seed-connector-registry", name: "seed-connector-registry", path: "supabase/functions/seed-connector-registry/index.ts", runtime: "deno", status: "active", description: "seed connector registry",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "connector-mesh", owner: "connector-integrations", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "seed-connector-registry unavailable", migrationStatus: "stable" },

  { id: "ef.sla-evaluator", name: "sla-evaluator", path: "supabase/functions/sla-evaluator/index.ts", runtime: "deno", status: "active", description: "sla evaluator",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "reliability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "sla-evaluator unavailable", migrationStatus: "stable" },

  { id: "ef.support-recovery-api", name: "support-recovery-api", path: "supabase/functions/support-recovery-api/index.ts", runtime: "deno", status: "active", description: "support recovery api",
    category: "DOMAIN_FUNCTION", boundedContext: "compliance", owner: "compliance-security", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "support-recovery-api unavailable", migrationStatus: "stable" },

  { id: "ef.tenant-self-service-bff", name: "tenant-self-service-bff", path: "supabase/functions/tenant-self-service-bff/index.ts", runtime: "deno", status: "active", description: "tenant self service bff",
    category: "PUBLIC_BFF", boundedContext: "owner-experience", owner: "user-experience", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "tenant-self-service-bff unavailable", migrationStatus: "stable" },

  { id: "ef.trace-ingest", name: "trace-ingest", path: "supabase/functions/trace-ingest/index.ts", runtime: "deno", status: "active", description: "trace ingest",
    category: "DOMAIN_FUNCTION", boundedContext: "observability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "trace-ingest unavailable", migrationStatus: "stable" },

  { id: "ef.uptime-rollup", name: "uptime-rollup", path: "supabase/functions/uptime-rollup/index.ts", runtime: "deno", status: "active", description: "uptime rollup",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "uptime-rollup unavailable", migrationStatus: "stable" },

  { id: "ef.waitlist-signup", name: "waitlist-signup", path: "supabase/functions/waitlist-signup/index.ts", runtime: "deno", status: "active", description: "waitlist signup",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "waitlist-signup unavailable", migrationStatus: "stable" },

  { id: "ef.waitlist-stats", name: "waitlist-stats", path: "supabase/functions/waitlist-stats/index.ts", runtime: "deno", status: "active", description: "waitlist stats",
    category: "DOMAIN_FUNCTION", boundedContext: "platform-services", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "none",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "waitlist-stats unavailable", migrationStatus: "stable" },

  { id: "ef.webauthn-challenge", name: "webauthn-challenge", path: "supabase/functions/webauthn-challenge/index.ts", runtime: "deno", status: "active", description: "webauthn challenge",
    category: "DOMAIN_FUNCTION", boundedContext: "security", owner: "compliance-security", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","public-bff"], callsInto: [],
    runtimeConsequence: "webauthn-challenge unavailable", migrationStatus: "stable" },

  { id: "ef.webhook-ingest", name: "webhook-ingest", path: "supabase/functions/webhook-ingest/index.ts", runtime: "deno", status: "active", description: "webhook ingest",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "webhook-pipeline", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "webhook-ingest unavailable", migrationStatus: "stable" },

  { id: "ef.webhook-process", name: "webhook-process", path: "supabase/functions/webhook-process/index.ts", runtime: "deno", status: "active", description: "webhook process",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "webhook-pipeline", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "webhook-process unavailable", migrationStatus: "stable" },

  { id: "ef.webhook-replay", name: "webhook-replay", path: "supabase/functions/webhook-replay/index.ts", runtime: "deno", status: "active", description: "webhook replay",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "webhook-pipeline", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "webhook-replay unavailable", migrationStatus: "stable" },

  { id: "ef.webhook-retry-processor", name: "webhook-retry-processor", path: "supabase/functions/webhook-retry-processor/index.ts", runtime: "deno", status: "active", description: "webhook retry processor",
    category: "CONNECTOR_WEBHOOK_FUNCTION", boundedContext: "webhook-pipeline", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "webhook-retry-processor unavailable", migrationStatus: "stable" },

  { id: "ef.workflow-execute", name: "workflow-execute", path: "supabase/functions/workflow-execute/index.ts", runtime: "deno", status: "active", description: "workflow execute",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "workflow-engine", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "workflow-execute unavailable", migrationStatus: "stable" },

  { id: "ef.workflow-repair", name: "workflow-repair", path: "supabase/functions/workflow-repair/index.ts", runtime: "deno", status: "active", description: "workflow repair",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "workflow-engine", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "workflow-repair unavailable", migrationStatus: "stable" },

  { id: "ef.workflow-replay", name: "workflow-replay", path: "supabase/functions/workflow-replay/index.ts", runtime: "deno", status: "active", description: "workflow replay",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "workflow-engine", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "workflow-replay unavailable", migrationStatus: "stable" },

  { id: "ef.workflow-stuck-detector", name: "workflow-stuck-detector", path: "supabase/functions/workflow-stuck-detector/index.ts", runtime: "deno", status: "active", description: "workflow stuck detector",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "workflow-engine", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "workflow-stuck-detector unavailable", migrationStatus: "stable" },

  // ── SITA Brain & Personal-Brain cron / orchestration ───────────
  { id: "ef.personal-brain-cron", name: "personal-brain-cron", path: "supabase/functions/personal-brain-cron/index.ts", runtime: "deno", status: "active", description: "personal brain scheduled tick",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "intelligence-pipeline", owner: "ai-engineering", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["scheduler","service-internal"], callsInto: ["personal-brain"],
    runtimeConsequence: "personal-brain background loop unavailable", migrationStatus: "stable" },

  { id: "ef.self-heal-receipts", name: "self-heal-receipts", path: "supabase/functions/self-heal-receipts/index.ts", runtime: "deno", status: "active", description: "self-heal missing AI receipts",
    category: "RUNTIME_SYSTEM_FUNCTION", boundedContext: "observability", owner: "platform-core", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["scheduler","service-internal"], callsInto: [],
    runtimeConsequence: "receipt back-fill unavailable", migrationStatus: "stable" },

  { id: "ef.sita-agent-planner", name: "sita-agent-planner", path: "supabase/functions/sita-agent-planner/index.ts", runtime: "deno", status: "active", description: "SITA agent plan generator",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "intelligence-pipeline", owner: "ai-engineering", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","service-internal","scheduler"], callsInto: [],
    runtimeConsequence: "agent planning unavailable", migrationStatus: "stable" },

  { id: "ef.sita-briefings-generate", name: "sita-briefings-generate", path: "supabase/functions/sita-briefings-generate/index.ts", runtime: "deno", status: "active", description: "queues morning/midday/evening briefings",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "intelligence-pipeline", owner: "ai-engineering", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["scheduler","service-internal"], callsInto: [],
    runtimeConsequence: "proactive briefings cron unavailable", migrationStatus: "stable" },

  { id: "ef.sita-council-prevote", name: "sita-council-prevote", path: "supabase/functions/sita-council-prevote/index.ts", runtime: "deno", status: "active", description: "advisor council pre-vote synthesis",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "intelligence-pipeline", owner: "ai-engineering", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","service-internal"], callsInto: [],
    runtimeConsequence: "council prevote unavailable", migrationStatus: "stable" },

  { id: "ef.sita-dream-consolidate", name: "sita-dream-consolidate", path: "supabase/functions/sita-dream-consolidate/index.ts", runtime: "deno", status: "active", description: "nightly memory consolidation (dream)",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "intelligence-pipeline", owner: "ai-engineering", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["scheduler","service-internal"], callsInto: [],
    runtimeConsequence: "dream consolidation cron unavailable", migrationStatus: "stable" },

  { id: "ef.sita-handoff-broker", name: "sita-handoff-broker", path: "supabase/functions/sita-handoff-broker/index.ts", runtime: "deno", status: "active", description: "advisor handoff broker",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "intelligence-pipeline", owner: "ai-engineering", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["frontend-user","service-internal"], callsInto: [],
    runtimeConsequence: "advisor handoff unavailable", migrationStatus: "stable" },

  { id: "ef.sita-personality-tune", name: "sita-personality-tune", path: "supabase/functions/sita-personality-tune/index.ts", runtime: "deno", status: "active", description: "tune SITA personality parameters",
    category: "DOMAIN_FUNCTION", boundedContext: "intelligence-pipeline", owner: "ai-engineering", authModel: "jwt",
    requestContract: null, responseContract: null, sideEffectClass: "low",
    allowedCallers: ["frontend-user","service-internal"], callsInto: [],
    runtimeConsequence: "personality tuning unavailable", migrationStatus: "stable" },

  { id: "ef.sita-reflection-loop", name: "sita-reflection-loop", path: "supabase/functions/sita-reflection-loop/index.ts", runtime: "deno", status: "active", description: "scheduled reflection loop for advisors",
    category: "ORCHESTRATION_FUNCTION", boundedContext: "intelligence-pipeline", owner: "ai-engineering", authModel: "service-role",
    requestContract: null, responseContract: null, sideEffectClass: "medium",
    allowedCallers: ["scheduler","service-internal"], callsInto: [],
    runtimeConsequence: "reflection loop cron unavailable", migrationStatus: "stable" },
] as const;

export type EdgeFunctionName = typeof EDGE_FUNCTION_REGISTRY[number]["name"];

// ── Lookup helpers ────────────────────────────────────────────
export function getEdgeFunction(name: string): EdgeFunctionEntry | undefined {
  return EDGE_FUNCTION_REGISTRY.find(f => f.name === name);
}

export function getEdgeFunctionsByStatus(status: EdgeFunctionStatus): readonly EdgeFunctionEntry[] {
  return EDGE_FUNCTION_REGISTRY.filter(f => f.status === status);
}

export function getAllEdgeFunctionNames(): readonly string[] {
  return EDGE_FUNCTION_REGISTRY.map(f => f.name);
}

export function getEdgeFunctionsByCategory(category: ClassificationVerdict): readonly EdgeFunctionEntry[] {
  return EDGE_FUNCTION_REGISTRY.filter(f => f.category === category);
}

export function getEdgeFunctionsByOwner(owner: OwnerTeam): readonly EdgeFunctionEntry[] {
  return EDGE_FUNCTION_REGISTRY.filter(f => f.owner === owner);
}

export function getEdgeFunctionsByCaller(caller: CallerClass): readonly EdgeFunctionEntry[] {
  return EDGE_FUNCTION_REGISTRY.filter(f => f.allowedCallers.includes(caller));
}

export function getCallGraphFor(name: string): readonly string[] {
  const entry = getEdgeFunction(name);
  return entry?.callsInto ?? [];
}
