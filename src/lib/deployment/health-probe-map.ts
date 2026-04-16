// ═══════════════════════════════════════════════════════════════
// SITA OS — Health Probe Map
// Health check endpoints per deployment unit
// ═══════════════════════════════════════════════════════════════

export type ProbeType = "http" | "tcp" | "exec" | "none";

export interface HealthProbe {
  deploymentUnitId: string;
  probeType: ProbeType;
  endpoint: string | null;
  intervalSeconds: number;
  timeoutSeconds: number;
  failureThreshold: number;
  successThreshold: number;
  expectedStatusCode: number | null;
  expectedBody: string | null;
}

export const HEALTH_PROBES: readonly HealthProbe[] = [
  { deploymentUnitId: "web-frontend", probeType: "http", endpoint: "/", intervalSeconds: 30, timeoutSeconds: 5, failureThreshold: 3, successThreshold: 1, expectedStatusCode: 200, expectedBody: null },
  { deploymentUnitId: "edge-functions", probeType: "http", endpoint: "/functions/v1/health", intervalSeconds: 30, timeoutSeconds: 10, failureThreshold: 3, successThreshold: 1, expectedStatusCode: 200, expectedBody: null },
  { deploymentUnitId: "supabase-db", probeType: "tcp", endpoint: null, intervalSeconds: 30, timeoutSeconds: 5, failureThreshold: 3, successThreshold: 1, expectedStatusCode: null, expectedBody: null },
  { deploymentUnitId: "electron-desktop", probeType: "none", endpoint: null, intervalSeconds: 0, timeoutSeconds: 0, failureThreshold: 0, successThreshold: 0, expectedStatusCode: null, expectedBody: null },
  { deploymentUnitId: "nginx-proxy", probeType: "http", endpoint: "/health", intervalSeconds: 10, timeoutSeconds: 3, failureThreshold: 3, successThreshold: 1, expectedStatusCode: 200, expectedBody: null },
  { deploymentUnitId: "traefik-proxy", probeType: "http", endpoint: "/api/health", intervalSeconds: 10, timeoutSeconds: 3, failureThreshold: 3, successThreshold: 1, expectedStatusCode: 200, expectedBody: null },
  { deploymentUnitId: "kong-gateway", probeType: "http", endpoint: "/status", intervalSeconds: 10, timeoutSeconds: 3, failureThreshold: 3, successThreshold: 1, expectedStatusCode: 200, expectedBody: null },
  { deploymentUnitId: "appliance-iso", probeType: "http", endpoint: "/health", intervalSeconds: 60, timeoutSeconds: 10, failureThreshold: 5, successThreshold: 1, expectedStatusCode: 200, expectedBody: null },
] as const;

export function getHealthProbe(unitId: string): HealthProbe | undefined {
  return HEALTH_PROBES.find((p) => p.deploymentUnitId === unitId);
}

export function getMonitoredUnits(): HealthProbe[] {
  return HEALTH_PROBES.filter((p) => p.probeType !== "none");
}
