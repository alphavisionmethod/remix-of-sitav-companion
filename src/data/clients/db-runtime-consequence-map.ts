// ═══════════════════════════════════════════════════════════════
// SITA OS — DB Runtime Consequence Map
// Impact of table unavailability on system
// ═══════════════════════════════════════════════════════════════

export type TableCriticality = "critical" | "high" | "medium" | "low";

export interface TableConsequence {
  readonly criticality: TableCriticality;
  readonly impactDescription: string;
  readonly affectedFeatures: readonly string[];
  readonly recoveryPath: string;
}

export const DB_RUNTIME_CONSEQUENCE_MAP: Record<string, TableConsequence> = {
  profiles: { criticality: "critical", impactDescription: "All user-facing features break", affectedFeatures: ["auth", "dashboard", "settings", "all-user-features"], recoveryPath: "Restore from backup, trigger profile re-creation" },
  user_roles: { criticality: "critical", impactDescription: "RBAC completely disabled", affectedFeatures: ["admin-access", "role-checks", "permissions"], recoveryPath: "Restore roles, re-run has_role checks" },
  capabilities: { criticality: "high", impactDescription: "OS capability routing fails", affectedFeatures: ["command-execution", "capability-checks"], recoveryPath: "Re-seed capabilities table" },
  execution_envelopes: { criticality: "high", impactDescription: "Command execution tracking lost", affectedFeatures: ["os-commands", "execution-history"], recoveryPath: "Re-create from receipts" },
  receipts: { criticality: "high", impactDescription: "Execution proof chain broken", affectedFeatures: ["proof-verification", "audit-trail"], recoveryPath: "Reconstruct from audit_logs" },
  advisor_agents: { criticality: "high", impactDescription: "All advisor features offline", affectedFeatures: ["advisor-chat", "recommendations", "intelligence"], recoveryPath: "Re-seed advisor configs" },
  invoices: { criticality: "high", impactDescription: "Financial operations blocked", affectedFeatures: ["billing", "revenue", "cash-flow"], recoveryPath: "Restore from backup" },
  cloud_devices: { criticality: "medium", impactDescription: "Device management unavailable", affectedFeatures: ["device-registration", "telemetry"], recoveryPath: "Devices re-register on next heartbeat" },
  connector_configs: { criticality: "medium", impactDescription: "Connector integrations offline", affectedFeatures: ["external-sync", "oauth-flows"], recoveryPath: "Re-configure connectors" },
  boardroom_sessions: { criticality: "medium", impactDescription: "Boardroom features unavailable", affectedFeatures: ["boardroom-ui", "decisions"], recoveryPath: "Restore from backup" },
  push_subscriptions: { criticality: "low", impactDescription: "Push notifications stop", affectedFeatures: ["push-notifications"], recoveryPath: "Users re-subscribe" },
  audit_logs: { criticality: "high", impactDescription: "Compliance audit trail gap", affectedFeatures: ["compliance", "audit"], recoveryPath: "Critical — must restore immediately" },
} as const;

export function getConsequenceForTable(name: string): TableConsequence | undefined {
  return DB_RUNTIME_CONSEQUENCE_MAP[name];
}

export function getCriticalTables(): string[] {
  return Object.entries(DB_RUNTIME_CONSEQUENCE_MAP)
    .filter(([, c]) => c.criticality === "critical")
    .map(([name]) => name);
}
