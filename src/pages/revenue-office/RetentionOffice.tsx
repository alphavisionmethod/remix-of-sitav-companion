import { motion } from "framer-motion";
import { Heart, AlertTriangle, TrendingDown, RefreshCw, Gift, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const HEALTH_SEGMENTS = [
  { label: "Thriving", count: 38, pct: 57, color: "bg-green-400" },
  { label: "Stable", count: 16, pct: 24, color: "bg-blue-400" },
  { label: "Cooling", count: 8, pct: 12, color: "bg-yellow-400" },
  { label: "At Risk", count: 5, pct: 7, color: "bg-red-400" },
];

const AT_RISK = [
  { name: "Michael Park", company: "Summit Group", ltv: "$8,200", lastActive: "3 weeks ago", signals: ["No login 21d", "Support ticket unresolved", "Engagement ↓ 60%"] },
  { name: "Rachel Kim", company: "Bright Ideas", ltv: "$4,600", lastActive: "2 weeks ago", signals: ["Usage ↓ 40%", "Skipped last session", "No email opens 14d"] },
];

const WIN_BACK = [
  { name: "Tom Bradley", churned: "45 days ago", ltv: "$3,200", reason: "Pricing concern", strategy: "Offer 20% loyalty discount" },
  { name: "Ana Santos", churned: "30 days ago", ltv: "$5,800", reason: "Competitor switch", strategy: "Feature comparison + personal call" },
];

export default function RetentionOffice() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Retention Office</h1>
        <p className="text-sm text-muted-foreground">Churn detection, win-back strategies, and engagement health</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Retention Rate", value: "91%", sub: "+2% vs last quarter" },
          { label: "Churn Rate", value: "4.2%", sub: "Monthly" },
          { label: "Revenue at Risk", value: "$18,500", sub: "5 clients" },
          { label: "Win-Back Pipeline", value: "8", sub: "$28,400 potential" },
        ].map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health Segments */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Customer Health Segments</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-1 h-8 rounded-full overflow-hidden mb-4">
            {HEALTH_SEGMENTS.map(s => (
              <div key={s.label} className={`${s.color} transition-all`} style={{ width: `${s.pct}%` }} />
            ))}
          </div>
          <div className="flex gap-6">
            {HEALTH_SEGMENTS.map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}: {s.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At Risk */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> At-Risk Clients</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {AT_RISK.map(c => (
              <div key={c.name} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.company} · LTV {c.ltv}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Last: {c.lastActive}</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {c.signals.map(s => <Badge key={s} variant="destructive" className="text-xs">{s}</Badge>)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Win-Back */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><RefreshCw className="w-4 h-4 text-primary" /> Win-Back Queue</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {WIN_BACK.map(c => (
              <div key={c.name} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">Churned {c.churned} · LTV {c.ltv}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">Start Campaign</Button>
                </div>
                <p className="text-xs text-muted-foreground"><strong>Reason:</strong> {c.reason}</p>
                <p className="text-xs text-primary mt-1"><strong>Strategy:</strong> {c.strategy}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
