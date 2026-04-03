// ═══════════════════════════════════════════════════════════════
// SITA OS — API Gateway
// HTTP ingress, intent routing, zero-trust guard, rate limiting
// ═══════════════════════════════════════════════════════════════

export type GatewayRequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type GatewayAuthLevel = "public" | "authenticated" | "owner" | "admin";

export interface GatewayRoute {
  path: string;
  method: GatewayRequestMethod;
  targetService: string;
  authLevel: GatewayAuthLevel;
  rateLimit: { maxRequests: number; windowMs: number };
  timeout: number;
}

export interface GatewayRequest {
  id: string;
  method: GatewayRequestMethod;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
  clientIp: string;
  timestamp: number;
}

export interface GatewayResponse {
  requestId: string;
  status: number;
  body: unknown;
  headers: Record<string, string>;
  durationMs: number;
  routedTo: string;
}

export interface RateLimitEntry {
  clientKey: string;
  windowStart: number;
  count: number;
}

// ── API Gateway Service ─────────────────────────────────────────

export class ApiGateway {
  private routes = new Map<string, GatewayRoute>();
  private rateLimits = new Map<string, RateLimitEntry>();
  private requestLog: GatewayRequest[] = [];

  registerRoute(route: GatewayRoute): void {
    const key = `${route.method}:${route.path}`;
    this.routes.set(key, route);
  }

  getRoutes(): GatewayRoute[] {
    return Array.from(this.routes.values());
  }

  resolveRoute(method: GatewayRequestMethod, path: string): GatewayRoute | null {
    // Exact match first
    const exact = this.routes.get(`${method}:${path}`);
    if (exact) return exact;

    // Prefix match
    for (const route of this.routes.values()) {
      if (route.method === method && path.startsWith(route.path)) {
        return route;
      }
    }
    return null;
  }

  checkRateLimit(clientKey: string, route: GatewayRoute): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(`${clientKey}:${route.path}`);

    if (!entry || now - entry.windowStart > route.rateLimit.windowMs) {
      this.rateLimits.set(`${clientKey}:${route.path}`, { clientKey, windowStart: now, count: 1 });
      return true;
    }

    if (entry.count >= route.rateLimit.maxRequests) return false;
    entry.count++;
    return true;
  }

  validateAuth(request: GatewayRequest, route: GatewayRoute): { valid: boolean; reason?: string } {
    if (route.authLevel === "public") return { valid: true };

    const authHeader = request.headers["authorization"];
    if (!authHeader) return { valid: false, reason: "Missing authorization header" };

    if (route.authLevel === "owner" && !authHeader.includes("owner-token")) {
      return { valid: false, reason: "Owner-level access required" };
    }

    if (route.authLevel === "admin" && !authHeader.includes("admin-token")) {
      return { valid: false, reason: "Admin-level access required" };
    }

    return { valid: true };
  }

  async handleRequest(request: GatewayRequest): Promise<GatewayResponse> {
    const start = performance.now();
    this.requestLog.push(request);

    const route = this.resolveRoute(request.method, request.path);
    if (!route) {
      return { requestId: request.id, status: 404, body: { error: "Route not found" }, headers: {}, durationMs: Math.round(performance.now() - start), routedTo: "none" };
    }

    const authResult = this.validateAuth(request, route);
    if (!authResult.valid) {
      return { requestId: request.id, status: 401, body: { error: authResult.reason }, headers: {}, durationMs: Math.round(performance.now() - start), routedTo: route.targetService };
    }

    if (!this.checkRateLimit(request.clientIp, route)) {
      return { requestId: request.id, status: 429, body: { error: "Rate limit exceeded" }, headers: {}, durationMs: Math.round(performance.now() - start), routedTo: route.targetService };
    }

    return {
      requestId: request.id,
      status: 200,
      body: { routed: true, service: route.targetService, path: request.path },
      headers: { "x-routed-to": route.targetService },
      durationMs: Math.round(performance.now() - start),
      routedTo: route.targetService,
    };
  }

  getRequestLog(): GatewayRequest[] {
    return [...this.requestLog];
  }

  getHealth(): { status: "healthy" | "degraded"; routeCount: number; activeRateLimits: number } {
    return {
      status: "healthy",
      routeCount: this.routes.size,
      activeRateLimits: this.rateLimits.size,
    };
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createApiGateway(): ApiGateway {
  const gw = new ApiGateway();

  // Register default routes
  const defaultRoutes: GatewayRoute[] = [
    { path: "/api/v1/intent", method: "POST", targetService: "brain-core", authLevel: "authenticated", rateLimit: { maxRequests: 60, windowMs: 60_000 }, timeout: 30_000 },
    { path: "/api/v1/boardroom", method: "POST", targetService: "boardroom", authLevel: "owner", rateLimit: { maxRequests: 30, windowMs: 60_000 }, timeout: 60_000 },
    { path: "/api/v1/approvals", method: "POST", targetService: "approval-engine", authLevel: "owner", rateLimit: { maxRequests: 30, windowMs: 60_000 }, timeout: 15_000 },
    { path: "/api/v1/connectors", method: "GET", targetService: "connector-control-plane", authLevel: "authenticated", rateLimit: { maxRequests: 120, windowMs: 60_000 }, timeout: 10_000 },
    { path: "/api/v1/memory", method: "GET", targetService: "memory-service", authLevel: "authenticated", rateLimit: { maxRequests: 120, windowMs: 60_000 }, timeout: 10_000 },
    { path: "/api/v1/receipts", method: "GET", targetService: "receipt-service", authLevel: "authenticated", rateLimit: { maxRequests: 120, windowMs: 60_000 }, timeout: 10_000 },
    { path: "/health", method: "GET", targetService: "api-gateway", authLevel: "public", rateLimit: { maxRequests: 300, windowMs: 60_000 }, timeout: 5_000 },
  ];

  defaultRoutes.forEach(r => gw.registerRoute(r));
  return gw;
}
