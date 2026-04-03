// ═══════════════════════════════════════════════════════════════
// SITA OS — Billing Service
// Usage tracking, entitlement enforcement, token cost aggregation
// ═══════════════════════════════════════════════════════════════

export type BillingPlan = "free" | "starter" | "professional" | "enterprise";
export type EntitlementStatus = "active" | "exceeded" | "expired" | "suspended";

export interface BillingAccount {
  id: string;
  ownerId: string;
  plan: BillingPlan;
  status: EntitlementStatus;
  periodStart: number;
  periodEnd: number;
  limits: BillingLimits;
  usage: BillingUsage;
}

export interface BillingLimits {
  maxTokensPerMonth: number;
  maxExecutionsPerDay: number;
  maxConnectors: number;
  maxStorage: number;
  maxBoardroomSessions: number;
}

export interface BillingUsage {
  tokensUsed: number;
  executionsToday: number;
  connectorsActive: number;
  storageUsed: number;
  boardroomSessions: number;
}

export interface UsageEvent {
  id: string;
  accountId: string;
  type: "token" | "execution" | "storage" | "connector" | "boardroom";
  amount: number;
  capabilityId?: string;
  timestamp: number;
}

export interface EntitlementCheck {
  allowed: boolean;
  remainingQuota: number;
  limitName: string;
  currentUsage: number;
  maxLimit: number;
}

// ── Billing Service ─────────────────────────────────────────────

export class BillingService {
  private accounts = new Map<string, BillingAccount>();
  private usageEvents: UsageEvent[] = [];

  private readonly planLimits: Record<BillingPlan, BillingLimits> = {
    free: { maxTokensPerMonth: 10_000, maxExecutionsPerDay: 50, maxConnectors: 2, maxStorage: 100_000_000, maxBoardroomSessions: 5 },
    starter: { maxTokensPerMonth: 100_000, maxExecutionsPerDay: 500, maxConnectors: 5, maxStorage: 1_000_000_000, maxBoardroomSessions: 50 },
    professional: { maxTokensPerMonth: 1_000_000, maxExecutionsPerDay: 5000, maxConnectors: 20, maxStorage: 10_000_000_000, maxBoardroomSessions: 500 },
    enterprise: { maxTokensPerMonth: 100_000_000, maxExecutionsPerDay: 100_000, maxConnectors: 100, maxStorage: 1_000_000_000_000, maxBoardroomSessions: 10_000 },
  };

  createAccount(ownerId: string, plan: BillingPlan = "free"): BillingAccount {
    const now = Date.now();
    const account: BillingAccount = {
      id: `billing-${ownerId}`,
      ownerId, plan, status: "active",
      periodStart: now, periodEnd: now + 30 * 86_400_000,
      limits: { ...this.planLimits[plan] },
      usage: { tokensUsed: 0, executionsToday: 0, connectorsActive: 0, storageUsed: 0, boardroomSessions: 0 },
    };
    this.accounts.set(account.id, account);
    return account;
  }

  getAccount(accountId: string): BillingAccount | undefined {
    return this.accounts.get(accountId);
  }

  checkEntitlement(accountId: string, type: UsageEvent["type"], amount = 1): EntitlementCheck {
    const account = this.accounts.get(accountId);
    if (!account) return { allowed: false, remainingQuota: 0, limitName: type, currentUsage: 0, maxLimit: 0 };

    const mapping: Record<string, { usage: keyof BillingUsage; limit: keyof BillingLimits }> = {
      token: { usage: "tokensUsed", limit: "maxTokensPerMonth" },
      execution: { usage: "executionsToday", limit: "maxExecutionsPerDay" },
      connector: { usage: "connectorsActive", limit: "maxConnectors" },
      storage: { usage: "storageUsed", limit: "maxStorage" },
      boardroom: { usage: "boardroomSessions", limit: "maxBoardroomSessions" },
    };

    const m = mapping[type];
    const current = account.usage[m.usage];
    const max = account.limits[m.limit];

    return {
      allowed: current + amount <= max,
      remainingQuota: Math.max(0, max - current),
      limitName: m.limit, currentUsage: current, maxLimit: max,
    };
  }

  recordUsage(accountId: string, type: UsageEvent["type"], amount: number, capabilityId?: string): void {
    const account = this.accounts.get(accountId);
    if (!account) return;

    const event: UsageEvent = { id: `usage-${Date.now()}`, accountId, type, amount, capabilityId, timestamp: Date.now() };
    this.usageEvents.push(event);

    switch (type) {
      case "token": account.usage.tokensUsed += amount; break;
      case "execution": account.usage.executionsToday += amount; break;
      case "connector": account.usage.connectorsActive += amount; break;
      case "storage": account.usage.storageUsed += amount; break;
      case "boardroom": account.usage.boardroomSessions += amount; break;
    }

    if (account.usage.tokensUsed > account.limits.maxTokensPerMonth) {
      account.status = "exceeded";
    }
  }

  upgradePlan(accountId: string, newPlan: BillingPlan): BillingAccount | null {
    const account = this.accounts.get(accountId);
    if (!account) return null;
    account.plan = newPlan;
    account.limits = { ...this.planLimits[newPlan] };
    if (account.status === "exceeded") account.status = "active";
    return account;
  }

  getUsageHistory(accountId: string, since?: number): UsageEvent[] {
    return this.usageEvents.filter(e => e.accountId === accountId && (!since || e.timestamp >= since));
  }

  getHealth(): { status: "healthy"; accounts: number; eventsTracked: number } {
    return { status: "healthy", accounts: this.accounts.size, eventsTracked: this.usageEvents.length };
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createBillingService(): BillingService {
  return new BillingService();
}
