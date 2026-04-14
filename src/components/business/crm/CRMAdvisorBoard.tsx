import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCRMContacts, useCRMOpportunities, useCRMTasks, useCRMCommunications } from "@/hooks/use-crm-data";
import {
  BrainCircuit, AlertTriangle, TrendingUp, Clock, Users, Heart, Phone,
  CheckCircle, Shield, Lightbulb, ArrowRight, ChevronRight, Target, Zap,
  UserX, DollarSign, Star, ThumbsUp, ThumbsDown, MessageSquare
} from "lucide-react";
import { isPast, differenceInDays, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type InsightCategory = "all" | "relationships" | "pipeline" | "engagement" | "growth";
type InsightPriority = "critical" | "high" | "medium" | "info";

interface Insight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  priority: InsightPriority;
  icon: any;
  metric?: string;
  action?: string;
  actionPath?: string;
  entities?: string[];
}

const PRIORITY_STYLES: Record<InsightPriority, { border: string; bg: string; badge: string; text: string }> = {
  critical: { border: "border-destructive/30", bg: "bg-destructive/5", badge: "bg-destructive/20 text-destructive", text: "text-destructive" },
  high: { border: "border-orange-500/30", bg: "bg-orange-500/5", badge: "bg-orange-500/20 text-orange-400", text: "text-orange-400" },
  medium: { border: "border-yellow-500/20", bg: "bg-yellow-500/5", badge: "bg-yellow-500/20 text-yellow-500", text: "text-yellow-500" },
  info: { border: "border-primary/20", bg: "bg-primary/5", badge: "bg-primary/20 text-primary", text: "text-primary" },
};

const CRMAdvisorBoard = () => {
  const { data: contacts = [] } = useCRMContacts();
  const { data: opportunities = [] } = useCRMOpportunities();
  const { data: tasks = [] } = useCRMTasks();
  const { data: comms = [] } = useCRMCommunications();
  const [category, setCategory] = useState<InsightCategory>("all");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const insights = useMemo(() => {
    const list: Insight[] = [];
    const atRisk = contacts.filter(c => (c.health_score ?? 50) < 30);
    const drifting = contacts.filter(c => (c.health_score ?? 50) >= 30 && (c.health_score ?? 50) < 50);
    const overdue = tasks.filter(t => t.status !== "completed" && t.due_date && isPast(new Date(t.due_date)));
    const stalledDeals = opportunities.filter(o => o.status === "open" && o.updated_at && differenceInDays(new Date(), new Date(o.updated_at)) > 14);
    const bigDeals = opportunities.filter(o => o.status === "open" && (o.value || 0) > 10000);
    const silentContacts = contacts.filter(c => !c.last_contacted_at || differenceInDays(new Date(), new Date(c.last_contacted_at)) > 30);
    const needsFollowUp = contacts.filter(c => c.next_follow_up_at && isPast(new Date(c.next_follow_up_at)));
    const newLeads = contacts.filter(c => c.lifecycle_stage === "lead" && differenceInDays(new Date(), new Date(c.created_at)) <= 7);
    const customers = contacts.filter(c => c.lifecycle_stage === "customer");

    // Critical
    if (atRisk.length > 0) {
      list.push({
        id: "at-risk", title: `${atRisk.length} Critical Relationships`, priority: "critical", category: "relationships", icon: AlertTriangle,
        description: `These contacts have health scores below 30% and require immediate attention to prevent churn.`,
        metric: `${atRisk.length} contacts`, action: "View Health Dashboard", actionPath: "crm-health",
        entities: atRisk.slice(0, 5).map(c => `${c.first_name} ${c.last_name} (${c.health_score}%)`),
      });
    }

    if (stalledDeals.length > 0) {
      const value = stalledDeals.reduce((s, d) => s + (d.value || 0), 0);
      list.push({
        id: "stalled", title: `${stalledDeals.length} Stalled Deal${stalledDeals.length > 1 ? "s" : ""}`, priority: "high", category: "pipeline", icon: Clock,
        description: `$${(value / 1000).toFixed(0)}K in pipeline hasn't moved in 14+ days. Consider re-engagement or qualification review.`,
        metric: `$${(value / 1000).toFixed(0)}K at risk`, action: "View Pipeline", actionPath: "crm-pipeline",
        entities: stalledDeals.slice(0, 3).map(d => d.title),
      });
    }

    if (overdue.length > 3) {
      list.push({
        id: "overdue-tasks", title: `Task Backlog Growing`, priority: "high", category: "engagement", icon: CheckCircle,
        description: `${overdue.length} tasks are overdue. This impacts follow-through credibility and relationship health.`,
        metric: `${overdue.length} overdue`, action: "View Tasks", actionPath: "crm-tasks",
      });
    }

    // High
    if (needsFollowUp.length > 0) {
      list.push({
        id: "follow-up", title: `${needsFollowUp.length} Past-Due Follow-Ups`, priority: "high", category: "engagement", icon: Phone,
        description: `Contacts with scheduled follow-ups that haven't been completed. Each delay reduces trust.`,
        metric: `${needsFollowUp.length} pending`, action: "View Contacts", actionPath: "crm-contacts",
        entities: needsFollowUp.slice(0, 4).map(c => `${c.first_name} ${c.last_name}`),
      });
    }

    if (drifting.length > 0) {
      list.push({
        id: "drifting", title: `${drifting.length} Drifting Relationships`, priority: "medium", category: "relationships", icon: UserX,
        description: `These contacts are trending toward at-risk. A single touchpoint could reverse the trajectory.`,
        metric: `Health 30-50%`, action: "View Health", actionPath: "crm-health",
      });
    }

    // Medium
    if (silentContacts.length > 5) {
      list.push({
        id: "silent", title: `${silentContacts.length} Contacts Silent 30+ Days`, priority: "medium", category: "engagement", icon: MessageSquare,
        description: `No outreach in over a month. Consider a batch re-engagement campaign or segment review.`,
        metric: `${silentContacts.length} silent`, action: "View Segments", actionPath: "crm-segments",
      });
    }

    if (bigDeals.length > 0) {
      list.push({
        id: "big-deals", title: `${bigDeals.length} High-Value Deals Active`, priority: "info", category: "pipeline", icon: DollarSign,
        description: `These deals represent significant revenue. Ensure each has a clear next step and stakeholder engagement plan.`,
        metric: `$${(bigDeals.reduce((s, d) => s + (d.value || 0), 0) / 1000).toFixed(0)}K`, action: "View Pipeline", actionPath: "crm-pipeline",
        entities: bigDeals.slice(0, 3).map(d => `${d.title} ($${(d.value || 0).toLocaleString()})`),
      });
    }

    // Info
    if (newLeads.length > 0) {
      list.push({
        id: "new-leads", title: `${newLeads.length} New Leads This Week`, priority: "info", category: "growth", icon: Star,
        description: `Fresh leads have been added. Qualify and assign them to maximize conversion potential.`,
        metric: `${newLeads.length} new`, action: "View Contacts", actionPath: "crm-contacts",
      });
    }

    if (customers.length > 0 && contacts.length > 0) {
      const conversionRate = Math.round((customers.length / contacts.length) * 100);
      list.push({
        id: "conversion", title: `${conversionRate}% Contact → Customer Rate`, priority: "info", category: "growth", icon: Target,
        description: `Your overall conversion from contacts to customers. ${conversionRate > 20 ? "Strong performance!" : "Consider optimizing qualification criteria."}`,
        metric: `${conversionRate}%`,
      });
    }

    if (list.length === 0) {
      list.push({
        id: "all-clear", title: "Everything Looks Good", priority: "info", category: "all", icon: Shield,
        description: "No urgent issues detected. Keep maintaining your current engagement cadence.",
      });
    }

    return list;
  }, [contacts, opportunities, tasks, comms]);

  const filtered = insights.filter(i => !dismissed.has(i.id) && (category === "all" || i.category === category));

  const criticalCount = insights.filter(i => i.priority === "critical" && !dismissed.has(i.id)).length;
  const highCount = insights.filter(i => i.priority === "high" && !dismissed.has(i.id)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" /> CRM Advisor Board
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            AI-driven insights across {contacts.length} contacts, {opportunities.length} deals, and {tasks.length} tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-[10px] font-bold">{criticalCount} critical</span>}
          {highCount > 0 && <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold">{highCount} high</span>}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", "relationships", "pipeline", "engagement", "growth"] as InsightCategory[]).map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
            category === c ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
          }`}>{c === "all" ? "All Insights" : c}</button>
        ))}
      </div>

      {/* Insight Cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((insight, i) => {
            const style = PRIORITY_STYLES[insight.priority];
            return (
              <motion.div key={insight.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}>
                <Card className={`${style.border} ${style.bg} backdrop-blur-sm`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-background/50 flex items-center justify-center shrink-0">
                        <insight.icon className={`h-4.5 w-4.5 ${style.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${style.badge}`}>{insight.priority}</span>
                          {insight.metric && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground font-medium">{insight.metric}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>

                        {insight.entities && insight.entities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {insight.entities.map((e, j) => (
                              <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-background/50 text-foreground border border-border/50">{e}</span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          {insight.action && (
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                              {insight.action} <ChevronRight className="h-3 w-3" />
                            </Button>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
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
            <p className="text-sm font-medium text-foreground">All clear in this category</p>
            <p className="text-xs text-muted-foreground">No active insights to show</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMAdvisorBoard;
