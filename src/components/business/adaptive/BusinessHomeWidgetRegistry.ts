// ═══════════════════════════════════════════════════════════════
// Business Home Widget Registry
// All possible home widgets with archetype affinity scores.
// The engine picks top-N based on weighted profile match.
// ═══════════════════════════════════════════════════════════════

import type { ProfileArchetype } from "@/domains/engines/business-profile-engine";

export interface HomeWidget {
  id: string;
  label: string;
  description: string;
  icon: string; // lucide icon name
  affinityScores: Partial<Record<ProfileArchetype, number>>;
  category: "revenue" | "operations" | "customers" | "growth" | "team";
}

export const WIDGET_REGISTRY: HomeWidget[] = [
  // Revenue
  { id: "pipeline-value", label: "Pipeline Value", description: "Total value in active pipeline", icon: "TrendingUp", affinityScores: { service: 0.95, agency: 0.95, "professional-practice": 0.9 }, category: "revenue" },
  { id: "orders", label: "Orders", description: "Recent order volume and revenue", icon: "ShoppingCart", affinityScores: { ecommerce: 0.95, "product-service": 0.8 }, category: "revenue" },
  { id: "revenue-trend", label: "Revenue Trend", description: "Revenue trajectory over time", icon: "LineChart", affinityScores: { service: 0.7, ecommerce: 0.7, agency: 0.7, "brick-and-mortar": 0.7, membership: 0.8 }, category: "revenue" },
  { id: "aov", label: "AOV", description: "Average order value", icon: "Banknote", affinityScores: { ecommerce: 0.9, "product-service": 0.7 }, category: "revenue" },
  { id: "conversion-rate", label: "Conversion Rate", description: "Visitor to buyer conversion", icon: "Target", affinityScores: { ecommerce: 0.95, "brick-and-mortar": 0.7 }, category: "revenue" },
  { id: "invoice-timing", label: "Invoice Timing", description: "Average days to payment", icon: "Receipt", affinityScores: { service: 0.85, agency: 0.85, "professional-practice": 0.85 }, category: "revenue" },
  { id: "collections-status", label: "Collections", description: "Outstanding and overdue payments", icon: "Banknote", affinityScores: { service: 0.8, agency: 0.75 }, category: "revenue" },
  { id: "campaign-roi", label: "Campaign ROI", description: "Return on marketing campaigns", icon: "BarChart3", affinityScores: { ecommerce: 0.85, membership: 0.7 }, category: "revenue" },
  { id: "retainer-health", label: "Retainer Health", description: "Active retainer status and renewal risk", icon: "Shield", affinityScores: { agency: 0.9, service: 0.6 }, category: "revenue" },

  // Operations
  { id: "booked-work", label: "Booked Work", description: "Confirmed upcoming work", icon: "Calendar", affinityScores: { service: 0.9, "appointment-based": 0.9, "professional-practice": 0.85 }, category: "operations" },
  { id: "scheduling-load", label: "Scheduling Load", description: "Capacity vs bookings", icon: "Clock", affinityScores: { "appointment-based": 0.95, service: 0.7, "brick-and-mortar": 0.7 }, category: "operations" },
  { id: "fulfillment", label: "Fulfillment", description: "Order fulfillment status", icon: "Package", affinityScores: { ecommerce: 0.9 }, category: "operations" },
  { id: "returns", label: "Returns", description: "Return/refund volume", icon: "RefreshCw", affinityScores: { ecommerce: 0.8 }, category: "operations" },
  { id: "appointments-today", label: "Appointments Today", description: "Today's scheduled appointments", icon: "Calendar", affinityScores: { "appointment-based": 0.95, "brick-and-mortar": 0.9, service: 0.6 }, category: "operations" },
  { id: "walk-in-traffic", label: "Walk-in Traffic", description: "Estimated foot traffic", icon: "Users", affinityScores: { "brick-and-mortar": 0.9 }, category: "operations" },
  { id: "location-performance", label: "Location Performance", description: "Per-location metrics", icon: "Building2", affinityScores: { "multi-location": 0.95, "brick-and-mortar": 0.85 }, category: "operations" },
  { id: "staffing-coverage", label: "Staffing Coverage", description: "Staff availability vs demand", icon: "Users", affinityScores: { "brick-and-mortar": 0.85, "employee-based": 0.8, "multi-location": 0.8 }, category: "operations" },

  // Customers
  { id: "customer-health", label: "Customer Health", description: "Overall customer relationship health", icon: "Heart", affinityScores: { service: 0.8, agency: 0.85, membership: 0.85, ecommerce: 0.6 }, category: "customers" },
  { id: "pending-proposals", label: "Pending Proposals", description: "Proposals awaiting response", icon: "FileText", affinityScores: { service: 0.9, agency: 0.9, "professional-practice": 0.85 }, category: "customers" },
  { id: "follow-up-queue", label: "Follow-up Queue", description: "Contacts needing follow-up", icon: "Phone", affinityScores: { service: 0.9, agency: 0.8, "professional-practice": 0.8 }, category: "customers" },
  { id: "cart-recovery", label: "Cart Recovery", description: "Abandoned carts to recover", icon: "ShoppingCart", affinityScores: { ecommerce: 0.95 }, category: "customers" },
  { id: "repeat-visits", label: "Repeat Visits", description: "Customer repeat visit rate", icon: "RefreshCw", affinityScores: { "brick-and-mortar": 0.85, membership: 0.7 }, category: "customers" },
  { id: "reputation", label: "Reputation Score", description: "Online reputation and reviews", icon: "Star", affinityScores: { "brick-and-mortar": 0.8, service: 0.6 }, category: "customers" },
  { id: "client-retention", label: "Client Retention", description: "Client retention rate over time", icon: "Heart", affinityScores: { agency: 0.9, service: 0.85, membership: 0.9 }, category: "customers" },
  { id: "customer-ltv", label: "Customer LTV", description: "Average lifetime value per customer", icon: "TrendingUp", affinityScores: { ecommerce: 0.85, membership: 0.9, agency: 0.8 }, category: "customers" },

  // Growth
  { id: "support-pressure", label: "Support Queue", description: "Open support tickets and response time", icon: "Headphones", affinityScores: { ecommerce: 0.8, service: 0.7, "employee-based": 0.75 }, category: "growth" },
  { id: "repeat-purchase", label: "Repeat Purchase", description: "Repeat purchase rate", icon: "RefreshCw", affinityScores: { ecommerce: 0.85, membership: 0.7 }, category: "growth" },
  { id: "local-demand", label: "Local Demand", description: "Search and discovery trends", icon: "MapPin", affinityScores: { "brick-and-mortar": 0.8, "multi-location": 0.75 }, category: "growth" },
  { id: "no-show-rate", label: "No-Show Rate", description: "Appointment no-show percentage", icon: "XCircle", affinityScores: { "appointment-based": 0.85, "brick-and-mortar": 0.7 }, category: "growth" },

  // Team
  { id: "active-assignments", label: "Active Assignments", description: "Currently assigned tasks", icon: "ClipboardList", affinityScores: { "employee-based": 0.95, agency: 0.7 }, category: "team" },
  { id: "handoff-queue", label: "Handoff Queue", description: "Tasks pending handoff", icon: "ArrowRight", affinityScores: { "employee-based": 0.9 }, category: "team" },
  { id: "workload-distribution", label: "Workload Distribution", description: "Team workload balance", icon: "BarChart3", affinityScores: { "employee-based": 0.9, agency: 0.75 }, category: "team" },
  { id: "accountability", label: "Accountability Score", description: "Team follow-through metrics", icon: "CheckCircle", affinityScores: { "employee-based": 0.85 }, category: "team" },
  { id: "execution-rate", label: "Execution Rate", description: "Task completion velocity", icon: "Zap", affinityScores: { "employee-based": 0.85, agency: 0.7 }, category: "team" },
  { id: "team-utilization", label: "Team Utilization", description: "Billable hours vs capacity", icon: "Activity", affinityScores: { agency: 0.9, "employee-based": 0.7 }, category: "team" },
  { id: "delivery-load", label: "Delivery Load", description: "Active delivery commitments", icon: "Truck", affinityScores: { service: 0.8, agency: 0.85 }, category: "team" },
];

export function getTopWidgets(
  weights: Record<string, number>,
  count = 8
): HomeWidget[] {
  return WIDGET_REGISTRY
    .map(w => {
      const score = Object.entries(w.affinityScores).reduce(
        (sum, [arch, aff]) => sum + (weights[arch] || 0) * (aff || 0),
        0
      );
      return { ...w, _score: score };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, count);
}
