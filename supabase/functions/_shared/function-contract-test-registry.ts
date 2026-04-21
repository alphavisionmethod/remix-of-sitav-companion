// ═══════════════════════════════════════════════════════════════
// SITA OS — Function Contract Test Registry
// Maps edge functions to their contract-test families.
// ═══════════════════════════════════════════════════════════════

export type ContractTestFamily =
  | "bff-contract"
  | "admin-gateway-contract"
  | "orchestration-step-contract"
  | "webhook-validation"
  | "runtime-system"
  | "verifier-output"
  | "support-tool"
  | "domain-function";

export interface ContractTestEntry {
  readonly family: ContractTestFamily;
  readonly description: string;
  readonly requiredAssertions: readonly string[];
}

export const CONTRACT_TEST_FAMILY_DEFINITIONS: Record<ContractTestFamily, { description: string; requiredAssertions: readonly string[] }> = {
  "bff-contract": {
    description: "Browser-facing BFF functions — CORS, auth, error shape",
    requiredAssertions: ["cors-preflight", "auth-rejection", "error-shape", "success-shape"],
  },
  "admin-gateway-contract": {
    description: "Admin UI gateway functions — CORS, admin auth, audit trail",
    requiredAssertions: ["cors-preflight", "admin-auth-rejection", "error-shape", "audit-emission"],
  },
  "orchestration-step-contract": {
    description: "Multi-step orchestration — idempotency, replay, receipt",
    requiredAssertions: ["idempotency-key", "replay-safety", "receipt-emission"],
  },
  "webhook-validation": {
    description: "External webhook receivers — signature validation, replay safety",
    requiredAssertions: ["signature-validation", "replay-safety", "error-shape"],
  },
  "runtime-system": {
    description: "Internal system functions — health, heartbeat, probes",
    requiredAssertions: ["health-response", "error-shape"],
  },
  "verifier-output": {
    description: "Truth/proof verification — output shape, evidence structure",
    requiredAssertions: ["output-shape", "evidence-structure"],
  },
  "support-tool": {
    description: "Support/diagnostics functions — auth, redaction, output shape",
    requiredAssertions: ["admin-auth-rejection", "pii-redaction", "output-shape"],
  },
  "domain-function": {
    description: "Domain logic functions — input validation, error shape, receipt",
    requiredAssertions: ["input-validation", "error-shape", "receipt-emission"],
  },
};

/** Maps function name → contract test family. */
export const FUNCTION_CONTRACT_TEST_MAP: Record<string, ContractTestFamily> = {
  // BFF
  "user-bff-gateway": "bff-contract",
  "intelligence-api": "bff-contract",
  "support-gateway": "bff-contract",
  "license-gateway": "bff-contract",
  "app-store-api": "bff-contract",
  "os-agent-channel": "bff-contract",
  // Admin
  "admin-bff-gateway": "admin-gateway-contract",
  "admin-ai-workforce-run": "admin-gateway-contract",
  "admin-users": "admin-gateway-contract",
  "cloud-admin-api": "admin-gateway-contract",
  "cloud-lifecycle-api": "admin-gateway-contract",
  "cloud-tenant-api": "admin-gateway-contract",
  "admin-intelligence": "admin-gateway-contract",
  // Orchestration
  "brain-core": "orchestration-step-contract",
  "advisor-agent-loop": "orchestration-step-contract",
  "agent-executor": "orchestration-step-contract",
  "scheduler-dispatch": "orchestration-step-contract",
  "event-processor": "orchestration-step-contract",
  "self-healing": "orchestration-step-contract",
  // Webhooks
  "payment-webhook": "webhook-validation",
  "connector-webhook-receive": "webhook-validation",
  "stripe-webhook": "webhook-validation",
  // Runtime
  "main": "runtime-system",
  "ai-health": "runtime-system",
  "runtime-probes": "runtime-system",
  "agent-heartbeat": "runtime-system",
  "vapid-public-key": "runtime-system",
  // Verifiers
  "verification-recorder": "verifier-output",
  "production-launch-attestor": "verifier-output",
  "nightly-ai-runtime-verifier": "verifier-output",
  // Support
  "support-bundle": "support-tool",
  "get-weather": "support-tool",
  "seed-user-data": "support-tool",
  // Domain
  "ai-gateway": "domain-function",
  "advisor-conversation": "domain-function",
  "advisor-deep-intelligence": "domain-function",
  "advisor-knowledge-manage": "domain-function",
  "advisor-weekly-report": "domain-function",
  "advisor-avatar-generate": "domain-function",
  "cashflow-calculate": "domain-function",
  "invoice-generate": "domain-function",
  "tax-calculate": "domain-function",
  "payment-process": "domain-function",
  "connector-oauth": "domain-function",
  "connector-sync": "domain-function",
  "connector-health": "domain-function",
  "connector-discover": "domain-function",
  "connector-batch": "domain-function",
  "connector-operations": "domain-function",
  "connector-proxy": "domain-function",
  "connector-transform": "domain-function",
  "file-ai-pipeline": "domain-function",
  "file-operations": "domain-function",
  "file-share": "domain-function",
  "push-dispatch": "domain-function",
  "communications-api": "domain-function",
  "onboarding-flow": "domain-function",
  "gdpr-delete": "domain-function",
  "gdpr-export": "domain-function",
  "cloud-sync-api": "domain-function",
  "cloud-storage-api": "domain-function",
  "cloud-device-api": "domain-function",
  "cloud-worker-api": "domain-function",
  "booking-manage": "domain-function",
  "check-ai-budget": "domain-function",
  "cost-alert": "domain-function",
  "business-advisor-intelligence": "domain-function",
  "business-board-api": "domain-function",
  "chat-advisor": "domain-function",
  "agent-intelligence": "domain-function",
  "agent-signal": "domain-function",
  "agent-scheduler": "domain-function",
  "ambient-os-operations": "domain-function",
};

export function getContractTestFamily(functionName: string): ContractTestFamily | undefined {
  return FUNCTION_CONTRACT_TEST_MAP[functionName];
}

export function getFunctionsInFamily(family: ContractTestFamily): string[] {
  return Object.entries(FUNCTION_CONTRACT_TEST_MAP)
    .filter(([, f]) => f === family)
    .map(([name]) => name);
}