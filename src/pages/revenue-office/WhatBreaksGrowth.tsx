import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, AlertTriangle, Target, Users, Zap, MessageCircle, Clock } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const riskAreas = [
  {
    area: "Funnel Conversion",
    risks: [
      { risk: "Landing page load time >3s on mobile (currently 4.2s)", severity: "high", likelihood: 78 },
      { risk: "Checkout form asks for too many fields (8 vs best practice 4)", severity: "medium", likelihood: 65 },
      { risk: "No social proof on main funnel page", severity: "medium", likelihood: 72 },
    ],
    icon: Target, color: "text-blue-400"
  },
  {
    area: "Follow-up & Nurture",
    risks: [
      { risk: "45% of leads receive no follow-up within 24hrs", severity: "high", likelihood: 88 },
      { risk: "Email nurture sequence has no personalization beyond first name", severity: "medium", likelihood: 60 },
      { risk: "No SMS follow-up configured for high-intent leads", severity: "medium", likelihood: 55 },
    ],
    icon: MessageCircle, color: "text-emerald-400"
  },
  {
    area: "Booking & Delivery",
    risks: [
      { risk: "No-show rate at 18% — no automated reminder 1hr before", severity: "high", likelihood: 82 },
      { risk: "Post-call follow-up delayed >48hrs for 30% of calls", severity: "medium", likelihood: 70 },
    ],
    icon: Clock, color: "text-amber-400"
  },
  {
    area: "Retention & Churn",
    risks: [
      { risk: "No reactivation sequence for clients inactive >60 days", severity: "high", likelihood: 90 },
      { risk: "Membership renewal reminder sent too late (day-of vs 7 days before)", severity: "medium", likelihood: 75 },
    ],
    icon: Users, color: "text-purple-400"
  },
];

export default function WhatBreaksGrowth() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground">What Breaks Growth?</h1>
        <p className="text-muted-foreground">Reverse-analysis of weak assumptions, delivery risks, and failure points across all growth systems</p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-foreground">{riskAreas.reduce((a, r) => a + r.risks.length, 0)} growth risks identified across {riskAreas.length} areas</p>
            <p className="text-xs text-muted-foreground">{riskAreas.reduce((a, r) => a + r.risks.filter(x => x.severity === "high").length, 0)} high-severity risks requiring attention</p>
          </div>
        </CardContent>
      </Card>

      {riskAreas.map((area) => (
        <Card key={area.area} className="bg-card/50 border-border/50">
          <CardHeader><CardTitle className="flex items-center gap-2"><area.icon className={`h-5 w-5 ${area.color}`} />{area.area}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {area.risks.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${r.severity === "high" ? "text-red-400" : "text-amber-400"}`} />
                  <span className="text-sm text-foreground">{r.risk}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">{r.severity}</Badge>
                  <span className="text-xs text-muted-foreground">{r.likelihood}% likely</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
