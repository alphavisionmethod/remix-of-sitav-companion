// ═══════════════════════════════════════════════════════════════
// SITA OS — Zero Trust Validator
// Request-level authn/authz enforcement, scope validation,
// input schema validation, rate limiting per identity/device/session
// ═══════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────

export type ValidationResult = "allowed" | "denied" | "rate-limited" | "invalid-input" | "auth-required" | "insufficient-scope" | "device-untrusted" | "session-expired";

export interface ZeroTrustRequest {
  requestId: string;
  timestamp: string;
  identity: RequestIdentity;
  action: string;
  resource: string;
  scope: string[];
  input: Record<string, unknown>;
  metadata: RequestMetadata;
}

export interface RequestIdentity {
  userId: string | null;
  serviceId: string | null;
  deviceId: string | null;
  sessionId: string | null;
  trustRing: number;
  authenticated: boolean;
  mfaVerified: boolean;
  tokenClass: "anon" | "user" | "service" | "admin" | "founder";
  tokenIssuedAt: string | null;
  tokenExpiresAt: string | null;
}

export interface RequestMetadata {
  ipAddress: string | null;
  userAgent: string | null;
  origin: string | null;
  correlationId: string | null;
  surface: "api" | "websocket" | "rpc" | "event" | "agent" | "admin" | "mobile";
}

export interface ValidationDecision {
  result: ValidationResult;
  requestId: string;
  timestamp: string;
  checks: ValidationCheck[];
  denyReason: string | null;
  rateLimit: RateLimitInfo | null;
  recommendations: string[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  detail: string;
  severity: "info" | "warning" | "error";
}

export interface RateLimitInfo {
  key: string;
  limit: number;
  remaining: number;
  resetsAt: string;
  retryAfterMs: number;
}

export interface RateLimitPolicy {
  key: string;
  keyExtractor: (req: ZeroTrustRequest) => string;
  limit: number;
  windowMs: number;
  burstLimit: number;
}

export interface AccessRule {
  id: string;
  action: string;
  resource: string;
  requiredTokenClass: RequestIdentity["tokenClass"][];
  requiredScopes: string[];
  requireMfa: boolean;
  maxTrustRing: number;
  requireAuthentication: boolean;
  rateLimitPolicyId: string | null;
  inputSchema: InputSchemaRule | null;
}

export interface InputSchemaRule {
  maxFieldCount: number;
  maxStringLength: number;
  maxDepth: number;
  forbiddenPatterns: RegExp[];
  requiredFields: string[];
}

export interface ZeroTrustMetrics {
  totalRequests: number;
  allowedRequests: number;
  deniedRequests: number;
  rateLimitedRequests: number;
  invalidInputRequests: number;
  byTokenClass: Record<string, number>;
  byAction: Record<string, number>;
  bySurface: Record<string, number>;
}

// ── Rate Limiter ───────────────────────────────────────────────

class TokenBucketLimiter {
  private buckets: Map<string, { tokens: number; lastRefill: number }> = new Map();

  check(key: string, limit: number, windowMs: number, burstLimit: number): RateLimitInfo | null {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket) {
      this.buckets.set(key, { tokens: limit - 1, lastRefill: now });
      return null;
    }

    const elapsed = now - bucket.lastRefill;
    const refillRate = limit / windowMs;
    bucket.tokens = Math.min(burstLimit, bucket.tokens + elapsed * refillRate);
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
      const retryAfterMs = Math.ceil((1 - bucket.tokens) / refillRate);
      return {
        key,
        limit,
        remaining: 0,
        resetsAt: new Date(now + retryAfterMs).toISOString(),
        retryAfterMs,
      };
    }

    bucket.tokens--;
    return null;
  }

  cleanup(): void {
    const cutoff = Date.now() - 600_000;
    for (const [key, bucket] of this.buckets) {
      if (bucket.lastRefill < cutoff) this.buckets.delete(key);
    }
  }
}

// ── Validator ──────────────────────────────────────────────────

export class ZeroTrustValidator {
  private rules: Map<string, AccessRule> = new Map();
  private ratePolicies: Map<string, RateLimitPolicy> = new Map();
  private limiter = new TokenBucketLimiter();
  private decisions: ValidationDecision[] = [];
  private metrics: ZeroTrustMetrics = {
    totalRequests: 0, allowedRequests: 0, deniedRequests: 0,
    rateLimitedRequests: 0, invalidInputRequests: 0,
    byTokenClass: {}, byAction: {}, bySurface: {},
  };
  private readonly maxDecisions = 10_000;

  constructor() {
    this.registerDefaultRules();
    this.registerDefaultRatePolicies();
    // Periodic cleanup
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.limiter.cleanup(), 300_000);
    }
  }

  // ── Core Validation ────────────────────────────────────────

  validate(request: ZeroTrustRequest): ValidationDecision {
    this.metrics.totalRequests++;
    this.metrics.byTokenClass[request.identity.tokenClass] = (this.metrics.byTokenClass[request.identity.tokenClass] ?? 0) + 1;
    this.metrics.byAction[request.action] = (this.metrics.byAction[request.action] ?? 0) + 1;
    this.metrics.bySurface[request.metadata.surface] = (this.metrics.bySurface[request.metadata.surface] ?? 0) + 1;

    const checks: ValidationCheck[] = [];
    const recommendations: string[] = [];

    // 1. Authentication check
    const authCheck = this.checkAuthentication(request);
    checks.push(authCheck);
    if (!authCheck.passed) return this.deny(request, checks, "auth-required", "Authentication required");

    // 2. Session validity
    const sessionCheck = this.checkSession(request);
    checks.push(sessionCheck);
    if (!sessionCheck.passed) return this.deny(request, checks, "session-expired", "Session expired or invalid");

    // 3. Access rule check
    const rule = this.findMatchingRule(request);
    if (rule) {
      // Token class check
      const tokenCheck = this.checkTokenClass(request, rule);
      checks.push(tokenCheck);
      if (!tokenCheck.passed) return this.deny(request, checks, "denied", "Insufficient token class");

      // Scope check
      const scopeCheck = this.checkScopes(request, rule);
      checks.push(scopeCheck);
      if (!scopeCheck.passed) return this.deny(request, checks, "insufficient-scope", "Missing required scopes");

      // MFA check
      if (rule.requireMfa) {
        const mfaCheck = this.checkMfa(request);
        checks.push(mfaCheck);
        if (!mfaCheck.passed) {
          recommendations.push("Step-up authentication required for this action");
          return this.deny(request, checks, "denied", "MFA verification required");
        }
      }

      // Trust ring check
      const ringCheck = this.checkTrustRing(request, rule);
      checks.push(ringCheck);
      if (!ringCheck.passed) return this.deny(request, checks, "device-untrusted", "Trust ring too low");

      // Input validation
      if (rule.inputSchema) {
        const inputCheck = this.checkInput(request, rule.inputSchema);
        checks.push(inputCheck);
        if (!inputCheck.passed) return this.deny(request, checks, "invalid-input", "Input validation failed");
      }

      // Rate limiting
      if (rule.rateLimitPolicyId) {
        const policy = this.ratePolicies.get(rule.rateLimitPolicyId);
        if (policy) {
          const rateLimit = this.limiter.check(
            policy.keyExtractor(request),
            policy.limit,
            policy.windowMs,
            policy.burstLimit,
          );
          if (rateLimit) {
            this.metrics.rateLimitedRequests++;
            return this.decide(request, checks, "rate-limited", "Rate limit exceeded", rateLimit, recommendations);
          }
          checks.push({ name: "rate-limit", passed: true, detail: "Within rate limits", severity: "info" });
        }
      }
    }

    // All checks passed
    this.metrics.allowedRequests++;
    return this.decide(request, checks, "allowed", null, null, recommendations);
  }

  // ── Rule Management ────────────────────────────────────────

  registerRule(rule: AccessRule): void {
    this.rules.set(rule.id, rule);
  }

  registerRatePolicy(policy: RateLimitPolicy): void {
    this.ratePolicies.set(policy.key, policy);
  }

  // ── Queries ────────────────────────────────────────────────

  getRecentDecisions(limit = 100, result?: ValidationResult): ValidationDecision[] {
    let filtered = this.decisions;
    if (result) filtered = filtered.filter((d) => d.result === result);
    return filtered.slice(-limit);
  }

  getMetrics(): ZeroTrustMetrics {
    return { ...this.metrics };
  }

  // ── Internal Checks ────────────────────────────────────────

  private checkAuthentication(req: ZeroTrustRequest): ValidationCheck {
    if (req.identity.authenticated) return { name: "authentication", passed: true, detail: "Authenticated", severity: "info" };
    if (req.identity.tokenClass === "anon") return { name: "authentication", passed: true, detail: "Anonymous access", severity: "info" };
    return { name: "authentication", passed: false, detail: "Not authenticated", severity: "error" };
  }

  private checkSession(req: ZeroTrustRequest): ValidationCheck {
    if (!req.identity.tokenExpiresAt) return { name: "session", passed: true, detail: "No expiry set", severity: "info" };
    if (new Date(req.identity.tokenExpiresAt) > new Date()) return { name: "session", passed: true, detail: "Session valid", severity: "info" };
    return { name: "session", passed: false, detail: "Token/session expired", severity: "error" };
  }

  private checkTokenClass(req: ZeroTrustRequest, rule: AccessRule): ValidationCheck {
    if (rule.requiredTokenClass.includes(req.identity.tokenClass)) {
      return { name: "token-class", passed: true, detail: `Token class ${req.identity.tokenClass} accepted`, severity: "info" };
    }
    return { name: "token-class", passed: false, detail: `Token class ${req.identity.tokenClass} not in [${rule.requiredTokenClass.join(",")}]`, severity: "error" };
  }

  private checkScopes(req: ZeroTrustRequest, rule: AccessRule): ValidationCheck {
    const missing = rule.requiredScopes.filter((s) => !req.scope.includes(s));
    if (missing.length === 0) return { name: "scopes", passed: true, detail: "All required scopes present", severity: "info" };
    return { name: "scopes", passed: false, detail: `Missing scopes: ${missing.join(", ")}`, severity: "error" };
  }

  private checkMfa(req: ZeroTrustRequest): ValidationCheck {
    if (req.identity.mfaVerified) return { name: "mfa", passed: true, detail: "MFA verified", severity: "info" };
    return { name: "mfa", passed: false, detail: "MFA not verified", severity: "error" };
  }

  private checkTrustRing(req: ZeroTrustRequest, rule: AccessRule): ValidationCheck {
    if (req.identity.trustRing <= rule.maxTrustRing) {
      return { name: "trust-ring", passed: true, detail: `Ring ${req.identity.trustRing} ≤ max ${rule.maxTrustRing}`, severity: "info" };
    }
    return { name: "trust-ring", passed: false, detail: `Ring ${req.identity.trustRing} exceeds max ${rule.maxTrustRing}`, severity: "error" };
  }

  private checkInput(req: ZeroTrustRequest, schema: InputSchemaRule): ValidationCheck {
    const keys = Object.keys(req.input);
    if (keys.length > schema.maxFieldCount) {
      return { name: "input-schema", passed: false, detail: `Too many fields: ${keys.length} > ${schema.maxFieldCount}`, severity: "error" };
    }
    for (const field of schema.requiredFields) {
      if (!(field in req.input)) {
        return { name: "input-schema", passed: false, detail: `Missing required field: ${field}`, severity: "error" };
      }
    }
    // Check string lengths and forbidden patterns
    const stringViolation = this.checkStringsRecursive(req.input, schema, 0);
    if (stringViolation) {
      return { name: "input-schema", passed: false, detail: stringViolation, severity: "error" };
    }
    return { name: "input-schema", passed: true, detail: "Input validated", severity: "info" };
  }

  private checkStringsRecursive(obj: unknown, schema: InputSchemaRule, depth: number): string | null {
    if (depth > schema.maxDepth) return `Input depth exceeds ${schema.maxDepth}`;
    if (typeof obj === "string") {
      if (obj.length > schema.maxStringLength) return `String length ${obj.length} exceeds ${schema.maxStringLength}`;
      for (const pattern of schema.forbiddenPatterns) {
        if (pattern.test(obj)) return `Forbidden pattern detected in input`;
      }
    }
    if (obj && typeof obj === "object") {
      for (const value of Object.values(obj as Record<string, unknown>)) {
        const result = this.checkStringsRecursive(value, schema, depth + 1);
        if (result) return result;
      }
    }
    return null;
  }

  private findMatchingRule(req: ZeroTrustRequest): AccessRule | null {
    for (const rule of this.rules.values()) {
      if (rule.action === req.action || rule.action === "*") {
        if (rule.resource === req.resource || rule.resource === "*") {
          return rule;
        }
      }
    }
    return null;
  }

  // ── Decision Helpers ───────────────────────────────────────

  private deny(req: ZeroTrustRequest, checks: ValidationCheck[], result: ValidationResult, reason: string): ValidationDecision {
    this.metrics.deniedRequests++;
    if (result === "invalid-input") this.metrics.invalidInputRequests++;
    return this.decide(req, checks, result, reason, null, []);
  }

  private decide(req: ZeroTrustRequest, checks: ValidationCheck[], result: ValidationResult, denyReason: string | null, rateLimit: RateLimitInfo | null, recommendations: string[]): ValidationDecision {
    const decision: ValidationDecision = {
      result,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      checks,
      denyReason,
      rateLimit,
      recommendations,
    };
    this.decisions.push(decision);
    if (this.decisions.length > this.maxDecisions) this.decisions = this.decisions.slice(-this.maxDecisions);
    return decision;
  }

  // ── Defaults ───────────────────────────────────────────────

  private registerDefaultRules(): void {
    const defaultInput: InputSchemaRule = { maxFieldCount: 50, maxStringLength: 10_000, maxDepth: 10, forbiddenPatterns: [/<script/i, /javascript:/i, /on\w+\s*=/i], requiredFields: [] };

    this.registerRule({ id: "admin-actions", action: "admin.*", resource: "*", requiredTokenClass: ["admin", "founder"], requiredScopes: ["admin.access"], requireMfa: true, maxTrustRing: 1, requireAuthentication: true, rateLimitPolicyId: "admin-rate", inputSchema: defaultInput });
    this.registerRule({ id: "founder-actions", action: "founder.*", resource: "*", requiredTokenClass: ["founder"], requiredScopes: ["founder.access"], requireMfa: true, maxTrustRing: 0, requireAuthentication: true, rateLimitPolicyId: "admin-rate", inputSchema: defaultInput });
    this.registerRule({ id: "user-data", action: "read", resource: "user-data", requiredTokenClass: ["user", "admin", "founder"], requiredScopes: ["data.read"], requireMfa: false, maxTrustRing: 3, requireAuthentication: true, rateLimitPolicyId: "user-rate", inputSchema: defaultInput });
    this.registerRule({ id: "ai-invoke", action: "ai.invoke", resource: "ai-gateway", requiredTokenClass: ["user", "service", "admin"], requiredScopes: ["ai.invoke"], requireMfa: false, maxTrustRing: 2, requireAuthentication: true, rateLimitPolicyId: "ai-rate", inputSchema: { ...defaultInput, maxStringLength: 50_000 } });
  }

  private registerDefaultRatePolicies(): void {
    this.registerRatePolicy({ key: "admin-rate", keyExtractor: (r) => `admin:${r.identity.userId}`, limit: 100, windowMs: 60_000, burstLimit: 20 });
    this.registerRatePolicy({ key: "user-rate", keyExtractor: (r) => `user:${r.identity.userId}`, limit: 300, windowMs: 60_000, burstLimit: 50 });
    this.registerRatePolicy({ key: "ai-rate", keyExtractor: (r) => `ai:${r.identity.userId}`, limit: 60, windowMs: 60_000, burstLimit: 10 });
  }
}

export function createZeroTrustValidator(): ZeroTrustValidator {
  return new ZeroTrustValidator();
}
