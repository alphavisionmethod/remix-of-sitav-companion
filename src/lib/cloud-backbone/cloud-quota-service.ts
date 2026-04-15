// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Quota Service
// Plans, quotas, subscriptions, overage handling
// ═══════════════════════════════════════════════════════════════

export interface CloudPlan {
  id: string;
  planKey: string;
  displayName: string;
  storageLimitBytes: number;
  maxDevices: number;
  maxFileSizeBytes: number;
  features: string[];
  priceCents: number;
  isActive: boolean;
}

export interface UserPlanAssignment {
  userId: string;
  userName: string;
  email: string;
  planKey: string;
  planName: string;
  status: "active" | "trial" | "suspended" | "downgrade_pending";
  trialEndsAt?: string;
  bonusStorageBytes: number;
  overageAllowed: boolean;
  usedBytes: number;
  quotaBytes: number;
  usagePct: number;
}

export interface QuotaOverview {
  totalUsers: number;
  freeTierUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  trialUsers: number;
  overQuotaUsers: number;
  totalRevenueCents: number;
  avgUsagePct: number;
}

class CloudQuotaService {
  private static instance: CloudQuotaService;
  static getInstance() {
    if (!this.instance) this.instance = new CloudQuotaService();
    return this.instance;
  }

  getPlans(): CloudPlan[] {
    return [
      {
        id: "p1", planKey: "free", displayName: "Free",
        storageLimitBytes: 5_368_709_120, maxDevices: 3, maxFileSizeBytes: 104_857_600,
        features: ["5GB storage", "3 devices", "100MB file limit"],
        priceCents: 0, isActive: true,
      },
      {
        id: "p2", planKey: "pro", displayName: "Pro",
        storageLimitBytes: 107_374_182_400, maxDevices: 10, maxFileSizeBytes: 1_073_741_824,
        features: ["100GB storage", "10 devices", "1GB file limit", "Priority sync", "Version history"],
        priceCents: 999, isActive: true,
      },
      {
        id: "p3", planKey: "enterprise", displayName: "Enterprise",
        storageLimitBytes: 1_099_511_627_776, maxDevices: 50, maxFileSizeBytes: 5_368_709_120,
        features: ["1TB storage", "50 devices", "5GB file limit", "Priority sync", "Version history", "Admin tools", "SSO"],
        priceCents: 4999, isActive: true,
      },
    ];
  }

  getOverview(): QuotaOverview {
    return {
      totalUsers: 247,
      freeTierUsers: 189,
      proUsers: 48,
      enterpriseUsers: 10,
      trialUsers: 14,
      overQuotaUsers: 6,
      totalRevenueCents: 48 * 999 + 10 * 4999,
      avgUsagePct: 42,
    };
  }

  getUserAssignments(): UserPlanAssignment[] {
    const users: Array<[string, string, string, string, UserPlanAssignment["status"]]> = [
      ["Alice Chen", "alice@example.com", "pro", "Pro", "active"],
      ["Bob Martinez", "bob@example.com", "enterprise", "Enterprise", "active"],
      ["Carol Singh", "carol@example.com", "free", "Free", "active"],
      ["Dave Kim", "dave@example.com", "pro", "Pro", "trial"],
      ["Eve Johnson", "eve@example.com", "free", "Free", "active"],
      ["Frank Li", "frank@example.com", "pro", "Pro", "active"],
      ["Grace Okafor", "grace@example.com", "free", "Free", "suspended"],
      ["Hiro Tanaka", "hiro@example.com", "enterprise", "Enterprise", "active"],
    ];
    const limits: Record<string, number> = { free: 5_368_709_120, pro: 107_374_182_400, enterprise: 1_099_511_627_776 };
    return users.map(([name, email, planKey, planName, status]) => {
      const quota = limits[planKey];
      const used = Math.floor(Math.random() * quota * 0.95);
      return {
        userId: crypto.randomUUID(),
        userName: name,
        email,
        planKey,
        planName,
        status,
        trialEndsAt: status === "trial" ? new Date(Date.now() + 7 * 86400000).toISOString() : undefined,
        bonusStorageBytes: Math.random() > 0.7 ? 1_073_741_824 : 0,
        overageAllowed: planKey !== "free",
        usedBytes: used,
        quotaBytes: quota,
        usagePct: Math.round((used / quota) * 100),
      };
    });
  }

  async grantBonusStorage(userId: string, bytes: number): Promise<boolean> {
    await new Promise(r => setTimeout(r, 500));
    return true;
  }

  async changePlan(userId: string, newPlanKey: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 500));
    return true;
  }

  formatPrice(cents: number): string {
    return cents === 0 ? "Free" : `$${(cents / 100).toFixed(2)}/mo`;
  }
}

export const cloudQuotaService = CloudQuotaService.getInstance();
