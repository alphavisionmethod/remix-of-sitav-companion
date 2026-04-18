/**
 * Identity Auth vs Connector Auth Separation — Canonical Types
 * 
 * SITA OS foundational rule: identity authentication (who the user IS)
 * must be strictly separated from connector authorization (what services the user ACCESSES).
 */

// ─── Provider Family ──────────────────────────────────────────────
export interface ProviderFamilyRecord {
  id: string;
  name: string;
  provider_key: string;          // 'google' | 'apple' | 'microsoft' | 'stripe' | 'slack' | etc.
  icon_url?: string | null;
  has_identity: boolean;
  has_connector: boolean;
  active: boolean;
  launch_stage: string;          // 'live' | 'beta' | 'internal' | 'planned'
  metadata?: Record<string, unknown> | null;
}

// ─── Identity Provider Registry ───────────────────────────────────
export type IdentityAuthType = 'oauth2' | 'saml' | 'magic_link' | 'password' | 'passkey' | 'device_trust';
export type PlatformApplicability = 'web' | 'mobile_ios' | 'mobile_android' | 'desktop' | 'all';

export interface IdentityProviderRegistryRecord {
  id: string;
  provider_family_id: string;
  provider_key: string;
  auth_type: IdentityAuthType;
  platform: PlatformApplicability;
  scopes_used: string[];
  session_semantics: string;     // 'supabase_session' | 'federated' | 'device_bound'
  launch_stage: string;
  active: boolean;
}

// ─── Connector Provider Registry ──────────────────────────────────
export type ConnectorCategory = 'storage' | 'email' | 'calendar' | 'messaging' | 'finance' | 'health' | 'analytics' | 'other';
export type ConnectorTokenModel = 'oauth2_refresh' | 'api_key' | 'service_account' | 'webhook' | 'none';
export type ConnectorMode = 'real' | 'demo' | 'internal_test';

export interface ConnectorProviderRegistryRecord {
  id: string;
  provider_family_id: string;
  connector_key: string;
  display_name: string;
  category: ConnectorCategory;
  auth_type: string;
  scope_policy: string[];
  token_model: ConnectorTokenModel;
  health_model: string;           // 'poll' | 'webhook' | 'passive' | 'none'
  sync_support: boolean;
  launch_stage: string;
  mode_support: ConnectorMode[];
  active: boolean;
}

// ─── OAuth Client Registry ────────────────────────────────────────
export type OAuthClientPurpose =
  | 'identity_web'
  | 'identity_mobile_ios'
  | 'identity_mobile_android'
  | 'connector_web'
  | 'connector_mobile_ios'
  | 'connector_mobile_android'
  | 'internal_test'
  | 'other';

export interface OAuthClientRegistryRecord {
  id: string;
  provider_family_id: string;
  client_name: string;
  client_purpose: OAuthClientPurpose;
  allowed_capabilities: string[];
  authorized_origins: string[];
  redirect_uris: string[];
  environment_bindings: string;   // 'production' | 'staging' | 'development'
  active: boolean;
  launch_stage: string;
}

// ─── Identity Session Layer ───────────────────────────────────────
export interface IdentitySessionRecord {
  id: string;
  user_id: string;
  identity_provider_key: string;
  provider_family_key: string;
  session_trust_posture: string;  // 'full' | 'elevated' | 'standard' | 'degraded'
  linked_identities: string[];
  device_trust_id?: string | null;
  created_at: string;
  expires_at?: string | null;
}

// ─── Linked Identity Provider ─────────────────────────────────────
export interface LinkedIdentityProviderRecord {
  id: string;
  user_id: string;
  provider_family_id: string;
  provider_key: string;
  external_id: string;
  email?: string | null;
  display_name?: string | null;
  linked_at: string;
  last_used_at?: string | null;
  primary: boolean;
  status: 'active' | 'revoked' | 'expired';
}

// ─── Connected Service Account ────────────────────────────────────
export interface ConnectedServiceAccountRecord {
  id: string;
  user_id: string;
  provider_family_id: string;
  provider_capability_id: string;
  account_label: string;
  scopes_granted: string[];
  token_state: 'valid' | 'expired' | 'revoked' | 'pending';
  token_expires_at?: string | null;
  reauth_required: boolean;
  health_state: 'healthy' | 'degraded' | 'error' | 'unknown';
  last_sync_at?: string | null;
  read_write_mode: 'read_only' | 'read_write' | 'write_only';
  permission_upgrade_available: boolean;
  mode: ConnectorMode;
  connected_at: string;
  disconnected_at?: string | null;
}

// ─── Connector OAuth Token ────────────────────────────────────────
export interface ConnectorOAuthTokenRecord {
  id: string;
  connected_service_account_id: string;
  access_token_hash: string;      // never store plaintext
  refresh_token_hash?: string | null;
  scopes: string[];
  issued_at: string;
  expires_at: string;
  last_refreshed_at?: string | null;
  revoked: boolean;
}

// ─── Connector Health ─────────────────────────────────────────────
export interface ConnectorHealthRecord {
  id: string;
  connected_service_account_id: string;
  health_state: 'healthy' | 'degraded' | 'error' | 'unknown';
  last_check_at: string;
  error_message?: string | null;
  consecutive_failures: number;
  avg_latency_ms?: number | null;
}

// ─── Connector Permission Level ───────────────────────────────────
export interface ConnectorPermissionLevelRecord {
  id: string;
  provider_capability_id: string;
  level_key: string;              // 'read_only' | 'read_write' | 'admin'
  scopes_required: string[];
  display_label: string;
  description: string;
  default: boolean;
}

// ─── Consent Ledger ───────────────────────────────────────────────
export type ConsentType = 'identity_link' | 'connector_access' | 'scope_upgrade' | 'data_export' | 'device_trust';

export interface ConsentLedgerRecord {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  provider_family_id: string;
  provider_capability_id?: string | null;
  oauth_client_id?: string | null;
  scopes_granted: string[];
  granted_at: string;
  expires_at?: string | null;
  revoked: boolean;
  revoked_at?: string | null;
  mode: ConnectorMode;
  consent_source: string;        // 'user_action' | 'auto_link' | 'admin_grant'
}

// ─── Consent Upgrade ──────────────────────────────────────────────
export interface ConsentUpgradeRecord {
  id: string;
  consent_ledger_id: string;
  from_scopes: string[];
  to_scopes: string[];
  reason: string;
  approved: boolean;
  approved_at?: string | null;
  user_explanation: string;
}

// ─── Consent Revocation ───────────────────────────────────────────
export interface ConsentRevocationRecord {
  id: string;
  consent_ledger_id: string;
  revoked_scopes: string[];
  reason: string;
  revoked_at: string;
  revoked_by: 'user' | 'admin' | 'system' | 'expiry';
}

// ─── Scope Policy Matrix ──────────────────────────────────────────
export interface ScopePolicyMatrixRecord {
  id: string;
  provider_family_id: string;
  provider_capability_id?: string | null;
  scope_key: string;
  scope_display: string;
  category: 'identity_minimal' | 'connector_read' | 'connector_write' | 'connector_admin' | 'disallowed';
  default_granted: boolean;
  approval_needed: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  notes?: string | null;
}

// ─── Permission Upgrade Request ───────────────────────────────────
export interface PermissionUpgradeRequestRecord {
  id: string;
  user_id: string;
  connected_service_account_id: string;
  from_level: string;
  to_level: string;
  scope_diff: string[];
  justification: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  decided_at?: string | null;
  decided_by?: string | null;
}

// ─── Unified Account Graph ────────────────────────────────────────
export type AccountGraphNodeType = 'identity_provider' | 'connector_service' | 'device' | 'workspace' | 'user';

export interface UnifiedAccountGraphNodeRecord {
  id: string;
  user_id: string;
  node_type: AccountGraphNodeType;
  node_key: string;
  display_label: string;
  provider_family_key?: string | null;
  status: 'active' | 'inactive' | 'revoked';
  metadata?: Record<string, unknown> | null;
}

export interface UnifiedAccountGraphEdgeRecord {
  id: string;
  from_node_id: string;
  to_node_id: string;
  edge_type: string;              // 'identity_link' | 'connector_access' | 'device_trust' | 'workspace_member'
  strength: number;               // 0-1
  created_at: string;
}

// ─── Auth vs Connector Separation Audit ───────────────────────────
export interface AuthConnectorSeparationAuditRecord {
  id: string;
  audit_type: 'over_scope' | 'conflated_auth' | 'missing_separation' | 'ux_confusion' | 'stale_consent';
  provider_family_key: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  resolved: boolean;
  resolved_at?: string | null;
  created_at: string;
}

// ─── Composite View Models ────────────────────────────────────────
export interface ProviderFamilySeparationView {
  family: ProviderFamilyRecord;
  identityProviders: IdentityProviderRegistryRecord[];
  connectorProviders: ConnectorProviderRegistryRecord[];
  oauthClients: OAuthClientRegistryRecord[];
  separationHealth: 'clean' | 'warning' | 'violation';
}

export interface UserAuthConnectorSnapshot {
  userId: string;
  linkedIdentities: LinkedIdentityProviderRecord[];
  connectedServices: ConnectedServiceAccountRecord[];
  activeConsents: ConsentLedgerRecord[];
  graphNodes: UnifiedAccountGraphNodeRecord[];
  graphEdges: UnifiedAccountGraphEdgeRecord[];
}
