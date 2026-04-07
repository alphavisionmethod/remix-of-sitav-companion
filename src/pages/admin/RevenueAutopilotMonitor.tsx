import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, DollarSign, ArrowUpRight, RefreshCw, Zap, Target, CheckCircle, AlertTriangle } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const fadeUp = {
  hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const DEMO_AUTOPILOT_ACTIONS = [
  { id: "ra-1", action: "Re-engagement email to 12 dormant leads", result: "3 reopened conversations", value: "$2,400", confidence: 0.85, status: "completed" as const },
  { id: "ra-2", action: "Pricing optimization suggestion for Premium tier", result: "Pending approval", value: "$800/mo est.", confidence: 0.72, status: "pending" as const },
  { id: "ra-3", action: "Churn risk mitigation — 2 at-risk accounts contacted", result: "1 saved, 1 pending", value: "$1,200", confidence: 0.68, status: "active" as const },
  { id: "ra-4", action: "Upsell recommendation for 5 qualified accounts", result: "2 accepted", value: "$3,100", confidence: 0.91, status: "completed" as const },
];

const DEMO_WINBACKS = [
  { name: "Acme Corp", lostRevenue: 2400, probability: 0.65, lastContact: "12d ago" },
  { name: "StartupXYZ", lostRevenue: 800, probability: 0.45, lastContact: "30d ago" },
  { name: "TechFlow Inc", lostRevenue: 1600, probability: 0.78, lastContact: "5d ago" },
];

const statusColor = { completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", pending: "bg-amber-500/10 text-amber-500 border-amber-500/20", active: "bg-blue-500/10 text-blue-500 border-blue-500/20" };

const RevenueAutopilotMonitor = () => {
  const totalRecovered = 6700;
  const totalSaved = 3200;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Revenue Autopilot
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Automated revenue recovery, optimization, and win-back visibility</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Recovered Value", value: `$${totalRecovered.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500" },
            { label: "Cost Saved", value: `$${totalSaved.toLocaleString()}`, icon: TrendingUp, color: "text-blue-500" },
            { label: "Autopilot Actions", value: String(DEMO_AUTOPILOT_ACTIONS.length), icon: Zap, color: "text-primary" },
            { label: "Win-Back Queue", value: String(DEMO_WINBACKS.length), icon: Target, color: "text-amber-500" },
          ].map(m => (
            <Card key={m.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-2 mb-1"><m.icon className={`h-4 w-4 ${m.color}`} /><span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{m.label}</span></div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Autopilot Actions */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Autopilot Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {DEMO_AUTOPILOT_ACTIONS.map(a => (
                <div key={a.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">{a.action}</span>
                    <Badge variant="outline" className={`text-[9px] ${statusColor[a.status]}`}>{a.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Result: <span className="text-foreground">{a.result}</span></span>
                    <span>Value: <span className="text-emerald-500 font-medium">{a.value}</span></span>
                    <span>Confidence: <span className={a.confidence > 0.8 ? "text-emerald-500" : "text-amber-500"}>{(a.confidence * 100).toFixed(0)}%</span></span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Win-Back Queue */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Win-Back Opportunities</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {DEMO_WINBACKS.map(w => (
                <div key={w.name} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{w.name}</p>
                    <p className="text-[10px] text-muted-foreground">Lost: ${w.lostRevenue} · Last contact: {w.lastContact}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[9px] ${w.probability > 0.6 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                      {(w.probability * 100).toFixed(0)}% likely
                    </Badge>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]">Engage</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RevenueAutopilotMonitor;
