import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown, Users, Star, Zap, Calendar, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const DEMO_memoryEvents = [
  { time: "2 hours ago", title: "Campaign 'Spring Growth' conversion rate dropped 3%", type: "campaign", severity: "medium", icon: TrendingDown, color: "text-amber-400" },
  { time: "5 hours ago", title: "New review: 5★ from Apex Coaching Co.", type: "reputation", severity: "low", icon: Star, color: "text-emerald-400" },
  { time: "8 hours ago", title: "Lead stage drift: 8 leads stuck in 'Proposal Sent' >14 days", type: "crm", severity: "high", icon: AlertTriangle, color: "text-red-400" },
  { time: "12 hours ago", title: "Booking utilization increased to 78% (was 65%)", type: "booking", severity: "low", icon: Calendar, color: "text-blue-400" },
  { time: "1 day ago", title: "Retention Advisor stance changed: churn risk elevated for Starter tier", type: "advisor", severity: "medium", icon: Users, color: "text-purple-400" },
  { time: "1 day ago", title: "Funnel 'Free Consultation' checkout abandonment up 12%", type: "funnel", severity: "high", icon: TrendingDown, color: "text-red-400" },
  { time: "2 days ago", title: "'Business Growth Masterclass' enrollment +15 this week", type: "membership", severity: "low", icon: TrendingUp, color: "text-emerald-400" },
  { time: "2 days ago", title: "Offer 'Pro Coaching Package' conversion steady at 24%", type: "offer", severity: "low", icon: Package, color: "text-blue-400" },
  { time: "3 days ago", title: "Email deliverability improved: bounce rate 0.8% (was 2.1%)", type: "campaign", severity: "low", icon: CheckCircle, color: "text-emerald-400" },
  { time: "3 days ago", title: "3 no-shows yesterday — above 7-day average", type: "booking", severity: "medium", icon: AlertTriangle, color: "text-amber-400" },
];

const typeLabels: Record<string, string> = { campaign: "Campaign", reputation: "Reputation", crm: "CRM", booking: "Booking", advisor: "Advisor", funnel: "Funnel", membership: "Membership", offer: "Offer" };

export default function CommercialMemoryFeed() {
  const { isDemoMode } = useDataMode();
  const memoryEvents = isDemoMode ? DEMO_memoryEvents : DEMO_memoryEvents;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Commercial Memory Feed</h1>
        <p className="text-muted-foreground">A living stream of what changed across growth, conversion, churn, reputation, and trust</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{memoryEvents.length}</p><p className="text-xs text-muted-foreground">Events (7 days)</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-400">{memoryEvents.filter(e => e.severity === "high").length}</p><p className="text-xs text-muted-foreground">High Severity</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-400">{memoryEvents.filter(e => e.severity === "low").length}</p><p className="text-xs text-muted-foreground">Positive Signals</p></CardContent></Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Memory Stream</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {memoryEvents.map((e, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
              <e.icon className={`h-4 w-4 mt-0.5 ${e.color}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground">{e.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{typeLabels[e.type]}</Badge>
                    {e.severity === "high" && <Badge variant="destructive" className="text-[10px]">High</Badge>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{e.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
