// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Proof Registry
// Canonical registry of workflow families, owners, steps,
// evidence sources, replayability, rollback, and supportability
// ═══════════════════════════════════════════════════════════════

export type WorkflowFamilyId =
  | "auth" | "onboarding" | "app-lifecycle" | "advisor"
  | "boardroom" | "payment" | "crm-connector" | "file"
  | "desktop-recovery" | "os-recovery" | "operator-incident"
  | "support-bundle";

export interface RollbackSemantics {
  reversibleSteps: string[];
  irreversibleSteps: string[];
  compensatingActions: Record<string, string>;
  escalationRules: string[];
  runbookRef: string | null;
}

export interface WorkflowFamilyEntry {
  familyId: WorkflowFamilyId;
  owner: string;
  intent: string;
  scope: string;
  stepIds: string[];
  evidenceSources: string[];
  replayable: boolean;
  rollbackSemantics: RollbackSemantics;
  failureInjectionPoints: string[];
  dashboardRoute: string;
  runbookRef: string | null;
  killSwitchBinding: string | null;
  goldenPathRef: string | null;
  deploymentCriticality: "critical" | "important" | "standard";
}

export const WORKFLOW_PROOF_REGISTRY: Record<WorkflowFamilyId, WorkflowFamilyEntry> = {
  auth: {
    familyId: "auth",
    owner: "auth-service",
    intent: "Govern user authentication lifecycle from signup through session invalidation",
    scope: "auth.users, admin_sessions, account_deletion_requests",
    stepIds: ["auth.signup", "auth.verify-email", "auth.signin", "auth.session-issue", "auth.mfa-challenge", "auth.account-recovery", "auth.logout", "auth.session-invalidate", "auth.account-delete"],
    evidenceSources: ["admin_sessions", "admin_action_audit", "account_deletion_requests"],
    replayable: false,
    rollbackSemantics: {
      reversibleSteps: ["auth.session-issue", "auth.logout"],
      irreversibleSteps: ["auth.signup", "auth.account-delete"],
      compensatingActions: { "auth.session-issue": "invalidate-session", "auth.mfa-challenge": "reset-mfa" },
      escalationRules: ["3-failed-attempts-lockout", "account-delete-cooldown-72h"],
      runbookRef: "RB-001",
    },
    failureInjectionPoints: ["auth.signin", "auth.mfa-challenge", "auth.session-issue"],
    dashboardRoute: "/admin/users",
    runbookRef: "RB-001",
    killSwitchBinding: "KS-AUTH",
    goldenPathRef: "GP-AUTH-PULSE",
    deploymentCriticality: "critical",
  },
  onboarding: {
    familyId: "onboarding",
    owner: "onboarding-service",
    intent: "Guide new users through setup, checkpoint persistence, and first-win activation",
    scope: "onboarding_checkpoints, onboarding_branch_selections",
    stepIds: ["onboard.start", "onboard.checkpoint", "onboard.branch-select", "onboard.resume", "onboard.first-win", "onboard.complete"],
    evidenceSources: ["onboarding_checkpoints", "onboarding_branch_selections"],
    replayable: true,
    rollbackSemantics: {
      reversibleSteps: ["onboard.checkpoint", "onboard.branch-select"],
      irreversibleSteps: ["onboard.complete"],
      compensatingActions: { "onboard.checkpoint": "reset-to-previous-checkpoint" },
      escalationRules: ["stuck-user-after-48h"],
      runbookRef: "RB-002",
    },
    failureInjectionPoints: ["onboard.checkpoint", "onboard.branch-select"],
    dashboardRoute: "/admin/onboarding",
    runbookRef: "RB-002",
    killSwitchBinding: null,
    goldenPathRef: "GP-ONBOARDING",
    deploymentCriticality: "important",
  },
  "app-lifecycle": {
    familyId: "app-lifecycle",
    owner: "app-lifecycle-manager",
    intent: "Govern app discovery, install, permission, update, remove, and recovery",
    scope: "app_install_registry, app_permission_ledger",
    stepIds: ["app.discover", "app.install", "app.permission-grant", "app.launch", "app.update", "app.remove", "app.recover"],
    evidenceSources: ["app_install_registry", "app_permission_ledger"],
    replayable: false,
    rollbackSemantics: {
      reversibleSteps: ["app.install", "app.permission-grant", "app.update"],
      irreversibleSteps: ["app.remove"],
      compensatingActions: { "app.install": "uninstall", "app.update": "rollback-version" },
      escalationRules: ["crash-loop-3x-disable"],
      runbookRef: "RB-003",
    },
    failureInjectionPoints: ["app.install", "app.launch", "app.update"],
    dashboardRoute: "/admin/apps",
    runbookRef: "RB-003",
    killSwitchBinding: "KS-APP-INSTALLS",
    goldenPathRef: "GP-APP-LIFECYCLE",
    deploymentCriticality: "critical",
  },
  advisor: {
    familyId: "advisor",
    owner: "advisor-orchestration-service",
    intent: "Manage advisor recommendation through approval, execution, receipt, and rollback",
    scope: "advisor_board_recommendations, advisor_board_actions, advisor_action_queue",
    stepIds: ["advisor.recommend", "advisor.approval-request", "advisor.policy-check", "advisor.execute", "advisor.receipt", "advisor.rollback", "advisor.refusal"],
    evidenceSources: ["advisor_board_actions", "advisor_action_proof_packs", "advisor_board_reflections"],
    replayable: false,
    rollbackSemantics: {
      reversibleSteps: ["advisor.execute"],
      irreversibleSteps: ["advisor.refusal"],
      compensatingActions: { "advisor.execute": "rollback-via-proof-pack" },
      escalationRules: ["high-risk-dual-approval", "budget-exceeded-block"],
      runbookRef: "RB-010",
    },
    failureInjectionPoints: ["advisor.policy-check", "advisor.execute"],
    dashboardRoute: "/admin/ai-engineering",
    runbookRef: "RB-010",
    killSwitchBinding: "KS-AI-ADVISORS",
    goldenPathRef: "GP-ADVISOR-RECOMMEND",
    deploymentCriticality: "critical",
  },
  boardroom: {
    familyId: "boardroom",
    owner: "boardroom-orchestration-service",
    intent: "Strategic decision flow from recommendation through approval, execution, and outcome reconciliation",
    scope: "boardroom_items, boardroom_outcome_records, boardroom_followthrough_dispatches",
    stepIds: ["board.recommend", "board.intake", "board.deliberate", "board.approve", "board.execute", "board.outcome-track", "board.reconcile"],
    evidenceSources: ["boardroom_items", "boardroom_outcome_records", "boardroom_followthrough_dispatches"],
    replayable: false,
    rollbackSemantics: {
      reversibleSteps: ["board.execute"],
      irreversibleSteps: ["board.approve", "board.reconcile"],
      compensatingActions: { "board.execute": "revert-dispatch" },
      escalationRules: ["outcome-missed-7d-escalate"],
      runbookRef: "RB-011",
    },
    failureInjectionPoints: ["board.intake", "board.execute", "board.outcome-track"],
    dashboardRoute: "/boardroom",
    runbookRef: "RB-011",
    killSwitchBinding: "KS-BOARDROOM",
    goldenPathRef: "GP-BOARDROOM",
    deploymentCriticality: "critical",
  },
  payment: {
    familyId: "payment",
    owner: "payment-service",
    intent: "Authorize, settle, receipt, and handle disputes/recovery for payments",
    scope: "payment_transactions, receipts",
    stepIds: ["pay.auth", "pay.settle", "pay.receipt", "pay.mismatch-detect", "pay.dispute", "pay.recovery"],
    evidenceSources: ["payment_transactions", "receipts", "compliance_evidence"],
    replayable: false,
    rollbackSemantics: {
      reversibleSteps: ["pay.auth"],
      irreversibleSteps: ["pay.settle", "pay.receipt"],
      compensatingActions: { "pay.auth": "void-authorization", "pay.settle": "initiate-refund" },
      escalationRules: ["dispute-auto-escalate", "settlement-mismatch-block"],
      runbookRef: "RB-005",
    },
    failureInjectionPoints: ["pay.auth", "pay.settle", "pay.mismatch-detect"],
    dashboardRoute: "/admin/payments",
    runbookRef: "RB-005",
    killSwitchBinding: "KS-PAYMENTS",
    goldenPathRef: "GP-PAYMENT",
    deploymentCriticality: "critical",
  },
  "crm-connector": {
    familyId: "crm-connector",
    owner: "connector-sync-service",
    intent: "CRM data ingestion, sync health, retry, conflict detection and resolution",
    scope: "connector_sync_jobs, connector_oauth_flows",
    stepIds: ["crm.ingest", "crm.sync", "crm.retry", "crm.conflict-detect", "crm.conflict-resolve", "crm.health-check"],
    evidenceSources: ["connector_sync_jobs", "connector_oauth_flows"],
    replayable: true,
    rollbackSemantics: {
      reversibleSteps: ["crm.sync"],
      irreversibleSteps: ["crm.conflict-resolve"],
      compensatingActions: { "crm.sync": "revert-to-snapshot" },
      escalationRules: ["sync-failure-3x-disable-connector"],
      runbookRef: "RB-012",
    },
    failureInjectionPoints: ["crm.ingest", "crm.sync", "crm.conflict-detect"],
    dashboardRoute: "/admin/integrations",
    runbookRef: "RB-012",
    killSwitchBinding: "KS-CONNECTORS",
    goldenPathRef: "GP-CONNECTOR-SYNC",
    deploymentCriticality: "important",
  },
  file: {
    familyId: "file",
    owner: "file-processing-service",
    intent: "File upload, parse/process, action trigger, and audit evidence",
    scope: "storage.objects, file_processing_receipts",
    stepIds: ["file.upload", "file.validate", "file.parse", "file.process", "file.action-trigger", "file.audit"],
    evidenceSources: ["file_processing_receipts", "storage.objects"],
    replayable: true,
    rollbackSemantics: {
      reversibleSteps: ["file.upload", "file.process"],
      irreversibleSteps: ["file.action-trigger"],
      compensatingActions: { "file.upload": "delete-object", "file.process": "revert-processed-output" },
      escalationRules: ["malware-detected-quarantine"],
      runbookRef: "RB-013",
    },
    failureInjectionPoints: ["file.upload", "file.parse", "file.process"],
    dashboardRoute: "/admin/files",
    runbookRef: "RB-013",
    killSwitchBinding: "KS-FILE-PROCESSING",
    goldenPathRef: "GP-FILES-AI",
    deploymentCriticality: "important",
  },
  "desktop-recovery": {
    familyId: "desktop-recovery",
    owner: "desktop-host-service",
    intent: "Desktop host failure detection, watchdog trigger, shell restart, and recovery",
    scope: "os_runtime_state, shell_health_checks",
    stepIds: ["desktop.failure-detect", "desktop.watchdog-trigger", "desktop.shell-restart", "desktop.safe-mode", "desktop.recover"],
    evidenceSources: ["os_runtime_state", "shell_health_checks"],
    replayable: false,
    rollbackSemantics: {
      reversibleSteps: ["desktop.shell-restart"],
      irreversibleSteps: ["desktop.safe-mode"],
      compensatingActions: { "desktop.shell-restart": "force-stop-and-restart" },
      escalationRules: ["3x-restart-enter-safe-mode"],
      runbookRef: "RB-014",
    },
    failureInjectionPoints: ["desktop.failure-detect", "desktop.shell-restart"],
    dashboardRoute: "/admin/runtime",
    runbookRef: "RB-014",
    killSwitchBinding: "KS-DESKTOP-HOST",
    goldenPathRef: null,
    deploymentCriticality: "critical",
  },
  "os-recovery": {
    familyId: "os-recovery",
    owner: "os-recovery-service",
    intent: "OS boot, shell launch, safe mode entry, and full recovery lifecycle",
    scope: "os_boot_records, recovery_logs",
    stepIds: ["os.boot", "os.shell-launch", "os.health-check", "os.safe-mode-entry", "os.recovery-attempt", "os.recovery-complete"],
    evidenceSources: ["os_boot_records", "recovery_logs"],
    replayable: false,
    rollbackSemantics: {
      reversibleSteps: ["os.shell-launch"],
      irreversibleSteps: ["os.boot"],
      compensatingActions: { "os.shell-launch": "fallback-to-safe-mode" },
      escalationRules: ["boot-failure-3x-recovery-image"],
      runbookRef: "RB-015",
    },
    failureInjectionPoints: ["os.boot", "os.shell-launch", "os.health-check"],
    dashboardRoute: "/admin/os-health",
    runbookRef: "RB-015",
    killSwitchBinding: null,
    goldenPathRef: null,
    deploymentCriticality: "critical",
  },
  "operator-incident": {
    familyId: "operator-incident",
    owner: "incident-management-service",
    intent: "Operator incident triage, kill-switch activation, remediation, and closure",
    scope: "kill_switch_states, kill_switch_audit_log, incident_records",
    stepIds: ["incident.triage", "incident.classify", "incident.kill-switch", "incident.remediate", "incident.verify", "incident.close"],
    evidenceSources: ["kill_switch_audit_log", "admin_action_audit", "incident_records"],
    replayable: false,
    rollbackSemantics: {
      reversibleSteps: ["incident.kill-switch"],
      irreversibleSteps: ["incident.close"],
      compensatingActions: { "incident.kill-switch": "deactivate-switch" },
      escalationRules: ["critical-incident-dual-approval", "auto-expire-ttl"],
      runbookRef: "RB-016",
    },
    failureInjectionPoints: ["incident.kill-switch", "incident.remediate"],
    dashboardRoute: "/admin/kill-switches",
    runbookRef: "RB-016",
    killSwitchBinding: null,
    goldenPathRef: "GP-KILL-SWITCH",
    deploymentCriticality: "critical",
  },
  "support-bundle": {
    familyId: "support-bundle",
    owner: "support-service",
    intent: "Support bundle generation, escalation, action history, and closure",
    scope: "support_bundles, support_escalations",
    stepIds: ["support.generate-bundle", "support.redact", "support.escalate", "support.action-history", "support.close"],
    evidenceSources: ["support_bundles", "admin_action_audit"],
    replayable: true,
    rollbackSemantics: {
      reversibleSteps: ["support.generate-bundle"],
      irreversibleSteps: ["support.escalate"],
      compensatingActions: { "support.generate-bundle": "regenerate-bundle" },
      escalationRules: ["unresolved-72h-auto-escalate"],
      runbookRef: "RB-017",
    },
    failureInjectionPoints: ["support.generate-bundle", "support.redact"],
    dashboardRoute: "/admin/support",
    runbookRef: "RB-017",
    killSwitchBinding: null,
    goldenPathRef: "GP-SUPPORT-BUNDLE",
    deploymentCriticality: "important",
  },
};

export const WORKFLOW_FAMILY_IDS = Object.keys(WORKFLOW_PROOF_REGISTRY) as WorkflowFamilyId[];

export function getWorkflowFamily(familyId: WorkflowFamilyId): WorkflowFamilyEntry {
  return WORKFLOW_PROOF_REGISTRY[familyId];
}

export function getAllStepIds(): string[] {
  return WORKFLOW_FAMILY_IDS.flatMap(id => WORKFLOW_PROOF_REGISTRY[id].stepIds);
}