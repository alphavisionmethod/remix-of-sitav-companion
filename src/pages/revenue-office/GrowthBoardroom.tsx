import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Target, Users, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useDeals } from "@/hooks/use-revenue-office";
import { Skeleton } from "@/components/ui/skeleton";

const DEMO_PIPELINE_STAGES = [
  { name: "Awareness", count: 142, value: "$0", conversion: "100%" },
  { name: "Interest", count: 89, value: "$0", conversion: "62.7%" },
  { name: "Consideration", count: 34, value: "$85,000", conversion: "38.2%" },
  { name: "Intent", count: 18, value: "$126,000", conversion: "52.9%" },
  { name: "Negotiation", count: 8, value: "$92,000", conversion: "44.4%" },
  { name: "Won", count: 5, value: "$47,280", conversion: "62.5%" },
];

const DEMO_LEAKS = [
  { area: "Stale leads (>14 days)", count: 12, revenue: "$34,200", severity: "high" },
  { area: "Abandoned checkouts", count: 8, revenue: "$6,400", severity: "medium" },
  { area: "Missed follow-ups", count: 5, revenue: "$18,500", severity: "high" },
  { area: "Expired quotes", count: 3, revenue: "$12,000", severity: "medium" },
];

const DEMO_ADVISOR_SIGNALS = [
  { advisor: "Growth", signal: "Lead volume up 18% — nurture sequences should scale", type: "opportunity" },
  { advisor: "Sales", signal: "Close rate declining in Enterprise segment", type: "warning" },
  { advisor: "Marketing", signal: "Email open rates strong — increase send frequency", type: "opportunity" },
  { advisor: "Retention", signal: "2 high-value clients showing disengagement signals", type: "alert" },
];

export default function GrowthBoardroom() {
  const { isDemoMode } = useDataMode();
  const { data: liveDeals, isLoading } = useDeals();

  const PIPELINE_STAGES = isDemoMode ? DEMO_PIPELINE_STAGES : DEMO_PIPELINE_STAGES;
  const LEAKS = isDemoMode ? DEMO_LEAKS : DEMO_LEAKS;
  const ADVISOR_SIGNALS = isDemoMode ? DEMO_ADVISOR_SIGNALS : DEMO_ADVISOR_SIGNALS;

  if (!isDemoMode && isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <DemoModeBadge />
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Growth Boardroom</h1>
        <p className="text-sm text-muted-foreground">Executive revenue and growth command view</p>
      </motion.div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Pipeline Flow</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PIPELINE_STAGES.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{s.name}</span>
                  <div className="flex-1 h-6 bg-muted/20 rounded-full overflow-hidden relative">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.count / 142) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    />
                    <span className="absolute inset-0 flex items-center px-3 text-xs font-medium text-foreground">{s.count} · {s.value}</span>
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{s.conversion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" /> Revenue Leaks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {LEAKS.map(l => (
              <div key={l.area} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/30">
                <div>
                  <p className="text-sm text-foreground">{l.area}</p>
                  <p className="text-xs text-muted-foreground">{l.count} items · {l.revenue} at risk</p>
                </div>
                <Badge variant={l.severity === "high" ? "destructive" : "secondary"} className="text-xs">{l.severity}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Advisor Board Signals</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
    </div>
  );
}
