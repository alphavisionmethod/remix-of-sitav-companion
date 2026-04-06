import { motion } from "framer-motion";
import { FlaskConical, ArrowUpRight, ArrowDownRight, BarChart3, Play, Pause, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const EXPERIMENTS = [
  {
    name: "Landing Page Headline Test",
    status: "running",
    startDate: "Mar 15, 2026",
    variants: [
      { name: "Control", visitors: 1420, conversions: 341, rate: 24.0 },
      { name: "Variant A — Social Proof", visitors: 1418, conversions: 398, rate: 28.1 },
    ],
    lift: "+17.1%",
    confidence: 94,
    winner: "Variant A",
  },
  {
    name: "Checkout Flow — Single vs Multi-Step",
    status: "running",
    startDate: "Mar 22, 2026",
    variants: [
      { name: "Multi-Step (Control)", visitors: 680, conversions: 47, rate: 6.9 },
      { name: "Single-Step", visitors: 675, conversions: 54, rate: 8.0 },
    ],
    lift: "+15.9%",
    confidence: 78,
    winner: null,
  },
  {
    name: "Email Subject Line — Urgency vs Curiosity",
    status: "completed",
    startDate: "Mar 1, 2026",
    variants: [
      { name: "Urgency", visitors: 2400, conversions: 456, rate: 19.0 },
      { name: "Curiosity", visitors: 2398, conversions: 528, rate: 22.0 },
    ],
    lift: "+15.8%",
    confidence: 99,
    winner: "Curiosity",
  },
  {
    name: "Pricing Page — Annual Toggle Default",
    status: "draft",
    startDate: "—",
    variants: [
      { name: "Monthly Default", visitors: 0, conversions: 0, rate: 0 },
      { name: "Annual Default", visitors: 0, conversions: 0, rate: 0 },
    ],
    lift: "—",
    confidence: 0,
    winner: null,
  },
];

export default function ConversionLab() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-primary" /> Conversion Lab
            </h1>
            <p className="text-sm text-muted-foreground">A/B testing, conversion optimization, and funnel experiments</p>
          </div>
          <Button className="gap-2"><Plus className="w-4 h-4" /> New Experiment</Button>
        </div>
      </motion.div>

      <div className="space-y-4">
        {EXPERIMENTS.map((exp, i) => (
          <motion.div key={exp.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{exp.name}</p>
                      <Badge variant={exp.status === "running" ? "default" : exp.status === "completed" ? "secondary" : "outline"} className="text-xs">{exp.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Started {exp.startDate}</p>
                  </div>
                  {exp.status !== "draft" && (
                    <div className="text-right">
                      <p className={`text-lg font-bold ${exp.lift.startsWith("+") ? "text-green-400" : "text-foreground"}`}>{exp.lift}</p>
                      <p className="text-xs text-muted-foreground">{exp.confidence}% confidence</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {exp.variants.map(v => (
                    <div key={v.name} className={`flex items-center justify-between p-3 rounded-lg border ${exp.winner === v.name ? "border-green-500/30 bg-green-500/5" : "border-border/30 bg-muted/10"}`}>
                      <div className="flex items-center gap-2">
                        {exp.winner === v.name && <Badge className="text-xs bg-green-500/20 text-green-400">Winner</Badge>}
                        <span className="text-sm text-foreground">{v.name}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{v.visitors.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">visitors</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{v.conversions}</p>
                          <p className="text-xs text-muted-foreground">conversions</p>
                        </div>
                        <div className="text-right w-16">
                          <p className="text-sm font-bold text-primary">{v.rate}%</p>
                          <p className="text-xs text-muted-foreground">rate</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {exp.confidence > 0 && <Progress value={exp.confidence} className="h-1" />}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
