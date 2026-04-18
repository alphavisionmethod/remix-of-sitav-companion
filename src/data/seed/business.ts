// SITA OS — Demo Data: Business

interface PlaybookDraft { category: "recovery" | "growth" | "retention" | "efficiency"; }
interface PlaybookRevenue { id: string; name: string; category: string; recovered: number; generated: number; actionsRun: number; successRate: number; roi: number; trend: number; }


export const DEMO_TRIGGER_EVENTS = [
  { value: "invoice-overdue", label: "Invoice becomes overdue" },
  { value: "lead-cold", label: "Lead goes cold (no activity 30d)" },
  { value: "customer-churn-risk", label: "Customer churn risk detected" },
  { value: "quote-stale", label: "Quote not viewed in 7 days" },
  { value: "payment-failed", label: "Payment attempt failed" },
  { value: "subscription-expiring", label: "Subscription expiring soon" },
  { value: "capacity-available", label: "Capacity becomes available" },
  { value: "deal-stage-change", label: "Deal stage changes" },
];

export const DEMO_CONDITION_FIELDS = [
  { value: "customer.ltv", label: "Customer LTV" },
  { value: "customer.health_score", label: "Health Score" },
  { value: "invoice.amount", label: "Invoice Amount" },
  { value: "invoice.days_overdue", label: "Days Overdue" },
  { value: "lead.score", label: "Lead Score" },
  { value: "deal.value", label: "Deal Value" },
  { value: "customer.segment", label: "Customer Segment" },
  { value: "customer.last_contact_days", label: "Days Since Contact" },
];

export const DEMO_BIZ_CATEGORIES: { value: PlaybookDraft["category"]; label: string; color: string }[] = [
  { value: "recovery", label: "Recovery", color: "bg-trust-safe/10 text-trust-safe" },
  { value: "growth", label: "Growth", color: "bg-accent/10 text-accent" },
  { value: "retention", label: "Retention", color: "bg-primary/10 text-primary" },
  { value: "efficiency", label: "Efficiency", color: "bg-muted text-muted-foreground" },
];

export const DEMO_PLAYBOOK_REVENUE: PlaybookRevenue[] = [
  { id: "receivable-recovery", name: "Receivable Recovery", category: "recovery", recovered: 47200, generated: 0, actionsRun: 142, successRate: 78, roi: 1240, trend: 12.5 },
  { id: "win-back-cold", name: "Win-Back Cold Customers", category: "recovery", recovered: 18600, generated: 8400, actionsRun: 89, successRate: 34, roi: 890, trend: 8.2 },
  { id: "leak-seal", name: "Leak Seal", category: "recovery", recovered: 12300, generated: 0, actionsRun: 67, successRate: 92, roi: 2100, trend: -3.1 },
  { id: "growth-accelerator", name: "Growth Accelerator", category: "growth", recovered: 0, generated: 31500, actionsRun: 204, successRate: 41, roi: 680, trend: 22.7 },
  { id: "churn-prevention", name: "Churn Prevention", category: "retention", recovered: 22800, generated: 5200, actionsRun: 53, successRate: 85, roi: 1560, trend: 15.3 },
  { id: "capacity-optimizer", name: "Capacity Optimizer", category: "efficiency", recovered: 0, generated: 9800, actionsRun: 31, successRate: 88, roi: 950, trend: 4.8 },
];
