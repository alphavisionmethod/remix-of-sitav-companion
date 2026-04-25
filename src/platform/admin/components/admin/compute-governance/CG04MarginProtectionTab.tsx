import { motion } from "framer-motion";
import { Shield, TrendingDown, AlertTriangle, Clock, Zap, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMarginProtectionFeed, type MarginProtectionEvent } from "@/hooks/use-compute-governance";

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
  const { data: protections = [], isLoading } = useMarginProtectionFeed();

  const totalSaved = protections.reduce((s, p) => s + p.costSaved, 0);
  const criticalCount = protections.filter(p => p.severity === "critical").length;
  const warningCount = protections.filter(p => p.severity === "warning").length;

  const uxImpactCategories = categorizeUXImpact(protections);

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
              <p className="text-4xl font-bold text-foreground">{computeRiskScore(protections)}</p>
              <p className="text-xs text-muted-foreground">/ 100 ({getRiskLabel(computeRiskScore(protections))})</p>
            </div>
          </div>
          <Progress value={computeRiskScore(protections)} className="h-3 mt-4" />
          <div className="grid grid-cols-4 gap-4 mt-4 text-xs text-center">
            <div className="p-2 rounded-lg bg-secondary/20">
              <p className="text-lg font-bold text-emerald-400">${(totalSaved / 100).toFixed(2)}</p>
              <p className="text-muted-foreground">Cost Saved Today</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/20">
              <p className="text-lg font-bold text-foreground">{protections.length}</p>
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
            {uxImpactCategories.map(item => (
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
              {isLoading ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Loading protection events…</p>
              ) : protections.map((p, i) => {
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
              { label: "Budget protection", confidence: Math.min(100, 70 + Math.round(totalSaved / 50)), risk: criticalCount === 0 ? "low" : "medium" },
              { label: "Model routing", confidence: protections.filter(p => p.action === "model-tier-downgrade").length > 3 ? 65 : 88, risk: "low" },
              { label: "Cache efficiency", confidence: 72, risk: "medium" },
              { label: "Deep reasoning control", confidence: protections.filter(p => p.action === "pause-deep-loop").length > 2 ? 60 : 81, risk: "low" },
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

// ── Helpers ──────────────────────────────────────────────────

function computeRiskScore(protections: MarginProtectionEvent[]): number {
  if (protections.length === 0) return 85;
  const critical = protections.filter(p => p.severity === "critical").length;
  const warning = protections.filter(p => p.severity === "warning").length;
  return Math.max(0, Math.min(100, 85 - critical * 12 - warning * 4));
}

function getRiskLabel(score: number): string {
  if (score >= 80) return "Good";
  if (score >= 60) return "Moderate";
  if (score >= 40) return "Elevated";
  return "Critical";
}

function categorizeUXImpact(protections: MarginProtectionEvent[]) {
  const invisible = protections.filter(p => ["compress-context", "digest-mode-shift"].includes(p.action)).length;
  const minor = protections.filter(p => ["force-async", "model-tier-downgrade"].includes(p.action)).length;
  const visible = protections.filter(p => p.action === "block-premium-escalation").length;
  const agent = protections.filter(p => p.action === "pause-deep-loop").length;

  return [
    { label: "Invisible protections", count: invisible, desc: "Context compression, caching — no user impact", color: "text-emerald-400" },
    { label: "Minor delays", count: minor, desc: "Async shift, slower synthesis — subtle UX change", color: "text-amber-400" },
    { label: "Visible blocks", count: visible, desc: "Premium blocked with upgrade prompt", color: "text-orange-400" },
    { label: "Agent interventions", count: agent, desc: "Deep loop paused, operator notified", color: "text-rose-400" },
  ];
}
