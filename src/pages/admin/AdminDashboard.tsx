import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity, Users, Server, Cpu, DollarSign, Shield, Zap, BarChart3,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertTriangle,
  Settings, Eye, RefreshCw, TrendingUp, Globe, Database, HardDrive,
  Wifi, Lock, Bell, FileText, GitBranch, Layers
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
  sparkline?: number[];
}

const MetricCard = ({ title, value, change, trend, icon: Icon, color, sparkline }: MetricCardProps) => (
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
        {sparkline && (
          <div className="mt-3 flex items-end gap-0.5 h-8">
            {sparkline.map((v, i) => (
              <div key={i} className="flex-1 rounded-sm bg-primary/20" style={{ height: `${(v / Math.max(...sparkline)) * 100}%` }}>
                <div className="w-full rounded-sm bg-primary/60" style={{ height: `${(v / Math.max(...sparkline)) * 100}%` }} />
              </div>
            ))}
          </div>
        )}
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
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  const uptime = "99.97%";
  const activeUsers = 24;
  const apiCalls24h = "12.4K";
  const storageUsed = "2.1 GB";
  const tokenSpend = "$4.32";
  const edgeFnCount = 8;
  const pendingApprovals = 3;
  const openIncidents = 1;

  const recentActions = [
    { actor: "System", action: "Deployed edge function: chat-advisor", time: "2m ago", icon: Zap },
    { actor: "Admin", action: "Updated RLS policy on advisor_knowledge", time: "15m ago", icon: Shield },
    { actor: "AI Agent", action: "Auto-healed connector: stripe-sync", time: "1h ago", icon: RefreshCw },
    { actor: "System", action: "Backup completed successfully", time: "3h ago", icon: Database },
    { actor: "Admin", action: "Added new advisor: Tax Strategist", time: "5h ago", icon: Cpu },
  ];

  const services = [
    { name: "Database", status: "healthy" as const, latency: "12ms" },
    { name: "Auth", status: "healthy" as const, latency: "45ms" },
    { name: "Edge Functions", status: "healthy" as const, latency: "89ms" },
    { name: "Storage", status: "healthy" as const, latency: "23ms" },
    { name: "Realtime", status: "warning" as const, latency: "156ms" },
  ];

  const agentStats = [
    { name: "Healthy", count: 34, color: "bg-emerald-500" },
    { name: "Active", count: 8, color: "bg-blue-500" },
    { name: "Paused", count: 2, color: "bg-amber-500" },
    { name: "Degraded", count: 1, color: "bg-red-500" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">System overview · {now.toLocaleDateString()} {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-emerald-500 border-emerald-500/30">
            <StatusDot status="healthy" /> All Systems Operational
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link to="/mission-control"><Eye className="h-3.5 w-3.5 mr-1.5" /> Mission Control</Link>
          </Button>
        </div>
      </div>

      {/* Top metrics */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Uptime" value={uptime} change="+0.02% vs last month" trend="up" icon={Activity} color="bg-emerald-500/10 text-emerald-500" sparkline={[98, 99, 100, 99, 100, 100, 99]} />
        <MetricCard title="Active Users" value={String(activeUsers)} change="+12% this week" trend="up" icon={Users} color="bg-blue-500/10 text-blue-500" sparkline={[15, 18, 22, 20, 24, 19, 24]} />
        <MetricCard title="API Calls (24h)" value={apiCalls24h} change="+8% vs yesterday" trend="up" icon={Server} color="bg-purple-500/10 text-purple-500" sparkline={[8, 11, 9, 13, 10, 12, 14]} />
        <MetricCard title="AI Spend Today" value={tokenSpend} change="-15% vs avg" trend="down" icon={DollarSign} color="bg-amber-500/10 text-amber-500" sparkline={[6, 5, 7, 4, 5, 4, 3]} />
      </motion.div>

      {/* Second row: Services + AI Team + Quick Config */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Service Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" /> Service Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot status={s.status} />
                  <span className="text-sm text-foreground">{s.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{s.latency}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Team Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> AI Engineer Team
            </CardTitle>
            <CardDescription className="text-xs">40 agents across 6 councils</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {agentStats.map(a => (
              <div key={a.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${a.color}`} />
                  <span className="text-sm text-foreground">{a.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{a.count}</span>
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

      {/* Third row: Usage + Actions timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Usage Meters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Usage & Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Storage</span>
                <span className="font-medium text-foreground">{storageUsed} / 10 GB</span>
              </div>
              <Progress value={21} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Edge Functions</span>
                <span className="font-medium text-foreground">{edgeFnCount} / 25</span>
              </div>
              <Progress value={32} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">API Calls</span>
                <span className="font-medium text-foreground">12.4K / 100K</span>
              </div>
              <Progress value={12} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">AI Token Budget</span>
                <span className="font-medium text-foreground">$4.32 / $50</span>
              </div>
              <Progress value={9} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Admin Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActions.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-muted/50 mt-0.5">
                    <a.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{a.action}</p>
                    <p className="text-[10px] text-muted-foreground">{a.actor} · {a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{pendingApprovals} Pending Approvals</p>
              <Link to="/approvals" className="text-xs text-primary hover:underline">Review now →</Link>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10">
              <Bell className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{openIncidents} Open Incident</p>
              <Link to="/mission-control/incidents" className="text-xs text-primary hover:underline">Investigate →</Link>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Security Score: 94/100</p>
              <Link to="/trust" className="text-xs text-primary hover:underline">View details →</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
