// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Contract Map
// Input/output contract references per function
// ═══════════════════════════════════════════════════════════════

export interface FunctionContract {
  readonly inputSchema: string | null;
  readonly outputSchema: string | null;
  readonly errorSchema: string;
}

export const EDGE_FUNCTION_CONTRACT_MAP: Record<string, FunctionContract> = {
  "admin-ai-workforce-run": { inputSchema: "AdminWorkforceRunInput", outputSchema: "AdminWorkforceRunOutput", errorSchema: "StandardError" },
  "admin-api": { inputSchema: "AdminApiRequest", outputSchema: "AdminApiResponse", errorSchema: "StandardError" },
  "admin-bff-gateway": { inputSchema: "BffGatewayRequest", outputSchema: "BffGatewayResponse", errorSchema: "StandardError" },
  "admin-gateway": { inputSchema: "GatewayRequest", outputSchema: "GatewayResponse", errorSchema: "StandardError" },
  "admin-intelligence": { inputSchema: "IntelligenceRequest", outputSchema: "IntelligenceResponse", errorSchema: "StandardError" },
  "admin-users": { inputSchema: "AdminUsersRequest", outputSchema: "AdminUsersResponse", errorSchema: "StandardError" },
  "advisor-agent-loop": { inputSchema: "AgentLoopInput", outputSchema: "AgentLoopOutput", errorSchema: "StandardError" },
  "advisor-avatar-generate": { inputSchema: "AvatarGenerateInput", outputSchema: "AvatarGenerateOutput", errorSchema: "StandardError" },
  "advisor-conversation": { inputSchema: "ConversationInput", outputSchema: "ConversationOutput", errorSchema: "StandardError" },
  "advisor-deep-intelligence": { inputSchema: "DeepIntelligenceInput", outputSchema: "DeepIntelligenceOutput", errorSchema: "StandardError" },
  "advisor-knowledge-manage": { inputSchema: "KnowledgeManageInput", outputSchema: "KnowledgeManageOutput", errorSchema: "StandardError" },
  "advisor-weekly-report": { inputSchema: "WeeklyReportInput", outputSchema: "WeeklyReportOutput", errorSchema: "StandardError" },
  "agent-executor": { inputSchema: "AgentExecutorInput", outputSchema: "AgentExecutorOutput", errorSchema: "StandardError" },
  "agent-heartbeat": { inputSchema: null, outputSchema: "HeartbeatResponse", errorSchema: "StandardError" },
  "agent-intelligence": { inputSchema: "AgentIntelligenceInput", outputSchema: "AgentIntelligenceOutput", errorSchema: "StandardError" },
  "agent-scheduler": { inputSchema: "SchedulerInput", outputSchema: "SchedulerOutput", errorSchema: "StandardError" },
  "agent-signal": { inputSchema: "SignalInput", outputSchema: "SignalAck", errorSchema: "StandardError" },
  "ai-gateway": { inputSchema: "AiGatewayRequest", outputSchema: "AiGatewayResponse", errorSchema: "StandardError" },
  "ai-health": { inputSchema: null, outputSchema: "HealthCheckResponse", errorSchema: "StandardError" },
  "check-ai-budget": { inputSchema: "BudgetCheckInput", outputSchema: "BudgetCheckOutput", errorSchema: "StandardError" },
  "ambient-os-operations": { inputSchema: "AmbientOpsInput", outputSchema: "AmbientOpsOutput", errorSchema: "StandardError" },
  "api-gateway": { inputSchema: "ApiGatewayRequest", outputSchema: "ApiGatewayResponse", errorSchema: "StandardError" },
  "app-store-api": { inputSchema: "AppStoreInput", outputSchema: "AppStoreOutput", errorSchema: "StandardError" },
  "booking-manage": { inputSchema: "BookingManageInput", outputSchema: "BookingManageOutput", errorSchema: "StandardError" },
  "brain-core": { inputSchema: "BrainCoreInput", outputSchema: "BrainCoreOutput", errorSchema: "StandardError" },
  "business-advisor-intelligence": { inputSchema: "BusinessIntelligenceInput", outputSchema: "BusinessIntelligenceOutput", errorSchema: "StandardError" },
  "business-board-api": { inputSchema: "BoardApiRequest", outputSchema: "BoardApiResponse", errorSchema: "StandardError" },
  "cashflow-calculate": { inputSchema: "CashflowInput", outputSchema: "CashflowOutput", errorSchema: "StandardError" },
  "chat-advisor": { inputSchema: "ChatInput", outputSchema: "ChatOutput", errorSchema: "StandardError" },
  "cloud-admin-api": { inputSchema: "CloudAdminRequest", outputSchema: "CloudAdminResponse", errorSchema: "StandardError" },
  "cloud-device-api": { inputSchema: "CloudDeviceRequest", outputSchema: "CloudDeviceResponse", errorSchema: "StandardError" },
  "cloud-lifecycle-api": { inputSchema: "LifecycleRequest", outputSchema: "LifecycleResponse", errorSchema: "StandardError" },
  "cloud-storage-api": { inputSchema: "StorageRequest", outputSchema: "StorageResponse", errorSchema: "StandardError" },
  "cloud-sync-api": { inputSchema: "SyncRequest", outputSchema: "SyncResponse", errorSchema: "StandardError" },
  "cloud-tenant-api": { inputSchema: "TenantRequest", outputSchema: "TenantResponse", errorSchema: "StandardError" },
  "cloud-worker-api": { inputSchema: "WorkerRequest", outputSchema: "WorkerResponse", errorSchema: "StandardError" },
  "communications-api": { inputSchema: "CommunicationsInput", outputSchema: "CommunicationsOutput", errorSchema: "StandardError" },
  "connector-batch": { inputSchema: "ConnectorBatchInput", outputSchema: "ConnectorBatchOutput", errorSchema: "StandardError" },
  "connector-discover": { inputSchema: "DiscoverInput", outputSchema: "DiscoverOutput", errorSchema: "StandardError" },
  "connector-health": { inputSchema: "HealthInput", outputSchema: "HealthOutput", errorSchema: "StandardError" },
  "connector-oauth": { inputSchema: "OAuthInput", outputSchema: "OAuthOutput", errorSchema: "StandardError" },
  "connector-operations": { inputSchema: "ConnectorOpsInput", outputSchema: "ConnectorOpsOutput", errorSchema: "StandardError" },
  "connector-proxy": { inputSchema: "ProxyRequest", outputSchema: "ProxyResponse", errorSchema: "StandardError" },
  "connector-sync": { inputSchema: "ConnectorSyncInput", outputSchema: "ConnectorSyncOutput", errorSchema: "StandardError" },
  "connector-transform": { inputSchema: "TransformInput", outputSchema: "TransformOutput", errorSchema: "StandardError" },
  "cost-alert": { inputSchema: "CostAlertInput", outputSchema: "CostAlertOutput", errorSchema: "StandardError" },
  "crm-sync": { inputSchema: "CrmSyncInput", outputSchema: "CrmSyncOutput", errorSchema: "StandardError" },
  "db-truth-introspect": { inputSchema: "DbTruthIntrospectInput", outputSchema: "DbTruthIntrospectOutput", errorSchema: "StandardError" },
  "device-telemetry": { inputSchema: "TelemetryInput", outputSchema: "TelemetryAck", errorSchema: "StandardError" },
  "digital-twin-engine": { inputSchema: "DigitalTwinInput", outputSchema: "DigitalTwinOutput", errorSchema: "StandardError" },
  "ecosystem-operations": { inputSchema: "EcosystemOpsInput", outputSchema: "EcosystemOpsOutput", errorSchema: "StandardError" },
  "event-processor": { inputSchema: "EventInput", outputSchema: "EventOutput", errorSchema: "StandardError" },
  "file-ingestion": { inputSchema: "FileIngestionInput", outputSchema: "FileIngestionOutput", errorSchema: "StandardError" },
  "gdpr-delete": { inputSchema: "GdprDeleteInput", outputSchema: "GdprDeleteOutput", errorSchema: "StandardError" },
  "gdpr-export": { inputSchema: "GdprExportInput", outputSchema: "GdprExportOutput", errorSchema: "StandardError" },
  "get-weather": { inputSchema: "WeatherInput", outputSchema: "WeatherOutput", errorSchema: "StandardError" },
  "health-check": { inputSchema: null, outputSchema: "HealthCheckResponse", errorSchema: "StandardError" },
  "intelligence-api": { inputSchema: "IntelligenceApiInput", outputSchema: "IntelligenceApiOutput", errorSchema: "StandardError" },
  "investment-portfolio-api": { inputSchema: "InvestmentPortfolioInput", outputSchema: "InvestmentPortfolioOutput", errorSchema: "StandardError" },
  "invoice-generate": { inputSchema: "InvoiceGenerateInput", outputSchema: "InvoiceGenerateOutput", errorSchema: "StandardError" },
  "license-gateway": { inputSchema: "LicenseGatewayRequest", outputSchema: "LicenseGatewayResponse", errorSchema: "StandardError" },
  "main": { inputSchema: null, outputSchema: "MainResponse", errorSchema: "StandardError" },
  "msa-operations": { inputSchema: "MsaOpsInput", outputSchema: "MsaOpsOutput", errorSchema: "StandardError" },
  "os-agent-channel": { inputSchema: "AgentChannelInput", outputSchema: "AgentChannelOutput", errorSchema: "StandardError" },
  "os-command": { inputSchema: "OsCommandInput", outputSchema: "OsCommandOutput", errorSchema: "StandardError" },
  "os-status": { inputSchema: null, outputSchema: "OsStatusResponse", errorSchema: "StandardError" },
  "payment-kill-switch": { inputSchema: "PaymentKillSwitchInput", outputSchema: "PaymentKillSwitchOutput", errorSchema: "StandardError" },
  "payment-process": { inputSchema: "PaymentProcessInput", outputSchema: "PaymentProcessOutput", errorSchema: "StandardError" },
  "personal-brain": { inputSchema: "PersonalBrainInput", outputSchema: "PersonalBrainOutput", errorSchema: "StandardError" },
  "provider-family-operations": { inputSchema: "ProviderFamilyInput", outputSchema: "ProviderFamilyOutput", errorSchema: "StandardError" },
  "push-dispatch": { inputSchema: "PushDispatchInput", outputSchema: "PushDispatchOutput", errorSchema: "StandardError" },
  "push-track": { inputSchema: "PushTrackInput", outputSchema: "PushTrackAck", errorSchema: "StandardError" },
  "revenue-caller": { inputSchema: "RevenueCallerInput", outputSchema: "RevenueCallerOutput", errorSchema: "StandardError" },
  "runtime-probes": { inputSchema: null, outputSchema: "ProbeResponse", errorSchema: "StandardError" },
  "scheduler-dispatch": { inputSchema: "SchedulerDispatchInput", outputSchema: "SchedulerDispatchOutput", errorSchema: "StandardError" },
  "seed-user-data": { inputSchema: "SeedInput", outputSchema: "SeedOutput", errorSchema: "StandardError" },
  "self-healing": { inputSchema: "SelfHealingInput", outputSchema: "SelfHealingOutput", errorSchema: "StandardError" },
  "simulation-engine-api": { inputSchema: "SimulationEngineInput", outputSchema: "SimulationEngineOutput", errorSchema: "StandardError" },
  "support-gateway": { inputSchema: "SupportRequest", outputSchema: "SupportResponse", errorSchema: "StandardError" },
  "system-updates": { inputSchema: "SystemUpdatesInput", outputSchema: "SystemUpdatesOutput", errorSchema: "StandardError" },
  "tasks-workflow-api": { inputSchema: "TasksWorkflowInput", outputSchema: "TasksWorkflowOutput", errorSchema: "StandardError" },
  "tax-estimate": { inputSchema: "TaxEstimateInput", outputSchema: "TaxEstimateOutput", errorSchema: "StandardError" },
  "user-bff-gateway": { inputSchema: "UserBffRequest", outputSchema: "UserBffResponse", errorSchema: "StandardError" },
  "vapid-public-key": { inputSchema: null, outputSchema: "VapidKeyResponse", errorSchema: "StandardError" },
  "verification-recorder": { inputSchema: "VerificationInput", outputSchema: "VerificationOutput", errorSchema: "StandardError" },
} as const;

export function getContractForFunction(name: string): FunctionContract | undefined {
  return EDGE_FUNCTION_CONTRACT_MAP[name];
}

export function getFunctionsWithoutInputSchema(): string[] {
  return Object.entries(EDGE_FUNCTION_CONTRACT_MAP)
    .filter(([, c]) => c.inputSchema === null)
    .map(([name]) => name);
}
