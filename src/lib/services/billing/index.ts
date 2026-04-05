// ═══════════════════════════════════════════════════════════════
// SITA OS — Billing Service
// Usage metering, subscription management, invoice generation
// ═══════════════════════════════════════════════════════════════

export interface BillingPlan { id: string; name: string; tier: 'free' | 'starter' | 'pro' | 'enterprise'; price: number; currency: string; features: string[]; limits: Record<string, number>; }
export interface UsageRecord { metricName: string; quantity: number; recordedAt: string; userId: string; }
export interface BillingInvoice { id: string; userId: string; planId: string; amount: number; currency: string; periodStart: string; periodEnd: string; status: 'draft' | 'issued' | 'paid' | 'overdue'; lineItems: { description: string; amount: number; quantity: number }[]; createdAt: string; }

export class BillingService {
  private plans: Map<string, BillingPlan> = new Map();
  private usage: UsageRecord[] = [];
  private invoices: BillingInvoice[] = [];

  registerPlan(plan: BillingPlan): void { this.plans.set(plan.id, plan); }
  getPlan(id: string): BillingPlan | undefined { return this.plans.get(id); }
  listPlans(): BillingPlan[] { return [...this.plans.values()]; }
  recordUsage(record: UsageRecord): void { this.usage.push(record); }
  getUsage(userId: string, from: string, to: string): UsageRecord[] { return this.usage.filter(u => u.userId === userId && u.recordedAt >= from && u.recordedAt <= to); }

  generateInvoice(userId: string, planId: string, periodStart: string, periodEnd: string): BillingInvoice {
    const plan = this.plans.get(planId);
    const invoice: BillingInvoice = {
      id: `inv-${Date.now()}`, userId, planId, amount: plan?.price ?? 0, currency: plan?.currency ?? 'USD',
      periodStart, periodEnd, status: 'draft', lineItems: [{ description: plan?.name ?? 'Subscription', amount: plan?.price ?? 0, quantity: 1 }],
      createdAt: new Date().toISOString(),
    };
    this.invoices.push(invoice);
    return invoice;
  }

  getInvoices(userId: string): BillingInvoice[] { return this.invoices.filter(i => i.userId === userId); }
  checkLimit(userId: string, metric: string, planId: string): { within: boolean; used: number; limit: number } {
    const plan = this.plans.get(planId);
    const limit = plan?.limits[metric] ?? Infinity;
    const used = this.usage.filter(u => u.userId === userId && u.metricName === metric).reduce((s, u) => s + u.quantity, 0);
    return { within: used < limit, used, limit };
  }
}

export const createBillingService = () => new BillingService();
