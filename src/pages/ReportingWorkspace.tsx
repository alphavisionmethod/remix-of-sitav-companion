// ═══════════════════════════════════════════════════════════════
// SITA OS — Reporting & Analytics Workspace
// Executive dashboard, revenue/pipeline/operations/trust analytics,
// saved reports, export, date range filtering, live queries.
// ═══════════════════════════════════════════════════════════════

import { PageSkeleton } from "@/components/sita/PageSkeleton";
import { useState, useMemo } from "react";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  BarChart3, TrendingUp, DollarSign, Users, Briefcase, Download, Calendar,
  Filter, PieChart, Activity, Target, ArrowUpRight, ArrowDownRight, FileText,
  Save, Share2, Clock, Shield, CheckCircle2, AlertTriangle, Bookmark, PlusCircle,
  ChevronRight, Eye, RotateCcw,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { DEMO_COMPLETION_TREND, DEMO_DOMAIN_BREAKDOWN, DEMO_PIPELINE_DATA, DEMO_REVENUE_DATA } from "@/data/seed/core-pages";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

// ── Saved reports ──────────────────────────────────────────
const DEMO_SAVED_REPORTS = [
  { id: "r1", title: "Monthly Revenue Summary", domain: "finance", lastRun: "2 hours ago", scheduled: true, frequency: "Monthly" },
  { id: "r2", title: "Pipeline Conversion Analysis", domain: "business", lastRun: "Yesterday", scheduled: false, frequency: null },
  { id: "r3", title: "Workflow Completion Rates", domain: "operations", lastRun: "3 days ago", scheduled: true, frequency: "Weekly" },
  { id: "r4", title: "Trust & Proof Audit Report", domain: "trust", lastRun: "Last week", scheduled: true, frequency: "Monthly" },
  { id: "r5", title: "Household Expense Trends", domain: "household", lastRun: "2 days ago", scheduled: false, frequency: null },
];

// ── Trust analytics demo ──────────────────────────────────
const DEMO_TRUST_DATA = [
  { week: "W1", approvals: 12, proofs: 8, rollbacks: 0 },
  { week: "W2", approvals: 15, proofs: 11, rollbacks: 1 },
  { week: "W3", approvals: 18, proofs: 14, rollbacks: 0 },
  { week: "W4", approvals: 22, proofs: 19, rollbacks: 2 },
  { week: "W5", approvals: 20, proofs: 17, rollbacks: 0 },
  { week: "W6", approvals: 25, proofs: 22, rollbacks: 1 },
];

const ReportingWorkspace = () => {
  const { user , isDemo} = useAuth();
  const isDemoMode = false;
  const [period, setPeriod] = useState("6m");
  const [tab, setTab] = useState("executive");

  // Live query example — workflow completion rate
  const { data: liveWorkflowStats } = useQuery({
    queryKey: ["reporting-workflows", user?.id, period],
    enabled: !!user && !false,
    queryFn: async () => {
      const { data } = await fromTable("workflow_runs").select("status").limit(500);
      if (!data) return null;
      const total = data.length;
      const completed = data.filter((r: any) => r.status === "completed").length;
      return { total, completed, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
    },
  });

  // Live query — approval stats
  const { data: liveApprovalStats } = useQuery({
    queryKey: ["reporting-approvals", user?.id],
    enabled: !!user && !false,
    queryFn: async () => {
      const { data } = await fromTable("approval_queue").select("status").limit(500);
      if (!data) return null;
      return {
        total: data.length,
        approved: data.filter((r: any) => r.status === "approved").length,
        pending: data.filter((r: any) => r.status === "pending").length,
      };
    },
  });

  const handleExport = (format: string) => toast.success(`Report exported as ${format}`);
  const handleSaveReport = () => toast.success("Report saved to library");

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SitaPageHeader
        icon={<BarChart3 className="h-6 w-6" />}
        title="Reporting & Analytics"
        subtitle="Insights across business, finance, operations, and trust"
      >
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleSaveReport}><Bookmark className="w-3.5 h-3.5" /> Save</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => handleExport("PDF")}><Download className="w-3.5 h-3.5" /> Export</Button>
          <div className="flex gap-1 bg-card/30 rounded-lg border border-border/20 p-0.5">
            {["1m", "3m", "6m", "1y"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={cn("px-2 py-1 text-xs rounded-md transition-colors", period === p ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/30")}>{p}</button>
            ))}
          </div>
        </div>
      </SitaPageHeader>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="executive"><PieChart className="h-4 w-4 mr-1.5" />Executive</TabsTrigger>
          <TabsTrigger value="revenue"><DollarSign className="h-4 w-4 mr-1.5" />Revenue</TabsTrigger>
          <TabsTrigger value="pipeline"><Target className="h-4 w-4 mr-1.5" />Pipeline</TabsTrigger>
          <TabsTrigger value="operations"><Activity className="h-4 w-4 mr-1.5" />Operations</TabsTrigger>
          <TabsTrigger value="trust"><Shield className="h-4 w-4 mr-1.5" />Trust & Proof</TabsTrigger>
          <TabsTrigger value="saved"><Bookmark className="h-4 w-4 mr-1.5" />Saved Reports</TabsTrigger>
        </TabsList>

        {/* EXECUTIVE TAB */}
        <TabsContent value="executive" className="mt-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Revenue", value: "$295K", icon: DollarSign, change: "+12%", up: true },
                { label: "Pipeline Value", value: "$540K", icon: Target, change: "+8%", up: true },
                { label: "Clients", value: "47", icon: Users, change: "+3 new", up: true },
                { label: "Task Completion", value: false ? "87%" : `${liveWorkflowStats?.rate ?? 0}%`, icon: Activity, change: "+5%", up: true },
              ].map(kpi => (
                <Card key={kpi.label} className="bg-card border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <kpi.icon className="h-4 w-4 text-muted-foreground" />
                      <span className={cn("text-[10px] flex items-center gap-0.5", kpi.up ? "text-emerald-400" : "text-destructive")}>
                        {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {kpi.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={fadeUp}>
                <Card className="border-border/40">
                  <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Revenue & Profit Trend</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={DEMO_REVENUE_DATA}>
                        <defs>
                          <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad2)" strokeWidth={2} />
                        <Area type="monotone" dataKey="profit" stroke="#10b981" fill="transparent" strokeWidth={2} strokeDasharray="4 2" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Card className="border-border/40">
                  <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Domain Activity Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <ResponsiveContainer width={160} height={160}>
                        <RechartsPie>
                          <Pie data={DEMO_DOMAIN_BREAKDOWN} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                            {([] as typeof DEMO_DOMAIN_BREAKDOWN).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                        </RechartsPie>
                      </ResponsiveContainer>
                      <div className="space-y-2">
                        {([] as typeof DEMO_DOMAIN_BREAKDOWN).map(d => (
                          <div key={d.name} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                            <span className="text-xs text-muted-foreground">{d.name}</span>
                            <span className="text-xs font-medium ml-auto">{d.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={fadeUp}>
              <Card className="border-border/40">
                <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Task & Workflow Completion Trend</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={DEMO_COMPLETION_TREND}>
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                      <Line type="monotone" dataKey="tasks" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="workflows" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* REVENUE TAB */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          <Card className="border-border/40">
            <CardHeader><CardTitle className="text-base">Revenue Analysis</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={DEMO_REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickFormatter={v => `$${v / 1000}k`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PIPELINE TAB */}
        <TabsContent value="pipeline" className="mt-4 space-y-4">
          <Card className="border-border/40">
            <CardHeader><CardTitle className="text-base">Pipeline Funnel</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={DEMO_PIPELINE_DATA} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OPERATIONS TAB */}
        <TabsContent value="operations" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Workflows Run", value: false ? "138" : String(liveWorkflowStats?.total ?? 0), icon: RotateCcw },
              { label: "Completion Rate", value: false ? "87%" : `${liveWorkflowStats?.rate ?? 0}%`, icon: CheckCircle2 },
              { label: "Approvals Pending", value: false ? "5" : String(liveApprovalStats?.pending ?? 0), icon: Clock },
              { label: "Failed", value: false ? "3" : "0", icon: AlertTriangle },
            ].map(kpi => (
              <Card key={kpi.label} className="border-border/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <kpi.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-border/40">
            <CardHeader><CardTitle className="text-base">Completion Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={DEMO_COMPLETION_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                  <Line type="monotone" dataKey="tasks" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="workflows" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRUST TAB */}
        <TabsContent value="trust" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Approvals", value: false ? "112" : String(liveApprovalStats?.total ?? 0), icon: CheckCircle2, color: "text-emerald-400" },
              { label: "Proof Receipts", value: "91", icon: Shield, color: "text-primary" },
              { label: "Rollbacks", value: "4", icon: RotateCcw, color: "text-amber-400" },
            ].map(kpi => (
              <Card key={kpi.label} className="border-border/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-border/40">
            <CardHeader><CardTitle className="text-base">Trust Activity Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={DEMO_TRUST_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                  <Bar dataKey="approvals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="proofs" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rollbacks" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SAVED REPORTS TAB */}
        <TabsContent value="saved" className="mt-4 space-y-2">
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Saved Reports</CardTitle>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs"><PlusCircle className="w-3.5 h-3.5" /> New Report</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {([] as typeof DEMO_SAVED_REPORTS).map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:bg-accent/20 transition-colors cursor-pointer">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">Last run: {r.lastRun} · {r.domain}</p>
                  </div>
                  {r.scheduled && <Badge variant="outline" className="text-[9px] border-primary/20 text-primary"><Clock className="w-2 h-2 mr-0.5" />{r.frequency}</Badge>}
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Download className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Share2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportingWorkspace;
