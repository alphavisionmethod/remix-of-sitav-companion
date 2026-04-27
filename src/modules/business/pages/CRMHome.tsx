import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCRMContacts, useCRMCompanies, useCRMOpportunities, useCRMTasks, useCRMCommunications, useCRMNotes } from "@/hooks/use-crm-data";
import {
  Users, Building2, TrendingUp, Clock, Plus, Upload, AlertTriangle, CheckCircle2,
  Phone, Mail, Calendar, ArrowRight, Heart, Zap, DollarSign, BarChart3, Target,
  UserPlus, Activity, Star, MessageSquare, BrainCircuit, Shield, Eye, ChevronRight, Sparkles, Search
} from "lucide-react";
import { format, formatDistanceToNow, isPast, differenceInDays, subDays } from "date-fns";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { motion } from "framer-motion";
import { useBusinessNavigation } from "@/modules/business/contexts/BusinessNavigationContext";
import CRMCommandSearch from "@/modules/business/components/business/crm/CRMCommandSearch";
import { CRMLifecycleEngine } from "@/modules/business/components/business/crm/CRMLifecycleEngine";
import { CRMRelationshipIntelligence } from "@/modules/business/components/business/crm/CRMRelationshipIntelligence";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";

const CRMHome = () => {
  const { data: contacts = [] } = useCRMContacts();
  const { data: companies = [] } = useCRMCompanies();
  const { data: opportunities = [] } = useCRMOpportunities();
  const { data: tasks = [] } = useCRMTasks();
  const { data: comms = [] } = useCRMCommunications();
  const { data: notes = [] } = useCRMNotes();
  const { navigateTo } = useBusinessNavigation();
  const [showSearch, setShowSearch] = useState(false);
  const { adaptations } = useBusinessProfile();
  const crmLang = adaptations.crm.language;

  const totalContacts = contacts.length;
  const activeOpps = opportunities.filter(o => o.status === "open");
  const pipelineValue = activeOpps.reduce((s, o) => s + (o.value || 0), 0);
  const weightedValue = activeOpps.reduce((s, o) => s + (o.value || 0) * ((o.probability || 50) / 100), 0);
  const overdueTasks = tasks.filter(t => t.status !== "completed" && t.due_date && isPast(new Date(t.due_date)));
  const needsFollowUp = contacts.filter(c => c.next_follow_up_at && isPast(new Date(c.next_follow_up_at)));
  const atRisk = contacts.filter(c => (c.health_score ?? 50) < 40);
  const avgHealth = totalContacts > 0 ? Math.round(contacts.reduce((s, c) => s + (c.health_score ?? 50), 0) / totalContacts) : 0;
  const wonDeals = opportunities.filter(o => o.status === "won");
  const wonValue = wonDeals.reduce((s, o) => s + (o.value || 0), 0);
  const lostDeals = opportunities.filter(o => o.status === "lost");
  const winRate = (wonDeals.length + lostDeals.length) > 0 ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100) : 0;
  const recentComms = comms.filter(c => differenceInDays(new Date(), new Date(c.occurred_at)) <= 7).length;
  const newContacts7d = contacts.filter(c => differenceInDays(new Date(), new Date(c.created_at)) <= 7).length;

  // Lifecycle breakdown
  const lifecycleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    contacts.forEach(c => { counts[c.lifecycle_stage] = (counts[c.lifecycle_stage] || 0) + 1; });
    return counts;
  }, [contacts]);

  // Advisor insights (generated from data)
  const advisorInsights = useMemo(() => {
    const insights: { icon: any; text: string; severity: "info" | "warning" | "success" }[] = [];
    if (atRisk.length > 0) insights.push({ icon: AlertTriangle, text: `${atRisk.length} contact${atRisk.length > 1 ? "s" : ""} at risk — consider outreach`, severity: "warning" });
    if (overdueTasks.length > 3) insights.push({ icon: Clock, text: `${overdueTasks.length} overdue tasks are piling up`, severity: "warning" });
    if (needsFollowUp.length > 0) insights.push({ icon: Phone, text: `${needsFollowUp.length} contact${needsFollowUp.length > 1 ? "s" : ""} past follow-up date`, severity: "warning" });
    if (winRate > 60) insights.push({ icon: Target, text: `Strong ${winRate}% win rate — pipeline is converting well`, severity: "success" });
    if (newContacts7d > 0) insights.push({ icon: UserPlus, text: `${newContacts7d} new contact${newContacts7d > 1 ? "s" : ""} added this week`, severity: "info" });
    if (recentComms > 5) insights.push({ icon: MessageSquare, text: `${recentComms} touchpoints logged this week — good engagement`, severity: "success" });
    if (insights.length === 0) insights.push({ icon: Sparkles, text: "Your CRM is in good shape. Keep engaging!", severity: "success" });
    return insights;
  }, [atRisk, overdueTasks, needsFollowUp, winRate, newContacts7d, recentComms]);

  // Pipeline stages funnel
  const stageCounts = useMemo(() => {
    const counts: Record<string, { count: number; value: number }> = {};
    activeOpps.forEach(o => {
      if (!counts[o.stage]) counts[o.stage] = { count: 0, value: 0 };
      counts[o.stage].count++;
      counts[o.stage].value += (o.value || 0);
    });
    return Object.entries(counts).sort((a, b) => b[1].value - a[1].value);
  }, [activeOpps]);

  const nav = (path: string) => navigateTo(path);

  return (
    <div className="space-y-6">
      <PageTruthBanner truthState="demo" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Relationship Command Center</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalContacts} contacts · {activeOpps.length} active deals · {companies.length} companies
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowSearch(true)}>
            <Search className="h-3.5 w-3.5" /> Search
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => nav("crm-import")}>
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => nav("crm-contacts")}>
            <Plus className="h-3.5 w-3.5" /> Add Contact
          </Button>
        </div>
      </div>

      {/* KPI Row 1 — Primary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Contacts", value: totalContacts, icon: Users, accent: "text-primary", onClick: () => nav("crm-contacts") },
          { label: "Companies", value: companies.length, icon: Building2, accent: "text-blue-400", onClick: () => nav("crm-companies") },
          { label: "Pipeline", value: `$${(pipelineValue / 1000).toFixed(0)}K`, icon: TrendingUp, accent: "text-[hsl(var(--trust-safe))]", onClick: () => nav("crm-pipeline") },
          { label: "Weighted", value: `$${(weightedValue / 1000).toFixed(0)}K`, icon: Target, accent: "text-primary" },
          { label: "Won Revenue", value: `$${(wonValue / 1000).toFixed(0)}K`, icon: DollarSign, accent: "text-[hsl(var(--trust-safe))]" },
          { label: "Win Rate", value: `${winRate}%`, icon: BarChart3, accent: winRate > 50 ? "text-[hsl(var(--trust-safe))]" : "text-orange-400" },
        ].map(kpi => (
          <Card key={kpi.label} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer" onClick={kpi.onClick}>
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <kpi.icon className={`h-3.5 w-3.5 ${kpi.accent}`} />
                <span className="text-[10px] text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2 — Health + Pressure */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 cursor-pointer" onClick={() => nav("crm-health")}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground font-medium">Avg Health</span>
              <Heart className={`h-3.5 w-3.5 ${avgHealth >= 70 ? "text-[hsl(var(--trust-safe))]" : avgHealth >= 50 ? "text-yellow-400" : "text-destructive"}`} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-foreground">{avgHealth}</span>
              <span className="text-xs text-muted-foreground mb-1">/100</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${avgHealth >= 70 ? "bg-[hsl(var(--trust-safe))]" : avgHealth >= 50 ? "bg-yellow-400" : "bg-destructive"}`} style={{ width: `${avgHealth}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-border/50 bg-card/50 backdrop-blur-sm ${atRisk.length > 0 ? "border-destructive/30" : ""}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground font-medium">At Risk</span>
              <AlertTriangle className={`h-3.5 w-3.5 ${atRisk.length > 0 ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{atRisk.length}</p>
            <p className="text-[10px] text-muted-foreground mt-1">health &lt; 40</p>
          </CardContent>
        </Card>

        <Card className={`border-border/50 bg-card/50 backdrop-blur-sm ${overdueTasks.length > 0 ? "border-orange-500/30" : ""}`} onClick={() => nav("crm-tasks")}>
          <CardContent className="p-3 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground font-medium">Overdue Tasks</span>
              <Clock className={`h-3.5 w-3.5 ${overdueTasks.length > 0 ? "text-orange-400" : "text-muted-foreground"}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{overdueTasks.length}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{tasks.filter(t => t.status !== "completed").length} total pending</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground font-medium">This Week</span>
              <Activity className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{recentComms}</p>
            <p className="text-[10px] text-muted-foreground mt-1">touchpoints logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Advisor Insights */}
      <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Advisor Insights</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">AI</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {advisorInsights.map((insight, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className={`flex items-start gap-2 rounded-lg px-3 py-2 ${
                  insight.severity === "warning" ? "bg-orange-500/5" : insight.severity === "success" ? "bg-[hsl(var(--trust-safe))]/5" : "bg-muted/20"
                }`}
              >
                <insight.icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                  insight.severity === "warning" ? "text-orange-400" : insight.severity === "success" ? "text-[hsl(var(--trust-safe))]" : "text-primary"
                }`} />
                <span className="text-xs text-foreground">{insight.text}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Funnel + Relationship Intelligence */}
      <div className="grid md:grid-cols-2 gap-4">
        <CRMLifecycleEngine contacts={contacts} onNavigate={(stage) => nav("crm-contacts")} compact />

        <CRMRelationshipIntelligence
          contacts={contacts}
          communications={comms}
          opportunities={opportunities}
          tasks={tasks}
          compact
        />
      </div>

      {/* Pipeline Stages */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[hsl(var(--trust-safe))]" /> Pipeline Stages
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => nav("crm-pipeline")}>
              View Pipeline <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {stageCounts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No active deals</p>
          ) : stageCounts.map(([stage, data]) => (
            <div key={stage} className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-foreground capitalize">{stage}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">{data.count} deal{data.count !== 1 ? "s" : ""}</span>
                <span className="text-xs font-bold text-foreground">${(data.value / 1000).toFixed(0)}K</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* What Matters Now — 3 column */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> What Matters Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Needs Follow-Up ({needsFollowUp.length})
              </h4>
              {needsFollowUp.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 py-2">All caught up ✓</p>
              ) : needsFollowUp.slice(0, 4).map(c => (
                <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => nav("crm-contacts")}>
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {c.first_name?.[0]}{c.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-orange-400">
                      {c.next_follow_up_at ? formatDistanceToNow(new Date(c.next_follow_up_at), { addSuffix: true }) : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" /> At Risk ({atRisk.length})
              </h4>
              {atRisk.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 py-2">No at-risk relationships</p>
              ) : atRisk.slice(0, 4).map(c => (
                <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => nav("crm-health")}>
                  <div className="w-7 h-7 rounded-full bg-destructive/20 flex items-center justify-center text-xs font-bold text-destructive">
                    {c.first_name?.[0]}{c.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.first_name} {c.last_name}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-destructive" style={{ width: `${c.health_score ?? 0}%` }} />
                      </div>
                      <p className="text-xs text-destructive">{c.health_score}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" /> Top Deals
              </h4>
              {activeOpps.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 py-2">No active opportunities</p>
              ) : activeOpps.sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 4).map(o => (
                <div key={o.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => nav("crm-pipeline")}>
                  <div className="w-7 h-7 rounded-full bg-[hsl(var(--trust-safe))]/20 flex items-center justify-center text-xs font-bold text-[hsl(var(--trust-safe))]">$</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{o.title}</p>
                    <p className="text-xs text-muted-foreground">${o.value?.toLocaleString()} · {o.stage} · {o.probability}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks + Communications */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Pending Tasks
                {overdueTasks.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive">{overdueTasks.length} overdue</span>}
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => nav("crm-tasks")}>
                View All <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {tasks.filter(t => t.status !== "completed").slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
                <div className={`w-1.5 h-1.5 rounded-full ${t.priority === "high" ? "bg-destructive" : t.priority === "medium" ? "bg-yellow-400" : "bg-muted-foreground"}`} />
                <span className="text-sm flex-1 truncate">{t.title}</span>
                {t.due_date && (
                  <span className={`text-xs ${isPast(new Date(t.due_date)) ? "text-destructive" : "text-muted-foreground"}`}>
                    {format(new Date(t.due_date), "MMM d")}
                  </span>
                )}
              </div>
            ))}
            {tasks.filter(t => t.status !== "completed").length === 0 && (
              <p className="text-xs text-muted-foreground/60 py-4 text-center">No pending tasks</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => nav("crm-timeline")}>
                Timeline <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {comms.slice(0, 5).map(cm => (
              <div key={cm.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
                {cm.comm_type === "email" ? <Mail className="h-3.5 w-3.5 text-blue-400" /> :
                 cm.comm_type === "call" ? <Phone className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> :
                 <Calendar className="h-3.5 w-3.5 text-primary" />}
                <span className="text-sm flex-1 truncate">{cm.subject || (cm.content as string)?.slice(0, 50)}</span>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(cm.occurred_at), { addSuffix: true })}</span>
              </div>
            ))}
            {comms.length === 0 && (
              <p className="text-xs text-muted-foreground/60 py-4 text-center">No communications yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Nav Grid */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Access</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { label: "Contacts", icon: Users, path: "crm-contacts" },
            { label: "Companies", icon: Building2, path: "crm-companies" },
            { label: "Pipeline", icon: TrendingUp, path: "crm-pipeline" },
            { label: "Health", icon: Heart, path: "crm-health" },
            { label: "Timeline", icon: Activity, path: "crm-timeline" },
            { label: "Tasks", icon: CheckCircle2, path: "crm-tasks" },
            { label: "Notes", icon: MessageSquare, path: "crm-notes" },
            { label: "Segments", icon: Star, path: "crm-segments" },
            { label: "Automations", icon: Zap, path: "crm-automations" },
            { label: "Import", icon: Upload, path: "crm-import" },
            { label: "Duplicates", icon: Shield, path: "crm-duplicates" },
          ].map(q => (
            <button key={q.path} onClick={() => nav(q.path)} className="flex flex-col items-center gap-1.5 rounded-xl bg-muted/20 hover:bg-muted/40 border border-border/50 hover:border-primary/30 p-3 transition-all">
              <q.icon className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground">{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      <CRMCommandSearch open={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
};

export default CRMHome;
