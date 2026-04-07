import { motion } from "framer-motion";
import { TrendingUp, Users, Target, Zap, ArrowRight, BarChart3, AlertTriangle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useDeals, useCampaigns } from "@/hooks/use-revenue-office";
import { Skeleton } from "@/components/ui/skeleton";

const DEMO_METRICS = [
  { label: "Monthly Revenue", value: "$47,280", change: "+12.4%", trend: "up" },
  { label: "Active Pipeline", value: "$183,500", change: "+8.2%", trend: "up" },
  { label: "Conversion Rate", value: "24.8%", change: "+3.1%", trend: "up" },
  { label: "Customer LTV", value: "$2,840", change: "-1.2%", trend: "down" },
];

const DEMO_WHAT_CHANGED = [
  { text: "3 leads moved to qualified stage", time: "2h ago", type: "positive" },
  { text: "Funnel 'Launch Pro' conversion dropped 4%", time: "5h ago", type: "warning" },
  { text: "New review: 5★ from Sarah K.", time: "8h ago", type: "positive" },
  { text: "Invoice #1042 overdue by 7 days", time: "1d ago", type: "alert" },
];

const QUICK_ACTIONS = [
  { label: "Growth Boardroom", path: "/revenue-office/boardroom", icon: BarChart3 },
  { label: "Pipeline", path: "/revenue-office/pipeline", icon: Target },
  { label: "Campaigns", path: "/revenue-office/campaigns", icon: Zap },
  { label: "Relationships", path: "/revenue-office/relationships", icon: Users },
];

const DEMO_ADVISOR_PREVIEW = [
  { name: "Growth Advisor", stance: "Expand top-of-funnel — acquisition cost is low right now", confidence: 0.82 },
  { name: "Retention Advisor", stance: "Watch cohort 3 — engagement dropping", confidence: 0.74 },
  { name: "Pricing Advisor", stance: "Current pricing has room for 8-12% increase", confidence: 0.68 },
];

export default function RevenueGate() {
  const navigate = useNavigate();
  const { isDemoMode } = useDataMode();
  const { data: liveDeals, isLoading } = useDeals();

  const metrics = isDemoMode ? DEMO_METRICS : DEMO_METRICS; // Aggregate from live deals when available
  const whatChanged = isDemoMode ? DEMO_WHAT_CHANGED : DEMO_WHAT_CHANGED;
  const advisorPreview = isDemoMode ? DEMO_ADVISOR_PREVIEW : DEMO_ADVISOR_PREVIEW;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Revenue Office</h1>
            <p className="text-muted-foreground">Your commercial growth command center</p>
          </div>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            <Sparkles className="w-3 h-3 mr-1" /> Active Mode
          </Badge>
        </div>
      </motion.div>

      {!isDemoMode && isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
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
            {QUICK_ACTIONS.map(a => (
              <Button key={a.label} variant="ghost" className="w-full justify-between text-foreground hover:bg-accent/50" onClick={() => navigate(a.path)}>
                <span className="flex items-center gap-2"><a.icon className="w-4 h-4 text-primary" />{a.label}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
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
                <div>
                  <p className="text-sm text-foreground">{w.text}</p>
                  <p className="text-xs text-muted-foreground">{w.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Advisor Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {advisorPreview.map(a => (
              <div key={a.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{a.name}</span>
                  <span className="text-xs text-muted-foreground">{Math.round(a.confidence * 100)}%</span>
                </div>
                <p className="text-xs text-muted-foreground">{a.stance}</p>
                <Progress value={a.confidence * 100} className="h-1" />
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full text-xs text-primary" onClick={() => navigate("/revenue-office/advisors")}>
              Open Advisor Board <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Health Overview</CardTitle>
        </CardHeader>
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
