import { motion } from "framer-motion";
import { Shield, TrendingDown, AlertTriangle, CheckCircle, Clock, Zap, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const mockProtections = [
  { id: "p1", action: "model-tier-downgrade", from: "premium", to: "standard", scope: "Household Smith", reason: "Budget at 92% — soft limit breach", impact: "Slightly slower synthesis", costSaved: 340, time: "4min ago", severity: "warning" as const },
  { id: "p2", action: "force-async", scope: "Acme Corp", reason: "3 concurrent premium jobs exceeded plan limit", impact: "User sees async queue notice", costSaved: 180, time: "12min ago", severity: "info" as const },
  { id: "p3", action: "compress-context", scope: "Finance Workspace", reason: "Context size 42k tokens — exceeding Class B ceiling", impact: "None visible to user", costSaved: 95, time: "18min ago", severity: "info" as const },
  { id: "p4", action: "block-premium-escalation", scope: "Solo User", reason: "Starter plan — no Class D access", impact: "User offered upgrade path", costSaved: 620, time: "1hr ago", severity: "critical" as const },
  { id: "p5", action: "pause-deep-loop", scope: "Strategy Synthesizer", reason: "Repeated expensive re-analysis with low confidence delta", impact: "Agent paused, operator notified", costSaved: 1240, time: "2hr ago", severity: "warning" as const },
  { id: "p6", action: "digest-mode-shift", scope: "Global Monitor", reason: "Proactive inference budget at 85%", impact: "Switched from real-time to digest", costSaved: 210, time: "3hr ago", severity: "info" as const },
];

const sevColors = { critical: "text-rose-400", warning: "text-amber-400", info: "text-blue-400" };
const actionIcons: Record<string, typeof Shield> = {
  "model-tier-downgrade": TrendingDown,
  "force-async": Clock,
  "compress-context": Zap,
  "block-premium-escalation": Shield,
  "pause-deep-loop": AlertTriangle,
  "digest-mode-shift": Activity,
};

export const CG04MarginProtectionTab = () => {
  const totalSaved = mockProtections.reduce((s, p) => s + p.costSaved, 0);
  const criticalCount = mockProtections.filter(p => p.severity === "critical").length;
  const warningCount = mockProtections.filter(p => p.severity === "warning").length;

  return (
    <div className="space-y-4">
      {/* Margin Risk Score Hero */}
      <Card className="bg-card/80 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Margin Risk Score
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Overall margin protection posture across all tenants</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-foreground">72</p>
              <p className="text-xs text-muted-foreground">/ 100 (Good)</p>
            </div>
          </div>
          <Progress value={72} className="h-3 mt-4" />
          <div className="grid grid-cols-4 gap-4 mt-4 text-xs text-center">
            <div className="p-2 rounded-lg bg-secondary/20">
              <p className="text-lg font-bold text-emerald-400">${(totalSaved / 100).toFixed(2)}</p>
              <p className="text-muted-foreground">Cost Saved Today</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/20">
              <p className="text-lg font-bold text-foreground">{mockProtections.length}</p>
              <p className="text-muted-foreground">Actions Taken</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/20">
              <p className="text-lg font-bold text-amber-400">{warningCount}</p>
              <p className="text-muted-foreground">Warnings</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/20">
              <p className="text-lg font-bold text-rose-400">{criticalCount}</p>
              <p className="text-muted-foreground">Critical Blocks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {/* User Experience Impact Panel */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">User Experience Impact</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Invisible protections", count: 2, desc: "Context compression, caching — no user impact", color: "text-emerald-400" },
              { label: "Minor delays", count: 2, desc: "Async shift, slower synthesis — subtle UX change", color: "text-amber-400" },
              { label: "Visible blocks", count: 1, desc: "Premium blocked with upgrade prompt", color: "text-orange-400" },
              { label: "Agent interventions", count: 1, desc: "Deep loop paused, operator notified", color: "text-rose-400" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                <div>
                  <p className={`text-xs font-medium ${item.color}`}>{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
                <span className="text-sm font-bold text-foreground">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Protection Action Cards — feed */}
        <div className="md:col-span-2">
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Margin Protection Feed</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
              {mockProtections.map((p, i) => {
                const Icon = actionIcons[p.action] || Shield;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-lg bg-secondary/20 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${sevColors[p.severity]}`} />
                        <span className="text-xs font-medium text-foreground">{p.action.replace(/-/g, " ")}</span>
                        <Badge variant={p.severity === "critical" ? "destructive" : "secondary"} className="text-[9px]">{p.severity}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{p.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.reason}</p>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Scope: <span className="text-foreground">{p.scope}</span></span>
                      <span className="text-muted-foreground">UX: <span className="text-foreground">{p.impact}</span></span>
                      <span className="text-emerald-400 font-mono">saved ${(p.costSaved / 100).toFixed(2)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confidence & Risk Breakdown */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Protection Confidence & Risk</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Budget protection", confidence: 94, risk: "low" },
              { label: "Model routing", confidence: 88, risk: "low" },
              { label: "Cache efficiency", confidence: 72, risk: "medium" },
              { label: "Deep reasoning control", confidence: 81, risk: "low" },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-lg bg-secondary/20 text-center space-y-1">
                <p className="text-xs font-medium text-foreground">{item.label}</p>
                <p className="text-xl font-bold text-foreground">{item.confidence}%</p>
                <Badge variant={item.risk === "low" ? "secondary" : "destructive"} className="text-[9px]">{item.risk} risk</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
