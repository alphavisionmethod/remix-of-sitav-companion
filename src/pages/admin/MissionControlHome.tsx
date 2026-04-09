import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  Activity, Shield, Server, Zap, AlertTriangle, CheckCircle, Clock, Eye,
  ArrowUpRight, ArrowDownRight, Bell, Database, Cpu, Globe, Lock, RefreshCw,
  Layers, GitBranch, Radio, Target, TrendingUp, BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_ADMIN_SERVICES_MISSION_CONTROL_HOME as DEMO_SERVICES, DEMO_URGENT_ACTIONS } from "@/lib/demo-data/admin-platform";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type HealthStatus = "healthy" | "warning" | "degraded" | "critical";

const statusColor: Record<HealthStatus, string> = {
  healthy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  degraded: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
};

const MissionControlHome = () => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: incidentCount } = useQuery({
    queryKey: ["mission-incidents-count"],
    queryFn: async () => {
      const { count } = await fromTable("incidents").select("*", { count: "exact", head: true }).in("status", ["open", "investigating"]);
      return count || 0;
    },
  });

  const { data: approvalCount } = useQuery({
    queryKey: ["mission-approvals-count"],
    queryFn: async () => {
      const { count } = await fromTable("approval_queue").select("*", { count: "exact", head: true }).eq("status", "pending");
      return count || 0;
    },
  });

  const healthyCount = DEMO_SERVICES.filter(s => s.status === "healthy").length;
  const overallHealth: HealthStatus = DEMO_SERVICES.some(s => s.status === "critical") ? "critical" : DEMO_SERVICES.some(s => s.status === "degraded") ? "degraded" : DEMO_SERVICES.some(s => s.status === "warning") ? "warning" : "healthy";

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Mission Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform truth at a glance · Last refreshed {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={statusColor[overallHealth]}>
            <Radio className="h-3 w-3 mr-1" /> Platform {overallHealth}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setLastRefresh(new Date())}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Top Metrics */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Services Healthy", value: `${healthyCount}/${DEMO_SERVICES.length}`, icon: Server, color: "text-emerald-500" },
            { label: "Active Incidents", value: String(incidentCount ?? 0), icon: AlertTriangle, color: "text-amber-500" },
            { label: "Pending Approvals", value: String(approvalCount ?? 0), icon: Shield, color: "text-blue-500" },
            { label: "SLO Budget Burn", value: "2.1%", icon: Target, color: "text-emerald-500" },
            { label: "Proof Coverage", value: "87%", icon: CheckCircle, color: "text-primary" },
            { label: "Projection Lag", value: "<1s", icon: Clock, color: "text-emerald-500" },
          ].map((m) => (
            <Card key={m.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{m.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Service Health */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Service Health Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DEMO_SERVICES.map((svc) => (
                    <div key={svc.name} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-foreground">{svc.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${statusColor[svc.status]}`}>{svc.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{svc.latency}ms</span>
                        <span>{svc.uptime}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Urgent Actions */}
          <motion.div variants={fadeUp}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" /> Urgent Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {DEMO_URGENT_ACTIONS.map((a) => (
                  <Link key={a.id} to={a.route} className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${a.severity === "high" ? "text-red-500" : a.severity === "medium" ? "text-amber-500" : "text-blue-500"}`} />
                      <p className="text-xs text-foreground leading-relaxed group-hover:text-primary transition-colors">{a.title}</p>
                    </div>
                  </Link>
                ))}
                {DEMO_URGENT_ACTIONS.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground text-xs">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500/50" />
                    All clear — no urgent actions
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Nav Grid */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Command Surfaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {[
                  { label: "Incidents", icon: AlertTriangle, route: "/admin/incidents", count: incidentCount },
                  { label: "Deployment", icon: GitBranch, route: "/admin/deployment" },
                  { label: "Proof Matrix", icon: Layers, route: "/admin/proof-matrix" },
                  { label: "Connectors", icon: Globe, route: "/admin/connectors" },
                  { label: "Fleet Health", icon: Cpu, route: "/admin/fleet-health" },
                  { label: "Launch Readiness", icon: Target, route: "/admin/launch-readiness" },
                  { label: "Durability", icon: Database, route: "/admin/durability" },
                  { label: "Projections", icon: BarChart3, route: "/admin/projections" },
                  { label: "Security", icon: Lock, route: "/admin/security-posture" },
                  { label: "Operations", icon: Zap, route: "/admin/operations" },
                  { label: "Truth Registry", icon: Eye, route: "/admin/truth-registry" },
                  { label: "Concierge", icon: Activity, route: "/admin/concierge-runtime" },
                ].map((nav) => (
                  <Link key={nav.label} to={nav.route} className="p-3 rounded-lg border hover:bg-muted/50 hover:-translate-y-0.5 transition-all flex items-center gap-2.5 group">
                    <nav.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs font-medium text-foreground">{nav.label}</span>
                    {nav.count != null && nav.count > 0 && (
                      <Badge variant="secondary" className="ml-auto text-[9px] px-1.5 py-0">{nav.count}</Badge>
                    )}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MissionControlHome;
