// ═══════════════════════════════════════════════════════════════
// SITA OS — Support View Registry
// Declares support/debug data access patterns for critical workflows
// ═══════════════════════════════════════════════════════════════

export type OperatorAccessLevel = "read-only" | "read-with-pii-redaction" | "full-debug";

export interface SupportViewEntry {
  readonly id: string;
  readonly workflow: string;
  readonly tablesInvolved: readonly string[];
  readonly joinPattern: string;
  readonly keyFilters: readonly string[];
  readonly operatorAccessLevel: OperatorAccessLevel;
  readonly redactionRules: readonly string[];
  readonly description: string;
}

export const SUPPORT_VIEW_REGISTRY: readonly SupportViewEntry[] = [
  { id: "sv-auth-session", workflow: "auth/session", tablesInvolved: ["os_sessions", "profiles", "user_roles", "admin_sessions"], joinPattern: "os_sessions JOIN profiles ON user_id", keyFilters: ["user_id", "session_id", "expires_at"], operatorAccessLevel: "read-with-pii-redaction", redactionRules: ["redact email", "redact IP"], description: "Auth session incident investigation" },
  { id: "sv-onboarding", workflow: "onboarding", tablesInvolved: ["onboarding_sessions", "onboarding_steps", "onboarding_choices", "business_onboarding"], joinPattern: "onboarding_sessions JOIN onboarding_steps", keyFilters: ["user_id", "status"], operatorAccessLevel: "read-only", redactionRules: [], description: "Onboarding recovery and checkpoint inspection" },
  { id: "sv-app-install", workflow: "app-install", tablesInvolved: ["managed_apps", "license_activations", "licenses"], joinPattern: "managed_apps JOIN licenses ON user_id", keyFilters: ["user_id", "app_id", "status"], operatorAccessLevel: "read-only", redactionRules: [], description: "App install/recovery investigation" },
  { id: "sv-advisor-boardroom", workflow: "advisor/boardroom", tablesInvolved: ["advisor_agents", "advisor_board_recommendations", "advisor_board_actions", "boardroom_items", "boardroom_decision_receipts"], joinPattern: "advisor_agents JOIN recommendations ON advisor_id", keyFilters: ["user_id", "advisor_id", "status"], operatorAccessLevel: "read-only", redactionRules: [], description: "Advisor and boardroom action tracing" },
  { id: "sv-payment", workflow: "payment", tablesInvolved: ["invoices", "receipts", "proof_records", "bills"], joinPattern: "invoices LEFT JOIN receipts ON receipt_id", keyFilters: ["user_id", "invoice_id", "status"], operatorAccessLevel: "read-with-pii-redaction", redactionRules: ["redact payment details"], description: "Payment proof mismatch investigation" },
  { id: "sv-connector", workflow: "connector", tablesInvolved: ["connector_tokens", "connector_sync_runs", "sync_logs", "connector_oauth_flows"], joinPattern: "connector_tokens JOIN sync_runs ON user_id", keyFilters: ["user_id", "provider", "status", "expires_at"], operatorAccessLevel: "read-with-pii-redaction", redactionRules: ["redact token values", "redact OAuth secrets"], description: "Connector token/sync failure investigation" },
  { id: "sv-file-processing", workflow: "file-processing", tablesInvolved: ["cloud_files", "cloud_file_versions", "cloud_blobs"], joinPattern: "cloud_files JOIN file_versions ON file_id", keyFilters: ["user_id", "file_id", "status"], operatorAccessLevel: "read-only", redactionRules: [], description: "File processing failure lineage" },
  { id: "sv-kill-switch", workflow: "kill-switch/incident", tablesInvolved: ["incidents", "platform_runbooks", "audit_logs"], joinPattern: "incidents LEFT JOIN runbooks ON runbook_id", keyFilters: ["incident_id", "status", "severity"], operatorAccessLevel: "full-debug", redactionRules: [], description: "Kill-switch and incident history" },
  { id: "sv-support-bundle", workflow: "support-bundle", tablesInvolved: ["support_cases", "support_case_events", "support_access_grants"], joinPattern: "support_cases JOIN events ON case_id", keyFilters: ["case_id", "user_id", "status"], operatorAccessLevel: "read-with-pii-redaction", redactionRules: ["redact user email"], description: "Support bundle lineage and escalation" },
];

export function getSupportView(id: string): SupportViewEntry | undefined {
  return SUPPORT_VIEW_REGISTRY.find(e => e.id === id);
}

export function getSupportViewForWorkflow(workflow: string): SupportViewEntry | undefined {
  return SUPPORT_VIEW_REGISTRY.find(e => e.workflow === workflow);
}