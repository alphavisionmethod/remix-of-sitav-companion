// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Owner Map
// Team/domain ownership for each function.
//
// Two artifacts live here:
//   1. EDGE_FUNCTION_OWNER_MAP — flat name → team (backwards-compat,
//      consumed by topology validator, table-writer-reader-map,
//      backend-registry completeness, and the topology dashboard).
//   2. EDGE_FUNCTION_OWNERSHIP_MANIFEST — rich per-function record
//      (owner team + on-call + Slack channel + runbookRef + killSwitchRef
//      + CODEOWNERS pattern). Drives the canonical ownership manifest
//      at generated/edge-function-ownership.json and BLOCK gate #26.
//
// Ownership coverage MUST stay 100% (186/186). The companion gate
// scripts/architecture/checks/check-edge-function-ownership-completeness.ts
// will fail the master release roster if any function on disk is missing.
// ═══════════════════════════════════════════════════════════════

export type OwnerTeam =
  | "platform-core"
  | "admin-governance"
  | "advisor-intelligence"
  | "agent-runtime"
  | "ai-engineering"
  | "cloud-infrastructure"
  | "connector-integrations"
  | "finance-engine"
  | "notification-services"
  | "os-kernel"
  | "compliance-security"
  | "user-experience"
  | "app-platform";

export interface EdgeFunctionOwnership {
  ownerTeam: OwnerTeam;
  primaryContact: string;        // GitHub team handle
  escalationContact: string;     // PagerDuty / on-call rotation
  slackChannel: string;          // #team-channel
  runbookRef: string | null;     // RB-XXX from runbook-registry
  killSwitchRef: string | null;  // KS-XXX from kill-switch-registry (if applicable)
  reviewerCodeOwners: string;    // CODEOWNERS team handle
}

interface TeamProfile {
  primaryContact: string;
  escalationContact: string;
  slackChannel: string;
  reviewerCodeOwners: string;
  defaultRunbookRef: string | null;
}

const TEAM_PROFILES: Record<OwnerTeam, TeamProfile> = {
  "platform-core":            { primaryContact: "@sita/platform-core",         escalationContact: "pd:platform-core-oncall",       slackChannel: "#platform-core",         reviewerCodeOwners: "@sita/platform-core",         defaultRunbookRef: "RB-001-PLATFORM-CORE" },
  "admin-governance":         { primaryContact: "@sita/admin-governance",      escalationContact: "pd:admin-governance-oncall",    slackChannel: "#admin-governance",      reviewerCodeOwners: "@sita/admin-governance",      defaultRunbookRef: "RB-002-ADMIN" },
  "advisor-intelligence":     { primaryContact: "@sita/advisor-intelligence",  escalationContact: "pd:advisor-oncall",             slackChannel: "#advisor-intelligence",  reviewerCodeOwners: "@sita/advisor-intelligence",  defaultRunbookRef: "RB-003-ADVISOR" },
  "agent-runtime":            { primaryContact: "@sita/agent-runtime",         escalationContact: "pd:agent-runtime-oncall",       slackChannel: "#agent-runtime",         reviewerCodeOwners: "@sita/agent-runtime",         defaultRunbookRef: "RB-004-AGENT-RUNTIME" },
  "ai-engineering":           { primaryContact: "@sita/ai-engineering",        escalationContact: "pd:ai-engineering-oncall",      slackChannel: "#ai-engineering",        reviewerCodeOwners: "@sita/ai-engineering",        defaultRunbookRef: "RB-006-AI-ENGINEERING" },
  "cloud-infrastructure":     { primaryContact: "@sita/cloud-infrastructure",  escalationContact: "pd:cloud-infra-oncall",         slackChannel: "#cloud-infra",           reviewerCodeOwners: "@sita/cloud-infrastructure",  defaultRunbookRef: "RB-007-CLOUD-INFRA" },
  "connector-integrations":   { primaryContact: "@sita/connector-integrations", escalationContact: "pd:connectors-oncall",         slackChannel: "#connector-integrations", reviewerCodeOwners: "@sita/connector-integrations", defaultRunbookRef: "RB-008-CONNECTORS" },
  "finance-engine":           { primaryContact: "@sita/finance-engine",        escalationContact: "pd:finance-engine-oncall",      slackChannel: "#finance-engine",        reviewerCodeOwners: "@sita/finance-engine",        defaultRunbookRef: "RB-005-AUTH" },
  "notification-services":    { primaryContact: "@sita/notification-services", escalationContact: "pd:notifications-oncall",       slackChannel: "#notification-services", reviewerCodeOwners: "@sita/notification-services", defaultRunbookRef: "RB-009-NOTIFICATIONS" },
  "os-kernel":                { primaryContact: "@sita/os-kernel",             escalationContact: "pd:os-kernel-oncall",           slackChannel: "#os-kernel",             reviewerCodeOwners: "@sita/os-kernel",             defaultRunbookRef: "RB-010-OS-KERNEL" },
  "compliance-security":      { primaryContact: "@sita/compliance-security",   escalationContact: "pd:security-oncall",            slackChannel: "#compliance-security",   reviewerCodeOwners: "@sita/compliance-security",   defaultRunbookRef: "RB-011-SECURITY" },
  "user-experience":          { primaryContact: "@sita/user-experience",       escalationContact: "pd:user-experience-oncall",     slackChannel: "#user-experience",       reviewerCodeOwners: "@sita/user-experience",       defaultRunbookRef: "RB-012-USER-EXPERIENCE" },
  "app-platform":             { primaryContact: "@sita/app-platform",          escalationContact: "pd:app-platform-oncall",        slackChannel: "#app-platform",          reviewerCodeOwners: "@sita/app-platform",          defaultRunbookRef: "RB-013-APP-PLATFORM" },
};

// ── Auto-generated entries (moved from TEAM_PROFILES) ──
const _AUTO_OWNER_ENTRIES: Record<string, OwnerTeam> = {
  "account-delete": "platform-core",
  "admin-reset-user-setup": "admin-governance",
  "admin-revoke-session": "admin-governance",
  "ai-receipt-completeness-snapshot": "ai-engineering",
  "ai-runtime-nightly-verify": "ai-engineering",
  "alert-actions": "platform-core",
  "alert-ingest": "platform-core",
  "alert-route": "platform-core",
  "alert-router": "platform-core",
  "apm-metrics-ingest": "platform-core",
  "app-ingest-pwa": "app-platform",
  "app-ingest-web": "app-platform",
  "app-install": "app-platform",
  "app-launch-resolve": "app-platform",
  "app-manifest-sync": "app-platform",
  "app-manifest-verifier": "app-platform",
  "app-permissions-sync": "app-platform",
  "app-screenshot-capture": "app-platform",
  "app-store-catalog": "app-platform",
  "app-uninstall": "app-platform",
  "app-update-check": "app-platform",
  "attestation-packet-builder": "platform-core",
  "audit-export-bundler": "compliance-security",
  "audit-log-export": "compliance-security",
  "beta-apply": "platform-core",
  "boardroom-cockpit-telemetry": "advisor-intelligence",
  "boardroom-followthrough-dispatch": "advisor-intelligence",
  "boardroom-followthrough-sla": "advisor-intelligence",
  "boardroom-outcome-record": "advisor-intelligence",
  "boardroom-replay": "advisor-intelligence",
  "boardroom-session": "advisor-intelligence",
  "canary-chaos-cron": "platform-core",
  "chaos-drill-runner": "platform-core",
  "compliance-evidence-collector": "compliance-security",
  "compliance-evidence-cron": "platform-core",
  "connector-reauth-tracker": "connector-integrations",
  "connector-refresh-nightly-verify": "connector-integrations",
  "connector-token-refresh": "connector-integrations",
  "crash-report-ingest": "platform-core",
  "cron-receipt-collector": "platform-core",
  "data-cleanup": "platform-core",
  "data-export": "platform-core",
  "db-introspection": "platform-core",
  "desktop-update-manifest": "platform-core",
  "dr-drill-cron": "platform-core",
  "dr-drill-executor": "platform-core",
  "dr-drill-runner": "platform-core",
  "error-ingest": "platform-core",
  "escalation-engine": "platform-core",
  "evidence-graph-builder": "compliance-security",
  "external-workforce-api": "platform-core",
  "external-workforce-webhook-dispatcher": "platform-core",
  "federated-knowledge-aggregator": "platform-core",
  "generate-support-bundle": "platform-core",
  "health-beat": "platform-core",
  "health-cron": "platform-core",
  "health-live": "platform-core",
  "health-ready": "platform-core",
  "internal-agent-canary-runner": "agent-runtime",
  "internal-agent-chaos-scheduler": "agent-runtime",
  "internal-agent-consensus-engine": "agent-runtime",
  "internal-agent-cost-optimizer": "agent-runtime",
  "internal-agent-dependency-scanner": "agent-runtime",
  "internal-agent-execute-action": "agent-runtime",
  "internal-agent-loop": "agent-runtime",
  "internal-agent-policy-architect": "agent-runtime",
  "internal-agent-reflect": "agent-runtime",
  "internal-agent-self-healer": "agent-runtime",
  "internal-agent-slo-evaluator": "agent-runtime",
  "internal-agent-suggestion-generator": "agent-runtime",
  "internal-agent-tenant-federation": "agent-runtime",
  "internal-agent-trust-evaluator": "agent-runtime",
  "internal-agent-weekly-digest": "agent-runtime",
  "investor-request": "platform-core",
  "kill-switch-state": "admin-governance",
  "kill-switch-toggle": "admin-governance",
  "mobile-deferral-attestor": "platform-core",
  "oauth-refresh-probe": "connector-integrations",
  "onboarding-branch-tracker": "user-experience",
  "onboarding-resume-checkpoint": "user-experience",
  "os-update-manifest": "platform-core",
  "owner-copilot-bff": "user-experience",
  "owner-copilot-session-tracker": "user-experience",
  "package-verify": "platform-core",
  "press-inquiry": "platform-core",
  "production-launch-attestor": "platform-core",
  "prompt-versioning": "platform-core",
  "recovery-evidence-ingest": "compliance-security",
  "release-artifact-signer": "platform-core",
  "release-artifact-verifier": "platform-core",
  "release-env-gate": "platform-core",
  "release-evidence-graph-snapshot": "platform-core",
  "routing-policy-update": "platform-core",
  "runbook-drill": "platform-core",
  "secret-rotation-orchestrator": "compliance-security",
  "security-anomaly-rotation-trigger": "compliance-security",
  "security-council-tick": "compliance-security",
  "security-fabric-runtime-probe": "platform-core",
  "security-kill-switch-recommender": "admin-governance",
  "seed-advisor-registry": "advisor-intelligence",
  "seed-connector-registry": "connector-integrations",
  "sla-evaluator": "platform-core",
  "support-recovery-api": "compliance-security",
  "tenant-self-service-bff": "user-experience",
  "trace-ingest": "platform-core",
  "uptime-rollup": "platform-core",
  "waitlist-signup": "platform-core",
  "waitlist-stats": "platform-core",
  "webauthn-challenge": "compliance-security",
  "webhook-ingest": "platform-core",
  "webhook-process": "platform-core",
  "webhook-replay": "platform-core",
  "webhook-retry-processor": "platform-core",
  "workflow-execute": "platform-core",
  "workflow-repair": "platform-core",
  "workflow-replay": "platform-core",
  "workflow-stuck-detector": "platform-core",
};

// ── Flat name → team (back-compat surface) ─────────────────────────────────
export const EDGE_FUNCTION_OWNER_MAP: Record<string, OwnerTeam> = {
  // Pre-existing 85 (unchanged)
  "admin-ai-workforce-run": "admin-governance",
  "admin-api": "admin-governance",
  "admin-bff-gateway": "admin-governance",
  "admin-gateway": "admin-governance",
  "admin-intelligence": "admin-governance",
  "admin-users": "admin-governance",
  "advisor-agent-loop": "advisor-intelligence",
  "advisor-avatar-generate": "advisor-intelligence",
  "advisor-conversation": "advisor-intelligence",
  "advisor-deep-intelligence": "advisor-intelligence",
  "advisor-knowledge-manage": "advisor-intelligence",
  "advisor-weekly-report": "advisor-intelligence",
  "agent-executor": "agent-runtime",
  "agent-heartbeat": "agent-runtime",
  "agent-intelligence": "agent-runtime",
  "agent-scheduler": "agent-runtime",
  "agent-signal": "agent-runtime",
  "ai-gateway": "ai-engineering",
  "ai-health": "ai-engineering",
  "check-ai-budget": "ai-engineering",
  "ambient-os-operations": "os-kernel",
  "api-gateway": "platform-core",
  "app-store-api": "user-experience",
  "booking-manage": "user-experience",
  "brain-core": "ai-engineering",
  "business-advisor-intelligence": "advisor-intelligence",
  "business-board-api": "advisor-intelligence",
  "cashflow-calculate": "finance-engine",
  "chat-advisor": "advisor-intelligence",
  "cloud-admin-api": "cloud-infrastructure",
  "cloud-device-api": "cloud-infrastructure",
  "cloud-lifecycle-api": "cloud-infrastructure",
  "cloud-storage-api": "cloud-infrastructure",
  "cloud-sync-api": "cloud-infrastructure",
  "cloud-tenant-api": "cloud-infrastructure",
  "cloud-worker-api": "cloud-infrastructure",
  "communications-api": "user-experience",
  "connector-batch": "connector-integrations",
  "connector-discover": "connector-integrations",
  "connector-health": "connector-integrations",
  "connector-oauth": "connector-integrations",
  "connector-operations": "connector-integrations",
  "connector-proxy": "connector-integrations",
  "connector-sync": "connector-integrations",
  "connector-transform": "connector-integrations",
  "cost-alert": "finance-engine",
  "crm-sync": "connector-integrations",
  "db-truth-introspect": "platform-core",
  "device-telemetry": "cloud-infrastructure",
  "digital-twin-engine": "ai-engineering",
  "ecosystem-operations": "platform-core",
  "event-processor": "platform-core",
  "file-ingestion": "platform-core",
  "gdpr-delete": "compliance-security",
  "gdpr-export": "compliance-security",
  "get-weather": "user-experience",
  "health-check": "platform-core",
  "intelligence-api": "ai-engineering",
  "investment-portfolio-api": "finance-engine",
  "invoice-generate": "finance-engine",
  "license-gateway": "user-experience",
  "main": "platform-core",
  "msa-operations": "finance-engine",
  "os-agent-channel": "os-kernel",
  "os-command": "os-kernel",
  "os-status": "os-kernel",
  "payment-kill-switch": "finance-engine",
  "payment-process": "finance-engine",
  "personal-brain": "ai-engineering",
  "provider-family-operations": "connector-integrations",
  "push-dispatch": "notification-services",
  "push-track": "notification-services",
  "revenue-caller": "finance-engine",
  "runtime-probes": "os-kernel",
  "scheduler-dispatch": "platform-core",
  "seed-user-data": "platform-core",
  "self-healing": "os-kernel",
  "simulation-engine-api": "ai-engineering",
  "support-gateway": "user-experience",
  "system-updates": "os-kernel",
  "tasks-workflow-api": "user-experience",
  "tax-estimate": "finance-engine",
  "user-bff-gateway": "user-experience",
  "vapid-public-key": "notification-services",
  "verification-recorder": "compliance-security",

  // ── 101 backfilled entries (2026-04-20) ──────────────────────────────────

  // compliance-security (24)
  "account-delete": "compliance-security",
  "audit-export-bundler": "compliance-security",
  "audit-log-export": "compliance-security",
  "evidence-graph-builder": "compliance-security",
  "attestation-packet-builder": "compliance-security",
  "secret-rotation-orchestrator": "compliance-security",
  "security-anomaly-rotation-trigger": "compliance-security",
  "security-council-tick": "compliance-security",
  "security-fabric-runtime-probe": "compliance-security",
  "security-kill-switch-recommender": "compliance-security",
  "webauthn-challenge": "compliance-security",
  "kill-switch-state": "compliance-security",
  "kill-switch-toggle": "compliance-security",
  "runbook-drill": "compliance-security",
  "dr-drill-cron": "compliance-security",
  "dr-drill-executor": "compliance-security",
  "dr-drill-runner": "compliance-security",
  "canary-chaos-cron": "compliance-security",
  "compliance-evidence-collector": "compliance-security",
  "compliance-evidence-cron": "compliance-security",
  "release-artifact-signer": "compliance-security",
  "release-artifact-verifier": "compliance-security",
  "release-evidence-graph-snapshot": "compliance-security",
  "mobile-deferral-attestor": "compliance-security",

  // app-platform (14)
  "app-install": "app-platform",
  "app-uninstall": "app-platform",
  "app-launch-resolve": "app-platform",
  "app-manifest-sync": "app-platform",
  "app-manifest-verifier": "app-platform",
  "app-permissions-sync": "app-platform",
  "app-screenshot-capture": "app-platform",
  "app-store-catalog": "app-platform",
  "app-update-check": "app-platform",
  "app-ingest-pwa": "app-platform",
  "app-ingest-web": "app-platform",
  "package-verify": "app-platform",
  "desktop-update-manifest": "app-platform",
  "os-update-manifest": "app-platform",

  // agent-runtime (15 internal-agent-*)
  "internal-agent-canary-runner": "agent-runtime",
  "internal-agent-chaos-scheduler": "agent-runtime",
  "internal-agent-consensus-engine": "agent-runtime",
  "internal-agent-cost-optimizer": "agent-runtime",
  "internal-agent-dependency-scanner": "agent-runtime",
  "internal-agent-execute-action": "agent-runtime",
  "internal-agent-loop": "agent-runtime",
  "internal-agent-policy-architect": "agent-runtime",
  "internal-agent-reflect": "agent-runtime",
  "internal-agent-self-healer": "agent-runtime",
  "internal-agent-slo-evaluator": "agent-runtime",
  "internal-agent-suggestion-generator": "agent-runtime",
  "internal-agent-tenant-federation": "agent-runtime",
  "internal-agent-trust-evaluator": "agent-runtime",
  "internal-agent-weekly-digest": "agent-runtime",

  // notification-services (4)
  "alert-actions": "notification-services",
  "alert-ingest": "notification-services",
  "alert-route": "notification-services",
  "alert-router": "notification-services",

  // platform-core (25)
  "health-beat": "platform-core",
  "health-cron": "platform-core",
  "health-live": "platform-core",
  "health-ready": "platform-core",
  "error-ingest": "platform-core",
  "crash-report-ingest": "platform-core",
  "trace-ingest": "platform-core",
  "uptime-rollup": "platform-core",
  "cron-receipt-collector": "platform-core",
  "data-cleanup": "platform-core",
  "data-export": "platform-core",
  "prompt-versioning": "platform-core",
  "routing-policy-update": "platform-core",
  "oauth-refresh-probe": "platform-core",
  "webhook-ingest": "platform-core",
  "webhook-process": "platform-core",
  "webhook-replay": "platform-core",
  "webhook-retry-processor": "platform-core",
  "workflow-execute": "platform-core",
  "workflow-repair": "platform-core",
  "workflow-replay": "platform-core",
  "workflow-stuck-detector": "platform-core",
  "tenant-self-service-bff": "platform-core",
  "external-workforce-api": "platform-core",
  "external-workforce-webhook-dispatcher": "platform-core",

  // ai-engineering (2)
  "ai-receipt-completeness-snapshot": "ai-engineering",
  "ai-runtime-nightly-verify": "ai-engineering",

  // connector-integrations (3)
  "connector-reauth-tracker": "connector-integrations",
  "connector-refresh-nightly-verify": "connector-integrations",
  "connector-token-refresh": "connector-integrations",

  // user-experience (11)
  "boardroom-cockpit-telemetry": "user-experience",
  "boardroom-followthrough-dispatch": "user-experience",
  "boardroom-followthrough-sla": "user-experience",
  "boardroom-outcome-record": "user-experience",
  "boardroom-replay": "user-experience",
  "boardroom-session": "user-experience",
  "onboarding-branch-tracker": "user-experience",
  "onboarding-resume-checkpoint": "user-experience",
  "owner-copilot-bff": "user-experience",
  "owner-copilot-session-tracker": "user-experience",
  "seed-advisor-registry": "user-experience",
  "seed-connector-registry": "user-experience",

  // compliance-security extras pulled from late additions
  "production-launch-attestor": "compliance-security",
  "federated-knowledge-aggregator": "compliance-security",
  // Public-surface intake endpoints
  "beta-apply": "user-experience",
  "investor-request": "user-experience",
  "press-inquiry": "user-experience",
  "waitlist-signup": "user-experience",
  "waitlist-stats": "user-experience",
  // Recovery / disaster-recovery evidence pipeline
  "recovery-evidence-ingest": "compliance-security",
} as const;

// ── Per-function runbook + kill-switch overrides ───────────────────────────
// (Only entries that deviate from the team's defaultRunbookRef or that link
// to a real kill switch from src/lib/kill-switch/kill-switch-registry.ts.)
const FUNCTION_OVERRIDES: Record<string, { runbookRef?: string | null; killSwitchRef?: string | null }> = {
  "payment-kill-switch":              { killSwitchRef: "KS-PAYMENTS-AUTH",   runbookRef: "RB-005-AUTH" },
  "payment-process":                  { killSwitchRef: "KS-PAYMENTS-AUTH",   runbookRef: "RB-005-AUTH" },
  "kill-switch-state":                { killSwitchRef: "KS-PLATFORM-GLOBAL", runbookRef: "RB-011-SECURITY" },
  "kill-switch-toggle":               { killSwitchRef: "KS-PLATFORM-GLOBAL", runbookRef: "RB-011-SECURITY" },
  "ai-gateway":                       { killSwitchRef: "KS-AI-GATEWAY",      runbookRef: "RB-006-AI-ENGINEERING" },
  "ai-health":                        { killSwitchRef: "KS-AI-GATEWAY",      runbookRef: "RB-006-AI-ENGINEERING" },
  "agent-executor":                   { killSwitchRef: "KS-AGENT-RUNTIME",   runbookRef: "RB-004-AGENT-RUNTIME" },
  "workflow-execute":                 { killSwitchRef: "KS-WORKFLOW",        runbookRef: "RB-001-PLATFORM-CORE" },
  "workflow-repair":                  { killSwitchRef: "KS-WORKFLOW",        runbookRef: "RB-001-PLATFORM-CORE" },
  "workflow-replay":                  { killSwitchRef: "KS-WORKFLOW",        runbookRef: "RB-001-PLATFORM-CORE" },
  "workflow-stuck-detector":          { killSwitchRef: "KS-WORKFLOW",        runbookRef: "RB-001-PLATFORM-CORE" },
  "connector-oauth":                  { killSwitchRef: "KS-CONNECTORS",      runbookRef: "RB-008-CONNECTORS" },
  "connector-token-refresh":          { killSwitchRef: "KS-CONNECTORS",      runbookRef: "RB-008-CONNECTORS" },
  "secret-rotation-orchestrator":     { killSwitchRef: "KS-SECRET-ROTATION", runbookRef: "RB-011-SECURITY" },
  "release-artifact-signer":          { killSwitchRef: "KS-RELEASE",         runbookRef: "RB-011-SECURITY" },
  "release-artifact-verifier":        { killSwitchRef: "KS-RELEASE",         runbookRef: "RB-011-SECURITY" },
  "push-dispatch":                    { killSwitchRef: "KS-NOTIFICATIONS",   runbookRef: "RB-009-NOTIFICATIONS" },
  "alert-router":                     { killSwitchRef: "KS-NOTIFICATIONS",   runbookRef: "RB-009-NOTIFICATIONS" },
};

// ── Rich per-function ownership manifest (computed from owner map + overrides)
function buildOwnershipManifest(): Record<string, EdgeFunctionOwnership> {
  const out: Record<string, EdgeFunctionOwnership> = {};
  for (const [fn, team] of Object.entries(EDGE_FUNCTION_OWNER_MAP)) {
    const profile = TEAM_PROFILES[team];
    const override = FUNCTION_OVERRIDES[fn] || {};
    out[fn] = {
      ownerTeam: team,
      primaryContact: profile.primaryContact,
      escalationContact: profile.escalationContact,
      slackChannel: profile.slackChannel,
      runbookRef: override.runbookRef !== undefined ? override.runbookRef : profile.defaultRunbookRef,
      killSwitchRef: override.killSwitchRef ?? null,
      reviewerCodeOwners: profile.reviewerCodeOwners,
    };
  }
  return out;
}

export const EDGE_FUNCTION_OWNERSHIP_MANIFEST: Readonly<Record<string, EdgeFunctionOwnership>> =
  Object.freeze(buildOwnershipManifest());

// ── Public helpers ─────────────────────────────────────────────────────────
export function getOwnerForFunction(name: string): OwnerTeam | undefined {
  return EDGE_FUNCTION_OWNER_MAP[name];
}

export function getOwnershipManifestEntry(name: string): EdgeFunctionOwnership | undefined {
  return EDGE_FUNCTION_OWNERSHIP_MANIFEST[name];
}

export function getFunctionsByOwner(owner: OwnerTeam): string[] {
  return Object.entries(EDGE_FUNCTION_OWNER_MAP)
    .filter(([, o]) => o === owner)
    .map(([name]) => name);
}

export function getOwnerCounts(): Record<OwnerTeam, number> {
  const counts = {} as Record<OwnerTeam, number>;
  for (const owner of Object.values(EDGE_FUNCTION_OWNER_MAP)) {
    counts[owner] = (counts[owner] || 0) + 1;
  }
  return counts;
}

export function getAllOwnerTeams(): OwnerTeam[] {
  return Object.keys(TEAM_PROFILES) as OwnerTeam[];
}

export function getTeamProfile(team: OwnerTeam): TeamProfile {
  return TEAM_PROFILES[team];
}
