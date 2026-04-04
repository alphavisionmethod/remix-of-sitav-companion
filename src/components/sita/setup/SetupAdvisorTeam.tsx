// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Step: Advisor Team Activation
// Premium council activation — not chatbot toggles
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  User, Users, DollarSign, Briefcase, Headphones, TrendingUp, ChevronRight, Check, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  operatingMode: string;
  onNext: (activeAdvisors: string[]) => void;
  onBack: () => void;
  step: number;
  total: number;
}

const ADVISORS = [
  {
    id: "life",
    icon: User,
    title: "Life Advisor",
    role: "Personal productivity & daily rhythm",
    capabilities: ["Task prioritization", "Routine optimization", "Follow-through tracking"],
    modes: ["personal", "everything"],
  },
  {
    id: "family",
    icon: Users,
    title: "Family Advisor",
    role: "Household coordination & family logistics",
    capabilities: ["Shared calendar management", "Household task distribution", "School & activity tracking"],
    modes: ["family", "everything"],
  },
  {
    id: "money",
    icon: DollarSign,
    title: "Money Advisor",
    role: "Financial visibility & budget guidance",
    capabilities: ["Cashflow analysis", "Bill calendar", "Subscription waste detection"],
    modes: ["money", "everything", "business"],
  },
  {
    id: "business",
    icon: Briefcase,
    title: "Business Advisor",
    role: "Revenue, leads & operational rhythm",
    capabilities: ["Pipeline review", "Lead follow-up detection", "Revenue forecasting"],
    modes: ["business", "everything"],
  },
  {
    id: "concierge",
    icon: Headphones,
    title: "Concierge Advisor",
    role: "Scheduling, bookings & errands",
    capabilities: ["Booking scoring", "Conflict detection", "Errand optimization"],
    modes: ["personal", "family", "everything"],
  },
  {
    id: "strategy",
    icon: TrendingUp,
    title: "Strategy Advisor",
    role: "Cross-domain insights & opportunities",
    capabilities: ["Opportunity detection", "Risk synthesis", "Strategic recommendations"],
    modes: ["everything", "business"],
  },
];

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

export function SetupAdvisorTeam({ operatingMode, onNext, onBack, step, total }: Props) {
  const recommended = useMemo(
    () => ADVISORS.filter(a => a.modes.includes(operatingMode)).map(a => a.id),
    [operatingMode]
  );

  const [active, setActive] = useState<string[]>(recommended);

  const toggle = (id: string) => {
    setActive(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <motion.div {...fadeIn} transition={{ duration: 0.5 }} className="w-full max-w-3xl mx-auto">
      <StepBar step={step} total={total} />

      <motion.h2 {...fadeIn} transition={{ delay: 0.1 }}
        className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-2">
        Meet your advisory team
      </motion.h2>
      <motion.p {...fadeIn} transition={{ delay: 0.15 }}
        className="text-sm text-muted-foreground mb-8">
        SITA will activate the advisors most relevant to your world first.
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ADVISORS.map((advisor, i) => {
          const isActive = active.includes(advisor.id);
          const isRecommended = recommended.includes(advisor.id);

          return (
            <motion.button
              key={advisor.id}
              {...fadeIn}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => toggle(advisor.id)}
              className={cn(
                "relative rounded-2xl border p-5 text-left transition-all duration-300",
                isActive
                  ? "border-primary/40 bg-primary/6 shadow-sm shadow-primary/5"
                  : "border-border/30 bg-card/30 hover:border-border/50 opacity-60 hover:opacity-80"
              )}
            >
              {/* Badges */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                {isRecommended && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <Sparkles className="h-2.5 w-2.5" /> Recommended
                  </span>
                )}
                {isActive && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.div>
                )}
              </div>

              <div className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl mb-3 transition-colors",
                isActive ? "bg-primary/15" : "bg-secondary/30"
              )}>
                <advisor.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
              </div>

              <p className="text-sm font-semibold text-foreground mb-0.5">{advisor.title}</p>
              <p className="text-xs text-muted-foreground mb-3">{advisor.role}</p>

              {/* Capabilities */}
              <div className="space-y-1">
                {advisor.capabilities.map(cap => (
                  <p key={cap} className="text-[11px] text-muted-foreground/70 flex items-center gap-1.5">
                    <span className={cn("h-1 w-1 rounded-full", isActive ? "bg-primary/50" : "bg-muted-foreground/30")} />
                    {cap}
                  </p>
                ))}
              </div>

              {/* Trust posture */}
              <div className="mt-3 pt-3 border-t border-border/20">
                <p className="text-[10px] text-muted-foreground/50">
                  {isActive ? "Advises and suggests • Approval required for actions" : "Dormant — activate anytime"}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-8">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
        <button onClick={() => onNext(active)}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2">
          Continue <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500",
          i < step ? "bg-primary" : i === step ? "bg-primary/60" : "bg-muted")} />
      ))}
    </div>
  );
}
