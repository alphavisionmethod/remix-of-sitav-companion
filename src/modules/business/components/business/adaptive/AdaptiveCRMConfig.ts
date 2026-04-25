// ═══════════════════════════════════════════════════════════════
// Adaptive CRM Configuration
// Per-archetype CRM adaptations: language, fields, segments, stages
// Consumed by CRMHome, CRMContacts, CRMPipeline
// ═══════════════════════════════════════════════════════════════

import type { CRMAdaptation, ProfileArchetype } from "@/domains/engines/business-profile-engine";

// Re-export for convenience — the engine already has full configs,
// this file provides quick-access helpers and extension points.

export interface AdaptiveQuickAction {
  id: string;
  label: string;
  icon: string;
  archetype: ProfileArchetype;
  priority: number;
}

export const ADAPTIVE_QUICK_ACTIONS: AdaptiveQuickAction[] = [
  // Ecommerce
  { id: "view-orders", label: "View Orders", icon: "ShoppingCart", archetype: "ecommerce", priority: 1 },
  { id: "recover-carts", label: "Recover Carts", icon: "RefreshCw", archetype: "ecommerce", priority: 2 },
  { id: "segment-buyers", label: "Segment Buyers", icon: "Filter", archetype: "ecommerce", priority: 3 },
  { id: "campaign-report", label: "Campaign Report", icon: "BarChart3", archetype: "ecommerce", priority: 4 },
  // Service
  { id: "new-proposal", label: "New Proposal", icon: "FileText", archetype: "service", priority: 1 },
  { id: "follow-up", label: "Follow Up", icon: "Phone", archetype: "service", priority: 2 },
  { id: "schedule-call", label: "Schedule Call", icon: "Calendar", archetype: "service", priority: 3 },
  { id: "send-invoice", label: "Send Invoice", icon: "Receipt", archetype: "service", priority: 4 },
  // Local
  { id: "check-appointments", label: "Appointments", icon: "Calendar", archetype: "brick-and-mortar", priority: 1 },
  { id: "walk-in-log", label: "Walk-in Log", icon: "Users", archetype: "brick-and-mortar", priority: 2 },
  { id: "staff-schedule", label: "Staff Schedule", icon: "Clock", archetype: "brick-and-mortar", priority: 3 },
  // Employee-based
  { id: "assign-task", label: "Assign Task", icon: "ClipboardList", archetype: "employee-based", priority: 1 },
  { id: "view-handoffs", label: "View Handoffs", icon: "ArrowRight", archetype: "employee-based", priority: 2 },
  { id: "team-report", label: "Team Report", icon: "BarChart3", archetype: "employee-based", priority: 3 },
  // Agency
  { id: "new-proposal", label: "New Proposal", icon: "FileText", archetype: "agency", priority: 1 },
  { id: "client-health", label: "Client Health", icon: "Heart", archetype: "agency", priority: 2 },
  { id: "utilization", label: "Utilization", icon: "Activity", archetype: "agency", priority: 3 },
  { id: "project-status", label: "Project Status", icon: "Target", archetype: "agency", priority: 4 },
];

export function getQuickActionsForProfile(primaryMode: ProfileArchetype, limit = 4): AdaptiveQuickAction[] {
  return ADAPTIVE_QUICK_ACTIONS
    .filter(a => a.archetype === primaryMode)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit);
}

export interface AdaptiveStatCard {
  id: string;
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  archetype: ProfileArchetype;
}

export function getStatCardsForProfile(primaryMode: ProfileArchetype): AdaptiveStatCard[] {
  const cards: Record<string, AdaptiveStatCard[]> = {
    ecommerce: [
      { id: "orders", label: "Orders Today", value: "47", change: "+12%", changeType: "positive", archetype: "ecommerce" },
      { id: "conversion", label: "Conversion Rate", value: "3.2%", change: "+0.4%", changeType: "positive", archetype: "ecommerce" },
      { id: "aov", label: "Avg Order Value", value: "$84", change: "-$3", changeType: "negative", archetype: "ecommerce" },
      { id: "carts", label: "Abandoned Carts", value: "23", change: "+5", changeType: "negative", archetype: "ecommerce" },
    ],
    service: [
      { id: "pipeline", label: "Pipeline Value", value: "$124K", change: "+$18K", changeType: "positive", archetype: "service" },
      { id: "proposals", label: "Pending Proposals", value: "8", change: "+2", changeType: "neutral", archetype: "service" },
      { id: "followups", label: "Follow-ups Due", value: "12", change: "+3", changeType: "negative", archetype: "service" },
      { id: "invoices", label: "Unpaid Invoices", value: "$32K", change: "-$5K", changeType: "positive", archetype: "service" },
    ],
    "brick-and-mortar": [
      { id: "traffic", label: "Today's Traffic", value: "89", change: "+15%", changeType: "positive", archetype: "brick-and-mortar" },
      { id: "appointments", label: "Appointments", value: "14", change: "+3", changeType: "positive", archetype: "brick-and-mortar" },
      { id: "noshow", label: "No-Show Rate", value: "8%", change: "-2%", changeType: "positive", archetype: "brick-and-mortar" },
      { id: "repeat", label: "Repeat Visits", value: "42%", change: "+5%", changeType: "positive", archetype: "brick-and-mortar" },
    ],
    "employee-based": [
      { id: "tasks", label: "Active Tasks", value: "34", change: "+7", changeType: "neutral", archetype: "employee-based" },
      { id: "completion", label: "Completion Rate", value: "87%", change: "+3%", changeType: "positive", archetype: "employee-based" },
      { id: "overdue", label: "Overdue", value: "5", change: "+2", changeType: "negative", archetype: "employee-based" },
      { id: "utilization", label: "Utilization", value: "76%", change: "+4%", changeType: "positive", archetype: "employee-based" },
    ],
    agency: [
      { id: "pipeline", label: "Pipeline Value", value: "$340K", change: "+$45K", changeType: "positive", archetype: "agency" },
      { id: "projects", label: "Active Projects", value: "12", change: "+1", changeType: "neutral", archetype: "agency" },
      { id: "utilization", label: "Team Utilization", value: "82%", change: "+5%", changeType: "positive", archetype: "agency" },
      { id: "at-risk", label: "At-Risk Clients", value: "2", change: "+1", changeType: "negative", archetype: "agency" },
    ],
  };
  return cards[primaryMode] || cards.service;
}
