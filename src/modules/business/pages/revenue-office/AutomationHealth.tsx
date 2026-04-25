import { Typography } from "@/platform/sita/components/sita/Typography";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Activity, CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, Zap,
  RefreshCw, Users, Mail, Phone, Heart, Shield, Brain, BarChart3, Target, Globe
} from "lucide-react";
import { useState } from "react";
import AutomationSubNav from "./AutomationSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { useRevenueAutomationHealth } from "@/hooks/use-revenue-automation-health";
import { FatigueAlertDrawer } from "@/modules/business/components/revenue/FatigueAlertDrawer";
import type { FatigueAlertRow } from "@/hooks/use-revenue-automation-health";
const statusIcon = { healthy: CheckCircle, warning: AlertTriangle, error: XCircle, underperforming: TrendingUp };
const statusColor = { healthy: "text-emerald-400", warning: "text-amber-400", error: "text-red-400", underperforming: "text-blue-400" };

export default function AutomationHealth() {
  const [tab, setTab] = useState("all");
  const [activeAlert, setActiveAlert] = useState<FatigueAlertRow | null>(null);
  const { data, isLoading } = useRevenueAutomationHealth();
  const healthMetrics = data?.healthMetrics ?? [];
  const advisorInsights = data?.advisorInsights ?? [];
  const automations = data?.automations ?? [];
  const fatigueAlerts = data?.fatigueAlerts ?? [];
  const domainHealth: Array<{ domain: string; icon: any; healthScore: number; status: string; automationCount: number; triggersThisWeek: number; successRate: number; failures: number; revenueImpact: string; trend: string; topIssue?: string }> = [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<AutomationSubNav />
      <div>
        <Typography role="appTitle" className="flex items-center gap-2"><Activity className="h-6 w-6 text-blue-400" />Automation Health Monitor</Typography>
        <p className="text-muted-foreground">Track success, failures, delays, fatigue, engagement, and conversion across all automations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {healthMetrics.length === 0 && !isLoading && (
          <div className="col-span-full">
            <PremiumEmptyState variant="no-data" icon={Activity} title="No automation health data" description="Once you create automations and they begin running, aggregated health metrics will appear here." />
          </div>
        )}
        {healthMetrics.map((m) => (
          <Card key={m.label} className="bg-card/50 border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                {m.icon && <m.icon className={`h-3.5 w-3.5 ${m.color}`} />}
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}{m.label === "Fatigue Score" ? "" : "%"}</p>
              <Progress value={m.label === "Fatigue Score" ? 100 - m.value : m.value} className="h-1 mt-1" />
              <p className="text-[10px] text-muted-foreground mt-0.5">Target: {m.target}{m.label === "Fatigue Score" ? " max" : "%"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advisor Insights */}
      <Card className="bg-card/50 border-primary/20 border">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-primary" />Advisor Health Insights</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          {advisorInsights.length === 0 && (
            <p className="text-xs text-muted-foreground col-span-full">No advisor insights yet — recommendations tagged with category “automation” will appear here.</p>
          )}
          {advisorInsights.map((a, i) => (
            <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/30">
              <Badge variant="secondary" className="text-[10px] mb-1">{a.advisor}</Badge>
              <p className="text-xs text-foreground mb-2">{a.insight}</p>
              <button className="px-3 py-1 rounded bg-primary/10 text-primary text-[10px] font-medium">{a.action}</button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Automation List */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card/50">
          <TabsTrigger value="all">All ({automations.length})</TabsTrigger>
          <TabsTrigger value="healthy">Healthy ({automations.filter(a => a.status === "healthy").length})</TabsTrigger>
          <TabsTrigger value="issues">Issues ({automations.filter(a => a.status !== "healthy").length})</TabsTrigger>
          <TabsTrigger value="fatigue">Fatigue ({fatigueAlerts.length})</TabsTrigger>
          <TabsTrigger value="domain">By Domain ({domainHealth.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2">
          {automations.length === 0 && !isLoading && (
            <PremiumEmptyState variant="no-data" icon={Zap} title="No automations yet" description="Create your first CRM automation to begin tracking trigger volume, success rate and fatigue here." />
          )}
          {automations.map((a) => {
            const Icon = statusIcon[a.status as keyof typeof statusIcon];
            const color = statusColor[a.status as keyof typeof statusColor];
            return (
              <Card key={a.name} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors cursor-pointer">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                        <span>{a.triggers}x triggered</span>
                        <span>{a.failures} failures</span>
                        <span>{a.contacts} contacts</span>
                        <span>Last: {a.lastRun}</span>
                        {a.revenue !== "—" && <span className="text-emerald-400">{a.revenue}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="flex gap-0.5">
                      {a.trend.map((v, i) => (
                        <div key={i} className="w-1.5 bg-muted rounded-full overflow-hidden" style={{ height: 20 }}>
                          <div className={`w-full rounded-full ${v >= 90 ? "bg-emerald-400" : v >= 70 ? "bg-amber-400" : "bg-red-400"}`} style={{ height: `${v}%`, marginTop: `${100 - v}%` }} />
                        </div>
                      ))}
                    </div>
                    <span className={`text-sm font-bold ${a.successRate >= 90 ? "text-emerald-400" : a.successRate >= 70 ? "text-amber-400" : "text-red-400"}`}>{a.successRate}%</span>
                    <Badge variant={a.status === "error" ? "destructive" : a.status === "warning" ? "secondary" : "default"} className="text-[10px]">{a.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="healthy" className="space-y-2">
          {automations.filter(a => a.status === "healthy").map((a) => (
            <Card key={a.name} className="bg-card/50 border-border/50"><CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /><span className="text-sm text-foreground">{a.name}</span></div>
              <span className="text-sm font-bold text-emerald-400">{a.successRate}%</span>
            </CardContent></Card>
          ))}
        </TabsContent>

        <TabsContent value="issues" className="space-y-2">
          {automations.filter(a => a.status !== "healthy").map((a) => {
            const Icon = statusIcon[a.status as keyof typeof statusIcon];
            const color = statusColor[a.status as keyof typeof statusColor];
            return (
              <Card key={a.name} className="bg-card/50 border-border/50"><CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${color}`} /><div><p className="text-sm text-foreground">{a.name}</p><p className="text-[10px] text-muted-foreground">{a.triggers}x triggered · {a.failures} failures</p></div></div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${color}`}>{a.successRate}%</span>
                  <button className="px-3 py-1 rounded bg-primary/10 text-primary text-[10px]">Investigate</button>
                </div>
              </CardContent></Card>
            );
          })}
        </TabsContent>

        <TabsContent value="fatigue" className="space-y-2">
          {fatigueAlerts.length === 0 && (
            <PremiumEmptyState variant="no-data" icon={Heart} title="No contact fatigue detected" description="Fatigue alerts appear when an automation triggers an unsubscribe spike, frequency cap, or sentiment drop on a channel." />
          )}
          {fatigueAlerts.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveAlert(f)}
              className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-lg"
            >
              <Card className="bg-card/50 border-border/50 hover:border-primary/40 transition-colors">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground capitalize">{f.signal.replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {f.channel} · {new Date(f.createdAt).toLocaleString()}
                      {f.acknowledgedAt ? " · acknowledged" : ""}
                    </p>
                  </div>
                  <Badge variant={f.severity === "critical" ? "destructive" : "secondary"} className="text-[10px] capitalize">
                    {f.severity}
                  </Badge>
                </CardContent>
              </Card>
            </button>
          ))}
        </TabsContent>

        {/* DOMAIN-LEVEL HEALTH TAB */}
        <TabsContent value="domain" className="space-y-3">
          <Card className="bg-card/50 border-primary/20 border">
            <CardContent className="p-4 flex items-start gap-3">
              <Globe className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Domain-Level Automation Health</p>
                <p className="text-xs text-muted-foreground">Health metrics broken down by business domain — identify which automation areas need attention across your entire commercial engine.</p>
              </div>
            </CardContent>
          </Card>

          {domainHealth.length === 0 && (
            <PremiumEmptyState variant="no-data" icon={Globe} title="Domain breakdown not available yet" description="Domain-level rollups require automations tagged by business domain. Tag your automations to populate this view." />
          )}
          {domainHealth.map((d) => (
            <Card key={d.domain} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <d.icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{d.domain}</p>
                      <p className="text-[10px] text-muted-foreground">{d.automationCount} automations · {d.triggersThisWeek} triggers this week</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${d.healthScore >= 90 ? "text-emerald-400" : d.healthScore >= 70 ? "text-amber-400" : "text-red-400"}`}>{d.healthScore}%</span>
                    <Badge variant={d.status === "healthy" ? "default" : d.status === "warning" ? "secondary" : "destructive"} className="text-[10px]">{d.status}</Badge>
                  </div>
                </div>
                <Progress value={d.healthScore} className="h-1.5 mb-2" />
                <div className="grid grid-cols-4 gap-3 text-xs text-muted-foreground">
                  <div>
                    <p className="text-[10px]">Success Rate</p>
                    <p className={`font-bold ${d.successRate >= 90 ? "text-emerald-400" : "text-amber-400"}`}>{d.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px]">Failures</p>
                    <p className={`font-bold ${d.failures === 0 ? "text-emerald-400" : "text-red-400"}`}>{d.failures}</p>
                  </div>
                  <div>
                    <p className="text-[10px]">Revenue Impact</p>
                    <p className="font-bold text-foreground">{d.revenueImpact}</p>
                  </div>
                  <div>
                    <p className="text-[10px]">Trend</p>
                    <p className={`font-bold ${d.trend === "improving" ? "text-emerald-400" : d.trend === "stable" ? "text-blue-400" : "text-red-400"}`}>{d.trend}</p>
                  </div>
                </div>
                {d.topIssue && (
                  <div className="mt-2 p-2 rounded bg-amber-500/5 border border-amber-500/20">
                    <p className="text-[10px] text-amber-400"><AlertTriangle className="h-3 w-3 inline mr-1" />{d.topIssue}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      <FatigueAlertDrawer alert={activeAlert} onOpenChange={(o) => { if (!o) setActiveAlert(null); }} />
    </motion.div>
  );
}
