// ═══════════════════════════════════════════════════════════════
// SITA OS — Interactive Tutorial System
// Contextual tooltips + guided walkthrough with spotlight highlighting
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Brain, Briefcase, DollarSign, Headphones, Shield, Sparkles, Zap,
  ArrowRight, ArrowLeft, X, ChevronRight, Eye, Lock, CheckCircle,
  BarChart3, Cpu, Globe, MessageCircle, Lightbulb, Play, SkipForward,
  MousePointer, Target, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Tour Steps ──────────────────────────────────────────────

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  tip?: string;
  icon: typeof Brain;
  route?: string;
  highlight?: string; // CSS selector to highlight
  position?: "center" | "top-right" | "bottom-left" | "bottom-right";
  action?: string; // what to click
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "intro",
    title: "Your Command Center",
    description: "This is your Daily Pulse — everything you need in one glance. KPIs, advisor insights, and urgent items surface here automatically.",
    tip: "Think of this as your mission briefing every morning.",
    icon: Target,
    route: "/",
    position: "center",
  },
  {
    id: "nav",
    title: "Navigation",
    description: "The sidebar gives you instant access to all domains. Business, Money, Concierge — plus system tools like Mission Control, Advisors, and Files.",
    tip: "Press Cmd+K or / to search anything instantly.",
    icon: Layers,
    position: "center",
  },
  {
    id: "business",
    title: "Business Center",
    description: "Your CRM, pipeline, invoicing, and revenue intelligence — all in one place. The Business Advisor watches for stale leads and revenue gaps.",
    tip: "Click any tab to go deeper: Leads, Customers, Opportunities, Invoices.",
    icon: Briefcase,
    route: "/business",
    position: "center",
  },
  {
    id: "money",
    title: "Money Center",
    description: "Track bills, subscriptions, reserves, cash timing, and investments. Budget automation runs in the background to catch waste and optimize spending.",
    tip: "The Money Advisor detects subscription waste and protects your runway.",
    icon: DollarSign,
    route: "/money",
    position: "center",
  },
  {
    id: "concierge",
    title: "Concierge Center",
    description: "Calendar, tasks, appointments, travel, household management — your personal life organized by AI. Everything syncs across domains.",
    tip: "Tasks created from Business or Money advisors show up here automatically.",
    icon: Headphones,
    route: "/concierge",
    position: "center",
  },
  {
    id: "advisors",
    title: "Your AI Advisors",
    description: "Three specialized advisors — Business, Money, and Concierge — analyze your data and provide actionable intelligence. They explain their reasoning and never act without your trust level permissions.",
    tip: "Click the brain icon in the bottom-right corner anytime to chat with an advisor.",
    icon: Brain,
    route: "/advisors",
    position: "center",
  },
  {
    id: "trust",
    title: "Trust & Proof",
    description: "Every action SITA takes generates a typed proof receipt. Nothing is hidden. You can verify, rollback, or audit any decision at any time.",
    tip: "Visit the Proof Center to see your complete audit trail.",
    icon: Shield,
    route: "/proof",
    position: "center",
  },
  {
    id: "mission-control",
    title: "Mission Control",
    description: "Your admin cockpit. Monitor AI team health, incidents, connectors, costs, and system trust — all from one calm, Mac-like interface.",
    tip: "Safe Mode lets you pause all automation instantly if needed.",
    icon: Cpu,
    route: "/mission-control",
    position: "center",
  },
  {
    id: "complete",
    title: "You're Ready!",
    description: "SITA OS is fully configured and your AI team is standing by. Start by exploring your Daily Pulse, or ask an advisor for help with anything.",
    icon: Sparkles,
    route: "/",
    position: "center",
  },
];

// ── Tutorial Overlay Component ──────────────────────────────

export function InteractiveTutorial() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [hasRun, setHasRun] = useState(true);

  // Check if tutorial should show
  useEffect(() => {
    if (!user?.id) return;
    const key = `sita-tutorial-${user.id}`;
    const flag = localStorage.getItem(key);
    if (flag !== "never") {
      // Show tutorial after a delay so the page loads first
      const timer = setTimeout(() => {
        setHasRun(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  const startTutorial = useCallback(() => {
    setActive(true);
    setStep(0);
    const firstStep = TUTORIAL_STEPS[0];
    if (firstStep.route) navigate(firstStep.route);
  }, [navigate]);

  const dismiss = useCallback(() => {
    setActive(false);
    if (user?.id) localStorage.setItem(`sita-tutorial-${user.id}`, "never");
    setHasRun(true);
  }, [user?.id]);

  const closeForNow = useCallback(() => {
    setActive(false);
    setHasRun(true);
    // No localStorage write — will show again next session
  }, []);

  const neverShowAgain = useCallback(() => {
    setActive(false);
    setHasRun(true);
    if (user?.id) localStorage.setItem(`sita-tutorial-${user.id}`, "never");
  }, [user?.id]);

  const goToStep = useCallback((idx: number) => {
    if (idx >= TUTORIAL_STEPS.length) {
      dismiss();
      return;
    }
    setStep(idx);
    const s = TUTORIAL_STEPS[idx];
    if (s.route && s.route !== location.pathname) navigate(s.route);
  }, [location.pathname, navigate, dismiss]);

  const next = () => goToStep(step + 1);
  const prev = () => goToStep(Math.max(0, step - 1));

  const current = TUTORIAL_STEPS[step];
  const Icon = current?.icon ?? Brain;
  const progress = ((step + 1) / TUTORIAL_STEPS.length) * 100;

  // Tutorial prompt (before starting)
  if (!hasRun && !active) {
    return (
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="fixed bottom-6 right-6 z-[90] w-80 rounded-2xl border border-primary/20 bg-card shadow-2xl shadow-primary/10 p-5">
        <button onClick={closeForNow} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shrink-0">
            <Lightbulb className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground font-display">Take a guided tour?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Learn how SITA OS works in under 2 minutes.</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={startTutorial}
            className="flex-1 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
            <Play className="h-3 w-3" /> Start Tour
          </button>
          <button onClick={neverShowAgain}
            className="rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            Don't show again
          </button>
        </div>
      </motion.div>
    );
  }

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />

        {/* Tutorial card */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <motion.div key={step} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ type: "spring", damping: 25 }}
            className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl pointer-events-auto overflow-hidden">
            
            {/* Progress */}
            <div className="h-1 bg-secondary">
              <motion.div className="h-full bg-gradient-to-r from-primary to-accent"
                animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>

            <div className="p-6">
              {/* Close + Step counter */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Step {step + 1} of {TUTORIAL_STEPS.length}
                </span>
                <button onClick={dismiss} className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Icon + Content */}
              <div className="space-y-4">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </motion.div>

                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{current.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{current.description}</p>
                </div>

                {current.tip && (
                  <div className="rounded-xl bg-primary/5 border border-primary/10 px-3 py-2.5 flex items-start gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground/80">{current.tip}</p>
                  </div>
                )}

                {/* Step dots */}
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {TUTORIAL_STEPS.map((_, i) => (
                    <button key={i} onClick={() => goToStep(i)}
                      className={cn("h-2 rounded-full transition-all",
                        i === step ? "w-6 bg-primary" : i < step ? "w-2 bg-primary/40" : "w-2 bg-muted-foreground/20"
                      )} />
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <button onClick={prev} disabled={step === 0}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-0">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>

                <div className="flex items-center gap-3">
                  <button onClick={closeForNow} className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                    Close for now
                  </button>
                  <button onClick={neverShowAgain} className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                    Don't show again
                  </button>
                  <button onClick={next}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    {step === TUTORIAL_STEPS.length - 1 ? "Finish" : "Next"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Trigger Button (for re-launching tutorial) ──────────────

export function TutorialTrigger() {
  const { user } = useAuth();

  const resetTutorial = () => {
    if (user?.id) {
      localStorage.removeItem(`sita-tutorial-${user.id}`);
      window.location.reload();
    }
  };

  return (
    <button onClick={resetTutorial} title="Restart guided tour"
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
      <Lightbulb className="h-3 w-3" /> Tour
    </button>
  );
}
