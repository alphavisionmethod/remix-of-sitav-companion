// ═══════════════════════════════════════════════════════════════
// Lead Recovery — Empty, First-Use, Celebration, High-Pressure States
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Shield, Heart, Sparkles, TrendingUp, RotateCcw, AlertTriangle, Target } from "lucide-react";

export function RecoveryEmptyState() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[hsl(152_55%_48%/0.1)] flex items-center justify-center mb-4">
        <Shield className="h-8 w-8 text-[hsl(152_55%_48%)]" />
      </div>
      <h3 className="text-lg font-display font-bold text-[hsl(0_0%_85%)] mb-2">No Active Rescue Opportunities</h3>
      <p className="text-sm text-[hsl(0_0%_50%)] max-w-md mb-6">
        Great news — there are no leads currently in need of recovery. Your team is following up effectively and keeping momentum alive.
      </p>
      <div className="grid grid-cols-3 gap-3 max-w-lg">
        {[
          { icon: Heart, label: "Follow-up SLAs", desc: "Keep response times under 24h" },
          { icon: TrendingUp, label: "Momentum Tracking", desc: "Monitor stage progression" },
          { icon: RotateCcw, label: "Proactive Checks", desc: "Review aging leads weekly" },
        ].map(tip => (
          <div key={tip.label} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 text-center">
            <tip.icon className="h-4 w-4 text-[hsl(152_55%_48%)] mx-auto mb-1.5" />
            <p className="text-[10px] font-semibold text-[hsl(0_0%_70%)] mb-0.5">{tip.label}</p>
            <p className="text-[9px] text-[hsl(0_0%_40%)]">{tip.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function RecoveryFirstUse() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[hsl(265_55%_58%/0.1)] flex items-center justify-center mb-4">
        <Target className="h-8 w-8 text-[hsl(265_55%_58%)]" />
      </div>
      <h3 className="text-lg font-display font-bold text-[hsl(0_0%_85%)] mb-2">Welcome to Lead Recovery</h3>
      <p className="text-sm text-[hsl(0_0%_50%)] max-w-md mb-6">
        This is your revenue rescue workspace. It identifies leads that have gone quiet, stalled, or were mishandled — and helps you recover value intelligently.
      </p>
      <div className="grid grid-cols-3 gap-3 max-w-lg">
        {[
          { icon: Sparkles, label: "AI Recovery Paths", desc: "Intelligent recommendations for each lead" },
          { icon: Shield, label: "Non-Punitive Design", desc: "Focus on rescue, not blame" },
          { icon: TrendingUp, label: "Revenue Recovery", desc: "Track recovered value over time" },
        ].map(card => (
          <div key={card.label} className="rounded-xl border border-[hsl(265_55%_58%/0.15)] bg-[hsl(265_55%_58%/0.05)] p-3 text-center">
            <card.icon className="h-4 w-4 text-[hsl(265_55%_58%)] mx-auto mb-1.5" />
            <p className="text-[10px] font-semibold text-[hsl(0_0%_70%)] mb-0.5">{card.label}</p>
            <p className="text-[9px] text-[hsl(0_0%_40%)]">{card.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function RecoveryCelebration({ name, value }: { name: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-[hsl(152_55%_48%/0.3)] bg-[hsl(152_55%_48%/0.08)] p-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
        className="w-14 h-14 rounded-2xl bg-[hsl(152_55%_48%/0.15)] flex items-center justify-center mx-auto mb-3"
      >
        <Sparkles className="h-7 w-7 text-[hsl(152_55%_48%)]" />
      </motion.div>
      <h3 className="text-lg font-display font-bold text-[hsl(152_55%_48%)] mb-1">Momentum Restored!</h3>
      <p className="text-sm text-[hsl(0_0%_70%)]">
        <strong>{name}</strong> is back in the active pipeline
      </p>
      <p className="text-xs text-[hsl(0_0%_50%)] mt-1">{value} recovered value · Back in active pipeline</p>
    </motion.div>
  );
}

export function RecoveryHighPressureBanner({ count, value }: { count: number; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(0_70%_55%/0.2)] bg-[hsl(0_70%_55%/0.06)] p-3 flex items-center gap-3"
    >
      <AlertTriangle className="h-4 w-4 text-[hsl(0_70%_55%)] shrink-0" />
      <div className="flex-1">
        <p className="text-[11px] font-semibold text-[hsl(0_70%_65%)]">Recovery pressure is elevated</p>
        <p className="text-[10px] text-[hsl(0_0%_50%)]">{count} leads need attention today · {value} at risk</p>
      </div>
    </motion.div>
  );
}
