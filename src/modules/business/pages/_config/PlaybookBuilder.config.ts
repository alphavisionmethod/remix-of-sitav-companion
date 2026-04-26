// ═══════════════════════════════════════════════════════════════
// SITA OS — PlaybookBuilder option-list configuration
// Pure UI option lists — not data fixtures.
// ═══════════════════════════════════════════════════════════════
import {
  Mail, MessageSquare, Phone, CheckCircle, AlertTriangle, DollarSign,
  RefreshCw, ArrowUpRight, Zap, GitBranch, Clock, Shield,
} from "lucide-react";
import type React from "react";
import type { AutoActionType } from "@/lib/domain-engines/autopilot-engine";

export interface PlaybookActionType {
  type: AutoActionType;
  label: string;
  icon: React.ElementType;
  color: string;
}

export const PLAYBOOK_ACTION_TYPES: PlaybookActionType[] = [
  { type: "email", label: "Send Email", icon: Mail, color: "bg-primary/15 text-primary" },
  { type: "sms", label: "Send SMS", icon: MessageSquare, color: "bg-accent/15 text-accent" },
  { type: "call", label: "Schedule Call", icon: Phone, color: "bg-trust-safe/15 text-trust-safe" },
  { type: "task", label: "Create Task", icon: CheckCircle, color: "bg-urgency-high/15 text-urgency-high" },
  { type: "escalation", label: "Escalate", icon: AlertTriangle, color: "bg-destructive/15 text-destructive" },
  { type: "discount", label: "Offer Discount", icon: DollarSign, color: "bg-trust-safe/15 text-trust-safe" },
  { type: "follow-up", label: "Follow Up", icon: RefreshCw, color: "bg-primary/15 text-primary" },
  { type: "upsell", label: "Upsell Offer", icon: ArrowUpRight, color: "bg-accent/15 text-accent" },
];

export type StepKind = "action" | "condition" | "delay" | "gate";

export interface PlaybookStepType {
  type: StepKind;
  label: string;
  icon: React.ElementType;
  description: string;
}

export const PLAYBOOK_STEP_TYPES: PlaybookStepType[] = [
  { type: "action", label: "Action", icon: Zap, description: "Execute an automation action" },
  { type: "condition", label: "Condition", icon: GitBranch, description: "Branch based on criteria" },
  { type: "delay", label: "Wait", icon: Clock, description: "Pause before next step" },
  { type: "gate", label: "Approval Gate", icon: Shield, description: "Require human approval" },
];

export interface FieldOption {
  value: string;
  label: string;
}

/** Fields available for conditional branching inside a playbook step. */
export const PLAYBOOK_CONDITION_FIELDS: FieldOption[] = [
  { value: "customer.ltv", label: "Customer LTV" },
  { value: "customer.health_score", label: "Health Score" },
  { value: "customer.lifecycle_stage", label: "Lifecycle Stage" },
  { value: "customer.days_since_contact", label: "Days Since Contact" },
  { value: "deal.amount", label: "Deal Amount" },
  { value: "deal.stage", label: "Deal Stage" },
  { value: "invoice.amount_overdue", label: "Invoice Amount Overdue" },
  { value: "invoice.days_overdue", label: "Invoice Days Overdue" },
  { value: "engagement.email_open_rate", label: "Email Open Rate" },
  { value: "engagement.last_reply_days", label: "Days Since Last Reply" },
];

/** Events that can trigger a playbook. */
export const PLAYBOOK_TRIGGER_EVENTS: FieldOption[] = [
  { value: "invoice-overdue", label: "Invoice Overdue" },
  { value: "deal-stalled", label: "Deal Stalled" },
  { value: "lead-created", label: "New Lead Created" },
  { value: "stage-changed", label: "Pipeline Stage Changed" },
  { value: "no-contact-30d", label: "No Contact in 30 Days" },
  { value: "health-dropped", label: "Health Score Dropped" },
  { value: "renewal-upcoming", label: "Renewal Upcoming" },
  { value: "trial-ending", label: "Trial Ending" },
  { value: "negative-reply", label: "Negative Reply Received" },
  { value: "manual-trigger", label: "Manual Trigger" },
];

export interface PlaybookCategory {
  value: "recovery" | "growth" | "retention" | "efficiency";
  label: string;
  color: string;
}

export const PLAYBOOK_CATEGORIES: PlaybookCategory[] = [
  { value: "recovery", label: "Recovery", color: "bg-destructive/15 text-destructive" },
  { value: "growth", label: "Growth", color: "bg-primary/15 text-primary" },
  { value: "retention", label: "Retention", color: "bg-trust-safe/15 text-trust-safe" },
  { value: "efficiency", label: "Efficiency", color: "bg-accent/15 text-accent" },
];

export interface QuickStartTemplate {
  label: string;
  steps: number;
  category: PlaybookCategory["value"];
}

export const PLAYBOOK_QUICK_START_TEMPLATES: QuickStartTemplate[] = [
  { label: "Overdue Invoice Chase", steps: 5, category: "recovery" },
  { label: "Cold Lead Re-engagement", steps: 4, category: "growth" },
  { label: "Churn Prevention", steps: 6, category: "retention" },
];