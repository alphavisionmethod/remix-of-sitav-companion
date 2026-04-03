// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared: Support Diagnostics Service
// ═══════════════════════════════════════════════════════════════

export interface DiagnosticBundleResult {
  id: string;
  generatedAt: string;
  systemHealth: "healthy" | "degraded" | "critical";
  services: ServiceDiagnostic[];
  connectors: ConnectorDiagnostic[];
  recentErrors: ErrorEntry[];
  recommendations: string[];
}

export interface ServiceDiagnostic {
  serviceName: string;
  status: "up" | "degraded" | "down";
  latencyMs: number;
  errorRate: number;
  lastCheck: string;
}

export interface ConnectorDiagnostic {
  connectorId: string;
  provider: string;
  status: "connected" | "stale" | "disconnected" | "error";
  lastSync: string;
  recordsSynced: number;
}

export interface ErrorEntry {
  timestamp: string;
  service: string;
  message: string;
  severity: "warning" | "error" | "critical";
  count: number;
}

export function generateDiagnosticBundle(): DiagnosticBundleResult {
  const services: ServiceDiagnostic[] = [
    { serviceName: "brain-core", status: "up", latencyMs: 45, errorRate: 0.001, lastCheck: new Date().toISOString() },
    { serviceName: "business-os", status: "up", latencyMs: 32, errorRate: 0, lastCheck: new Date().toISOString() },
    { serviceName: "finance-os", status: "up", latencyMs: 28, errorRate: 0, lastCheck: new Date().toISOString() },
    { serviceName: "concierge-os", status: "up", latencyMs: 35, errorRate: 0, lastCheck: new Date().toISOString() },
    { serviceName: "approval-engine", status: "up", latencyMs: 22, errorRate: 0, lastCheck: new Date().toISOString() },
    { serviceName: "receipt-service", status: "up", latencyMs: 18, errorRate: 0, lastCheck: new Date().toISOString() },
    { serviceName: "event-bus", status: "up", latencyMs: 12, errorRate: 0, lastCheck: new Date().toISOString() },
  ];

  const connectors: ConnectorDiagnostic[] = [
    { connectorId: "plaid", provider: "Plaid", status: "connected", lastSync: new Date().toISOString(), recordsSynced: 1250 },
    { connectorId: "google-calendar", provider: "Google", status: "connected", lastSync: new Date().toISOString(), recordsSynced: 85 },
    { connectorId: "stripe", provider: "Stripe", status: "connected", lastSync: new Date().toISOString(), recordsSynced: 430 },
  ];

  const allUp = services.every(s => s.status === "up");
  const anyDown = services.some(s => s.status === "down");

  return {
    id: `diag-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    systemHealth: anyDown ? "critical" : allUp ? "healthy" : "degraded",
    services,
    connectors,
    recentErrors: [],
    recommendations: allUp ? ["All systems nominal"] : ["Investigate degraded services"],
  };
}

export function classifyIncident(error: ErrorEntry): {
  severity: "P1" | "P2" | "P3" | "P4";
  category: string;
  autoHealable: boolean;
} {
  if (error.severity === "critical" && error.count > 5) {
    return { severity: "P1", category: "system-outage", autoHealable: false };
  }
  if (error.severity === "error") {
    return { severity: "P2", category: "service-degradation", autoHealable: true };
  }
  return { severity: error.count > 10 ? "P3" : "P4", category: "minor-issue", autoHealable: true };
}
