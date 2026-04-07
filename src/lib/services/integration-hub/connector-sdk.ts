// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Hub: Connector SDK Interface
// ═══════════════════════════════════════════════════════════════

export type AuthType = "oauth2" | "api_key" | "none";
export type RiskLevel = "low" | "medium" | "high";
export type ActionStatus = "proposed" | "approved" | "rejected" | "executing" | "succeeded" | "failed";
export type ConnectionStatus = "pending" | "connected" | "disconnected" | "error" | "expired";
export type SyncType = "pull" | "push";

export interface ProviderCapability {
  id: string;
  name: string;
  type: "read" | "write";
  riskLevel: RiskLevel;
  description: string;
  requiresApproval: boolean;
  supportsDryRun: boolean;
}

export interface ProviderDefinition {
  id: string;
  displayName: string;
  description: string;
  category: "crm" | "ads" | "accounting" | "calendar" | "email" | "payments" | "social" | "analytics" | "ecommerce" | "other";
  authType: AuthType;
  icon: string;
  color: string;
  scopes: { read: string[]; write: string[] };
  objects: string[];
  capabilities: ProviderCapability[];
  supportsWebhooks: boolean;
  docsUrl: string;
  setupSteps: string[];
}

export interface ConnectorInterface {
  provider: ProviderDefinition;
  getAuthUrl(tenantId: string, userId: string, redirectUri: string): string;
  handleCallback(params: Record<string, string>): Promise<{ tokens: any; externalAccounts: ExternalAccount[] }>;
  refreshTokens(connectionId: string): Promise<boolean>;
  healthCheck(connectionId: string): Promise<HealthCheckResult>;
  listAccounts(connectionId: string): Promise<ExternalAccount[]>;
  executeAction(connectionId: string, actionType: string, payload: any): Promise<ActionResult>;
  dryRun(connectionId: string, actionType: string, payload: any): Promise<DryRunResult>;
  getRiskLevel(actionType: string, payload: any): RiskLevel;
}

export interface ExternalAccount {
  id: string;
  name: string;
  type: string;
  metadata?: Record<string, any>;
}

export interface HealthCheckResult {
  healthy: boolean;
  latencyMs: number;
  details: string;
  scopes: string[];
  quotaUsed?: number;
  quotaLimit?: number;
}

export interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
  affectedRecords?: number;
}

export interface DryRunResult {
  valid: boolean;
  preview: DryRunPreviewItem[];
  warnings: string[];
  estimatedImpact: string;
  estimatedCost?: { amount: number; currency: string };
}

export interface DryRunPreviewItem {
  field: string;
  currentValue: string;
  newValue: string;
  action: "create" | "update" | "delete" | "unchanged";
}

// ── Demo mode helpers ─────────────────────────────────────────
export function createDemoHealthCheck(latency?: number): HealthCheckResult {
  return {
    healthy: true,
    latencyMs: latency ?? Math.floor(Math.random() * 200) + 50,
    details: "Demo mode — simulated health check",
    scopes: ["read", "write"],
    quotaUsed: Math.floor(Math.random() * 800),
    quotaLimit: 1000,
  };
}

export function createDemoDryRun(items: DryRunPreviewItem[]): DryRunResult {
  return {
    valid: true,
    preview: items,
    warnings: [],
    estimatedImpact: `${items.length} record(s) affected`,
  };
}

