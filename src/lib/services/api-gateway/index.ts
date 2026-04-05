// ═══════════════════════════════════════════════════════════════
// SITA OS — API Gateway Service
// Ingress routing, rate limiting, auth validation
// ═══════════════════════════════════════════════════════════════

export interface RouteConfig { path: string; method: string; service: string; handler: string; auth: boolean; rateLimit: number; timeout: number; trustLevel: string; }
export interface RateLimitState { key: string; count: number; windowStart: string; limit: number; remaining: number; }
export interface GatewayRequest { path: string; method: string; headers: Record<string, string>; body?: unknown; userId?: string; ip: string; timestamp: string; }
export interface GatewayResponse { status: number; body: unknown; headers: Record<string, string>; latencyMs: number; routedTo: string; }

export class APIGatewayService {
  private routes: RouteConfig[] = [];
  private rateLimits: Map<string, RateLimitState> = new Map();

  registerRoute(route: RouteConfig): void { this.routes.push(route); }
  removeRoute(path: string, method: string): boolean { const i = this.routes.findIndex(r => r.path === path && r.method === method); if (i >= 0) { this.routes.splice(i, 1); return true; } return false; }

  resolveRoute(path: string, method: string): RouteConfig | undefined { return this.routes.find(r => r.path === path && r.method === method); }

  checkRateLimit(key: string, limit: number): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const state = this.rateLimits.get(key);
    if (!state || now - new Date(state.windowStart).getTime() > 60000) {
      this.rateLimits.set(key, { key, count: 1, windowStart: new Date().toISOString(), limit, remaining: limit - 1 });
      return { allowed: true, remaining: limit - 1 };
    }
    if (state.count >= limit) return { allowed: false, remaining: 0 };
    state.count++;
    state.remaining = limit - state.count;
    return { allowed: true, remaining: state.remaining };
  }

  getRoutes(): RouteConfig[] { return [...this.routes]; }
  getHealth(): { routes: number; rateLimitEntries: number } { return { routes: this.routes.length, rateLimitEntries: this.rateLimits.size }; }
}

export const createAPIGateway = () => new APIGatewayService();
