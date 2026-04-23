// Personal Brain — Premium first-visit onboarding tour
// Spotlights Tools, Digests, and Workspaces (Members live inside) the
// first time the user opens the Brain dashboard. LocalStorage-gated.
import { useEffect, useLayoutEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wrench, Users, ArrowRight, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "pb_tour_v1_completed";
const PROGRESS_KEY = "pb_tour_v1_progress";

interface TourProgress {
  step: number;
  updated_at: string;
  // Bumped if STEPS shape ever changes — invalidates stale progress.
  schema: 1;
}

function readProgress(): TourProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TourProgress>;
    if (parsed?.schema !== 1) return null;
    if (typeof parsed.step !== "number") return null;
    return parsed as TourProgress;
  } catch { return null; }
}

function writeProgress(step: number) {
  try {
    const payload: TourProgress = { step, updated_at: new Date().toISOString(), schema: 1 };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload));
  } catch { /* private mode / quota */ }
}

function clearProgress() {
  try { localStorage.removeItem(PROGRESS_KEY); } catch { /* */ }
}

interface TourStep {
  id: string;
  selector: string;
  title: string;
  body: string;
  Icon: typeof Sparkles;
  tone: string;
  placement?: "bottom" | "top" | "auto";
}

const STEPS: TourStep[] = [
  {
    id: "tools",
    selector: "[data-tour='brain-tools']",
    title: "External Tools",
    body: "Register web search, calendars, files, or any custom tool your Brain can call mid-conversation. Toggle them on and off any time.",
    Icon: Wrench,
    tone: "from-blue-500/30 to-indigo-500/20",
  },
  {
    id: "digests",
    selector: "[data-tour='brain-digests']",
    title: "Brain Digests",
    body: "Get an AI-written summary of your goals, chats, and memories — daily or weekly. Highlights surface the wins, blockers, and patterns worth your attention.",
    Icon: Sparkles,
    tone: "from-primary/30 to-accent/20",
  },
  {
    id: "members",
    selector: "[data-tour='brain-workspaces']",
    title: "Shared Workspaces & Members",
    body: "Open any workspace to invite collaborators with viewer, editor, or owner roles. Everyone sees the same chats, memories, and digests.",
    Icon: Users,
    tone: "from-emerald-500/30 to-teal-500/20",
  },
];

interface Rect { top: number; left: number; width: number; height: number }

function useElementRect(selector: string, active: boolean): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    if (!active) return;
    let raf = 0;
    const measure = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) { setRect(null); return; }
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      });
    };
    measure();
    const id = window.setTimeout(measure, 350); // re-measure after scroll
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [selector, active]);

  return rect;
}

interface BrainOnboardingTourProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function BrainOnboardingTour({ forceOpen, onClose }: BrainOnboardingTourProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      // Manual launch: also resume mid-tour if there's saved progress.
      const resumed = readProgress();
      setStep(resumed && resumed.step < STEPS.length ? resumed.step : 0);
      setOpen(true);
      return;
    }
    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (completed) return; // tour already finished — don't reopen
      const resumed = readProgress();
      if (resumed && resumed.step > 0 && resumed.step < STEPS.length) {
        setStep(resumed.step);
      }
      const t = window.setTimeout(() => setOpen(true), 600);
      return () => window.clearTimeout(t);
    } catch { /* private mode */ }
  }, [forceOpen]);

  // Persist step changes (debounced via microtask) whenever the tour is open.
  useEffect(() => {
    if (!open) return;
    writeProgress(step);
  }, [open, step]);

  // Cross-tab sync: if another tab finishes/resets the tour, mirror it here.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) { setOpen(false); return; }
      if (e.key === PROGRESS_KEY) {
        const next = readProgress();
        if (next && next.step !== step && next.step < STEPS.length) setStep(next.step);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [step]);

  const finish = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, new Date().toISOString()); } catch { /* */ }
    clearProgress();
    setOpen(false);
    onClose?.();
  }, [onClose]);

  const current = STEPS[step];
  const rect = useElementRect(current?.selector ?? "", open);

  if (!open || !current) return null;

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : finish());
  const prev = () => step > 0 && setStep(step - 1);

  // Tooltip placement: prefer below the rect; fall back to above if no room.
  const PADDING = 14;
  const TOOLTIP_W = 340;
  const TOOLTIP_H = 220;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;

  let tipTop = vh / 2 - TOOLTIP_H / 2;
  let tipLeft = vw / 2 - TOOLTIP_W / 2;
  if (rect) {
    const spaceBelow = vh - (rect.top + rect.height);
    const placeBelow = spaceBelow > TOOLTIP_H + PADDING + 20;
    tipTop = placeBelow
      ? rect.top + rect.height + PADDING
      : Math.max(PADDING, rect.top - TOOLTIP_H - PADDING);
    tipLeft = Math.min(
      Math.max(PADDING, rect.left + rect.width / 2 - TOOLTIP_W / 2),
      vw - TOOLTIP_W - PADDING,
    );
  }

  const Icon = current.Icon;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="tour-root"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        role="dialog"
        aria-modal="true"
        aria-label={`Brain tour — ${current.title}`}
      >
        {/* Backdrop with spotlight cut-out using box-shadow trick */}
        {rect ? (
          <motion.div
            key={current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="absolute pointer-events-auto rounded-2xl"
            style={{
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16,
              boxShadow: "0 0 0 9999px hsl(var(--background) / 0.78), 0 0 0 2px hsl(var(--primary) / 0.7), 0 0 60px 10px hsl(var(--primary) / 0.45)",
              transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onClick={finish}
          >
            {/* Animated ring */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-2xl ring-2 ring-primary/60 animate-pulse"
              style={{ animationDuration: "2.4s" }}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={finish} />
        )}

        {/* Tooltip card */}
        <motion.div
          key={`tip-${current.id}`}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="absolute pointer-events-auto"
          style={{ top: tipTop, left: tipLeft, width: TOOLTIP_W }}
        >
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-2xl shadow-primary/20 backdrop-blur-xl">
            <div className={`relative flex items-start gap-3 bg-gradient-to-br ${current.tone} p-4`}>
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.25),transparent_60%)]" aria-hidden />
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/80 ring-1 ring-border/60 shadow-md">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="relative flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                  Step {step + 1} of {STEPS.length}
                </p>
                <h3 className="text-base font-bold leading-tight text-foreground">{current.title}</h3>
              </div>
              <button
                aria-label="Close tour"
                className="relative rounded-full p-1 text-muted-foreground transition hover:bg-background/60 hover:text-foreground"
                onClick={finish}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{current.body}</p>

              {/* Step dots */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  {STEPS.map((s, i) => (
                    <button
                      key={s.id}
                      aria-label={`Go to step ${i + 1}`}
                      onClick={() => setStep(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === step ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/40"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <Button variant="ghost" size="sm" onClick={prev} className="h-8">
                      Back
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={next}
                    className="h-8 bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shadow-primary/30 hover:scale-[1.03] transition-transform"
                  >
                    {step === STEPS.length - 1 ? (<><Check className="h-3.5 w-3.5" /> Got it</>) : (<>Next <ArrowRight className="h-3.5 w-3.5" /></>)}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

export function resetBrainTour() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
  clearProgress();
}
