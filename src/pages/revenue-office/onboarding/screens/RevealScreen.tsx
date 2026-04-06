import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Sparkles, Brain, Target, ArrowRight, AlertTriangle, CheckCircle, BarChart3, Zap, Phone, FileText, Heart, Search, TrendingUp, Rocket } from "lucide-react";
import type { ScreenProps } from "../types";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

export default function RevealScreen({ state }: ScreenProps) {
  const navigate = useNavigate();

  const modules = [
    { label: "Revenue Boardroom", desc: "Executive overview", icon: BarChart3 },
    { label: "Customer Journey Twin", desc: "Live journey map with leak detection", icon: Target },
    { label: "Revenue Leakage Map", desc: `${state.growthBottlenecks.length} bottlenecks calibrated`, icon: Search },
    { label: "Growth Advisor Board", desc: "Advisors matched to your model", icon: Brain },
    { label: "Automation Office", desc: "Trust-calibrated automation", icon: Zap },
    { label: "Quote Studio", desc: state.revenueSources.includes("proposals") ? "Proposal-ready" : "Available", icon: FileText },
    { label: "Call Desk", desc: state.whatCloses.includes("call") ? "Call-centric mode" : "Available", icon: Phone },
    { label: "Opportunity Engine", desc: "Growth ranked by impact", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-center mb-6">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", damping: 15 }}>
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

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4"><Brain className="h-4 w-4 text-primary" /><p className="text-sm font-semibold text-foreground">Business Twin Summary</p></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div><p className="text-muted-foreground mb-1">Type</p><p className="font-medium text-foreground">{state.businessTypes.join(", ") || "—"}</p></div>
            <div><p className="text-muted-foreground mb-1">Revenue</p><p className="font-medium text-foreground">{state.revenueSources.slice(0, 2).join(", ") || "—"}</p></div>
            <div><p className="text-muted-foreground mb-1">Journey</p><p className="font-medium text-foreground capitalize">{state.journeyTemplate || "—"}</p></div>
            <div><p className="text-muted-foreground mb-1">Team</p><p className="font-medium text-foreground capitalize">{state.teamSize}</p></div>
            <div><p className="text-muted-foreground mb-1">Trust</p><p className="font-medium text-foreground capitalize">{state.automationLevel.replace("_", " ")}</p></div>
            <div><p className="text-muted-foreground mb-1">Bottlenecks</p><p className="font-medium text-foreground">{state.growthBottlenecks.length} flagged</p></div>
          </div>
        </CardContent>
      </Card>

      {state.journeyTemplate && (
        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Target className="h-4 w-4 text-blue-400" /><p className="text-xs font-semibold text-foreground">Customer Journey Twin Active</p></div>
            {state.journeyPainPoints.length > 0 && (
              <p className="text-[10px] text-amber-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{state.journeyPainPoints.length} drop-off points flagged</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-2">
        {modules.map(m => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-card/50 border border-border/50 flex items-center gap-3">
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

      <button onClick={() => navigate("/revenue-office/boardroom")}
        className="w-full p-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
        Enter Your Revenue Office <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
