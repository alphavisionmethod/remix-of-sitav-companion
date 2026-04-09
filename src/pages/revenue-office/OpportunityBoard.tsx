import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, UserPlus, Star, RefreshCw, DollarSign, ArrowRight } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_opportunities } from "@/lib/demo-data/revenue-office";

const categoryColors: Record<string, string> = {
  Conversion: "bg-blue-500/10 text-blue-400",
  Upsell: "bg-emerald-500/10 text-emerald-400",
  Reputation: "bg-amber-500/10 text-amber-400",
  Reactivation: "bg-purple-500/10 text-purple-400",
  Packaging: "bg-pink-500/10 text-pink-400",
  Referral: "bg-cyan-500/10 text-cyan-400",
};

export default function OpportunityBoard() {
  const { isDemoMode } = useDataMode();
  const opportunities = isDemoMode ? DEMO_opportunities : DEMO_opportunities;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Opportunity Board</h1>
        <p className="text-muted-foreground">Ranked commercial opportunities across the entire business</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{opportunities.length}</p><p className="text-xs text-muted-foreground">Active Opportunities</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-400">$67,900+</p><p className="text-xs text-muted-foreground">Total Potential Impact</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-400">72%</p><p className="text-xs text-muted-foreground">Avg Confidence</p></CardContent></Card>
      </div>

      <div className="space-y-3">
        {opportunities.map((opp, i) => (
          <Card key={i} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><opp.icon className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{opp.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opp.why}</p>
                  </div>
                </div>
                <Badge className={`${categoryColors[opp.category]} text-[10px]`}>{opp.category}</Badge>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="text-muted-foreground">Impact: <span className="text-emerald-400 font-medium">{opp.impact}</span></span>
                <span className="text-muted-foreground">Confidence: <span className="text-foreground font-medium">{opp.confidence}%</span></span>
                <span className="text-muted-foreground">Effort: <span className="text-foreground font-medium">{opp.effort}</span></span>
                <span className="text-muted-foreground">Advisor: <span className="text-blue-400">{opp.advisor}</span></span>
                <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
