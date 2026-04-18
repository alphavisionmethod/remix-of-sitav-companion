// ═══════════════════════════════════════════════════════════════
// Adaptive Boardroom Framing Engine
// Returns boardroom configuration based on BusinessProfileResult
// ═══════════════════════════════════════════════════════════════

import type { BusinessProfileResult, BoardroomFocus } from "@/lib/engines/business-profile-engine";

export interface BoardroomAgendaItem {
  id: string;
  title: string;
  category: string;
  urgency: "low" | "medium" | "high" | "critical";
  archetype: string;
  description: string;
}

export function getBoardroomFraming(profile: BusinessProfileResult): BoardroomFocus {
  return profile.boardroom;
}

export function getBoardroomAgenda(profile: BusinessProfileResult): BoardroomAgendaItem[] {
  const agendas: Record<string, BoardroomAgendaItem[]> = {
    ecommerce: [
      { id: "conv-health", title: "Conversion Health Review", category: "Revenue", urgency: "high", archetype: "ecommerce", description: "Review checkout funnel, identify drop-off points, and assess A/B test results" },
      { id: "cart-recovery", title: "Cart Recovery Status", category: "Revenue", urgency: "high", archetype: "ecommerce", description: "Abandoned cart volume, recovery rate, and email sequence performance" },
      { id: "retention-risk", title: "Retention Risk Assessment", category: "Customers", urgency: "medium", archetype: "ecommerce", description: "Identify at-risk cohorts, declining purchase frequency, and churn signals" },
      { id: "support-load", title: "Support Pressure Analysis", category: "Operations", urgency: "medium", archetype: "ecommerce", description: "Ticket volume trends, resolution times, and customer satisfaction impact" },
      { id: "campaign-perf", title: "Campaign Performance", category: "Growth", urgency: "medium", archetype: "ecommerce", description: "ROI by channel, attribution analysis, and budget reallocation opportunities" },
      { id: "refund-trends", title: "Refund & Return Trends", category: "Revenue", urgency: "low", archetype: "ecommerce", description: "Return rate patterns, common reasons, and product quality signals" },
    ],
    service: [
      { id: "pipeline-review", title: "Pipeline Quality Review", category: "Revenue", urgency: "high", archetype: "service", description: "Pipeline value, stage velocity, and deal health assessment" },
      { id: "proposal-velocity", title: "Proposal Velocity Check", category: "Sales", urgency: "high", archetype: "service", description: "Time-to-proposal, response rates, and conversion by proposal type" },
      { id: "delivery-risk", title: "Delivery Risk Assessment", category: "Operations", urgency: "medium", archetype: "service", description: "At-risk projects, deadline adherence, and capacity warnings" },
      { id: "collections", title: "Collections & Payment Status", category: "Revenue", urgency: "medium", archetype: "service", description: "Outstanding invoices, aging analysis, and follow-up effectiveness" },
      { id: "client-health", title: "Client Relationship Health", category: "Customers", urgency: "medium", archetype: "service", description: "Engagement scores, satisfaction trends, and retention risk signals" },
    ],
    "brick-and-mortar": [
      { id: "location-perf", title: "Location Performance Review", category: "Operations", urgency: "high", archetype: "brick-and-mortar", description: "Revenue per location, traffic patterns, and comparative analysis" },
      { id: "staffing", title: "Staffing Coverage Analysis", category: "Operations", urgency: "high", archetype: "brick-and-mortar", description: "Coverage gaps, overtime trends, and demand-based scheduling" },
      { id: "customer-patterns", title: "Customer Visit Patterns", category: "Customers", urgency: "medium", archetype: "brick-and-mortar", description: "Repeat visit rates, loyalty progression, and no-show analysis" },
      { id: "local-issues", title: "Local Issues & Complaints", category: "Operations", urgency: "medium", archetype: "brick-and-mortar", description: "Open issues, resolution time, and customer impact assessment" },
    ],
    "employee-based": [
      { id: "workload", title: "Workload Balance Review", category: "Team", urgency: "high", archetype: "employee-based", description: "Task distribution, overloaded team members, and capacity projections" },
      { id: "execution", title: "Execution Bottleneck Analysis", category: "Operations", urgency: "high", archetype: "employee-based", description: "Blocked tasks, dependency chains, and resolution priorities" },
      { id: "accountability", title: "Accountability Check", category: "Team", urgency: "medium", archetype: "employee-based", description: "Missed deadlines, ownership gaps, and follow-through scores" },
      { id: "quality", title: "Service Quality Consistency", category: "Customers", urgency: "medium", archetype: "employee-based", description: "Quality metrics variance, customer feedback, and training needs" },
    ],
    agency: [
      { id: "client-portfolio", title: "Client Portfolio Health", category: "Customers", urgency: "high", archetype: "agency", description: "Revenue concentration, at-risk clients, and expansion opportunities" },
      { id: "project-delivery", title: "Project Delivery Status", category: "Operations", urgency: "high", archetype: "agency", description: "Active projects, milestone adherence, and budget tracking" },
      { id: "pipeline-strength", title: "Pipeline Strength", category: "Revenue", urgency: "medium", archetype: "agency", description: "Pipeline coverage ratio, proposal quality, and win rate trends" },
      { id: "team-util", title: "Team Utilization Review", category: "Team", urgency: "medium", archetype: "agency", description: "Billable vs non-billable hours, capacity planning, and skill gaps" },
    ],
  };

  return agendas[profile.primaryMode] || agendas.service;
}
