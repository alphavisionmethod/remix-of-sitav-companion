// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Whisper Card (Phase D)
// ═══════════════════════════════════════════════════════════════
// The visible surface for proactive Sita. A glassy card pinned
// just under the HUD strip that shows one nudge at a time with
// up to 3 quick actions. Dismissing it remembers the choice for
// 6 hours via the nudge bus.
// ═══════════════════════════════════════════════════════════════

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useActiveNudge,
  dismissActiveNudge,
  type SitaNudgeAction,
} from "@/lib/sita-proactive";

const KIND_TINT: Record<string, string> = {
  suggestion: "from-primary/15 to-primary/5",
  followup: "from-accent/15 to-accent/5",
  reminder: "from-amber-500/15 to-amber-500/5",
  insight: "from-sky-500/15 to-sky-500/5",
  wellness: "from-emerald-500/15 to-emerald-500/5",
};

function dispatchAction(action: SitaNudgeAction) {
  if (typeof window === "undefined") return;
  if (action.intent) {
    // Phase E — if the intent starts with "do:" treat as agent intent
    if (action.intent.startsWith("do:")) {
      window.dispatchEvent(
        new CustomEvent("sita-agent-intent", { detail: { intent: action.intent.slice(3).trim() } }),
      );
      return;
    }
    window.dispatchEvent(
      new CustomEvent("sita-voice-utterance", { detail: { utterance: action.intent } }),
    );
  }
  if (action.event) {
    window.dispatchEvent(new CustomEvent(action.event.name, { detail: action.event.detail }));
  }
}

export function SitaWhisper() {
  const nudge = useActiveNudge();

  const onAction = useCallback((action: SitaNudgeAction) => {
    dispatchAction(action);
    dismissActiveNudge(true);
  }, []);

  const onDismiss = useCallback(() => dismissActiveNudge(true), []);

  return (
    <AnimatePresence>
      {nudge && (
        <motion.div
          key={nudge.id}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 top-9 z-[54] flex justify-center px-3"
        >
          <div
            className={cn(
              "pointer-events-auto w-full max-w-[min(560px,92vw)]",
              "rounded-2xl border border-white/10 bg-background/70 backdrop-blur-2xl",
              "shadow-[0_18px_50px_-18px_hsl(var(--primary)/0.55)]",
              "overflow-hidden",
            )}
          >
            <div className={cn(
              "bg-gradient-to-br p-3 sm:p-4",
              KIND_TINT[nudge.kind] ?? KIND_TINT.suggestion,
            )}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-foreground">
                    {nudge.text}
                  </p>
                  {nudge.detail && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {nudge.detail}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onDismiss}
                  aria-label="Dismiss Sita suggestion"
                  className="rounded-full p-1 text-muted-foreground/80 transition hover:bg-white/10 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {nudge.actions && nudge.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 pl-10">
                  {nudge.actions.map((a, i) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onAction(a)}
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition",
                        i === 0
                          ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-white/10 bg-background/60 text-foreground/85 hover:bg-background/80",
                      )}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}