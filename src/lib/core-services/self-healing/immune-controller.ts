// ═══════════════════════════════════════════════════════════════
// SITA OS — Immune Controller
// Quarantine management, immune rules, auto-block for repeated offenders
// ═══════════════════════════════════════════════════════════════

import type {
  QuarantineRecord, ImmuneRule, RootCauseCategory, HealingCapability,
} from "./types";

// ── Immune Controller ───────────────────────────────────────────

export class ImmuneController {
  private quarantined = new Map<string, QuarantineRecord>();
  private immuneRules: ImmuneRule[] = [];
  private offenseLog = new Map<string, { count: number; lastAt: number }>();
  private autoBlockThreshold = 5;
  private autoBlockWindowMs = 60 * 60_000; // 1 hour

  constructor() {
    this.initializeDefaultRules();
  }

  // ── Quarantine Management ─────────────────────────────────

  quarantine(serviceId: string, reason: string, options?: {
    incidentId?: string;
    autoRelease?: boolean;
    autoReleaseAfterMs?: number;
    blockedActions?: string[];
  }): QuarantineRecord {
    const record: QuarantineRecord = {
      serviceId,
      reason,
      quarantinedAt: Date.now(),
      autoRelease: options?.autoRelease ?? false,
      autoReleaseAfterMs: options?.autoReleaseAfterMs ?? 0,
      incidentId: options?.incidentId,
      blockedActions: options?.blockedActions ?? ["all"],
    };
    this.quarantined.set(serviceId, record);

    // Record offense
    this.recordOffense(serviceId);

    return record;
  }

  release(serviceId: string): boolean {
    return this.quarantined.delete(serviceId);
  }

  isQuarantined(serviceId: string): boolean {
    const record = this.quarantined.get(serviceId);
    if (!record) return false;

    // Check auto-release
    if (record.autoRelease && record.autoReleaseAfterMs > 0) {
      const elapsed = Date.now() - record.quarantinedAt;
      if (elapsed >= record.autoReleaseAfterMs) {
        this.quarantined.delete(serviceId);
        return false;
      }
    }

    return true;
  }

  getQuarantineRecord(serviceId: string): QuarantineRecord | null {
    return this.quarantined.get(serviceId) ?? null;
  }

  getAllQuarantined(): QuarantineRecord[] {
    // Clean up auto-released first
    for (const [id] of this.quarantined) {
      this.isQuarantined(id); // Side-effect: removes expired
    }
    return Array.from(this.quarantined.values());
  }

  // ── Immune Rules ──────────────────────────────────────────

  addRule(rule: Omit<ImmuneRule, "matchCount" | "lastMatchedAt">): ImmuneRule {
    const full: ImmuneRule = { ...rule, matchCount: 0 };
    this.immuneRules.push(full);
    return full;
  }

  removeRule(ruleId: string): boolean {
    const before = this.immuneRules.length;
    this.immuneRules = this.immuneRules.filter(r => r.id !== ruleId);
    return this.immuneRules.length < before;
  }

  matchRules(rootCause: RootCauseCategory): ImmuneRule[] {
    const matched = this.immuneRules.filter(r => r.enabled && r.pattern === rootCause);
    for (const rule of matched) {
      (rule as { matchCount: number }).matchCount++;
      (rule as { lastMatchedAt: number }).lastMatchedAt = Date.now();
    }
    return matched;
  }

  getRules(): ImmuneRule[] {
    return [...this.immuneRules];
  }

  // ── Auto-Block for Repeated Offenders ─────────────────────

  isAutoBlocked(serviceId: string): boolean {
    const offense = this.offenseLog.get(serviceId);
    if (!offense) return false;

    const elapsed = Date.now() - offense.lastAt;
    if (elapsed > this.autoBlockWindowMs) {
      this.offenseLog.delete(serviceId);
      return false;
    }

    return offense.count >= this.autoBlockThreshold;
  }

  getOffenseCount(serviceId: string): number {
    return this.offenseLog.get(serviceId)?.count ?? 0;
  }

  clearOffenses(serviceId: string): void {
    this.offenseLog.delete(serviceId);
  }

  // ── Bulk Operations ───────────────────────────────────────

  quarantineMultiple(serviceIds: string[], reason: string, incidentId?: string): QuarantineRecord[] {
    return serviceIds.map(id => this.quarantine(id, reason, { incidentId }));
  }

  releaseAll(): number {
    const count = this.quarantined.size;
    this.quarantined.clear();
    return count;
  }

  // ── Stats ─────────────────────────────────────────────────

  getStats(): {
    quarantinedCount: number;
    ruleCount: number;
    enabledRuleCount: number;
    totalOffenses: number;
    autoBlockedCount: number;
  } {
    let totalOffenses = 0;
    let autoBlockedCount = 0;
    for (const [id, offense] of this.offenseLog) {
      totalOffenses += offense.count;
      if (this.isAutoBlocked(id)) autoBlockedCount++;
    }
    return {
      quarantinedCount: this.quarantined.size,
      ruleCount: this.immuneRules.length,
      enabledRuleCount: this.immuneRules.filter(r => r.enabled).length,
      totalOffenses,
      autoBlockedCount,
    };
  }

  // ── Private ───────────────────────────────────────────────

  private recordOffense(serviceId: string): void {
    const existing = this.offenseLog.get(serviceId);
    if (existing) {
      existing.count++;
      existing.lastAt = Date.now();
    } else {
      this.offenseLog.set(serviceId, { count: 1, lastAt: Date.now() });
    }
  }

  private initializeDefaultRules(): void {
    const defaults: Array<{ id: string; name: string; pattern: RootCauseCategory; condition: string; action: HealingCapability }> = [
      { id: "ir-connector-failure", name: "Connector failure auto-failover", pattern: "connector-failure", condition: "error_count > 3", action: "connector-failover" },
      { id: "ir-workflow-stuck", name: "Stuck workflow auto-unstick", pattern: "workflow-stuck", condition: "no_progress_minutes > 5", action: "workflow-unstick" },
      { id: "ir-cache-failure", name: "Cache failure auto-flush", pattern: "cache-failure", condition: "cache_miss_rate > 0.5", action: "cache-flush" },
      { id: "ir-queue-pressure", name: "Queue pressure auto-drain", pattern: "queue-pressure", condition: "queue_depth > 1000", action: "queue-drain" },
      { id: "ir-rate-limiting", name: "Rate limit auto-adjust", pattern: "rate-limiting", condition: "rate_limit_hit_count > 10", action: "rate-limit-adjust" },
      { id: "ir-model-routing", name: "Model routing auto-swap", pattern: "model-routing", condition: "latency_p99 > 5000", action: "model-swap" },
      { id: "ir-permission-drift", name: "Permission drift auto-revert", pattern: "permission-drift", condition: "drift_detected", action: "permission-revert" },
    ];

    for (const d of defaults) {
      this.immuneRules.push({
        ...d,
        autonomyLevel: "L3",
        enabled: true,
        matchCount: 0,
      });
    }
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createImmuneController(): ImmuneController {
  return new ImmuneController();
}
