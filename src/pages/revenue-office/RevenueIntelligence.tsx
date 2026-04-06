import { motion } from "framer-motion";
import { BarChart3, TrendingUp, AlertTriangle, DollarSign, Users, Target, ArrowUpRight, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const COHORT_DATA = [
  { cohort: "Jan 2026", acquired: 24, retained30: 20, retained60: 17, retained90: 14, ltv: "$1,820" },
  { cohort: "Feb 2026", acquired: 31, retained30: 27, retained60: 22, retained90: 19, ltv: "$2,140" },
  { cohort: "Mar 2026", acquired: 28, retained30: 25, retained60: 21, retained90: null, ltv: "$1,680" },
];

const REVENUE_STREAMS = [
  { source: "Courses & Digital", revenue: "$42,174", pct: 45, trend: "+12%" },
  { source: "Services & Coaching", revenue: "$25,000", pct: 27, trend: "+8%" },
  { source: "Memberships", revenue: "$12,149", pct: 13, trend: "+22%" },
  { source: "Consulting Retainers", revenue: "$9,000", pct: 10, trend: "+5%" },
  { source: "Affiliate / Partner", revenue: "$4,700", pct: 5, trend: "+3%" },
];

const LEAKAGE = [
  { type: "Stale Leads", value: "$34,200", action: "Re-engage sequence needed" },
  { type: "Abandoned Carts", value: "$6,400", action: "Recovery email not sent" },
  { type: "Expired Quotes", value: "$12,000", action: "Follow-up overdue" },
  { type: "Churn Risk", value: "$18,500", action: "2 high-value clients disengaging" },
];

export default function RevenueIntelligence() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Revenue Intelligence</h1>
        <p className="text-sm text-muted-foreground">Forecasting, cohort analysis, LTV, and leakage detection</p>
      </motion.div>

      {/* Revenue Streams */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Revenue by Stream</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {REVENUE_STREAMS.map(r => (
            <div key={r.source} className="flex items-center gap-4">
              <span className="text-sm text-foreground w-40">{r.source}</span>
              <div className="flex-1 h-4 bg-muted/20 rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary/70 rounded-full" initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ duration: 0.6 }} />
              </div>
              <span className="text-sm font-bold text-foreground w-20 text-right">{r.revenue}</span>
              <span className="text-xs text-green-400 w-12 text-right">{r.trend}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cohort Analysis */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Cohort Retention</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-muted-foreground">
                  <th className="text-left p-2">Cohort</th><th className="p-2">Acquired</th><th className="p-2">30d</th><th className="p-2">60d</th><th className="p-2">90d</th><th className="p-2">LTV</th>
                </tr></thead>
                <tbody>
                  {COHORT_DATA.map(c => (
                    <tr key={c.cohort} className="border-t border-border/20">
                      <td className="p-2 text-foreground font-medium">{c.cohort}</td>
                      <td className="p-2 text-center text-foreground">{c.acquired}</td>
                      <td className="p-2 text-center text-foreground">{c.retained30}</td>
                      <td className="p-2 text-center text-foreground">{c.retained60}</td>
                      <td className="p-2 text-center text-foreground">{c.retained90 ?? "—"}</td>
                      <td className="p-2 text-center text-primary font-medium">{c.ltv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Leakage */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" /> Revenue Leakage</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {LEAKAGE.map(l => (
              <div key={l.type} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">{l.type}</p>
                  <span className="text-sm font-bold text-red-400">{l.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{l.action}</p>
              </div>
            ))}
            <div className="pt-2 border-t border-border/30 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Leakage</span>
              <span className="text-lg font-bold text-red-400">$71,100</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
