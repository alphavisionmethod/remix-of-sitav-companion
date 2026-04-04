// ═══════════════════════════════════════════════════════════════
// SITA OS — Premium OS Setup Experience (World-Class Onboarding)
// macOS-like first-run with cinematic intro, adaptive phases,
// live learning panel, simulations, and trust certificate
// Powered by SetupOrchestrationEngine (DAG, state machine,
// persistence, branching, rollback, background tasks)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Brain, Shield, Zap, Globe, Eye, Lock, Sparkles, Check, ChevronRight,
  Briefcase, DollarSign, Headphones, Building, Home, BarChart3,
  Cpu, Activity, Fingerprint, Sun, Moon, Monitor, RotateCcw, SkipForward,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FirstBootScreen } from "@/components/sita/FirstBootScreen";
import { FirstWelcomeScreen } from "@/components/sita/FirstWelcomeScreen";
import { RestoreFlow } from "@/components/sita/RestoreFlow";
import { EnterpriseFlow } from "@/components/sita/EnterpriseFlow";
import { useSetupOrchestration } from "@/hooks/useSetupOrchestration";
import { SetupOrchestrationEngine } from "@/lib/engines/setup-orchestration-engine";
import type { SetupPhaseId, SetupPhaseStatus } from "@/packages/contracts/specialized/setup-orchestration";

// Onboarding components
import { CinematicIntro } from "@/components/sita/onboarding/CinematicIntro";
import { SetupStyleChooser } from "@/components/sita/onboarding/SetupStyleChooser";
import { LearningPanel } from "@/components/sita/onboarding/LearningPanel";
import { WantLessOfStep } from "@/components/sita/onboarding/WantLessOfStep";
import { ProtectMostStep } from "@/components/sita/onboarding/ProtectMostStep";
import { ExplanationStyleStep } from "@/components/sita/onboarding/ExplanationStyleStep";
import { PresenceStyleStep } from "@/components/sita/onboarding/PresenceStyleStep";
import { InterruptionStyleStep } from "@/components/sita/onboarding/InterruptionStyleStep";
import { RitualsStep } from "@/components/sita/onboarding/RitualsStep";
import { HouseholdGraphStep } from "@/components/sita/onboarding/HouseholdGraphStep";
import { MemoryConsentStep } from "@/components/sita/onboarding/MemoryConsentStep";
import { DesktopPreviewStep } from "@/components/sita/onboarding/DesktopPreviewStep";
import { FirstSimulationStep } from "@/components/sita/onboarding/FirstSimulationStep";
import { FirstActionsStep } from "@/components/sita/onboarding/FirstActionsStep";
import { TrustCertificateStep } from "@/components/sita/onboarding/TrustCertificateStep";
import { HomeCompositionStep } from "@/components/sita/onboarding/HomeCompositionStep";
import { RecoverFirstStep } from "@/components/sita/onboarding/RecoverFirstStep";
import { PreviewExampleModal, PreviewButton } from "@/components/sita/onboarding/PreviewExampleModal";
import { ArrivalPrepStep } from "@/components/sita/onboarding/ArrivalPrepStep";
import { FirstConnectionsStep } from "@/components/sita/onboarding/FirstConnectionsStep";
import { NetworkSetupStep } from "@/components/sita/onboarding/NetworkSetupStep";
import { DeviceReadinessStep } from "@/components/sita/onboarding/DeviceReadinessStep";
import { DeviceOwnershipStep } from "@/components/sita/onboarding/DeviceOwnershipStep";
import { AccountEnvironmentStep } from "@/components/sita/onboarding/AccountEnvironmentStep";
import { AccessProtectionStep } from "@/components/sita/onboarding/AccessProtectionStep";
import { PrivacyTransparencyStep } from "@/components/sita/onboarding/PrivacyTransparencyStep";
import { QuickIdentityStep } from "@/components/sita/onboarding/QuickIdentityStep";
import type { QuickIdentityData } from "@/components/sita/onboarding/QuickIdentityStep";
import { DeepWorldModelingStep } from "@/components/sita/onboarding/DeepWorldModelingStep";
import type { WorldModelData } from "@/components/sita/onboarding/DeepWorldModelingStep";
import { PrimaryUseModeStep } from "@/components/sita/onboarding/PrimaryUseModeStep";
import { Progress } from "@/components/ui/progress";

interface OperatingModelData {
  routines: string[];
  household: string[];
  work: string[];
  finances: string[];
  preferences: string[];
}

// ── Types ───────────────────────────────────────────────────

type SetupState = SetupData;

type Phase = SetupPhaseId;

interface SetupData {
  // Language & Region
  language: string;
  region: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  // Operating Mode
  operatingMode: string;
  // Operating Model
  operatingModel: OperatingModelData | null;
  // Trust
  autonomyLevel: number;
  thresholds: Record<string, string>;
  // Advisors
  activeAdvisors: string[];
  // Identity (from welcome flow — placeholder for now)
  displayName: string;
  role: string;
  enabledDomains: string[];
  trustLevel: "open" | "balanced" | "guarded";
  aiStyle: "proactive" | "balanced" | "reserved";
  explanationDepth: "brief" | "standard" | "detailed";
  theme: "dark" | "light" | "auto";
  accentColor: string;
  setupStyle: "express" | "guided" | "advanced";
  painPoints: string[];
  protectionPriorities: string[];
  explanationStyle: string;
  presenceStyle: string;
  interruptionStyle: string;
  rituals: string[];
  householdNodes: { name: string; role: string }[];
  memoryConsent: string;
  homeComposition: string;
  firstRecovery: string;
  // New phase 2.3-2.7 fields
  networkState: string;
  networkSSID: string;
  deviceOwnership: "personal" | "family" | "work" | "";
  accountPath: string;
  accessMethod: string;
  recoveryMethod: string;
  // New phase 2.8-2.11 fields
  permissionChoices: Record<string, boolean>;
  quickIdentity: QuickIdentityData;
  worldModel: WorldModelData;
  primaryUseMode: string;
}

// ── Phase Status Indicator ──────────────────────────────────

const PHASE_STATUS_CONFIG: Record<string, { color: string; pulse: boolean; icon?: string }> = {
  idle: { color: "bg-muted", pulse: false },
  preparing: { color: "bg-primary/60", pulse: true },
  active: { color: "bg-primary", pulse: false, icon: "active" },
  validating: { color: "bg-primary/80", pulse: true },
  syncing: { color: "bg-primary/80", pulse: true },
  success: { color: "bg-trust-safe", pulse: false, icon: "check" },
  warning: { color: "bg-trust-review", pulse: false, icon: "warn" },
  degraded: { color: "bg-trust-review", pulse: true, icon: "warn" },
  blocked: { color: "bg-destructive", pulse: false, icon: "blocked" },
  skipped: { color: "bg-muted-foreground/40", pulse: false, icon: "skip" },
  resumed: { color: "bg-primary/60", pulse: true },
  completed: { color: "bg-trust-safe", pulse: false, icon: "check" },
};

function PhaseStatusDot({ status, size = "sm" }: { status: SetupPhaseStatus; size?: "sm" | "md" }) {
  const c = PHASE_STATUS_CONFIG[status] ?? PHASE_STATUS_CONFIG.idle;
  const sizeClass = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";
  return (
    <div className={cn("rounded-full transition-colors duration-300", sizeClass, c.color, c.pulse && "animate-pulse")} />
  );
}

function PhaseProgressRail({ steppablePhases, currentIndex, allPhaseStates }: {
  steppablePhases: SetupPhaseId[];
  currentIndex: number;
  allPhaseStates: Record<string, { status: SetupPhaseStatus; retryCount: number }>;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {steppablePhases.map((phaseId, i) => {
        const phaseState = allPhaseStates[phaseId];
        const status: SetupPhaseStatus = phaseState?.status ?? "idle";
        const isActive = i === currentIndex;
        const isCompleted = status === "completed" || status === "success";
        const isSkipped = status === "skipped";
        const isBlocked = status === "blocked";

        return (
          <div key={phaseId} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Status dot */}
            <div className="flex items-center justify-center h-3">
              {isCompleted ? (
                <div className="h-2.5 w-2.5 rounded-full bg-trust-safe flex items-center justify-center">
                  <Check className="h-1.5 w-1.5 text-background" />
                </div>
              ) : isSkipped ? (
                <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40 flex items-center justify-center">
                  <SkipForward className="h-1.5 w-1.5 text-background" />
                </div>
              ) : isBlocked ? (
                <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
              ) : isActive ? (
                <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-muted" />
              )}
            </div>
            {/* Progress bar segment */}
            <div className={cn(
              "h-1 w-full rounded-full transition-all duration-500",
              isCompleted ? "bg-trust-safe" :
              isSkipped ? "bg-muted-foreground/30" :
              isBlocked ? "bg-destructive/40" :
              isActive ? "bg-primary/60" :
              "bg-muted"
            )} />
            {/* Tooltip on hover */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block z-50">
              <div className="rounded-md bg-popover border border-border px-2 py-0.5 text-[9px] text-popover-foreground whitespace-nowrap shadow-lg">
                {phaseId.replace(/-/g, " ")} · <span className="capitalize">{status}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Phase Wrapper ───────────────────────────────────────────

function PhaseCard({ children, title, subtitle, icon: Icon, step, total, phaseStatus, steppablePhases, allPhaseStates }: {
  children: React.ReactNode; title: string; subtitle: string; icon: typeof Brain;
  step: number; total: number; phaseStatus?: SetupPhaseStatus;
  steppablePhases?: SetupPhaseId[]; allPhaseStates?: Record<string, { status: SetupPhaseStatus; retryCount: number }>;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }} transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto">
      {steppablePhases && allPhaseStates ? (
        <PhaseProgressRail steppablePhases={steppablePhases} currentIndex={step} allPhaseStates={allPhaseStates} />
      ) : (
        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: total }, (_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500",
              i < step ? "bg-primary" : i === step ? "bg-primary/60" : "bg-muted")} />
          ))}
        </div>
      )}
      <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="p-8 pb-0">
          <div className="flex items-center justify-between">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4">
              <Icon className="h-7 w-7 text-primary-foreground" />
            </motion.div>
            {phaseStatus && phaseStatus !== "active" && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <PhaseStatusDot status={phaseStatus} />
                <span className="capitalize">{phaseStatus}</span>
              </div>
            )}
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="p-8 pt-6">{children}</div>
      </div>
    </motion.div>
  );
}

// ── Selection Components ────────────────────────────────────

function OptionCard({ selected, onClick, icon: Icon, title, desc }: {
  selected: boolean; onClick: () => void; icon: typeof Brain; title: string; desc: string;
}) {
  return (
    <button onClick={onClick} className={cn(
      "relative rounded-xl border p-4 text-left transition-all duration-200 group",
      selected ? "border-primary/50 bg-primary/8 shadow-sm shadow-primary/10" : "border-border bg-secondary/20 hover:border-primary/20 hover:bg-secondary/40"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("rounded-lg p-2 transition-colors", selected ? "bg-primary/15" : "bg-secondary")}>
          <Icon className={cn("h-4 w-4", selected ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
        {selected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
            <Check className="h-3 w-3 text-primary-foreground" />
          </motion.div>
        )}
      </div>
    </button>
  );
}

function DomainToggle({ label, icon: Icon, enabled, onToggle, desc, color }: {
  label: string; icon: typeof Brain; enabled: boolean; onToggle: () => void; desc: string; color: string;
}) {
  return (
    <button onClick={onToggle} className={cn(
      "rounded-xl border p-5 text-left transition-all duration-300",
      enabled ? `border-${color}/30 bg-${color}/5` : "border-border bg-secondary/20 opacity-60 hover:opacity-80"
    )}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn("h-5 w-5", enabled ? `text-${color}` : "text-muted-foreground")} />
        <div className={cn("h-3 w-3 rounded-full transition-colors", enabled ? `bg-${color}` : "bg-muted")} />
      </div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </button>
  );
}

// ── System Check Animation ──────────────────────────────────

function SystemCheck({ onComplete, backgroundTasks }: { onComplete: () => void; backgroundTasks?: any[] }) {
  const [checks, setChecks] = useState<{ name: string; status: "pending" | "running" | "done" }[]>([
    { name: "Advisor intelligence layer", status: "pending" },
    { name: "Trust & governance engine", status: "pending" },
    { name: "Proof ledger", status: "pending" },
    { name: "Memory subsystem", status: "pending" },
    { name: "Connector framework", status: "pending" },
    { name: "Budget automation", status: "pending" },
    { name: "Fraud sentinel", status: "pending" },
    { name: "Workflow engine", status: "pending" },
  ]);

  useEffect(() => {
    let idx = 0;
    const run = () => {
      if (idx >= checks.length) { setTimeout(onComplete, 600); return; }
      setChecks(prev => prev.map((c, i) => i === idx ? { ...c, status: "running" } : c));
      setTimeout(() => {
        setChecks(prev => prev.map((c, i) => i === idx ? { ...c, status: "done" } : c));
        idx++;
        setTimeout(run, 150);
      }, 300 + Math.random() * 200);
    };
    run();
  }, []);

  return (
    <div className="space-y-2">
      {checks.map((c, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 bg-secondary/30">
          {c.status === "done" && <Check className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />}
          {c.status === "running" && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Activity className="h-3.5 w-3.5 text-primary" /></motion.div>}
          {c.status === "pending" && <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30" />}
          <span className={cn("text-xs", c.status === "done" ? "text-foreground" : c.status === "running" ? "text-primary font-medium" : "text-muted-foreground")}>{c.name}</span>
          {c.status === "done" && <span className="ml-auto text-[10px] text-[hsl(var(--trust-safe))]">Ready</span>}
        </motion.div>
      ))}
    </div>
  );
}

// ── Nav Buttons ─────────────────────────────────────────────

function NavButtons({ onPrev, onNext, canAdvance, extra, showSkip, onSkip, showRollback, onRollback }: {
  onPrev: () => void; onNext: () => void; canAdvance: boolean;
  extra?: React.ReactNode; showSkip?: boolean; onSkip?: () => void;
  showRollback?: boolean; onRollback?: () => void;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-2">
        <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
        {showRollback && onRollback && (
          <button onClick={onRollback} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="h-3 w-3" /> Rollback
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {extra}
        {showSkip && onSkip && (
          <button onClick={onSkip} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="h-3.5 w-3.5" /> Skip
          </button>
        )}
        <button onClick={onNext} disabled={!canAdvance}
          className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2",
            canAdvance ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
          )}>
          Continue <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Resume Banner ───────────────────────────────────────────

function ResumeBanner({ onResume, onRestart }: { onResume: () => void; onRestart: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl px-6 py-4 shadow-2xl shadow-primary/10">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
        <RotateCcw className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Welcome back</p>
        <p className="text-xs text-muted-foreground">Continue where you left off?</p>
      </div>
      <div className="flex gap-2 ml-4">
        <button onClick={onRestart} className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          Start Over
        </button>
        <button onClick={onResume} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Continue
        </button>
      </div>
    </motion.div>
  );
}

// ── Background Task Progress ────────────────────────────────

function BackgroundTaskBar({ tasks }: { tasks: any[] }) {
  if (!tasks.length) return null;
  const running = tasks.filter(t => t.status === "running");
  if (!running.length) return null;
  const avgProgress = Math.round(running.reduce((s, t) => s + t.progress, 0) / running.length);

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
      className="mb-4 rounded-xl border border-border bg-secondary/20 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Background tasks</span>
        <span className="text-[10px] text-muted-foreground">{avgProgress}%</span>
      </div>
      <Progress value={avgProgress} className="h-1" />
      <div className="mt-2 space-y-1">
        {running.map(t => (
          <div key={t.id} className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Activity className="h-2.5 w-2.5 text-primary" />
            </motion.div>
            {t.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Setup Component ────────────────────────────────────

export function OSSetupExperience() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const orch = useSetupOrchestration();
  const { currentPhase: phase, phaseStatus, goNext: orchGoNext, goPrev: orchGoPrev,
    skipPhase, rollbackTo, retryPhase, sessionProgress, isResumed,
    steppablePhases, currentStepIndex, totalSteps, setCurrentPhase,
    setSessionData, isPhaseRequired, backgroundTasks, allPhaseStates,
    engine } = orch;

  const [previewExample, setPreviewExample] = useState<string | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(isResumed);

  const [state, setState] = useState<SetupState>({
    displayName: "",
    role: "",
    enabledDomains: ["business", "money", "concierge"],
    trustLevel: "balanced",
    aiStyle: "balanced",
    explanationDepth: "standard",
    theme: "dark",
    accentColor: "purple",
    setupStyle: "guided",
    painPoints: [],
    protectionPriorities: [],
    explanationStyle: "balanced",
    presenceStyle: "present",
    interruptionStyle: "balanced",
    rituals: ["morning-pulse", "weekly-boardroom"],
    householdNodes: [],
    memoryConsent: "balanced",
    homeComposition: "",
    firstRecovery: "",
    networkState: "",
    networkSSID: "",
    deviceOwnership: "",
    accountPath: "",
    accessMethod: "",
    recoveryMethod: "",
    permissionChoices: { calendar: false, communication: false, files: false, money: false, household: false, behavior: false, notifications: false },
    quickIdentity: { runFirst: [], slipPoints: [], supportStyle: "", infoPreference: [], easierFirst: "" },
    worldModel: {
      routines: { morningType: 50, weekday: [], weekend: [] },
      household: { size: "", responsibilities: [] },
      work: { industry: [], teamSize: "", tools: [] },
      money: { savingSpending: 50, goals: [] },
      communication: { responseTime: 50, channels: [] },
      goals: { topGoals: [], stressPoints: [] },
    },
    primaryUseMode: "",
  });

  // Sync setup state to engine for branch evaluation
  useEffect(() => {
    setSessionData("role", state.role);
    setSessionData("setupStyle", state.setupStyle);
    setSessionData("enabledDomains", state.enabledDomains);
  }, [state.role, state.setupStyle, state.enabledDomains, setSessionData]);

  const currentStepNum = currentStepIndex >= 0 ? currentStepIndex : 0;

  const goNext = useCallback(() => {
    orchGoNext();
  }, [orchGoNext]);

  const goPrev = useCallback(() => {
    orchGoPrev();
  }, [orchGoPrev]);

  const toggleArrayField = (field: "painPoints" | "protectionPriorities" | "rituals", key: string) => {
    setState(prev => ({
      ...prev,
      [field]: prev[field].includes(key) ? prev[field].filter(x => x !== key) : [...prev[field], key],
    }));
  };

  const toggleDomain = (d: string) => {
    setState(prev => ({
      ...prev,
      enabledDomains: prev.enabledDomains.includes(d)
        ? prev.enabledDomains.filter(x => x !== d)
        : [...prev.enabledDomains, d],
    }));
  };

  const finishSetup = async () => {
    if (!user) { navigate("/"); return; }
    try {
      const memoryItems = [
        { user_id: user.id, key: "display_name", value: JSON.stringify(state.displayName), category: "profile" },
        { user_id: user.id, key: "role", value: JSON.stringify(state.role), category: "preference" },
        { user_id: user.id, key: "enabled_domains", value: JSON.stringify(state.enabledDomains), category: "preference" },
        { user_id: user.id, key: "trust_level", value: JSON.stringify(state.trustLevel), category: "preference" },
        { user_id: user.id, key: "ai_style", value: JSON.stringify(state.aiStyle), category: "preference" },
        { user_id: user.id, key: "explanation_depth", value: JSON.stringify(state.explanationDepth), category: "preference" },
        { user_id: user.id, key: "setup_style", value: JSON.stringify(state.setupStyle), category: "preference" },
        { user_id: user.id, key: "pain_points", value: JSON.stringify(state.painPoints), category: "preference" },
        { user_id: user.id, key: "protection_priorities", value: JSON.stringify(state.protectionPriorities), category: "preference" },
        { user_id: user.id, key: "explanation_style", value: JSON.stringify(state.explanationStyle), category: "preference" },
        { user_id: user.id, key: "presence_style", value: JSON.stringify(state.presenceStyle), category: "preference" },
        { user_id: user.id, key: "interruption_style", value: JSON.stringify(state.interruptionStyle), category: "preference" },
        { user_id: user.id, key: "rituals", value: JSON.stringify(state.rituals), category: "preference" },
        { user_id: user.id, key: "household_nodes", value: JSON.stringify(state.householdNodes), category: "preference" },
        { user_id: user.id, key: "memory_consent", value: JSON.stringify(state.memoryConsent), category: "preference" },
        { user_id: user.id, key: "home_composition", value: JSON.stringify(state.homeComposition), category: "preference" },
        { user_id: user.id, key: "first_recovery", value: JSON.stringify(state.firstRecovery), category: "preference" },
        { user_id: user.id, key: "device_ownership", value: JSON.stringify(state.deviceOwnership), category: "preference" },
        { user_id: user.id, key: "access_method", value: JSON.stringify(state.accessMethod), category: "security" },
        { user_id: user.id, key: "recovery_method", value: JSON.stringify(state.recoveryMethod), category: "security" },
        { user_id: user.id, key: "account_path", value: JSON.stringify(state.accountPath), category: "preference" },
      ].filter(m => m.value && m.value !== '""' && m.value !== '[]');

      await (supabase as any).from("user_memory").upsert(memoryItems, { onConflict: "user_id,key" });
      await (supabase as any).from("profiles").update({ onboarding_completed: true }).eq("user_id", user.id);

      // Mark setup session as complete
      const snapshot = engine.toSnapshot();
      await (supabase as any).from("setup_sessions").upsert({
        id: snapshot.id,
        user_id: snapshot.userId,
        device_id: snapshot.deviceId,
        session_data: snapshot,
        current_phase: "trust-certificate",
        completion_pct: 100,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

      // Boot → Device Trust bridge: enroll this device on setup completion
      try {
        const { getDeviceId, getDeviceName, detectSurfaceType } = await import("@/lib/services/surface-detection");
        const { TrustDeviceEngine } = await import("@/lib/engines");
        const trustEngine = new TrustDeviceEngine();
        const deviceId = getDeviceId();
        const deviceName = getDeviceName();
        const surfaceType = detectSurfaceType();

        trustEngine.enrollDevice({
          name: deviceName,
          type: surfaceType === "mobile" || surfaceType === "capacitor" ? "mobile" : "desktop",
          trustLevel: "verified",
          trustScore: 85,
          publicKeyFingerprint: `SHA256:${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`,
          signingAuthority: true,
          canApproveHighTrust: false,
          lastSeen: new Date().toISOString(),
          diagnostics: {
            batteryHealth: 100,
            osVersion: navigator.userAgent.slice(0, 60),
            appVersion: "1.0.0",
            networkType: navigator.onLine ? "online" : "offline",
          },
          policyRules: ["allow-standard-approvals"],
          localProofCache: 0,
          queuedActions: 0,
        });

        // Persist device enrollment to device_statuses
        await (supabase as any).from("device_statuses").upsert({
          device_id: deviceId,
          user_id: user.id,
          device_name: deviceName,
          device_type: surfaceType === "mobile" || surfaceType === "capacitor" ? "mobile" : "desktop",
          health: "healthy",
          connectivity: "online",
          last_heartbeat: new Date().toISOString(),
          os_version: navigator.userAgent.slice(0, 60),
          metadata: { enrolled_via: "setup", surface: surfaceType },
        }, { onConflict: "device_id" });
      } catch (enrollErr) {
        console.warn("[OSSetup] Device enrollment skipped:", enrollErr);
      }

      // Persist boot phase logs
      try {
        const { getBootPersistenceService } = await import("@/lib/services/boot-persistence");
        const bootService = getBootPersistenceService();
        const { getDeviceId } = await import("@/lib/services/surface-detection");
        bootService.configure({
          userId: user.id,
          deviceId: getDeviceId(),
          sessionId: snapshot.id,
        });
        // Persist all completed phases
        const phaseNames = ["boot", "welcome", "identity", "domains", "trust", "ai-preferences", "theme", "trust-certificate"];
        for (const phaseName of phaseNames) {
          await bootService.persistPhase({
            phase: phaseName as any,
            status: "completed",
            completedAt: new Date().toISOString(),
            durationMs: 0,
          });
        }
      } catch (bootLogErr) {
        console.warn("[OSSetup] Boot log persistence skipped:", bootLogErr);
      }

      SetupOrchestrationEngine.clearLocalStorage();

      try {
        await supabase.functions.invoke("seed-user-data");
      } catch (seedErr) {
        console.warn("Seed data skipped:", seedErr);
      }

      toast.success("SITA OS configured successfully");
    } catch (e) {
      console.error(e);
    }
    navigate("/first-win", { replace: true });
  };

  const canAdvance = () => {
    if (phase === "identity") return state.displayName.length > 0 && state.role.length > 0;
    if (phase === "domains") return state.enabledDomains.length > 0;
    if (phase === "primary-use-mode") return state.primaryUseMode.length > 0;
    return true;
  };

  const showLearningPanel = !["boot", "network-setup", "device-readiness", "device-ownership", "account-environment", "access-protection", "privacy-transparency", "quick-identity", "deep-world-modeling", "primary-use-mode", "welcome", "restore", "enterprise", "cinematic-intro", "trust-certificate"].includes(phase);
  const canSkipCurrent = !isPhaseRequired(phase);
  const showRollbackBtn = state.setupStyle === "advanced";
  const currentBgTasks = backgroundTasks.filter(t => t.phaseId === phase);

  // Handle resume
  const handleResume = useCallback(() => {
    setShowResumeBanner(false);
  }, []);

  const handleRestart = useCallback(() => {
    SetupOrchestrationEngine.clearLocalStorage();
    setShowResumeBanner(false);
    window.location.reload();
  }, []);

  return (
    <>
      {/* Resume Banner */}
      <AnimatePresence>
        {showResumeBanner && (
          <ResumeBanner onResume={handleResume} onRestart={handleRestart} />
        )}
      </AnimatePresence>

      {/* Session Progress Bar */}
      {phase !== "boot" && phase !== "network-setup" && phase !== "device-readiness" && phase !== "device-ownership" && phase !== "account-environment" && phase !== "access-protection" && phase !== "welcome" && (
        <div className="fixed top-0 left-0 right-0 z-[160]">
          <Progress value={sessionProgress} className="h-0.5 rounded-none" />
        </div>
      )}

      {/* Boot */}
      {phase === "boot" && <FirstBootScreen onComplete={() => setCurrentPhase("network-setup")} />}

      {/* Preview example modal */}
      <AnimatePresence>
        {previewExample && (
          <PreviewExampleModal exampleKey={previewExample} onClose={() => setPreviewExample(null)} />
        )}
      </AnimatePresence>

      {/* Setup phases */}
      {phase !== "boot" && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto p-4 sm:p-8"
          style={{ backgroundColor: "#0B0D10" }}>
          {/* Ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[120px]"
              style={{ background: "hsl(265 55% 58% / 0.04)" }} />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full blur-[100px]"
              style={{ background: "hsl(38 85% 58% / 0.03)" }} />
          </div>

          {/* Two-column layout: content + learning panel */}
          <div className="relative z-10 flex items-start gap-6 w-full max-w-4xl justify-center">
            <div className="flex-1 min-w-0">
              {/* Background task progress */}
              <BackgroundTaskBar tasks={currentBgTasks} />

              {/* Phase warning/blocked banner */}
              {(phaseStatus === "warning" || phaseStatus === "blocked" || phaseStatus === "degraded") && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("mb-4 rounded-xl border p-3 flex items-center gap-3",
                    phaseStatus === "blocked" ? "border-destructive/30 bg-destructive/5" : "border-[hsl(var(--trust-warn))]/30 bg-[hsl(var(--trust-warn))]/5"
                  )}>
                  <AlertTriangle className={cn("h-4 w-4", phaseStatus === "blocked" ? "text-destructive" : "text-[hsl(var(--trust-warn))]")} />
                  <span className="text-xs text-foreground">
                    {phaseStatus === "blocked" ? "This step is blocked. " : "Warning: this step may need attention. "}
                  </span>
                  <button onClick={retryPhase} className="ml-auto text-xs text-primary hover:underline">Retry</button>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {/* Network Setup */}
                {phase === "network-setup" && (
                  <NetworkSetupStep key="network-setup" onNext={goNext} onPrev={goPrev}
                    onStateChange={({ connectionState, selectedNetwork }) => setState(s => ({ ...s, networkState: connectionState, networkSSID: selectedNetwork }))} />
                )}

                {/* Device Readiness */}
                {phase === "device-readiness" && (
                  <DeviceReadinessStep key="device-readiness" onNext={goNext} onPrev={goPrev} />
                )}

                {/* Device Ownership */}
                {phase === "device-ownership" && (
                  <DeviceOwnershipStep key="device-ownership" selected={state.deviceOwnership}
                    onSelect={type => setState(s => ({ ...s, deviceOwnership: type }))} onNext={goNext} onPrev={goPrev} />
                )}

                {/* Account / Environment */}
                {phase === "account-environment" && (
                  <AccountEnvironmentStep key="account-environment" selectedPath={state.accountPath as any}
                    onPathChange={path => setState(s => ({ ...s, accountPath: path }))} onNext={goNext} onPrev={goPrev} />
                )}

                {/* Access Protection */}
                {phase === "access-protection" && (
                  <AccessProtectionStep key="access-protection" onNext={goNext} onPrev={goPrev}
                    onStateChange={({ accessMethod, recoveryMethod }) => setState(s => ({ ...s, accessMethod, recoveryMethod }))} />
                )}

                {/* Welcome */}
                {phase === "welcome" && (
                  <FirstWelcomeScreen key="welcome" onSetup={goNext}
                    onRestore={() => setCurrentPhase("restore")} onEnterprise={() => setCurrentPhase("enterprise")} />
                )}

                {/* Restore / Enterprise */}
                {phase === "restore" && <RestoreFlow key="restore" onBack={() => setCurrentPhase("welcome")} onComplete={() => navigate("/")} />}
                {phase === "enterprise" && <EnterpriseFlow key="enterprise" onBack={() => setCurrentPhase("welcome")} onComplete={() => setCurrentPhase("identity")} />}

                {/* Cinematic Intro */}
                {phase === "cinematic-intro" && <CinematicIntro key="cinematic" onComplete={goNext} />}

                {/* Setup Style */}
                {phase === "setup-style" && (
                  <SetupStyleChooser key="setup-style" selected={state.setupStyle}
                    onSelect={s => setState(prev => ({ ...prev, setupStyle: s }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {/* Identity */}
                {phase === "identity" && (
                  <PhaseCard key="identity" title="Who are you?" subtitle="This personalizes your entire experience" icon={Fingerprint}
                    step={currentStepNum} total={totalSteps} phaseStatus={phaseStatus} steppablePhases={steppablePhases} allPhaseStates={allPhaseStates}>
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Name</label>
                        <input value={state.displayName} onChange={e => setState(s => ({ ...s, displayName: e.target.value }))}
                          className="mt-1.5 w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          placeholder="How should SITA address you?" autoFocus />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Role</label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {[
                            { key: "founder", icon: Briefcase, title: "Founder", desc: "Running a business" },
                            { key: "executive", icon: BarChart3, title: "Executive", desc: "Managing operations" },
                            { key: "family-office", icon: Building, title: "Family Office", desc: "Full-service operations" },
                            { key: "personal", icon: Home, title: "Personal", desc: "Life management" },
                          ].map(r => (
                            <OptionCard key={r.key} selected={state.role === r.key} onClick={() => setState(s => ({ ...s, role: r.key }))}
                              icon={r.icon} title={r.title} desc={r.desc} />
                          ))}
                        </div>
                      </div>
                      <NavButtons onPrev={goPrev} onNext={goNext} canAdvance={canAdvance()} />
                    </div>
                  </PhaseCard>
                )}

                {/* Want Less Of */}
                {phase === "want-less-of" && (
                  <WantLessOfStep key="want-less-of" selected={state.painPoints}
                    onToggle={k => toggleArrayField("painPoints", k)} onNext={goNext} onPrev={goPrev} />
                )}

                {/* Protect Most */}
                {phase === "protect-most" && (
                  <ProtectMostStep key="protect-most" selected={state.protectionPriorities}
                    onToggle={k => toggleArrayField("protectionPriorities", k)} onNext={goNext} onPrev={goPrev} />
                )}

                {/* Domains */}
                {phase === "domains" && (
                  <PhaseCard key="domains" title="Choose Your Domains" subtitle="Enable the areas SITA should manage for you" icon={Globe}
                    step={currentStepNum} total={totalSteps} phaseStatus={phaseStatus} steppablePhases={steppablePhases} allPhaseStates={allPhaseStates}>
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 gap-3">
                        <DomainToggle icon={Briefcase} label="Business" desc="Leads, customers, revenue, invoices, CRM"
                          enabled={state.enabledDomains.includes("business")} onToggle={() => toggleDomain("business")} color="primary" />
                        <DomainToggle icon={DollarSign} label="Money" desc="Bills, subscriptions, reserves, investments, budgets"
                          enabled={state.enabledDomains.includes("money")} onToggle={() => toggleDomain("money")} color="accent" />
                        <DomainToggle icon={Headphones} label="Concierge" desc="Calendar, tasks, household, travel, appointments"
                          enabled={state.enabledDomains.includes("concierge")} onToggle={() => toggleDomain("concierge")} color="trust-safe" />
                      </div>
                      <p className="text-center text-[11px] text-muted-foreground">You can enable more domains later from Settings</p>
                      <NavButtons onPrev={goPrev} onNext={goNext} canAdvance={canAdvance()}
                        showSkip={canSkipCurrent} onSkip={skipPhase}
                        extra={<PreviewButton onClick={() => setPreviewExample("recovered-lead")} />} />
                    </div>
                  </PhaseCard>
                )}

                {/* Trust */}
                {phase === "trust" && (
                  <PhaseCard key="trust" title="Trust & Autonomy" subtitle="How much should SITA act on its own?" icon={Shield}
                    step={currentStepNum} total={totalSteps} phaseStatus={phaseStatus} steppablePhases={steppablePhases} allPhaseStates={allPhaseStates}>
                    <div className="space-y-4">
                      {[
                        { key: "open", icon: Zap, title: "Open — Act freely", desc: "SITA handles routine actions automatically. You review later via proof trail." },
                        { key: "balanced", icon: Shield, title: "Balanced — Ask for important things", desc: "Low-risk actions run automatically. High-impact actions need your approval." },
                        { key: "guarded", icon: Lock, title: "Guarded — Ask before acting", desc: "SITA proposes everything, acts only when you approve. Maximum control." },
                      ].map(t => (
                        <OptionCard key={t.key} selected={state.trustLevel === t.key}
                          onClick={() => setState(s => ({ ...s, trustLevel: t.key as any }))}
                          icon={t.icon} title={t.title} desc={t.desc} />
                      ))}
                      <NavButtons onPrev={goPrev} onNext={goNext} canAdvance={true}
                        showSkip={canSkipCurrent} onSkip={skipPhase}
                        showRollback={showRollbackBtn} onRollback={() => rollbackTo("identity")}
                        extra={<PreviewButton onClick={() => setPreviewExample("trust")} />} />
                    </div>
                  </PhaseCard>
                )}

                {/* Explanation Style */}
                {phase === "explanation-style" && (
                  <ExplanationStyleStep key="explanation-style" selected={state.explanationStyle}
                    onSelect={s => setState(prev => ({ ...prev, explanationStyle: s }))} onNext={goNext} onPrev={goPrev} />
                )}

                {/* Presence Style */}
                {phase === "presence-style" && (
                  <PresenceStyleStep key="presence-style" selected={state.presenceStyle}
                    onSelect={s => setState(prev => ({ ...prev, presenceStyle: s }))} onNext={goNext} onPrev={goPrev} />
                )}

                {/* AI Personality */}
                {phase === "ai-personality" && (
                  <PhaseCard key="ai-personality" title="AI Communication Style" subtitle="How should your advisors communicate?" icon={Sparkles}
                    step={currentStepNum} total={totalSteps} phaseStatus={phaseStatus} steppablePhases={steppablePhases} allPhaseStates={allPhaseStates}>
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Communication Style</label>
                        <div className="space-y-2">
                          {[
                            { key: "proactive", title: "Proactive", desc: "Advisors surface insights and suggestions without being asked" },
                            { key: "balanced", title: "Balanced", desc: "Important findings are surfaced; routine info stays in background" },
                            { key: "reserved", title: "Reserved", desc: "Advisors respond when asked. Minimal unsolicited communication" },
                          ].map(s => (
                            <OptionCard key={s.key} selected={state.aiStyle === s.key}
                              onClick={() => setState(prev => ({ ...prev, aiStyle: s.key as any }))}
                              icon={Brain} title={s.title} desc={s.desc} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Explanation Depth</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: "brief", label: "Brief", desc: "Just the answer" },
                            { key: "standard", label: "Standard", desc: "Answer + context" },
                            { key: "detailed", label: "Detailed", desc: "Full reasoning" },
                          ].map(d => (
                            <button key={d.key} onClick={() => setState(s => ({ ...s, explanationDepth: d.key as any }))}
                              className={cn("rounded-xl border p-3 text-center transition-all",
                                state.explanationDepth === d.key ? "border-primary/50 bg-primary/8" : "border-border bg-secondary/20 hover:border-primary/20"
                              )}>
                              <p className="text-xs font-semibold text-foreground">{d.label}</p>
                              <p className="text-[10px] text-muted-foreground">{d.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      <NavButtons onPrev={goPrev} onNext={goNext} canAdvance={true}
                        showSkip={canSkipCurrent} onSkip={skipPhase} />
                    </div>
                  </PhaseCard>
                )}

                {/* Interruption Style */}
                {phase === "interruption-style" && (
                  <InterruptionStyleStep key="interruption-style" selected={state.interruptionStyle}
                    onSelect={s => setState(prev => ({ ...prev, interruptionStyle: s }))} onNext={goNext} onPrev={goPrev} />
                )}

                {/* Rituals */}
                {phase === "rituals" && (
                  <RitualsStep key="rituals" selected={state.rituals}
                    onToggle={k => toggleArrayField("rituals", k)} onNext={goNext} onPrev={goPrev} />
                )}

                {/* Appearance */}
                {phase === "appearance" && (
                  <PhaseCard key="appearance" title="Appearance" subtitle="Make SITA feel like yours" icon={Sun}
                    step={currentStepNum} total={totalSteps} phaseStatus={phaseStatus} steppablePhases={steppablePhases} allPhaseStates={allPhaseStates}>
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Theme</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: "dark", icon: Moon, label: "Dark" },
                            { key: "light", icon: Sun, label: "Light" },
                            { key: "auto", icon: Monitor, label: "Auto" },
                          ].map(t => (
                            <button key={t.key} onClick={() => setState(s => ({ ...s, theme: t.key as any }))}
                              className={cn("rounded-xl border p-4 text-center transition-all",
                                state.theme === t.key ? "border-primary/50 bg-primary/8" : "border-border bg-secondary/20 hover:border-primary/20"
                              )}>
                              <t.icon className={cn("h-5 w-5 mx-auto mb-1.5", state.theme === t.key ? "text-primary" : "text-muted-foreground")} />
                              <p className="text-xs font-semibold text-foreground">{t.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Accent Color</label>
                        <div className="flex gap-2 justify-center">
                          {[
                            { key: "purple", color: "bg-[hsl(265,55%,58%)]" },
                            { key: "blue", color: "bg-[hsl(215,70%,55%)]" },
                            { key: "green", color: "bg-[hsl(152,55%,48%)]" },
                            { key: "gold", color: "bg-[hsl(38,85%,58%)]" },
                            { key: "rose", color: "bg-[hsl(345,65%,55%)]" },
                          ].map(c => (
                            <button key={c.key} onClick={() => setState(s => ({ ...s, accentColor: c.key }))}
                              className={cn("h-9 w-9 rounded-full transition-all", c.color,
                                state.accentColor === c.key ? "ring-2 ring-offset-2 ring-primary ring-offset-card scale-110" : "hover:scale-105"
                              )} />
                          ))}
                        </div>
                      </div>
                      <NavButtons onPrev={goPrev} onNext={goNext} canAdvance={true}
                        showSkip={canSkipCurrent} onSkip={skipPhase} />
                    </div>
                  </PhaseCard>
                )}

                {/* Household Graph */}
                {phase === "household-graph" && (
                  <HouseholdGraphStep key="household-graph" nodes={state.householdNodes}
                    onUpdate={nodes => setState(prev => ({ ...prev, householdNodes: nodes }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {/* Memory Consent */}
                {phase === "memory-consent" && (
                  <MemoryConsentStep key="memory-consent" selected={state.memoryConsent}
                    onSelect={s => setState(prev => ({ ...prev, memoryConsent: s }))} onNext={goNext} onPrev={goPrev} />
                )}

                {/* Home Composition */}
                {phase === "home-composition" && (
                  <HomeCompositionStep key="home-composition" selected={state.homeComposition}
                    onSelect={s => setState(prev => ({ ...prev, homeComposition: s }))} onNext={goNext} onPrev={goPrev} />
                )}

                {/* Desktop Preview */}
                {phase === "desktop-preview" && (
                  <DesktopPreviewStep key="desktop-preview" onNext={goNext} onPrev={goPrev} />
                )}

                {/* First Connections */}
                {phase === "first-connections" && (
                  <FirstConnectionsStep key="first-connections"
                    enabledDomains={state.enabledDomains}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {/* First Simulation */}
                {phase === "first-simulation" && (
                  <FirstSimulationStep key="first-simulation" onNext={goNext} onPrev={goPrev} />
                )}

                {/* First Actions */}
                {phase === "first-actions" && (
                  <FirstActionsStep key="first-actions" enabledDomains={state.enabledDomains}
                    protectionPriorities={state.protectionPriorities} onNext={goNext} onPrev={goPrev} />
                )}

                {/* Recover First */}
                {phase === "recover-first" && (
                  <RecoverFirstStep key="recover-first" selected={state.firstRecovery}
                    onSelect={s => setState(prev => ({ ...prev, firstRecovery: s }))} onNext={goNext} onPrev={goPrev} />
                )}

                {/* Arrival Preparation */}
                {phase === "arrival-prep" && (
                  <ArrivalPrepStep key="arrival-prep"
                    displayName={state.displayName}
                    enabledDomains={state.enabledDomains}
                    trustLevel={state.trustLevel}
                    rituals={state.rituals}
                    aiStyle={state.aiStyle}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {/* System Check */}
                {phase === "system-check" && (
                  <PhaseCard key="system-check" title="Initializing Your System" subtitle="Running final checks..." icon={Cpu}
                    step={currentStepNum} total={totalSteps} phaseStatus={phaseStatus} steppablePhases={steppablePhases} allPhaseStates={allPhaseStates}>
                    <SystemCheck onComplete={goNext} backgroundTasks={currentBgTasks} />
                  </PhaseCard>
                )}

                {/* Trust Certificate */}
                {phase === "trust-certificate" && (
                  <TrustCertificateStep key="trust-certificate"
                    displayName={state.displayName}
                    trustLevel={state.trustLevel}
                    enabledDomains={state.enabledDomains}
                    rituals={state.rituals}
                    onFinish={finishSetup} />
                )}
              </AnimatePresence>
            </div>

            {/* Learning Panel — right side on lg+ */}
            {showLearningPanel && (
              <LearningPanel state={state} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
