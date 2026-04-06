import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Activity, CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, Zap,
  RefreshCw, Users, Mail, Phone, Heart, Shield, Brain, BarChart3, Target
} from "lucide-react";
import { useState } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const healthMetrics = [
  { label: "Overall Health", value: 94, target: 95, color: "text-emerald-400", icon: Activity },
  { label: "Success Rate", value: 91, target: 90, color: "text-emerald-400", icon: CheckCircle },
  { label: "Delivery Rate", value: 97, target: 98, color: "text-emerald-400", icon: Mail },
  { label: "Engagement Rate", value: 68, target: 70, color: "text-amber-400", icon: Target },
  { label: "Conversion Rate", value: 24, target: 25, color: "text-blue-400", icon: TrendingUp },
  { label: "Fatigue Score", value: 12, target: 10, color: "text-amber-400", icon: AlertTriangle },
];

const automations = [
  { name: "Welcome Onboarding (7-step)", status: "healthy", successRate: 98, triggers: 28, failures: 0, lastRun: "2hrs ago", contacts: 112, revenue: "—", trend: [95, 96, 97, 98], category: "Onboarding" },
  { name: "Stale Lead Recovery (48hr)", status: "healthy", successRate: 94, triggers: 42, failures: 3, lastRun: "1hr ago", contacts: 156, revenue: "$12,400", trend: [88, 90, 92, 94], category: "Lead Recovery" },
  { name: "Post-Service Review Request", status: "healthy", successRate: 96, triggers: 35, failures: 1, lastRun: "4hrs ago", contacts: 220, revenue: "—", trend: [92, 94, 95, 96], category: "Reputation" },
  { name: "Post-Call Follow-up", status: "healthy", successRate: 89, triggers: 22, failures: 2, lastRun: "30min ago", contacts: 88, revenue: "$15,000", trend: [85, 86, 88, 89], category: "Sales" },
  { name: "Quote Follow-up (3/5/7 day)", status: "warning", successRate: 82, triggers: 12, failures: 2, lastRun: "6hrs ago", contacts: 34, revenue: "$4,800", trend: [88, 85, 83, 82], category: "Sales" },
  { name: "Nurture Sequence (14-day)", status: "warning", successRate: 76, triggers: 89, failures: 21, lastRun: "30min ago", contacts: 340, revenue: "$6,800", trend: [82, 80, 78, 76], category: "Nurture" },
  { name: "Abandoned Checkout Recovery", status: "healthy", successRate: 88, triggers: 22, failures: 3, lastRun: "2hrs ago", contacts: 64, revenue: "$7,200", trend: [84, 85, 87, 88], category: "Sales" },
  { name: "Lead Assignment Engine", status: "error", successRate: 60, triggers: 15, failures: 6, lastRun: "45min ago", contacts: 15, revenue: "—", trend: [78, 72, 65, 60], category: "Operations" },
  { name: "Upsell After Delivery", status: "underperforming", successRate: 43, triggers: 14, failures: 1, lastRun: "1day ago", contacts: 38, revenue: "$5,600", trend: [48, 46, 44, 43], category: "Growth" },
  { name: "Churn Prevention Check-in", status: "warning", successRate: 50, triggers: 8, failures: 0, lastRun: "8hrs ago", contacts: 22, revenue: "$3,100", trend: [55, 53, 51, 50], category: "Retention" },
  { name: "Reactivation Campaign (90-day)", status: "healthy", successRate: 85, triggers: 34, failures: 5, lastRun: "3hrs ago", contacts: 78, revenue: "$2,800", trend: [80, 82, 84, 85], category: "Growth" },
  { name: "No-Show Rescue + Rebook", status: "healthy", successRate: 92, triggers: 18, failures: 1, lastRun: "5hrs ago", contacts: 48, revenue: "$4,200", trend: [88, 89, 91, 92], category: "Booking" },
];

const fatigueAlerts = [
  { contact: "Sarah Chen", automations: 4, messagesThisWeek: 7, risk: "high", action: "Pause non-critical sequences for 7 days" },
  { contact: "Marcus Johnson", automations: 3, messagesThisWeek: 5, risk: "medium", action: "Reduce to 1 message per 3 days" },
  { contact: "Emily Rodriguez", automations: 2, messagesThisWeek: 6, risk: "high", action: "Remove from nurture, keep only appointment reminders" },
];

const advisorInsights = [
  { advisor: "Campaign Advisor", insight: "Nurture Sequence engagement drops 40% at email 4. Test shorter 3-email variant or change topic at email 4.", action: "Create A/B test" },
  { advisor: "Revenue Ops Advisor", insight: "Lead Assignment Engine failing due to missing 'enterprise' segment rule. 5 leads unassigned since yesterday.", action: "Fix rule now" },
  { advisor: "Retention Advisor", insight: "Churn Prevention check-ins have only 50% open rate. Switch to SMS for initial touch — similar businesses see 78% read rate.", action: "Generate SMS variant" },
  { advisor: "Offer Advisor", insight: "Upsell After Delivery at 43% — well below benchmark. Content may be too generic. Test personalized upsells based on service type.", action: "Personalize templates" },
];

const statusIcon = { healthy: CheckCircle, warning: AlertTriangle, error: XCircle, underperforming: TrendingUp };
const statusColor = { healthy: "text-emerald-400", warning: "text-amber-400", error: "text-red-400", underperforming: "text-blue-400" };

export default function AutomationHealth() {
  const [tab, setTab] = useState("all");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Activity className="h-6 w-6 text-blue-400" />Automation Health Monitor</h1>
        <p className="text-muted-foreground">Track success, failures, delays, fatigue, engagement, and conversion across all automations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {healthMetrics.map((m) => (
          <Card key={m.label} className="bg-card/50 border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}{m.label === "Fatigue Score" ? "" : "%"}</p>
              <Progress value={m.label === "Fatigue Score" ? 100 - m.value : m.value} className="h-1 mt-1" />
              <p className="text-[10px] text-muted-foreground mt-0.5">Target: {m.target}{m.label === "Fatigue Score" ? " max" : "%"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advisor Insights */}
      <Card className="bg-card/50 border-primary/20 border">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-primary" />Advisor Health Insights</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          {advisorInsights.map((a, i) => (
            <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/30">
              <Badge variant="secondary" className="text-[10px] mb-1">{a.advisor}</Badge>
              <p className="text-xs text-foreground mb-2">{a.insight}</p>
              <button className="px-3 py-1 rounded bg-primary/10 text-primary text-[10px] font-medium">{a.action}</button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Automation List */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card/50">
          <TabsTrigger value="all">All ({automations.length})</TabsTrigger>
          <TabsTrigger value="healthy">Healthy ({automations.filter(a => a.status === "healthy").length})</TabsTrigger>
          <TabsTrigger value="issues">Issues ({automations.filter(a => a.status !== "healthy").length})</TabsTrigger>
          <TabsTrigger value="fatigue">Fatigue Alerts ({fatigueAlerts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2">
          {automations.map((a) => {
            const Icon = statusIcon[a.status as keyof typeof statusIcon];
            const color = statusColor[a.status as keyof typeof statusColor];
            return (
              <Card key={a.name} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors cursor-pointer">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                        <span>{a.triggers}x triggered</span>
                        <span>{a.failures} failures</span>
                        <span>{a.contacts} contacts</span>
                        <span>Last: {a.lastRun}</span>
                        {a.revenue !== "—" && <span className="text-emerald-400">{a.revenue}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="flex gap-0.5">
                      {a.trend.map((v, i) => (
                        <div key={i} className="w-1.5 bg-muted rounded-full overflow-hidden" style={{ height: 20 }}>
                          <div className={`w-full rounded-full ${v >= 90 ? "bg-emerald-400" : v >= 70 ? "bg-amber-400" : "bg-red-400"}`} style={{ height: `${v}%`, marginTop: `${100 - v}%` }} />
                        </div>
                      ))}
                    </div>
                    <span className={`text-sm font-bold ${a.successRate >= 90 ? "text-emerald-400" : a.successRate >= 70 ? "text-amber-400" : "text-red-400"}`}>{a.successRate}%</span>
                    <Badge variant={a.status === "error" ? "destructive" : a.status === "warning" ? "secondary" : "default"} className="text-[10px]">{a.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="healthy" className="space-y-2">
          {automations.filter(a => a.status === "healthy").map((a) => (
            <Card key={a.name} className="bg-card/50 border-border/50"><CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /><span className="text-sm text-foreground">{a.name}</span></div>
              <span className="text-sm font-bold text-emerald-400">{a.successRate}%</span>
            </CardContent></Card>
          ))}
        </TabsContent>

        <TabsContent value="issues" className="space-y-2">
          {automations.filter(a => a.status !== "healthy").map((a) => {
            const Icon = statusIcon[a.status as keyof typeof statusIcon];
            const color = statusColor[a.status as keyof typeof statusColor];
            return (
              <Card key={a.name} className="bg-card/50 border-border/50"><CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${color}`} /><div><p className="text-sm text-foreground">{a.name}</p><p className="text-[10px] text-muted-foreground">{a.triggers}x triggered · {a.failures} failures</p></div></div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${color}`}>{a.successRate}%</span>
                  <button className="px-3 py-1 rounded bg-primary/10 text-primary text-[10px]">Investigate</button>
                </div>
              </CardContent></Card>
            );
          })}
        </TabsContent>

        <TabsContent value="fatigue" className="space-y-2">
          {fatigueAlerts.map((f, i) => (
            <Card key={i} className="bg-card/50 border-border/50"><CardContent className="p-3 flex items-center justify-between">
              <div><p className="text-sm text-foreground">{f.contact}</p><p className="text-[10px] text-muted-foreground">{f.automations} active automations · {f.messagesThisWeek} messages this week</p></div>
              <div className="flex items-center gap-2">
                <Badge variant={f.risk === "high" ? "destructive" : "secondary"} className="text-[10px]">{f.risk}</Badge>
                <span className="text-[10px] text-foreground">{f.action}</span>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
