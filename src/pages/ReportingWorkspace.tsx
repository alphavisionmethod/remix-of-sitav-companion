import { useState } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { BarChart3, TrendingUp, DollarSign, Users, Briefcase, FileText, Download, Calendar, Filter, ChevronRight, PieChart, Activity, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const db: any = supabase;

const REVENUE_DATA = [
  { month: "Jan", revenue: 42000, expenses: 28000, profit: 14000 },
  { month: "Feb", revenue: 38000, expenses: 26000, profit: 12000 },
  { month: "Mar", revenue: 51000, expenses: 30000, profit: 21000 },
  { month: "Apr", revenue: 47000, expenses: 29000, profit: 18000 },
  { month: "May", revenue: 55000, expenses: 32000, profit: 23000 },
  { month: "Jun", revenue: 62000, expenses: 35000, profit: 27000 },
];

const PIPELINE_DATA = [
  { stage: "Lead", count: 24, value: 180000 },
  { stage: "Qualified", count: 12, value: 120000 },
  { stage: "Proposal", count: 8, value: 95000 },
  { stage: "Negotiation", count: 4, value: 60000 },
  { stage: "Closed", count: 6, value: 85000 },
];

const DOMAIN_BREAKDOWN = [
  { name: "Business", value: 45, color: "hsl(var(--primary))" },
  { name: "Finance", value: 25, color: "#10b981" },
  { name: "Household", value: 15, color: "#f59e0b" },
  { name: "Personal", value: 15, color: "#8b5cf6" },
];

const COMPLETION_TREND = [
  { week: "W1", tasks: 18, workflows: 5 },
  { week: "W2", tasks: 22, workflows: 7 },
  { week: "W3", tasks: 15, workflows: 4 },
  { week: "W4", tasks: 28, workflows: 9 },
  { week: "W5", tasks: 24, workflows: 6 },
  { week: "W6", tasks: 31, workflows: 8 },
];

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const ReportingWorkspace = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState("6m");
  const [tab, setTab] = useState("executive");

  return (
    <div className="min-h-screen pb-12">
      <SitaPageHeader title="Reporting & Analytics" subtitle="Insights across business, finance, operations, and trust" actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/50"><Download className="w-3.5 h-3.5" /> Export</Button>
          <div className="flex gap-1 bg-card/30 rounded-lg border border-border/20 p-0.5">
            {["1m", "3m", "6m", "1y"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={cn("px-2 py-1 text-xs rounded-md transition-colors", period === p ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/30")}>{p}</button>
            ))}
          </div>
        </div>
      } />

      <SitaTabs tabs={[
        { key: "executive", label: "Executive" },
        { key: "revenue", label: "Revenue" },
        { key: "pipeline", label: "Pipeline" },
        { key: "operations", label: "Operations" },
        { key: "trust", label: "Trust & Proof" },
      ]} active={tab} onChange={setTab} className="mb-6" />

      {tab === "executive" && (
        <motion.div variants={stagger} initial="hidden" animate="show">
          {/* KPI row */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <KPITile label="Total Revenue" value="$295K" icon={DollarSign} sub="+12% vs prior" />
            <KPITile label="Pipeline Value" value="$540K" icon={Target} sub="54 active deals" />
            <KPITile label="Clients" value="47" icon={Users} sub="3 new this month" />
            <KPITile label="Task Completion" value="87%" icon={Activity} sub="138 completed" />
          </motion.div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <motion.div variants={fadeUp}>
              <SitaCard className="p-4">
                <SitaCardTitle className="text-xs mb-3">Revenue & Profit Trend</SitaCardTitle>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={REVENUE_DATA}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#profitGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </SitaCard>
            </motion.div>

            <motion.div variants={fadeUp}>
              <SitaCard className="p-4">
                <SitaCardTitle className="text-xs mb-3">Domain Activity Breakdown</SitaCardTitle>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={160} height={160}>
                    <RechartsPie>
                      <Pie data={DOMAIN_BREAKDOWN} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                        {DOMAIN_BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {DOMAIN_BREAKDOWN.map(d => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-xs text-muted-foreground">{d.name}</span>
                        <span className="text-xs font-medium ml-auto">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SitaCard>
            </motion.div>
          </div>

          {/* Pipeline funnel */}
          <motion.div variants={fadeUp}>
            <SitaCard className="p-4 mb-4">
              <SitaCardTitle className="text-xs mb-3">Pipeline Funnel</SitaCardTitle>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={PIPELINE_DATA} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SitaCard>
          </motion.div>

          {/* Completion trend */}
          <motion.div variants={fadeUp}>
            <SitaCard className="p-4">
              <SitaCardTitle className="text-xs mb-3">Task & Workflow Completion Trend</SitaCardTitle>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={COMPLETION_TREND}>
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                  <Line type="monotone" dataKey="tasks" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="workflows" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </SitaCard>
          </motion.div>
        </motion.div>
      )}

      {tab !== "executive" && (
        <EmptyState icon={BarChart3} title={`${tab.charAt(0).toUpperCase() + tab.slice(1)} Reports`} description={`Detailed ${tab} analytics and reports will load here based on your data`} />
      )}
    </div>
  );
};

export default ReportingWorkspace;
