import { motion } from "framer-motion";
import { GitBranch, Plus, Eye, MousePointer, CreditCard, ArrowDown, Percent, Edit3, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FUNNELS = [
  {
    name: "Launch Pro Funnel",
    status: "live",
    visitors: 2840,
    optIns: 682,
    sales: 47,
    revenue: "$14,100",
    conversionRate: "1.65%",
    steps: [
      { name: "Landing Page", visitors: 2840, conversion: "24.0%" },
      { name: "Opt-In Form", visitors: 682, conversion: "42.1%" },
      { name: "Sales Page", visitors: 287, conversion: "16.4%" },
      { name: "Checkout", visitors: 47, conversion: "100%" },
      { name: "Thank You", visitors: 47, conversion: "—" },
    ],
  },
  {
    name: "Free Consultation Funnel",
    status: "live",
    visitors: 1240,
    optIns: 186,
    sales: 12,
    revenue: "$28,800",
    conversionRate: "0.97%",
    steps: [
      { name: "Landing Page", visitors: 1240, conversion: "15.0%" },
      { name: "Application Form", visitors: 186, conversion: "38.7%" },
      { name: "Booking Page", visitors: 72, conversion: "16.7%" },
      { name: "Confirmation", visitors: 12, conversion: "—" },
    ],
  },
  {
    name: "Webinar Registration",
    status: "draft",
    visitors: 0,
    optIns: 0,
    sales: 0,
    revenue: "$0",
    conversionRate: "—",
    steps: [
      { name: "Registration Page", visitors: 0, conversion: "—" },
      { name: "Confirmation", visitors: 0, conversion: "—" },
      { name: "Replay + Offer", visitors: 0, conversion: "—" },
    ],
  },
];

export default function FunnelBuilder() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Funnel Builder</h1>
            <p className="text-sm text-muted-foreground">Visual conversion journeys with step-by-step analytics</p>
          </div>
          <Button className="gap-2"><Plus className="w-4 h-4" /> New Funnel</Button>
        </div>
      </motion.div>

      <div className="space-y-6">
        {FUNNELS.map((funnel, fi) => (
          <motion.div key={funnel.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: fi * 0.1 }}>
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{funnel.name}</CardTitle>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant={funnel.status === "live" ? "default" : "secondary"}>{funnel.status}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" />{funnel.visitors.toLocaleString()} visitors</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><MousePointer className="w-3 h-3" />{funnel.optIns} opt-ins</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="w-3 h-3" />{funnel.sales} sales</span>
                        <span className="text-xs font-medium text-primary">{funnel.revenue}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm"><BarChart3 className="w-4 h-4 mr-1" /> Analytics</Button>
                    <Button variant="ghost" size="sm"><Edit3 className="w-4 h-4 mr-1" /> Edit</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {funnel.steps.map((step, si) => (
                    <div key={step.name} className="flex items-center gap-2">
                      <div className="min-w-[160px] p-3 rounded-lg bg-muted/10 border border-border/30 text-center">
                        <p className="text-sm font-medium text-foreground">{step.name}</p>
                        <p className="text-lg font-bold text-foreground mt-1">{step.visitors.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{step.conversion}</p>
                      </div>
                      {si < funnel.steps.length - 1 && (
                        <ArrowDown className="w-4 h-4 text-muted-foreground rotate-[-90deg] flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
