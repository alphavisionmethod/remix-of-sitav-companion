import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, TrendingDown, RotateCcw, Zap, AlertTriangle, CheckCircle } from "lucide-react";

const events = [
  { date: "Mar 28", title: "Launched 'Spring Growth' campaign", type: "Campaign", outcome: "positive", detail: "Conversion rate +18%, 42 new leads in first week", advisorExpected: "Expected 15-20% lift", actual: "Exceeded expectations" },
  { date: "Mar 21", title: "Changed pricing: Pro tier $29→$39", type: "Pricing", outcome: "mixed", detail: "Revenue per user +34%, but signups dropped 12%", advisorExpected: "Expected slight drop in volume", actual: "Drop larger than expected" },
  { date: "Mar 14", title: "New onboarding sequence activated", type: "Onboarding", outcome: "positive", detail: "Completion rate improved from 54% to 71%", advisorExpected: "Expected 10-15% improvement", actual: "Matched expectations" },
  { date: "Mar 7", title: "Disabled 2 underperforming funnels", type: "Funnel", outcome: "neutral", detail: "No significant revenue impact, saved ad spend", advisorExpected: "Expected neutral impact", actual: "As predicted" },
  { date: "Feb 28", title: "Launched referral program", type: "Growth", outcome: "positive", detail: "23 referrals in 4 weeks, $4,600 attributed revenue", advisorExpected: "Expected slow ramp", actual: "Slightly above expectations" },
  { date: "Feb 15", title: "Review campaign sent to 150 clients", type: "Reputation", outcome: "positive", detail: "38 new reviews, avg 4.7 stars", advisorExpected: "Expected 20-25% response rate", actual: "25.3% response — on target" },
];

const outcomeIcon = { positive: CheckCircle, mixed: AlertTriangle, neutral: RotateCcw };
const outcomeColor = { positive: "text-emerald-400", mixed: "text-amber-400", neutral: "text-muted-foreground" };

export default function BusinessTimeMachine() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Business Time Machine</h1>
        <p className="text-muted-foreground">Replay business changes — what happened, what advisors expected, what actually occurred</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{events.length}</p><p className="text-xs text-muted-foreground">Major Events (60 days)</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-400">{events.filter(e => e.outcome === "positive").length}</p><p className="text-xs text-muted-foreground">Positive Outcomes</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-400">{events.filter(e => e.outcome === "mixed").length}</p><p className="text-xs text-muted-foreground">Mixed Outcomes</p></CardContent></Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-blue-400" />Event Timeline</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {events.map((e, i) => {
            const Icon = outcomeIcon[e.outcome as keyof typeof outcomeIcon];
            return (
              <div key={i} className="relative pl-8 pb-4 border-l border-border/50 last:border-0">
                <div className={`absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full ${e.outcome === "positive" ? "bg-emerald-400" : e.outcome === "mixed" ? "bg-amber-400" : "bg-muted-foreground"}`} />
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${outcomeColor[e.outcome as keyof typeof outcomeColor]}`} />
                      <span className="font-medium text-sm text-foreground">{e.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{e.type}</Badge>
                      <span className="text-xs text-muted-foreground">{e.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{e.detail}</p>
                  <div className="flex gap-4 text-xs">
                    <span className="text-muted-foreground">Advisor expected: <span className="text-foreground">{e.advisorExpected}</span></span>
                    <span className="text-muted-foreground">Actual: <span className="text-foreground">{e.actual}</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
