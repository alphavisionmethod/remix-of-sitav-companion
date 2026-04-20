// ═══════════════════════════════════════════════════════════════
// SITA OS — Provider Contract Registry
// Canonical registry of all providers and integration contracts
// Extends existing CONNECTOR_PROVIDER_REGISTRY — does not replace
// ═══════════════════════════════════════════════════════════════

export type ProviderId =
  | "gmail" | "google-calendar" | "google-drive"
  | "plaid" | "stripe" | "quickbooks"
  | "twilio" | "sendgrid"
  | "instacart" | "hubspot" | "slack" | "dropbox"
  | "ai-gateway" | "storage" | "auth";

export type ProviderType = "oauth" | "api-key" | "system" | "webhook";
export type CredentialModel = "oauth2-authorization-code" | "oauth2-client-credentials" | "api-key" | "jwt-service-account" | "system-managed";
export type RefreshPolicy = "auto-refresh" | "manual-refresh" | "no-refresh" | "system-managed";
export type RetryStrategy = "exponential-backoff" | "linear-backoff" | "immediate-retry" | "no-retry";
export type OutagePolicy = "graceful-degrade" | "queue-and-retry" | "fail-fast" | "circuit-breaker";
export type DegradedUxBehavior = "show-cached-data" | "show-error-banner" | "disable-feature" | "silent-fallback";

export interface ProviderContract {
  providerId: ProviderId;
  providerType: ProviderType;
  owner: string;
  credentialModel: CredentialModel;
  environments: ("sandbox" | "production")[];
  refreshPolicy: RefreshPolicy;
  retryPolicy: { strategy: RetryStrategy; maxRetries: number; baseDelayMs: number };
  rateLimitPolicy: { requestsPerMinute: number; burstLimit: number; backoffStrategy: RetryStrategy };
  outagePolicy: OutagePolicy;
  degradedUxBehavior: DegradedUxBehavior;
  killSwitchBinding: string | null;
  runbookRef: string | null;
  webhookBehavior: { supported: boolean; replaySupported: boolean; idempotencyKeyField: string | null } | null;
  retentionPolicy: { tokenTtlDays: number; syncDataRetentionDays: number; auditLogRetentionDays: number };
  diagnosticsSupport: boolean;
}

export const PROVIDER_CONTRACT_REGISTRY: Record<ProviderId, ProviderContract> = {
  gmail: {
    providerId: "gmail", providerType: "oauth", owner: "connector-service", credentialModel: "oauth2-authorization-code",
    environments: ["sandbox", "production"], refreshPolicy: "auto-refresh",
    retryPolicy: { strategy: "exponential-backoff", maxRetries: 3, baseDelayMs: 1000 },
    rateLimitPolicy: { requestsPerMinute: 250, burstLimit: 50, backoffStrategy: "exponential-backoff" },
    outagePolicy: "graceful-degrade", degradedUxBehavior: "show-cached-data",
    killSwitchBinding: "KS-CONNECTORS", runbookRef: "RB-012",
    webhookBehavior: { supported: true, replaySupported: true, idempotencyKeyField: "historyId" },
    retentionPolicy: { tokenTtlDays: 90, syncDataRetentionDays: 365, auditLogRetentionDays: 730 },
    diagnosticsSupport: true,
  },
  "google-calendar": {
    providerId: "google-calendar", providerType: "oauth", owner: "connector-service", credentialModel: "oauth2-authorization-code",
    environments: ["sandbox", "production"], refreshPolicy: "auto-refresh",
    retryPolicy: { strategy: "exponential-backoff", maxRetries: 3, baseDelayMs: 1000 },
    rateLimitPolicy: { requestsPerMinute: 100, burstLimit: 20, backoffStrategy: "exponential-backoff" },
    outagePolicy: "graceful-degrade", degradedUxBehavior: "show-cached-data",
    killSwitchBinding: "KS-CONNECTORS", runbookRef: "RB-012",
    webhookBehavior: { supported: true, replaySupported: false, idempotencyKeyField: null },
    retentionPolicy: { tokenTtlDays: 90, syncDataRetentionDays: 365, auditLogRetentionDays: 730 },
    diagnosticsSupport: true,
  },
  "google-drive": {
    providerId: "google-drive", providerType: "oauth", owner: "connector-service", credentialModel: "oauth2-authorization-code",
    environments: ["sandbox", "production"], refreshPolicy: "auto-refresh",
    retryPolicy: { strategy: "exponential-backoff", maxRetries: 3, baseDelayMs: 1000 },
    rateLimitPolicy: { requestsPerMinute: 1000, burstLimit: 100, backoffStrategy: "exponential-backoff" },
    outagePolicy: "graceful-degrade", degradedUxBehavior: "show-cached-data",
    killSwitchBinding: "KS-CONNECTORS", runbookRef: "RB-012",
    webhookBehavior: { supported: true, replaySupported: true, idempotencyKeyField: "changeId" },
    retentionPolicy: { tokenTtlDays: 90, syncDataRetentionDays: 365, auditLogRetentionDays: 730 },
    diagnosticsSupport: true,
  },
  plaid: {
    providerId: "plaid", providerType: "api-key", owner: "finance-connector-service", credentialModel: "api-key",
    environments: ["sandbox", "production"], refreshPolicy: "manual-refresh",
    retryPolicy: { strategy: "exponential-backoff", maxRetries: 5, baseDelayMs: 2000 },
    rateLimitPolicy: { requestsPerMinute: 30, burstLimit: 5, backoffStrategy: "linear-backoff" },
    outagePolicy: "queue-and-retry", degradedUxBehavior: "show-error-banner",
    killSwitchBinding: "KS-CONNECTORS", runbookRef: "RB-012",
    webhookBehavior: { supported: true, replaySupported: true, idempotencyKeyField: "webhook_id" },
    retentionPolicy: { tokenTtlDays: 30, syncDataRetentionDays: 365, auditLogRetentionDays: 730 },
    diagnosticsSupport: true,
  },
  stripe: {
    providerId: "stripe", providerType: "api-key", owner: "payment-service", credentialModel: "api-key",
    environments: ["sandbox", "production"], refreshPolicy: "no-refresh",
    retryPolicy: { strategy: "exponential-backoff", maxRetries: 3, baseDelayMs: 500 },
    rateLimitPolicy: { requestsPerMinute: 100, burstLimit: 25, backoffStrategy: "exponential-backoff" },
    outagePolicy: "circuit-breaker", degradedUxBehavior: "disable-feature",
    killSwitchBinding: "KS-PAYMENTS", runbookRef: "RB-005",
    webhookBehavior: { supported: true, replaySupported: true, idempotencyKeyField: "idempotency_key" },
    retentionPolicy: { tokenTtlDays: -1, syncDataRetentionDays: 730, auditLogRetentionDays: 2555 },
    diagnosticsSupport: true,
  },
  quickbooks: {
    providerId: "quickbooks", providerType: "oauth", owner: "finance-connector-service", credentialModel: "oauth2-authorization-code",
    environments: ["sandbox", "production"], refreshPolicy: "auto-refresh",
    retryPolicy: { strategy: "exponential-backoff", maxRetries: 3, baseDelayMs: 1000 },
    rateLimitPolicy: { requestsPerMinute: 500, burstLimit: 50, backoffStrategy: "exponential-backoff" },
    outagePolicy: "graceful-degrade", degradedUxBehavior: "show-cached-data",
    killSwitchBinding: "KS-CONNECTORS", runbookRef: "RB-012",
    webhookBehavior: { supported: true, replaySupported: false, idempotencyKeyField: null },
    retentionPolicy: { tokenTtlDays: 90, syncDataRetentionDays: 730, auditLogRetentionDays: 2555 },
    diagnosticsSupport: true,
  },
  twilio: {
    providerId: "twilio", providerType: "api-key", owner: "notification-service", credentialModel: "api-key",
    environments: ["sandbox", "production"], refreshPolicy: "no-refresh",
    retryPolicy: { strategy: "linear-backoff", maxRetries: 2, baseDelayMs: 500 },
    rateLimitPolicy: { requestsPerMinute: 100, burstLimit: 20, backoffStrategy: "linear-backoff" },
    outagePolicy: "fail-fast", degradedUxBehavior: "show-error-banner",
    killSwitchBinding: "KS-NOTIFICATIONS", runbookRef: "RB-012",
    webhookBehavior: { supported: true, replaySupported: false, idempotencyKeyField: null },
    retentionPolicy: { tokenTtlDays: -1, syncDataRetentionDays: 90, auditLogRetentionDays: 365 },
    diagnosticsSupport: true,
  },
  sendgrid: {
    providerId: "sendgrid", providerType: "api-key", owner: "notification-service", credentialModel: "api-key",
    environments: ["sandbox", "production"], refreshPolicy: "no-refresh",
    retryPolicy: { strategy: "exponential-backoff", maxRetries: 3, baseDelayMs: 1000 },
    rateLimitPolicy: { requestsPerMinute: 600, burstLimit: 100, backoffStrategy: "exponential-backoff" },
    outagePolicy: "queue-and-retry", degradedUxBehavior: "silent-fallback",
    killSwitchBinding: "KS-NOTIFICATIONS", runbookRef: "RB-012",
    webhookBehavior: { supported: true, replaySupported: true, idempotencyKeyField: "sg_message_id" },
    retentionPolicy: { tokenTtlDays: -1, syncDataRetentionDays: 90, auditLogRetentionDays: 365 },
    diagnosticsSupport: true,
  },
  instacart: {
    providerId: "instacart", providerType: "api-key", owner: "concierge-service", credentialModel: "api-key",
    environments: ["sandbox", "production"], refreshPolicy: "no-refresh",
    retryPolicy: { strategy: "exponential-backoff", maxRetries: 3, baseDelayMs: 1000 },
    rateLimitPolicy: { requestsPerMinute: 60, burstLimit: 10, backoffStrategy: "exponential-backoff" },
    outagePolicy: "graceful-degrade", degradedUxBehavior: "disable-feature",
    killSwitchBinding: "KS-CONNECTORS", runbookRef: "RB-012",
    webhookBehavior: null,
    retentionPolicy: { tokenTtlDays: -1, syncDataRetentionDays: 90, auditLogRetentionDays: 365 },
    diagnosticsSupport: true,
  },
  hubspot: {
    providerId: "hubspot", providerType: "oauth", owner: "crm-connector-service", credentialModel: "oauth2-authorization-code",
    environments: ["sandbox", "production"], refreshPolicy: "auto-refresh",
    retryPolicy: { strategy: "exponential-backoff", maxRetries: 3, baseDelayMs: 1000 },
    rateLimitPolicy: { requestsPerMinute: 100, burstLimit: 10, backoffStrategy: "exponential-backoff" },
    outagePolicy: "graceful-degrade", degradedUxBehavior: "show-cached-data",
    killSwitchBinding: "KS-CONNECTORS", runbookRef: "RB-012",
    webhookBehavior: { supported: true, replaySupported: true, idempotencyKeyField: "eventId" },
    retentionPolicy: { tokenTtlDays: 90, syncDataRetentionDays: 365, auditLogRetentionDays: 730 },
    diagnosticsSupport: true,
  },
  slack: {
    providerId: "slack", providerType: "oauth", owner: "notification-service", credentialModel: "oauth2-authorization-code",
    environments: ["sandbox", "production"], refreshPolicy: "auto-refresh",
    retryPolicy: { strategy: "linear-backoff", maxRetries: 3, baseDelayMs: 500 },
    rateLimitPolicy: { requestsPerMinute: 60, burstLimit: 10, backoffStrategy: "linear-backoff" },
    outagePolicy: "graceful-degrade", degradedUxBehavior: "show-error-banner",
    killSwitchBinding: "KS-CONNECTORS", runbookRef: "RB-012",
    webhookBehavior: { supported: true, replaySupported: true, idempotencyKeyField: "event_id" },
    retentionPolicy: { tokenTtlDays: 90, syncDataRetentionDays: 365, auditLogRetentionDays: 730 },
    diagnosticsSupport: true,
  },
  dropbox: {
    providerId: "dropbox", providerType: "oauth", owner: "connector-service", credentialModel: "oauth2-authorization-code",
    environments: ["sandbox", "production"], refreshPolicy: "auto-refresh",
    retryPolicy: { strategy: "exponential-backoff", maxRetries: 3, baseDelayMs: 1000 },
    rateLimitPolicy: { requestsPerMinute: 200, burstLimit: 30, backoffStrategy: "exponential-backoff" },
    outagePolicy: "graceful-degrade", degradedUxBehavior: "show-cached-data",
    killSwitchBinding: "KS-CONNECTORS", runbookRef: "RB-012",
    webhookBehavior: { supported: true, replaySupported: false, idempotencyKeyField: null },
    retentionPolicy: { tokenTtlDays: 90, syncDataRetentionDays: 365, auditLogRetentionDays: 730 },
    diagnosticsSupport: true,
  },
  "ai-gateway": {
    providerId: "ai-gateway", providerType: "system", owner: "ai-gateway-service", credentialModel: "system-managed",
    environments: ["production"], refreshPolicy: "system-managed",
    retryPolicy: { strategy: "exponential-backoff", maxRetries: 3, baseDelayMs: 500 },
    rateLimitPolicy: { requestsPerMinute: 1000, burstLimit: 100, backoffStrategy: "exponential-backoff" },
    outagePolicy: "circuit-breaker", degradedUxBehavior: "silent-fallback",
    killSwitchBinding: "KS-MODEL-PROVIDERS", runbookRef: "RB-018",
    webhookBehavior: null,
    retentionPolicy: { tokenTtlDays: -1, syncDataRetentionDays: 90, auditLogRetentionDays: 365 },
    diagnosticsSupport: true,
  },
  storage: {
    providerId: "storage", providerType: "system", owner: "storage-service", credentialModel: "system-managed",
    environments: ["production"], refreshPolicy: "system-managed",
    retryPolicy: { strategy: "exponential-backoff", maxRetries: 3, baseDelayMs: 500 },
    rateLimitPolicy: { requestsPerMinute: 500, burstLimit: 100, backoffStrategy: "exponential-backoff" },
    outagePolicy: "queue-and-retry", degradedUxBehavior: "show-error-banner",
    killSwitchBinding: "KS-FILE-PROCESSING", runbookRef: "RB-013",
    webhookBehavior: null,
    retentionPolicy: { tokenTtlDays: -1, syncDataRetentionDays: -1, auditLogRetentionDays: 365 },
    diagnosticsSupport: true,
  },
  auth: {
    providerId: "auth", providerType: "system", owner: "auth-service", credentialModel: "system-managed",
    environments: ["production"], refreshPolicy: "system-managed",
    retryPolicy: { strategy: "immediate-retry", maxRetries: 1, baseDelayMs: 0 },
    rateLimitPolicy: { requestsPerMinute: 300, burstLimit: 50, backoffStrategy: "linear-backoff" },
    outagePolicy: "fail-fast", degradedUxBehavior: "disable-feature",
    killSwitchBinding: "KS-AUTH", runbookRef: "RB-001",
    webhookBehavior: null,
    retentionPolicy: { tokenTtlDays: -1, syncDataRetentionDays: -1, auditLogRetentionDays: 730 },
    diagnosticsSupport: true,
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDER_CONTRACT_REGISTRY) as ProviderId[];

export function getProviderContract(providerId: ProviderId): ProviderContract {
  return PROVIDER_CONTRACT_REGISTRY[providerId];
}