import { motion } from "framer-motion";
import { AlertTriangle, DollarSign, Clock, Users, ShoppingCart, Mail, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useRevenueLeakItems } from "@/hooks/use-revenue-office";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/sita/EmptyState";

const DEMO_LEAKS = [
  {
    category: "Stale Leads", icon: Users, items: 12, revenue: "$34,200", severity: "high",
    description: "Leads with no follow-up in 14+ days", action: "Launch re-engagement sequence",
    details: [
      { name: "Summit Group", value: "$12,000", days: 18 },
      { name: "Nova Ventures", value: "$8,500", days: 22 },
      { name: "Apex Digital", value: "$6,200", days: 15 },
    ],
  },
  {
    category: "Abandoned Checkouts", icon: ShoppingCart, items: 8, revenue: "$6,400", severity: "medium",
    description: "Checkout started but not completed", action: "Send cart recovery emails",
    details: [
      { name: "Growth Blueprint", value: "$297", days: 2 },
      { name: "Coaching Package", value: "$500", days: 3 },
      { name: "VIP Bundle", value: "$697", days: 1 },
    ],
  },
  {
    category: "Missed Follow-ups", icon: Mail, items: 5, revenue: "$18,500", severity: "high",
    description: "Scheduled follow-ups not executed", action: "Complete follow-ups today",
    details: [
      { name: "Green Valley Co", value: "$8,000", days: 5 },
      { name: "Bright Path Inc", value: "$6,500", days: 3 },
    ],
  },
  {
    category: "Expired Quotes", icon: FileText, items: 3, revenue: "$12,000", severity: "medium",
    description: "Proposals past expiry without response", action: "Resend with updated terms",
    details: [
      { name: "Atlas Corp", value: "$8,000", days: 10 },
      { name: "Peak Studios", value: "$4,000", days: 7 },
    ],
  },
];

export default function LeakDetector() {
  const { isDemoMode } = useDataMode();
  const { data: liveLeaks, isLoading } = useRevenueLeakItems();

  const LEAKS = isDemoMode ? DEMO_LEAKS : DEMO_LEAKS;
  const totalLeakage = LEAKS.reduce((s, l) => s + parseInt(l.revenue.replace(/[^0-9]/g, "")), 0);

  if (!isDemoMode && isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <DemoModeBadge />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-yellow-400" /> Leak Detector
        </h1>
        <p className="text-sm text-muted-foreground">Where revenue is leaking — abandoned carts, stale leads, missed follow-ups</p>
      </motion.div>

      <Card className="bg-red-500/5 border-red-500/20">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-red-400 font-medium">Total Revenue Leakage Detected</p>
          <p className="text-4xl font-bold text-red-400 mt-2">${totalLeakage.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">{LEAKS.reduce((s, l) => s + l.items, 0)} items across {LEAKS.length} categories</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {LEAKS.map((leak, i) => (
          <motion.div key={leak.category} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${leak.severity === "high" ? "bg-red-500/10" : "bg-yellow-500/10"}`}>
                      <leak.icon className={`w-5 h-5 ${leak.severity === "high" ? "text-red-400" : "text-yellow-400"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{leak.category}</p>
                        <Badge variant={leak.severity === "high" ? "destructive" : "secondary"} className="text-xs">{leak.severity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{leak.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-400">{leak.revenue}</p>
                    <p className="text-xs text-muted-foreground">{leak.items} items</p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {leak.details.map(d => (
                    <div key={d.name} className="flex items-center justify-between p-2 rounded bg-muted/10">
                      <span className="text-sm text-foreground">{d.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{d.days}d</span>
                        <span className="text-sm font-medium text-foreground">{d.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" size="sm" className="w-full text-primary">
                  {leak.action} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
