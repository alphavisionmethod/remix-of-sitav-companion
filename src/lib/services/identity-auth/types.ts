// ═══════════════════════════════════════════════════════════════
// SITA OS — Identity Auth vs Connector Auth — Shared Domain Types
// Strict separation: sign-in identity ≠ external service access
// ═══════════════════════════════════════════════════════════════

import type { Database } from "@/integrations/supabase/types";

// ── Row types from Supabase ────────────────────────────────────
export type IdentityProviderRegistry = any;
export type IdentityProviderLink = any;
export type ConnectedServiceLink = any;
export type ConsentLedgerEntry = any;
export type UnifiedAccountNode = any;
export type UnifiedAccountEdge = any;
export type PermissionUpgradeRequest = any;
export type IdentitySessionAudit = any;
export type ConnectorDisconnectionEvent = any;
export type AuthConnectorSeparationAudit = any;

// ── Insert types ───────────────────────────────────────────────
export type IdentityProviderRegistryInsert = any;
export type IdentityProviderLinkInsert = any;
export type ConnectedServiceLinkInsert = any;
export type ConsentLedgerInsert = any;
export type PermissionUpgradeRequestInsert = any;
export type IdentitySessionAuditInsert = any;
export type ConnectorDisconnectionEventInsert = any;

// ── Domain enums / constants ───────────────────────────────────
export const AUTH_DOMAINS = {
  IDENTITY: "identity",
  CONNECTOR: "connector",
} as const;

export type AuthDomain = typeof AUTH_DOMAINS[keyof typeof AUTH_DOMAINS];

export const IDENTITY_AUTH_METHODS = ["email_password", "oauth2", "magic_link", "passkey", "saml"] as const;
export type IdentityAuthMethod = typeof IDENTITY_AUTH_METHODS[number];

export const CONNECTOR_AUTH_METHODS = ["oauth2", "api_key", "basic", "service_account", "none"] as const;
export type ConnectorAuthMethod = typeof CONNECTOR_AUTH_METHODS[number];

export const CONNECTION_STATUSES = ["active", "paused", "expired", "revoked", "pending", "error"] as const;
export type ConnectionStatus = typeof CONNECTION_STATUSES[number];

export const CONSENT_ACTIONS = ["granted", "revoked", "upgraded", "downgraded", "expired", "renewed"] as const;
export type ConsentAction = typeof CONSENT_ACTIONS[number];

export const PERMISSION_LEVELS = ["read", "read_write", "admin", "custom"] as const;
export type PermissionLevel = typeof PERMISSION_LEVELS[number];

// ── View types ─────────────────────────────────────────────────
export interface ConnectedAccountView {
  id: string;
  provider_name: string;
  capability_name: string;
  connection_status: string;
  permission_level: string;
  health_status: string;
  mode: string;
  last_sync_at: string | null;
}

export interface IdentityMethodView {
  id: string;
  provider_name: string;
  provider_key: string;
  email: string | null;
  auth_method: string;
  primary_identity: boolean;
  active: boolean;
  last_verified_at: string | null;
}

export interface ConsentHistoryView {
  id: string;
  provider_name: string;
  consent_type: string;
  action: string;
  granted_scopes: string[];
  revoked_scopes: string[];
  created_at: string;
}

export interface AccountGraphSummaryView {
  id: string;
  node_type: string;
  label: string;
  provider_family_id: string | null;
  edge_count: number;
}

// ── Separation contract ────────────────────────────────────────
export interface AuthSeparationContract {
  /** Identity auth: "who are you?" — login/sign-in only */
  identityDomain: {
    providers: IdentityProviderLink[];
    sessions: IdentitySessionAudit[];
    primaryMethod: IdentityMethodView | null;
  };
  /** Connector auth: "what can SITA access on your behalf?" — external services only */
  connectorDomain: {
    services: ConnectedServiceLink[];
    consents: ConsentLedgerEntry[];
    disconnections: ConnectorDisconnectionEvent[];
  };
  /** Unified account graph: merges both domains into a single view */
  graph: {
    nodes: UnifiedAccountNode[];
    edges: UnifiedAccountEdge[];
  };
}

