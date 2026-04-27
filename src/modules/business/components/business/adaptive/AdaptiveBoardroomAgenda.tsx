// ═══════════════════════════════════════════════════════════════
// Adaptive Boardroom Agenda
// Auto-composes a boardroom agenda based on archetype priorities,
// live data signals, and profile-specific KPI emphasis.
// ═══════════════════════════════════════════════════════════════

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, AlertTriangle, Target, Clock, TrendingUp, Users, ShoppingCart, CalendarDays, DollarSign, FileText, Layers, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import type { ProfileArchetype } from "@/domains/engines/business-profile-engine";

interface AgendaItem {
  id: string;
  title: string;
  description: string;
  domain: string;
  urgency: "critical" | "high" | "normal" | "review";
  icon: React.ElementType;
  kpiValue?: string;
  kpiLabel?: string;
}

const ARCHETYPE_AGENDA: Record<string, AgendaItem[]> = {
  ecommerce: [
    { id: "ag-1", title: "Revenue & Conversion Review", description: "Daily sales, conversion rate, AOV trends", domain: "Revenue", urgency: "review", icon: DollarSign, kpiValue: "$12.4K", kpiLabel: "Today" },
    { id: "ag-2", title: "Cart Recovery Pipeline", description: "Abandoned carts, recovery rate, at-risk revenue", domain: "Recovery", urgency: "high", icon: ShoppingCart, kpiValue: "68%", kpiLabel: "Abandon Rate" },
    { id: "ag-3", title: "Customer Retention Health", description: "Repeat purchase rate, churn signals, LTV trends", domain: "Retention", urgency: "normal", icon: Users, kpiValue: "34%", kpiLabel: "Repeat Rate" },
    { id: "ag-4", title: "Support & Returns Pressure", description: "Open tickets, return requests, CSAT score", domain: "Support", urgency: "normal", icon: AlertTriangle, kpiValue: "94%", kpiLabel: "CSAT" },
  ],
  service: [
    { id: "ag-1", title: "Pipeline & Proposal Review", description: "Active proposals, win rate, stale deals", domain: "Sales", urgency: "high", icon: Target, kpiValue: "$42.8K", kpiLabel: "Pipeline" },
    { id: "ag-2", title: "Collections & Cash Flow", description: "Overdue invoices, aging buckets, cash position", domain: "Finance", urgency: "high", icon: DollarSign, kpiValue: "$8.2K", kpiLabel: "Overdue" },
    { id: "ag-3", title: "Client Health & Risk", description: "At-risk clients, satisfaction trends, drift detection", domain: "CRM", urgency: "normal", icon: Users, kpiValue: "3", kpiLabel: "At Risk" },
    { id: "ag-4", title: "Delivery & Operations", description: "Active projects, milestone status, team capacity", domain: "Operations", urgency: "review", icon: Layers, kpiValue: "87%", kpiLabel: "On Track" },
  ],
  "appointment-based": [
    { id: "ag-1", title: "Schedule & Booking Review", description: "Today's bookings, utilization, gap analysis", domain: "Schedule", urgency: "review", icon: CalendarDays, kpiValue: "12", kpiLabel: "Today" },
    { id: "ag-2", title: "No-Show Risk Assessment", description: "Unconfirmed bookings, high-risk clients, recovery queue", domain: "Risk", urgency: "high", icon: AlertTriangle, kpiValue: "2", kpiLabel: "Unconfirmed" },
    { id: "ag-3", title: "Revenue Per Slot Analysis", description: "Revenue efficiency, pricing optimization, upsell opportunities", domain: "Revenue", urgency: "normal", icon: DollarSign, kpiValue: "$280", kpiLabel: "Per Slot" },
    { id: "ag-4", title: "Client Rebooking & Retention", description: "Rebooking rate, lapsed clients, follow-up queue", domain: "Retention", urgency: "normal", icon: Users, kpiValue: "78%", kpiLabel: "Rebook Rate" },
  ],
  "employee-based": [
    { id: "ag-1", title: "Team Workload & Utilization", description: "Assignment distribution, capacity gaps, overloaded members", domain: "Team", urgency: "high", icon: Users, kpiValue: "78%", kpiLabel: "Utilization" },
    { id: "ag-2", title: "Execution Velocity & Blockers", description: "Completion rate, overdue tasks, active blockers", domain: "Operations", urgency: "high", icon: Layers, kpiValue: "6", kpiLabel: "Overdue" },
    { id: "ag-3", title: "Revenue & Pipeline Status", description: "Active deals, pipeline value, forecast accuracy", domain: "Revenue", urgency: "review", icon: DollarSign, kpiValue: "$28.1K", kpiLabel: "Revenue" },
    { id: "ag-4", title: "Accountability & Handoff Quality", description: "Handoff completion, SLA adherence, escalation rate", domain: "Quality", urgency: "normal", icon: CheckCircle, kpiValue: "92%", kpiLabel: "SLA Met" },
  ],
  "brick-and-mortar": [
    { id: "ag-1", title: "Location Performance Review", description: "Foot traffic, conversion, revenue per location", domain: "Location", urgency: "review", icon: TrendingUp, kpiValue: "234", kpiLabel: "Visitors" },
    { id: "ag-2", title: "Appointment & Walk-In Flow", description: "Booking density, walk-in rate, no-shows", domain: "Schedule", urgency: "high", icon: CalendarDays, kpiValue: "18", kpiLabel: "Today" },
    { id: "ag-3", title: "Staff Coverage & Scheduling", description: "Shift coverage, overtime, capacity gaps", domain: "Team", urgency: "normal", icon: Users, kpiValue: "92%", kpiLabel: "Coverage" },
    { id: "ag-4", title: "Repeat Customer & Loyalty", description: "Repeat visit rate, loyalty program health, local retention", domain: "Retention", urgency: "normal", icon: Target, kpiValue: "45%", kpiLabel: "Repeat Rate" },
  ],
  agency: [
    { id: "ag-1", title: "Pipeline & Pitch Review", description: "Active proposals, pitch win rate, revenue forecast", domain: "Sales", urgency: "high", icon: Target, kpiValue: "$185K", kpiLabel: "Pipeline" },
    { id: "ag-2", title: "Team Utilization & Capacity", description: "Billable hours, team allocation, bench time", domain: "Team", urgency: "high", icon: Users, kpiValue: "82%", kpiLabel: "Utilization" },
    { id: "ag-3", title: "Client Health & At-Risk", description: "Client satisfaction, at-risk accounts, NPS trends", domain: "CRM", urgency: "normal", icon: AlertTriangle, kpiValue: "2", kpiLabel: "At Risk" },
    { id: "ag-4", title: "Delivery & Project Status", description: "Active projects, milestones due, scope changes", domain: "Delivery", urgency: "review", icon: Layers, kpiValue: "8", kpiLabel: "Active" },
  ],
  "professional-practice": [
    { id: "ag-1", title: "Schedule & Patient Volume", description: "Appointment density, gap analysis, waitlist", domain: "Schedule", urgency: "review", icon: CalendarDays, kpiValue: "24", kpiLabel: "This Week" },
    { id: "ag-2", title: "No-Show & Cancellation Review", description: "No-show rate, cancellation patterns, recovery actions", domain: "Risk", urgency: "high", icon: AlertTriangle, kpiValue: "6%", kpiLabel: "No-Show" },
    { id: "ag-3", title: "Billing & Collections Health", description: "Outstanding balances, insurance claims, aging", domain: "Finance", urgency: "normal", icon: DollarSign, kpiValue: "$4.1K", kpiLabel: "Outstanding" },
    { id: "ag-4", title: "Patient Engagement & Retention", description: "Rebooking rate, follow-up compliance, satisfaction", domain: "Retention", urgency: "normal", icon: Users, kpiValue: "88%", kpiLabel: "Rebook Rate" },
  ],
  membership: [
    { id: "ag-1", title: "Member Retention & Churn", description: "Active members, churn rate, at-risk members", domain: "Retention", urgency: "critical", icon: Users, kpiValue: "2.1%", kpiLabel: "Churn" },
    { id: "ag-2", title: "Revenue & MRR Review", description: "Monthly recurring revenue, expansion, contraction", domain: "Revenue", urgency: "review", icon: DollarSign, kpiValue: "$18.4K", kpiLabel: "MRR" },
    { id: "ag-3", title: "Engagement & Usage Patterns", description: "Active usage, feature adoption, dormant members", domain: "Engagement", urgency: "normal", icon: TrendingUp, kpiValue: "72%", kpiLabel: "Active" },
    { id: "ag-4", title: "Win-Back & Reactivation", description: "Lapsed members, win-back campaigns, reactivation rate", domain: "Recovery", urgency: "high", icon: Target, kpiValue: "12", kpiLabel: "Lapsed" },
  ],
};

const DEFAULT_AGENDA: AgendaItem[] = [
  { id: "ag-1", title: "Revenue & Pipeline Review", description: "Pipeline value, deal velocity, forecast accuracy", domain: "Revenue", urgency: "review", icon: BarChart3, kpiValue: "$42.8K", kpiLabel: "Pipeline" },
  { id: "ag-2", title: "Lead & Follow-Up Pressure", description: "Stale leads, overdue follow-ups, at-risk value", domain: "Sales", urgency: "high", icon: Target, kpiValue: "3", kpiLabel: "Stale Leads" },
  { id: "ag-3", title: "Collections & Cash Flow", description: "Overdue invoices, aging, cash position", domain: "Finance", urgency: "normal", icon: DollarSign, kpiValue: "$8.2K", kpiLabel: "Overdue" },
  { id: "ag-4", title: "Customer & Relationship Health", description: "At-risk accounts, satisfaction, support pressure", domain: "CRM", urgency: "normal", icon: Users, kpiValue: "124", kpiLabel: "Active" },
];

const URGENCY_STYLES = {
  critical: { dot: "bg-[hsl(0_70%_55%)]", text: "text-[hsl(0_70%_55%)]", label: "Critical" },
  high: { dot: "bg-[hsl(38_85%_58%)]", text: "text-[hsl(38_85%_58%)]", label: "High Priority" },
  normal: { dot: "bg-[hsl(265_55%_58%)]", text: "text-[hsl(265_55%_58%)]", label: "Standard" },
  review: { dot: "bg-[hsl(152_55%_48%)]", text: "text-[hsl(152_55%_48%)]", label: "Review" },
};

export default function AdaptiveBoardroomAgenda() {
  const { primaryMode } = useBusinessProfile();
  const boardroomConfig = getModuleAdaptation("boardroom", primaryMode);

  const agenda = useMemo(() => {
    return ARCHETYPE_AGENDA[primaryMode] || DEFAULT_AGENDA;
  }, [primaryMode]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(265_55%_58%/0.12)]">
            <BarChart3 className="h-4 w-4 text-[hsl(265_55%_68%)]" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Boardroom Agenda</h3>
            <p className="text-[10px] text-[hsl(0_0%_50%)]">Auto-composed for {boardroomConfig.advisorSpecialty.split(",")[0].toLowerCase()}</p>
          </div>
        </div>
        <span className="text-[10px] text-[hsl(0_0%_40%)] font-medium">
          {agenda.length} items
        </span>
      </div>

      <div className="space-y-2">
        {agenda.map((item, i) => {
          const urgStyle = URGENCY_STYLES[item.urgency];
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
              className="group flex items-center gap-3 rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 hover:border-[hsl(265_55%_58%/0.20)] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-[hsl(0_0%_30%)] w-4 text-right">{i + 1}</span>
                <div className={cn("h-1.5 w-1.5 rounded-full", urgStyle.dot)} />
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(0_0%_100%/0.06)] shrink-0">
                <Icon className="h-3.5 w-3.5 text-[hsl(0_0%_60%)]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-[hsl(0_0%_85%)] truncate">{item.title}</p>
                <p className="text-[10px] text-[hsl(0_0%_50%)] truncate">{item.description}</p>
              </div>

              {item.kpiValue && (
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-semibold text-[hsl(0_0%_85%)] tabular-nums">{item.kpiValue}</p>
                  <p className="text-[9px] text-[hsl(0_0%_40%)]">{item.kpiLabel}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <button className="w-full py-2 rounded-lg border border-[hsl(265_55%_58%/0.20)] bg-[hsl(265_55%_58%/0.06)] text-[11px] font-medium text-[hsl(265_55%_68%)] hover:bg-[hsl(265_55%_58%/0.12)] transition-colors">
        Open Boardroom Session →
      </button>
    </div>
  );
}
