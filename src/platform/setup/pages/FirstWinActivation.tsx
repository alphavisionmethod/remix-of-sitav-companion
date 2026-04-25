// ═══════════════════════════════════════════════════════════════
// SITA OS — First Win Activation Page
// Post-onboarding page that triggers the user's chosen first workflow
// and creates an emotional "your system is alive" moment
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import {
  UserCheck, DollarSign, Calendar, Home, Target,
  ArrowRight, Check, Sparkles, BarChart3, Bell,
  Shield, Zap, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

// ── Workflow definitions mapped to onboarding firstRecovery choices ──

interface FirstWinWorkflow {
  id: string;
  icon: typeof UserCheck;
  title: string;
  subtitle: string;
  actions: { label: string; detail: string; icon: typeof Check }[];
  destination: string;
  color: string;
}

const WORKFLOWS: Record<string, FirstWinWorkflow> = {
  "missed-followup": {
    id: "missed-followup",
    icon: UserCheck,
    title: "Recover Missed Follow-ups",
    subtitle: "SITA found contacts who need your attention",
    actions: [
      { label: "Scanning leads for stale follow-ups", detail: "Checking last contact dates", icon: Activity },
      { label: "Prioritizing by potential value", detail: "Scoring leads by engagement", icon: BarChart3 },
      { label: "Preparing callback queue", detail: "Ready for your review", icon: Bell },
    ],
    destination: "/business",
    color: "primary",
  },
  "bill-payment": {
    id: "bill-payment",
    icon: DollarSign,
    title: "Build Your Bill Calendar",
    subtitle: "See everything due and plan ahead",
    actions: [
      { label: "Organizing upcoming bills", detail: "Sorting by due date", icon: Calendar },
      { label: "Detecting spending patterns", detail: "Analyzing recurring charges", icon: BarChart3 },
      { label: "Creating your money pulse", detail: "Safe-to-spend ready", icon: Shield },
    ],
    destination: "/money",
    color: "accent",
  },
  "weekly-schedule": {
    id: "weekly-schedule",
    icon: Calendar,
    title: "Prepare Your Week",
    subtitle: "Clarity on what matters this week",
    actions: [
      { label: "Mapping this week's commitments", detail: "Calendar + tasks combined", icon: Calendar },
      { label: "Identifying potential conflicts", detail: "Checking overlaps", icon: Activity },
      { label: "Setting daily priorities", detail: "First pulse ready", icon: Target },
    ],
    destination: "/",
    color: "primary",
  },
  "household-coordination": {
    id: "household-coordination",
    icon: Home,
    title: "Sync Your Household",
    subtitle: "Getting everyone on the same page",
    actions: [
      { label: "Building shared responsibility view", detail: "Who handles what", icon: Home },
      { label: "Syncing family calendar", detail: "School, activities, appointments", icon: Calendar },
      { label: "Creating weekly family pulse", detail: "Ready for review", icon: Bell },
    ],
    destination: "/concierge/household",
    color: "trust-safe",
  },
  "clearer-priorities": {
    id: "clearer-priorities",
    icon: Target,
    title: "Build Your Priority View",
    subtitle: "See what matters most right now",
    actions: [
      { label: "Analyzing your active items", detail: "Tasks, follow-ups, deadlines", icon: Activity },
      { label: "Ranking by urgency and value", detail: "What moves the needle", icon: BarChart3 },
      { label: "Preparing daily pulse", detail: "Your command center awaits", icon: Zap },
    ],
    destination: "/",
    color: "primary",
  },
};

const DEFAULT_WORKFLOW = WORKFLOWS["clearer-priorities"];

// ── Activation Animation ──

function ActivationSequence({
  workflow,
  onComplete,
}: {
  workflow: FirstWinWorkflow;
  onComplete: () => void;
}) {
  const [activeStep, setActiveStep] = useState(-1);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    let step = 0;
    const advance = () => {
      if (step >= workflow.actions.length) {
        setAllDone(true);
        setTimeout(onComplete, 1800);
        return;
      }
      setActiveStep(step);
      step++;
      setTimeout(advance, 1200 + Math.random() * 400);
    };
    // Initial delay for dramatic effect
    setTimeout(advance, 800);
  }, [workflow, onComplete]);

  return (
    <div className="space-y-3">
{workflow.actions.map((action, i) => {
        const isDone = i < activeStep;
        const isActive = i === activeStep;
        const isPending = i > activeStep;

        return (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "rounded-xl border p-4 transition-all duration-500",
              isDone
                ? "border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5"
                : isActive
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/40 bg-secondary/10 opacity-50"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "rounded-lg p-2 transition-all duration-500",
                  isDone
                    ? "bg-[hsl(var(--trust-safe))]/15"
                    : isActive
                      ? "bg-primary/15"
                      : "bg-secondary/40"
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
                ) : isActive ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <action.icon className="h-4 w-4 text-primary" />
                  </motion.div>
                ) : (
                  <action.icon className="h-4 w-4 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    isDone ? "text-foreground" : isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground">{action.detail}</p>
              </div>
              {isDone && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[10px] font-medium text-[hsl(var(--trust-safe))]"
                >
                  Done
                </motion.span>
              )}
              {isActive && (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-[10px] font-medium text-primary"
                >
                  Working…
                </motion.span>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Completion state */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="text-center pt-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, damping: 15 }}
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--trust-safe))] to-[hsl(var(--trust-safe))]/60 shadow-lg shadow-[hsl(var(--trust-safe))]/20 mb-4"
            >
              <Sparkles className="h-7 w-7 text-foreground" />
            </motion.div>
            <p className="text-lg font-bold text-foreground">Your first win is ready</p>
            <p className="text-sm text-muted-foreground mt-1">Entering your operating environment…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──

export default function FirstWinActivation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<FirstWinWorkflow | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  // Load the user's firstRecovery choice from user_memory
  useEffect(() => {
    if (!user) return;

    const loadChoice = async () => {
      try {
        const { data } = await fromTable("user_memory")
          .select("value")
          .eq("user_id", user.id)
          .eq("key", "first_recovery")
          .single();

        const choice = data?.value ? JSON.parse(String(data.value)) : null;
        setWorkflow(WORKFLOWS[choice] || DEFAULT_WORKFLOW);
      } catch {
        setWorkflow(DEFAULT_WORKFLOW);
      }
    };

    loadChoice();
  }, [user]);

  const handleActivate = () => {
    setIsActivating(true);
  };

  const handleComplete = () => {
    // Signal the shell to show desktop entry ceremony
    sessionStorage.setItem("sita-desktop-entry", "true");
    // Signal DailyPulse to show post-arrival first desktop state
    sessionStorage.setItem("sita-post-arrival-trigger", "true");
    navigate("/", { replace: true });
  };

  if (!workflow) {
    return (
      <div className="fixed inset-0 z-[160] flex items-center justify-center bg-background">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm text-muted-foreground"
        >
          Preparing your first win…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-background overflow-y-auto p-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="relative z-10 w-full max-w-lg mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mx-auto mb-5"
          >
            <workflow.icon className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {workflow.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{workflow.subtitle}</p>
        </div>

        {!isActivating ? (
          /* Pre-activation — show what will happen */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {/* Preview of actions */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                What SITA will do
              </p>
              {workflow.actions.map((action, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary p-1.5">
                    <action.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-foreground">{action.label}</p>
                </div>
              ))}
            </div>

            {/* Trust note */}
            <div className="flex items-center gap-2 rounded-xl bg-secondary/20 px-4 py-3">
              <Shield className="h-4 w-4 text-[hsl(var(--trust-safe))] shrink-0" />
              <p className="text-xs text-muted-foreground">
                Every action is logged with proof. Nothing runs without your awareness.
              </p>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => navigate("/", { replace: true })}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip to desktop
              </button>
              <button
                onClick={handleActivate}
                className="rounded-xl px-8 py-3 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/10"
              >
                Activate First Win
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Activation sequence */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ActivationSequence workflow={workflow} onComplete={handleComplete} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
