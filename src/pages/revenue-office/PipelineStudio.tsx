import { motion } from "framer-motion";
import { Target, DollarSign, Clock, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const STAGES = [
  {
    name: "Prospecting",
    deals: [
      { name: "Apex Digital — Website Redesign", value: "$15,000", probability: 20, age: 3, owner: "You" },
      { name: "Nova Labs — Consulting Package", value: "$8,500", probability: 15, age: 7, owner: "You" },
    ],
  },
  {
    name: "Qualification",
    deals: [
      { name: "Summit Group — Annual Retainer", value: "$36,000", probability: 40, age: 12, owner: "You" },
      { name: "Bright Path — Coaching Program", value: "$4,800", probability: 35, age: 5, owner: "You" },
    ],
  },
  {
    name: "Proposal",
    deals: [
      { name: "Craft Studios — Brand Package", value: "$22,000", probability: 65, age: 18, owner: "You" },
    ],
  },
  {
    name: "Negotiation",
    deals: [
      { name: "Atlas Corp — Platform License", value: "$48,000", probability: 80, age: 25, owner: "You" },
      { name: "Green Valley — Implementation", value: "$18,500", probability: 75, age: 14, owner: "You" },
    ],
  },
  {
    name: "Closed Won",
    deals: [
      { name: "Mitchell Co — Q2 Services", value: "$12,400", probability: 100, age: 0, owner: "You" },
    ],
  },
];

export default function PipelineStudio() {
  const totalPipeline = STAGES.flatMap(s => s.deals).reduce((sum, d) => sum + parseInt(d.value.replace(/[^0-9]/g, "")), 0);
  const weightedPipeline = STAGES.flatMap(s => s.deals).reduce((sum, d) => sum + parseInt(d.value.replace(/[^0-9]/g, "")) * d.probability / 100, 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Pipeline Studio</h1>
        <p className="text-sm text-muted-foreground">Visual deal flow with conversion intelligence and leak detection</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Pipeline</p>
          <p className="text-2xl font-bold text-foreground">${totalPipeline.toLocaleString()}</p>
        </CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Weighted Pipeline</p>
          <p className="text-2xl font-bold text-foreground">${Math.round(weightedPipeline).toLocaleString()}</p>
        </CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Avg. Deal Age</p>
          <p className="text-2xl font-bold text-foreground">12 days</p>
        </CardContent></Card>
      </div>

      {/* Kanban Pipeline */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage, si) => (
          <motion.div key={stage.name} className="min-w-[260px] flex-shrink-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.08 }}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">{stage.name}</h3>
              <Badge variant="secondary" className="text-xs">{stage.deals.length}</Badge>
            </div>
            <div className="space-y-3">
              {stage.deals.map(deal => (
                <Card key={deal.name} className="bg-card/60 border-border/40 hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="p-3 space-y-2">
                    <p className="text-sm font-medium text-foreground leading-tight">{deal.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">{deal.value}</span>
                      <span className="text-xs text-muted-foreground">{deal.probability}%</span>
                    </div>
                    <Progress value={deal.probability} className="h-1" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{deal.age}d</span>
                      {deal.age > 15 && <Badge variant="destructive" className="text-xs">Aging</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
