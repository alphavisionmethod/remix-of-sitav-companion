import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SitaButton, SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useOnboardingResume, type OnboardingBranch } from "@/platform/setup/hooks/useOnboardingResume";

import { useActionFn } from "@/hooks/use-action";
import { toast } from "sonner";
import logo from "@/assets/logo.webp";
import {
  Briefcase, DollarSign, Headphones, ChevronRight, ChevronLeft, Check, User, Building,
  Shield, Brain, Zap, Clock, Mail, Calendar, FileText, Sparkles, CheckCircle, ArrowRight,
  Home, Users, CreditCard, BarChart3, Heart, Globe, Lock, Eye, Sliders, RotateCcw
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

type Step = "welcome" | "role" | "business" | "finance" | "concierge" | "trust" | "preferences" | "first-win" | "review" | "complete";

interface OnboardingState {
  role: string;
  businessName: string;
  industry: string;
  businessGoals: string[];
  bankConnected: boolean;
  accountingConnected: boolean;
  householdSize: string;
  conciergeGoals: string[];
  trustLevel: "standard" | "careful" | "strict";
  explanationDensity: "minimal" | "balanced" | "detailed";
  communicationStyle: "direct" | "supportive" | "analytical";
  firstWin: string;
}

const defaultState: OnboardingState = {
  role: "", businessName: "", industry: "", businessGoals: [], bankConnected: false, accountingConnected: false,
  householdSize: "", conciergeGoals: [], trustLevel: "careful", explanationDensity: "balanced",
  communicationStyle: "supportive", firstWin: "",
};

const stepOrder: Step[] = ["welcome", "role", "business", "finance", "concierge", "trust", "preferences", "first-win", "review", "complete"];

const fadeVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const SelectableChip = ({ label, selected, onClick, icon: Icon }: { label: string; selected: boolean; onClick: () => void; icon?: typeof Briefcase }) => (
  <button onClick={onClick} className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${selected ? "border-primary/50 bg-primary/10 text-primary shadow-xs" : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/20 hover:text-foreground"}`}>
    {Icon && <Icon className="h-4 w-4" />}
    {label}
    {selected && <Check className="h-3.5 w-3.5 ml-auto" />}
  </button>
);

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center gap-3">
    <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
      <motion.div className="h-full rounded-full gradient-sita" initial={{ width: 0 }} animate={{ width: `${(current / total) * 100}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
    </div>
    <span className="text-[11px] text-muted-foreground font-medium">{current}/{total}</span>
  </div>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("welcome");
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isSaving, setIsSaving] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // Resume/re-entry telemetry — first-use audit P1.4 client wiring
  const { checkpoint, isLoading: resumeLoading, saveCheckpoint, clearCheckpoint } = useOnboardingResume();

  const idx = stepOrder.indexOf(step);

  // Map step index → 1..29 ceremony screen (master spec)
  const screenForStep = useCallback((s: Step) => {
    const i = stepOrder.indexOf(s);
    // 10 steps mapped onto screens 1..29 (welcome=1, complete=29)
    return Math.max(1, Math.min(29, Math.round(1 + (i / (stepOrder.length - 1)) * 28)));
  }, []);

  // Persist checkpoint on every step change after welcome (debounced inside hook)
  useEffect(() => {
    if (!user || step === "welcome" || step === "complete") return;
    const branch: OnboardingBranch = "balanced"; // legacy flow → balanced depth
    saveCheckpoint({
      currentScreen: screenForStep(step),
      branch,
      profileSnapshot: state as unknown as Record<string, unknown>,
      conditionalState: { step },
      lastCompletedScreen: idx > 0 ? screenForStep(stepOrder[idx - 1]) : null,
    });
  }, [step, state, user, idx, screenForStep, saveCheckpoint]);

  // Surface resume prompt once checkpoint loads (only at welcome)
  useEffect(() => {
    if (!resumeLoading && checkpoint && step === "welcome") {
      setShowResumePrompt(true);
    }
  }, [resumeLoading, checkpoint, step]);

  const handleResume = () => {
    if (!checkpoint) return;
    const restoredStep = (checkpoint.conditional_state?.step as Step) ?? "role";
    const restoredState = checkpoint.profile_snapshot as Partial<OnboardingState>;
    setState((prev) => ({ ...prev, ...restoredState }));
    setStep(restoredStep);
    setShowResumePrompt(false);
    toast.success("Resumed where you left off");
  };

  const handleStartFresh = () => {
    clearCheckpoint();
    setShowResumePrompt(false);
  };

  const next = async () => {
    if (step === "review") {
      await persistOnboardingData();
    }
    if (idx < stepOrder.length - 1) {
      const nextStep = stepOrder[idx + 1];
      setStep(nextStep);
      // On final completion, clear server-side checkpoint
      if (nextStep === "complete") clearCheckpoint();
    }
  };
  const prev = () => idx > 0 && setStep(stepOrder[idx - 1]);

  const upsertMemory = useActionFn("workspace", "memory.upsert", { silent: true });
  const updateProfile = useActionFn("workspace", "profile.update", { silent: true });

  const persistOnboardingData = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const memoryItems = [
        { user_id: user.id, key: "role", value: JSON.stringify(state.role), category: "preference" },
        { user_id: user.id, key: "business_name", value: JSON.stringify(state.businessName), category: "profile" },
        { user_id: user.id, key: "industry", value: JSON.stringify(state.industry), category: "profile" },
        { user_id: user.id, key: "business_goals", value: JSON.stringify(state.businessGoals), category: "preference" },
        { user_id: user.id, key: "household_size", value: JSON.stringify(state.householdSize), category: "profile" },
        { user_id: user.id, key: "concierge_goals", value: JSON.stringify(state.conciergeGoals), category: "preference" },
        { user_id: user.id, key: "trust_level", value: JSON.stringify(state.trustLevel), category: "preference" },
        { user_id: user.id, key: "explanation_density", value: JSON.stringify(state.explanationDensity), category: "preference" },
        { user_id: user.id, key: "communication_style", value: JSON.stringify(state.communicationStyle), category: "preference" },
        { user_id: user.id, key: "first_win", value: JSON.stringify(state.firstWin), category: "preference" },
      ].filter(m => m.value && m.value !== '""' && m.value !== "[]");

      // Route through kernel — no direct DB writes
      await upsertMemory({ table: "user_memory", items: memoryItems, onConflict: "user_id,key" });
      await updateProfile({ table: "profiles", updates: { onboarding_completed: true }, userId: user.id });
      toast.success("Your preferences have been saved!");
    } catch (e) {
      console.error("Onboarding persistence error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const toggle = (key: keyof OnboardingState, value: string) => {
    setState(prev => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const healthScore = useCallback(() => {
    let score = 0;
    if (state.role) score += 15;
    if (state.businessName) score += 10;
    if (state.industry) score += 5;
    if (state.businessGoals.length > 0) score += 10;
    if (state.bankConnected) score += 10;
    if (state.accountingConnected) score += 10;
    if (state.householdSize) score += 5;
    if (state.conciergeGoals.length > 0) score += 10;
    if (state.trustLevel) score += 5;
    if (state.explanationDensity) score += 5;
    if (state.firstWin) score += 15;
    return Math.min(100, score);
  }, [state]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-y-auto">
<div className="w-full max-w-2xl px-6 py-12">
        {step !== "welcome" && step !== "complete" && (
          <div className="mb-8">
            <ProgressBar current={idx} total={stepOrder.length - 2} />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={step} variants={fadeVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>

            {/* ======================== WELCOME ======================== */}
            {step === "welcome" && (
              <div className="text-center space-y-8">
                {showResumePrompt && checkpoint && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-primary/40 bg-primary/5 p-5 max-w-md mx-auto text-left"
                    data-testid="resume-prompt"
                  >
                    <div className="flex items-start gap-3">
                      <RotateCcw className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Resume where you left off?</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          We saved your progress on screen {checkpoint.current_screen} of 29.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <SitaButton variant="primary" size="sm" onClick={handleResume} data-testid="resume-accept">Resume</SitaButton>
                          <SitaButton variant="ghost" size="sm" onClick={handleStartFresh} data-testid="resume-decline">Start Fresh</SitaButton>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <img src={logo} loading="lazy" alt="SITA OS" className="mx-auto h-24 w-24 rounded-3xl shadow-glow-purple" />
                </motion.div>
                <div className="space-y-3">
                  <h1 className="font-display text-4xl font-bold tracking-tight gradient-sita-text">Welcome to SITA</h1>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">Your intelligent operating system for business, money, and life. Let's build your operating model.</p>
                </div>
                <div className="rounded-2xl gradient-sita-subtle border border-border p-6 text-left max-w-md mx-auto">
                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Built on Trust</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-trust-verified shrink-0 mt-0.5" /> Every action has a proof trail</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-trust-verified shrink-0 mt-0.5" /> High-impact actions require your approval</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-trust-verified shrink-0 mt-0.5" /> You control what SITA sees and remembers</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-trust-verified shrink-0 mt-0.5" /> Advisors explain their reasoning</li>
                  </ul>
                </div>
                <SitaButton variant="primary" onClick={next} className="px-8 py-3 text-base">Get Started <ChevronRight className="h-4 w-4" /></SitaButton>
                <p className="text-xs text-muted-foreground">Setup takes about 5 minutes · You can change everything later</p>
              </div>
            )}

            {/* ======================== ROLE ======================== */}
            {step === "role" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="font-display text-2xl font-bold text-foreground">How will you use SITA?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Select your primary role — this shapes your home screen and advisor focus</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "founder", label: "Founder / Operator", desc: "Running a service business — leads, clients, revenue", icon: Briefcase },
                    { key: "executive", label: "Executive", desc: "Managing operations, team, and growth strategy", icon: BarChart3 },
                    { key: "family-office", label: "Family Office / Premium", desc: "Full-service — business, personal finance, household", icon: Building },
                    { key: "personal", label: "Personal / Household", desc: "Life operations — finances, family, household management", icon: Home },
                  ].map((r) => (
                    <button key={r.key} onClick={() => setState(s => ({ ...s, role: r.key }))} className={`rounded-2xl border p-5 text-left transition-all duration-200 ${state.role === r.key ? "border-primary/50 bg-primary/8 shadow-glow-purple" : "border-border bg-card hover:border-primary/20"}`}>
                      <r.icon className={`h-6 w-6 mb-3 ${state.role === r.key ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="font-display text-sm font-semibold text-foreground">{r.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ======================== BUSINESS ======================== */}
            {step === "business" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10"><Briefcase className="h-6 w-6 text-primary" /></div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Your Business</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Tell SITA about your business so it can set up your command center</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business Name</label>
                    <input value={state.businessName} onChange={e => setState(s => ({ ...s, businessName: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all" placeholder="e.g. Johnson Consulting" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Industry</label>
                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                      {["Consulting", "Agency", "Trades", "Legal", "Healthcare", "Other"].map((ind) => (
                        <SelectableChip key={ind} label={ind} selected={state.industry === ind} onClick={() => setState(s => ({ ...s, industry: ind }))} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business Goals</label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      {["Close more leads", "Get paid faster", "Track opportunities", "Reduce admin work", "Weekly reviews", "Customer insights"].map((g) => (
                        <SelectableChip key={g} label={g} selected={state.businessGoals.includes(g)} onClick={() => toggle("businessGoals", g)} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================== FINANCE ======================== */}
            {step === "finance" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10"><DollarSign className="h-6 w-6 text-accent" /></div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Your Finances</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Connect your accounts so SITA can give you a clear financial picture</p>
                </div>
                <div className="space-y-4">
                  <button onClick={() => setState(s => ({ ...s, bankConnected: !s.bankConnected }))} className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${state.bankConnected ? "border-trust-verified/40 bg-trust-verified/5" : "border-border bg-card hover:border-primary/20"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className={`h-5 w-5 ${state.bankConnected ? "text-trust-verified" : "text-muted-foreground"}`} />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Bank Accounts</p>
                          <p className="text-xs text-muted-foreground">Connect checking, savings, credit cards</p>
                        </div>
                      </div>
                      {state.bankConnected ? <TrustBadge level="verified" label="Connected" size="sm" /> : <SitaButton variant="accent" size="sm">Connect</SitaButton>}
                    </div>
                  </button>
                  <button onClick={() => setState(s => ({ ...s, accountingConnected: !s.accountingConnected }))} className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${state.accountingConnected ? "border-trust-verified/40 bg-trust-verified/5" : "border-border bg-card hover:border-primary/20"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className={`h-5 w-5 ${state.accountingConnected ? "text-trust-verified" : "text-muted-foreground"}`} />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Accounting Software</p>
                          <p className="text-xs text-muted-foreground">QuickBooks, Xero, FreshBooks, or Wave</p>
                        </div>
                      </div>
                      {state.accountingConnected ? <TrustBadge level="verified" label="Connected" size="sm" /> : <SitaButton variant="accent" size="sm">Connect</SitaButton>}
                    </div>
                  </button>
                  <p className="text-center text-xs text-muted-foreground">Skip this for now — you can connect later from Settings</p>
                </div>
              </div>
            )}

            {/* ======================== CONCIERGE ======================== */}
            {step === "concierge" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10"><Headphones className="h-6 w-6 text-primary" /></div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Your Life Operations</h2>
                  <p className="mt-2 text-sm text-muted-foreground">SITA manages your household and personal operations alongside business</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Household Size</label>
                  <div className="mt-1.5 grid grid-cols-4 gap-2">
                    {["Just me", "2 people", "Family (3-5)", "Large (6+)"].map((h) => (
                      <SelectableChip key={h} label={h} selected={state.householdSize === h} onClick={() => setState(s => ({ ...s, householdSize: h }))} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Concierge Goals</label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {["Track appointments", "Household tasks", "Family calendar", "Travel planning", "Bill reminders", "Grocery planning", "School activities", "Service providers"].map((g) => (
                      <SelectableChip key={g} label={g} selected={state.conciergeGoals.includes(g)} onClick={() => toggle("conciergeGoals", g)} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================== TRUST ======================== */}
            {step === "trust" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10"><Shield className="h-6 w-6 text-primary" /></div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Trust & Approval Settings</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Control how much autonomy SITA has — you can adjust this anytime</p>
                </div>
                <div className="space-y-3">
                  {([
                    { key: "standard", label: "Standard", desc: "SITA handles routine tasks automatically, asks approval for anything financial or high-impact", icon: Zap },
                    { key: "careful", label: "Careful (Recommended)", desc: "SITA proposes actions and waits for approval on most things — best for getting started", icon: Shield },
                    { key: "strict", label: "Strict", desc: "SITA does nothing without explicit approval — maximum control, more friction", icon: Lock },
                  ] as const).map((t) => (
                    <button key={t.key} onClick={() => setState(s => ({ ...s, trustLevel: t.key }))} className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${state.trustLevel === t.key ? "border-primary/50 bg-primary/8 shadow-glow-purple" : "border-border bg-card hover:border-primary/20"}`}>
                      <div className="flex items-start gap-3">
                        <t.icon className={`h-5 w-5 mt-0.5 ${state.trustLevel === t.key ? "text-primary" : "text-muted-foreground"}`} />
                        <div>
                          <p className="font-display text-sm font-semibold text-foreground">{t.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ======================== PREFERENCES ======================== */}
            {step === "preferences" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10"><Sliders className="h-6 w-6 text-primary" /></div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Your Preferences</h2>
                  <p className="mt-2 text-sm text-muted-foreground">How should SITA communicate with you?</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Explanation Density</label>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {([
                      { key: "minimal", label: "Minimal", desc: "Just the essentials" },
                      { key: "balanced", label: "Balanced", desc: "Key details + reasoning" },
                      { key: "detailed", label: "Detailed", desc: "Full context always" },
                    ] as const).map((e) => (
                      <button key={e.key} onClick={() => setState(s => ({ ...s, explanationDensity: e.key }))} className={`rounded-xl border p-3 text-left transition-all ${state.explanationDensity === e.key ? "border-primary/50 bg-primary/8" : "border-border bg-card hover:border-primary/20"}`}>
                        <p className="text-sm font-semibold text-foreground">{e.label}</p>
                        <p className="text-[11px] text-muted-foreground">{e.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Communication Style</label>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {([
                      { key: "direct", label: "Direct", desc: "Straight to the point" },
                      { key: "supportive", label: "Supportive", desc: "Encouraging & clear" },
                      { key: "analytical", label: "Analytical", desc: "Data-driven reasoning" },
                    ] as const).map((c) => (
                      <button key={c.key} onClick={() => setState(s => ({ ...s, communicationStyle: c.key }))} className={`rounded-xl border p-3 text-left transition-all ${state.communicationStyle === c.key ? "border-primary/50 bg-primary/8" : "border-border bg-card hover:border-primary/20"}`}>
                        <p className="text-sm font-semibold text-foreground">{c.label}</p>
                        <p className="text-[11px] text-muted-foreground">{c.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================== FIRST WIN ======================== */}
            {step === "first-win" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10"><Sparkles className="h-6 w-6 text-accent" /></div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Your First Win</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Pick one thing SITA should do for you right now — experience the value instantly</p>
                </div>
                <div className="space-y-3">
                  {[
                    { key: "lead-intake", label: "Set up lead intake", desc: "Automatically capture and organize incoming leads from email and web", icon: Briefcase },
                    { key: "bill-tracking", label: "Track upcoming bills", desc: "SITA monitors your bills and alerts you before they're due", icon: DollarSign },
                    { key: "weekly-review", label: "Schedule weekly boardroom", desc: "Get a weekly summary of what happened, what's at risk, and what to do", icon: BarChart3 },
                    { key: "callback-scheduler", label: "Automate follow-up reminders", desc: "Never miss a callback — SITA reminds you when leads go stale", icon: Clock },
                    { key: "household-sync", label: "Set up household calendar", desc: "Centralize family events, tasks, and reminders in one place", icon: Calendar },
                  ].map((w) => (
                    <button key={w.key} onClick={() => setState(s => ({ ...s, firstWin: w.key }))} className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${state.firstWin === w.key ? "border-accent/50 bg-accent/8 shadow-glow-gold" : "border-border bg-card hover:border-accent/20"}`}>
                      <div className="flex items-start gap-3">
                        <w.icon className={`h-5 w-5 mt-0.5 ${state.firstWin === w.key ? "text-accent" : "text-muted-foreground"}`} />
                        <div>
                          <p className="font-display text-sm font-semibold text-foreground">{w.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{w.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ======================== REVIEW ======================== */}
            {step === "review" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="font-display text-2xl font-bold text-foreground">Review Your Setup</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Here's your SITA operating model — you can change any of this later</p>
                </div>

                {/* Health Score */}
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="h-32 w-32" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                      <circle cx="60" cy="60" r="52" fill="none" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(healthScore() / 100) * 327} 327`} transform="rotate(-90 60 60)" />
                      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="hsl(var(--sita-purple))" /><stop offset="100%" stopColor="hsl(var(--sita-gold))" /></linearGradient></defs>
                    </svg>
                    <div className="absolute">
                      <p className="font-display text-3xl font-bold text-foreground">{healthScore()}%</p>
                      <p className="text-[10px] text-muted-foreground">Setup Health</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Role", value: state.role || "Not set", done: !!state.role },
                    { label: "Business", value: state.businessName || "Not set", done: !!state.businessName },
                    { label: "Industry", value: state.industry || "Not set", done: !!state.industry },
                    { label: "Business Goals", value: state.businessGoals.length ? `${state.businessGoals.length} selected` : "None", done: state.businessGoals.length > 0 },
                    { label: "Bank Connected", value: state.bankConnected ? "Yes" : "Skip", done: state.bankConnected },
                    { label: "Accounting", value: state.accountingConnected ? "Connected" : "Skip", done: state.accountingConnected },
                    { label: "Household", value: state.householdSize || "Not set", done: !!state.householdSize },
                    { label: "Concierge Goals", value: state.conciergeGoals.length ? `${state.conciergeGoals.length} selected` : "None", done: state.conciergeGoals.length > 0 },
                    { label: "Trust Level", value: state.trustLevel, done: true },
                    { label: "First Win", value: state.firstWin ? state.firstWin.replace(/-/g, " ") : "Not selected", done: !!state.firstWin },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${item.done ? "bg-trust-verified" : "bg-muted"}`} />
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground capitalize">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================== COMPLETE ======================== */}
            {step === "complete" && (
              <div className="text-center space-y-8">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, type: "spring" }}>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl gradient-sita shadow-glow-purple">
                    <CheckCircle className="h-10 w-10 text-primary-foreground" />
                  </div>
                </motion.div>
                <div className="space-y-3">
                  <h2 className="font-display text-3xl font-bold text-foreground">You're All Set</h2>
                  <p className="text-base text-muted-foreground max-w-md mx-auto">SITA is ready to operate. Your {state.firstWin ? state.firstWin.replace(/-/g, " ") : "first automation"} is being set up.</p>
                </div>
                <div className="rounded-2xl gradient-sita-subtle border border-border p-6 max-w-md mx-auto text-left space-y-3">
                  <p className="text-sm font-semibold text-foreground">What happens next:</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" /> Your Daily Pulse is personalized to your role</p>
                    <p className="flex items-start gap-2"><Briefcase className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Business, Finance, and Concierge centers are configured</p>
                    <p className="flex items-start gap-2"><Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Trust controls are set to "{state.trustLevel}" mode</p>
                    <p className="flex items-start gap-2"><BarChart3 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Your first Boardroom review will be ready next week</p>
                  </div>
                </div>
                <SitaButton variant="primary" onClick={() => navigate("/")} className="px-8 py-3 text-base">
                  Enter SITA OS <ArrowRight className="h-4 w-4" />
                </SitaButton>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step !== "welcome" && step !== "complete" && (
          <div className="mt-8 flex items-center justify-between">
            <SitaButton variant="ghost" onClick={prev}><ChevronLeft className="h-4 w-4" /> Back</SitaButton>
            <SitaButton variant="primary" onClick={next}>
              {step === "review" ? "Launch SITA" : "Continue"} <ChevronRight className="h-4 w-4" />
            </SitaButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
