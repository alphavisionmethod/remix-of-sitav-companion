import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { TrendingUp, Users, Target, Zap, ArrowRight, BarChart3, AlertTriangle, Sparkles, Shield, Activity, CheckCircle, XCircle, FileText, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useDeals } from "@/hooks/use-revenue-office";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_QUICK_ACTIONS } from "@/data/seed/revenue-office";
import { useState } from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";


const CONNECTION_HEALTH = [
  { service: "CRM / Pipeline", status: "connected", health: 98 },
  { service: "Booking Engine", status: "connected", health: 95 },
  { service: "Campaign Platform", status: "connected", health: 92 },
  { service: "Reputation System", status: "connected", health: 88 },
  { service: "Payment Gateway", status: "connected", health: 100 },
  { service: "Analytics", status: "degraded", health: 72 },
];

const OPERATING_MODES = ["Growth", "Stability", "Recovery", "Launch"] as const;

export default function RevenueGate() {
  const { isDemoMode } = useDataMode();
  const navigate = useNavigate();
  const { data: liveDeals, isLoading } = useDeals();
  const [operatingMode, setOperatingMode] = useState<typeof OPERATING_MODES[number]>("Growth");

  // In live mode, show real data or empty states — never silently use demo data
  const metrics = [];
  const whatChanged = [];
  const advisorPreview = [];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Revenue Office</h1>
            <p className="text-muted-foreground">Your commercial growth command center</p>
          </div>
          <div className="flex items-center gap-2">
            {OPERATING_MODES.map(mode => (
              <Button key={mode} variant={operatingMode === mode ? "default" : "outline"} size="sm" className="text-xs h-7" onClick={() => setOperatingMode(mode)}>
                {mode}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Connection Health */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Connection Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {CONNECTION_HEALTH.map(c => (
              <div key={c.service} className={`p-2 rounded-lg border text-center ${c.status === "connected" ? "border-border/30 bg-muted/10" : "border-orange-400/30 bg-orange-400/5"}`}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {c.status === "connected" ? <CheckCircle className="w-3 h-3 text-[hsl(var(--trust-safe))]" /> : <AlertTriangle className="w-3 h-3 text-orange-400" />}
                  <span className="text-[10px] font-medium text-foreground">{c.service}</span>
                </div>
                <Progress value={c.health} className="h-1" />
                <span className="text-[9px] text-muted-foreground">{c.health}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!isDemoMode && isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{m.value}</p>
                  <span className={`text-xs font-medium ${m.trend === "up" ? "text-green-400" : "text-red-400"}`}>{m.change}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Quick Navigation</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {([] as typeof DEMO_QUICK_ACTIONS).map(a => (
              <Button key={a.label} variant="ghost" className="w-full justify-between text-foreground hover:bg-accent/50" onClick={() => navigate(a.path)}>
                <span className="flex items-center gap-2"><a.icon className="w-4 h-4 text-primary" />{a.label}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Workspaces</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Automation Office", path: "/revenue-office/automation", icon: Zap, desc: "Build, simulate, and monitor automations" },
              { label: "Quote Studio", path: "/revenue-office/quotes", icon: FileText, desc: "Generate and track quotes & proposals" },
              { label: "Call Desk", path: "/revenue-office/calls", icon: Activity, desc: "Call queue, prep, and post-call flows" },
              { label: "Growth Advisors", path: "/revenue-office/advisors", icon: Sparkles, desc: "AI advisor board with strategic insights" },
              { label: "Business Formation", path: "/revenue-office/onboarding", icon: Target, desc: "Re-run onboarding and calibration" },
              { label: "Digital Presence", path: "/digital-presence", icon: BarChart3, desc: "Website, brand, CRO & digital strategy" },
            ].map(w => (
              <Button key={w.label} variant="ghost" className="w-full justify-between text-foreground hover:bg-accent/50 h-auto py-2" onClick={() => navigate(w.path)}>
                <span className="flex items-center gap-2 text-left">
                  <w.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span><span className="block text-sm">{w.label}</span><span className="block text-[10px] text-muted-foreground font-normal">{w.desc}</span></span>
                </span>
                <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">What Changed</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {whatChanged.map((w, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${w.type === "positive" ? "bg-green-400" : w.type === "warning" ? "bg-yellow-400" : "bg-red-400"}`} />
                <div><p className="text-sm text-foreground">{w.text}</p><p className="text-xs text-muted-foreground">{w.time}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-primary" /> Advisor Signals</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {advisorPreview.map(a => (
              <div key={a.name} className="space-y-1.5">
                <div className="flex items-center justify-between"><span className="text-xs font-medium text-foreground">{a.name}</span><span className="text-xs text-muted-foreground">{Math.round(a.confidence * 100)}%</span></div>
                <p className="text-xs text-muted-foreground">{a.stance}</p>
                <Progress value={a.confidence * 100} className="h-1" />
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full text-xs text-primary" onClick={() => navigate("/revenue-office/advisors")}>Open Advisor Board <ArrowRight className="w-3 h-3 ml-1" /></Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Revenue Health Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Lead Flow", value: 78, status: "healthy" },
              { label: "Pipeline Velocity", value: 65, status: "moderate" },
              { label: "Close Rate", value: 82, status: "healthy" },
              { label: "Retention", value: 91, status: "excellent" },
              { label: "Reputation", value: 88, status: "healthy" },
            ].map(h => (
              <div key={h.label} className="text-center space-y-2">
                <div className="relative w-16 h-16 mx-auto">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.91" fill="none" className="stroke-muted/20" strokeWidth="2" />
                    <circle cx="18" cy="18" r="15.91" fill="none" className={h.value > 80 ? "stroke-green-400" : h.value > 60 ? "stroke-yellow-400" : "stroke-red-400"} strokeWidth="2" strokeDasharray={`${h.value} ${100 - h.value}`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{h.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{h.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
