import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Target, ArrowRight, AlertTriangle, CheckCircle, BarChart3, Zap, Phone, FileText, Heart, Search, TrendingUp, Rocket, Loader2, DollarSign } from "lucide-react";
import type { ScreenProps } from "../types";

const REVENUE_ESTIMATES: Record<string, number> = {
  lead_followup: 8200,
  no_shows: 4800,
  conversion: 6100,
  reactivation: 3200,
  reviews: 2400,
  pricing: 5600,
  retention: 7300,
  followup: 4100,
  upsells: 5600,
  onboarding: 3800,
};

type RevealScreenProps = ScreenProps & {
  markComplete?: (state: ScreenProps["state"]) => Promise<void>;
  onComplete?: (finalState?: ScreenProps["state"]) => void;
};

export default function RevealScreen({ state, onBack, onComplete, ...props }: RevealScreenProps) {
  const markComplete = (props as { markComplete?: (state: ScreenProps["state"]) => Promise<void> }).markComplete;
  const [phase, setPhase] = useState<"building" | "revealing" | "ready">("building");
  const [revealedCount, setRevealedCount] = useState(0);

  const modules = useMemo(() => [
    { label: "Revenue Boardroom", desc: "Executive overview", icon: BarChart3 },
    { label: "Customer Journey Twin", desc: "Live journey map with leak detection", icon: Target },
    { label: "Revenue Leakage Map", desc: `${state.growthBottlenecks.length} bottlenecks calibrated`, icon: Search },
    { label: "Growth Advisor Board", desc: "Advisors matched to your model", icon: Brain },
    { label: "Automation Office", desc: "Trust-calibrated automation", icon: Zap },
    { label: "Quote Studio", desc: state.revenueSources.includes("proposals") ? "Proposal-ready" : "Available", icon: FileText },
    { label: "Call Desk", desc: state.whatCloses.includes("call") ? "Call-centric mode" : "Available", icon: Phone },
    { label: "Opportunity Engine", desc: "Growth ranked by impact", icon: TrendingUp },
  ], [state]);

  const estimatedRevenue = useMemo(() => {
    let total = 0;
    state.growthBottlenecks.forEach(b => { total += REVENUE_ESTIMATES[b] || 2000; });
    state.postSaleSlips.forEach(s => { total += REVENUE_ESTIMATES[s] || 1500; });
    return total;
  }, [state.growthBottlenecks, state.postSaleSlips]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("revealing"), 2200);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase !== "revealing") return;
    if (revealedCount >= modules.length) {
      const t = setTimeout(() => setPhase("ready"), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealedCount(c => c + 1), 180);
    return () => clearTimeout(t);
  }, [phase, revealedCount, modules.length]);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {phase === "building" && (
          <motion.div key="building" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Loader2 className="h-10 w-10 text-primary mx-auto" />
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-lg font-semibold text-foreground mt-6">Building your Revenue Office…</motion.p>
            <motion.div className="space-y-1 mt-4">
              {["Mapping revenue engine", "Calibrating advisors", "Detecting leaks", "Activating modules"].map((step, i) => (
                <motion.p key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.4 }}
                  className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.4 }}>
                    <CheckCircle className="h-3 w-3 text-emerald-400" />
                  </motion.span>
                  {step}
                </motion.p>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase !== "building" && (
        <>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="text-center mb-6">
            <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
              <div className="relative mx-auto w-16 h-16 mb-4">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
                <div className="relative w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground">Your Revenue Office is ready</h2>
            <p className="text-sm text-muted-foreground mt-2">Personalized around {state.businessName || "your business"}</p>
          </motion.div>

          {estimatedRevenue > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10">
                    <DollarSign className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">Estimated Recoverable Revenue</p>
                    <p className="text-[10px] text-muted-foreground">Based on {state.growthBottlenecks.length + state.postSaleSlips.length} identified gaps</p>
                  </div>
                  <p className="text-xl font-bold text-emerald-400">${estimatedRevenue.toLocaleString()}<span className="text-[10px] font-normal text-muted-foreground">/mo</span></p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4"><Brain className="h-4 w-4 text-primary" /><p className="text-sm font-semibold text-foreground">Business Twin Summary</p></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div><p className="text-muted-foreground mb-1">Type</p><p className="font-medium text-foreground">{state.businessTypes.join(", ") || "—"}</p></div>
                <div><p className="text-muted-foreground mb-1">Revenue</p><p className="font-medium text-foreground">{state.revenueSources.slice(0, 2).join(", ") || "—"}</p></div>
                <div><p className="text-muted-foreground mb-1">Journey</p><p className="font-medium text-foreground capitalize">{state.journeyTemplate || "—"}</p></div>
                <div><p className="text-muted-foreground mb-1">Team</p><p className="font-medium text-foreground capitalize">{state.teamSize}</p></div>
                <div><p className="text-muted-foreground mb-1">Trust</p><p className="font-medium text-foreground capitalize">{state.automationLevel.replace("_", " ")}</p></div>
                <div><p className="text-muted-foreground mb-1">Connected</p><p className="font-medium text-foreground">{state.connectedSystems.length} systems</p></div>
              </div>
            </CardContent>
          </Card>

          {state.journeyTemplate && (
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2"><Target className="h-4 w-4 text-blue-400" /><p className="text-xs font-semibold text-foreground">Customer Journey Twin Active</p></div>
                {state.journeyPainPoints.length > 0 && (
                  <p className="text-[10px] text-amber-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{state.journeyPainPoints.length} drop-off points flagged for repair</p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-2">
            {modules.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={i < revealedCount ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-3 rounded-xl bg-card/50 border border-border/50 flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-primary/10"><m.icon className="h-3.5 w-3.5 text-primary" /></div>
                <div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground">{m.label}</p><p className="text-[9px] text-muted-foreground truncate">{m.desc}</p></div>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              </motion.div>
            ))}
          </div>

          {state.selectedFirstWins.length > 0 && (
            <Card className="bg-emerald-500/5 border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2"><Rocket className="h-4 w-4 text-emerald-400" /><p className="text-xs font-semibold text-foreground">First Wins — Starting Now</p></div>
                {state.selectedFirstWins.map(id => <p key={id} className="text-[11px] text-muted-foreground ml-6 capitalize">{id.replace(/_/g, " ")}</p>)}
              </CardContent>
            </Card>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: phase === "ready" ? 1 : 0.3 }} transition={{ delay: 0.3 }} className="space-y-2">
            <button onClick={async () => {
              if (markComplete) await markComplete(state);
              try { localStorage.setItem("sita_onboarding_state", JSON.stringify(state)); } catch {}
              onComplete?.(state);
            }} disabled={phase !== "ready"}
              className="w-full p-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
              Enter Your Business OS <ArrowRight className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={onBack} disabled={phase !== "ready"}
                className="flex-1 p-3 rounded-xl bg-card/50 border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors disabled:opacity-50">
                Review setup
              </button>
              <button onClick={async () => {
                if (markComplete) await markComplete(state);
                try { localStorage.setItem("sita_onboarding_state", JSON.stringify(state)); } catch {}
                onComplete?.(state);
              }} disabled={phase !== "ready"}
                className="flex-1 p-3 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                Continue imports later
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
