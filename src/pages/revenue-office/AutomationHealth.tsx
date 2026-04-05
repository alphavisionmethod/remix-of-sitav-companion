import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, Zap, RefreshCw } from "lucide-react";

const healthMetrics = [
  { label: "Success Rate", value: 94, target: 95, color: "text-emerald-400" },
  { label: "Avg Completion Time", value: 82, target: 90, color: "text-blue-400" },
  { label: "Delivery Rate", value: 97, target: 98, color: "text-emerald-400" },
  { label: "Engagement Rate", value: 68, target: 70, color: "text-amber-400" },
];

const automations = [
  { name: "Welcome Onboarding", status: "healthy", successRate: 98, triggers: 28, failures: 0, lastRun: "2hrs ago" },
  { name: "Stale Lead Recovery", status: "healthy", successRate: 94, triggers: 42, failures: 3, lastRun: "1hr ago" },
  { name: "Post-Service Review", status: "healthy", successRate: 96, triggers: 35, failures: 1, lastRun: "4hrs ago" },
  { name: "Quote Follow-up", status: "warning", successRate: 82, triggers: 12, failures: 2, lastRun: "6hrs ago" },
  { name: "Nurture Sequence B", status: "warning", successRate: 76, triggers: 89, failures: 21, lastRun: "30min ago" },
  { name: "Lead Assignment", status: "error", successRate: 60, triggers: 15, failures: 6, lastRun: "45min ago" },
  { name: "Upsell After Delivery", status: "underperforming", successRate: 88, triggers: 8, failures: 1, lastRun: "1day ago" },
];

const statusIcon = { healthy: CheckCircle, warning: AlertTriangle, error: XCircle, underperforming: TrendingUp };
const statusColor = { healthy: "text-emerald-400", warning: "text-amber-400", error: "text-red-400", underperforming: "text-blue-400" };

export default function AutomationHealth() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Automation Health Monitor</h1>
        <p className="text-muted-foreground">Track success, failures, delays, fatigue, and performance across all automations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {healthMetrics.map((m) => (
          <Card key={m.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}%</p>
              <Progress value={m.value} className="h-1 mt-2" />
              <p className="text-[10px] text-muted-foreground mt-1">Target: {m.target}%</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="h-5 w-5 text-blue-400" />Automation Status</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {automations.map((a) => {
            const Icon = statusIcon[a.status as keyof typeof statusIcon];
            const color = statusColor[a.status as keyof typeof statusColor];
            return (
              <div key={a.name} className="p-3 rounded-lg bg-background/50 border border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.triggers} triggers · {a.failures} failures · Last: {a.lastRun}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${a.successRate >= 90 ? "text-emerald-400" : a.successRate >= 75 ? "text-amber-400" : "text-red-400"}`}>{a.successRate}%</span>
                  <Badge variant={a.status === "error" ? "destructive" : a.status === "warning" ? "secondary" : "default"} className="text-[10px]">{a.status}</Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
