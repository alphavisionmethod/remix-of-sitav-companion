// ═══════════════════════════════════════════════════════════════
// SITA OS — Client SDK Package
// ═══════════════════════════════════════════════════════════════

export interface SitaClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retries: number;
}

export interface SitaResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  correlationId: string;
  latencyMs: number;
}

export class SitaClient {
  constructor(private config: SitaClientConfig) {}

  async request<T>(method: string, path: string, body?: unknown): Promise<SitaResponse<T>> {
    const start = Date.now();
    const correlationId = crypto.randomUUID();
    try {
      const res = await fetch(`${this.config.baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
          "X-Correlation-ID": correlationId,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(this.config.timeout),
      });
      const data = await res.json();
      return { data, error: null, status: res.status, correlationId, latencyMs: Date.now() - start };
    } catch (e) {
      return { data: null, error: (e as Error).message, status: 0, correlationId, latencyMs: Date.now() - start };
    }
  }

  get<T>(path: string) { return this.request<T>("GET", path); }
  post<T>(path: string, body: unknown) { return this.request<T>("POST", path, body); }
  put<T>(path: string, body: unknown) { return this.request<T>("PUT", path, body); }
  delete<T>(path: string) { return this.request<T>("DELETE", path); }
}

export const createClient = (config: Partial<SitaClientConfig> & Pick<SitaClientConfig, "baseUrl" | "apiKey">): SitaClient =>
  new SitaClient({ timeout: 30000, retries: 3, ...config });

// ── Retry Config ────────────────────────────────────────────

export interface RetryConfig {
  readonly maxRetries: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly backoffMultiplier: number;
  readonly retryableStatuses: number[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 500,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

export const calculateBackoff = (attempt: number, config: RetryConfig = DEFAULT_RETRY_CONFIG): number =>
  Math.min(config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt), config.maxDelayMs);

// ── Circuit Breaker ─────────────────────────────────────────

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreaker {
  readonly serviceId: string;
  readonly state: CircuitState;
  readonly failureCount: number;
  readonly failureThreshold: number;
  readonly resetTimeoutMs: number;
  readonly lastFailureAt?: number;
  readonly lastSuccessAt?: number;
}

export const shouldAllowRequest = (breaker: CircuitBreaker): boolean => {
  if (breaker.state === "closed") return true;
  if (breaker.state === "open" && breaker.lastFailureAt) {
    return Date.now() - breaker.lastFailureAt >= breaker.resetTimeoutMs;
  }
  return breaker.state === "half-open";
};

// ── Rate Limiter ────────────────────────────────────────────

export interface RateLimiter {
  readonly serviceId: string;
  readonly maxRequests: number;
  readonly windowMs: number;
  readonly currentCount: number;
  readonly windowStart: number;
}

export const isRateLimited = (limiter: RateLimiter): boolean => {
  if (Date.now() - limiter.windowStart > limiter.windowMs) return false;
  return limiter.currentCount >= limiter.maxRequests;
};
