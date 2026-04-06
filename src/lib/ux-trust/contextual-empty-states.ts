// ═══════════════════════════════════════════════════════════════
// SITA OS — Contextual Empty States
// Domain-specific empty states with smart suggestions
// ═══════════════════════════════════════════════════════════════

import { type LucideIcon, Briefcase, DollarSign, Headphones, FileText, Users, Zap, Shield, Settings, Brain, BarChart3 } from "lucide-react";

export interface ContextualEmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  tip: string;
  actions: Array<{ label: string; to: string }>;
}

/** Pre-configured empty states for every major domain */
export const CONTEXTUAL_EMPTY_STATES: Record<string, ContextualEmptyStateConfig> = {
  business: {
    icon: Briefcase,
    title: "Your business command center awaits",
    description: "Track leads, customers, revenue pipelines, and invoices — all in one sovereign view.",
    tip: "SITA will surface opportunities and risks automatically once you add data.",
    actions: [
      { label: "Add First Lead", to: "/business/leads" },
      { label: "Import Data", to: "/files" },
    ],
  },
  money: {
    icon: DollarSign,
    title: "Take control of your financial posture",
    description: "Bills, subscriptions, budgets, and cash flow — with AI-powered waste detection.",
    tip: "Connect your bank or upload statements to get started instantly.",
    actions: [
      { label: "Add Bill", to: "/money/bills" },
      { label: "Track Subscriptions", to: "/money/subscriptions" },
    ],
  },
  concierge: {
    icon: Headphones,
    title: "Your personal operations assistant",
    description: "Household tasks, family calendar, meal planning, and life logistics — delegated to SITA.",
    tip: "Start with a single task and SITA learns your preferences over time.",
    actions: [
      { label: "Add Task", to: "/concierge/tasks" },
      { label: "Family Calendar", to: "/concierge/calendar" },
    ],
  },
  files: {
    icon: FileText,
    title: "Sovereign document management",
    description: "Upload, organize, and search your documents with AI-powered classification and sensitivity detection.",
    tip: "Drag and drop files anywhere to upload instantly.",
    actions: [
      { label: "Upload Files", to: "/files" },
      { label: "Connect Storage", to: "/files/settings" },
    ],
  },
  customers: {
    icon: Users,
    title: "Build your relationship graph",
    description: "Track customer health, revenue per relationship, and engagement patterns.",
    tip: "Import from CSV or add customers one by one.",
    actions: [
      { label: "Add Customer", to: "/business/customers" },
      { label: "Import CSV", to: "/files" },
    ],
  },
  automation: {
    icon: Zap,
    title: "Automate your recurring operations",
    description: "Build workflows that run on autopilot — approval chains, notifications, and scheduled tasks.",
    tip: "Start with a template workflow and customize it.",
    actions: [
      { label: "Create Workflow", to: "/automation" },
      { label: "Browse Templates", to: "/automation" },
    ],
  },
  policies: {
    icon: Shield,
    title: "Define your governance rules",
    description: "Set spending limits, approval requirements, and operational boundaries for SITA.",
    tip: "Policies help SITA act within your comfort zone.",
    actions: [
      { label: "Create Policy", to: "/policies" },
    ],
  },
  settings: {
    icon: Settings,
    title: "Configure your SITA instance",
    description: "Personalize themes, notifications, integrations, and security settings.",
    tip: "Most settings can be changed at any time.",
    actions: [
      { label: "Open Settings", to: "/settings" },
    ],
  },
  intelligence: {
    icon: Brain,
    title: "Your AI intelligence layer",
    description: "SITA learns patterns from your data and surfaces insights, anomalies, and opportunities.",
    tip: "Intelligence improves as more data flows through your system.",
    actions: [
      { label: "View Insights", to: "/intelligence" },
    ],
  },
  reports: {
    icon: BarChart3,
    title: "Generate sovereign reports",
    description: "Create financial summaries, performance dashboards, and compliance reports.",
    tip: "Reports pull from your live data — always up to date.",
    actions: [
      { label: "Create Report", to: "/reports" },
    ],
  },
};

/** Get a contextual empty state by domain key, with fallback */
export function getContextualEmptyState(domain: string): ContextualEmptyStateConfig {
  return CONTEXTUAL_EMPTY_STATES[domain] ?? {
    icon: Briefcase,
    title: "Nothing here yet",
    description: "This space will populate as you add data and configure your system.",
    tip: "Start by exploring the sidebar navigation.",
    actions: [{ label: "Get Started", to: "/" }],
  };
}
