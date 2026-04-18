// ═══════════════════════════════════════════════════════════════
// SITA OS — CRM Inline Advisor Insight Zone
// Reusable component that generates context-aware advisor insights
// for contacts, companies, deals, and imports
// ═══════════════════════════════════════════════════════════════

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain, Shield, Heart, TrendingUp, Phone, DollarSign, AlertTriangle,
  Users, Sparkles, RefreshCw, ChevronRight, Target, Zap, Clock
} from "lucide-react";
import type { CRMContact, CRMCompany, CRMOpportunity, CRMCommunication, CRMTask } from "@/data/repositories/crm-data-service";
import { differenceInDays, isPast } from "date-fns";

// ─── 8 Advisor Roles ────────────────────────────────────────
export type AdvisorRole =
  | "relationship"
  | "follow-through"
  | "opportunity"
  | "recovery"
  | "account-health"
  | "communication"
  | "collections"
  | "strategic";

interface AdvisorSpec {
  key: AdvisorRole;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export const ADVISOR_SPECS: AdvisorSpec[] = [
  { key: "relationship",  label: "Relationship Advisor",  icon: Heart,         color: "text-pink-400",   bg: "bg-pink-500/10" },
  { key: "follow-through", label: "Follow-Through",       icon: Target,        color: "text-blue-400",   bg: "bg-blue-500/10" },
  { key: "opportunity",   label: "Opportunity Advisor",   icon: TrendingUp,    color: "text-green-400",  bg: "bg-green-500/10" },
  { key: "recovery",      label: "Recovery Advisor",      icon: RefreshCw,     color: "text-orange-400", bg: "bg-orange-500/10" },
  { key: "account-health", label: "Account Health",       icon: Shield,        color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "communication", label: "Communication Advisor", icon: Phone,         color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { key: "collections",   label: "Collections Sensitivity", icon: DollarSign,  color: "text-red-400",    bg: "bg-red-500/10" },
  { key: "strategic",     label: "Strategic Account",     icon: Brain,         color: "text-purple-400", bg: "bg-purple-500/10" },
];

export interface AdvisorInsightData {
  role: AdvisorRole;
  insight: string;
  confidence: number;
  action?: string;
  boardroomRelevance?: number;
  assumptions?: string[];
  escalationCondition?: string;
}

// ─── Insight Generator ──────────────────────────────────────
export function generateContactInsights(
  contact: CRMContact,
  comms: CRMCommunication[],
  tasks: CRMTask[],
  opps: CRMOpportunity[]
): AdvisorInsightData[] {
  const insights: AdvisorInsightData[] = [];
  const health = contact.health_score ?? 50;
  const daysSinceContact = contact.last_contacted_at
    ? differenceInDays(new Date(), new Date(contact.last_contacted_at))
    : 999;
  const overdueTasks = tasks.filter(t => t.status !== "completed" && t.due_date && isPast(new Date(t.due_date)));
  const openDeals = opps.filter(o => o.status === "open");
  const totalDealValue = openDeals.reduce((s, o) => s + (o.value || 0), 0);

  // Relationship Advisor
  if (health < 40) {
    insights.push({
      role: "relationship", confidence: 0.85,
      insight: `Relationship health at ${health}%. This contact is drifting — a personal touchpoint could reverse trajectory.`,
      action: "Schedule personal check-in",
      boardroomRelevance: totalDealValue > 50000 ? 0.8 : 0.3,
    });
  } else if (daysSinceContact > 21) {
    insights.push({
      role: "relationship", confidence: 0.7,
      insight: `No interaction in ${daysSinceContact} days. Relationship warmth is fading. Consider a brief value-add outreach.`,
      action: "Send check-in",
    });
  }

  // Follow-Through
  if (overdueTasks.length > 0) {
    insights.push({
      role: "follow-through", confidence: 0.92,
      insight: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""} for this contact. Each missed commitment erodes trust.`,
      action: "Review overdue tasks",
      assumptions: ["Tasks represent commitments made to the contact"],
    });
  }
  if (contact.next_follow_up_at && isPast(new Date(contact.next_follow_up_at))) {
    insights.push({
      role: "follow-through", confidence: 0.88,
      insight: "Scheduled follow-up is past due. Prompt action preserves credibility.",
      action: "Complete follow-up now",
    });
  }

  // Opportunity
  if (openDeals.length > 0) {
    const stalledDeals = openDeals.filter(o => differenceInDays(new Date(), new Date(o.updated_at)) > 14);
    if (stalledDeals.length > 0) {
      insights.push({
        role: "opportunity", confidence: 0.78,
        insight: `${stalledDeals.length} deal${stalledDeals.length > 1 ? "s" : ""} stalled 14+ days ($${(stalledDeals.reduce((s, o) => s + (o.value || 0), 0) / 1000).toFixed(0)}K). Re-engage or reassess qualification.`,
        action: "Review stalled deals",
        boardroomRelevance: totalDealValue > 100000 ? 0.85 : 0.4,
        escalationCondition: "Escalate if stalled 30+ days with value > $50K",
      });
    }
  }

  // Recovery
  if (contact.lifecycle_stage === "churned" || (contact.lifecycle_stage === "customer" && health < 30)) {
    insights.push({
      role: "recovery", confidence: 0.72,
      insight: contact.lifecycle_stage === "churned"
        ? "This contact has churned. Assess reactivation potential based on history."
        : "Active customer showing churn signals. Intervene before it's too late.",
      action: contact.lifecycle_stage === "churned" ? "Evaluate win-back" : "Launch retention outreach",
      boardroomRelevance: totalDealValue > 25000 ? 0.75 : 0.25,
    });
  }

  // Account Health
  insights.push({
    role: "account-health", confidence: 0.82,
    insight: health >= 80
      ? "Account is healthy. Maintain cadence and explore expansion opportunities."
      : health >= 50
      ? `Health at ${health}%. Trending stable but watch for engagement drops.`
      : `Health at ${health}% — below safe threshold. Multiple risk factors present.`,
    boardroomRelevance: health < 30 && totalDealValue > 50000 ? 0.9 : 0,
  });

  // Communication
  if (comms.length === 0) {
    insights.push({
      role: "communication", confidence: 0.65,
      insight: "No communication history logged. Starting from zero — consider an introductory outreach.",
      action: "Draft intro email",
    });
  } else if (daysSinceContact > 30) {
    insights.push({
      role: "communication", confidence: 0.75,
      insight: `Last interaction was ${daysSinceContact} days ago. Communication gap is growing.`,
      action: "Schedule touchpoint",
    });
  }

  // Strategic Account
  if (totalDealValue > 50000 || (contact.tags || []).some(t => t.toLowerCase().includes("strategic") || t.toLowerCase().includes("key account"))) {
    insights.push({
      role: "strategic", confidence: 0.8,
      insight: `Strategic account with $${(totalDealValue / 1000).toFixed(0)}K in pipeline. Ensure executive alignment and multi-threaded engagement.`,
      boardroomRelevance: 0.7,
      escalationCondition: "Auto-escalate if health drops below 40%",
    });
  }

  return insights;
}

export function generateCompanyInsights(
  company: CRMCompany,
  contactCount: number,
  openDealValue: number,
  commCount: number
): AdvisorInsightData[] {
  const insights: AdvisorInsightData[] = [];
  const health = company.health_score ?? 50;

  if (contactCount === 0) {
    insights.push({
      role: "relationship", confidence: 0.9,
      insight: "No contacts linked. Cannot build relationship intelligence without people. Add team members.",
      action: "Link contacts",
    });
  }

  if (health < 40) {
    insights.push({
      role: "account-health", confidence: 0.85,
      insight: `Company health at ${health}%. Multiple signals suggest declining engagement. Review all open items.`,
      boardroomRelevance: openDealValue > 50000 ? 0.85 : 0.3,
      escalationCondition: "Escalate if health < 25% with active pipeline",
    });
  }

  if (openDealValue > 100000) {
    insights.push({
      role: "strategic", confidence: 0.82,
      insight: `$${(openDealValue / 1000).toFixed(0)}K in active pipeline. This is a strategic account requiring executive attention.`,
      boardroomRelevance: 0.75,
    });
  }

  if (commCount === 0 && contactCount > 0) {
    insights.push({
      role: "communication", confidence: 0.7,
      insight: "Contacts exist but no communication logged. The account may be going dark.",
      action: "Schedule outreach",
    });
  }

  return insights;
}

export function generateDealInsight(
  opp: CRMOpportunity
): AdvisorInsightData | null {
  const isStalled = differenceInDays(new Date(), new Date(opp.updated_at)) > 14;
  const isOverdue = opp.expected_close_date && isPast(new Date(opp.expected_close_date));
  const isLowProb = (opp.probability || 50) < 25;

  if (isOverdue) {
    return {
      role: "opportunity", confidence: 0.88,
      insight: "Past expected close date",
      action: "Review & update",
      boardroomRelevance: (opp.value || 0) > 50000 ? 0.8 : 0.3,
    };
  }
  if (isStalled) {
    return {
      role: "follow-through", confidence: 0.75,
      insight: "No activity in 14+ days",
      action: "Re-engage",
    };
  }
  if (isLowProb && (opp.value || 0) > 10000) {
    return {
      role: "recovery", confidence: 0.65,
      insight: "Low probability, high value",
      action: "Qualify or drop",
    };
  }
  return null;
}

// ─── Inline Advisor Insight Card ────────────────────────────
interface InlineAdvisorInsightsProps {
  insights: AdvisorInsightData[];
  compact?: boolean;
  maxInsights?: number;
  onAction?: (action: string) => void;
}

export function InlineAdvisorInsights({ insights, compact = false, maxInsights = 4, onAction }: InlineAdvisorInsightsProps) {
  const shown = insights.slice(0, maxInsights);

  if (shown.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-primary" />
          <p className={`font-semibold text-foreground ${compact ? "text-xs" : "text-sm"}`}>Advisor Insights</p>
          <Badge variant="outline" className="text-[9px] ml-auto bg-primary/10 text-primary border-primary/20">
            {insights.length} insight{insights.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <div className="space-y-2">
          {shown.map((ins, i) => {
            const spec = ADVISOR_SPECS.find(s => s.key === ins.role)!;
            const Icon = spec.icon;
            return (
              <div key={i} className={`flex items-start gap-2 ${compact ? "p-1.5" : "p-2"} rounded-lg bg-background/30`}>
                <div className={`w-6 h-6 rounded-md ${spec.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-3 w-3 ${spec.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-medium ${spec.color}`}>{spec.label}</span>
                    <span className="text-[9px] text-muted-foreground">
                      {Math.round(ins.confidence * 100)}% conf
                    </span>
                    {ins.boardroomRelevance && ins.boardroomRelevance > 0.6 && (
                      <Badge variant="outline" className="text-[8px] h-3.5 bg-yellow-500/10 text-yellow-400 border-yellow-500/20 gap-0.5">
                        <Shield className="h-2 w-2" /> Boardroom
                      </Badge>
                    )}
                  </div>
                  <p className={`text-muted-foreground mt-0.5 ${compact ? "text-[10px]" : "text-xs"}`}>{ins.insight}</p>
                  {ins.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 text-[10px] text-primary px-1 mt-1 gap-0.5"
                      onClick={() => onAction?.(ins.action!)}
                    >
                      {ins.action} <ChevronRight className="h-2.5 w-2.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {insights.length > maxInsights && (
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            +{insights.length - maxInsights} more insight{insights.length - maxInsights > 1 ? "s" : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Deal Card Advisor Signal (compact badge) ───────────────
interface DealAdvisorSignalProps {
  opp: CRMOpportunity;
}

export function DealAdvisorSignal({ opp }: DealAdvisorSignalProps) {
  const insight = generateDealInsight(opp);
  if (!insight) return null;

  const spec = ADVISOR_SPECS.find(s => s.key === insight.role)!;
  const Icon = spec.icon;

  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full ${spec.bg} ${spec.color}`}>
      <Icon className="h-2.5 w-2.5" />
      {insight.insight}
    </span>
  );
}
