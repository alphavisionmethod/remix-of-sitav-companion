import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCRMContacts, useCRMOpportunities, useCRMTasks, useCRMCommunications, useCRMCompanies } from "@/hooks/use-crm-data";
import {
  BrainCircuit, AlertTriangle, TrendingUp, Clock, Users, Heart, Phone,
  CheckCircle, Shield, ChevronRight, Target, UserX, DollarSign, Star,
  ThumbsUp, ThumbsDown, MessageSquare, RefreshCw, Brain, Sparkles
} from "lucide-react";
import { isPast, differenceInDays, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import {
  ADVISOR_SPECS,
  generateContactInsights,
  type AdvisorInsightData,
  type AdvisorRole
} from "@/components/business/crm/CRMAdvisorInsight";

type InsightCategory = "all" | "relationships" | "pipeline" | "engagement" | "growth" | "escalation";
type InsightPriority = "critical" | "high" | "medium" | "info";

interface BoardInsight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  priority: InsightPriority;
  icon: React.ElementType;
  advisorRole: AdvisorRole;
  confidence: number;
  metric?: string;
  action?: string;
  boardroomRelevance?: number;
  entities?: string[];
  assumptions?: string[];
  escalationCondition?: string;
}

const PRIORITY_STYLES: Record<InsightPriority, { border: string; bg: string; badge: string; text: string }> = {
  critical: { border: "border-destructive/30", bg: "bg-destructive/5", badge: "bg-destructive/20 text-destructive", text: "text-destructive" },
  high: { border: "border-orange-500/30", bg: "bg-orange-500/5", badge: "bg-orange-500/20 text-orange-400", text: "text-orange-400" },
  medium: { border: "border-yellow-500/20", bg: "bg-yellow-500/5", badge: "bg-yellow-500/20 text-yellow-500", text: "text-yellow-500" },
  info: { border: "border-primary/20", bg: "bg-primary/5", badge: "bg-primary/20 text-primary", text: "text-primary" },
};

const CRMAdvisorBoard = () => {
  const { data: contacts = [] } = useCRMContacts();
  const { data: companies = [] } = useCRMCompanies();
  const { data: opportunities = [] } = useCRMOpportunities();
  const { data: tasks = [] } = useCRMTasks();
  const { data: comms = [] } = useCRMCommunications();
  const [category, setCategory] = useState<InsightCategory>("all");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeAdvisor, setActiveAdvisor] = useState<AdvisorRole | "all">("all");

  const insights = useMemo(() => {
    const list: BoardInsight[] = [];
    const atRisk = contacts.filter(c => (c.health_score ?? 50) < 30);
    const drifting = contacts.filter(c => (c.health_score ?? 50) >= 30 && (c.health_score ?? 50) < 50);
    const overdue = tasks.filter(t => t.status !== "completed" && t.due_date && isPast(new Date(t.due_date)));
    const stalledDeals = opportunities.filter(o => o.status === "open" && o.updated_at && differenceInDays(new Date(), new Date(o.updated_at)) > 14);
    const bigDeals = opportunities.filter(o => o.status === "open" && (o.value || 0) > 10000);
    const silentContacts = contacts.filter(c => !c.last_contacted_at || differenceInDays(new Date(), new Date(c.last_contacted_at)) > 30);
    const needsFollowUp = contacts.filter(c => c.next_follow_up_at && isPast(new Date(c.next_follow_up_at)));
    const newLeads = contacts.filter(c => c.lifecycle_stage === "lead" && differenceInDays(new Date(), new Date(c.created_at)) <= 7);
    const customers = contacts.filter(c => c.lifecycle_stage === "customer");
    const churned = contacts.filter(c => c.lifecycle_stage === "churned");
    const openDeals = opportunities.filter(o => o.status === "open");
    const totalPipelineValue = openDeals.reduce((s, o) => s + (o.value || 0), 0);
    const overdueDeals = openDeals.filter(o => o.expected_close_date && isPast(new Date(o.expected_close_date)));

    // Relationship Advisor
    if (atRisk.length > 0) {
      list.push({
        id: "at-risk", title: `${atRisk.length} Critical Relationships`, priority: "critical",
        category: "relationships", icon: AlertTriangle, advisorRole: "relationship", confidence: 0.88,
        description: `Contacts with health below 30%. Immediate personal intervention recommended.`,
        metric: `${atRisk.length} contacts`, action: "View Health Dashboard",
        entities: atRisk.slice(0, 5).map(c => `${c.first_name} ${c.last_name} (${c.health_score}%)`),
        boardroomRelevance: atRisk.some(c => bigDeals.some(d => d.contact_id === c.id)) ? 0.85 : 0.4,
        escalationCondition: "Escalate if any at-risk contact has active deal > $50K",
      });
    }

    // Follow-Through Advisor
    if (needsFollowUp.length > 0) {
      list.push({
        id: "follow-up", title: `${needsFollowUp.length} Past-Due Follow-Ups`, priority: "high",
        category: "engagement", icon: Target, advisorRole: "follow-through", confidence: 0.92,
        description: `Scheduled follow-ups that haven't been completed. Each delay reduces trust.`,
        metric: `${needsFollowUp.length} pending`, action: "View Contacts",
        entities: needsFollowUp.slice(0, 4).map(c => `${c.first_name} ${c.last_name}`),
      });
    }
    if (overdue.length > 3) {
      list.push({
        id: "overdue-tasks", title: `Task Backlog Growing`, priority: "high",
        category: "engagement", icon: CheckCircle, advisorRole: "follow-through", confidence: 0.85,
        description: `${overdue.length} tasks overdue. Follow-through credibility eroding.`,
        metric: `${overdue.length} overdue`, action: "View Tasks",
      });
    }

    // Opportunity Advisor
    if (stalledDeals.length > 0) {
      const value = stalledDeals.reduce((s, d) => s + (d.value || 0), 0);
      list.push({
        id: "stalled", title: `${stalledDeals.length} Stalled Deals`, priority: "high",
        category: "pipeline", icon: Clock, advisorRole: "opportunity", confidence: 0.8,
        description: `$${(value / 1000).toFixed(0)}K in pipeline hasn't moved in 14+ days.`,
        metric: `$${(value / 1000).toFixed(0)}K at risk`, action: "View Pipeline",
        entities: stalledDeals.slice(0, 3).map(d => d.title),
        boardroomRelevance: value > 100000 ? 0.9 : 0.5,
        escalationCondition: "Escalate if stalled 30+ days with combined value > $100K",
      });
    }
    if (overdueDeals.length > 0) {
      list.push({
        id: "overdue-deals", title: `${overdueDeals.length} Deals Past Close Date`, priority: "high",
        category: "pipeline", icon: AlertTriangle, advisorRole: "opportunity", confidence: 0.9,
        description: "These deals have passed their expected close date without resolution.",
        metric: `${overdueDeals.length} overdue`, action: "Review Pipeline",
        entities: overdueDeals.slice(0, 3).map(d => `${d.title} ($${((d.value || 0) / 1000).toFixed(0)}K)`),
      });
    }

    // Recovery Advisor
    if (churned.length > 0) {
      list.push({
        id: "churned", title: `${churned.length} Churned Contacts`, priority: "medium",
        category: "relationships", icon: RefreshCw, advisorRole: "recovery", confidence: 0.68,
        description: "Evaluate reactivation potential. Some may be recoverable with the right approach.",
        metric: `${churned.length} churned`, action: "Review for Win-Back",
      });
    }
    if (drifting.length > 0) {
      list.push({
        id: "drifting", title: `${drifting.length} Drifting Relationships`, priority: "medium",
        category: "relationships", icon: UserX, advisorRole: "recovery", confidence: 0.72,
        description: `Trending toward at-risk. A single touchpoint could reverse the trajectory.`,
        metric: `Health 30-50%`,
      });
    }

    // Account Health Advisor
    if (companies.length > 0) {
      const unhealthyCompanies = companies.filter(c => (c.health_score ?? 50) < 40);
      if (unhealthyCompanies.length > 0) {
        list.push({
          id: "unhealthy-companies", title: `${unhealthyCompanies.length} Unhealthy Accounts`, priority: "medium",
          category: "relationships", icon: Shield, advisorRole: "account-health", confidence: 0.82,
          description: "Company accounts with health below 40%. Review relationship depth and engagement.",
          entities: unhealthyCompanies.slice(0, 3).map(c => `${c.name} (${c.health_score}%)`),
        });
      }
    }

    // Communication Advisor
    if (silentContacts.length > 5) {
      list.push({
        id: "silent", title: `${silentContacts.length} Contacts Silent 30+ Days`, priority: "medium",
        category: "engagement", icon: MessageSquare, advisorRole: "communication", confidence: 0.75,
        description: `No outreach in over a month. Consider a batch re-engagement campaign.`,
        metric: `${silentContacts.length} silent`,
      });
    }

    // Collections Sensitivity
    // (Would integrate with finance data in production)
    if (customers.length > 0 && contacts.some(c => (c.tags || []).some(t => t.toLowerCase().includes("overdue") || t.toLowerCase().includes("payment")))) {
      list.push({
        id: "collections", title: "Payment-Sensitive Contacts Detected", priority: "medium",
        category: "engagement", icon: DollarSign, advisorRole: "collections", confidence: 0.7,
        description: "Some contacts are tagged with payment sensitivity. Handle communications carefully.",
        assumptions: ["Tags accurately reflect payment status"],
      });
    }

    // Strategic Account
    if (bigDeals.length > 0) {
      list.push({
        id: "big-deals", title: `${bigDeals.length} High-Value Deals Active`, priority: "info",
        category: "pipeline", icon: DollarSign, advisorRole: "strategic", confidence: 0.85,
        description: `Ensure each has executive alignment and multi-threaded engagement.`,
        metric: `$${(bigDeals.reduce((s, d) => s + (d.value || 0), 0) / 1000).toFixed(0)}K`,
        entities: bigDeals.slice(0, 3).map(d => `${d.title} ($${(d.value || 0).toLocaleString()})`),
        boardroomRelevance: totalPipelineValue > 200000 ? 0.8 : 0.4,
      });
    }

    // Growth signals
    if (newLeads.length > 0) {
      list.push({
        id: "new-leads", title: `${newLeads.length} New Leads This Week`, priority: "info",
        category: "growth", icon: Star, advisorRole: "opportunity", confidence: 0.8,
        description: `Fresh leads added. Qualify and assign to maximize conversion.`,
        metric: `${newLeads.length} new`,
      });
    }

    if (customers.length > 0 && contacts.length > 0) {
      const conversionRate = Math.round((customers.length / contacts.length) * 100);
      list.push({
        id: "conversion", title: `${conversionRate}% Conversion Rate`, priority: "info",
        category: "growth", icon: TrendingUp, advisorRole: "strategic", confidence: 0.8,
        description: conversionRate > 20 ? "Strong conversion. Maintain qualification standards." : "Consider optimizing qualification criteria.",
        metric: `${conversionRate}%`,
      });
    }

    if (list.length === 0) {
      list.push({
        id: "all-clear", title: "All Systems Clear", priority: "info",
        category: "all", icon: Shield, advisorRole: "account-health", confidence: 1.0,
        description: "No urgent issues detected. Maintain current engagement cadence.",
      });
    }

    return list;
  }, [contacts, companies, opportunities, tasks, comms]);

  const filtered = insights.filter(i =>
    !dismissed.has(i.id) &&
    (category === "all" || i.category === category) &&
    (activeAdvisor === "all" || i.advisorRole === activeAdvisor)
  );

  const criticalCount = insights.filter(i => i.priority === "critical" && !dismissed.has(i.id)).length;
  const highCount = insights.filter(i => i.priority === "high" && !dismissed.has(i.id)).length;

  // Advisor role summary
  const roleSummary = useMemo(() => {
    return ADVISOR_SPECS.map(spec => ({
      ...spec,
      count: insights.filter(i => i.advisorRole === spec.key && !dismissed.has(i.id)).length,
      criticalCount: insights.filter(i => i.advisorRole === spec.key && i.priority === "critical" && !dismissed.has(i.id)).length,
    }));
  }, [insights, dismissed]);

  return (
    <div className="space-y-4">
      <PageTruthBanner truthState="demo" />

      {/* Header */}
      <div className="rounded-xl border border-border/30 bg-gradient-to-r from-card/80 to-card/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" /> CRM Advisor Board
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              8 specialized advisors monitoring {contacts.length} contacts, {opportunities.length} deals, {companies.length} accounts
            </p>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-[10px] font-bold animate-pulse">{criticalCount} critical</span>}
            {highCount > 0 && <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold">{highCount} high</span>}
          </div>
        </div>

        {/* Advisor roster strip */}
        <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/20 flex-wrap">
          <button
            onClick={() => setActiveAdvisor("all")}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
              activeAdvisor === "all" ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >All ({insights.filter(i => !dismissed.has(i.id)).length})</button>
          {roleSummary.filter(r => r.count > 0).map(r => {
            const Icon = r.icon;
            return (
              <button
                key={r.key}
                onClick={() => setActiveAdvisor(r.key)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1 ${
                  activeAdvisor === r.key ? "bg-primary text-primary-foreground" : `bg-muted/30 ${r.color} hover:bg-muted/50`
                }`}
              >
                <Icon className="h-3 w-3" />
                {r.label.split(" ")[0]}
                <span className="opacity-70">({r.count})</span>
                {r.criticalCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-destructive" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", "relationships", "pipeline", "engagement", "growth", "escalation"] as InsightCategory[]).map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
            category === c ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
          }`}>{c === "all" ? "All Insights" : c}</button>
        ))}
      </div>

      {/* Insight Cards */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((insight, i) => {
            const style = PRIORITY_STYLES[insight.priority];
            const spec = ADVISOR_SPECS.find(s => s.key === insight.advisorRole)!;
            const AdvisorIcon = spec.icon;
            const isExpanded = expandedId === insight.id;

            return (
              <motion.div key={insight.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}>
                <Card className={`${style.border} ${style.bg} backdrop-blur-sm hover:border-primary/20 transition-all cursor-pointer`}
                  onClick={() => setExpandedId(isExpanded ? null : insight.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg ${spec.bg} flex items-center justify-center shrink-0`}>
                        <AdvisorIcon className={`h-4 w-4 ${spec.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${style.badge}`}>{insight.priority}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${spec.bg} ${spec.color}`}>{spec.label}</span>
                          <span className="text-[9px] text-muted-foreground">{Math.round(insight.confidence * 100)}% conf</span>
                          {insight.metric && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground font-medium">{insight.metric}</span>}
                          {insight.boardroomRelevance && insight.boardroomRelevance > 0.6 && (
                            <Badge variant="outline" className="text-[8px] h-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/20 gap-0.5">
                              <Shield className="h-2 w-2" /> Boardroom
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>

                        {insight.entities && insight.entities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {insight.entities.map((e, j) => (
                              <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-background/50 text-foreground border border-border/50">{e}</span>
                            ))}
                          </div>
                        )}

                        {/* Expanded details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="mt-3 pt-3 border-t border-border/20 space-y-2">
                                {insight.assumptions && insight.assumptions.length > 0 && (
                                  <div className="text-[10px] text-muted-foreground">
                                    <span className="font-semibold text-foreground">Assumptions: </span>
                                    {insight.assumptions.join("; ")}
                                  </div>
                                )}
                                {insight.escalationCondition && (
                                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Shield className="h-2.5 w-2.5 text-yellow-400" />
                                    <span className="font-semibold text-foreground">Escalation: </span>
                                    {insight.escalationCondition}
                                  </div>
                                )}
                                {insight.boardroomRelevance !== undefined && (
                                  <div className="text-[10px] text-muted-foreground">
                                    <span className="font-semibold text-foreground">Boardroom Score: </span>
                                    {Math.round(insight.boardroomRelevance * 100)}%
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex items-center gap-2 mt-3">
                          {insight.action && (
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={e => e.stopPropagation()}>
                              {insight.action} <ChevronRight className="h-3 w-3" />
                            </Button>
                          )}
                          <div className="flex items-center gap-1 ml-auto" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDismissed(prev => new Set([...prev, insight.id]))}>
                              <ThumbsDown className="h-3 w-3 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-8 gap-2">
            <Shield className="h-10 w-10 text-[hsl(var(--trust-safe))]/60" />
            <p className="text-sm font-medium text-foreground">All clear</p>
            <p className="text-xs text-muted-foreground">No active insights match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMAdvisorBoard;
