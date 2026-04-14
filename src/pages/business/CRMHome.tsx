import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCRMContacts, useCRMOpportunities, useCRMTasks, useCRMCommunications } from "@/hooks/use-crm-data";
import { Users, Building2, TrendingUp, Clock, Plus, Upload, AlertTriangle, CheckCircle2, Phone, Mail, Calendar, ArrowRight, Heart, Zap } from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const healthLabel = (score: number) => {
  if (score >= 80) return { text: "Healthy", color: "text-green-400", bg: "bg-green-500/10" };
  if (score >= 60) return { text: "Warming", color: "text-yellow-400", bg: "bg-yellow-500/10" };
  if (score >= 40) return { text: "Drifting", color: "text-orange-400", bg: "bg-orange-500/10" };
  return { text: "At Risk", color: "text-red-400", bg: "bg-red-500/10" };
};

const CRMHome = () => {
  const { data: contacts = [] } = useCRMContacts();
  const { data: opportunities = [] } = useCRMOpportunities();
  const { data: tasks = [] } = useCRMTasks();
  const { data: comms = [] } = useCRMCommunications();

  const totalContacts = contacts.length;
  const activeOpps = opportunities.filter(o => o.status === "open");
  const pipelineValue = activeOpps.reduce((s, o) => s + (o.value || 0), 0);
  const overdueTasks = tasks.filter(t => t.status !== "completed" && t.due_date && isPast(new Date(t.due_date)));
  const needsFollowUp = contacts.filter(c => c.next_follow_up_at && isPast(new Date(c.next_follow_up_at)));
  const atRisk = contacts.filter(c => (c.health_score ?? 50) < 40);
  const avgHealth = totalContacts > 0 ? Math.round(contacts.reduce((s, c) => s + (c.health_score ?? 50), 0) / totalContacts) : 0;

  return (
    <div className="space-y-6">
      <PageTruthBanner truthState="demo" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Relationship Command Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Your relationship operating room — who matters, what's happening, what needs action</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Contact
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Contacts", value: totalContacts, icon: Users, accent: "text-primary" },
          { label: "Pipeline Value", value: `$${(pipelineValue / 1000).toFixed(0)}K`, icon: TrendingUp, accent: "text-green-400" },
          { label: "Follow-Up Pressure", value: `${overdueTasks.length + needsFollowUp.length}`, icon: Clock, accent: overdueTasks.length > 0 ? "text-orange-400" : "text-muted-foreground" },
          { label: "Avg Health", value: `${avgHealth}%`, icon: Heart, accent: avgHealth >= 70 ? "text-green-400" : "text-orange-400" },
        ].map(kpi => (
          <Card key={kpi.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={`h-4 w-4 ${kpi.accent}`} />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What Matters Now */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> What Matters Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Follow-up needed */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Needs Follow-Up
              </h4>
              {needsFollowUp.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 py-2">All caught up ✓</p>
              ) : needsFollowUp.slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {c.first_name[0]}{c.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Overdue {c.next_follow_up_at ? formatDistanceToNow(new Date(c.next_follow_up_at), { addSuffix: false }) : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* At-risk contacts */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" /> At Risk
              </h4>
              {atRisk.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 py-2">No at-risk relationships</p>
              ) : atRisk.slice(0, 3).map(c => {
                const h = healthLabel(c.health_score ?? 0);
                return (
                  <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold text-red-400">
                      {c.first_name[0]}{c.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.first_name} {c.last_name}</p>
                      <p className={`text-xs ${h.color}`}>Health: {c.health_score}%</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active pipeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" /> Active Pipeline
              </h4>
              {activeOpps.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 py-2">No active opportunities</p>
              ) : activeOpps.slice(0, 3).map(o => (
                <div key={o.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-400">$</div>
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

      {/* Secondary: Tasks + Communications */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Pending Tasks */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Pending Tasks
              {overdueTasks.length > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">{overdueTasks.length} overdue</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {tasks.filter(t => t.status !== "completed").slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
                <div className={`w-1.5 h-1.5 rounded-full ${t.priority === "high" ? "bg-red-400" : t.priority === "medium" ? "bg-yellow-400" : "bg-muted-foreground"}`} />
                <span className="text-sm flex-1 truncate">{t.title}</span>
                {t.due_date && (
                  <span className={`text-xs ${isPast(new Date(t.due_date)) ? "text-red-400" : "text-muted-foreground"}`}>
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

        {/* Recent Communications */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Recent Communications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {comms.slice(0, 5).map(cm => (
              <div key={cm.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
                {cm.comm_type === "email" ? <Mail className="h-3.5 w-3.5 text-blue-400" /> :
                 cm.comm_type === "call" ? <Phone className="h-3.5 w-3.5 text-green-400" /> :
                 <Calendar className="h-3.5 w-3.5 text-purple-400" />}
                <span className="text-sm flex-1 truncate">{cm.subject || cm.content?.slice(0, 50)}</span>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(cm.occurred_at), { addSuffix: true })}</span>
              </div>
            ))}
            {comms.length === 0 && (
              <p className="text-xs text-muted-foreground/60 py-4 text-center">No communications yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CRMHome;
