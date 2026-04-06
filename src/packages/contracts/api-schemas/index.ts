// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared API Schema Contracts
// Canonical request/response types for ALL edge functions.
// Frontend and edge functions BOTH import from here.
// ═══════════════════════════════════════════════════════════════

// ── Chat / Brain ─────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface PersonalBrainRequest {
  messages: ChatMessage[];
  mode?: "think" | "learn" | "build" | "create";
}

export interface PersonalBrainResponse {
  reply: string;
  confidence?: number;
  sources?: string[];
}

export interface ChatAdvisorRequest {
  messages: ChatMessage[];
  advisor?: string;
  context?: Record<string, unknown>;
}

export interface ChatAdvisorResponse {
  reply: string;
  advisor: string;
  confidence?: number;
  actions?: Array<{ type: string; label: string; payload?: unknown }>;
}

export interface BrainCoreRequest {
  intent: string;
  advisor: "money" | "business" | "concierge" | "family" | "growth" | "general";
  context?: Record<string, unknown>;
  secondary_advisor?: "money" | "business" | "concierge" | "family" | "growth" | "general";
  stream?: boolean;
}

export interface BrainCoreResponse {
  recommendation: string;
  reasoning: string;
  confidence: number;
  actions: Array<{ type: string; label: string; payload?: unknown }>;
  correlation_id: string;
}

// ── Admin ────────────────────────────────────────────────────

export interface AdminApiRequest {
  _endpoint: string;
  [key: string]: unknown;
}

export interface AdminApiResponse {
  data?: unknown;
  error?: string;
}

export interface AdminIntelligenceRequest {
  _endpoint: "anomalies" | "forecast" | "optimize";
}

export interface AdminIntelligenceResponse {
  items?: unknown[];
  summary?: string;
}

export interface AdminUsersListRequest {
  action: "list";
}

export interface AdminUsersActionRequest {
  action: "suspend" | "unsuspend" | "assign_role" | "revoke_role";
  target_user_id: string;
  role?: string;
}

export type AdminUsersRequest = AdminUsersListRequest | AdminUsersActionRequest;

export interface AdminUsersResponse {
  users?: Array<{ id: string; email: string; role?: string; status?: string }>;
  success?: boolean;
  error?: string;
}

// ── Agent System ─────────────────────────────────────────────

export interface AgentExecutorRequest {
  agent_id: string;
  action?: "diagnose" | "execute" | "rollback";
  params?: Record<string, unknown>;
}

export interface AgentExecutorResponse {
  status: "success" | "error" | "pending";
  result?: unknown;
  receipts?: Array<{ id: string; action_type: string; status: string }>;
}

export interface AgentHeartbeatRequest {
  agent_id: string;
  metrics?: Record<string, number>;
}

export interface AgentHeartbeatResponse {
  acknowledged: boolean;
  next_check_ms?: number;
}

export interface AgentIntelligenceRequest {
  action?: "fleet-status" | "agent-detail" | "performance-report";
  agent_id?: string;
}

export interface AgentIntelligenceResponse {
  agents?: unknown[];
  summary?: Record<string, unknown>;
}

export interface AgentSchedulerRequest {
  action: "list" | "create" | "update" | "delete" | "trigger";
  schedule_id?: string;
  agent_id?: string;
  schedule?: Record<string, unknown>;
}

export interface AgentSchedulerResponse {
  schedules?: unknown[];
  success?: boolean;
}

export interface AgentSignalRequest {
  agent_id: string;
  signal_type: string;
  payload?: Record<string, unknown>;
  priority?: "high" | "medium" | "low";
}

export interface AgentSignalResponse {
  signal_id: string;
  queued: boolean;
}

// ── Connector System ─────────────────────────────────────────

export type ConnectorAction =
  | "create_instance" | "sync_instance" | "seed_registry"
  | "disconnect" | "sync_run" | "health_check" | "demo_activate";

export interface ConnectorOperationsRequest {
  action: ConnectorAction;
  connector_type?: string;
  instance_id?: string;
  account_id?: string;
  config?: Record<string, unknown>;
}

export interface ConnectorOperationsResponse {
  success?: boolean;
  data?: unknown;
  error?: string;
}

export interface ConnectorHealthRequest {
  action?: "check" | "report";
}

export interface ConnectorHealthResponse {
  connectors?: Array<{
    id: string;
    name: string;
    status: "healthy" | "degraded" | "down";
    last_check: string;
  }>;
}

export interface ConnectorProxyRequest {
  connector: string;
  action: string;
  payload?: Record<string, unknown>;
}

export interface ConnectorProxyResponse {
  data?: unknown;
  error?: string;
}

// ── OS / System ──────────────────────────────────────────────

export type OsCommandType =
  | "restart-service" | "update-now" | "run-backup"
  | "clear-cache" | "rotate-certs" | "health-check";

export interface OsCommandRequest {
  device_id: string;
  command: OsCommandType;
  params?: Record<string, unknown>;
}

export interface OsCommandResponse {
  success: boolean;
  output?: string;
  error?: string;
}

export interface OsStatusRequest {
  user_id?: string;
  hostname?: string;
}

export interface OsStatusResponse {
  status: "online" | "offline" | "degraded";
  uptime_ms?: number;
  services?: Array<{ name: string; status: string }>;
}

// ── MSA (Multi-Surface Architecture) ─────────────────────────

export type MsaAction =
  | "seed_surfaces" | "seed_capabilities" | "seed_experience_grammars"
  | "portability_report" | "surface_launch_profile_check"
  | "audit_boundaries" | "check_consistency";

export interface MsaOperationsRequest {
  action: MsaAction;
  params?: Record<string, unknown>;
}

export interface MsaOperationsResponse {
  success?: boolean;
  data?: unknown;
  report?: unknown;
  error?: string;
}

// ── Provider Family ──────────────────────────────────────────

export type ProviderFamilyAction =
  | "seed_provider_families" | "seed_google_family" | "check_permission_drift";

export interface ProviderFamilyRequest {
  action: ProviderFamilyAction;
}

export interface ProviderFamilyResponse {
  success?: boolean;
  data?: unknown;
  error?: string;
}

// ── Ambient OS ───────────────────────────────────────────────

export type AmbientAction =
  | "update_presence" | "seed_device_families" | "seed_wearable_providers";

export interface AmbientOsRequest {
  action: AmbientAction;
  params?: Record<string, unknown>;
}

export interface AmbientOsResponse {
  success?: boolean;
  error?: string;
}

// ── Device Telemetry ─────────────────────────────────────────

export interface DeviceTelemetryRequest {
  device_id: string;
  metrics: Record<string, number>;
  timestamp?: string;
}

export interface DeviceTelemetryResponse {
  received: boolean;
}

// ── Revenue / Business ───────────────────────────────────────

export interface RevenueCallerRequest {
  action: "call" | "status" | "history";
  to?: string;
  contactId?: string;
  script?: string;
}

export interface RevenueCallerResponse {
  success?: boolean;
  call_sid?: string;
  status?: string;
  error?: string;
}

// ── GDPR ─────────────────────────────────────────────────────

export interface GdprExportRequest {
  format?: "json" | "csv";
}

export interface GdprExportResponse {
  download_url?: string;
  data?: unknown;
  error?: string;
}

export interface GdprDeleteRequest {
  confirm?: boolean;
}

export interface GdprDeleteResponse {
  success: boolean;
  deleted_tables?: string[];
  error?: string;
}

// ── File Ingestion ───────────────────────────────────────────

export interface FileIngestionRequest {
  storage_path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
}

export interface FileIngestionResponse {
  ingestion_id: string;
  status: "queued" | "processing" | "complete" | "error";
  classification?: string;
}

// ── Seed ─────────────────────────────────────────────────────

export interface SeedUserDataRequest {
  force?: boolean;
}

export interface SeedUserDataResponse {
  seeded: boolean;
  tables?: string[];
  error?: string;
}

// ── Event Processor ──────────────────────────────────────────

export interface EventProcessorRequest {
  mode?: "process" | "emit";
  type?: string;
  payload?: Record<string, unknown>;
}

export interface EventProcessorResponse {
  processed?: boolean;
  event_id?: string;
  error?: string;
}

// ── Cost Alert ───────────────────────────────────────────────

export interface CostAlertRequest {
  action?: "check" | "configure";
  threshold_cents?: number;
}

export interface CostAlertResponse {
  alerts?: Array<{ id: string; message: string; severity: string }>;
  acknowledged?: boolean;
}

// ── AI Health ────────────────────────────────────────────────

export interface AiHealthRequest {
  action?: "status" | "diagnose";
}

export interface AiHealthResponse {
  providers?: Array<{ name: string; status: string; latency_ms: number }>;
  overall: "healthy" | "degraded" | "down";
}

// ── Runtime Probes ───────────────────────────────────────────

export interface RuntimeProbesRequest {
  probe?: "readiness" | "liveness" | "startup";
}

export interface RuntimeProbesResponse {
  status: "ok" | "fail";
  checks?: Record<string, boolean>;
}

// ── Scheduler Dispatch ───────────────────────────────────────

export interface SchedulerDispatchRequest {
  schedule_id?: string;
  force?: boolean;
}

export interface SchedulerDispatchResponse {
  dispatched: number;
  results?: Array<{ schedule_id: string; status: string }>;
}

// ── Self Healing ─────────────────────────────────────────────

export interface SelfHealingRequest {
  action?: "scan" | "heal" | "report";
  target?: string;
}

export interface SelfHealingResponse {
  issues_found?: number;
  healed?: number;
  report?: unknown;
}

// ── System Updates ───────────────────────────────────────────

export interface SystemUpdatesRequest {
  action: "register" | "check" | "apply";
  user_id?: string;
  version?: string;
}

export interface SystemUpdatesResponse {
  success?: boolean;
  updates_available?: boolean;
  version?: string;
}

// ═══════════════════════════════════════════════════════════════
// Master Function Map — maps function name → request/response
// ═══════════════════════════════════════════════════════════════

export interface EdgeFunctionMap {
  "personal-brain": { request: PersonalBrainRequest; response: PersonalBrainResponse };
  "chat-advisor": { request: ChatAdvisorRequest; response: ChatAdvisorResponse };
  "brain-core": { request: BrainCoreRequest; response: BrainCoreResponse };
  "admin-api": { request: AdminApiRequest; response: AdminApiResponse };
  "admin-intelligence": { request: AdminIntelligenceRequest; response: AdminIntelligenceResponse };
  "admin-users": { request: AdminUsersRequest; response: AdminUsersResponse };
  "agent-executor": { request: AgentExecutorRequest; response: AgentExecutorResponse };
  "agent-heartbeat": { request: AgentHeartbeatRequest; response: AgentHeartbeatResponse };
  "agent-intelligence": { request: AgentIntelligenceRequest; response: AgentIntelligenceResponse };
  "agent-scheduler": { request: AgentSchedulerRequest; response: AgentSchedulerResponse };
  "agent-signal": { request: AgentSignalRequest; response: AgentSignalResponse };
  "connector-operations": { request: ConnectorOperationsRequest; response: ConnectorOperationsResponse };
  "connector-health": { request: ConnectorHealthRequest; response: ConnectorHealthResponse };
  "connector-proxy": { request: ConnectorProxyRequest; response: ConnectorProxyResponse };
  "os-command": { request: OsCommandRequest; response: OsCommandResponse };
  "os-status": { request: OsStatusRequest; response: OsStatusResponse };
  "msa-operations": { request: MsaOperationsRequest; response: MsaOperationsResponse };
  "provider-family-operations": { request: ProviderFamilyRequest; response: ProviderFamilyResponse };
  "ambient-os-operations": { request: AmbientOsRequest; response: AmbientOsResponse };
  "device-telemetry": { request: DeviceTelemetryRequest; response: DeviceTelemetryResponse };
  "revenue-caller": { request: RevenueCallerRequest; response: RevenueCallerResponse };
  "gdpr-export": { request: GdprExportRequest; response: GdprExportResponse };
  "gdpr-delete": { request: GdprDeleteRequest; response: GdprDeleteResponse };
  "file-ingestion": { request: FileIngestionRequest; response: FileIngestionResponse };
  "seed-user-data": { request: SeedUserDataRequest; response: SeedUserDataResponse };
  "event-processor": { request: EventProcessorRequest; response: EventProcessorResponse };
  "cost-alert": { request: CostAlertRequest; response: CostAlertResponse };
  "ai-health": { request: AiHealthRequest; response: AiHealthResponse };
  "runtime-probes": { request: RuntimeProbesRequest; response: RuntimeProbesResponse };
  "scheduler-dispatch": { request: SchedulerDispatchRequest; response: SchedulerDispatchResponse };
  "self-healing": { request: SelfHealingRequest; response: SelfHealingResponse };
  "system-updates": { request: SystemUpdatesRequest; response: SystemUpdatesResponse };
  "main": { request: Record<string, unknown>; response: Record<string, unknown> };
}

export type EdgeFunctionName = keyof EdgeFunctionMap;
