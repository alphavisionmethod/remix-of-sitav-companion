// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Lifecycle Registry
// Maps ~45 canonical services with boot order, dependencies,
// restart policy, and health-check intervals
// ═══════════════════════════════════════════════════════════════

export type ServiceStatus = "registered" | "booting" | "healthy" | "degraded" | "failed" | "stopped" | "draining";
export type RestartPolicy = "always" | "on-failure" | "never" | "manual";
export type ServiceDomain = "platform" | "business" | "finance" | "concierge" | "ai" | "admin" | "security" | "integration";

export interface ServiceLifecycleEntry {
  readonly serviceId: string;
  readonly displayName: string;
  readonly domain: ServiceDomain;
  readonly bootOrder: number;
  readonly dependencies: readonly string[];
  readonly restartPolicy: RestartPolicy;
  readonly healthCheckIntervalMs: number;
  readonly maxRestartAttempts: number;
  readonly gracefulShutdownMs: number;
  readonly critical: boolean;
  readonly killSwitchTarget: string | null;
  readonly description: string;
}

export const SERVICE_LIFECYCLE_REGISTRY: readonly ServiceLifecycleEntry[] = [
  // ── Platform / Kernel (boot order 1-10) ──────────────────────
  { serviceId: "auth-service", displayName: "Auth Service", domain: "platform", bootOrder: 1, dependencies: [], restartPolicy: "always", healthCheckIntervalMs: 5000, maxRestartAttempts: 5, gracefulShutdownMs: 3000, critical: true, killSwitchTarget: null, description: "Supabase auth session management and token refresh" },
  { serviceId: "config-service", displayName: "Config Service", domain: "platform", bootOrder: 2, dependencies: ["auth-service"], restartPolicy: "always", healthCheckIntervalMs: 30000, maxRestartAttempts: 3, gracefulShutdownMs: 1000, critical: true, killSwitchTarget: null, description: "Runtime configuration and feature flags" },
  { serviceId: "trust-engine", displayName: "Trust Engine", domain: "security", bootOrder: 3, dependencies: ["auth-service", "config-service"], restartPolicy: "always", healthCheckIntervalMs: 10000, maxRestartAttempts: 5, gracefulShutdownMs: 2000, critical: true, killSwitchTarget: null, description: "Trust zone validation and device attestation" },
  { serviceId: "policy-engine", displayName: "Policy Engine", domain: "security", bootOrder: 4, dependencies: ["auth-service", "config-service", "trust-engine"], restartPolicy: "always", healthCheckIntervalMs: 15000, maxRestartAttempts: 3, gracefulShutdownMs: 2000, critical: true, killSwitchTarget: null, description: "Unified policy evaluation and enforcement" },
  { serviceId: "event-bus", displayName: "Event Bus", domain: "platform", bootOrder: 5, dependencies: ["config-service"], restartPolicy: "always", healthCheckIntervalMs: 5000, maxRestartAttempts: 5, gracefulShutdownMs: 5000, critical: true, killSwitchTarget: null, description: "In-process event distribution and subscription" },
  { serviceId: "storage-service", displayName: "Storage Service", domain: "platform", bootOrder: 6, dependencies: ["auth-service", "config-service"], restartPolicy: "always", healthCheckIntervalMs: 15000, maxRestartAttempts: 3, gracefulShutdownMs: 3000, critical: true, killSwitchTarget: null, description: "Supabase storage, IndexedDB, localStorage abstraction" },
  { serviceId: "audit-service", displayName: "Audit Service", domain: "security", bootOrder: 7, dependencies: ["auth-service", "storage-service"], restartPolicy: "always", healthCheckIntervalMs: 30000, maxRestartAttempts: 3, gracefulShutdownMs: 5000, critical: true, killSwitchTarget: null, description: "Immutable hash-chained audit trail" },
  { serviceId: "kill-switch-service", displayName: "Kill Switch Service", domain: "platform", bootOrder: 8, dependencies: ["config-service", "event-bus"], restartPolicy: "always", healthCheckIntervalMs: 5000, maxRestartAttempts: 5, gracefulShutdownMs: 1000, critical: true, killSwitchTarget: null, description: "Emergency subsystem shutdown control" },
  { serviceId: "health-monitor", displayName: "Health Monitor", domain: "platform", bootOrder: 9, dependencies: ["event-bus", "config-service"], restartPolicy: "always", healthCheckIntervalMs: 10000, maxRestartAttempts: 3, gracefulShutdownMs: 2000, critical: true, killSwitchTarget: null, description: "Service health aggregation and alerting" },
  { serviceId: "telemetry-service", displayName: "Telemetry Service", domain: "platform", bootOrder: 10, dependencies: ["event-bus", "auth-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 5000, critical: false, killSwitchTarget: null, description: "Usage analytics and performance metrics" },

  // ── AI Layer (boot order 11-18) ──────────────────────────────
  { serviceId: "ai-gateway", displayName: "AI Gateway", domain: "ai", bootOrder: 11, dependencies: ["auth-service", "config-service", "policy-engine"], restartPolicy: "always", healthCheckIntervalMs: 10000, maxRestartAttempts: 3, gracefulShutdownMs: 5000, critical: true, killSwitchTarget: "model-providers", description: "Sovereign AI Gateway routing and capability resolution" },
  { serviceId: "ai-budget-service", displayName: "AI Budget Service", domain: "ai", bootOrder: 12, dependencies: ["ai-gateway", "config-service"], restartPolicy: "always", healthCheckIntervalMs: 15000, maxRestartAttempts: 3, gracefulShutdownMs: 2000, critical: true, killSwitchTarget: "model-providers", description: "Token/cost budget tracking and enforcement" },
  { serviceId: "ai-receipt-service", displayName: "AI Receipt Service", domain: "ai", bootOrder: 13, dependencies: ["ai-gateway", "storage-service", "audit-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 3000, critical: false, killSwitchTarget: null, description: "AI inference receipt logging and verification" },
  { serviceId: "epistemic-firewall", displayName: "Epistemic Firewall", domain: "ai", bootOrder: 14, dependencies: ["ai-gateway", "policy-engine"], restartPolicy: "always", healthCheckIntervalMs: 10000, maxRestartAttempts: 3, gracefulShutdownMs: 2000, critical: true, killSwitchTarget: "model-providers", description: "Evidence grading, cite-checking, grounding verification" },
  { serviceId: "prompt-orchestrator", displayName: "Prompt Orchestrator", domain: "ai", bootOrder: 15, dependencies: ["ai-gateway", "config-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 3000, critical: false, killSwitchTarget: "model-providers", description: "Prompt template resolution and chain management" },

  // ── Advisor Layer (boot order 16-20) ─────────────────────────
  { serviceId: "advisor-orchestrator", displayName: "Advisor Orchestrator", domain: "ai", bootOrder: 16, dependencies: ["ai-gateway", "event-bus", "policy-engine"], restartPolicy: "always", healthCheckIntervalMs: 15000, maxRestartAttempts: 3, gracefulShutdownMs: 5000, critical: true, killSwitchTarget: "advisors", description: "Advisor council coordination and escalation" },
  { serviceId: "advisor-memory-service", displayName: "Advisor Memory Service", domain: "ai", bootOrder: 17, dependencies: ["advisor-orchestrator", "storage-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 3000, critical: false, killSwitchTarget: "advisors", description: "Short/long-term advisor memory persistence" },
  { serviceId: "advisor-action-engine", displayName: "Advisor Action Engine", domain: "ai", bootOrder: 18, dependencies: ["advisor-orchestrator", "policy-engine", "audit-service"], restartPolicy: "always", healthCheckIntervalMs: 15000, maxRestartAttempts: 3, gracefulShutdownMs: 5000, critical: true, killSwitchTarget: "advisors", description: "Advisor action queue, approval, and execution" },

  // ── Business Domain (boot order 20-28) ───────────────────────
  { serviceId: "business-health-service", displayName: "Business Health Service", domain: "business", bootOrder: 20, dependencies: ["auth-service", "storage-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 3000, critical: false, killSwitchTarget: null, description: "Business health scoring and trend analysis" },
  { serviceId: "client-service", displayName: "Client Service", domain: "business", bootOrder: 21, dependencies: ["auth-service", "storage-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 3000, critical: false, killSwitchTarget: null, description: "Client/contact management and relationship tracking" },
  { serviceId: "opportunity-service", displayName: "Opportunity Service", domain: "business", bootOrder: 22, dependencies: ["client-service", "business-health-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 3000, critical: false, killSwitchTarget: null, description: "Pipeline and opportunity lifecycle management" },
  { serviceId: "communication-service", displayName: "Communication Service", domain: "business", bootOrder: 23, dependencies: ["auth-service", "client-service", "policy-engine"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 5000, critical: false, killSwitchTarget: "outbound-comms", description: "Email, SMS, and notification orchestration" },
  { serviceId: "document-service", displayName: "Document Service", domain: "business", bootOrder: 24, dependencies: ["storage-service", "auth-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 3000, critical: false, killSwitchTarget: null, description: "Document generation, storage, and versioning" },

  // ── Finance Domain (boot order 29-35) ────────────────────────
  { serviceId: "finance-engine", displayName: "Finance Engine", domain: "finance", bootOrder: 29, dependencies: ["auth-service", "storage-service", "policy-engine"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 5000, critical: false, killSwitchTarget: "payments", description: "Financial calculations, projections, and modeling" },
  { serviceId: "invoice-service", displayName: "Invoice Service", domain: "finance", bootOrder: 30, dependencies: ["finance-engine", "client-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 3000, critical: false, killSwitchTarget: "payments", description: "Invoice generation, tracking, and payment reconciliation" },
  { serviceId: "tax-service", displayName: "Tax Service", domain: "finance", bootOrder: 31, dependencies: ["finance-engine", "epistemic-firewall"], restartPolicy: "on-failure", healthCheckIntervalMs: 60000, maxRestartAttempts: 2, gracefulShutdownMs: 3000, critical: false, killSwitchTarget: null, description: "Tax estimation and compliance with epistemic grounding" },

  // ── Concierge Domain (boot order 36-40) ──────────────────────
  { serviceId: "concierge-orchestrator", displayName: "Concierge Orchestrator", domain: "concierge", bootOrder: 36, dependencies: ["auth-service", "advisor-orchestrator", "client-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 5000, critical: false, killSwitchTarget: null, description: "Concierge service coordination and scheduling" },
  { serviceId: "appointment-service", displayName: "Appointment Service", domain: "concierge", bootOrder: 37, dependencies: ["concierge-orchestrator", "communication-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 3000, critical: false, killSwitchTarget: null, description: "Appointment scheduling and reminder management" },

  // ── Integration Layer (boot order 41-45) ─────────────────────
  { serviceId: "connector-service", displayName: "Connector Service", domain: "integration", bootOrder: 41, dependencies: ["auth-service", "config-service", "policy-engine"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 5000, critical: false, killSwitchTarget: "connectors", description: "OAuth connector lifecycle and sync orchestration" },
  { serviceId: "sync-service", displayName: "Sync Service", domain: "integration", bootOrder: 42, dependencies: ["connector-service", "storage-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 15000, maxRestartAttempts: 3, gracefulShutdownMs: 10000, critical: false, killSwitchTarget: "sync", description: "Bi-directional data sync with external systems" },
  { serviceId: "webhook-service", displayName: "Webhook Service", domain: "integration", bootOrder: 43, dependencies: ["connector-service", "event-bus"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 5000, critical: false, killSwitchTarget: "connectors", description: "Inbound/outbound webhook processing" },
  { serviceId: "push-service", displayName: "Push Notification Service", domain: "integration", bootOrder: 44, dependencies: ["auth-service", "config-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 3000, critical: false, killSwitchTarget: "mobile-push", description: "VAPID web push and mobile push delivery" },

  // ── Admin (boot order 46-48) ─────────────────────────────────
  { serviceId: "admin-session-service", displayName: "Admin Session Service", domain: "admin", bootOrder: 46, dependencies: ["auth-service", "trust-engine", "audit-service"], restartPolicy: "always", healthCheckIntervalMs: 10000, maxRestartAttempts: 5, gracefulShutdownMs: 2000, critical: true, killSwitchTarget: null, description: "Admin session management with MFA and audit" },
  { serviceId: "admin-safety-service", displayName: "Admin Safety Service", domain: "admin", bootOrder: 47, dependencies: ["admin-session-service", "policy-engine", "kill-switch-service"], restartPolicy: "always", healthCheckIntervalMs: 15000, maxRestartAttempts: 3, gracefulShutdownMs: 2000, critical: true, killSwitchTarget: null, description: "Admin action safety classification and confirmation" },
  { serviceId: "boardroom-service", displayName: "Boardroom Service", domain: "admin", bootOrder: 48, dependencies: ["advisor-orchestrator", "admin-session-service", "audit-service"], restartPolicy: "on-failure", healthCheckIntervalMs: 30000, maxRestartAttempts: 2, gracefulShutdownMs: 5000, critical: false, killSwitchTarget: null, description: "Boardroom session, evidence, and decision receipt management" },
] as const;

// ── Query Functions ────────────────────────────────────────────

export function getServiceById(id: string): ServiceLifecycleEntry | undefined {
  return SERVICE_LIFECYCLE_REGISTRY.find((s) => s.serviceId === id);
}

export function getServicesByDomain(domain: ServiceDomain): readonly ServiceLifecycleEntry[] {
  return SERVICE_LIFECYCLE_REGISTRY.filter((s) => s.domain === domain);
}

export function getCriticalServices(): readonly ServiceLifecycleEntry[] {
  return SERVICE_LIFECYCLE_REGISTRY.filter((s) => s.critical);
}

export function getBootOrder(): readonly ServiceLifecycleEntry[] {
  return [...SERVICE_LIFECYCLE_REGISTRY].sort((a, b) => a.bootOrder - b.bootOrder);
}

export function getDependentsOf(serviceId: string): readonly ServiceLifecycleEntry[] {
  return SERVICE_LIFECYCLE_REGISTRY.filter((s) => s.dependencies.includes(serviceId));
}

export function getServicesForKillSwitch(target: string): readonly ServiceLifecycleEntry[] {
  return SERVICE_LIFECYCLE_REGISTRY.filter((s) => s.killSwitchTarget === target);
}

export function validateDependencyChain(): { valid: boolean; errors: string[] } {
  const ids = new Set(SERVICE_LIFECYCLE_REGISTRY.map((s) => s.serviceId));
  const errors: string[] = [];
  for (const svc of SERVICE_LIFECYCLE_REGISTRY) {
    for (const dep of svc.dependencies) {
      if (!ids.has(dep)) errors.push(`${svc.serviceId} depends on unknown service: ${dep}`);
    }
    const depOrders = svc.dependencies.map((d) => getServiceById(d)?.bootOrder ?? 0);
    if (depOrders.some((o) => o >= svc.bootOrder)) {
      errors.push(`${svc.serviceId} boots before one of its dependencies`);
    }
  }
  return { valid: errors.length === 0, errors };
}
