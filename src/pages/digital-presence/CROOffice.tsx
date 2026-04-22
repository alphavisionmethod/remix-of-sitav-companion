import { motion } from "framer-motion";
import { Target, MousePointer, Shield, Smartphone, FormInput, TrendingUp, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DEMO_CTA_ANALYSIS, DEMO_FORM_FRICTION, DEMO_FUNNEL_LEAKS, DEMO_MOBILE_ISSUES, DEMO_TRUST_GAPS } from "@/data/seed/digital-presence";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

export default function CROOffice() {
  const { isDemoMode } = useDataMode();
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Conversion Optimization Office</h1>
        <p className="text-sm text-muted-foreground">CTA analysis, trust gaps, funnel leaks, form friction & mobile UX</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* CTA Analysis */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><MousePointer className="w-4 h-4 text-blue-400" /> CTA Analysis</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {DEMO_CTA_ANALYSIS.map(c => (
              <div key={c.page + c.cta} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="text-xs font-medium text-foreground">{c.cta}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">on {c.page}</span>
                  <p className="text-[10px] text-muted-foreground">{c.position} · {c.clicks} clicks · {c.ctr} CTR</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12"><Progress value={c.score} className="h-1.5" /></div>
                  <span className={`text-[10px] font-bold ${c.score >= 80 ? "text-green-400" : c.score >= 50 ? "text-amber-400" : "text-red-400"}`}>{c.score}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Trust Gaps */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-amber-400" /> Trust Gaps</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {DEMO_TRUST_GAPS.map(t => (
              <div key={t.page + t.gap} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{t.page}</span>
                  <Badge variant={t.impact === "high" ? "destructive" : "secondary"} className="text-[10px]">{t.impact}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{t.gap}</p>
                <p className="text-[10px] text-primary mt-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> {t.fix}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Funnel Leaks */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-red-400" /> Funnel Leaks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {DEMO_FUNNEL_LEAKS.map(f => (
              <div key={f.step} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground flex items-center gap-1">{f.step.split(" → ").join(" ")} <ArrowRight className="w-3 h-3 inline" /> {""}</span>
                  <span className="text-sm font-bold text-red-400">{f.dropoff} drop</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{f.visitors.toLocaleString()} visitors · {f.issue}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Form Friction */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FormInput className="w-4 h-4 text-purple-400" /> Form Friction</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {DEMO_FORM_FRICTION.map(f => (
              <div key={f.page} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{f.page} Form</span>
                  <span className="text-[10px] text-red-400">{f.abandon} abandon rate</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{f.fields} fields · {f.avgTime} avg completion</p>
                <p className="text-[10px] text-primary mt-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> {f.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mobile Issues */}
        <Card className="bg-card/50 border-border/50 lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Smartphone className="w-4 h-4 text-cyan-400" /> Mobile UX Issues</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {DEMO_MOBILE_ISSUES.map(m => (
                <div key={m.page + m.issue} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{m.page}</span>
                    <Badge variant={m.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">{m.severity}</Badge>
                  </div>
                  <p className="text-xs text-foreground">{m.issue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
