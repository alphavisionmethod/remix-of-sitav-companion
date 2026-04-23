import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Target, Users, DollarSign, ArrowUpRight, ArrowDownRight, Activity, Zap, CalendarCheck, Star, RefreshCw, ArrowRight, Swords, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useRevenueOfficeMode } from "@/contexts/RevenueOfficeModeContext";
import { RevenueOfficeModeToggle } from "@/components/revenue-office/RevenueOfficeModeToggle";
import { useDeals } from "@/hooks/use-revenue-office";
import { useRevenueLeakItems } from "@/hooks/use-revenue-office";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { competitiveIntelligenceService, type CompetitivePosition } from "@/lib/services/competitive-intelligence";
import { useOSRuntime } from "@/hooks/useOSRuntime";
import { useRevenueWhatChanged } from "@/hooks/use-revenue-memory";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";
import { Typography } from "@/components/sita/Typography";

const PIPELINE_STAGES: any[] = [];
const ADVISOR_SIGNALS: any[] = [];




const CAMPAIGN_HEALTH = [
  { name: "Summer Accelerator", status: "active", performance: 78, leads: 42, spend: "$2,400" },
  { name: "Referral Sprint", status: "active", performance: 92, leads: 18, spend: "$800" },
  { name: "Re-engagement Q2", status: "paused", performance: 45, leads: 6, spend: "$1,200" },
];

const BOOKING_LOAD = { capacity: 40, booked: 32, utilizationPct: 80, noShowRate: 8, avgPrepScore: 85 };
const REPUTATION_PULSE = { rating: 4.8, reviews: 127, responseRate: 96, nps: 72 };
const OPERATING_MODE = "Growth";

export default function GrowthBoardroom() {
  const { isBeginner } = useRevenueOfficeMode();
  const { data: liveDeals, isLoading } = useDeals();
  const navigate = useNavigate();

  const competitivePosition = useMemo(() => competitiveIntelligenceService.assessPosition(), []);
  const { engines } = useOSRuntime();
  const revenueStats = useMemo(() => engines?.revenue?.getStats() ?? null, [engines]);
  const { data: whatChangedData } = useRevenueWhatChanged();

  const { data: liveLeakItems } = useRevenueLeakItems();

  const PIPELINE_STAGES = (liveDeals && liveDeals.length > 0 ? [] as any[] : []);
  const LEAKS = (liveLeakItems && liveLeakItems.length > 0 ? liveLeakItems : []);
  const ADVISOR_SIGNALS: any[] = [];

  if (isLoading) {
    return <PageShell width="wide" className="space-y-6">
<Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div></PageShell>;
  }

  return (
    <PageShell width="wide" className="space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <Typography role="appTitle">Growth Boardroom</Typography>
            <p className="text-sm text-muted-foreground">{isBeginner ? "Your business performance at a glance" : "Executive revenue command center"}</p>
          </div>
          <div className="flex items-center gap-3">
            <RevenueOfficeModeToggle />
            <Badge variant="outline" className="text-xs border-primary/30 text-primary"><Zap className="w-3 h-3 mr-1" />{OPERATING_MODE} Mode</Badge>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Monthly Revenue", value: "$47,280", change: "+12.4%", icon: DollarSign, up: true },
          { label: "Pipeline Value", value: "$183,500", change: "+8.2%", icon: Target, up: true },
          { label: "Active Clients", value: "67", change: "+3", icon: Users, up: true },
          { label: "Revenue at Risk", value: "$18,500", change: "+$4,200", icon: AlertTriangle, up: false },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <m.icon className="w-4 h-4 text-primary" />
                  {m.up ? <ArrowUpRight className="w-3 h-3 text-green-400" /> : <ArrowDownRight className="w-3 h-3 text-red-400" />}
                </div>
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <span className={`text-xs font-medium ${m.up ? "text-green-400" : "text-red-400"}`}>{m.change}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Health Gauges Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Campaign Health */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-primary" /><span className="text-xs font-medium text-muted-foreground">Campaign Health</span></div>
            {CAMPAIGN_HEALTH.map(c => (
              <div key={c.name} className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-foreground truncate flex-1">{c.name}</span>
                <div className="flex items-center gap-1.5">
                  <Progress value={c.performance} className="h-1 w-12" />
                  <span className={`text-[10px] font-medium ${c.performance >= 70 ? "text-[hsl(var(--trust-safe))]" : "text-orange-400"}`}>{c.performance}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Booking Load */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><CalendarCheck className="w-4 h-4 text-primary" /><span className="text-xs font-medium text-muted-foreground">Booking Load</span></div>
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.91" fill="none" className="stroke-muted/20" strokeWidth="2" />
                <circle cx="18" cy="18" r="15.91" fill="none" className={BOOKING_LOAD.utilizationPct >= 90 ? "stroke-orange-400" : "stroke-[hsl(var(--trust-safe))]"} strokeWidth="2" strokeDasharray={`${BOOKING_LOAD.utilizationPct} ${100 - BOOKING_LOAD.utilizationPct}`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{BOOKING_LOAD.utilizationPct}%</span>
            </div>
            <div className="text-center text-[10px] text-muted-foreground">{BOOKING_LOAD.booked}/{BOOKING_LOAD.capacity} slots · {BOOKING_LOAD.noShowRate}% no-show</div>
          </CardContent>
        </Card>

        {/* Reputation Pulse */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Star className="w-4 h-4 text-amber-400" /><span className="text-xs font-medium text-muted-foreground">Reputation Pulse</span></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{REPUTATION_PULSE.rating}★</p>
              <p className="text-[10px] text-muted-foreground">{REPUTATION_PULSE.reviews} reviews</p>
            </div>
            <div className="flex justify-between text-[10px] mt-2">
              <span>Response: {REPUTATION_PULSE.responseRate}%</span>
              <span>NPS: {REPUTATION_PULSE.nps}</span>
            </div>
          </CardContent>
        </Card>

        {/* Funnel Conversion */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-primary" /><span className="text-xs font-medium text-muted-foreground">Funnel Pulse</span></div>
            {PIPELINE_STAGES.slice(0, 4).map(s => (
              <div key={s.name} className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-foreground">{s.name}</span>
                <span className="text-[10px] font-medium text-muted-foreground">{s.conversion}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Leakage Engine Stats */}
      {revenueStats && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3"><Droplets className="w-4 h-4 text-primary" /><span className="text-xs font-medium text-muted-foreground">Revenue Leakage Engine</span></div>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: "Detected", value: revenueStats.detected, color: "text-amber-400" },
                { label: "In Recovery", value: revenueStats.inRecovery, color: "text-primary" },
                { label: "Recovered", value: revenueStats.recovered, color: "text-[hsl(var(--trust-safe))]" },
                { label: "Potential Value", value: `$${revenueStats.totalPotentialValue.toLocaleString()}`, color: "text-foreground" },
              ].map(s => (
                <div key={s.label}>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Pipeline Flow</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PIPELINE_STAGES.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{s.name}</span>
                  <div className="flex-1 h-6 bg-muted/20 rounded-full overflow-hidden relative">
                    <motion.div className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${(s.count / 142) * 100}%` }} transition={{ delay: i * 0.1, duration: 0.5 }} />
                    <span className="absolute inset-0 flex items-center px-3 text-xs font-medium text-foreground">{s.count} · {s.value}</span>
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{s.conversion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* What Changed Live Feed */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><RefreshCw className="w-4 h-4 text-primary" /> What Changed</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([] as any[]).map((w, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${w.type === "positive" ? "bg-green-400" : w.type === "warning" ? "bg-yellow-400" : "bg-red-400"}`} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{w.text}</p>
                  <p className="text-xs text-muted-foreground">{w.time}</p>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full text-xs text-primary" onClick={() => navigate("/revenue-office/memory")}>
              View Full Memory Feed <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Advisor Signals + Competitive Position */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Advisor Board Signals</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {ADVISOR_SIGNALS.map(s => (
                <div key={s.advisor} className={`p-3 rounded-lg border ${s.type === "alert" ? "border-red-500/30 bg-red-500/5" : s.type === "warning" ? "border-yellow-500/30 bg-yellow-500/5" : "border-green-500/30 bg-green-500/5"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{s.advisor}</Badge>
                    <Badge variant={s.type === "alert" ? "destructive" : s.type === "warning" ? "secondary" : "default"} className="text-xs">{s.type}</Badge>
                  </div>
                  <p className="text-sm text-foreground">{s.signal}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competitive Intelligence Widget */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Swords className="w-4 h-4 text-primary" /> Competitive Position</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.91" fill="none" className="stroke-muted/20" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.91" fill="none" className={competitivePosition.overallScore >= 70 ? "stroke-emerald-500" : competitivePosition.overallScore >= 40 ? "stroke-amber-500" : "stroke-red-500"} strokeWidth="2.5" strokeDasharray={`${competitivePosition.overallScore} ${100 - competitivePosition.overallScore}`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{competitivePosition.overallScore}</span>
              </div>
              <div className="flex-1 space-y-1">
                {competitivePosition.recommendations.slice(0, 2).map((r, i) => (
                  <p key={i} className="text-[10px] text-muted-foreground">• {r}</p>
                ))}
              </div>
            </div>
            {competitivePosition.opportunities.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Opportunities</p>
                {competitivePosition.opportunities.slice(0, 3).map((o, i) => (
                  <p key={i} className="text-xs text-foreground">• {o}</p>
                ))}
              </div>
            )}
            {competitivePosition.threats.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Threats</p>
                {competitivePosition.threats.slice(0, 3).map((t, i) => (
                  <p key={i} className="text-xs text-red-400">• {t}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
