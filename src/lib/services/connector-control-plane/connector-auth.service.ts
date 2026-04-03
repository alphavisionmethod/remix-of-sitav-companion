// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Auth Service
// OAuth token state, refresh status
// ═══════════════════════════════════════════════════════════════

export interface ConnectorAuthState {
  connectorId: string;
  authenticated: boolean;
  authMethod: "oauth2" | "api-key" | "basic" | "none";
  tokenExpiresAt?: string;
  scopes: string[];
  lastRefreshAt?: string;
  refreshable: boolean;
  status: "valid" | "expiring-soon" | "expired" | "revoked" | "not-configured";
}

const authStates = new Map<string, ConnectorAuthState>();

const DEFAULTS: ConnectorAuthState[] = [
  { connectorId: "gmail", authenticated: true, authMethod: "oauth2", tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(), scopes: ["gmail.readonly", "gmail.send"], lastRefreshAt: new Date().toISOString(), refreshable: true, status: "valid" },
  { connectorId: "calendar", authenticated: true, authMethod: "oauth2", tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(), scopes: ["calendar.readonly", "calendar.events"], lastRefreshAt: new Date().toISOString(), refreshable: true, status: "valid" },
  { connectorId: "crm", authenticated: true, authMethod: "api-key", scopes: ["contacts.read", "deals.read", "deals.write"], refreshable: false, status: "valid" },
  { connectorId: "banking", authenticated: true, authMethod: "oauth2", tokenExpiresAt: new Date(Date.now() + 7200000).toISOString(), scopes: ["accounts", "transactions", "balance"], lastRefreshAt: new Date().toISOString(), refreshable: true, status: "valid" },
  { connectorId: "accounting", authenticated: false, authMethod: "oauth2", scopes: [], refreshable: true, status: "not-configured" },
  { connectorId: "travel", authenticated: false, authMethod: "api-key", scopes: [], refreshable: false, status: "not-configured" },
];

DEFAULTS.forEach((s) => authStates.set(s.connectorId, s));

export function getAuthState(connectorId: string): ConnectorAuthState | undefined {
  const state = authStates.get(connectorId);
  if (!state) return undefined;
  // Check expiry
  if (state.tokenExpiresAt) {
    const remaining = new Date(state.tokenExpiresAt).getTime() - Date.now();
    if (remaining < 0) state.status = "expired";
    else if (remaining < 300000) state.status = "expiring-soon";
  }
  return state;
}

export function getAllAuthStates(): ConnectorAuthState[] {
  return Array.from(authStates.keys()).map((id) => getAuthState(id)!).filter(Boolean);
}

export function refreshToken(connectorId: string): ConnectorAuthState | null {
  const state = authStates.get(connectorId);
  if (!state || !state.refreshable) return null;
  state.tokenExpiresAt = new Date(Date.now() + 3600000).toISOString();
  state.lastRefreshAt = new Date().toISOString();
  state.status = "valid";
  state.authenticated = true;
  return state;
}

export function revokeAuth(connectorId: string): boolean {
  const state = authStates.get(connectorId);
  if (!state) return false;
  state.authenticated = false;
  state.status = "revoked";
  return true;
}
