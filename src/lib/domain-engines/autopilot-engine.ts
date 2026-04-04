// ═══════════════════════════════════════════════════════════════
// SITA OS — Autopilot Engine
// Full-stack automation: playbooks, auto-actions, activity feed,
// next-best-action orchestration, and business digital twins
// Demo-first, integration-ready architecture
// Canonical contracts: WorkflowStatus, ExecutionMode from contracts
// ═══════════════════════════════════════════════════════════════

import type { WorkflowStatus as CanonicalWorkflowStatus, ExecutionMode as CanonicalExecutionMode } from "@/packages/contracts";

export type { CanonicalWorkflowStatus, CanonicalExecutionMode };

// ── Types ────────────────────────────────────────────────────────

export type PlaybookId = "win-back-cold" | "receivable-recovery" | "leak-seal" | "growth-accelerator" | "churn-prevention" | "capacity-optimizer";
export type AutoActionType = "email" | "sms" | "call" | "task" | "escalation" | "discount" | "payment-plan" | "follow-up" | "upsell";
export type ActionStatus = "queued" | "running" | "completed" | "failed" | "skipped" | "approval-required";
export type PlaybookStatus = "inactive" | "configuring" | "active" | "paused" | "completed";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Playbook {
  id: PlaybookId;
  name: string;
  description: string;
  icon: string;
  status: PlaybookStatus;
  category: "recovery" | "growth" | "retention" | "efficiency";
  automations: AutomationRule[];
  metrics: PlaybookMetrics;
  activatedAt?: number;
  estimatedRevenueLift: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  requiredIntegrations: string[];
  steps: PlaybookStep[];
}

export interface PlaybookStep {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: AutoActionType;
  delay: string;
  approvalGate: boolean;
  enabled: boolean;
}

export interface PlaybookMetrics {
  totalActionsRun: number;
  successRate: number;
  revenueRecovered: number;
  revenueGenerated: number;
  timeSavedHours: number;
  customersReached: number;
  lastRunAt?: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  action: AutoAction;
  enabled: boolean;
  approvalRequired: boolean;
  riskLevel: RiskLevel;
  lastTriggered?: number;
  executionCount: number;
}

export interface AutomationTrigger {
  type: "schedule" | "event" | "threshold" | "pattern";
  config: Record<string, unknown>;
  description: string;
}

export interface AutomationCondition {
  field: string;
  operator: "gt" | "lt" | "eq" | "contains" | "between" | "exists";
  value: unknown;
  description: string;
}

export interface AutoAction {
  type: AutoActionType;
  template?: string;
  channel?: string;
  params: Record<string, unknown>;
  fallback?: AutoAction;
}

export interface ActivityEvent {
  id: string;
  timestamp: number;
  playbookId?: PlaybookId;
  automationId?: string;
  type: "action-executed" | "action-queued" | "action-completed" | "action-failed" | "approval-requested" | "approval-granted" | "approval-denied" | "playbook-activated" | "playbook-paused" | "leak-detected" | "revenue-recovered" | "customer-reengaged" | "nba-recommended" | "digital-twin-updated";
  entityType: "customer" | "invoice" | "lead" | "quote" | "subscription" | "system";
  entityId: string;
  entityName: string;
  description: string;
  impact?: { type: "revenue" | "time" | "risk"; value: number; unit: string };
  status: ActionStatus;
  requiresAttention: boolean;
}

export interface NextBestAction {
  id: string;
  entityType: "customer" | "invoice" | "lead" | "quote";
  entityId: string;
  entityName: string;
  actionType: AutoActionType;
  description: string;
  expectedROI: number;
  confidence: number;
  urgency: RiskLevel;
  reasoning: string;
  alternativeActions: { type: AutoActionType; description: string; expectedROI: number }[];
  autoExecutable: boolean;
  estimatedImpactCents: number;
}

export interface BusinessDigitalTwin {
  id: string;
  entityType: "customer" | "segment" | "product" | "channel";
  entityName: string;
  healthScore: number;
  predictedRevenue30d: number;
  predictedChurnRisk: number;
  lastUpdated: number;
  signals: TwinSignal[];
  recommendedActions: string[];
}

export interface TwinSignal {
  name: string;
  value: number;
  trend: "up" | "down" | "stable";
  weight: number;
}

export interface AutopilotConfig {
  isOnboarded: boolean;
  approvalMode: "all" | "high-risk-only" | "none";
  activePlaybooks: PlaybookId[];
  notificationChannels: ("in-app" | "email" | "sms")[];
  maxAutoActionsPerDay: number;
  businessHoursOnly: boolean;
  timezone: string;
}

export interface AutopilotDashboard {
  config: AutopilotConfig;
  playbooks: Playbook[];
  activityFeed: ActivityEvent[];
  nextBestActions: NextBestAction[];
  digitalTwins: BusinessDigitalTwin[];
  stats: AutopilotStats;
}

export interface AutopilotStats {
  totalAutomationsToday: number;
  totalRevenueRecovered: number;
  totalRevenueGenerated: number;
  totalTimeSavedHours: number;
  activePlaybooksCount: number;
  pendingApprovals: number;
  healthScore: number;
  streakDays: number;
}

// ── Playbook Definitions ─────────────────────────────────────────

const PLAYBOOK_DEFS: Playbook[] = [
  {
    id: "win-back-cold", name: "Win Back Cold Customers", icon: "❄️",
    description: "Re-engage customers who haven't interacted in 30+ days with personalized outreach sequences",
    category: "recovery", status: "inactive", difficulty: "beginner",
    estimatedRevenueLift: 15200, requiredIntegrations: [],
    steps: [
      { id: "wb-1", name: "Detect Cold Customers", description: "Scan for customers with 30+ days of inactivity", trigger: "Daily at 9 AM", action: "task", delay: "0", approvalGate: false, enabled: true },
      { id: "wb-2", name: "Send Re-engagement Email", description: "Personalized 'We miss you' email with exclusive offer", trigger: "After detection", action: "email", delay: "1 hour", approvalGate: false, enabled: true },
      { id: "wb-3", name: "Follow-up SMS", description: "Friendly text if no email open in 48h", trigger: "No email open", action: "sms", delay: "48 hours", approvalGate: false, enabled: true },
      { id: "wb-4", name: "Personal Call", description: "Queue call for high-value cold customers ($5K+ LTV)", trigger: "No response to SMS", action: "call", delay: "72 hours", approvalGate: true, enabled: true },
      { id: "wb-5", name: "Special Discount Offer", description: "Auto-generate 15% comeback discount for persistent cold leads", trigger: "No response after call", action: "discount", delay: "5 days", approvalGate: true, enabled: true },
    ],
    automations: [], metrics: { totalActionsRun: 47, successRate: 68, revenueRecovered: 12400, revenueGenerated: 2800, timeSavedHours: 14, customersReached: 23, lastRunAt: Date.now() - 3600000 },
  },
  {
    id: "receivable-recovery", name: "Receivable Auto-Follow-Up", icon: "💰",
    description: "Automated chase sequences for overdue invoices with escalation ladders and payment plan offers",
    category: "recovery", status: "inactive", difficulty: "beginner",
    estimatedRevenueLift: 28500, requiredIntegrations: [],
    steps: [
      { id: "rr-1", name: "Detect Overdue Invoices", description: "Scan for invoices 1+ days past due", trigger: "Hourly check", action: "task", delay: "0", approvalGate: false, enabled: true },
      { id: "rr-2", name: "Friendly Reminder", description: "Gentle payment reminder with invoice attached", trigger: "1 day overdue", action: "email", delay: "0", approvalGate: false, enabled: true },
      { id: "rr-3", name: "Firm Follow-up", description: "Second reminder with payment link emphasis", trigger: "7 days overdue", action: "email", delay: "0", approvalGate: false, enabled: true },
      { id: "rr-4", name: "Phone Follow-up", description: "Personal call for invoices over $1,000", trigger: "14 days overdue", action: "call", delay: "0", approvalGate: false, enabled: true },
      { id: "rr-5", name: "Payment Plan Offer", description: "Auto-generate installment plan for 30+ day overdue", trigger: "30 days overdue", action: "payment-plan", delay: "0", approvalGate: true, enabled: true },
      { id: "rr-6", name: "Final Notice", description: "Formal notice before collections escalation", trigger: "60 days overdue", action: "escalation", delay: "0", approvalGate: true, enabled: true },
    ],
    automations: [], metrics: { totalActionsRun: 89, successRate: 74, revenueRecovered: 23500, revenueGenerated: 0, timeSavedHours: 22, customersReached: 31, lastRunAt: Date.now() - 1800000 },
  },
  {
    id: "leak-seal", name: "Revenue Leak Sealer", icon: "🔍",
    description: "Automatically detect and seal revenue leaks: stale quotes, abandoned follow-ups, subscription waste",
    category: "recovery", status: "inactive", difficulty: "intermediate",
    estimatedRevenueLift: 19800, requiredIntegrations: [],
    steps: [
      { id: "ls-1", name: "Scan All Revenue Streams", description: "Cross-reference leads, quotes, invoices, subscriptions for leaks", trigger: "Every 4 hours", action: "task", delay: "0", approvalGate: false, enabled: true },
      { id: "ls-2", name: "Auto-Create Recovery Tasks", description: "Generate prioritized recovery tasks per leak", trigger: "Leak detected", action: "task", delay: "0", approvalGate: false, enabled: true },
      { id: "ls-3", name: "Execute Low-Risk Recoveries", description: "Auto-send reminders for low-value, low-risk leaks", trigger: "Task created (low risk)", action: "email", delay: "30 min", approvalGate: false, enabled: true },
      { id: "ls-4", name: "Queue High-Risk for Approval", description: "Flag high-value leaks for manual review", trigger: "Task created (high risk)", action: "escalation", delay: "0", approvalGate: true, enabled: true },
    ],
    automations: [], metrics: { totalActionsRun: 156, successRate: 62, revenueRecovered: 18200, revenueGenerated: 1600, timeSavedHours: 36, customersReached: 45, lastRunAt: Date.now() - 7200000 },
  },
  {
    id: "growth-accelerator", name: "Growth Accelerator", icon: "🚀",
    description: "Identify and execute upsell, cross-sell, and referral opportunities from your existing customer base",
    category: "growth", status: "inactive", difficulty: "intermediate",
    estimatedRevenueLift: 34000, requiredIntegrations: [],
    steps: [
      { id: "ga-1", name: "Identify Upsell Candidates", description: "Find customers using 80%+ of plan limits", trigger: "Weekly scan", action: "task", delay: "0", approvalGate: false, enabled: true },
      { id: "ga-2", name: "Send Upgrade Suggestion", description: "Personalized email showing value of next tier", trigger: "Candidate identified", action: "email", delay: "2 hours", approvalGate: false, enabled: true },
      { id: "ga-3", name: "Referral Request", description: "Ask happy customers (NPS 9+) for referrals", trigger: "NPS score received", action: "email", delay: "24 hours", approvalGate: false, enabled: true },
      { id: "ga-4", name: "Cross-sell Recommendation", description: "Suggest complementary products based on usage patterns", trigger: "Usage pattern match", action: "upsell", delay: "0", approvalGate: true, enabled: true },
    ],
    automations: [], metrics: { totalActionsRun: 28, successRate: 42, revenueRecovered: 0, revenueGenerated: 8400, timeSavedHours: 8, customersReached: 15, lastRunAt: Date.now() - 86400000 },
  },
  {
    id: "churn-prevention", name: "Churn Prevention Shield", icon: "🛡️",
    description: "Predict and prevent customer churn with early warning signals and proactive retention campaigns",
    category: "retention", status: "inactive", difficulty: "advanced",
    estimatedRevenueLift: 42000, requiredIntegrations: [],
    steps: [
      { id: "cp-1", name: "Monitor Churn Signals", description: "Track declining usage, support tickets, payment issues", trigger: "Real-time monitoring", action: "task", delay: "0", approvalGate: false, enabled: true },
      { id: "cp-2", name: "Early Intervention Email", description: "Check-in email when churn risk exceeds 40%", trigger: "Churn risk > 40%", action: "email", delay: "0", approvalGate: false, enabled: true },
      { id: "cp-3", name: "Success Manager Alert", description: "Notify account manager for high-value at-risk accounts", trigger: "Churn risk > 60%, LTV > $5K", action: "escalation", delay: "0", approvalGate: false, enabled: true },
      { id: "cp-4", name: "Retention Offer", description: "Auto-generate retention discount or extended trial", trigger: "Churn risk > 80%", action: "discount", delay: "0", approvalGate: true, enabled: true },
    ],
    automations: [], metrics: { totalActionsRun: 12, successRate: 83, revenueRecovered: 0, revenueGenerated: 0, timeSavedHours: 6, customersReached: 8, lastRunAt: Date.now() - 43200000 },
  },
  {
    id: "capacity-optimizer", name: "Capacity Optimizer", icon: "⚡",
    description: "Fill cancellations, optimize scheduling, reduce waste in service capacity and subscriptions",
    category: "efficiency", status: "inactive", difficulty: "beginner",
    estimatedRevenueLift: 8900, requiredIntegrations: [],
    steps: [
      { id: "co-1", name: "Detect Open Capacity", description: "Scan for cancellations, no-shows, and underbooked slots", trigger: "Hourly", action: "task", delay: "0", approvalGate: false, enabled: true },
      { id: "co-2", name: "Notify Waitlist", description: "Auto-message waitlisted clients about open slots", trigger: "Capacity detected", action: "sms", delay: "5 min", approvalGate: false, enabled: true },
      { id: "co-3", name: "Subscription Audit", description: "Flag underused subscriptions for review or cancellation", trigger: "Monthly audit", action: "task", delay: "0", approvalGate: true, enabled: true },
    ],
    automations: [], metrics: { totalActionsRun: 34, successRate: 71, revenueRecovered: 4200, revenueGenerated: 3100, timeSavedHours: 12, customersReached: 19, lastRunAt: Date.now() - 14400000 },
  },
];

// ── Activity Feed Generator ──────────────────────────────────────

function generateActivityFeed(): ActivityEvent[] {
  const now = Date.now();
  return [
    { id: "act-1", timestamp: now - 120000, playbookId: "receivable-recovery", type: "action-executed", entityType: "invoice", entityId: "inv-1041", entityName: "Sarah Chen — INV-1041", description: "Sent friendly payment reminder email for $8,500 overdue invoice", impact: { type: "revenue", value: 850000, unit: "cents" }, status: "completed", requiresAttention: false },
    { id: "act-2", timestamp: now - 300000, playbookId: "win-back-cold", type: "customer-reengaged", entityType: "customer", entityId: "c-johnson", entityName: "Johnson & Co", description: "Customer opened re-engagement email — clicked 'View Exclusive Offer'", impact: { type: "revenue", value: 420000, unit: "cents" }, status: "completed", requiresAttention: false },
    { id: "act-3", timestamp: now - 600000, playbookId: "leak-seal", type: "leak-detected", entityType: "quote", entityId: "q-acme", entityName: "Acme Corp — Enterprise Plan", description: "Quote stale for 12 days — $45,000 at risk. Auto-nudge queued.", impact: { type: "revenue", value: 4500000, unit: "cents" }, status: "queued", requiresAttention: false },
    { id: "act-4", timestamp: now - 900000, type: "approval-requested", entityType: "customer", entityId: "c-bloom", entityName: "Bloom Studio", description: "Payment plan offer for $3,200 disputed invoice requires your approval", impact: { type: "revenue", value: 320000, unit: "cents" }, status: "approval-required", requiresAttention: true },
    { id: "act-5", timestamp: now - 1200000, playbookId: "churn-prevention", type: "nba-recommended", entityType: "customer", entityId: "c-premier", entityName: "Premier Design", description: "Churn risk elevated to 62% — recommended: schedule success check-in call", impact: { type: "risk", value: 62, unit: "%" }, status: "queued", requiresAttention: true },
    { id: "act-6", timestamp: now - 1800000, playbookId: "receivable-recovery", type: "revenue-recovered", entityType: "invoice", entityId: "inv-1035", entityName: "TechVentures — INV-1035", description: "Payment received: $15,000 collected after escalation sequence", impact: { type: "revenue", value: 1500000, unit: "cents" }, status: "completed", requiresAttention: false },
    { id: "act-7", timestamp: now - 2400000, playbookId: "capacity-optimizer", type: "action-completed", entityType: "system", entityId: "cap-audit", entityName: "Subscription Audit", description: "Identified 2 underused subscriptions ($238/mo total) — flagged for review", impact: { type: "revenue", value: 23800, unit: "cents/mo" }, status: "completed", requiresAttention: false },
    { id: "act-8", timestamp: now - 3600000, playbookId: "growth-accelerator", type: "action-executed", entityType: "customer", entityId: "c-nova", entityName: "NovaTech Solutions", description: "Sent personalized upsell email — usage at 92% of current plan limit", impact: { type: "revenue", value: 280000, unit: "cents" }, status: "completed", requiresAttention: false },
    { id: "act-9", timestamp: now - 5400000, type: "digital-twin-updated", entityType: "customer", entityId: "c-apex", entityName: "Apex Corp", description: "Digital twin updated: health score improved 72→81, payment pattern normalizing", status: "completed", requiresAttention: false },
    { id: "act-10", timestamp: now - 7200000, playbookId: "win-back-cold", type: "action-failed", entityType: "customer", entityId: "c-old", entityName: "Legacy Systems Ltd", description: "Re-engagement SMS failed — invalid phone number. Fallback: email queued.", status: "failed", requiresAttention: true },
  ];
}

// ── Next Best Action Engine ──────────────────────────────────────

function generateNextBestActions(): NextBestAction[] {
  return [
    {
      id: "nba-1", entityType: "invoice", entityId: "inv-1035", entityName: "TechVentures Inc",
      actionType: "call", description: "Call about $15,000 overdue invoice (47 days)", expectedROI: 15000,
      confidence: 78, urgency: "critical", autoExecutable: false, estimatedImpactCents: 1500000,
      reasoning: "Invoice 47 days overdue, 2 email reminders ignored. Phone call has 3.2x higher recovery rate for this aging bucket. Customer has paid after calls in past.",
      alternativeActions: [
        { type: "payment-plan", description: "Offer 3-month payment plan", expectedROI: 14200 },
        { type: "escalation", description: "Send formal demand letter", expectedROI: 12000 },
      ],
    },
    {
      id: "nba-2", entityType: "customer", entityId: "c-johnson", entityName: "Johnson & Co",
      actionType: "email", description: "Send exclusive comeback offer — 75 days inactive", expectedROI: 4200,
      confidence: 65, urgency: "high", autoExecutable: true, estimatedImpactCents: 420000,
      reasoning: "Repeat customer with $4,200 avg monthly revenue. Inactivity pattern matches successful reactivation cases. 15% discount offer has 68% acceptance rate for this segment.",
      alternativeActions: [
        { type: "call", description: "Personal re-engagement call", expectedROI: 5100 },
        { type: "sms", description: "Quick check-in text message", expectedROI: 2800 },
      ],
    },
    {
      id: "nba-3", entityType: "quote", entityId: "q-acme", entityName: "Acme Corp",
      actionType: "follow-up", description: "Follow up on $45,000 enterprise quote — 12 days stale", expectedROI: 29250,
      confidence: 55, urgency: "high", autoExecutable: true, estimatedImpactCents: 4500000,
      reasoning: "Enterprise quote opened 3 times but not responded. Competitor analysis shows they're evaluating alternatives. Proactive follow-up within 48h increases close rate by 41%.",
      alternativeActions: [
        { type: "discount", description: "Offer 10% early-decision discount", expectedROI: 26325 },
        { type: "call", description: "Schedule executive demo", expectedROI: 31500 },
      ],
    },
    {
      id: "nba-4", entityType: "customer", entityId: "c-premier", entityName: "Premier Design",
      actionType: "call", description: "Retention check-in — churn risk at 62%", expectedROI: 33600,
      confidence: 72, urgency: "high", autoExecutable: false, estimatedImpactCents: 3360000,
      reasoning: "12-month customer with $2,800/mo revenue. Usage dropped 45% in last 30 days. Support ticket volume up 3x. Proactive call reduces churn by 52% in similar cases.",
      alternativeActions: [
        { type: "email", description: "Send satisfaction survey", expectedROI: 16800 },
        { type: "discount", description: "Offer loyalty discount", expectedROI: 25200 },
      ],
    },
    {
      id: "nba-5", entityType: "lead", entityId: "l-lisa", entityName: "Lisa Chen",
      actionType: "email", description: "Re-engage warm lead — $28K opportunity, 9 days since contact", expectedROI: 18200,
      confidence: 61, urgency: "medium", autoExecutable: true, estimatedImpactCents: 2800000,
      reasoning: "Lead showed strong intent signals: downloaded whitepaper, attended webinar. 9-day gap is approaching cold threshold. Personalized follow-up has 74% open rate for this profile.",
      alternativeActions: [
        { type: "call", description: "Warm intro call", expectedROI: 22400 },
        { type: "sms", description: "Quick text with meeting link", expectedROI: 14000 },
      ],
    },
  ];
}

// ── Digital Twin Generator ───────────────────────────────────────

function generateDigitalTwins(): BusinessDigitalTwin[] {
  return [
    {
      id: "twin-1", entityType: "customer", entityName: "TechVentures Inc", healthScore: 42,
      predictedRevenue30d: 0, predictedChurnRisk: 0.35, lastUpdated: Date.now() - 3600000,
      signals: [
        { name: "Payment Behavior", value: 28, trend: "down", weight: 0.35 },
        { name: "Engagement Level", value: 15, trend: "down", weight: 0.25 },
        { name: "Support Sentiment", value: 65, trend: "stable", weight: 0.2 },
        { name: "Usage Frequency", value: 72, trend: "stable", weight: 0.2 },
      ],
      recommendedActions: ["Escalate collections", "Offer payment plan", "Schedule account review"],
    },
    {
      id: "twin-2", entityType: "customer", entityName: "Johnson & Co", healthScore: 31,
      predictedRevenue30d: 2100, predictedChurnRisk: 0.72, lastUpdated: Date.now() - 7200000,
      signals: [
        { name: "Engagement Level", value: 8, trend: "down", weight: 0.3 },
        { name: "Purchase Frequency", value: 12, trend: "down", weight: 0.3 },
        { name: "Support Sentiment", value: 55, trend: "down", weight: 0.2 },
        { name: "Referral Activity", value: 40, trend: "stable", weight: 0.2 },
      ],
      recommendedActions: ["Launch win-back campaign", "Personal outreach from account exec", "Offer exclusive incentive"],
    },
    {
      id: "twin-3", entityType: "customer", entityName: "Apex Corp", healthScore: 81,
      predictedRevenue30d: 4800, predictedChurnRisk: 0.08, lastUpdated: Date.now() - 1800000,
      signals: [
        { name: "Payment Behavior", value: 92, trend: "up", weight: 0.25 },
        { name: "Engagement Level", value: 85, trend: "up", weight: 0.25 },
        { name: "Usage Frequency", value: 78, trend: "stable", weight: 0.25 },
        { name: "NPS Score", value: 70, trend: "up", weight: 0.25 },
      ],
      recommendedActions: ["Upsell to premium tier", "Request referral", "Invite to case study"],
    },
    {
      id: "twin-4", entityType: "segment", entityName: "Enterprise Segment", healthScore: 67,
      predictedRevenue30d: 82000, predictedChurnRisk: 0.18, lastUpdated: Date.now() - 900000,
      signals: [
        { name: "Avg Deal Size", value: 75, trend: "up", weight: 0.3 },
        { name: "Pipeline Velocity", value: 62, trend: "stable", weight: 0.25 },
        { name: "Win Rate", value: 58, trend: "down", weight: 0.25 },
        { name: "Expansion Revenue", value: 71, trend: "up", weight: 0.2 },
      ],
      recommendedActions: ["Invest in enterprise sales enablement", "Launch targeted ABM campaign", "Review pricing strategy"],
    },
    {
      id: "twin-5", entityType: "channel", entityName: "Inbound Marketing", healthScore: 74,
      predictedRevenue30d: 35000, predictedChurnRisk: 0, lastUpdated: Date.now() - 5400000,
      signals: [
        { name: "Lead Volume", value: 82, trend: "up", weight: 0.3 },
        { name: "Conversion Rate", value: 45, trend: "down", weight: 0.3 },
        { name: "Cost per Lead", value: 68, trend: "stable", weight: 0.2 },
        { name: "Lead Quality Score", value: 88, trend: "up", weight: 0.2 },
      ],
      recommendedActions: ["Optimize landing page conversion", "A/B test CTA copy", "Increase content frequency"],
    },
  ];
}

// ── Customer Autopilot Intelligence ──────────────────────────────

export interface CustomerAutopilotInsight {
  customerId: string;
  customerName: string;
  status: "cold" | "at-risk" | "healthy" | "champion";
  daysSinceContact: number;
  lifetimeRevenue: number;
  healthScore: number;
  churnRisk: number;
  nextBestAction: NextBestAction | null;
  activePlaybooks: PlaybookId[];
  recentActivity: ActivityEvent[];
  twin: BusinessDigitalTwin | null;
  callbackScheduled: boolean;
  callbackDate?: string;
  autopilotActions: { total: number; completed: number; pending: number };
}

export interface CallbackEntry {
  id: string;
  customerId: string;
  customerName: string;
  scheduledAt: string;
  reason: string;
  priority: RiskLevel;
  status: "scheduled" | "completed" | "missed" | "rescheduled";
  assignedTo?: string;
  outcome?: string;
  revenueAtStake: number;
}

export interface QuoteFollowThrough {
  id: string;
  quoteId: string;
  customerName: string;
  quoteValue: number;
  sentDaysAgo: number;
  viewCount: number;
  lastViewedAt?: number;
  followUpsSent: number;
  status: "pending" | "followed-up" | "converted" | "lost" | "expired";
  nextAction: string;
  winProbability: number;
  autoFollowUpEnabled: boolean;
}

export function analyzeCustomerForAutopilot(customer: {
  id: string; name: string; status: string; health_score: number | null;
  lifetime_revenue: number | null; last_contact_at: string | null;
}): CustomerAutopilotInsight {
  const daysSinceContact = customer.last_contact_at
    ? Math.floor((Date.now() - new Date(customer.last_contact_at).getTime()) / 86400000)
    : 999;
  const health = customer.health_score ?? 80;
  const revenue = customer.lifetime_revenue ?? 0;

  let status: CustomerAutopilotInsight["status"] = "healthy";
  if (daysSinceContact > 60 || customer.status === "inactive") status = "cold";
  else if (health < 50) status = "at-risk";
  else if (health >= 85 && revenue > 10000) status = "champion";

  const churnRisk = status === "cold" ? 0.75 : status === "at-risk" ? 0.55 : status === "champion" ? 0.05 : 0.15;

  const nba: NextBestAction | null = (status === "cold" || status === "at-risk") ? {
    id: `nba-cust-${customer.id}`,
    entityType: "customer", entityId: customer.id, entityName: customer.name,
    actionType: status === "cold" ? "email" : "call",
    description: status === "cold"
      ? `Re-engage ${customer.name} — ${daysSinceContact} days inactive, $${revenue.toLocaleString()} lifetime`
      : `Retention check-in for ${customer.name} — health score ${health}%`,
    expectedROI: Math.round(revenue * (status === "cold" ? 0.3 : 0.5)),
    confidence: status === "cold" ? 58 : 72,
    urgency: status === "cold" && revenue > 5000 ? "critical" : "high",
    autoExecutable: status === "cold",
    estimatedImpactCents: revenue * 100,
    reasoning: status === "cold"
      ? `Customer inactive for ${daysSinceContact} days. Re-engagement email has 68% open rate for this inactivity bracket. Estimated 30% reactivation probability.`
      : `Health score declining. Proactive outreach reduces churn by 52% in similar cases.`,
    alternativeActions: [
      { type: "call" as const, description: "Personal outreach call", expectedROI: Math.round(revenue * 0.4) },
      { type: "discount" as const, description: "Send comeback incentive", expectedROI: Math.round(revenue * 0.25) },
    ],
  } : null;

  return {
    customerId: customer.id, customerName: customer.name,
    status, daysSinceContact, lifetimeRevenue: revenue, healthScore: health,
    churnRisk, nextBestAction: nba,
    activePlaybooks: status === "cold" ? ["win-back-cold"] : status === "at-risk" ? ["churn-prevention"] : [],
    recentActivity: [], twin: null,
    callbackScheduled: false,
    autopilotActions: { total: status === "cold" ? 3 : status === "at-risk" ? 2 : 0, completed: 0, pending: status === "cold" ? 3 : status === "at-risk" ? 2 : 0 },
  };
}

export function getCallbackQueue(): CallbackEntry[] {
  return [
    { id: "cb-1", customerId: "c-johnson", customerName: "Johnson & Co", scheduledAt: new Date(Date.now() + 3600000).toISOString(), reason: "Cold customer re-engagement — 75 days inactive", priority: "critical", status: "scheduled", revenueAtStake: 50400 },
    { id: "cb-2", customerId: "c-premier", customerName: "Premier Design", scheduledAt: new Date(Date.now() + 7200000).toISOString(), reason: "Churn risk elevated — health score dropped to 38%", priority: "high", status: "scheduled", revenueAtStake: 33600 },
    { id: "cb-3", customerId: "c-techv", customerName: "TechVentures Inc", scheduledAt: new Date(Date.now() + 14400000).toISOString(), reason: "Overdue invoice follow-up — $15,000 outstanding", priority: "critical", status: "scheduled", revenueAtStake: 15000 },
    { id: "cb-4", customerId: "c-bloom", customerName: "Bloom Studio", scheduledAt: new Date(Date.now() + 86400000).toISOString(), reason: "Dispute resolution follow-up", priority: "medium", status: "scheduled", revenueAtStake: 3200 },
    { id: "cb-5", customerId: "c-nova", customerName: "NovaTech Solutions", scheduledAt: new Date(Date.now() - 3600000).toISOString(), reason: "Upsell discussion — usage at 92%", priority: "medium", status: "missed", revenueAtStake: 28000 },
  ];
}

export function getQuoteFollowThroughs(): QuoteFollowThrough[] {
  return [
    { id: "qft-1", quoteId: "q-acme", customerName: "Acme Corp", quoteValue: 45000, sentDaysAgo: 12, viewCount: 3, lastViewedAt: Date.now() - 172800000, followUpsSent: 1, status: "pending", nextAction: "Send personalized follow-up with ROI analysis", winProbability: 0.55, autoFollowUpEnabled: true },
    { id: "qft-2", quoteId: "q-startup", customerName: "StartupXYZ", quoteValue: 6000, sentDaysAgo: 5, viewCount: 1, lastViewedAt: Date.now() - 259200000, followUpsSent: 0, status: "pending", nextAction: "First follow-up — highlight quick wins", winProbability: 0.4, autoFollowUpEnabled: true },
    { id: "qft-3", quoteId: "q-mega", customerName: "MegaCorp International", quoteValue: 120000, sentDaysAgo: 21, viewCount: 5, lastViewedAt: Date.now() - 86400000, followUpsSent: 3, status: "followed-up", nextAction: "Schedule executive presentation", winProbability: 0.65, autoFollowUpEnabled: false },
    { id: "qft-4", quoteId: "q-rapid", customerName: "Rapid Growth Ltd", quoteValue: 18500, sentDaysAgo: 8, viewCount: 0, followUpsSent: 1, status: "pending", nextAction: "Re-send quote — may not have received", winProbability: 0.25, autoFollowUpEnabled: true },
  ];
}

// ── Public API ────────────────────────────────────────────────────

export function getDefaultConfig(): AutopilotConfig {
  return {
    isOnboarded: false,
    approvalMode: "high-risk-only",
    activePlaybooks: [],
    notificationChannels: ["in-app"],
    maxAutoActionsPerDay: 50,
    businessHoursOnly: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export function getPlaybooks(): Playbook[] {
  return PLAYBOOK_DEFS.map(p => ({ ...p }));
}

export function activatePlaybook(playbooks: Playbook[], id: PlaybookId): Playbook[] {
  return playbooks.map(p => p.id === id ? { ...p, status: "active" as const, activatedAt: Date.now() } : p);
}

export function pausePlaybook(playbooks: Playbook[], id: PlaybookId): Playbook[] {
  return playbooks.map(p => p.id === id ? { ...p, status: "paused" as const } : p);
}

export function getActivityFeed(): ActivityEvent[] {
  return generateActivityFeed();
}

export function getNextBestActions(): NextBestAction[] {
  return generateNextBestActions();
}

export function getDigitalTwins(): BusinessDigitalTwin[] {
  return generateDigitalTwins();
}

export function computeAutopilotStats(playbooks: Playbook[], feed: ActivityEvent[]): AutopilotStats {
  const activePlaybooks = playbooks.filter(p => p.status === "active");
  const totalRecovered = playbooks.reduce((s, p) => s + p.metrics.revenueRecovered, 0);
  const totalGenerated = playbooks.reduce((s, p) => s + p.metrics.revenueGenerated, 0);
  const totalTime = playbooks.reduce((s, p) => s + p.metrics.timeSavedHours, 0);
  const pendingApprovals = feed.filter(e => e.requiresAttention).length;
  const todayActions = feed.filter(e => e.timestamp > Date.now() - 86400000).length;

  return {
    totalAutomationsToday: todayActions,
    totalRevenueRecovered: totalRecovered,
    totalRevenueGenerated: totalGenerated,
    totalTimeSavedHours: totalTime,
    activePlaybooksCount: activePlaybooks.length,
    pendingApprovals,
    healthScore: Math.min(100, 40 + activePlaybooks.length * 10 + Math.round(totalRecovered / 1000)),
    streakDays: 14,
  };
}

export function buildDashboard(config: AutopilotConfig): AutopilotDashboard {
  const playbooks = getPlaybooks().map(p =>
    config.activePlaybooks.includes(p.id) ? { ...p, status: "active" as const, activatedAt: Date.now() - 86400000 * 3 } : p
  );
  const feed = getActivityFeed();
  return {
    config,
    playbooks,
    activityFeed: feed,
    nextBestActions: getNextBestActions(),
    digitalTwins: getDigitalTwins(),
    stats: computeAutopilotStats(playbooks, feed),
  };
}
