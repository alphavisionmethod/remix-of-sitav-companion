import { Typography } from "@/components/sita/Typography";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp, AlertTriangle, Lightbulb, Users, CheckCircle, HelpCircle, ArrowRight, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const synthesis = {
  confidence: 76,
  biggestLeak: "45% of leads receive no follow-up within 24hrs — estimated $12,400/mo leakage",
  biggestOpportunity: "23 happy clients ready for review requests — trust multiplier with low effort",
  highestPriority: "Fix lead follow-up automation before launching Summer campaign",
  alignment: [
    "All advisors agree: follow-up speed is the #1 fixable weakness",
    "Funnel and Campaign advisors align on landing page quality being strong",
    "Retention and CRM advisors agree onboarding improvements are working",
  ],
  disagreements: [
    { topic: "Pricing change timing", advisors: "Offer Advisor vs Campaign Advisor", detail: "Offer Advisor wants to test $49 tier now; Campaign Advisor says wait until after Summer launch" },
    { topic: "Referral program priority", advisors: "Revenue Strategist vs Retention Advisor", detail: "Strategist wants aggressive referral push; Retention says focus on existing client satisfaction first" },
  ],
  needsReview: [
    "Summer campaign targeting — is the audience fresh enough?",
    "Booking capacity — can the team handle +40% if auto-booking is enabled?",
    "Course drop-off at Module 4 — is content or pacing the issue?",
  ],
};

export default function ChiefRevenueSynthesis() {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<div>
        <Typography role="appTitle" className="flex items-center gap-2"><Crown className="h-6 w-6 text-amber-400" /> Chief Revenue Synthesis</Typography>
        <p className="text-muted-foreground">Executive summary — where advisors align, disagree, and what matters most</p>
      </div>

      {/* Current Synthesis */}
      <Card className="bg-card/50 border-primary/20 border">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="h-6 w-6 text-amber-400" />
            <div>
              <p className="font-semibold text-foreground">Chief Revenue Strategist</p>
              <p className="text-xs text-muted-foreground">Board confidence: <span className="text-foreground">{synthesis.confidence}%</span></p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-1 mb-1"><AlertTriangle className="h-4 w-4 text-red-400" /><span className="text-xs font-medium text-red-400">Biggest Leak</span></div>
              <p className="text-xs text-foreground">{synthesis.biggestLeak}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-1 mb-1"><Lightbulb className="h-4 w-4 text-emerald-400" /><span className="text-xs font-medium text-emerald-400">Biggest Opportunity</span></div>
              <p className="text-xs text-foreground">{synthesis.biggestOpportunity}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-center gap-1 mb-1"><ArrowRight className="h-4 w-4 text-blue-400" /><span className="text-xs font-medium text-blue-400">Highest Priority</span></div>
              <p className="text-xs text-foreground">{synthesis.highestPriority}</p>
            </div>
          </div>

          {/* Actionable Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate("/revenue-office/leaks")}><AlertTriangle className="w-3 h-3 mr-1" />Fix Leaks</Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate("/revenue-office/opportunities")}><Lightbulb className="w-3 h-3 mr-1" />View Opportunities</Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate("/revenue-office/advisors")}><Users className="w-3 h-3 mr-1" />Open Advisor Board</Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate("/revenue-office/decisions")}><Target className="w-3 h-3 mr-1" />Decision Theater</Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-400" />Board Alignment</p>
              {synthesis.alignment.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground mb-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />{a}</div>
              ))}
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-400" />Disagreements</p>
              {synthesis.disagreements.map((d, i) => (
                <div key={i} className="p-2 rounded bg-background/50 border border-border/30 mb-2">
                  <p className="text-xs font-medium text-foreground">{d.topic}</p>
                  <p className="text-[11px] text-muted-foreground">{d.advisors}: {d.detail}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1"><HelpCircle className="h-3 w-3 text-blue-400" />Needs Review Before Acting</p>
              {synthesis.needsReview.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground mb-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />{r}</div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Synthesis Comparison */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-purple-400" /> Historical Synthesis Comparison</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {([] as any[]).map((h, i) => (
            <div key={i} className="p-4 rounded-xl border border-border/40 bg-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{h.date}</span>
                  <Badge variant="outline" className="text-[10px]">Score: {h.score}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Progress value={h.score} className="h-1.5 w-20" />
                  {i > 0 && (
                    <span className={`text-[10px] font-medium ${h.score > DEMO_CHIEF_HISTORICAL[i - 1].score ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                      {h.score > DEMO_CHIEF_HISTORICAL[i - 1].score ? "↑" : "↓"}{Math.abs(h.score - DEMO_CHIEF_HISTORICAL[i - 1].score)}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-foreground">{h.synthesis}</p>
            </div>
          ))}
          <div className="pt-2 text-center">
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate("/revenue-office/time-machine")}>
              View Full Time Machine <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
