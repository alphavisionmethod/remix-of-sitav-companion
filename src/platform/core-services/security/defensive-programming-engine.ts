// ═══════════════════════════════════════════════════════════════
// SITA OS — Defensive Programming Engine
// Structural runtime validation: invariants, state machines,
// bounds checking, stale-state detection, retry orchestration
// Covers: Master Prompt Section 18
// ═══════════════════════════════════════════════════════════════

// ── Types ─────────────────────────────────────────────────────

export interface InvariantDef {
  id: string;
  description: string;
  check: () => boolean;
  severity: "warn" | "error" | "critical";
  domain: string;
  lastChecked: string | null;
  lastResult: boolean | null;
  failCount: number;
}

export interface StateMachineDef<S extends string = string> {
  id: string;
  description: string;
  currentState: S;
  validTransitions: Record<S, S[]>;
  history: Array<{ from: S; to: S; timestamp: string; actor: string }>;
}

export interface FreshnessEntry {
  key: string;
  value: unknown;
  cachedAt: number;
  ttlMs: number;
  domain: string;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterMs: number;
  idempotencyKey?: string;
}

export interface DefensiveViolation {
  id: string;
  timestamp: string;
  type: "invariant" | "state-machine" | "bounds" | "stale-state" | "timeout" | "schema";
  severity: "warn" | "error" | "critical";
  description: string;
  domain: string;
  context: Record<string, unknown>;
}

// ── Engine ────────────────────────────────────────────────────

export class DefensiveProgrammingEngine {
  private invariants = new Map<string, InvariantDef>();
  private stateMachines = new Map<string, StateMachineDef>();
  private freshnessCache = new Map<string, FreshnessEntry>();
  private violations: DefensiveViolation[] = [];
  private completedIdempotencyKeys = new Set<string>();
  private listeners: Array<(v: DefensiveViolation) => void> = [];
  private readonly maxViolations = 500;

  // ── Invariants ────────────────────────────────────────────

  registerInvariant(id: string, description: string, check: () => boolean, severity: "warn" | "error" | "critical" = "error", domain = "system"): void {
    this.invariants.set(id, { id, description, check, severity, domain, lastChecked: null, lastResult: null, failCount: 0 });
  }

  checkInvariant(id: string): boolean {
    const inv = this.invariants.get(id);
    if (!inv) { this.emitViolation("invariant", "error", `Unknown invariant: ${id}`, "system", { id }); return false; }
    const result = inv.check();
    inv.lastChecked = new Date().toISOString();
    inv.lastResult = result;
    if (!result) {
      inv.failCount++;
      this.emitViolation("invariant", inv.severity, `Invariant violated: ${inv.description}`, inv.domain, { id, failCount: inv.failCount });
    }
    return result;
  }

  checkAllInvariants(): Array<{ id: string; passed: boolean; severity: string }> {
    const results: Array<{ id: string; passed: boolean; severity: string }> = [];
    for (const [id, inv] of this.invariants) {
      const passed = this.checkInvariant(id);
      results.push({ id, passed, severity: inv.severity });
    }
    return results;
  }

  getInvariantStatus(): Array<{ id: string; description: string; lastResult: boolean | null; failCount: number; severity: string }> {
    return Array.from(this.invariants.values()).map((i) => ({
      id: i.id, description: i.description, lastResult: i.lastResult, failCount: i.failCount, severity: i.severity,
    }));
  }

  // ── State Machine Validator ───────────────────────────────

  registerStateMachine<S extends string>(id: string, description: string, initialState: S, validTransitions: Record<S, S[]>): void {
    this.stateMachines.set(id, { id, description, currentState: initialState, validTransitions: validTransitions as Record<string, string[]>, history: [] });
  }

  transition(machineId: string, targetState: string, actor = "system"): { success: boolean; reason?: string } {
    const machine = this.stateMachines.get(machineId);
    if (!machine) return { success: false, reason: `Unknown state machine: ${machineId}` };

    const allowed = machine.validTransitions[machine.currentState] ?? [];
    if (!allowed.includes(targetState)) {
      this.emitViolation("state-machine", "error", `Illegal transition ${machine.currentState} → ${targetState} in ${machineId}`, "system", { machineId, from: machine.currentState, to: targetState, allowed });
      return { success: false, reason: `Transition ${machine.currentState} → ${targetState} not allowed. Valid: ${allowed.join(", ")}` };
    }

    machine.history.push({ from: machine.currentState, to: targetState, timestamp: new Date().toISOString(), actor });
    if (machine.history.length > 100) machine.history = machine.history.slice(-100);
    machine.currentState = targetState;
    return { success: true };
  }

  getStateMachineState(machineId: string): { currentState: string; history: Array<{ from: string; to: string; timestamp: string }> } | null {
    const machine = this.stateMachines.get(machineId);
    if (!machine) return null;
    return { currentState: machine.currentState, history: machine.history };
  }

  getAllStateMachines(): Array<{ id: string; description: string; currentState: string; transitionCount: number }> {
    return Array.from(this.stateMachines.values()).map((m) => ({
      id: m.id, description: m.description, currentState: m.currentState, transitionCount: m.history.length,
    }));
  }

  // ── Bounds Checking ───────────────────────────────────────

  checkBounds(value: number, min: number, max: number, label: string, domain = "system"): { valid: boolean; clamped: number } {
    if (value < min || value > max) {
      this.emitViolation("bounds", "warn", `Out-of-bounds: ${label} = ${value} (range: ${min}–${max})`, domain, { value, min, max, label });
      return { valid: false, clamped: Math.max(min, Math.min(max, value)) };
    }
    return { valid: true, clamped: value };
  }

  checkOverflow(a: number, b: number, op: "add" | "multiply", label: string): { safe: boolean; result: number } {
    const MAX = Number.MAX_SAFE_INTEGER;
    let result: number;
    let safe = true;
    if (op === "add") {
      result = a + b;
      if (result > MAX || result < -MAX) safe = false;
    } else {
      result = a * b;
      if (result > MAX || result < -MAX) safe = false;
    }
    if (!safe) {
      this.emitViolation("bounds", "error", `Integer overflow: ${label} (${a} ${op} ${b} = ${result})`, "system", { a, b, op, label });
    }
    return { safe, result: safe ? result : 0 };
  }

  // ── Stale-State Detection ─────────────────────────────────

  cacheFresh<T>(key: string, value: T, ttlMs: number, domain = "system"): void {
    this.freshnessCache.set(key, { key, value, cachedAt: Date.now(), ttlMs, domain });
  }

  getFresh<T>(key: string): { value: T; stale: boolean } | null {
    const entry = this.freshnessCache.get(key);
    if (!entry) return null;
    const stale = Date.now() - entry.cachedAt > entry.ttlMs;
    if (stale) {
      this.emitViolation("stale-state", "warn", `Stale state detected: ${key} (age: ${Date.now() - entry.cachedAt}ms, TTL: ${entry.ttlMs}ms)`, entry.domain, { key, age: Date.now() - entry.cachedAt, ttl: entry.ttlMs });
    }
    return { value: entry.value as T, stale };
  }

  evictStale(): number {
    let evicted = 0;
    const now = Date.now();
    for (const [key, entry] of this.freshnessCache) {
      if (now - entry.cachedAt > entry.ttlMs * 2) { this.freshnessCache.delete(key); evicted++; }
    }
    return evicted;
  }

  // ── Timeout Manager ───────────────────────────────────────

  withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.emitViolation("timeout", "error", `Operation timed out: ${label} (${timeoutMs}ms)`, "system", { label, timeoutMs });
        reject(new Error(`Timeout: ${label} exceeded ${timeoutMs}ms`));
      }, timeoutMs);
      promise.then((v) => { clearTimeout(timer); resolve(v); }).catch((e) => { clearTimeout(timer); reject(e); });
    });
  }

  // ── Retry Orchestrator ────────────────────────────────────

  async retry<T>(fn: () => Promise<T>, config: RetryConfig, label: string): Promise<T> {
    if (config.idempotencyKey && this.completedIdempotencyKeys.has(config.idempotencyKey)) {
      throw new Error(`Idempotency key already completed: ${config.idempotencyKey}`);
    }

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await fn();
        if (config.idempotencyKey) this.completedIdempotencyKeys.add(config.idempotencyKey);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < config.maxAttempts) {
          const delay = Math.min(config.baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * config.jitterMs, config.maxDelayMs);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    this.emitViolation("timeout", "error", `Retry exhausted: ${label} after ${config.maxAttempts} attempts`, "system", { label, maxAttempts: config.maxAttempts, lastError: lastError?.message });
    throw lastError ?? new Error(`Retry exhausted: ${label}`);
  }

  // ── Schema Validation ─────────────────────────────────────

  validateSchema(data: unknown, validator: (d: unknown) => { valid: boolean; errors?: string[] }, label: string, domain = "system"): boolean {
    const result = validator(data);
    if (!result.valid) {
      this.emitViolation("schema", "error", `Schema validation failed: ${label} — ${(result.errors ?? []).join("; ")}`, domain, { label, errors: result.errors });
    }
    return result.valid;
  }

  // ── Violation Management ──────────────────────────────────

  private emitViolation(type: DefensiveViolation["type"], severity: DefensiveViolation["severity"], description: string, domain: string, context: Record<string, unknown>): void {
    const violation: DefensiveViolation = {
      id: `dv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      type, severity, description, domain, context,
    };
    this.violations.push(violation);
    if (this.violations.length > this.maxViolations) this.violations = this.violations.slice(-this.maxViolations);
    for (const l of this.listeners) { try { l(violation); } catch { /* swallow */ } }
  }

  getViolations(limit = 50): DefensiveViolation[] { return this.violations.slice(-limit); }

  onViolation(listener: (v: DefensiveViolation) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  // ── Metrics ───────────────────────────────────────────────

  getMetrics() {
    const byType: Record<string, number> = {};
    for (const v of this.violations) byType[v.type] = (byType[v.type] ?? 0) + 1;
    return {
      totalViolations: this.violations.length,
      byType,
      invariantCount: this.invariants.size,
      stateMachineCount: this.stateMachines.size,
      cacheEntries: this.freshnessCache.size,
      completedIdempotencyKeys: this.completedIdempotencyKeys.size,
    };
  }
}

// ── Factory ───────────────────────────────────────────────────

export function createDefensiveProgrammingEngine(): DefensiveProgrammingEngine {
  return new DefensiveProgrammingEngine();
}
