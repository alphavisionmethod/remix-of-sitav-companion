// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector OAuth Provider Registry
// Truth source for which connector providers have real refresh
// implementations vs manual rotation.
//
// Phase M8 deliverable.
// ═══════════════════════════════════════════════════════════════

export type ProviderRotationStatus = "real" | "manual" | "deferred";

export interface ConnectorOAuthProvider {
  readonly key: string;
  readonly displayName: string;
  readonly status: ProviderRotationStatus;
  readonly refreshEndpoint?: string;
  readonly scopes: readonly string[];
  readonly notes: string;
}

export const CONNECTOR_OAUTH_PROVIDER_REGISTRY: readonly ConnectorOAuthProvider[] = [
  {
    key: "google",
    displayName: "Google (Drive / Gmail / Calendar)",
    status: "real",
    refreshEndpoint: "https://oauth2.googleapis.com/token",
    scopes: ["drive", "gmail", "calendar"],
    notes: "Real refresh implemented in connector-token-refresh edge function (Phase M8). Uses GOOGLE_CONNECTOR_CLIENT_ID + GOOGLE_CONNECTOR_CLIENT_SECRET secrets.",
  },
  {
    key: "microsoft",
    displayName: "Microsoft 365 (Graph)",
    status: "real",
    refreshEndpoint: "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token",
    scopes: ["offline_access", "graph"],
    notes: "Real refresh implemented in connector-token-refresh edge function (Phase R). Uses MICROSOFT_CONNECTOR_CLIENT_ID, MICROSOFT_CONNECTOR_CLIENT_SECRET, MICROSOFT_CONNECTOR_TENANT_ID secrets.",
  },
  {
    key: "slack",
    displayName: "Slack",
    status: "real",
    refreshEndpoint: "https://slack.com/api/oauth.v2.access",
    scopes: ["chat:write", "channels:read"],
    notes: "Real refresh implemented in connector-token-refresh edge function (Phase S). Uses SLACK_CONNECTOR_CLIENT_ID + SLACK_CONNECTOR_CLIENT_SECRET secrets.",
  },
  {
    key: "salesforce",
    displayName: "Salesforce",
    status: "manual",
    scopes: ["api", "refresh_token"],
    notes: "No active connector wiring; manual rotation by ops team.",
  },
  {
    key: "hubspot",
    displayName: "HubSpot",
    status: "manual",
    scopes: ["contacts", "deals"],
    notes: "No active connector wiring; manual rotation by ops team.",
  },
];

export function getProviderStatus(key: string): ProviderRotationStatus {
  return CONNECTOR_OAUTH_PROVIDER_REGISTRY.find(p => p.key === key)?.status ?? "manual";
}

export function listRealRefreshProviders(): readonly string[] {
  return CONNECTOR_OAUTH_PROVIDER_REGISTRY.filter(p => p.status === "real").map(p => p.key);
}
