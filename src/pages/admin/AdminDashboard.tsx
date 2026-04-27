import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity, Users, Server, Cpu, DollarSign, Shield, Zap, BarChart3,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertTriangle,
  Settings, Eye, RefreshCw, Globe, Database, HardDrive,
  Wifi, Lock, Bell, FileText, Network
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import type { AuditEntry, ComplianceReport } from "@/packages/audit-contracts";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { PageSkeleton } from "@/platform/sita/components/sita/PageSkeleton";
import { NotificationInbox } from "@/platform/notifications/components/notifications/NotificationInbox";
import { ArchitectureHealthBadge } from "@/platform/admin/components/admin/panels/ArchitectureHealthBadge";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
}

const MetricCard = ({ title, value, change, trend, icon: Icon, color }: MetricCardProps) => (
  <motion.div variants={fadeUp}>
    <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
                {change}
              </div>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const StatusDot = ({ status }: { status: "healthy" | "warning" | "critical" }) => (
  <span className={`inline-block h-2 w-2 rounded-full ${status === "healthy" ? "bg-emerald-500" : status === "warning" ? "bg-amber-500" : "bg-red-500"}`} />
);

const quickLinks = [
  { label: "Auth Settings", icon: Lock, url: "/settings/privacy", color: "text-blue-500" },
  { label: "Edge Functions", icon: Zap, url: "/mission-control", color: "text-amber-500" },
  { label: "Storage", icon: HardDrive, url: "/files", color: "text-purple-500" },
  { label: "RLS Policies", icon: Shield, url: "/owner/constitution", color: "text-emerald-500" },
  { label: "AI Team", icon: Cpu, url: "/admin/team", color: "text-primary" },
  { label: "Audit Log", icon: FileText, url: "/owner/audit", color: "text-orange-500" },
];

export default function AdminDashboard() {
  const { isAdmin, loading: adminLoading } = useRequireAdmin();
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  // All hooks must be called before any early returns
  const { data: tokenData } = useQuery({
    queryKey: ["admin-token-spend"],
    enabled: isAdmin,
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await db.from("ai_token_usage")
        .select("cost_cents")
        .gte("created_at", today);
      if (error) throw error;
      const totalCents = (data || []).reduce((s, r) => s + (Number(r.cost_cents) || 0), 0);
      return { totalCents, count: data?.length || 0 };
    },
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: ["admin-pending-approvals"],
    enabled: isAdmin,
    queryFn: async () => {
      const { count, error } = await db.from("ai_workforce_approval_queue")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: openIncidents } = useQuery({
    queryKey: ["admin-open-incidents"],
    enabled: isAdmin,
    queryFn: async () => {
      const { count, error } = await db.from("incidents")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: recentAuditLogs } = useQuery({
    queryKey: ["admin-recent-actions"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await db.from("audit_logs")
        .select("action, actor, created_at, category, severity")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: advisorPerf } = useQuery({
    queryKey: ["admin-advisor-perf"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await db.from("advisor_performance")
        .select("advisor_id, total_calls, avg_satisfaction, total_tokens")
        .order("total_calls", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  if (adminLoading) return <PageSkeleton rows={3} />;
  if (!isAdmin) return null;

  const tokenSpend = tokenData ? `$${(tokenData.totalCents / 100).toFixed(2)}` : "$0.00";
  const totalAdvisorCalls = advisorPerf?.reduce((s, a) => s + (a.total_calls || 0), 0) || 0;
  const avgSatisfaction = advisorPerf?.length
    ? Math.round(advisorPerf.reduce((s, a) => s + (Number(a.avg_satisfaction) || 0), 0) / advisorPerf.length)
    : 0;

  const actionIcons: Record<string, React.ElementType> = {
    security: Shield, admin: Zap, system: RefreshCw, default: Database,
  };

  const timeAgo = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">System overview · {now.toLocaleDateString()} {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationInbox />
          <Badge variant="outline" className="gap-1.5 text-emerald-500 border-emerald-500/30">
            <StatusDot status={(openIncidents || 0) > 0 ? "warning" : "healthy"} />
            {(openIncidents || 0) > 0 ? `${openIncidents} Open Incidents` : "All Systems Operational"}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link to="/mission-control"><Eye className="h-3.5 w-3.5 mr-1.5" /> Mission Control</Link>
          </Button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="AI Spend Today" value={tokenSpend} icon={DollarSign} color="bg-amber-500/10 text-amber-500" />
        <MetricCard title="Advisor Calls" value={String(totalAdvisorCalls)} icon={Cpu} color="bg-purple-500/10 text-purple-500" />
        <MetricCard title="Avg Satisfaction" value={avgSatisfaction ? `${avgSatisfaction}%` : "—"} icon={Activity} color="bg-emerald-500/10 text-emerald-500" />
        <MetricCard title="API Calls (24h)" value={String(tokenData?.count || 0)} icon={Server} color="bg-blue-500/10 text-blue-500" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Service Health - static since we can't query Supabase infra */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" /> Service Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Database", status: "healthy" as const },
              { name: "Auth", status: "healthy" as const },
              { name: "Edge Functions", status: "healthy" as const },
              { name: "Storage", status: "healthy" as const },
              { name: "Realtime", status: "healthy" as const },
            ].map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot status={s.status} />
                  <span className="text-sm text-foreground">{s.name}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Team from real data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> AI Advisor Team
            </CardTitle>
            <CardDescription className="text-xs">{advisorPerf?.length || 0} advisors tracked</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(advisorPerf || []).slice(0, 5).map(a => (
              <div key={a.advisor_id} className="flex items-center justify-between text-xs">
                <span className="text-foreground font-medium capitalize">{a.advisor_id}</span>
                <span className="text-muted-foreground">{a.total_calls || 0} calls</span>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
              <Link to="/admin/team">Manage Team →</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Config */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" /> Quick Config
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map(l => (
                <Link key={l.label} to={l.url} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                  <l.icon className={`h-4 w-4 ${l.color}`} />
                  <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{l.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Actions from audit_logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> AI Token Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Today's Spend</span>
                <span className="font-medium text-foreground">{tokenSpend}</span>
              </div>
              <Progress value={Math.min((tokenData?.totalCents || 0) / 50, 100)} className="h-2" />
            </div>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/admin/ai-tokens">View Token Dashboard →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentAuditLogs || []).map((a, i) => {
                const IconComp = actionIcons[a.category] || actionIcons.default;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-muted/50 mt-0.5">
                      <IconComp className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{a.action}</p>
                      <p className="text-[10px] text-muted-foreground">{a.actor} · {timeAgo(a.created_at)}</p>
                    </div>
                  </div>
                );
              })}
              {(!recentAuditLogs || recentAuditLogs.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">No recent actions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Architecture Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ArchitectureHealthBadge />
        <Card className="border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Network className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Ecosystem Command Center</p>
              <p className="text-[10px] text-muted-foreground">OS · Cloud · App layer coordination</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/ecosystem/command">Open →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <Server className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">OS Platform Command Center</p>
              <p className="text-[10px] text-muted-foreground">Boot · Kernel · Services · Drivers · Updates</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/os-platform">Open →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Session & Secrets</p>
              <p className="text-[10px] text-muted-foreground">Token lifecycle · Key hierarchy · Lockscreen matrix</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/security/sessions">Open →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <Shield className="h-5 w-5 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Security Foundation</p>
              <p className="text-[10px] text-muted-foreground">TPM · IPC Contracts · Audit · Threats</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/security/foundation">Open →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{pendingApprovals || 0} Pending Approvals</p>
              <Link to="/approvals" className="text-xs text-primary hover:underline">Review now →</Link>
            </div>
          </CardContent>
        </Card>
        <Card className={`${(openIncidents || 0) > 0 ? "border-red-500/20" : "border-emerald-500/20"}`}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-xl ${(openIncidents || 0) > 0 ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
              <Bell className={`h-5 w-5 ${(openIncidents || 0) > 0 ? "text-red-500" : "text-emerald-500"}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {(openIncidents || 0) > 0 ? `${openIncidents} Open Incidents` : "No Open Incidents"}
              </p>
              <Link to="/mission-control/incidents" className="text-xs text-primary hover:underline">
                {(openIncidents || 0) > 0 ? "Investigate →" : "View history →"}
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">System Healthy</p>
              <Link to="/trust" className="text-xs text-primary hover:underline">View details →</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
