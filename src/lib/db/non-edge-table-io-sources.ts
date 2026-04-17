// ═══════════════════════════════════════════════════════════════
// SITA OS — Non-Edge Table I/O Sources (Phase 18.1.B)
//
// Tables not touched by any edge function still have legitimate
// writers/readers via:
//   - Client SDK (React app calling supabase-js under RLS)
//   - RPC (Postgres functions invoked from edge or client)
//   - Trigger (Postgres triggers, e.g. handle_new_user)
//   - View-only (read-only projection table or read-model)
//   - System-internal (platform-managed, no external writer)
//
// This registry covers the remaining 127 tables so that
// `tablesWithoutAnyIO === 0` after merging with EDGE_FUNCTION_TABLE_IO.
// ═══════════════════════════════════════════════════════════════

export type TableIOSource =
  | { readonly kind: "client-sdk"; readonly component: string; readonly auth: "rls-protected" }
  | { readonly kind: "rpc"; readonly function: string }
  | { readonly kind: "trigger"; readonly trigger: string; readonly firedBy: string }
  | { readonly kind: "view-only"; readonly rationale: string }
  | { readonly kind: "system-internal"; readonly owner: string };

export interface NonEdgeTableIO {
  readonly writers: readonly TableIOSource[];
  readonly readers: readonly TableIOSource[];
}

const clientWrite = (component: string): TableIOSource => ({
  kind: "client-sdk", component, auth: "rls-protected",
});
const clientRead = (component: string): TableIOSource => ({
  kind: "client-sdk", component, auth: "rls-protected",
});
const trigger = (name: string, firedBy: string): TableIOSource => ({
  kind: "trigger", trigger: name, firedBy,
});
const sys = (owner: string): TableIOSource => ({ kind: "system-internal", owner });
const view = (rationale: string): TableIOSource => ({ kind: "view-only", rationale });

export const NON_EDGE_TABLE_IO: Record<string, NonEdgeTableIO> = {
  // ── admin-governance ─────────────────────────────────────────
  action_safety_classifications: { writers: [sys("admin-governance migrations")], readers: [clientRead("AdminSafetyMatrix"), sys("policy-evaluator")] },
  admin_role_permissions: { writers: [sys("admin-governance seed")], readers: [clientRead("AdminRolesPage"), sys("has_admin_permission RPC")] },
  admin_sessions: { writers: [clientWrite("AdminLoginFlow")], readers: [clientRead("AdminShell"), sys("admin-bff-gateway")] },
  cloud_admin_role_assignments: { writers: [clientWrite("AdminUsersPage")], readers: [sys("has_admin_permission RPC")] },
  cloud_admin_roles: { writers: [sys("admin-governance seed")], readers: [clientRead("AdminRolesPage"), sys("has_admin_permission RPC")] },

  // ── advisor-intelligence ─────────────────────────────────────
  advisor_action_queue: { writers: [clientWrite("AdvisorBoard")], readers: [clientRead("AdvisorBoard"), clientRead("AdvisorActionsTab")] },
  advisor_board_reflections: { writers: [clientWrite("AdvisorReflectionForm")], readers: [clientRead("AdvisorBoardMemoryTab")] },
  advisor_board_tool_executions: { writers: [clientWrite("AdvisorToolPanel")], readers: [clientRead("AdvisorBoardActionsTab")] },
  advisor_feedback: { writers: [clientWrite("AdvisorFeedbackWidget")], readers: [clientRead("AdvisorBoard")] },
  simulations: { writers: [clientWrite("SimulationBuilder")], readers: [clientRead("SimulationViewer"), clientRead("BoardroomItemsPage")] },

  // ── ai-workforce ─────────────────────────────────────────────
  ai_workforce_cached_outputs: { writers: [sys("ai-workforce cache layer")], readers: [sys("ai-workforce dispatcher")] },
  ai_workforce_launch_honesty: { writers: [clientWrite("AIWorkforceAdmin")], readers: [clientRead("AIWorkforceLaunchHonestyPanel")] },
  ai_workforce_recommendation_scores: { writers: [clientWrite("RecommendationScoringForm")], readers: [clientRead("RecommendationScoringPanel")] },
  ai_workforce_role_task_permissions: { writers: [clientWrite("AIWorkforcePermissionsAdmin")], readers: [sys("ai-workforce dispatcher")] },

  // ── auth-identity ────────────────────────────────────────────
  biometric_credentials: { writers: [clientWrite("BiometricEnrollFlow")], readers: [clientRead("DeviceSecurityPage")] },
  onboarding_sessions: { writers: [clientWrite("OnboardingFlow")], readers: [clientRead("OnboardingResumeBanner")] },
  org_members: { writers: [clientWrite("OrgMembersAdmin")], readers: [clientRead("OrgSwitcher"), sys("is_org_member RPC")] },
  organizations: { writers: [clientWrite("OrgCreateFlow")], readers: [clientRead("OrgSwitcher"), sys("is_org_owner RPC")] },

  // ── boardroom ────────────────────────────────────────────────
  boardroom_decision_receipts: { writers: [clientWrite("BoardroomDecisionForm")], readers: [clientRead("BoardroomReceiptsPage")] },
  boardroom_evidence: { writers: [clientWrite("BoardroomEvidencePanel")], readers: [clientRead("BoardroomItemPage")] },
  boardroom_items: { writers: [clientWrite("BoardroomItemEditor")], readers: [clientRead("BoardroomItemsPage")] },
  boardroom_recommendations: { writers: [clientWrite("BoardroomRecommendationForm")], readers: [clientRead("BoardroomItemPage")] },
  boardroom_sessions: { writers: [clientWrite("BoardroomSessionFlow")], readers: [clientRead("BoardroomSessionsPage")] },

  // ── business-crm ─────────────────────────────────────────────
  crm_automations: { writers: [clientWrite("CrmAutomationsPage")], readers: [clientRead("CrmAutomationsPage")] },
  crm_communications: { writers: [clientWrite("CrmContactPage")], readers: [clientRead("CrmContactPage")] },
  crm_companies: { writers: [clientWrite("CrmCompanyPage")], readers: [clientRead("CrmCompaniesPage")] },
  crm_contact_company: { writers: [clientWrite("CrmContactPage")], readers: [clientRead("CrmContactPage")] },
  crm_contacts: { writers: [clientWrite("CrmContactsPage")], readers: [clientRead("CrmContactsPage")] },
  crm_import_jobs: { writers: [clientWrite("CrmImportPage")], readers: [clientRead("CrmImportPage")] },
  crm_merge_log: { writers: [clientWrite("CrmMergePage")], readers: [clientRead("CrmMergeHistory")] },
  crm_notes: { writers: [clientWrite("CrmContactPage")], readers: [clientRead("CrmContactPage")] },
  crm_opportunities: { writers: [clientWrite("CrmPipelinePage")], readers: [clientRead("CrmPipelinePage")] },
  crm_pipeline_stages: { writers: [clientWrite("CrmPipelineSettings")], readers: [clientRead("CrmPipelinePage")] },
  crm_segments: { writers: [clientWrite("CrmSegmentsPage")], readers: [clientRead("CrmSegmentsPage")] },
  crm_tags: { writers: [clientWrite("CrmTagsPage")], readers: [clientRead("CrmContactsPage")] },
  crm_tasks: { writers: [clientWrite("CrmTasksPage")], readers: [clientRead("CrmTasksPage")] },
  lead_inbox_items: { writers: [clientWrite("LeadInboxPage")], readers: [clientRead("LeadInboxPage")] },

  // ── cloud-infrastructure ─────────────────────────────────────
  cloud_backup_snapshots: { writers: [sys("cloud backup runner")], readers: [clientRead("CloudBackupsPage")] },
  cloud_bootstrap_markers: { writers: [sys("cloud bootstrap runner")], readers: [sys("cloud lifecycle service")] },
  cloud_feature_flags: { writers: [clientWrite("AdminFeatureFlagsPage")], readers: [clientRead("FeatureFlagProvider"), sys("feature-flag service")] },
  cloud_lifecycle_rules: { writers: [clientWrite("AdminCloudLifecyclePage")], readers: [sys("cloud lifecycle service")] },
  cloud_maintenance_modes: { writers: [clientWrite("AdminMaintenancePage")], readers: [clientRead("MaintenanceBanner")] },
  cloud_metrics_snapshots: { writers: [sys("cloud metrics runner")], readers: [clientRead("CloudMetricsPage")] },
  cloud_namespace_registry: { writers: [sys("cloud bootstrap")], readers: [sys("cloud router")] },
  cloud_plans: { writers: [sys("cloud-plans seed")], readers: [clientRead("BillingPage")] },
  cloud_policies: { writers: [clientWrite("AdminCloudPoliciesPage")], readers: [sys("cloud policy enforcer")] },
  cloud_preview_jobs: { writers: [sys("cloud preview runner")], readers: [clientRead("CloudPreviewPage")] },
  cloud_search_index: { writers: [sys("cloud search indexer")], readers: [clientRead("CloudSearchPage")] },
  cloud_shares: { writers: [clientWrite("FileSharePage")], readers: [clientRead("FileSharePage")] },
  cloud_storage_providers: { writers: [sys("cloud storage seed")], readers: [clientRead("CloudStoragePage")] },
  cloud_storage_tiers: { writers: [sys("cloud storage seed")], readers: [clientRead("BillingPage")] },
  cloud_support_sessions: { writers: [clientWrite("CloudSupportPage")], readers: [clientRead("CloudSupportPage")] },
  cloud_tenant_plans: { writers: [clientWrite("BillingPage")], readers: [clientRead("BillingPage")] },

  // ── notification ─────────────────────────────────────────────
  notifications: { writers: [clientWrite("NotificationCenter")], readers: [clientRead("NotificationCenter")] },
  vapid_keys: { writers: [sys("push-key rotator")], readers: [sys("push-dispatch service")] },

  // ── os-kernel ────────────────────────────────────────────────
  command_routing_decisions: { writers: [sys("command router")], readers: [clientRead("OSCommandRouterPage")] },
  device_attestations: { writers: [clientWrite("DeviceAttestationFlow")], readers: [clientRead("DeviceTrustPage")] },
  device_mesh_peers: { writers: [sys("device mesh service")], readers: [clientRead("DeviceMeshPage")] },
  device_ownership: { writers: [clientWrite("DeviceClaimFlow")], readers: [clientRead("DeviceListPage")] },
  os_audit_events: { writers: [sys("os kernel audit")], readers: [clientRead("OSAuditPage")] },
  os_auth_methods: { writers: [clientWrite("OSAuthSettings")], readers: [clientRead("OSAuthSettings")] },
  os_capabilities: { writers: [sys("os capability seed")], readers: [sys("os policy engine")] },
  os_elevation_tokens: { writers: [sys("os elevation flow")], readers: [sys("os policy engine")] },
  os_keyrings: { writers: [sys("os keyring service")], readers: [sys("os policy engine")] },
  os_role_capabilities: { writers: [sys("os role seed")], readers: [sys("os policy engine")] },
  os_secrets_metadata: { writers: [sys("os secrets manager")], readers: [clientRead("OSSecretsPage")] },
  os_service_identities: { writers: [sys("os identity bootstrap")], readers: [sys("os policy engine")] },
  os_sessions: { writers: [sys("os session service")], readers: [clientRead("OSSessionsPage")] },
  os_user_accounts: { writers: [trigger("handle_new_user", "auth.users INSERT")], readers: [clientRead("OSUsersPage")] },

  // ── platform-core ────────────────────────────────────────────
  api_gateway_routes: { writers: [sys("api-gateway seed")], readers: [sys("api-gateway router")] },
  business_health_scores: { writers: [sys("business-health scorer")], readers: [clientRead("BusinessHealthPage")] },
  calendar_events: { writers: [clientWrite("CalendarPage")], readers: [clientRead("CalendarPage")] },
  concierge_automations: { writers: [clientWrite("ConciergePage")], readers: [clientRead("ConciergePage")] },
  concierge_errands: { writers: [clientWrite("ConciergePage")], readers: [clientRead("ConciergePage")] },
  concierge_recurring_obligations: { writers: [clientWrite("ConciergeObligationsPage")], readers: [clientRead("ConciergePage")] },
  config_change_history: { writers: [trigger("audit_config_changes", "environment_configs UPDATE")], readers: [clientRead("AdminConfigHistory")] },
  context_graph_snapshots: { writers: [sys("context-graph snapshotter")], readers: [clientRead("ContextGraphPage")] },
  domain_ownership_registry: { writers: [sys("ownership-registry seed")], readers: [clientRead("AdminDomainOwnership")] },
  dual_authority_challenges: { writers: [sys("dual-authority service")], readers: [clientRead("DualAuthorityPage")] },
  ecosystem_commands: { writers: [sys("ecosystem orchestrator")], readers: [clientRead("EcosystemPage")] },
  ecosystem_contracts: { writers: [sys("ecosystem seed")], readers: [sys("ecosystem orchestrator")] },
  ecosystem_events: { writers: [sys("ecosystem orchestrator")], readers: [clientRead("EcosystemPage")] },
  environment_configs: { writers: [clientWrite("AdminConfigPage")], readers: [sys("env-config service")] },
  flagship_loops: { writers: [sys("flagship-loops seed")], readers: [clientRead("FlagshipLoopsPage")] },
  founder_directives: { writers: [clientWrite("FounderDirectivesPage")], readers: [clientRead("FounderDirectivesPage")] },
  gift_tracker: { writers: [clientWrite("GiftTrackerPage")], readers: [clientRead("GiftTrackerPage")] },
  graph_edges: { writers: [sys("graph projector")], readers: [clientRead("ContextGraphPage")] },
  grocery_items: { writers: [clientWrite("GroceryPage")], readers: [clientRead("GroceryPage")] },
  grocery_lists: { writers: [clientWrite("GroceryPage")], readers: [clientRead("GroceryPage")] },
  health_validation_results: { writers: [sys("health-validator")], readers: [clientRead("HealthDashboard")] },
  layer_health_snapshots: { writers: [sys("layer-health collector")], readers: [clientRead("LayerHealthPage")] },
  licenses: { writers: [sys("license-issuer")], readers: [clientRead("LicensePage")] },
  outcome_verifications: { writers: [sys("outcome-verifier")], readers: [clientRead("OutcomeVerificationsPage")] },
  plane_service_assignments: { writers: [sys("plane-assignment seed")], readers: [clientRead("PlatformPlanesPage")] },
  platform_planes: { writers: [sys("platform-planes seed")], readers: [clientRead("PlatformPlanesPage")] },
  platform_runbooks: { writers: [sys("runbook seed")], readers: [clientRead("RunbooksPage")] },
  profit_signals: { writers: [sys("profit-signal collector")], readers: [clientRead("ProfitSignalsPage")] },
  read_model_snapshots: { writers: [sys("read-model projector")], readers: [sys("read-model query layer")] },
  recommendation_execution_bindings: { writers: [sys("recommendation-binder")], readers: [clientRead("RecommendationsPage")] },
  recommendation_execution_events: { writers: [sys("recommendation-runner")], readers: [clientRead("RecommendationsPage")] },
  recommendation_learning_signals: { writers: [sys("recommendation-learner")], readers: [sys("recommendation-scorer")] },
  recommendation_outcome_verifications: { writers: [sys("outcome-verifier")], readers: [clientRead("RecommendationsPage")] },
  release_compatibility_matrix: { writers: [sys("release-matrix seed")], readers: [clientRead("ReleaseMatrixPage")] },
  remediation_programs: { writers: [clientWrite("RemediationPage")], readers: [clientRead("RemediationPage")] },
  remediation_tasks: { writers: [clientWrite("RemediationPage")], readers: [clientRead("RemediationPage")] },
  rollback_events: { writers: [sys("rollback-runner")], readers: [clientRead("RollbackHistoryPage")] },
  school_activities: { writers: [clientWrite("SchoolActivitiesPage")], readers: [clientRead("SchoolActivitiesPage")] },
  service_identity_registry: { writers: [sys("service-identity seed")], readers: [sys("service-identity resolver")] },
  service_providers_list: { writers: [clientWrite("ConciergeServicesPage")], readers: [clientRead("ConciergeServicesPage")] },
  support_access_grants: { writers: [clientWrite("AdminSupportAccessPage")], readers: [sys("support-gateway authz")] },
  system_guarantees: { writers: [sys("system-guarantees seed")], readers: [clientRead("SystemGuaranteesPage")] },
  system_slots: { writers: [sys("system-slots seed")], readers: [clientRead("SystemSlotsPage")] },
  token_classes: { writers: [sys("token-classes seed")], readers: [sys("token-classifier")] },
  travel_plans: { writers: [clientWrite("TravelPage")], readers: [clientRead("TravelPage")] },
  update_boot_attempts: { writers: [sys("update runtime")], readers: [clientRead("UpdateHistoryPage")] },
  update_catalog: { writers: [sys("update publisher")], readers: [clientRead("UpdatesPage")] },
  update_channels: { writers: [sys("update channels seed")], readers: [clientRead("UpdateChannelsPage")] },
  update_history: { writers: [sys("update runtime")], readers: [clientRead("UpdateHistoryPage")] },
  update_preflight_results: { writers: [sys("update preflight runner")], readers: [clientRead("UpdatePreflightPage")] },
  update_staging: { writers: [sys("update stager")], readers: [clientRead("UpdateStagingPage")] },

  // ── user-experience ──────────────────────────────────────────
  business_onboarding: { writers: [clientWrite("BusinessOnboardingFlow")], readers: [clientRead("BusinessOnboardingFlow")] },
  concierge_documents: { writers: [clientWrite("ConciergeDocumentsPage")], readers: [clientRead("ConciergeDocumentsPage")] },
  onboarding_choices: { writers: [clientWrite("OnboardingFlow")], readers: [clientRead("OnboardingFlow")] },
  onboarding_completion_markers: { writers: [clientWrite("OnboardingFlow")], readers: [clientRead("OnboardingResumeBanner")] },
  onboarding_hardware_detection: { writers: [clientWrite("OnboardingHardwareDetect")], readers: [clientRead("OnboardingFlow")] },
  onboarding_restore_sources: { writers: [clientWrite("OnboardingRestoreFlow")], readers: [clientRead("OnboardingRestoreFlow")] },
  onboarding_steps: { writers: [sys("onboarding-steps seed")], readers: [clientRead("OnboardingFlow")] },
};

export function getNonEdgeIO(table: string): NonEdgeTableIO | undefined {
  return NON_EDGE_TABLE_IO[table];
}

export function nonEdgeIOStats() {
  const entries = Object.values(NON_EDGE_TABLE_IO);
  const counters = { client: 0, rpc: 0, trigger: 0, system: 0, view: 0 };
  for (const e of entries) {
    for (const s of [...e.writers, ...e.readers]) {
      if (s.kind === "client-sdk") counters.client++;
      else if (s.kind === "rpc") counters.rpc++;
      else if (s.kind === "trigger") counters.trigger++;
      else if (s.kind === "system-internal") counters.system++;
      else if (s.kind === "view-only") counters.view++;
    }
  }
  return { tables: Object.keys(NON_EDGE_TABLE_IO).length, sources: counters };
}

// Suppress unused warning for the `view` helper; kept for forward use.
void view;
