// ═══════════════════════════════════════════════════════════════
// SITA OS — Founder Dashboard / Control Deck (FCC05)
// Premium executive overview: health, risks, releases, approvals
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Crown, Shield, Rocket, AlertTriangle, CheckCircle2, Clock, Brain,
  TrendingUp, TrendingDown, Zap, Activity, DollarSign, HardDrive,
  Users, GitBranch, Terminal, BookOpen, ChevronRight, ArrowUpRight,
  Gauge, Eye, Target, BarChart3
} from "lucide-react";
import { founderOrchestrator } from "@/lib/services/founder-orchestrator";

interface MetricCard {
  label: string;
  value: string;
  trend: number;
  icon: React.ElementType;
  color: string;
}

const PLATFORM_METRICS: MetricCard[] = [
  { label: "Platform Health", value: "98.7%", trend: 0.3, icon: Activity, color: "text-trust-safe" },
  { label: "Active Users", value: "12,847", trend: 4.2, icon: Users, color: "text-primary" },
  { label: "Sync Success", value: "99.4%", trend: -0.1, icon: Zap, color: "text-sita-gold" },
  { label: "AI Cost Today", value: "$4.28", trend: -12.5, icon: DollarSign, color: "text-trust-safe" },
  { label: "Error Rate", value: "0.03%", trend: -15.2, icon: AlertTriangle, color: "text-trust-safe" },
  { label: "Storage Used", value: "2.4 GB", trend: 5.2, icon: HardDrive, color: "text-muted-foreground" },
];

const STRATEGIC_RISKS = [
  { title: "Sync retry storm on unstable networks", severity: "high", domain: "reliability", age: "3d" },
  { title: "Trust classifier false positive rate trending up", severity: "medium", domain: "trust", age: "1d" },
  { title: "AI token budget approaching 80% threshold", severity: "medium", domain: "cost", age: "6h" },
];

const PENDING_APPROVALS = [
  { title: "Deploy sync retry backoff to production", type: "deployment", risk: "medium", age: "2h" },
  { title: "Increase storage quota for enterprise tier", type: "policy", risk: "low", age: "5h" },
  { title: "Enable new trust scoring model", type: "model_change", risk: "high", age: "1d" },
];

const ACTIVE_OBJECTIVES = [
  { title: "Make cloud sync reliable across all devices", progress: 62, status: "executing", tasks: 8, completed: 5 },
  { title: "Reduce crash rate in beta by 25%", progress: 35, status: "planning", tasks: 6, completed: 2 },
  { title: "Platform security audit Q2", progress: 88, status: "executing", tasks: 6, completed: 5 },
];

const QUICK_ACTIONS = [
  { label: "Command Console", path: "/admin/founder/command", icon: Terminal },
  { label: "Task Graph", path: "/admin/founder/tasks", icon: GitBranch },
  { label: "CI/CD Pipelines", path: "/admin/founder/cicd", icon: Rocket },
  { label: "Runbooks", path: "/admin/founder/runbooks", icon: BookOpen },
  { label: "Incidents", path: "/admin/incidents", icon: AlertTriangle },
  { label: "Release Rings", path: "/admin/release-ring", icon: Rocket },
  { label: "Security Posture", path: "/admin/security-posture", icon: Shield },
  { label: "AI Team", path: "/admin/ai-team/overview", icon: Brain },
];

export default function FCC05FounderDashboard() {
  const navigate = useNavigate();
  ;

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={Crown}
        title="Founder Control Deck"
        subtitle="Executive overview — platform health, strategic risks, and command authority"
        accent="primary"
      >
        <Button size="sm" className="gap-1.5" onClick={() => navigate("/admin/founder/command")}>
          <Terminal className="h-3.5 w-3.5" /> Open Command Console
        </Button>
      </AdminPageHeader>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {PLATFORM_METRICS.map((m, i) => {
          const Icon = m.icon;
          const isPositive = m.label === "Error Rate" || m.label === "AI Cost Today" ? m.trend < 0 : m.trend > 0;
          return (
            <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-4 w-4 ${m.color}`} />
                    <div className={`flex items-center gap-0.5 text-[10px] ${isPositive ? "text-trust-safe" : "text-destructive"}`}>
                      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(m.trend)}%
                    </div>
                  </div>
                  <p className="text-lg font-bold font-display">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Objectives */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-white/10 bg-white/[0.02] h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Active Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ACTIVE_OBJECTIVES.map((obj, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-2">
                  <p className="text-xs font-medium line-clamp-1">{obj.title}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={obj.progress} className="h-1.5 flex-1" />
                    <span className="text-[10px] text-muted-foreground">{obj.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{obj.status}</Badge>
                    <span className="text-[10px] text-muted-foreground">{obj.completed}/{obj.tasks} tasks</span>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs gap-1" onClick={() => navigate("/admin/founder/tasks")}>
                View All <ChevronRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Strategic Risks */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-white/10 bg-white/[0.02] h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-sita-gold" /> Strategic Risks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {STRATEGIC_RISKS.map((risk, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${risk.severity === "high" ? "text-destructive" : "text-sita-gold"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-2">{risk.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={risk.severity === "high" ? "destructive" : "outline"} className="text-[9px]">{risk.severity}</Badge>
                      <span className="text-[10px] text-muted-foreground">{risk.domain}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{risk.age}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-white/10 bg-white/[0.02] h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Awaiting Your Decision
                <Badge className="ml-auto text-[10px]">{PENDING_APPROVALS.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PENDING_APPROVALS.map((a, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-medium line-clamp-1">{a.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[9px]">{a.type}</Badge>
                    <Badge variant={a.risk === "high" ? "destructive" : "outline"} className="text-[9px]">risk: {a.risk}</Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">{a.age}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="h-6 text-[10px] flex-1 gap-1">
                      <CheckCircle2 className="h-3 w-3 text-trust-safe" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1">
                      <Eye className="h-3 w-3" /> Review
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Status + What's Happening */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border-white/10 bg-white/[0.02]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> AI Workforce Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Active Agents", value: "12", sub: "of 40 registered", color: "text-trust-safe" },
                  { label: "Tasks Running", value: "7", sub: "across 4 councils", color: "text-primary" },
                  { label: "Pending Approvals", value: "3", sub: "awaiting review", color: "text-sita-gold" },
                  { label: "Self-Heals Today", value: "2", sub: "all successful", color: "text-trust-safe" },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <p className={`text-xl font-bold font-display ${s.color}`}>{s.value}</p>
                    <p className="text-xs font-medium">{s.label}</p>
                    <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-white/10 bg-white/[0.02]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gauge className="h-4 w-4 text-sita-gold" /> Release Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { env: "Production", version: "v2.14.3", status: "stable", health: 99.8 },
                  { env: "Canary (5%)", version: "v2.15.0-rc1", status: "monitoring", health: 99.2 },
                  { env: "Staging", version: "v2.15.0-rc2", status: "testing", health: 97.5 },
                  { env: "Development", version: "v2.16.0-dev", status: "building", health: 94.1 },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className={`h-2 w-2 rounded-full ${r.health > 99 ? "bg-trust-safe" : r.health > 97 ? "bg-sita-gold" : "bg-orange-400"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{r.env}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{r.version}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px]">{r.status}</Badge>
                    <span className="text-[10px] text-muted-foreground">{r.health}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card className="border-white/10 bg-white/[0.02]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
              {QUICK_ACTIONS.map(a => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.path}
                    onClick={() => navigate(a.path)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-primary/20 transition-all"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-[10px] text-center text-muted-foreground">{a.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
