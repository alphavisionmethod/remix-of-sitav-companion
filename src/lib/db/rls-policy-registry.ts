// ═══════════════════════════════════════════════════════════════
// SITA OS — RLS Policy Registry (AUTO-GENERATED)
// Source of truth: live pg_policies
// Regenerate via: npx tsx scripts/db/generate/generate-rls-policy-registry.ts
// DO NOT hand-edit. Last generated: 2026-04-16T21:22:02.912Z
// Total tables: 201 | Total policies: 358
// ═══════════════════════════════════════════════════════════════

export type RlsPattern =
  | "user_id_match"
  | "owner_id_match"
  | "actor_user_id_match"
  | "org_membership"
  | "tenant_membership"
  | "admin_role"
  | "admin_permission"
  | "public_read"
  | "authenticated_all"
  | "read_only"
  | "append_only"
  | "service_role_only"
  | "no_policies";

export interface RlsPolicyEntry {
  readonly pattern: RlsPattern;
  readonly selectPolicy: boolean;
  readonly insertPolicy: boolean;
  readonly updatePolicy: boolean;
  readonly deletePolicy: boolean;
  readonly policyCount: number;
  readonly tenancyColumn: string | null;
}

export const RLS_POLICY_REGISTRY: Readonly<Record<string, RlsPolicyEntry>> = {
  "action_safety_classifications": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "admin_action_audit": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false, policyCount: 2, tenancyColumn: "actor_user_id" },
  "admin_action_confirmations": { pattern: "admin_permission", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: false, policyCount: 3, tenancyColumn: "actor_user_id" },
  "admin_role_permissions": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "admin_safety_actions": { pattern: "admin_permission", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "admin_sessions": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 3, tenancyColumn: "user_id" },
  "advisor_action_queue": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "advisor_agents": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "advisor_autonomy_policies": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "advisor_board_actions": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "advisor_board_memory": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "advisor_board_recommendations": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "advisor_board_reflections": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "advisor_board_tool_executions": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "advisor_feedback": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "advisor_knowledge": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "user_id" },
  "advisor_memories": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "advisor_profiles": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "user_id" },
  "ai_inference_receipts": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false, policyCount: 2, tenancyColumn: "user_id" },
  "ai_workforce_approval_queue": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ai_workforce_budget_classes": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ai_workforce_cached_outputs": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ai_workforce_invocations": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ai_workforce_launch_honesty": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ai_workforce_outputs": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ai_workforce_recommendation_scores": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ai_workforce_recommendations": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ai_workforce_role_health": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ai_workforce_role_task_permissions": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ai_workforce_roles": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ai_workforce_task_types": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "api_gateway_routes": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "appointments": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "approval_decisions": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "biometric_credentials": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "boardroom_decision_receipts": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "boardroom_evidence": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "boardroom_items": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "boardroom_recommendations": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "boardroom_sessions": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "business_health_scores": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "business_onboarding": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "calendar_events": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "user_id" },
  "client_capability_matrix": { pattern: "admin_permission", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "cloud_abuse_events": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "cloud_account_closure_requests": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_activity_journal": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_admin_role_assignments": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_admin_roles": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "cloud_archive_jobs": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_audit_events": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false, policyCount: 2, tenancyColumn: "actor_user_id" },
  "cloud_backup_snapshots": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: null },
  "cloud_blobs": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_bootstrap_markers": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_compliance_hooks": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: null },
  "cloud_conflicts": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_device_sessions": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_devices": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 3, tenancyColumn: "user_id" },
  "cloud_feature_flags": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: null },
  "cloud_file_versions": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_files": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_folders": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_import_export_jobs": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_lifecycle_rules": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_maintenance_modes": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "cloud_metrics_snapshots": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "cloud_namespace_registry": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "owner_id" },
  "cloud_plans": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "cloud_policies": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "cloud_preview_jobs": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_reconciliation_runs": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: null },
  "cloud_search_index": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_shared_workspaces": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "tenant_id" },
  "cloud_shares": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 3, tenancyColumn: null },
  "cloud_storage_providers": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "cloud_storage_tiers": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "cloud_storage_usage": { pattern: "admin_role", selectPolicy: true, insertPolicy: false, updatePolicy: false, deletePolicy: false, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_support_sessions": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "cloud_sync_changes": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_sync_checkpoints": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_sync_jobs": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: null },
  "cloud_sync_objects": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_tenant_memberships": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "user_id" },
  "cloud_tenant_plans": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "tenant_id" },
  "cloud_tenant_policies": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "tenant_id" },
  "cloud_tenant_quotas": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "tenant_id" },
  "cloud_tenants": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: null },
  "cloud_trash": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_user_plans": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "cloud_worker_jobs": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: "user_id" },
  "command_memory": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "command_routing_decisions": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "command_steps": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "communication_metrics": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false, policyCount: 2, tenancyColumn: "user_id" },
  "concierge_automations": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "concierge_documents": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "concierge_errands": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "concierge_recurring_obligations": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "config_change_history": { pattern: "admin_permission", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false, policyCount: 2, tenancyColumn: "actor_user_id" },
  "connector_oauth_flows": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false, policyCount: 2, tenancyColumn: "user_id" },
  "connector_sync_runs": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false, policyCount: 2, tenancyColumn: "user_id" },
  "connector_tokens": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "context_graph_snapshots": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "crm_automations": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "crm_communications": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "crm_companies": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "crm_contact_company": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "crm_contacts": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "crm_import_jobs": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "crm_merge_log": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "crm_notes": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "crm_opportunities": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "crm_pipeline_stages": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "crm_segments": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "crm_tags": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "crm_tasks": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "device_attestations": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "device_mesh_peers": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "device_ownership": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 5, tenancyColumn: null },
  "domain_ownership_registry": { pattern: "admin_permission", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "dual_authority_challenges": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ecosystem_commands": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ecosystem_contracts": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "ecosystem_events": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "environment_configs": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "flagship_loops": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "founder_directives": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "user_id" },
  "gift_tracker": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "graph_edges": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "grocery_items": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "grocery_lists": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "health_validation_results": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "incidents": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "layer_health_snapshots": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "lead_inbox_items": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "leads": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "license_activations": { pattern: "authenticated_all", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: null },
  "license_audit_log": { pattern: "append_only", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false, policyCount: 2, tenancyColumn: null },
  "licenses": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: false, policyCount: 3, tenancyColumn: "user_id" },
  "managed_apps": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "user_id" },
  "notification_delivery_receipts": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false, policyCount: 2, tenancyColumn: "user_id" },
  "notification_preferences": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "notifications": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "user_id" },
  "onboarding_choices": { pattern: "authenticated_all", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: null },
  "onboarding_completion_markers": { pattern: "authenticated_all", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: null },
  "onboarding_hardware_detection": { pattern: "authenticated_all", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: null },
  "onboarding_restore_sources": { pattern: "authenticated_all", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: null },
  "onboarding_sessions": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "onboarding_steps": { pattern: "authenticated_all", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: null },
  "org_members": { pattern: "org_membership", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "user_id" },
  "organizations": { pattern: "org_membership", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "owner_id" },
  "os_audit_events": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "os_auth_methods": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "os_capabilities": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "os_command_events": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false, policyCount: 2, tenancyColumn: "user_id" },
  "os_commands": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "actor_user_id" },
  "os_elevation_tokens": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "os_keyrings": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "os_policies": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "user_id" },
  "os_role_capabilities": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "os_secrets_metadata": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "os_service_identities": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "os_sessions": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "os_user_accounts": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "outcome_verifications": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "plane_service_assignments": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "platform_notifications": { pattern: "admin_permission", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: false, policyCount: 5, tenancyColumn: null },
  "platform_planes": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "platform_runbooks": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "user_id" },
  "profiles": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 4, tenancyColumn: "user_id" },
  "profit_signals": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "read_model_snapshots": { pattern: "admin_permission", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "recommendation_execution_bindings": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "recommendation_execution_events": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "recommendation_learning_signals": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "recommendation_outcome_verifications": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "release_compatibility_matrix": { pattern: "admin_permission", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "remediation_programs": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "remediation_tasks": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "rollback_events": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "runtime_agents": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "school_activities": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "service_identity_registry": { pattern: "admin_permission", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "service_providers_list": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "simulations": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "support_access_grants": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 3, tenancyColumn: null },
  "support_case_events": { pattern: "admin_permission", selectPolicy: true, insertPolicy: true, updatePolicy: false, deletePolicy: false, policyCount: 4, tenancyColumn: "actor_user_id" },
  "support_cases": { pattern: "admin_permission", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: false, policyCount: 5, tenancyColumn: "user_id" },
  "system_guarantees": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "system_slots": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "timeline_events": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "token_classes": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 2, tenancyColumn: null },
  "travel_plans": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "update_boot_attempts": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "update_catalog": { pattern: "read_only", selectPolicy: true, insertPolicy: false, updatePolicy: false, deletePolicy: false, policyCount: 1, tenancyColumn: null },
  "update_channels": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "update_history": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "update_preflight_results": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "update_staging": { pattern: "user_id_match", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: "user_id" },
  "user_roles": { pattern: "user_id_match", selectPolicy: true, insertPolicy: false, updatePolicy: false, deletePolicy: false, policyCount: 1, tenancyColumn: "user_id" },
  "vapid_keys": { pattern: "admin_role", selectPolicy: true, insertPolicy: true, updatePolicy: true, deletePolicy: true, policyCount: 1, tenancyColumn: null },
};

const DEFAULT_USER_ID_POLICY: RlsPolicyEntry = {
  pattern: "user_id_match",
  selectPolicy: true,
  insertPolicy: true,
  updatePolicy: true,
  deletePolicy: true,
  policyCount: 1,
  tenancyColumn: "user_id",
};

export function getRlsPolicyForTable(name: string): RlsPolicyEntry {
  return RLS_POLICY_REGISTRY[name] ?? DEFAULT_USER_ID_POLICY;
}

export function getTablesByRlsPattern(pattern: RlsPattern): string[] {
  return Object.entries(RLS_POLICY_REGISTRY)
    .filter(([, entry]) => entry.pattern === pattern)
    .map(([name]) => name);
}

export function getAppendOnlyTables(): string[] {
  return getTablesByRlsPattern("append_only");
}

export function getReadOnlyTables(): string[] {
  return getTablesByRlsPattern("read_only");
}

export function getTablesWithoutPolicies(): string[] {
  return getTablesByRlsPattern("no_policies");
}

export const RLS_STATS = {
  totalTables: 201,
  totalPolicies: 358,
  byPattern: {
    "user_id_match": 123,
    "owner_id_match": 0,
    "actor_user_id_match": 0,
    "org_membership": 2,
    "tenant_membership": 0,
    "admin_role": 57,
    "admin_permission": 11,
    "public_read": 0,
    "authenticated_all": 6,
    "read_only": 1,
    "append_only": 1,
    "service_role_only": 0,
    "no_policies": 0,
  },
  withSelect: 201,
  withInsert: 198,
  withUpdate: 187,
  withDelete: 183,
} as const;
