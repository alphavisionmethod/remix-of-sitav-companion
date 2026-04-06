import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gauge, Brain, Activity, CircleDot, Layers, MapPin, Heart, Phone, Users, AlertTriangle, Star, MessageSquare, TrendingUp, Link2, FileText, Target } from "lucide-react";
import type { OnboardingState } from "./types";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

export default function LiveOfficeSidebar({ state, stage }: { state: OnboardingState; stage: number }) {
  const insights = useMemo(() => {
    const items: { icon: any; text: string; type: "detected" | "ready" | "warning" | "opportunity" }[] = [];
    if (state.businessTypes.length > 1) items.push({ icon: Layers, text: `Hybrid model: ${state.businessTypes.length} types`, type: "detected" });
    if (state.businessTypes.includes("service") && state.revenueSources.includes("proposals")) items.push({ icon: Brain, text: "Proposal-driven service flow", type: "detected" });
    if (state.businessTypes.includes("local")) items.push({ icon: MapPin, text: "Local discovery + reputation engine", type: "detected" });
    if (state.businessTypes.includes("coaching") && state.revenueSources.includes("memberships")) items.push({ icon: Heart, text: "Coaching + membership hybrid", type: "detected" });
    if (state.preBuyBehavior.includes("book_call") && state.whatCloses.includes("call")) items.push({ icon: Phone, text: "Call-centric motion — Call Desk priority", type: "detected" });
    if (state.leadSources.includes("referrals")) items.push({ icon: Users, text: "Referral-dependent — relationship tracking on", type: "detected" });
    if (state.postSaleSlips.includes("onboarding")) items.push({ icon: AlertTriangle, text: "Onboarding gap — automation opportunity", type: "warning" });
    if (state.postSaleSlips.includes("reviews")) items.push({ icon: Star, text: "Review gap — reputation automation recommended", type: "opportunity" });
    if (state.postSaleSlips.includes("followup")) items.push({ icon: MessageSquare, text: "Follow-up slips — nurture priority", type: "warning" });
    if (state.growthBottlenecks.includes("no_shows")) items.push({ icon: Phone, text: "No-show problem — rescue flow critical", type: "warning" });
    if (state.growthBottlenecks.includes("lead_followup")) items.push({ icon: TrendingUp, text: "Lead follow-up gap — $8K+ at risk", type: "warning" });
    if (state.connectedSystems.length > 0) items.push({ icon: Link2, text: `${state.connectedSystems.length} systems to connect`, type: "ready" });
    if (state.uploadedArtifacts.length > 0) items.push({ icon: FileText, text: `${state.uploadedArtifacts.length} materials for SITA`, type: "ready" });
    if (state.journeyTemplate) items.push({ icon: Target, text: "Journey Twin forming", type: "ready" });
    return items;
  }, [state]);

  const readiness = useMemo(() => {
    let s = 0;
    if (state.businessName) s += 8;
    if (state.businessTypes.length > 0) s += 10;
    if (state.revenueSources.length > 0) s += 12;
    if (state.leadSources.length > 0) s += 10;
    if (state.journeyTemplate) s += 15;
    if (state.postSaleSteps.length > 0) s += 10;
    if (state.connectedSystems.length > 0) s += 10;
    if (state.automationLevel) s += 10;
    if (state.selectedFirstWins.length > 0) s += 15;
    return Math.min(s, 100);
  }, [state]);

  const advisors = useMemo(() => [
    { name: "Revenue Strategist", active: stage >= 3 },
    { name: "CRM Advisor", active: state.leadSources.length > 0 },
    { name: "Funnel Advisor", active: state.journeyTemplate !== "" },
    { name: "Retention Advisor", active: state.postSaleSlips.length > 0 },
    { name: "Reputation Advisor", active: state.postSaleSlips.includes("reviews") || state.businessTypes.includes("local") },
    { name: "Automation Advisor", active: stage >= 16 },
  ], [state, stage]);

  if (stage === 0 || stage >= 18) return null;

  const colorMap = { detected: "bg-primary/10 text-primary", ready: "bg-blue-500/10 text-blue-400", warning: "bg-amber-500/10 text-amber-400", opportunity: "bg-emerald-500/10 text-emerald-400" };
  const iconColorMap = { detected: "text-primary", ready: "text-blue-400", warning: "text-amber-400", opportunity: "text-emerald-400" };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block w-72 flex-shrink-0">
      <DemoModeBadge />
      <div className="sticky top-28 space-y-4">
        <Card className="bg-card/60 border-border/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Gauge className="h-3.5 w-3.5 text-primary" /><p className="text-[11px] font-semibold text-foreground">Revenue Office Forming</p></div>
            <Progress value={readiness} className="h-1.5 mb-1.5" />
            <p className="text-[10px] text-muted-foreground">{readiness}% personalized</p>
          </CardContent>
        </Card>

        {insights.length > 0 && (
          <Card className="bg-card/60 border-border/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3"><Brain className="h-3.5 w-3.5 text-primary" /><p className="text-[11px] font-semibold text-foreground">SITA Noticed</p></div>
              <div className="space-y-2">
                {insights.slice(0, 6).map((ins, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-2">
                    <div className={`p-1 rounded ${colorMap[ins.type].split(" ")[0]}`}><ins.icon className={`h-3 w-3 ${iconColorMap[ins.type]}`} /></div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{ins.text}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card/60 border-border/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3"><Activity className="h-3.5 w-3.5 text-primary" /><p className="text-[11px] font-semibold text-foreground">Advisor Board</p></div>
            <div className="space-y-1.5">
              {advisors.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CircleDot className={`h-2.5 w-2.5 ${a.active ? "text-emerald-400" : "text-muted-foreground/30"}`} />
                  <span className={`text-[10px] ${a.active ? "text-foreground" : "text-muted-foreground/50"}`}>{a.name}</span>
                  {a.active && <Badge className="bg-emerald-500/10 text-emerald-400 text-[8px] ml-auto">Active</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
