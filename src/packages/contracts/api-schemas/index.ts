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
// NEW: 17 Missing Edge Function Contracts
// ═══════════════════════════════════════════════════════════════

// ── Admin AI Workforce Run ───────────────────────────────────

export interface AdminAiWorkforceRunRequest {
  role_key: string;
  task_key: string;
  scope_type?: string;
  scope_ref?: string;
  scope_payload?: Record<string, unknown>;
  budget_posture?: string;
  mode?: string;
}

export interface AdminAiWorkforceRunResponse {
  success: boolean;
  run_id?: string;
  summary?: string;
  findings?: unknown[];
  recommendations?: unknown[];
  error?: string;
}

// ── AI Gateway ───────────────────────────────────────────────

export interface AiGatewayRequest {
  capability_key: string;
  messages: ChatMessage[];
  task_class?: "premium_synthesis" | "balanced_assistant" | "cheap_utility";
  max_tokens?: number;
  temperature?: number;
  structured_output?: boolean;
  tools?: unknown[];
}

export interface AiGatewayResponse {
  content: string;
  model: string;
  provider: string;
  tokens_used: number;
  cost_usd: number;
  latency_ms: number;
  receipt_id?: string;
  fallback_used?: boolean;
}

// ── Booking Manage ───────────────────────────────────────────

export type BookingManageRequest =
  | { action: "create"; booking_type: string; title: string; provider?: string; scheduled_at: string; duration_minutes?: number; notes?: string; metadata?: Record<string, unknown> }
  | { action: "update"; booking_id: string; title?: string; provider?: string; scheduled_at?: string; duration_minutes?: number; notes?: string }
  | { action: "cancel"; booking_id: string; reason?: string }
  | { action: "confirm"; booking_id: string }
  | { action: "list"; status?: string; booking_type?: string; from_date?: string; to_date?: string; limit?: number };

export interface BookingManageResponse {
  booking?: Record<string, unknown>;
  bookings?: Record<string, unknown>[];
  success?: boolean;
  error?: string;
}

// ── Cashflow Calculate ───────────────────────────────────────

export type CashflowCalculateRequest =
  | { action: "analyze" }
  | { action: "forecast"; horizon_days?: number }
  | { action: "safe-to-spend"; reserve_target_cents?: number }
  | { action: "burn-rate" };

export interface CashflowCalculateResponse {
  total_liquid_cents?: number;
  total_receivable_cents?: number;
  overdue_cents?: number;
  inflows_30d_cents?: number;
  forecast?: unknown[];
  safe_to_spend_cents?: number;
  burn_rate_cents_per_day?: number;
  runway_days?: number;
  error?: string;
}

// ── Connector Batch ──────────────────────────────────────────

export type ConnectorBatchRequest =
  | { action: "submit"; operations: Array<{ connector_id: string; action: string; payload?: Record<string, unknown> }>; label?: string }
  | { action: "status"; batch_id: string }
  | { action: "cancel"; batch_id: string }
  | { action: "list"; limit?: number }
  | { action: "retry-failed"; batch_id: string };

export interface ConnectorBatchResponse {
  batch_id?: string;
  batch?: Record<string, unknown>;
  batches?: Record<string, unknown>[];
  success?: boolean;
  error?: string;
}

// ── Connector Discover ───────────────────────────────────────

export interface ConnectorDiscoverRequest {
  action: "scan" | "match" | "recommend" | "catalog";
  domain?: string;
  tags?: string[];
  limit?: number;
}

export interface ConnectorDiscoverResponse {
  connectors?: Array<{ id: string; name: string; domain: string; status: string }>;
  recommendations?: Array<{ connector_type: string; reason: string }>;
  error?: string;
}

// ── Connector OAuth ──────────────────────────────────────────

export type ConnectorOAuthRequest =
  | { action: "initiate"; connector_id: string; scopes?: string[]; redirect_uri?: string }
  | { action: "callback"; code: string; state: string }
  | { action: "disconnect"; account_id: string };

export interface ConnectorOAuthResponse {
  auth_url?: string;
  connected?: boolean;
  account_id?: string;
  success?: boolean;
  error?: string;
}

// ── Connector Transform ──────────────────────────────────────

export interface ConnectorTransformRequest {
  action: "normalize" | "map-fields" | "convert" | "validate-schema";
  source_connector?: string;
  target_table?: string;
  data?: Record<string, unknown> | Record<string, unknown>[];
}

export interface ConnectorTransformResponse {
  transformed?: unknown;
  valid?: boolean;
  errors?: string[];
  field_map?: Record<string, string>;
}

// ── CRM Sync ─────────────────────────────────────────────────

export type CrmSyncRequest =
  | { action: "sync-leads"; leads: Array<{ name: string; email?: string; phone?: string; source?: string; status?: string; metadata?: Record<string, unknown> }> }
  | { action: "sync-customers"; customers: Array<{ name: string; email: string; phone?: string; company?: string; metadata?: Record<string, unknown> }> }
  | { action: "sync-opportunities"; opportunities: Array<{ title: string; customer_id: string; value_cents?: number; stage?: string; probability?: number; expected_close?: string }> }
  | { action: "health-check" };

export interface CrmSyncResponse {
  synced?: number;
  errors?: Array<{ index: number; error: string }>;
  health?: { leads: number; customers: number; opportunities: number };
  error?: string;
}

// ── Ecosystem Operations ─────────────────────────────────────

export interface EcosystemOperationsRequest {
  action: "seed_ecosystem" | "register_device" | "update_trust" | "grant_health_consent" | "revoke_health_consent" | "configure_push_route" | "configure_wearable" | "update_launch_readiness" | "ecosystem_audit";
  ecosystem?: "apple" | "android";
  payload?: Record<string, unknown>;
}

export interface EcosystemOperationsResponse {
  success?: boolean;
  data?: unknown;
  error?: string;
}

// ── Invoice Generate ─────────────────────────────────────────

export type InvoiceGenerateRequest =
  | { action: "generate"; customer_id: string; line_items: Array<{ description: string; quantity: number; unit_price_cents: number }>; due_date: string; notes?: string; currency?: string }
  | { action: "send"; invoice_id: string; channel?: "email" | "sms" | "portal" }
  | { action: "mark-paid"; invoice_id: string; payment_method?: string; payment_ref?: string }
  | { action: "void"; invoice_id: string; reason: string }
  | { action: "list"; status?: string; customer_id?: string; limit?: number };

export interface InvoiceGenerateResponse {
  invoice?: Record<string, unknown>;
  invoices?: Record<string, unknown>[];
  success?: boolean;
  error?: string;
}

// ── Payment Process ──────────────────────────────────────────

export type PaymentProcessRequest =
  | { action: "initiate"; amount_cents: number; currency?: string; account_id: string; description: string; recipient?: string; category?: string }
  | { action: "verify"; approval_id: string }
  | { action: "list-pending"; limit?: number }
  | { action: "cancel"; approval_id: string; reason?: string };

export interface PaymentProcessResponse {
  approval?: Record<string, unknown>;
  balance_warning?: boolean;
  pending?: Record<string, unknown>[];
  status?: string;
  receipt?: Record<string, unknown>;
  hash?: string;
  error?: string;
}

// ── Push Dispatch ────────────────────────────────────────────

export interface PushDispatchRequest {
  notification_id: string;
  user_id: string;
  title: string;
  body?: string;
  urgency?: string;
  action_url?: string;
  category?: string;
}

export interface PushDispatchResponse {
  dispatched: number;
  results?: Array<{ device_id: string; status: string; error?: string }>;
}

// ── Push Track ───────────────────────────────────────────────

export interface PushTrackRequest {
  notification_id: string;
  action: "clicked" | "dismissed";
}

export interface PushTrackResponse {
  tracked: boolean;
}

// ── Tax Estimate ─────────────────────────────────────────────

export type TaxEstimateRequest =
  | { action: "estimate"; gross_income_cents: number; filing_status?: "single" | "married_joint" | "head_of_household"; deductions_cents?: number; state?: string }
  | { action: "quarterly"; annual_income_cents: number; filing_status?: string }
  | { action: "bracket-info"; filing_status?: string };

export interface TaxEstimateResponse {
  federal_tax_cents?: number;
  effective_rate?: number;
  marginal_rate?: number;
  brackets?: unknown[];
  quarterly_payment_cents?: number;
  error?: string;
}

// ── VAPID Public Key ─────────────────────────────────────────

export type VapidPublicKeyRequest = Record<string, never>;

export interface VapidPublicKeyResponse {
  vapid_public_key: string;
}

// ── Verification Recorder ────────────────────────────────────

export interface VerificationRecorderRequest {
  action_type: string;
  target_type: string;
  target_id: string;
  outcome: "pass" | "fail" | "skip";
  evidence?: Record<string, unknown>;
}

export interface VerificationRecorderResponse {
  recorded: boolean;
  verification_id?: string;
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
  // ── 17 newly typed functions ───────────────────────────────
  "admin-ai-workforce-run": { request: AdminAiWorkforceRunRequest; response: AdminAiWorkforceRunResponse };
  "ai-gateway": { request: AiGatewayRequest; response: AiGatewayResponse };
  "booking-manage": { request: BookingManageRequest; response: BookingManageResponse };
  "cashflow-calculate": { request: CashflowCalculateRequest; response: CashflowCalculateResponse };
  "connector-batch": { request: ConnectorBatchRequest; response: ConnectorBatchResponse };
  "connector-discover": { request: ConnectorDiscoverRequest; response: ConnectorDiscoverResponse };
  "connector-oauth": { request: ConnectorOAuthRequest; response: ConnectorOAuthResponse };
  "connector-transform": { request: ConnectorTransformRequest; response: ConnectorTransformResponse };
  "crm-sync": { request: CrmSyncRequest; response: CrmSyncResponse };
  "ecosystem-operations": { request: EcosystemOperationsRequest; response: EcosystemOperationsResponse };
  "invoice-generate": { request: InvoiceGenerateRequest; response: InvoiceGenerateResponse };
  "payment-process": { request: PaymentProcessRequest; response: PaymentProcessResponse };
  "push-dispatch": { request: PushDispatchRequest; response: PushDispatchResponse };
  "push-track": { request: PushTrackRequest; response: PushTrackResponse };
  "tax-estimate": { request: TaxEstimateRequest; response: TaxEstimateResponse };
  "vapid-public-key": { request: VapidPublicKeyRequest; response: VapidPublicKeyResponse };
  "verification-recorder": { request: VerificationRecorderRequest; response: VerificationRecorderResponse };
}

export type EdgeFunctionName = keyof EdgeFunctionMap;
