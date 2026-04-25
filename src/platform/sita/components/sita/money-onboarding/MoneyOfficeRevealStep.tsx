import { motion } from "framer-motion";
import { Sparkles, BarChart3, ShieldCheck, Brain, Landmark, Receipt, Target, ArrowRight, Building2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { MoneyOnboardingState } from "./types";

const REVEAL_ITEMS = [
  { icon: BarChart3, label: "Money Boardroom", desc: "Your executive financial overview" },
  { icon: ShieldCheck, label: "Safe-to-Spend", desc: "Know exactly what's available" },
  { icon: Brain, label: "Stress Radar", desc: "First financial stress signals detected" },
  { icon: Sparkles, label: "Advisor Board", desc: "10 AI advisors calibrated to your mode" },
  { icon: Landmark, label: "Connected Accounts", desc: "Your financial sources mapped" },
  { icon: Receipt, label: "Recurring Obligations", desc: "Bills and subscriptions tracked" },
  { icon: Target, label: "First Opportunities", desc: "Quick wins identified for you" },
];

interface Props {
  state: MoneyOnboardingState;
  onEnterMoneyOffice: () => void;
}

export function MoneyOfficeRevealStep({ state, onEnterMoneyOffice }: Props) {
  const reduced = useReducedMotion();

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <motion.div
        initial={reduced ? {} : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sita-gold shadow-lg shadow-primary/20 mb-4">
          <Sparkles className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Your Money Office is Ready</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Mode: <span className="text-primary font-medium capitalize">{state.operatingMode.replace(/_/g, " ")}</span>
          {" · "}
          {state.priorities.length} priorities set
          {state.connectedAccounts.length > 0 && ` · ${state.connectedAccounts.filter(a => a.connected).length} accounts connected`}
        </p>
      </motion.div>

      <div className="space-y-2">
        {REVEAL_ITEMS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={reduced ? {} : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : 0.3 + i * 0.08 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3"
          >
            <div className="rounded-lg bg-primary/10 p-2">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-trust-safe animate-pulse" />
          </motion.div>
        ))}
      </div>

      {state.includesBusiness && (
        <motion.div
          initial={reduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="rounded-xl border border-sita-gold/30 bg-sita-gold/5 p-3 text-xs text-sita-gold"
        >
          <Building2 className="inline h-3.5 w-3.5 mr-1" />
          Founder Split Brain Protection is active — your business and personal money boundaries are monitored.
        </motion.div>
      )}

      <motion.button
        initial={reduced ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 1.2 }}
        onClick={onEnterMoneyOffice}
        className={cn(
          "w-full rounded-xl bg-gradient-to-r from-primary to-sita-gold py-3.5 text-sm font-bold text-primary-foreground",
          "hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
        )}
      >
        Enter Money Office
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
