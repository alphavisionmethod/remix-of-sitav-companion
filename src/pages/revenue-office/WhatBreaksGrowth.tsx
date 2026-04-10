import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShieldAlert, AlertTriangle, Target, Users, Zap, MessageCircle, Clock, Wrench, CheckCircle, ArrowRight } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_riskAreas, DEMO_ADVISOR_INVALIDATION } from "@/lib/demo-data/revenue-office";

export default function WhatBreaksGrowth() {
  const { isDemoMode } = useDataMode();
  const riskAreas = isDemoMode ? DEMO_riskAreas : DEMO_riskAreas;
  const totalRisks = riskAreas.reduce((a, r) => a + r.risks.length, 0);
  const highSeverity = riskAreas.reduce((a, r) => a + r.risks.filter(x => x.severity === "high").length, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-amber-400" /> What Breaks Growth?</h1>
        <p className="text-muted-foreground">Reverse-analysis of weak assumptions, delivery risks, failure points, and repair actions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalRisks}</p><p className="text-xs text-muted-foreground">Total Risks</p>
        </CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{highSeverity}</p><p className="text-xs text-muted-foreground">High Severity</p>
        </CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{riskAreas.length}</p><p className="text-xs text-muted-foreground">Risk Areas</p>
        </CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{Math.round(riskAreas.reduce((a, r) => a + r.risks.reduce((s, x) => s + x.likelihood, 0), 0) / totalRisks)}%</p><p className="text-xs text-muted-foreground">Avg Likelihood</p>
        </CardContent></Card>
      </div>

      {/* Advisor Invalidation Triggers */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Advisor-Linked Invalidation Triggers</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {DEMO_ADVISOR_INVALIDATION.slice(0, 4).map((inv, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded bg-background/50 border border-border/30">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-foreground"><span className="font-medium">{inv.advisor}:</span> {inv.condition}</p>
                <p className="text-[10px] text-muted-foreground">Impact: {inv.impact}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk Areas with Repair Actions */}
      {riskAreas.map((area) => (
        <Card key={area.area} className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <area.icon className={`h-5 w-5 ${area.color}`} />{area.area}
              <Badge variant="secondary" className="text-[10px] ml-2">{area.risks.length} risks</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {area.risks.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/30">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${r.severity === "high" ? "text-red-400" : "text-amber-400"}`} />
                    <span className="text-sm text-foreground">{r.risk}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">{r.severity}</Badge>
                    <span className="text-xs text-muted-foreground">{r.likelihood}% likely</span>
                  </div>
                </div>
                {/* Repair action */}
                <div className="mt-2 flex items-center justify-between p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs text-foreground">Repair: {r.severity === "high" ? "Activate automation to address this risk" : "Monitor and review next week"}</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-[10px] h-6 gap-1"><ArrowRight className="w-3 h-3" />Act</Button>
                </div>
                {/* Likelihood bar */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Likelihood</span>
                  <Progress value={r.likelihood} className="h-1 flex-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
