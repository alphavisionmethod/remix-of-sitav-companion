// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared demo data: Fleet health services
// Extracted from FleetHealthWidget for boundary compliance
// ═══════════════════════════════════════════════════════════════

export const DEMO_FLEET_SERVICES: Array<{
  id: string; name: string; deps: string[];
  passed: boolean; metrics: { uptimePercent: number; avgLatencyMs: number; p99LatencyMs: number; errorRate: number; requestsPerMinute: number };
}> = [
  { id: "auth-service", name: "Authentication", deps: [] as string[], passed: true, metrics: { uptimePercent: 99.97, avgLatencyMs: 42, p99LatencyMs: 180, errorRate: 0.1, requestsPerMinute: 320 } },
  { id: "advisor-engine", name: "Advisor Engine", deps: ["auth-service"], passed: true, metrics: { uptimePercent: 99.8, avgLatencyMs: 210, p99LatencyMs: 850, errorRate: 0.5, requestsPerMinute: 95 } },
  { id: "canonical-chain", name: "Canonical Chain", deps: ["auth-service"], passed: true, metrics: { uptimePercent: 100, avgLatencyMs: 15, p99LatencyMs: 45, errorRate: 0, requestsPerMinute: 180 } },
  { id: "connector-hub", name: "Connector Hub", deps: [] as string[], passed: false, metrics: { uptimePercent: 94.2, avgLatencyMs: 580, p99LatencyMs: 2400, errorRate: 8.5, requestsPerMinute: 45 } },
  { id: "projection-service", name: "Projections", deps: ["canonical-chain"], passed: true, metrics: { uptimePercent: 99.9, avgLatencyMs: 65, p99LatencyMs: 220, errorRate: 0.2, requestsPerMinute: 150 } },
  { id: "notification-service", name: "Notifications", deps: ["auth-service"], passed: true, metrics: { uptimePercent: 99.5, avgLatencyMs: 120, p99LatencyMs: 400, errorRate: 1.2, requestsPerMinute: 60 } },
  { id: "finance-engine", name: "Finance Engine", deps: ["auth-service", "connector-hub"], passed: false, metrics: { uptimePercent: 96.1, avgLatencyMs: 340, p99LatencyMs: 1800, errorRate: 4.3, requestsPerMinute: 75 } },
  { id: "fleet-orchestrator", name: "Fleet Orchestrator", deps: ["auth-service"], passed: true, metrics: { uptimePercent: 99.99, avgLatencyMs: 8, p99LatencyMs: 25, errorRate: 0, requestsPerMinute: 500 } },
  { id: "ai-gateway", name: "AI Gateway", deps: ["auth-service", "advisor-engine"], passed: true, metrics: { uptimePercent: 99.6, avgLatencyMs: 450, p99LatencyMs: 2100, errorRate: 1.8, requestsPerMinute: 40 } },
  { id: "trust-governor", name: "Trust Governor", deps: ["canonical-chain"], passed: true, metrics: { uptimePercent: 100, avgLatencyMs: 12, p99LatencyMs: 35, errorRate: 0, requestsPerMinute: 200 } },
];

export type DemoFleetService = (typeof DEMO_FLEET_SERVICES)[number];
