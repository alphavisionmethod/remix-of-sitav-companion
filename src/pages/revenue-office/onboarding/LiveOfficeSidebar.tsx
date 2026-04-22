import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, Brain, Activity, CircleDot, Layers, MapPin, Heart, Phone, Users, AlertTriangle, Star, MessageSquare, TrendingUp, Link2, FileText, Target, DollarSign, ArrowRight, BarChart3, Search, Sparkles } from "lucide-react";
import type { OnboardingState } from "./types";

const BOTTLENECK_VALUES: Record<string, { label: string; value: number }> = {
  lead_followup: { label: "Lead follow-up gap", value: 8200 },
  no_shows: { label: "No-show losses", value: 4800 },
  conversion: { label: "Conversion leaks", value: 6100 },
  reactivation: { label: "Reactivation gap", value: 3200 },
  pricing: { label: "Pricing optimization", value: 5600 },
  retention: { label: "Retention leaks", value: 7300 },
  reviews: { label: "Review gap", value: 2400 },
  followup: { label: "Follow-up slips", value: 4100 },
  upsells: { label: "Upsell opportunities", value: 5600 },
  onboarding: { label: "Onboarding gap", value: 3800 },
};

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
    if (state.uploadedArtifacts.includes("proposal_templates")) items.push({ icon: FileText, text: "Proposal-driven workflow detected", type: "detected" });
    if (state.uploadedArtifacts.includes("call_scripts")) items.push({ icon: Phone, text: "Call-dependent sales motion", type: "detected" });
    if (state.uploadedArtifacts.includes("sops")) items.push({ icon: Brain, text: "Process maturity — SOP-driven ops", type: "detected" });
    if (state.pastedUrls.length >= 2) items.push({ icon: Link2, text: `Multi-channel: ${state.pastedUrls.length} touchpoints`, type: "detected" });
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

  const revenueImpact = useMemo(() => {
    const items: { label: string; value: number }[] = [];
    [...state.growthBottlenecks, ...state.postSaleSlips].forEach(key => {
      const entry = BOTTLENECK_VALUES[key];
      if (entry && !items.find(i => i.label === entry.label)) items.push(entry);
    });
    return items;
  }, [state.growthBottlenecks, state.postSaleSlips]);

  const totalRecoverable = revenueImpact.reduce((s, i) => s + i.value, 0);

  const modulesActivated = useMemo(() => {
    let count = 3; // Boardroom, Journey, Advisors always on
    if (state.revenueSources.includes("proposals")) count++;
    if (state.whatCloses.includes("call")) count++;
    if (state.businessTypes.includes("local")) count++;
    if (state.businessTypes.includes("ecommerce")) count++;
    if (state.automationLevel) count++;
    return count;
  }, [state]);

  const advisors = useMemo(() => [
    { name: "Revenue Strategist", active: stage >= 3 },
    { name: "CRM Advisor", active: state.leadSources.length > 0 },
    { name: "Funnel Advisor", active: state.journeyTemplate !== "" },
    { name: "Retention Advisor", active: state.postSaleSlips.length > 0 },
    { name: "Reputation Advisor", active: state.postSaleSlips.includes("reviews") || state.businessTypes.includes("local") },
    { name: "Automation Advisor", active: stage >= 16 },
  ], [state, stage]);

  // Show on all stages with adapted content

  const colorMap = { detected: "bg-primary/10 text-primary", ready: "bg-blue-500/10 text-blue-400", warning: "bg-amber-500/10 text-amber-400", opportunity: "bg-emerald-500/10 text-emerald-400" };
  const iconColorMap = { detected: "text-primary", ready: "text-blue-400", warning: "text-amber-400", opportunity: "text-emerald-400" };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block w-72 flex-shrink-0">
      <div className="sticky top-28 space-y-4">
        {/* Readiness gauge with circular ring */}
        <Card className="bg-card/60 border-border/40 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* Circular progress ring */}
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" opacity="0.3" />
                  <motion.circle
                    cx="24" cy="24" r="20" fill="none"
                    stroke={readiness > 70 ? "hsl(150 60% 50%)" : readiness > 40 ? "hsl(45 90% 50%)" : "hsl(var(--primary))"}
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - readiness / 100) }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-foreground">{readiness}%</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-foreground">
                  {state.businessName ? state.businessName : "Revenue Office"}
                </p>
                <p className="text-[9px] text-muted-foreground">{stage === 0 ? "Waiting to begin…" : "Forming…"}</p>
                <Badge className="bg-primary/10 text-primary text-[8px] mt-1">{modulesActivated} modules</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module activation list */}
        <Card className="bg-card/60 border-border/40 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="h-3 w-3 text-primary" />
              <p className="text-[10px] font-semibold text-foreground">Modules</p>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Revenue Boardroom", icon: BarChart3, active: state.revenueSources.length > 0 },
                { label: "Journey Twin", icon: Target, active: !!state.journeyTemplate },
                { label: "Leak Detector", icon: Search, active: state.growthBottlenecks.length > 0 },
                { label: "Advisor Board", icon: Brain, active: stage >= 3 },
                { label: "Automation Office", icon: Activity, active: !!state.automationLevel },
                { label: "Opportunity Engine", icon: TrendingUp, active: state.leadSources.length > 0 },
              ].map((m, i) => (
                <motion.div key={m.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 p-1.5 rounded-lg transition-colors"
                  style={{ background: m.active ? "hsl(var(--primary) / 0.05)" : "transparent" }}
                >
                  <div className={`p-1 rounded transition-colors ${m.active ? "bg-gradient-to-br from-primary/20 to-violet-500/10" : "bg-muted/30"}`}>
                    <m.icon className={`h-3 w-3 ${m.active ? "text-primary" : "text-muted-foreground/30"}`} />
                  </div>
                  <p className={`text-[10px] flex-1 ${m.active ? "text-foreground" : "text-muted-foreground/40"}`}>{m.label}</p>
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    m.active ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-muted-foreground/15"
                  }`} />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {totalRecoverable > 0 && (
          <Card className="bg-emerald-500/5 border-emerald-500/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                <p className="text-[11px] font-semibold text-foreground">Estimated Recoverable</p>
              </div>
              <p className="text-lg font-bold text-emerald-400 mb-2">${totalRecoverable.toLocaleString()}<span className="text-[9px] font-normal text-muted-foreground">/mo</span></p>
              <div className="space-y-1">
                {revenueImpact.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[9px]">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-emerald-400 font-medium">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {state.journeyTemplate && (
          <Card className="bg-card/60 border-border/40 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-2"><Target className="h-3 w-3 text-blue-400" /><p className="text-[10px] font-semibold text-foreground">Journey Twin</p></div>
              <div className="flex items-center gap-0.5 flex-wrap">
                {state.journeyStages.slice(0, 5).map((s, i) => (
                  <div key={i} className="flex items-center gap-0.5">
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary whitespace-nowrap">{s}</span>
                    {i < Math.min(state.journeyStages.length, 5) - 1 && <ArrowRight className="h-2 w-2 text-muted-foreground/40" />}
                  </div>
                ))}
                {state.journeyStages.length > 5 && <span className="text-[8px] text-muted-foreground">+{state.journeyStages.length - 5}</span>}
              </div>
            </CardContent>
          </Card>
        )}

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
