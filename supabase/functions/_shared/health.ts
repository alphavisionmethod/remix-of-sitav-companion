// ═══════════════════════════════════════════════════════════════
// SITA OS — Standardized Edge Function Health Response Builder
// Use this in any edge function that exposes a health endpoint.
// ═══════════════════════════════════════════════════════════════

export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  function: string;
  version: string;
  checks: Record<string, boolean>;
  timestamp: string;
}

/**
 * Build a standardized health response for an edge function.
 * @param functionName - The edge function name
 * @param checks - Key-value pairs of health check results
 * @param version - Function version (default "1.0.0")
 */
export function buildHealthResponse(
  functionName: string,
  checks: Record<string, boolean> = {},
  version = "1.0.0",
): HealthResponse {
  const allHealthy = Object.values(checks).every(Boolean);
  const anyHealthy = Object.values(checks).some(Boolean);

  return {
    status: allHealthy ? "healthy" : anyHealthy ? "degraded" : "unhealthy",
    function: functionName,
    version,
    checks,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Return a health Response with correct status code and CORS headers.
 */
export function healthResponse(
  functionName: string,
  checks: Record<string, boolean> = {},
  version = "1.0.0",
): Response {
  const health = buildHealthResponse(functionName, checks, version);
  const status = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;
  return new Response(JSON.stringify(health), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}