// ═══════════════════════════════════════════════════════════════
// SITA OS — First Win Setup Step (Phase 2.15)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, ChevronRight, Check, Sparkles, ArrowRight,
  Users, DollarSign, Briefcase, Heart, Calendar, BarChart3,
  ListChecks, Target, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getRecommendationReason } from "@/lib/setup/reflection-copy";

export interface FirstWinData {
  category: string;
  action: string;
  approved: boolean;
  prepared: boolean;
}

interface FirstWinSetupStepProps {
  data: FirstWinData;
  onUpdate: (data: FirstWinData) => void;
  primaryUseMode: string;
  painPoints?: string[];
  toneClass?: "calm" | "neutral" | "energetic";
  onNext: () => void;
  onPrev: () => void;
}

interface WinOption {
  id: string;
  icon: typeof Trophy;
  title: string;
  desc: string;
  preview: string;
  desktopResult: string;
}

const WIN_OPTIONS: Record<string, WinOption[]> = {
  business: [
    { id: "recover-leads", icon: Briefcase, title: "Recover missed leads", desc: "Find leads that haven't been contacted in 14+ days", preview: "SITA will scan your pipeline for stale leads, build a priority callback queue, and prepare follow-up drafts.", desktopResult: "Callback Queue widget on your Business Dashboard" },
    { id: "callback-queue", icon: ListChecks, title: "Build callback queue", desc: "Organize outstanding follow-ups by priority", preview: "SITA will analyze response patterns, identify highest-value contacts, and rank them by urgency.", desktopResult: "Priority Follow-ups in your Daily Pulse" },
    { id: "first-boardroom", icon: BarChart3, title: "Prepare first boardroom review", desc: "Generate your initial business health summary", preview: "SITA will compile revenue trends, pipeline health, and client status into your first Boardroom session.", desktopResult: "Boardroom Review ready for your first session" },
  ],
  money: [
    { id: "bill-calendar", icon: Calendar, title: "Build bill calendar", desc: "Map all upcoming bills and due dates", preview: "SITA will detect recurring charges, create a bill timeline, and flag anything due in the next 7 days.", desktopResult: "Bill Calendar on your Finance Dashboard" },
    { id: "spending-pulse", icon: DollarSign, title: "Create spending pulse", desc: "Analyze your spending patterns this month", preview: "SITA will categorize transactions, identify trends, and surface any unusual charges.", desktopResult: "Spending Pulse widget in your Daily Summary" },
    { id: "savings-focus", icon: Target, title: "Set savings focus", desc: "Identify and track a savings goal", preview: "SITA will analyze your cashflow, suggest a realistic savings target, and track progress daily.", desktopResult: "Savings Goal tracker on your Home Dashboard" },
  ],
  family: [
    { id: "unify-calendar", icon: Calendar, title: "Unify family calendar", desc: "Merge household schedules into one view", preview: "SITA will aggregate all family member calendars, detect conflicts, and suggest resolutions.", desktopResult: "Unified Family Calendar on Concierge Dashboard" },
    { id: "task-rhythm", icon: Clock, title: "Create shared task rhythm", desc: "Set up recurring household responsibilities", preview: "SITA will create a shared task board with assignments, reminders, and completion tracking.", desktopResult: "Household Task Board in your Family Center" },
    { id: "household-board", icon: Users, title: "Prepare household board", desc: "Create a central family coordination hub", preview: "SITA will build a household overview with schedules, tasks, and upcoming events.", desktopResult: "Household Board on your Home Dashboard" },
  ],
  personal: [
    { id: "daily-pulse", icon: Heart, title: "Create daily pulse", desc: "Build your personalized morning briefing", preview: "SITA will compile your priorities, calendar, and action items into a calm morning summary.", desktopResult: "Daily Pulse as your default Home view" },
    { id: "slipping-tasks", icon: ListChecks, title: "Identify slipping tasks", desc: "Find tasks that keep getting postponed", preview: "SITA will scan your task history, flag recurring postponements, and suggest a fresh approach.", desktopResult: "Task Recovery widget in your Daily Pulse" },
    { id: "weekly-plan", icon: Target, title: "Prepare weekly plan", desc: "Generate a structured plan for this week", preview: "SITA will analyze your commitments, priorities, and capacity to build an achievable weekly plan.", desktopResult: "Weekly Plan on your Home Dashboard" },
  ],
  full: [
    { id: "daily-pulse", icon: Heart, title: "Create daily pulse", desc: "Build your personalized morning briefing", preview: "SITA will compile priorities across all domains into a unified morning summary.", desktopResult: "Daily Pulse as your default Home view" },
    { id: "first-boardroom", icon: BarChart3, title: "Prepare first boardroom review", desc: "Cross-domain health summary", preview: "SITA will compile insights from business, finance, and household into your first Boardroom.", desktopResult: "Boardroom Review ready for your first session" },
    { id: "bill-calendar", icon: Calendar, title: "Build bill calendar", desc: "Map all upcoming bills and due dates", preview: "SITA will detect recurring charges and create a comprehensive bill timeline.", desktopResult: "Bill Calendar on your Finance Dashboard" },
  ],
};

const FLOW_STEPS = ["Select", "Preview", "Approve", "Prepare", "Ready"];

export function FirstWinSetupStep({ data, onUpdate, primaryUseMode, painPoints, toneClass, onNext, onPrev }: FirstWinSetupStepProps) {
  const [flowStep, setFlowStep] = useState(data.approved ? (data.prepared ? 4 : 3) : data.action ? 1 : 0);
  // When calm/overwhelmed, prioritize restorative options first
  const baseOptions = WIN_OPTIONS[primaryUseMode] || WIN_OPTIONS.personal;
  const options = toneClass === "calm" ? [
    ...baseOptions.filter(o => o.id.includes("daily-pulse") || o.id.includes("weekly-plan") || o.id.includes("task-rhythm")),
    ...baseOptions.filter(o => !o.id.includes("daily-pulse") && !o.id.includes("weekly-plan") && !o.id.includes("task-rhythm")),
  ] : baseOptions;
  const selectedOption = options.find(o => o.id === data.action);

  // Preparation animation
  useEffect(() => {
    if (flowStep === 3 && !data.prepared) {
      const timer = setTimeout(() => {
        onUpdate({ ...data, prepared: true });
        setFlowStep(4);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [flowStep, data.prepared]);

  const handleSelect = (id: string) => {
    onUpdate({ ...data, action: id, category: primaryUseMode, approved: false, prepared: false });
    setFlowStep(1);
  };

  const handleApprove = () => {
    onUpdate({ ...data, approved: true });
    setFlowStep(3);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4">
          <Trophy className="h-7 w-7 text-primary-foreground" />
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          {toneClass === "calm" ? "One small thing to start" : "Let's set up your first win"}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {toneClass === "calm" ? "Pick something gentle — no pressure" : "Choose one useful thing for SITA to prepare first"}
        </p>
      </div>

      {/* Flow progress */}
      <div className="flex items-center gap-1">
        {FLOW_STEPS.map((step, i) => (
          <div key={step} className="flex-1 flex flex-col items-center gap-1">
            <div className={cn(
              "h-1.5 w-full rounded-full transition-all duration-500",
              i <= flowStep ? "bg-primary" : "bg-muted"
            )} />
            <span className={cn(
              "text-[9px] transition-colors",
              i <= flowStep ? "text-primary font-medium" : "text-muted-foreground"
            )}>{step}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Select */}
        {flowStep === 0 && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
            {options.map((opt, i) => {
              const reason = getRecommendationReason("firstWin", opt.id, { primaryUseMode, painPoints });
              return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleSelect(opt.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full rounded-xl border border-border bg-card hover:border-primary/30 p-4 text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-secondary p-2.5">
                    <opt.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{opt.title}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    {reason && <p className="text-[10px] text-primary/70 mt-0.5">{reason}</p>}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Step 1: Preview */}
        {flowStep === 1 && selectedOption && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/15 p-2.5">
                  <selectedOption.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedOption.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedOption.desc}</p>
                </div>
              </div>

              <div className="rounded-xl bg-card/80 border border-border/50 p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">What SITA will do</p>
                <p className="text-xs text-foreground leading-relaxed">{selectedOption.preview}</p>
              </div>

              <div className="rounded-xl bg-card/80 border border-border/50 p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">What appears on your desktop</p>
                <p className="text-xs text-foreground leading-relaxed">{selectedOption.desktopResult}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => { setFlowStep(0); onUpdate({ ...data, action: "", approved: false, prepared: false }); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">Choose different</button>
              <button onClick={handleApprove}
                className="rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2">
                Approve this first win <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Preparing */}
        {flowStep === 3 && !data.prepared && (
          <motion.div key="preparing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-12 space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20"
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>
            <p className="text-sm font-semibold text-foreground">Preparing your first win…</p>
            <p className="text-xs text-muted-foreground">SITA is setting things up for you</p>
          </motion.div>
        )}

        {/* Step 4: Ready */}
        {flowStep === 4 && data.prepared && selectedOption && (
          <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="rounded-2xl border border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5 p-6 text-center space-y-3">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--trust-safe))]/15">
                <Check className="h-7 w-7 text-[hsl(var(--trust-safe))]" />
              </motion.div>
              <p className="text-sm font-semibold text-foreground">Your first win is ready</p>
              <p className="text-xs text-muted-foreground">{selectedOption.desktopResult}</p>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
              <button onClick={onNext}
                className="rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2">
                Continue <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation for early steps */}
      {flowStep < 3 && flowStep !== 1 && (
        <div className="flex items-center justify-between pt-2">
          <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
        </div>
      )}
    </motion.div>
  );
}
