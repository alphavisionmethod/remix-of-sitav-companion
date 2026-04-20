// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Capability & Client Types
//
// Shared type surface for the connector capability registry.
// Each catalog connector declares its actions, scopes, and the
// edge function that backs it — making the catalog → runtime
// path traceable and statically enforceable.
// ═══════════════════════════════════════════════════════════════

export type ConnectorRiskClass =
  | "informational"
  | "low"
  | "medium"
  | "high"
  | "irreversible";

export type ConnectorLifecycleStatus = "beta" | "planned" | "ga" | "deprecated";

export interface ConnectorAction {
  /** Stable action key, e.g. "send-message", "list-messages" */
  key: string;
  /** Human-readable label */
  label: string;
  /** Risk classification for autonomy gating */
  riskClass: ConnectorRiskClass;
  /** Whether the action is reversible / has a rollback path */
  reversible: boolean;
}

export interface ConnectorCapability {
  /** Catalog id — must match generated/connector-catalog.json */
  connectorId: string;
  /** Display name */
  name: string;
  /** OAuth / API scopes required */
  scopes: string[];
  /** Declared actions this connector exposes */
  actions: ConnectorAction[];
  /** Edge function name that backs the runtime path. null => not yet wired */
  edgeFunction: string | null;
  /** Lifecycle status — gates whether a client binding is required */
  status: ConnectorLifecycleStatus;
}

export interface ConnectorClientInvokeOptions {
  /** Action key from the capability declaration */
  action: string;
  /** Action-specific parameters forwarded to the edge function */
  params?: Record<string, unknown>;
}

export interface ConnectorClientResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface ConnectorClient {
  connectorId: string;
  invoke<T = unknown>(opts: ConnectorClientInvokeOptions): Promise<ConnectorClientResult<T>>;
}
