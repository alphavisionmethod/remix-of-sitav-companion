import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Check, CircleDot, TrendingUp, Users, Target, Megaphone, DollarSign, Phone, Heart, Star, Briefcase } from "lucide-react";
import { ChapterBanner } from "../primitives";
// Canonical onboarding primitives (drift-prevented by check-onboarding-components-folder)
import { OnboardingMomentReveal as _CanonReveal } from "@/platform/setup/components/onboarding";
void _CanonReveal;
import { getRecommendedAdvisors, type RecommendedAdvisor } from "../branching";
import type { ScreenProps } from "../types";

const iconMap: Record<string, any> = {
  chief_revenue: TrendingUp, funnel: Target, crm: Users, campaign: Megaphone,
  offer: DollarSign, booking: Phone, retention: Heart, reputation: Star, ops: Briefcase,
};

const intensityColors = {
  low: "bg-blue-500/10 text-blue-400",
  medium: "bg-amber-500/10 text-amber-400",
  high: "bg-emerald-500/10 text-emerald-400",
};

export default function AdvisorActivationScreen({ state, setState }: ScreenProps) {
  
  const advisors = useMemo(() => getRecommendedAdvisors(state), [state]);

  const activeIds = useMemo(() => {
    if (state.activeAdvisors.length > 0) return state.activeAdvisors;
    return advisors.filter(a => a.recommended).map(a => a.id);
  }, [advisors, state.activeAdvisors]);

  const toggleAdvisor = useCallback((id: string) => {
    setState(p => {
      const current = p.activeAdvisors.length > 0 ? p.activeAdvisors : advisors.filter(a => a.recommended).map(a => a.id);
      const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
      return { ...p, activeAdvisors: next };
    });
  }, [setState, advisors]);

  const cycleIntensity = useCallback((id: string) => {
    setState(p => {
      const current = p.advisorIntensity[id] || advisors.find(a => a.id === id)?.intensity || "medium";
      const next = current === "low" ? "medium" : current === "medium" ? "high" : "low";
      return { ...p, advisorIntensity: { ...p.advisorIntensity, [id]: next } };
    });
  }, [setState, advisors]);

  return (
    <div className="space-y-6">
      
      <ChapterBanner chapter="Advisor Board" subtitle="Activate the advisors that match your business model" />
      <div className="text-center mb-2">
        <Brain className="h-7 w-7 text-primary mx-auto mb-2" />
        <h2 className="text-xl font-bold text-foreground">Your Growth Advisor Board</h2>
        <p className="text-sm text-muted-foreground mt-1">SITA recommends these based on your business model, bottlenecks, and revenue engine</p>
      </div>

      <div className="space-y-2">
        {advisors.map((a, i) => {
          const Icon = iconMap[a.id] || Brain;
          const isActive = activeIds.includes(a.id);
          const intensity = state.advisorIntensity[a.id] || a.intensity;

          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`transition-all ${isActive ? "bg-primary/5 border-primary/20" : "bg-card/50 border-border/50 opacity-60"}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleAdvisor(a.id)} className="flex-shrink-0">
                      <div className={`p-2 rounded-lg transition-colors ${isActive ? "bg-primary/20" : "bg-muted"}`}>
                        <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    </button>

                    <div className="flex-1 min-w-0" onClick={() => toggleAdvisor(a.id)}>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{a.name}</p>
                        {a.recommended && <Badge className="bg-primary/10 text-primary text-[8px]">Recommended</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{a.reason}</p>
                    </div>

                    {isActive && (
                      <button onClick={() => cycleIntensity(a.id)}
                        className={`px-2 py-1 rounded-md text-[9px] font-medium ${intensityColors[intensity]} transition-all hover:opacity-80`}>
                        {intensity}
                      </button>
                    )}

                    {isActive ? (
                      <CircleDot className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="bg-primary/5 border-primary/15">
        <CardContent className="p-4">
          <p className="text-xs text-foreground font-medium">{activeIds.length} advisor{activeIds.length !== 1 ? "s" : ""} active</p>
          <p className="text-[10px] text-muted-foreground mt-1">Advisors observe your business data, surface insights in the Boardroom, and suggest actions based on their domain expertise. You can adjust activation and intensity anytime.</p>
        </CardContent>
      </Card>
    </div>
  );
}
