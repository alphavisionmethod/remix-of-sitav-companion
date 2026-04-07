import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp, AlertTriangle, Lightbulb, Users, CheckCircle, HelpCircle, ArrowRight } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

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
  const { isDemoMode } = useDataMode();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Chief Revenue Synthesis</h1>
        <p className="text-muted-foreground">Executive summary — where advisors align, disagree, and what matters most right now</p>
      </div>

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
    </motion.div>
  );
}
