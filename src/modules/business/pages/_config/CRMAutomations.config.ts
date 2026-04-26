// ═══════════════════════════════════════════════════════════════
// SITA OS — CRMAutomations page configuration constants
// Extracted to keep the page file free of fixture-shaped arrays.
// ═══════════════════════════════════════════════════════════════
import {
  Zap, Users, Mail, AlertTriangle, TrendingUp, Shield, Clock, Bell,
  Target, FileText, Receipt, Phone, Brain, RefreshCw, Sparkles, Eye,
} from "lucide-react";
import type React from "react";

export interface TriggerType {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

export const AUTOMATION_TRIGGER_TYPES: TriggerType[] = [
  { key: "contact_created", label: "Contact Created", icon: Users, description: "When a new contact is added" },
  { key: "stage_changed", label: "Stage Changed", icon: TrendingUp, description: "When lifecycle stage changes" },
  { key: "no_contact_days", label: "No Contact (Days)", icon: Clock, description: "When contact has no interaction for X days" },
  { key: "health_threshold", label: "Health Threshold", icon: AlertTriangle, description: "When health score crosses a threshold" },
  { key: "health_declining", label: "Health Declining", icon: RefreshCw, description: "When health drops significantly" },
  { key: "opportunity_stalled", label: "Deal Stalled", icon: Target, description: "When an opportunity stops progressing" },
  { key: "invoice_overdue", label: "Invoice Overdue", icon: Receipt, description: "When an invoice passes due date" },
  { key: "quote_no_reply", label: "Quote No Reply", icon: FileText, description: "When a sent quote goes unanswered" },
  { key: "manual", label: "Manual Trigger", icon: Zap, description: "Run manually or on-demand" },
];

export interface ActionType {
  key: string;
  label: string;
  icon: React.ElementType;
}

export const AUTOMATION_ACTION_TYPES: ActionType[] = [
  { key: "create_task", label: "Create Task", icon: Target },
  { key: "assign_owner", label: "Assign Owner", icon: Users },
  { key: "send_notification", label: "Send Notification", icon: Bell },
  { key: "draft_email", label: "Draft Email", icon: Mail },
  { key: "update_stage", label: "Update Stage", icon: TrendingUp },
  { key: "notify_advisor", label: "Notify Advisor", icon: Brain },
  { key: "create_advisor_insight", label: "Create Advisor Insight", icon: Sparkles },
  { key: "suggest_recovery", label: "Suggest Recovery Plan", icon: RefreshCw },
  { key: "compile_evidence", label: "Compile Evidence", icon: FileText },
  { key: "create_boardroom_item", label: "Escalate to Boardroom", icon: Shield },
  { key: "queue_for_review", label: "Queue for Review", icon: Eye },
  { key: "notify_owner", label: "Notify Owner", icon: Phone },
];

export interface TrustGate {
  key: string;
  label: string;
  description: string;
  color: string;
  bg: string;
}

export const AUTOMATION_TRUST_GATES: TrustGate[] = [
  { key: "suggested", label: "Suggested Only", description: "Shows as a suggestion — no auto-execution", color: "text-muted-foreground", bg: "bg-muted/50" },
  { key: "simulation", label: "Simulation", description: "Runs in dry-run mode — shows what would happen", color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "approval_required", label: "Approval Required", description: "Queues for human approval before executing", color: "text-orange-400", bg: "bg-orange-500/10" },
  { key: "active", label: "Auto-Execute", description: "Runs automatically when triggered", color: "text-green-400", bg: "bg-green-500/10" },
  { key: "paused", label: "Paused", description: "Temporarily disabled", color: "text-yellow-400", bg: "bg-yellow-500/10" },
];

export const AUTOMATION_ENTITY_TYPES = [
  { key: "contact", label: "Contact" },
  { key: "company", label: "Company" },
  { key: "opportunity", label: "Opportunity" },
] as const;

export interface AutomationCategory {
  key: string;
  label: string;
  triggers?: string[];
}

export const AUTOMATION_CATEGORIES: AutomationCategory[] = [
  { key: "all", label: "All" },
  { key: "engagement", label: "Engagement", triggers: ["contact_created", "no_contact_days", "stage_changed"] },
  { key: "pipeline", label: "Pipeline", triggers: ["opportunity_stalled", "quote_no_reply", "invoice_overdue"] },
  { key: "health", label: "Health", triggers: ["health_threshold", "health_declining"] },
  { key: "escalation", label: "Escalation", triggers: ["opportunity_stalled"] },
];

export const getTrustGate = (key: string): TrustGate =>
  AUTOMATION_TRUST_GATES.find((t) => t.key === key) ?? AUTOMATION_TRUST_GATES[0];

export const getTrigger = (key: string): TriggerType =>
  AUTOMATION_TRIGGER_TYPES.find((t) => t.key === key) ??
  AUTOMATION_TRIGGER_TYPES[AUTOMATION_TRIGGER_TYPES.length - 1];