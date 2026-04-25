import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Sparkles, Brain, Briefcase, DollarSign, Headphones, Rocket, Shield, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TourStep {
  title: string;
  description: string;
  icon: React.ElementType;
  highlight?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to SITA OS",
    description: "Your sovereign AI operating system. One brain, three domains — Business, Finance, and Concierge — all working together for you.",
    icon: Brain,
  },
  {
    title: "Daily Pulse",
    description: "Your home screen shows what needs attention right now. KPIs, advisor moves, and cross-domain intelligence — all in one glance.",
    icon: Sparkles,
    highlight: "/",
  },
  {
    title: "Business Center",
    description: "Manage leads, customers, opportunities, quotes, and invoices. Your AI advisor watches for stale leads and revenue gaps.",
    icon: Briefcase,
    highlight: "/business",
  },
  {
    title: "Finance Center",
    description: "Track bills, subscriptions, reserves, and cash timing. The finance advisor detects waste and protects your runway.",
    icon: DollarSign,
    highlight: "/money",
  },
  {
    title: "Concierge Center",
    description: "Tasks, calendar, appointments, travel, and household coordination. Your personal life, organized by AI.",
    icon: Headphones,
    highlight: "/concierge",
  },
  {
    title: "Mission Control",
    description: "Monitor your AI fleet, review audit logs, check compliance status, and view predictive analysis — all from one command center.",
    icon: Shield,
    highlight: "/mission-control",
  },
  {
    title: "Predictive & Compliance",
    description: "ML-driven failure predictions, ISO 27001/SOC 2 compliance tracking, and real-time SLA monitoring keep you audit-ready.",
    icon: BarChart3,
    highlight: "/mission-control?tab=predictive",
  },
  {
    title: "You're Ready!",
    description: "Click the brain icon in the bottom-right to chat with your advisors anytime. Press ⌘K for quick search. Let's go!",
    icon: Rocket,
  },
];

export const WelcomeTour = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    const flag = localStorage.getItem(`sita-tour-${user.id}`);
    // Only suppress if permanently dismissed
    if (flag !== "never") setShow(true);
  }, [user?.id]);

  const closeForNow = () => {
    setShow(false);
    // No localStorage write — will show again next session
  };

  const neverShowAgain = () => {
    setShow(false);
    if (user?.id) localStorage.setItem(`sita-tour-${user.id}`, "never");
  };

  const finishTour = () => {
    setShow(false);
    // After completing the full tour, don't show again
    if (user?.id) localStorage.setItem(`sita-tour-${user.id}`, "never");
  };

  const next = () => {
    if (step < TOUR_STEPS.length - 1) setStep(s => s + 1);
    else finishTour();
  };
  const prev = () => { if (step > 0) setStep(s => s - 1); };

  const current = TOUR_STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / TOUR_STEPS.length) * 100;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-2xl"
          >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl overflow-hidden bg-secondary">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Close */}
            <button onClick={closeForNow} className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-sita shadow-glow-purple"
              >
                <Icon className="h-8 w-8 text-primary-foreground" />
              </motion.div>

              <div>
                <h2 className="font-display text-xl font-bold text-foreground">{current.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {current.description}
                </p>
              </div>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-1.5 pt-2">
                {TOUR_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                  />
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={prev}
                disabled={step === 0}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>

              <button
                onClick={next}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                {step === TOUR_STEPS.length - 1 ? "Get Started" : "Next"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Dismiss options */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <button onClick={closeForNow} className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                Close for now
              </button>
              <span className="text-muted-foreground/20 text-[10px]">·</span>
              <button onClick={neverShowAgain} className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                Don't show again
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
