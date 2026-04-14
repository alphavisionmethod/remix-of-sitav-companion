// ═══════════════════════════════════════════════════════════════
// Adaptive Notification Engine
// Ranks, filters, and contextualizes notifications based on
// the current business archetype — ensures the most relevant
// signals surface first.
// ═══════════════════════════════════════════════════════════════

import type { ProfileArchetype, OperatingFlags } from "./business-profile-engine";

export type NotificationCategory =
  | "cart_abandoned" | "order_placed" | "payment_received" | "payment_failed"
  | "lead_new" | "lead_stale" | "follow_up_due" | "deal_won" | "deal_lost" | "deal_stalled"
  | "appointment_upcoming" | "appointment_noshow" | "appointment_cancelled"
  | "task_overdue" | "task_completed" | "task_assigned"
  | "contact_at_risk" | "contact_churned" | "contact_reactivated"
  | "invoice_overdue" | "proposal_viewed" | "proposal_expired"
  | "review_new" | "support_ticket" | "team_alert"
  | "advisor_insight" | "boardroom_decision" | "profile_drift";

export interface BusinessNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  read: boolean;
  actionUrl?: string;
}

export interface RankedNotification extends BusinessNotification {
  relevanceScore: number;
  archetypeBoost: number;
  displayPriority: number;
}

/**
 * Per-archetype category relevance multipliers.
 * Higher = more important for that business type.
 */
const CATEGORY_WEIGHTS: Record<string, Partial<Record<NotificationCategory, number>>> = {
  ecommerce: {
    cart_abandoned: 3.0, order_placed: 2.5, payment_received: 2.0, payment_failed: 3.0,
    lead_new: 1.5, deal_won: 1.5, contact_at_risk: 1.8, review_new: 2.0,
    invoice_overdue: 1.5, proposal_viewed: 0.5, appointment_upcoming: 0.3,
  },
  service: {
    follow_up_due: 3.0, proposal_viewed: 2.8, deal_stalled: 2.5, lead_new: 2.0,
    invoice_overdue: 2.5, deal_won: 2.0, contact_at_risk: 2.0, task_overdue: 2.0,
    cart_abandoned: 0.2, order_placed: 0.3, appointment_upcoming: 1.5,
  },
  "brick-and-mortar": {
    appointment_upcoming: 3.0, appointment_noshow: 2.8, review_new: 2.5,
    contact_reactivated: 2.0, lead_new: 2.0, payment_received: 1.8,
    cart_abandoned: 0.2, proposal_viewed: 0.3, deal_stalled: 1.0,
  },
  "employee-based": {
    task_overdue: 3.0, task_assigned: 2.5, team_alert: 2.5, deal_stalled: 2.0,
    follow_up_due: 2.0, contact_at_risk: 1.5, invoice_overdue: 1.5,
    cart_abandoned: 0.1, appointment_upcoming: 1.0,
  },
  "appointment-based": {
    appointment_upcoming: 3.0, appointment_noshow: 3.0, appointment_cancelled: 2.5,
    follow_up_due: 2.0, payment_received: 2.0, invoice_overdue: 2.5,
    contact_at_risk: 1.8, lead_new: 1.5, cart_abandoned: 0.1,
  },
  agency: {
    deal_stalled: 3.0, proposal_viewed: 2.8, proposal_expired: 2.5, follow_up_due: 2.5,
    deal_won: 2.5, invoice_overdue: 2.5, task_overdue: 2.0, lead_new: 2.0,
    contact_at_risk: 2.0, cart_abandoned: 0.1, appointment_upcoming: 1.5,
  },
  "professional-practice": {
    appointment_upcoming: 3.0, appointment_noshow: 2.8, follow_up_due: 2.5,
    invoice_overdue: 2.0, contact_at_risk: 2.0, task_overdue: 1.8,
    support_ticket: 2.0, cart_abandoned: 0.1,
  },
  membership: {
    contact_churned: 3.0, contact_at_risk: 2.8, payment_failed: 2.5,
    contact_reactivated: 2.0, invoice_overdue: 2.0, lead_new: 1.5,
    cart_abandoned: 1.0, appointment_upcoming: 0.5,
  },
  marketplace: {
    order_placed: 2.5, payment_received: 2.5, payment_failed: 3.0,
    support_ticket: 2.5, review_new: 2.0, lead_new: 1.5, contact_at_risk: 1.5,
  },
};

const SEVERITY_BASE: Record<string, number> = {
  critical: 10, high: 7, medium: 4, low: 1,
};

/**
 * Rank notifications by archetype relevance + severity.
 */
export function rankNotifications(
  notifications: BusinessNotification[],
  primaryMode: ProfileArchetype,
  flags: OperatingFlags
): RankedNotification[] {
  const weights = CATEGORY_WEIGHTS[primaryMode] || CATEGORY_WEIGHTS.service || {};

  return notifications
    .map(n => {
      const archetypeBoost = weights[n.category] ?? 1.0;
      const severityBase = SEVERITY_BASE[n.severity] || 1;
      const recencyBoost = getRecencyBoost(n.timestamp);
      const readPenalty = n.read ? 0.3 : 1.0;

      // Flag-based adjustments
      let flagBoost = 1.0;
      if (!flags.hasAppointments && n.category.startsWith("appointment_")) flagBoost = 0.1;
      if (!flags.hasEcommerce && (n.category === "cart_abandoned" || n.category === "order_placed")) flagBoost = 0.1;

      const relevanceScore = severityBase * archetypeBoost * recencyBoost * readPenalty * flagBoost;

      return {
        ...n,
        relevanceScore,
        archetypeBoost,
        displayPriority: Math.round(relevanceScore * 100),
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function getRecencyBoost(timestamp: string): number {
  const hours = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60);
  if (hours < 1) return 2.0;
  if (hours < 4) return 1.5;
  if (hours < 24) return 1.2;
  if (hours < 72) return 1.0;
  return 0.7;
}

/**
 * Get the top notification categories to highlight for this archetype.
 */
export function getTopCategories(primaryMode: ProfileArchetype): NotificationCategory[] {
  const weights = CATEGORY_WEIGHTS[primaryMode] || CATEGORY_WEIGHTS.service || {};
  return (Object.entries(weights) as [NotificationCategory, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat);
}

/**
 * Generate demo notifications for a given archetype.
 */
export function generateDemoNotifications(primaryMode: ProfileArchetype): BusinessNotification[] {
  const now = new Date();
  const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600000).toISOString();

  const base: BusinessNotification[] = [
    { id: "n1", category: "lead_new", title: "New lead arrived", body: "Sarah Chen from TechCorp submitted a contact form", timestamp: h(0.5), severity: "medium", read: false },
    { id: "n2", category: "follow_up_due", title: "Follow-up overdue", body: "Marcus Williams — 3 days past scheduled follow-up", timestamp: h(2), severity: "high", read: false },
    { id: "n3", category: "deal_won", title: "Deal closed!", body: "Project Lighthouse — $24,000", timestamp: h(4), severity: "low", read: false },
    { id: "n4", category: "contact_at_risk", title: "Contact drifting", body: "Alex Rivera hasn't engaged in 21 days", timestamp: h(6), severity: "high", read: false },
    { id: "n5", category: "task_overdue", title: "Task overdue", body: "Prepare Q2 presentation — due yesterday", timestamp: h(8), severity: "medium", read: false },
    { id: "n6", category: "advisor_insight", title: "Advisor insight", body: "Pipeline velocity has slowed 15% this week", timestamp: h(12), severity: "medium", read: false },
    { id: "n7", category: "invoice_overdue", title: "Invoice past due", body: "INV-2024-089 — $3,200 overdue by 5 days", timestamp: h(18), severity: "critical", read: false },
    { id: "n8", category: "boardroom_decision", title: "Boardroom decision ready", body: "Pricing strategy review requires your approval", timestamp: h(24), severity: "high", read: false },
  ];

  // Add archetype-specific notifications
  if (primaryMode === "ecommerce") {
    base.push(
      { id: "ne1", category: "cart_abandoned", title: "Cart abandoned", body: "3 carts worth $450 abandoned in the last hour", timestamp: h(0.3), severity: "high", read: false },
      { id: "ne2", category: "order_placed", title: "New order", body: "Order #4521 — $127 from returning customer", timestamp: h(1), severity: "low", read: false },
      { id: "ne3", category: "payment_failed", title: "Payment failed", body: "Subscription renewal failed for 2 customers", timestamp: h(3), severity: "critical", read: false },
    );
  } else if (primaryMode === "appointment-based" || primaryMode === "professional-practice") {
    base.push(
      { id: "na1", category: "appointment_upcoming", title: "Appointment in 30 min", body: "Dr. consultation with Emily Park", timestamp: h(0.1), severity: "high", read: false },
      { id: "na2", category: "appointment_noshow", title: "No-show detected", body: "10:00 AM slot — James Miller didn't arrive", timestamp: h(1.5), severity: "high", read: false },
    );
  } else if (primaryMode === "agency") {
    base.push(
      { id: "nag1", category: "proposal_viewed", title: "Proposal viewed", body: "Client viewed your $48K proposal 3 times", timestamp: h(0.8), severity: "medium", read: false },
      { id: "nag2", category: "proposal_expired", title: "Proposal expiring", body: "Acme Corp proposal expires in 48 hours", timestamp: h(5), severity: "high", read: false },
    );
  }

  return base;
}
