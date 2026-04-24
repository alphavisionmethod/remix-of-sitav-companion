import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, CheckCircle, AlertTriangle, Clock, Users, Plane, Home, RefreshCw, FileCheck, Target, XCircle, CalendarCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type TaskState = "active" | "completed" | "broken" | "stale";
const stateColor: Record<TaskState, string> = {
  active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  broken: "bg-red-500/10 text-red-500 border-red-500/20",
  stale: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const domainIcon: Record<string, typeof Activity> = { task: Activity, travel: Plane, household: Home, promise: CalendarCheck };

const TRAVEL = [
  { id: "tr-1", trip: "Berlin → London", status: "active" as const, legs: 3, completed: 1, nextAction: "Check-in opens at 14:00", lastUpdated: "2026-04-05T10:00:00Z" },
  { id: "tr-2", trip: "Tokyo Business Trip", status: "completed" as const, legs: 5, completed: 5, nextAction: "Expense report pending", lastUpdated: "2026-04-02T18:00:00Z" },
];

const HOUSEHOLD = [
  { id: "hh-1", commitment: "Weekly grocery delivery", status: "active" as const, frequency: "Weekly", nextDue: "2026-04-07", assignee: "household-agent", lastFulfilled: "2026-03-31" },
  { id: "hh-2", commitment: "Monthly budget review", status: "active" as const, frequency: "Monthly", nextDue: "2026-04-30", assignee: "finance-advisor", lastFulfilled: "2026-03-28" },
  { id: "hh-3", commitment: "Insurance renewal", status: "stale" as const, frequency: "Annual", nextDue: "2026-04-15", assignee: "concierge-agent", lastFulfilled: "2025-04-15" },
];

const PROMISES = [
  { id: "pm-1", promise: "Send updated portfolio summary by Friday", status: "active" as const, dueDate: "2026-04-11", owner: "finance-advisor", confidence: 92 },
  { id: "pm-2", promise: "Book restaurant for anniversary", status: "completed" as const, dueDate: "2026-04-08", owner: "concierge-agent", confidence: 100 },
  { id: "pm-3", promise: "Follow up on home inspection report", status: "broken" as const, dueDate: "2026-04-03", owner: "household-agent", confidence: 0 },
];

const RECEIPTS = [
  { id: "rc-1", action: "Booked restaurant reservation", agent: "concierge-agent", timestamp: "2026-04-05T09:30:00Z", outcome: "success" as const },
  { id: "rc-2", action: "Submitted expense report", agent: "finance-advisor", timestamp: "2026-04-04T16:00:00Z", outcome: "success" as const },
  { id: "rc-3", action: "Attempted flight rebooking", agent: "travel-agent", timestamp: "2026-04-03T11:00:00Z", outcome: "failed" as const },
  { id: "rc-4", action: "Grocery order placed", agent: "household-agent", timestamp: "2026-04-01T08:00:00Z", outcome: "success" as const },
];

const SLA = [
  { metric: "Promise fulfillment rate", target: 95, current: 67, unit: "%", status: "below" as const },
  { metric: "Task completion within SLA", target: 90, current: 88, unit: "%", status: "at-risk" as const },
  { metric: "Travel continuity", target: 99, current: 100, unit: "%", status: "healthy" as const },
  { metric: "Household commitment adherence", target: 95, current: 67, unit: "%", status: "below" as const },
];

const ConciergeRuntimeBoard = () => {
  
  const [tab, setTab] = useState("tasks");
  const { data: householdTasks } = useQuery({
    queryKey: ["concierge-household-tasks"],
    queryFn: async () => { const { data } = await fromTable("household_tasks").select("*").limit(5); return data || []; },
  });

  const activeCount = ([] as any[]).filter(t => t.state === "active").length;
  const brokenCount = ([] as any[]).filter(t => t.continuityBroken).length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> Concierge Runtime Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Tasks · Travel · Household · Promises · Receipts · SLA tracking</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Active Tasks", value: String(activeCount), color: "text-blue-500" },
            { label: "Broken Continuity", value: String(brokenCount), color: brokenCount > 0 ? "text-red-500" : "text-emerald-500" },
            { label: "Promises Tracked", value: String(([] as any[]).length), color: "text-primary" },
            { label: "Active Travel", value: String(([] as any[]).filter(t => t.status === "active").length), color: "text-blue-500" },
            { label: "Promise Fulfillment", value: `${Math.round((([] as any[]).filter(p => p.status === "completed").length / ([] as any[]).length) * 100)}%`, color: "text-amber-500" },
          ].map(m => (
            <Card key={m.label}><CardContent className="p-3.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            </CardContent></Card>
          ))}
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="tasks">Task Registry</TabsTrigger>
            <TabsTrigger value="travel">Travel State</TabsTrigger>
            <TabsTrigger value="household">Household</TabsTrigger>
            <TabsTrigger value="promises">Promises</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="sla">SLA Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-4 space-y-2">
            {([] as any[]).map(t => {
              const DomainIcon = domainIcon[t.domain] || Activity;
              return (
                <div key={t.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DomainIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{t.title}</span>
                      <Badge variant="outline" className={`text-[9px] ${stateColor[t.state]}`}>{t.state}</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(t.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Domain: <span className="text-foreground capitalize">{t.domain}</span></span>
                    <span>Agent: <span className="text-foreground">{t.assignee}</span></span>
                    {t.continuityBroken && <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-500 border-red-500/20"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Continuity broken</Badge>}
                    {t.receiptRef && <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20">{t.receiptRef}</Badge>}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="travel" className="mt-4 space-y-2">
            {([] as any[]).map(t => (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{t.trip}</span>
                      <Badge variant="outline" className={`text-[9px] ${t.status === "active" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>{t.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Legs: <span className="text-foreground">{t.completed}/{t.legs}</span></span>
                    <span>Next: <span className="text-foreground">{t.nextAction}</span></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="household" className="mt-4 space-y-2">
            {([] as any[]).map(h => (
              <Card key={h.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{h.commitment}</span>
                      <Badge variant="outline" className={`text-[9px] ${stateColor[h.status]}`}>{h.status}</Badge>
                    </div>
                    <Badge variant="secondary" className="text-[9px]">{h.frequency}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Next due: <span className="text-foreground">{h.nextDue}</span></span>
                    <span>Agent: <span className="text-foreground">{h.assignee}</span></span>
                    <span>Last: <span className="text-foreground">{h.lastFulfilled}</span></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="promises" className="mt-4 space-y-2">
            {([] as any[]).map(p => (
              <Card key={p.id} className={p.status === "broken" ? "border-red-500/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {p.status === "completed" ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : p.status === "broken" ? <XCircle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-blue-500" />}
                      <span className="text-sm font-medium text-foreground">{p.promise}</span>
                      <Badge variant="outline" className={`text-[9px] ${stateColor[p.status]}`}>{p.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Due: <span className="text-foreground">{p.dueDate}</span></span>
                    <span>Owner: <span className="text-foreground">{p.owner}</span></span>
                    <span>Confidence: <span className={p.confidence > 80 ? "text-emerald-500" : p.confidence > 50 ? "text-amber-500" : "text-red-500"}>{p.confidence}%</span></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="receipts" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Concierge Receipt Feed</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {([] as any[]).map(r => (
                  <div key={r.id} className="flex items-start gap-3 p-2.5 rounded border hover:bg-muted/20">
                    {r.outcome === "success" ? <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 mt-0.5 text-red-500" />}
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{r.action}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{r.agent}</span>
                        <span>{new Date(r.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sla" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Concierge SLA Tracking</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {([] as any[]).map(s => (
                  <div key={s.metric} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{s.metric}</span>
                      <Badge variant="outline" className={`text-[9px] ${s.status === "healthy" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : s.status === "at-risk" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>{s.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-2">
                      <span>Target: {s.target}{s.unit}</span>
                      <span>Current: <span className={s.current >= s.target ? "text-emerald-500" : "text-red-500"}>{s.current}{s.unit}</span></span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ConciergeRuntimeBoard;
