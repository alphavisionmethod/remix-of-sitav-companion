import { motion } from "framer-motion";
import { Target, MousePointer, Shield, Smartphone, FormInput, TrendingUp, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const CTA_ANALYSIS = [
  { page: "Homepage", cta: "Book a Free Call", clicks: 342, ctr: "8.1%", position: "Above fold", score: 92 },
  { page: "Services", cta: "Get Started", clicks: 89, ctr: "4.2%", position: "Below fold", score: 65 },
  { page: "Pricing", cta: "Choose Plan", clicks: 156, ctr: "13.0%", position: "Above fold", score: 88 },
  { page: "Blog Post", cta: "Read More", clicks: 34, ctr: "1.2%", position: "Bottom", score: 35 },
];

const TRUST_GAPS = [
  { page: "Services", gap: "No testimonials or social proof", impact: "high", fix: "Add 3+ client testimonials" },
  { page: "Checkout", gap: "Missing security badges", impact: "high", fix: "Add SSL + payment trust badges" },
  { page: "Pricing", gap: "No money-back guarantee visible", impact: "medium", fix: "Add guarantee badge near CTA" },
  { page: "About", gap: "No team photos or credentials", impact: "low", fix: "Add team section with headshots" },
];

const FUNNEL_LEAKS = [
  { step: "Landing → Services", dropoff: "38%", visitors: 4201, issue: "Weak value proposition above fold" },
  { step: "Services → Book", dropoff: "45%", visitors: 2103, issue: "CTA below fold on mobile" },
  { step: "Cart → Checkout", dropoff: "32%", visitors: 1200, issue: "Surprise shipping costs" },
  { step: "Checkout → Complete", dropoff: "28%", visitors: 890, issue: "Too many form fields" },
];

const FORM_FRICTION = [
  { page: "Contact", fields: 7, avgTime: "2m 34s", abandon: "42%", recommendation: "Reduce to 4 fields" },
  { page: "Booking", fields: 5, avgTime: "1m 12s", abandon: "18%", recommendation: "Good — minor label improvements" },
  { page: "Checkout", fields: 9, avgTime: "3m 48s", abandon: "35%", recommendation: "Add autofill, reduce to 6 fields" },
];

const MOBILE_ISSUES = [
  { page: "/services", issue: "CTA button too small on mobile (32px)", severity: "high" },
  { page: "/contact", issue: "Form layout breaks on iPhone SE", severity: "high" },
  { page: "/shop", issue: "Product images not lazy-loaded", severity: "medium" },
  { page: "/pricing", issue: "Table not responsive — horizontal scroll", severity: "medium" },
];

export default function CROOffice() {
  const { isDemoMode } = useDataMode();
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Conversion Optimization Office</h1>
        <p className="text-sm text-muted-foreground">CTA analysis, trust gaps, funnel leaks, form friction & mobile UX</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* CTA Analysis */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><MousePointer className="w-4 h-4 text-blue-400" /> CTA Analysis</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {CTA_ANALYSIS.map(c => (
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
            {TRUST_GAPS.map(t => (
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
            {FUNNEL_LEAKS.map(f => (
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
            {FORM_FRICTION.map(f => (
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
              {MOBILE_ISSUES.map(m => (
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
