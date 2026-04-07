import { motion } from "framer-motion";
import { Route, Eye, MousePointer, Mail, Phone, CreditCard, Star, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const DEMO_JOURNEY_STAGES = [
  {
    stage: "Awareness",
    touchpoints: [
      { type: "ad", label: "Google Ad Click", time: "Day 0", icon: Eye },
      { type: "page", label: "Landing Page Visit", time: "Day 0", icon: MousePointer },
    ],
    metrics: { entered: 2840, exited: 1598, conversion: "43.7%" },
  },
  {
    stage: "Engagement",
    touchpoints: [
      { type: "form", label: "Lead Magnet Download", time: "Day 0", icon: MousePointer },
      { type: "email", label: "Welcome Email Opened", time: "Day 1", icon: Mail },
      { type: "email", label: "Follow-Up Email Clicked", time: "Day 3", icon: Mail },
    ],
    metrics: { entered: 1242, exited: 556, conversion: "55.2%" },
  },
  {
    stage: "Consideration",
    touchpoints: [
      { type: "page", label: "Sales Page Visit", time: "Day 4", icon: Eye },
      { type: "call", label: "Discovery Call Booked", time: "Day 5", icon: Phone },
      { type: "email", label: "Case Study Sent", time: "Day 6", icon: Mail },
    ],
    metrics: { entered: 686, exited: 399, conversion: "41.8%" },
  },
  {
    stage: "Decision",
    touchpoints: [
      { type: "proposal", label: "Proposal Viewed", time: "Day 7", icon: Eye },
      { type: "call", label: "Closing Call", time: "Day 10", icon: Phone },
    ],
    metrics: { entered: 287, exited: 200, conversion: "30.3%" },
  },
  {
    stage: "Purchase",
    touchpoints: [
      { type: "checkout", label: "Checkout Completed", time: "Day 12", icon: CreditCard },
    ],
    metrics: { entered: 87, exited: 0, conversion: "100%" },
  },
  {
    stage: "Advocacy",
    touchpoints: [
      { type: "review", label: "Review Submitted", time: "Day 30+", icon: Star },
    ],
    metrics: { entered: 87, exited: 75, conversion: "13.8%" },
  },
];

export default function JourneyTwin() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Route className="w-6 h-6 text-primary" /> Journey Twin
        </h1>
        <p className="text-sm text-muted-foreground">Visual customer journey digital twin — every touchpoint mapped</p>
      </motion.div>

      <div className="space-y-4">
        {JOURNEY_STAGES.map((stage, si) => (
          <motion.div key={stage.stage} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: si * 0.08 }}>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Stage Label */}
                  <div className="w-32 flex-shrink-0 pt-1">
                    <h3 className="text-sm font-bold text-foreground">{stage.stage}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{stage.metrics.entered} entered</p>
                    <p className="text-xs text-primary font-medium">{stage.metrics.conversion} through</p>
                  </div>

                  {/* Touchpoints Flow */}
                  <div className="flex items-center gap-3 overflow-x-auto flex-1">
                    {stage.touchpoints.map((tp, ti) => (
                      <div key={ti} className="flex items-center gap-2">
                        <div className="min-w-[140px] p-3 rounded-lg bg-muted/10 border border-border/30 text-center">
                          <tp.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                          <p className="text-xs font-medium text-foreground">{tp.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1"><Clock className="w-3 h-3" />{tp.time}</p>
                        </div>
                        {ti < stage.touchpoints.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                      </div>
                    ))}
                  </div>

                  {/* Exit indicator */}
                  {stage.metrics.exited > 0 && (
                    <div className="w-20 flex-shrink-0 text-right pt-2">
                      <p className="text-xs text-red-400 font-medium">↓ {stage.metrics.exited}</p>
                      <p className="text-xs text-muted-foreground">dropped</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {si < JOURNEY_STAGES.length - 1 && (
              <div className="flex justify-center py-1"><div className="w-px h-4 bg-border/50" /></div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
