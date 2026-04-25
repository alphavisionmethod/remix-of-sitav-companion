// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Action Plan Card (Phase E)
// ═══════════════════════════════════════════════════════════════
// Glassy approval modal pinned to the HUD. Shows the active plan,
// per-step risk, reversibility, and Approve / Cancel buttons.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ShieldCheck, AlertTriangle, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useActiveAgentPlan,
  useSitaAgent,
  type ActionStep,
} from "@/lib/sita-agent";

const RISK_TINT: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-300",
  medium: "bg-amber-500/15 text-amber-300",
  high: "bg-rose-500/15 text-rose-300",
};

function StepRow({ step, index }: { step: ActionStep; index: number }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-white/5 bg-background/40 p-2.5">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-snug text-foreground">
          {step.summary}
        </p>
        <p className="truncate text-[10px] text-muted-foreground">{step.skillId}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide", RISK_TINT[step.risk])}>
          {step.risk}
        </span>
        {step.reversible ? (
          <span title="Reversible" className="rounded-full bg-white/5 p-1 text-emerald-300">
            <RotateCcw className="h-3 w-3" />
          </span>
        ) : (
          <span title="Irreversible" className="rounded-full bg-white/5 p-1 text-amber-300">
            <AlertTriangle className="h-3 w-3" />
          </span>
        )}
      </div>
    </li>
  );
}

export function SitaActionPlanCard() {
  const plan = useActiveAgentPlan();
  const { executePlan, cancelPlan } = useSitaAgent();
  const [running, setRunning] = useState(false);

  const onApprove = useCallback(async () => {
    if (!plan) return;
    setRunning(true);
    try {
      await executePlan(plan);
    } finally {
      setRunning(false);
    }
  }, [plan, executePlan]);

  const onCancel = useCallback(async () => {
    if (!plan) return;
    await cancelPlan(plan, "user_cancelled");
  }, [plan, cancelPlan]);

  return (
    <AnimatePresence>
      {plan && (
        <motion.div
          key={plan.id}
          role="dialog"
          aria-label="Sita action plan"
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 top-12 z-[55] flex justify-center px-3"
        >
          <div className="pointer-events-auto w-full max-w-[min(620px,94vw)] overflow-hidden rounded-2xl border border-white/10 bg-background/80 backdrop-blur-2xl shadow-[0_24px_64px_-20px_hsl(var(--primary)/0.55)]">
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-white/5 bg-gradient-to-br from-primary/15 to-primary/5 p-3 sm:p-4">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-primary/80">Sita is about to</p>
                <h3 className="truncate text-sm font-semibold text-foreground">{plan.title}</h3>
                {plan.rationale && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{plan.rationale}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", RISK_TINT[plan.risk])}>
                  {plan.risk}
                </span>
                {plan.reversible && (
                  <span title="All steps reversible" className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">
                    <ShieldCheck className="inline h-3 w-3" />
                  </span>
                )}
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={running}
                  aria-label="Cancel plan"
                  className="rounded-full p-1 text-muted-foreground/80 transition hover:bg-white/10 hover:text-foreground disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Steps */}
            <ul className="space-y-1.5 p-3 sm:p-4 max-h-[40vh] overflow-y-auto">
              {plan.steps.map((s, i) => (
                <StepRow key={s.id} step={s} index={i} />
              ))}
            </ul>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 border-t border-white/5 bg-background/60 p-3 sm:px-4">
              <p className="text-[10px] text-muted-foreground">
                Tier L{plan.autonomyTier} · {plan.steps.length} step{plan.steps.length === 1 ? "" : "s"} · {plan.domain}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={running}
                  className="rounded-full border border-white/10 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground/85 transition hover:bg-background/80 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onApprove}
                  disabled={running}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {running ? "Running…" : "Approve & run"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}