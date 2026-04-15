// ═══════════════════════════════════════════════════════════════
// SITA OS — Degraded Mode Integration
// Wires degraded-mode service into the self-healing and
// platform monitoring systems.
// ═══════════════════════════════════════════════════════════════

import {
  degradedModeService,
  type ServiceHealthNode,
  type SystemOperatingMode,
} from "@/lib/services/degraded-mode";

// ── Register core services for health monitoring ──

const CORE_SERVICES: ServiceHealthNode[] = [
  {
    service_id: "ai-gateway",
    display_name: "AI Gateway",
    status: "healthy",
    dependencies: [],
    last_check_at: new Date().toISOString(),
    error_rate_percent: 0,
    latency_p99_ms: 200,
  },
  {
    service_id: "approval-engine",
    display_name: "Approval Engine",
    status: "healthy",
    dependencies: ["database"],
    last_check_at: new Date().toISOString(),
    error_rate_percent: 0,
    latency_p99_ms: 50,
  },
  {
    service_id: "database",
    display_name: "Database",
    status: "healthy",
    dependencies: [],
    last_check_at: new Date().toISOString(),
    error_rate_percent: 0,
    latency_p99_ms: 30,
  },
  {
    service_id: "receipt-service",
    display_name: "Receipt Service",
    status: "healthy",
    dependencies: ["database"],
    last_check_at: new Date().toISOString(),
    error_rate_percent: 0,
    latency_p99_ms: 40,
  },
  {
    service_id: "event-bus",
    display_name: "Event Bus",
    status: "healthy",
    dependencies: [],
    last_check_at: new Date().toISOString(),
    error_rate_percent: 0,
    latency_p99_ms: 10,
  },
  {
    service_id: "trust-governor",
    display_name: "Trust Governor",
    status: "healthy",
    dependencies: ["database", "ai-gateway"],
    last_check_at: new Date().toISOString(),
    error_rate_percent: 0,
    latency_p99_ms: 100,
  },
  {
    service_id: "realtime-gateway",
    display_name: "Realtime Gateway",
    status: "healthy",
    dependencies: ["database"],
    last_check_at: new Date().toISOString(),
    error_rate_percent: 0,
    latency_p99_ms: 20,
  },
];

// ── Register features and their service dependencies ──

const CORE_FEATURES = [
  { feature_id: "boardroom", display_name: "Boardroom", dependent_services: ["ai-gateway", "database", "approval-engine"], available: true, degraded: false },
  { feature_id: "advisor-chat", display_name: "Advisor Chat", dependent_services: ["ai-gateway", "database"], available: true, degraded: false },
  { feature_id: "trust-verification", display_name: "Trust Verification", dependent_services: ["trust-governor", "database"], available: true, degraded: false },
  { feature_id: "approvals", display_name: "Approvals", dependent_services: ["approval-engine", "database", "event-bus"], available: true, degraded: false },
  { feature_id: "receipts", display_name: "Receipt Generation", dependent_services: ["receipt-service", "database"], available: true, degraded: false },
  { feature_id: "realtime-sync", display_name: "Realtime Sync", dependent_services: ["realtime-gateway"], available: true, degraded: false },
  { feature_id: "file-management", display_name: "File Management", dependent_services: ["database"], available: true, degraded: false },
  { feature_id: "digest-journal", display_name: "Digest & Journal", dependent_services: ["ai-gateway", "database"], available: true, degraded: false },
];

export function initializeDegradedMode(): void {
  for (const svc of CORE_SERVICES) {
    degradedModeService.registerService(svc);
  }
  for (const feat of CORE_FEATURES) {
    degradedModeService.registerFeature(feat);
  }
}

export function reportServiceHealth(
  serviceId: string,
  healthy: boolean,
  metrics?: { errorRate: number; latencyP99: number }
): void {
  degradedModeService.updateServiceHealth(
    serviceId,
    healthy ? "healthy" : "degraded",
    metrics ? { error_rate: metrics.errorRate, latency_p99: metrics.latencyP99 } : undefined
  );
}

export function getSystemMode(): SystemOperatingMode {
  return degradedModeService.getCurrentMode();
}

export function isFeatureAvailable(featureId: string): boolean {
  const features = degradedModeService.getFeatureAvailability();
  const feature = features.find(f => f.feature_id === featureId);
  return feature?.available ?? true;
}

// Auto-initialize on import
initializeDegradedMode();
