import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield, ShieldCheck, Lock, AlertTriangle, Users, Zap, Settings,
  Mail, Phone, FileText, DollarSign, Calendar, Brain, Clock, Target,
  CheckCircle, XCircle, Eye
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_humanVsAI, DEMO_policies, DEMO_trustLevels } from "@/lib/demo-data/revenue-office";

export default function AutomationPolicy() {
  const { isDemoMode } = useDataMode();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-emerald-400" />Automation Policy Center</h1>
        <p className="text-muted-foreground">Trust boundaries, safety rules, human-AI controls, escalation DEMO_policies, and compliance governance</p>
      </div>

      {/* Trust Level Overview */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-emerald-400" />Trust Level Distribution</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-3">
          {DEMO_trustLevels.map((t) => (
            <div key={t.level} className={`p-3 rounded-lg bg-background/50 border ${t.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <t.icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-foreground">{t.level}</p>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">{t.desc}</p>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="secondary" className="text-[10px]">{t.automations} automations</Badge>
                <span className="text-xs text-muted-foreground">{t.pct}%</span>
              </div>
              <Progress value={t.pct} className="h-1" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Human vs AI Boundary */}
      <Card className="bg-card/50 border-primary/20 border">
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Brain className="h-4 w-4 text-primary" />Human vs AI Boundary Recommendations</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {DEMO_humanVsAI.map((item) => (
            <div key={item.domain} className="p-2 rounded bg-background/50 border border-border/30 flex items-center justify-between">
              <div className="flex-1">
                <span className="text-xs text-foreground font-medium">{item.domain}</span>
                <span className="text-[10px] text-muted-foreground ml-3">{item.reason}</span>
              </div>
              <Badge className={`text-[10px] ${
                item.recommendation.includes("Human only") ? "bg-purple-500/10 text-purple-400" :
                item.recommendation.includes("Full automation") ? "bg-emerald-500/10 text-emerald-400" :
                item.recommendation.includes("Auto-run") ? "bg-blue-500/10 text-blue-400" :
                "bg-amber-500/10 text-amber-400"
              }`}>{item.recommendation}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Policy Rules by Category */}
      {DEMO_policies.map((p) => (
        <Card key={p.category} className="bg-card/50 border-border/50">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><p.icon className="h-4 w-4 text-blue-400" />{p.category}</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {p.rules.map((r, i) => (
              <div key={i} className="p-2 rounded bg-background/50 border border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-foreground">{r.rule}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.violations > 0 && <span className="text-[10px] text-amber-400">{r.violations} violation{r.violations > 1 ? "s" : ""}</span>}
                  <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">{r.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
