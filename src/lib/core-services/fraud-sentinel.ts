// ═══════════════════════════════════════════════════════════════
// SITA OS — Fraud Sentinel Service
// Continuous anomaly detection, behavioral drift, rule engine
// ═══════════════════════════════════════════════════════════════

export type FraudSignalType =
  | "unusual-amount" | "unusual-timing" | "unusual-recipient" | "unusual-frequency"
  | "velocity-spike" | "geo-anomaly" | "device-anomaly" | "behavioral-drift"
  | "account-takeover-signal" | "duplicate-transaction";

export type FraudSeverity = "info" | "warning" | "alert" | "critical";
export type FraudAction = "monitor" | "flag" | "hold" | "block" | "escalate";

export interface FraudSignal {
  id: string;
  type: FraudSignalType;
  severity: FraudSeverity;
  action: FraudAction;
  entityId: string;
  entityType: "payment" | "login" | "transaction" | "api-call" | "data-access";
  description: string;
  score: number;          // 0-100
  metadata: Record<string, unknown>;
  detectedAt: number;
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
}

export interface FraudRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: (context: FraudContext) => boolean;
  severity: FraudSeverity;
  action: FraudAction;
  description: string;
}

export interface FraudContext {
  amount?: number;
  recipientId?: string;
  method?: string;
  timestamp: number;
  ipAddress?: string;
  deviceFingerprint?: string;
  userId: string;
  recentTransactionCount?: number;
  recentTotalAmount?: number;
  isNewRecipient?: boolean;
  isNewDevice?: boolean;
  hourOfDay?: number;
}

export interface FraudSummary {
  totalSignals: number;
  activeAlerts: number;
  blockedTransactions: number;
  resolvedSignals: number;
  riskScore: number;       // aggregate 0-100
  topSignalTypes: { type: FraudSignalType; count: number }[];
}

// ── Default Rules ───────────────────────────────────────────────

const DEFAULT_RULES: FraudRule[] = [
  {
    id: "rule-large-amount", name: "Large Transaction", enabled: true,
    condition: (ctx) => (ctx.amount ?? 0) > 25000,
    severity: "alert", action: "hold", description: "Transaction exceeds $25,000 threshold",
  },
  {
    id: "rule-velocity", name: "Velocity Spike", enabled: true,
    condition: (ctx) => (ctx.recentTransactionCount ?? 0) > 10,
    severity: "warning", action: "flag", description: "More than 10 transactions in monitoring window",
  },
  {
    id: "rule-new-recipient-large", name: "New Recipient + Large Amount", enabled: true,
    condition: (ctx) => (ctx.isNewRecipient ?? false) && (ctx.amount ?? 0) > 5000,
    severity: "alert", action: "hold", description: "Large payment to new recipient",
  },
  {
    id: "rule-odd-hours", name: "Off-Hours Activity", enabled: true,
    condition: (ctx) => { const h = ctx.hourOfDay ?? new Date(ctx.timestamp).getHours(); return h < 5 || h > 23; },
    severity: "info", action: "monitor", description: "Activity during unusual hours",
  },
  {
    id: "rule-new-device", name: "New Device", enabled: true,
    condition: (ctx) => ctx.isNewDevice ?? false,
    severity: "warning", action: "flag", description: "Action from unrecognized device",
  },
  {
    id: "rule-rapid-spend", name: "Rapid Spend Accumulation", enabled: true,
    condition: (ctx) => (ctx.recentTotalAmount ?? 0) > 50000,
    severity: "critical", action: "block", description: "Total recent spend exceeds $50,000",
  },
  {
    id: "rule-duplicate", name: "Potential Duplicate", enabled: true,
    condition: (ctx) => (ctx.recentTransactionCount ?? 0) > 3 && (ctx.amount ?? 0) === (ctx.recentTotalAmount ?? 0) / (ctx.recentTransactionCount ?? 1),
    severity: "warning", action: "flag", description: "Possible duplicate transaction detected",
  },
];

// ── Fraud Sentinel Service ──────────────────────────────────────

export class FraudSentinelService {
  private signals: FraudSignal[] = [];
  private rules: FraudRule[];

  constructor(customRules?: FraudRule[]) {
    this.rules = customRules ?? [...DEFAULT_RULES];
  }

  evaluate(context: FraudContext): FraudSignal[] {
    const triggered: FraudSignal[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      try {
        if (rule.condition(context)) {
          const signal: FraudSignal = {
            id: crypto.randomUUID(),
            type: this.ruleToSignalType(rule.id),
            severity: rule.severity,
            action: rule.action,
            entityId: context.userId,
            entityType: "transaction",
            description: rule.description,
            score: this.severityToScore(rule.severity),
            metadata: { ruleId: rule.id, amount: context.amount, method: context.method },
            detectedAt: Date.now(),
            resolved: false,
          };
          this.signals.push(signal);
          triggered.push(signal);
        }
      } catch {
        // Rule evaluation failure — fail safe, continue
      }
    }

    return triggered;
  }

  shouldBlock(context: FraudContext): { blocked: boolean; signals: FraudSignal[]; reason?: string } {
    const triggered = this.evaluate(context);
    const blocking = triggered.filter(s => s.action === "block");
    const holding = triggered.filter(s => s.action === "hold");

    if (blocking.length > 0) {
      return { blocked: true, signals: triggered, reason: blocking[0].description };
    }
    if (holding.length >= 2) {
      return { blocked: true, signals: triggered, reason: "Multiple hold signals triggered" };
    }
    return { blocked: false, signals: triggered };
  }

  resolve(signalId: string, resolvedBy: string): boolean {
    const signal = this.signals.find(s => s.id === signalId);
    if (!signal) return false;
    signal.resolved = true;
    signal.resolvedAt = Date.now();
    signal.resolvedBy = resolvedBy;
    return true;
  }

  getSummary(): FraudSummary {
    const active = this.signals.filter(s => !s.resolved);
    const typeMap = new Map<FraudSignalType, number>();
    active.forEach(s => typeMap.set(s.type, (typeMap.get(s.type) ?? 0) + 1));

    return {
      totalSignals: this.signals.length,
      activeAlerts: active.filter(s => s.severity === "alert" || s.severity === "critical").length,
      blockedTransactions: this.signals.filter(s => s.action === "block").length,
      resolvedSignals: this.signals.filter(s => s.resolved).length,
      riskScore: Math.min(100, active.reduce((s, sig) => s + sig.score, 0)),
      topSignalTypes: Array.from(typeMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }

  getActiveSignals(): FraudSignal[] {
    return this.signals.filter(s => !s.resolved);
  }

  private ruleToSignalType(ruleId: string): FraudSignalType {
    const map: Record<string, FraudSignalType> = {
      "rule-large-amount": "unusual-amount",
      "rule-velocity": "velocity-spike",
      "rule-new-recipient-large": "unusual-recipient",
      "rule-odd-hours": "unusual-timing",
      "rule-new-device": "device-anomaly",
      "rule-rapid-spend": "velocity-spike",
      "rule-duplicate": "duplicate-transaction",
    };
    return map[ruleId] ?? "behavioral-drift";
  }

  private severityToScore(severity: FraudSeverity): number {
    return { info: 5, warning: 15, alert: 35, critical: 60 }[severity];
  }
}
