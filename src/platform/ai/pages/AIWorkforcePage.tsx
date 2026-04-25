import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Users, Cpu, Activity, Zap, Shield, BarChart3, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyState } from "@/components/sita/SitaComponents";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";
const statusColor = { active: "bg-emerald-500", paused: "bg-amber-500", idle: "bg-muted" };

export default function AIWorkforcePage() {
  const [selectedTab, setSelectedTab] = useState("roster");
  const { user , isDemo} = useAuth();
  const { data: realAgents = [] } = useQuery({
    queryKey: ["ai_workforce_agents", user?.id],
    enabled: !!user && !false,
    queryFn: async () => {
      const { data } = await fromTable("advisor_registry").select("*").eq("active", true);
      return (data ?? []).map((a: Record<string, any>) => ({
        id: a.id, name: a.display_name, role: a.advisor_type,
        status: "active" as const, tasksCompleted: 0, trustScore: Math.round(a.trust_threshold * 100), costToday: 0,
      }));
    },
  });

  const agents = realAgents;

  return (
    <PageShell>
    <div className="space-y-6 p-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Bot className="h-6 w-6 text-primary" /> AI Workforce</h1>
          <p className="text-muted-foreground text-sm mt-1">Agent orchestration, task assignment, and cost governance</p>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Deploy Agent</Button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Agents", value: "4", icon: Bot, color: "text-emerald-500" },
          { label: "Tasks Today", value: "588", icon: Activity, color: "text-blue-500" },
          { label: "Total Cost", value: "$4.78", icon: BarChart3, color: "text-amber-500" },
          { label: "Avg Trust", value: "93", icon: Shield, color: "text-purple-500" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="roster">Agent Roster</TabsTrigger>
          <TabsTrigger value="tasks">Task Queue</TabsTrigger>
          <TabsTrigger value="economics">Cost Governance</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="space-y-3 mt-4">
          {agents.map((agent, i) => (
            <motion.div key={agent.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Cpu className="h-5 w-5 text-primary" />
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${statusColor[agent.status]} ring-2 ring-background`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Tasks</p>
                      <p className="text-sm font-medium text-foreground">{agent.tasksCompleted}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Trust</p>
                      <div className="flex items-center gap-2">
                        <Progress value={agent.trustScore} className="w-16 h-1.5" />
                        <span className="text-xs text-foreground">{agent.trustScore}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Cost</p>
                      <p className="text-sm font-medium text-foreground">${agent.costToday.toFixed(2)}</p>
                    </div>
                    <Badge variant={agent.status === "active" ? "default" : "secondary"} className="capitalize">{agent.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-sm">Active Task Queue</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { task: "Qualify 12 new leads from HubSpot", agent: "Revenue Scout", priority: "high", progress: 67 },
                { task: "Send payment reminders for 5 overdue invoices", agent: "Invoice Guardian", priority: "critical", progress: 40 },
                { task: "Monitor API latency for anomalies", agent: "Data Sentinel", priority: "normal", progress: 100 },
                { task: "Prepare briefing for tomorrow's board call", agent: "Meeting Maestro", priority: "high", progress: 23 },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{t.task}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.agent}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={t.priority === "critical" ? "destructive" : t.priority === "high" ? "default" : "secondary"} className="capitalize text-xs">{t.priority}</Badge>
                    <div className="w-20"><Progress value={t.progress} className="h-1.5" /></div>
                    <span className="text-xs text-muted-foreground w-8">{t.progress}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="economics" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-sm">Daily Spend by Agent</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {agents.filter(a => a.costToday > 0).map(a => (
                  <div key={a.id} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{a.name}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={a.costToday / 5 * 100} className="w-24 h-1.5" />
                      <span className="text-sm font-medium text-foreground">${a.costToday.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-sm">Budget Status</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Daily Budget</span><span className="text-foreground">$4.78 / $25.00</span></div>
                  <Progress value={19} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Monthly Budget</span><span className="text-foreground">$89.45 / $500.00</span></div>
                  <Progress value={18} className="h-2" />
                </div>
                <p className="text-xs text-emerald-500 flex items-center gap-1"><Zap className="h-3 w-3" /> 82% under budget this month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </PageShell>
  );
}
