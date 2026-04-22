// ═══════════════════════════════════════════════════════════════
// SITA OS — API Versioning System
// Guarantees backward compatibility for edge function endpoints.
// ═══════════════════════════════════════════════════════════════

export interface ApiVersionEntry {
  readonly functionName: string;
  readonly currentVersion: string;
  readonly minimumVersion: string;
  readonly deprecated: boolean;
  readonly deprecatedAt?: string;
  readonly sunset?: string;
}

// Build registry from the canonical edge function list
const EDGE_FUNCTION_NAMES = [
  "account-delete","admin-ai-workforce-run","admin-api","admin-bff-gateway","admin-gateway",
  "admin-intelligence","admin-reset-user-setup","admin-revoke-session","admin-users",
  "advisor-agent-loop","advisor-avatar-generate","advisor-conversation","advisor-deep-intelligence",
  "advisor-knowledge-manage","advisor-weekly-report","agent-executor","agent-heartbeat",
  "agent-intelligence","agent-scheduler","agent-signal","ai-gateway","ai-health",
  "ai-receipt-completeness-snapshot","ai-runtime-nightly-verify","alert-actions","alert-ingest",
  "alert-route","alert-router","ambient-os-operations","api-gateway","apm-metrics-ingest",
  "app-ingest-pwa","app-ingest-web","app-install","app-launch-resolve","app-manifest-sync",
  "app-manifest-verifier","app-permissions-sync","app-screenshot-capture","app-store-api",
  "app-store-catalog","app-uninstall","app-update-check","attestation-packet-builder",
  "audit-export-bundler","audit-log-export","beta-apply","boardroom-cockpit-telemetry",
  "boardroom-followthrough-dispatch","boardroom-followthrough-sla","boardroom-outcome-record",
  "boardroom-replay","boardroom-session","booking-manage","brain-core",
  "business-advisor-intelligence","business-board-api","canary-chaos-cron","cashflow-calculate",
  "chaos-drill-runner","chat-advisor","check-ai-budget","cloud-admin-api","cloud-device-api",
  "cloud-lifecycle-api","cloud-storage-api","cloud-sync-api","cloud-tenant-api","cloud-worker-api",
  "communications-api","compliance-evidence-collector","compliance-evidence-cron","connector-batch",
  "connector-discover","connector-health","connector-oauth","connector-operations","connector-proxy",
  "connector-reauth-tracker","connector-refresh-nightly-verify","connector-sync",
  "connector-token-refresh","connector-transform","cost-alert","crash-report-ingest","crm-sync",
  "cron-receipt-collector","data-cleanup","data-export","db-introspection","db-truth-introspect",
  "desktop-update-manifest","device-telemetry","digital-twin-engine","dr-drill-cron",
  "dr-drill-executor","dr-drill-runner","ecosystem-operations","error-ingest","escalation-engine",
  "event-processor","evidence-graph-builder","external-workforce-api",
  "external-workforce-webhook-dispatcher","federated-knowledge-aggregator","file-ingestion",
  "gdpr-delete","gdpr-export","generate-support-bundle","get-weather","health-beat","health-check",
  "health-cron","health-live","health-ready","intelligence-api","internal-agent-canary-runner",
  "internal-agent-chaos-scheduler","internal-agent-consensus-engine","internal-agent-cost-optimizer",
  "internal-agent-dependency-scanner","internal-agent-execute-action","internal-agent-loop",
  "internal-agent-policy-architect","internal-agent-reflect","internal-agent-self-healer",
  "internal-agent-slo-evaluator","internal-agent-suggestion-generator",
  "internal-agent-tenant-federation","internal-agent-trust-evaluator","internal-agent-weekly-digest",
  "investment-portfolio-api","investor-request","invoice-generate","kill-switch-state",
  "kill-switch-toggle","license-gateway","main","mobile-deferral-attestor","msa-operations",
  "oauth-refresh-probe","onboarding-branch-tracker","onboarding-resume-checkpoint",
  "os-agent-channel","os-command","os-status","os-update-manifest","owner-copilot-bff",
  "owner-copilot-session-tracker","package-verify","payment-kill-switch","payment-process",
  "personal-brain","press-inquiry","production-launch-attestor","prompt-versioning",
  "provider-family-operations","push-dispatch","push-track","recovery-evidence-ingest",
  "release-artifact-signer","release-artifact-verifier","release-env-gate",
  "release-evidence-graph-snapshot","revenue-caller","routing-policy-update","runbook-drill",
  "runtime-probes","scheduler-dispatch","secret-rotation-orchestrator",
  "security-anomaly-rotation-trigger","security-council-tick","security-fabric-runtime-probe",
  "security-kill-switch-recommender","seed-advisor-registry","seed-connector-registry",
  "seed-user-data","self-healing","simulation-engine-api","sla-evaluator","support-gateway",
  "support-recovery-api","system-updates","tasks-workflow-api","tax-estimate",
  "tenant-self-service-bff","trace-ingest","uptime-rollup","user-bff-gateway","vapid-public-key",
  "verification-recorder","waitlist-signup","waitlist-stats","webauthn-challenge","webhook-ingest",
  "webhook-process","webhook-replay","webhook-retry-processor","workflow-execute","workflow-repair",
  "workflow-replay","workflow-stuck-detector",
] as const;

export const API_VERSION_REGISTRY: readonly ApiVersionEntry[] = EDGE_FUNCTION_NAMES.map(name => ({
  functionName: name,
  currentVersion: "1.0.0",
  minimumVersion: "1.0.0",
  deprecated: false,
}));

export function resolveApiVersion(
  functionName: string,
  requestedVersion?: string,
): string {
  const entry = API_VERSION_REGISTRY.find(e => e.functionName === functionName);
  if (!entry) throw new Error(`Unknown edge function: ${functionName}`);
  const version = requestedVersion ?? entry.currentVersion;
  if (compareVersions(version, entry.minimumVersion) < 0) {
    throw new Error(
      `Version ${version} is below minimum ${entry.minimumVersion} for ${functionName}`,
    );
  }
  return version;
}

export function isVersionDeprecated(functionName: string, _version?: string): boolean {
  const entry = API_VERSION_REGISTRY.find(e => e.functionName === functionName);
  return entry?.deprecated ?? false;
}

export function getVersionHeaders(functionName: string): Record<string, string> {
  const version = resolveApiVersion(functionName);
  return { "X-API-Version": version };
}

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1;
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1;
  }
  return 0;
}

export { EDGE_FUNCTION_NAMES };