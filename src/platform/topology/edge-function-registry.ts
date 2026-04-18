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
