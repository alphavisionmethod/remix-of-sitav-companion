// ═══════════════════════════════════════════════════════════════
// SITA OS — Enterprise Control Plane Contracts
// ═══════════════════════════════════════════════════════════════

export interface TenantFirewallRule {
  id: string;
  user_id: string;
  action: "allow" | "deny" | "audit";
  resource: string;
  source_scope: string;
  conditions: Record<string, unknown>;
  priority: number;
  active: boolean;
  created_at: string;
}

export interface EnterpriseAuditReview {
  id: string;
  user_id: string;
  period: string;
  reviewed_at: string;
  reviewer: string;
  tables_audited: string[];
  total_events: number;
  anomalies_detected: number;
  anomaly_details: Array<{ table: string; event: string; severity: string; notes: string }>;
  compliance_status: "compliant" | "review-needed" | "non-compliant";
  recommendations: string[];
}

export interface RolePermissionGrant {
  id: string;
  user_id: string;
  role: string;
  permissions: string[];
  scope: "global" | "domain" | "resource";
  scope_value?: string;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
  active: boolean;
}

export type ControlPlaneEventType =
  | "firewall.rule-created"
  | "firewall.rule-updated"
  | "firewall.rule-triggered"
  | "audit.review-completed"
  | "role.granted"
  | "role.revoked"
  | "tenant.config-changed";

export interface ControlPlaneEvent {
  id: string;
  user_id: string;
  type: ControlPlaneEventType;
  timestamp: string;
  actor: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  severity: "info" | "warning" | "critical";
}
