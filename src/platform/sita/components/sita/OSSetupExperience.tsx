// ════════════════════════════════════════════════════════════════
// SITA OS — Premium OS Setup Experience (World-Class Onboarding)
// ----------------------------------------------------------------
// ONBOARDING SURFACE: os-first-boot  (registry: ONBOARDING_SURFACES)
// SCOPE: Device-wide first-boot personalization. Implements the
//        29-screen master spec via ~50 phases powered by
//        SetupOrchestrationEngine.
// THIS IS THE CANONICAL OS FIRST-BOOT FLOW. The Business workspace
// formation surface (FormationShell) and Money introduction surface
// (MoneyOnboardingFlow) are SEPARATE downstream tiers — see
// src/lib/architecture/onboarding-surface-registry.ts.
// ════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { persistSetupState, loadPersistedSetupState, clearPersistedSetupState } from "@/platform/sita/components/sita/setup/SetupPersistenceManager";
import { getOSVersionString } from "@/runtimes/runtime-platform";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import {
  Brain, Shield, Zap, Globe, Eye, Lock, Sparkles, Check, ChevronRight,
  Briefcase, DollarSign, Headphones, Building, Home, BarChart3,
  Cpu, Activity, Fingerprint, Sun, Moon, Monitor, RotateCcw, SkipForward,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FirstBootScreen } from "@/platform/sita/components/sita/FirstBootScreen";
import { useSetupOrchestration } from "@/hooks/useSetupOrchestration";
import { SetupOrchestrationEngine } from "@/domains/engines/setup-orchestration-engine";
import type { SetupPhaseId, SetupPhaseStatus } from "@/packages/contracts/specialized/setup-orchestration";
import { SetupStyleChooser } from "@/platform/sita/components/sita/onboarding/SetupStyleChooser";
import { LearningPanel } from "@/platform/sita/components/sita/onboarding/LearningPanel";
import { TrustCertificateStep } from "@/platform/sita/components/sita/onboarding/TrustCertificateStep";
import { ArrivalPrepStep } from "@/platform/sita/components/sita/onboarding/ArrivalPrepStep";
import { SecureFoundationStep } from "@/platform/sita/components/sita/onboarding/SecureFoundationStep";
import { SetupLanguageRegion } from "@/platform/sita/components/sita/setup/SetupLanguageRegion";
import { FirstConnectionsStep } from "@/platform/sita/components/sita/onboarding/FirstConnectionsStep";
import { NetworkSetupStep } from "@/platform/sita/components/sita/onboarding/NetworkSetupStep";
import { DeviceReadinessStep } from "@/platform/sita/components/sita/onboarding/DeviceReadinessStep";
import { DeviceOwnershipStep } from "@/platform/sita/components/sita/onboarding/DeviceOwnershipStep";
import { AccountEnvironmentStep } from "@/platform/sita/components/sita/onboarding/AccountEnvironmentStep";
import { AccessProtectionStep } from "@/platform/sita/components/sita/onboarding/AccessProtectionStep";
import { PrivacyTransparencyStep } from "@/platform/sita/components/sita/onboarding/PrivacyTransparencyStep";
import { QuickIdentityStep } from "@/platform/sita/components/sita/onboarding/QuickIdentityStep";
import type { QuickIdentityData } from "@/platform/sita/components/sita/onboarding/QuickIdentityStep";
import { DeepWorldModelingStep } from "@/platform/sita/components/sita/onboarding/DeepWorldModelingStep";
import type { WorldModelData } from "@/platform/sita/components/sita/onboarding/DeepWorldModelingStep";
import { PrimaryUseModeStep } from "@/platform/sita/components/sita/onboarding/PrimaryUseModeStep";
import { TrustCalibrationStep } from "@/platform/sita/components/sita/onboarding/TrustCalibrationStep";
import type { TrustCalibrationData } from "@/platform/sita/components/sita/onboarding/TrustCalibrationStep";
import { AdvisorActivationStep } from "@/platform/sita/components/sita/onboarding/AdvisorActivationStep";
import type { AdvisorActivation } from "@/platform/sita/components/sita/onboarding/AdvisorActivationStep";
import { FirstWinSetupStep } from "@/platform/sita/components/sita/onboarding/FirstWinSetupStep";
import type { FirstWinData } from "@/platform/sita/components/sita/onboarding/FirstWinSetupStep";
import { DesktopTransitionStep } from "@/platform/sita/components/sita/onboarding/DesktopTransitionStep";
import { LifeRhythmStep } from "@/platform/sita/components/sita/onboarding/LifeRhythmStep";
import type { LifeRhythmData } from "@/platform/sita/components/sita/onboarding/LifeRhythmStep";
import { StressSlippageStep } from "@/platform/sita/components/sita/onboarding/StressSlippageStep";
import type { StressMapData } from "@/platform/sita/components/sita/onboarding/StressSlippageStep";
import { CommunicationsContextStep } from "@/platform/sita/components/sita/onboarding/CommunicationsContextStep";
import type { CommsContextData } from "@/platform/sita/components/sita/onboarding/CommunicationsContextStep";
import { PlanningStyleStep } from "@/platform/sita/components/sita/onboarding/PlanningStyleStep";
import type { PlanningStyleData } from "@/platform/sita/components/sita/onboarding/PlanningStyleStep";
import { EnvironmentSummaryStep } from "@/platform/sita/components/sita/onboarding/EnvironmentSummaryStep";
import { WantLessOfStep } from "@/platform/sita/components/sita/onboarding/WantLessOfStep";
import { ProtectMostStep } from "@/platform/sita/components/sita/onboarding/ProtectMostStep";
import { ExplanationStyleStep } from "@/platform/sita/components/sita/onboarding/ExplanationStyleStep";
import { PresenceStyleStep } from "@/platform/sita/components/sita/onboarding/PresenceStyleStep";
import { InterruptionStyleStep } from "@/platform/sita/components/sita/onboarding/InterruptionStyleStep";
import { RitualsStep } from "@/platform/sita/components/sita/onboarding/RitualsStep";
import { HouseholdGraphStep } from "@/platform/sita/components/sita/onboarding/HouseholdGraphStep";
import { MemoryConsentStep } from "@/platform/sita/components/sita/onboarding/MemoryConsentStep";
import { HomeCompositionStep } from "@/platform/sita/components/sita/onboarding/HomeCompositionStep";
import { DesktopPreviewStep } from "@/platform/sita/components/sita/onboarding/DesktopPreviewStep";
import { FirstSimulationStep } from "@/platform/sita/components/sita/onboarding/FirstSimulationStep";
import { FirstActionsStep } from "@/platform/sita/components/sita/onboarding/FirstActionsStep";
import { RecoverFirstStep } from "@/platform/sita/components/sita/onboarding/RecoverFirstStep";
import { PreviewExampleModal } from "@/platform/sita/components/sita/onboarding/PreviewExampleModal";
// CinematicIntro available but not used in main flow
import { RestorePreviewStep } from "@/platform/sita/components/sita/onboarding/RestorePreviewStep";
import { ContextualWelcomeTour } from "@/platform/sita/components/sita/onboarding/ContextualWelcomeTour";
import { OperatingContextStep } from "@/platform/sita/components/sita/onboarding/OperatingContextStep";
import { RelationshipSensitivityStep } from "@/platform/sita/components/sita/onboarding/RelationshipSensitivityStep";
import { PersonalizationPivotStep } from "@/platform/sita/components/sita/onboarding/PersonalizationPivotStep";
import { Progress } from "@/components/ui/progress";

// ── Types ───────────────────────────────────────────────────

interface SetupData {
  language: string;
  region: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  operatingMode: string;
  autonomyLevel: number;
  thresholds: Record<string, string>;
  activeAdvisors: string[];
  displayName: string;
  role: string;
  enabledDomains: string[];
  trustLevel: "open" | "balanced" | "guarded";
  aiStyle: "proactive" | "balanced" | "reserved";
  explanationDepth: "brief" | "standard" | "detailed";
  theme: "dark" | "light" | "auto";
  accentColor: string;
  setupStyle: "express" | "guided" | "advanced";
  networkState: string;
  networkSSID: string;
  deviceOwnership: "personal" | "family" | "work" | "";
  accountPath: string;
  accessMethod: string;
  recoveryMethod: string;
  permissionChoices: Record<string, boolean>;
  quickIdentity: QuickIdentityData;
  worldModel: WorldModelData;
  primaryUseMode: string;
  trustCalibration: TrustCalibrationData;
  advisorActivation: AdvisorActivation[];
  deferredConnections: string[];
  firstWin: FirstWinData;
  connectedSystems: number;
  lifeRhythm: LifeRhythmData;
  stressMap: StressMapData;
  commsContext: CommsContextData;
  planningStyle: PlanningStyleData;
  wantLessOf: string[];
  protectMost: string[];
  explanationStyle: string;
  presenceStyle: string;
  interruptionStyle: string;
  rituals: string[];
  householdGraph: { name: string; role: string }[];
  memoryConsent: string;
  homeComposition: string;
  recoverFirst: string;
  operatingContext: string;
  supportNeedPrimary: string;
  relationshipFocus: string;
  desktopDensity: string;
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
            <div className={cn(
              "h-1 w-full rounded-full transition-all duration-500",
              isCompleted ? "bg-trust-safe" :
              isSkipped ? "bg-muted-foreground/30" :
              isBlocked ? "bg-destructive/40" :
              isActive ? "bg-primary/60" :
              "bg-muted"
            )} />
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

// ── Fullscreen phases (rendered outside the standard layout) ──
const FULLSCREEN_PHASES: SetupPhaseId[] = ["boot", "secure-foundation", "language-region", "desktop-transition"];

// ── Main Setup Component ────────────────────────────────────

// Derive desktop density from stress + context (Req #3/#8)
function computeDesktopDensity(s: SetupData): string {
  const stressCount = s.stressMap.heavierThanShould.length;
  if (stressCount >= 4 || s.operatingContext === "regaining-control") return "calm";
  if (stressCount >= 2 || s.operatingContext === "managing-complexity") return "balanced";
  return "dense";
}

// Compute per-domain confidence metadata for persistence (Req #1 / Part 5-P)
function computeDomainConfidence(s: SetupData): Record<string, { confidence: string; source: string; editableLater: boolean }> {
  const conf = (hasData: boolean, source = "explicit") => ({
    confidence: hasData ? "good-signal" : "still-learning",
    source,
    editableLater: true,
  });
  return {
    identity: conf(!!s.displayName || s.quickIdentity.runFirst.length > 0),
    operatingContext: conf(!!s.operatingContext),
    lifeRhythm: conf(!!s.lifeRhythm.weekStructure),
    stress: conf(s.stressMap.heavierThanShould.length > 0),
    household: conf(s.householdGraph.length > 0),
    work: conf(s.worldModel.work.industry.length > 0),
    money: conf(s.worldModel.money.goals.length > 0),
    communications: conf(!!s.commsContext.communicationStress),
    planning: conf(!!s.planningStyle.viewPreference),
    trust: conf(s.trustCalibration.level > 0),
    relationships: conf(!!s.relationshipFocus),
  };
}

export function OSSetupExperience() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const orch = useSetupOrchestration();
  const { currentPhase: phase, phaseStatus, goNext: orchGoNext, goPrev: orchGoPrev,
    skipPhase, rollbackTo, retryPhase, sessionProgress, isResumed,
    steppablePhases, currentStepIndex, totalSteps, setCurrentPhase,
    setSessionData, isPhaseRequired, backgroundTasks, allPhaseStates,
    engine } = orch;

  const [showResumeBanner, setShowResumeBanner] = useState(isResumed);

  const [state, setState] = useState<SetupData>({
    language: "en",
    region: "US",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    operatingMode: "",
    autonomyLevel: 50,
    thresholds: {},
    activeAdvisors: [],
    displayName: "",
    role: "",
    enabledDomains: ["business", "money", "concierge"],
    trustLevel: "balanced",
    aiStyle: "balanced",
    explanationDepth: "standard",
    theme: "dark",
    accentColor: "purple",
    setupStyle: "guided",
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
    trustCalibration: {
      level: 0, spendingThreshold: 100, financialApprovals: true, calendarApprovals: false,
      communicationApprovals: true, reminderFrequency: "balanced", escalationBehavior: "notify",
      familyPermissions: false, businessPermissions: false, silentAutomation: false,
    },
    advisorActivation: [],
    deferredConnections: [],
    firstWin: { category: "", action: "", approved: false, prepared: false },
    connectedSystems: 0,
    lifeRhythm: { weekStructure: "", overloadMoments: [], planningHorizon: "", planningSupport: [] },
    stressMap: { heavierThanShould: [], affectedFirst: [] },
    commsContext: { communicationStress: "", supportNeeds: [] },
    planningStyle: { viewPreference: "", focusPreference: "" },
    wantLessOf: [],
    protectMost: [],
    explanationStyle: "",
    presenceStyle: "",
    interruptionStyle: "",
    rituals: [],
    householdGraph: [],
    memoryConsent: "",
    homeComposition: "",
    recoverFirst: "",
    operatingContext: "",
    supportNeedPrimary: "",
    relationshipFocus: "",
    desktopDensity: "",
  });

  // Sync setup state to engine for branch evaluation
  useEffect(() => {
    setSessionData("role", state.role);
    setSessionData("setupStyle", state.setupStyle);
    setSessionData("enabledDomains", state.enabledDomains);
    setSessionData("accountPath", state.accountPath);
    setSessionData("operatingContext", state.operatingContext);
    // Derive pain points and focus areas from quick identity for domain branching
    setSessionData("painPoints", state.quickIdentity.slipPoints);
    setSessionData("focusAreas", state.quickIdentity.runFirst);
    setSessionData("stressAreas", state.stressMap.heavierThanShould);
  }, [
    state.role, state.setupStyle, state.enabledDomains, state.accountPath,
    state.operatingContext, state.quickIdentity.slipPoints, state.quickIdentity.runFirst,
    state.stressMap.heavierThanShould, setSessionData,
  ]);

  const currentStepNum = currentStepIndex >= 0 ? currentStepIndex : 0;

  const goNext = useCallback(() => {
    orchGoNext();
    persistSetupState(state, phase);
  }, [orchGoNext, state, phase]);

  const goPrev = useCallback(() => {
    orchGoPrev();
    persistSetupState(state, phase);
  }, [orchGoPrev, state, phase]);

  // Derive trust-based settings for Part 5 compliance
  const computeTrustDerivedSettings = (s: SetupData) => {
    const tc = s.trustCalibration;
    const approvalPathways: Record<string, string> = {};
    for (const domain of s.enabledDomains) {
      approvalPathways[domain] = tc.level >= 70 ? "auto" : tc.level >= 40 ? "notify-after" : "require-approval";
    }
    if (tc.financialApprovals) approvalPathways["financial"] = "require-approval";
    if (tc.communicationApprovals) approvalPathways["communication"] = "require-approval";

    const proofExpectations = {
      generateReceipts: true,
      requireExplanation: tc.level < 50,
      auditTrailLevel: tc.level >= 70 ? "summary" : "detailed",
      showConfidence: tc.level < 60,
    };

    const automationBoundaries = {
      maxAutonomyTier: tc.level >= 80 ? "autonomous" : tc.level >= 50 ? "supervised" : "assisted",
      spendingCeiling: tc.spendingThreshold,
      silentAutomationAllowed: tc.silentAutomation,
      escalationBehavior: tc.escalationBehavior,
      calendarAutoManage: !tc.calendarApprovals,
      businessAutoManage: tc.businessPermissions,
      familyAutoManage: tc.familyPermissions,
    };

    return { approvalPathways, proofExpectations, automationBoundaries };
  };

  const finishSetup = async () => {
    if (!user) { navigate("/"); return; }
    try {
      const mem = (key: string, value: unknown, category: string, opts?: { source?: string; confidence?: number; sensitivity?: string }) => ({
        user_id: user.id, key, value: JSON.stringify(value), category,
        source: opts?.source ?? "explicit-input",
        confidence: opts?.confidence ?? 1.0,
        confirmed: true,
        sensitivity: opts?.sensitivity ?? "low",
      });

      const memoryItems = [
        mem("display_name", state.displayName, "profile"),
        mem("role", state.role, "preference"),
        mem("enabled_domains", state.enabledDomains, "preference"),
        mem("trust_level", state.trustLevel, "preference"),
        mem("ai_style", state.aiStyle, "preference"),
        mem("explanation_depth", state.explanationDepth, "preference"),
        mem("setup_style", state.setupStyle, "preference"),
        mem("device_ownership", state.deviceOwnership, "preference", { source: "explicit-input", confidence: 1.0 }),
        mem("access_method", state.accessMethod, "security", { sensitivity: "high" }),
        mem("recovery_method", state.recoveryMethod, "security", { sensitivity: "high" }),
        mem("account_path", state.accountPath, "preference"),
        mem("permission_choices", state.permissionChoices, "privacy", { sensitivity: "medium" }),
        mem("quick_identity", state.quickIdentity, "preference"),
        mem("world_model", state.worldModel, "preference", { confidence: 0.85, source: "explicit-input" }),
        mem("primary_use_mode", state.primaryUseMode, "preference"),
        mem("trust_calibration", state.trustCalibration, "preference", { sensitivity: "medium" }),
        mem("advisor_activation", state.advisorActivation, "preference"),
        mem("deferred_connections", state.deferredConnections, "preference", { confirmed: false } as never),
        mem("first_win", state.firstWin, "preference"),
        mem("life_rhythm", state.lifeRhythm, "preference"),
        mem("stress_map", state.stressMap, "preference", { sensitivity: "medium" }),
        mem("comms_context", state.commsContext, "preference"),
        mem("planning_style", state.planningStyle, "preference"),
        mem("want_less_of", state.wantLessOf, "preference"),
        mem("protect_most", state.protectMost, "preference"),
        mem("explanation_style", state.explanationStyle, "preference"),
        mem("presence_style", state.presenceStyle, "preference"),
        mem("interruption_style", state.interruptionStyle, "preference"),
        mem("rituals", state.rituals, "preference"),
        mem("household_graph", state.householdGraph, "preference", { sensitivity: "medium" }),
        mem("memory_consent", state.memoryConsent, "privacy", { sensitivity: "high" }),
        mem("home_composition", state.homeComposition, "preference"),
        mem("recover_first", state.recoverFirst, "preference"),
        mem("operating_context", state.operatingContext, "preference"),
        mem("support_need_primary", state.supportNeedPrimary, "preference"),
        mem("relationship_focus", state.relationshipFocus, "preference"),
        mem("desktop_density", computeDesktopDensity(state), "preference", { source: "derived", confidence: 0.8 }),
        mem("domain_confidence", computeDomainConfidence(state), "preference", { source: "derived", confidence: 0.7 }),
      ];

      // Trust-derived settings (Part 5: approval pathways, proof expectations, automation boundaries)
      const trustDerived = computeTrustDerivedSettings(state);
      memoryItems.push(
        mem("approval_pathways", trustDerived.approvalPathways, "trust", { source: "derived", confidence: 0.9, sensitivity: "medium" }),
        mem("proof_expectations", trustDerived.proofExpectations, "trust", { source: "derived", confidence: 0.9 }),
        mem("automation_boundaries", trustDerived.automationBoundaries, "trust", { source: "derived", confidence: 0.85, sensitivity: "medium" }),
      );

      const filtered = memoryItems.filter(m => m.value && m.value !== '""' && m.value !== '[]' && m.value !== '{}');

      await fromTable("user_memory").upsert(filtered, { onConflict: "user_id,key" });
      await fromTable("profiles").update({ onboarding_completed: true }).eq("user_id", user.id);

      const snapshot = engine.toSnapshot();
      await fromTable("setup_sessions").upsert({
        user_id: snapshot.userId,
        current_step: "trust-certificate",
        completed_steps: ["boot", "setup-style", "quick-identity", "primary-use-mode", "trust-calibration", "advisor-activation", "trust-certificate"],
        preferences: snapshot as never,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

      // Boot → Device Trust bridge
      try {
        const { getDeviceId, getDeviceName, detectSurfaceType } = await import("@/lib/services/surface-detection");
        const { TrustDeviceEngine } = await import("@/domains/engines");
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
            osVersion: getOSVersionString(),
            appVersion: "1.0.0",
            networkType: navigator.onLine ? "online" : "offline",
          },
          policyRules: ["allow-standard-approvals"],
          localProofCache: 0,
          queuedActions: 0,
        });

        await fromTable("device_statuses").upsert({
          user_id: user.id,
          device_name: deviceName,
          device_type: surfaceType === "mobile" || surfaceType === "capacitor" ? "mobile" : "desktop",
          status: "active",
          last_seen: new Date().toISOString(),
          os: getOSVersionString(),
          metadata: { enrolled_via: "setup", surface: surfaceType },
        }, { onConflict: "user_id,device_name" });
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
        const phaseNames = ["boot", "setup-style", "quick-identity", "primary-use-mode", "trust-calibration", "advisor-activation", "trust-certificate"];
        for (const phaseName of phaseNames) {
          await bootService.persistPhase({
            phase: phaseName as never,
            status: "completed",
            completedAt: new Date().toISOString(),
            durationMs: 0,
          });
        }
      } catch (bootLogErr) {
        console.warn("[OSSetup] Boot log persistence skipped:", bootLogErr);
      }

      SetupOrchestrationEngine.clearLocalStorage();
      clearPersistedSetupState();

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

  // ── Validation ────────────────────────────────────────────
  const canAdvance = () => {
    switch (phase) {
      case "device-ownership": return state.deviceOwnership !== "";
      case "primary-use-mode": return state.primaryUseMode.length > 0;
      case "trust-calibration": return state.trustCalibration.level > 0;
      case "advisor-activation": return state.advisorActivation.some(a => a.enabled);
      case "first-win-setup": return state.firstWin.approved;
      case "life-rhythm": return state.lifeRhythm.weekStructure !== "";
      case "stress-slippage": return state.stressMap.heavierThanShould.length > 0;
      case "communications-context": return state.commsContext.communicationStress !== "";
      case "planning-style": return state.planningStyle.viewPreference !== "";
      default: return true;
    }
  };

  // Show learning panel only on personalization phases (not boot/system phases)
  const SYSTEM_PHASES: SetupPhaseId[] = [
    "boot", "secure-foundation", "language-region", "network-setup", "device-readiness",
    "device-ownership", "account-environment", "setup-style", "access-protection",
    "desktop-transition", "system-check", "trust-certificate", "arrival-prep",
  ];
  const showLearningPanel = !SYSTEM_PHASES.includes(phase);
  const canSkipCurrent = !isPhaseRequired(phase);
  const showRollbackBtn = state.setupStyle === "advanced";
  const currentBgTasks = backgroundTasks.filter(t => t.phaseId === phase);
  const toneContext = useMemo(() => engine.getToneContext(), [
    state.stressMap.heavierThanShould.length, state.operatingContext, state.setupStyle,
  ]);

  const handleResume = useCallback(() => { setShowResumeBanner(false); }, []);
  const handleRestart = useCallback(() => {
    SetupOrchestrationEngine.clearLocalStorage();
    setShowResumeBanner(false);
    window.location.reload();
  }, []);

  // Show session progress bar on personalization+ phases only
  const showProgressBar = !SYSTEM_PHASES.includes(phase) && phase !== "environment-summary" && phase !== "first-connections" && phase !== "first-win-setup";

  return (
    <>
      {/* Resume Banner */}
      <AnimatePresence>
        {showResumeBanner && (
          <ResumeBanner onResume={handleResume} onRestart={handleRestart} />
        )}
      </AnimatePresence>

      {/* Session Progress Bar */}
      {showProgressBar && (
        <div className="fixed top-0 left-0 right-0 z-[160]">
          <Progress value={sessionProgress} className="h-0.5 rounded-none" />
        </div>
      )}

      {/* ── Fullscreen phases ── */}
      {phase === "boot" && <FirstBootScreen onComplete={() => { engine.completeCurrentAndAdvance(); }} />}
      {phase === "secure-foundation" && <SecureFoundationStep key="secure-foundation" onNext={goNext} onPrev={goPrev} />}
      {phase === "language-region" && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto p-4 sm:p-8" style={{ backgroundColor: "#0B0D10" }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[120px]" style={{ background: "hsl(265 55% 58% / 0.04)" }} />
          </div>
          <div className="relative z-10 w-full">
            <SetupLanguageRegion
              onNext={({ language, region, timezone, dateFormat, currency }) => {
                setState(s => ({ ...s, language, region, timezone, dateFormat, currency }));
                goNext();
              }}
              onBack={goPrev}
              step={currentStepNum}
              total={totalSteps}
            />
          </div>
        </div>
      )}
      {phase === "desktop-transition" && (
        <DesktopTransitionStep key="desktop-transition"
          displayName={state.displayName}
          trustLevel={state.trustLevel}
          activeAdvisors={state.advisorActivation}
          primaryUseMode={state.primaryUseMode}
          firstWinAction={state.firstWin.action}
          onComplete={goNext} />
      )}

      {/* ── Standard layout phases ── */}
      {!FULLSCREEN_PHASES.includes(phase) && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto p-4 sm:p-8"
          style={{ backgroundColor: "#0B0D10" }}>
          {/* Ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[120px]"
              style={{ background: "hsl(265 55% 58% / 0.04)" }} />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full blur-[100px]"
              style={{ background: "hsl(38 85% 58% / 0.03)" }} />
          </div>

          <div className="relative z-10 flex items-start gap-6 w-full max-w-4xl justify-center">
            <div className="flex-1 min-w-0">
              <BackgroundTaskBar tasks={currentBgTasks} />

              {/* Tone-aware calm mode indicator */}
              {toneContext.isOverwhelmed && showLearningPanel && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mb-3 rounded-xl border border-primary/10 bg-primary/5 px-4 py-2 flex items-center gap-2">
                  <Sun className="h-3.5 w-3.5 text-primary/60" />
                  <span className="text-[11px] text-muted-foreground">Calm mode — shorter steps, lighter detail. Take your time.</span>
                </motion.div>
              )}

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
                {phase === "network-setup" && (
                  <NetworkSetupStep key="network-setup" onNext={goNext} onPrev={goPrev}
                    onStateChange={({ connectionState, selectedNetwork }) => setState(s => ({ ...s, networkState: connectionState, networkSSID: selectedNetwork }))} />
                )}

                {phase === "device-readiness" && (
                  <DeviceReadinessStep key="device-readiness" onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "device-ownership" && (
                  <DeviceOwnershipStep key="device-ownership" selected={state.deviceOwnership}
                    onSelect={type => setState(s => ({ ...s, deviceOwnership: type }))} onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "account-environment" && (
                  <AccountEnvironmentStep key="account-environment" selectedPath={state.accountPath as never}
                    onPathChange={path => setState(s => ({ ...s, accountPath: path }))} onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "restore-preview" && (
                  <RestorePreviewStep key="restore-preview"
                    displayName={state.displayName}
                    onRestore={() => goNext()}
                    onRestoreLater={goNext}
                    onStartFresh={goNext}
                    onPrev={goPrev} />
                )}

                {phase === "setup-style" && (
                  <SetupStyleChooser key="setup-style" selected={state.setupStyle}
                    onSelect={s => setState(prev => ({ ...prev, setupStyle: s }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "access-protection" && (
                  <AccessProtectionStep key="access-protection" onNext={goNext} onPrev={goPrev}
                    onStateChange={({ accessMethod, recoveryMethod }) => setState(s => ({ ...s, accessMethod, recoveryMethod }))} />
                )}

                {phase === "recover-first" && (
                  <RecoverFirstStep key="recover-first"
                    selected={state.recoverFirst}
                    onSelect={v => setState(s => ({ ...s, recoverFirst: v }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "privacy-transparency" && (
                  <PrivacyTransparencyStep key="privacy-transparency"
                    permissionChoices={state.permissionChoices}
                    onUpdate={choices => setState(s => ({ ...s, permissionChoices: choices }))}
                    deviceOwnership={state.deviceOwnership}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "memory-consent" && (
                  <MemoryConsentStep key="memory-consent"
                    selected={state.memoryConsent}
                    onSelect={v => setState(s => ({ ...s, memoryConsent: v }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "personalization-pivot" && (
                  <PersonalizationPivotStep key="personalization-pivot"
                    onNext={goNext} onPrev={goPrev}
                    onRequestFast={() => { setState(s => ({ ...s, setupStyle: "express" })); setSessionData("setupStyle", "express"); }}
                    onRequestDeep={() => { setState(s => ({ ...s, setupStyle: "advanced" })); setSessionData("setupStyle", "advanced"); }}
                  />
                )}

                {phase === "quick-identity" && (
                  <QuickIdentityStep key="quick-identity"
                    data={state.quickIdentity}
                    onUpdate={qi => setState(s => ({ ...s, quickIdentity: qi }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "operating-context" && (
                  <OperatingContextStep key="operating-context"
                    selected={state.operatingContext}
                    onSelect={v => setState(s => ({ ...s, operatingContext: v }))}
                    supportNeedPrimary={state.supportNeedPrimary}
                    onSupportNeedSelect={v => setState(s => ({ ...s, supportNeedPrimary: v }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "want-less-of" && (
                  <WantLessOfStep key="want-less-of"
                    selected={state.wantLessOf}
                    onToggle={key => setState(s => ({ ...s, wantLessOf: s.wantLessOf.includes(key) ? s.wantLessOf.filter(k => k !== key) : [...s.wantLessOf, key] }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "protect-most" && (
                  <ProtectMostStep key="protect-most"
                    selected={state.protectMost}
                    onToggle={key => setState(s => ({ ...s, protectMost: s.protectMost.includes(key) ? s.protectMost.filter(k => k !== key) : [...s.protectMost, key] }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "deep-world-modeling" && (
                  <DeepWorldModelingStep key="deep-world-modeling"
                    data={state.worldModel}
                    onUpdate={wm => setState(s => ({ ...s, worldModel: wm }))}
                    setupStyle={state.setupStyle}
                    relevantDomains={[...state.enabledDomains, ...state.quickIdentity.runFirst, ...state.quickIdentity.slipPoints]}
                    toneContext={toneContext}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "household-graph" && (
                  <HouseholdGraphStep key="household-graph"
                    nodes={state.householdGraph}
                    onUpdate={nodes => setState(s => ({ ...s, householdGraph: nodes }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "relationship-sensitivity" && (
                  <RelationshipSensitivityStep key="relationship-sensitivity"
                    selected={state.relationshipFocus}
                    onSelect={v => setState(s => ({ ...s, relationshipFocus: v }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "life-rhythm" && (
                  <LifeRhythmStep key="life-rhythm" data={state.lifeRhythm}
                    onUpdate={lr => setState(s => ({ ...s, lifeRhythm: lr }))} onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "stress-slippage" && (
                  <StressSlippageStep key="stress-slippage" data={state.stressMap}
                    onUpdate={sm => setState(s => ({ ...s, stressMap: sm }))} onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "communications-context" && (
                  <CommunicationsContextStep key="comms-context" data={state.commsContext}
                    onUpdate={cc => setState(s => ({ ...s, commsContext: cc }))} onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "planning-style" && (
                  <PlanningStyleStep key="planning-style" data={state.planningStyle}
                    onUpdate={ps => setState(s => ({ ...s, planningStyle: ps }))} onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "explanation-style" && (
                  <ExplanationStyleStep key="explanation-style"
                    selected={state.explanationStyle}
                    onSelect={v => setState(s => ({ ...s, explanationStyle: v }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "presence-style" && (
                  <PresenceStyleStep key="presence-style"
                    selected={state.presenceStyle}
                    onSelect={v => setState(s => ({ ...s, presenceStyle: v }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "interruption-style" && (
                  <InterruptionStyleStep key="interruption-style"
                    selected={state.interruptionStyle}
                    onSelect={v => setState(s => ({ ...s, interruptionStyle: v }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "rituals" && (
                  <RitualsStep key="rituals"
                    selected={state.rituals}
                    onToggle={key => setState(s => ({ ...s, rituals: s.rituals.includes(key) ? s.rituals.filter(r => r !== key) : [...s.rituals, key] }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "home-composition" && (
                  <HomeCompositionStep key="home-composition"
                    selected={state.homeComposition}
                    onSelect={v => setState(s => ({ ...s, homeComposition: v }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "desktop-preview" && (
                  <DesktopPreviewStep key="desktop-preview" onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "primary-use-mode" && (
                  <PrimaryUseModeStep key="primary-use-mode"
                    selected={state.primaryUseMode}
                    onSelect={mode => setState(s => ({ ...s, primaryUseMode: mode }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "trust-calibration" && (
                  <TrustCalibrationStep key="trust-calibration"
                    data={state.trustCalibration}
                    onUpdate={tc => setState(s => ({ ...s, trustCalibration: tc }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "advisor-activation" && (
                  <AdvisorActivationStep key="advisor-activation"
                    advisors={state.advisorActivation}
                    onUpdate={aa => setState(s => ({ ...s, advisorActivation: aa }))}
                    primaryUseMode={state.primaryUseMode}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "environment-summary" && (
                  <EnvironmentSummaryStep key="env-summary" displayName={state.displayName} trustLevel={state.trustLevel}
                    primaryUseMode={state.primaryUseMode} enabledDomains={state.enabledDomains}
                    activeAdvisors={state.advisorActivation} lifeRhythm={state.lifeRhythm}
                    stressMap={state.stressMap} commsContext={state.commsContext} planningStyle={state.planningStyle}
                    connectedSystems={state.connectedSystems} firstWinAction={state.firstWin.action}
                    copyDensity={toneContext.copyDensity}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "first-connections" && (
                  <FirstConnectionsStep key="first-connections"
                    enabledDomains={state.enabledDomains}
                    primaryUseMode={state.primaryUseMode}
                    onConnectedChange={count => setState(s => ({ ...s, connectedSystems: count }))}
                    onDeferredChange={d => setState(s => ({ ...s, deferredConnections: d }))}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "first-win-setup" && (
                  <FirstWinSetupStep key="first-win-setup"
                    data={state.firstWin}
                    onUpdate={fw => setState(s => ({ ...s, firstWin: fw }))}
                    primaryUseMode={state.primaryUseMode}
                    painPoints={state.quickIdentity.slipPoints}
                    toneClass={toneContext.toneClass}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "first-simulation" && (
                  <FirstSimulationStep key="first-simulation" onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "first-actions" && (
                  <FirstActionsStep key="first-actions"
                    enabledDomains={state.enabledDomains}
                    protectionPriorities={state.protectMost}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "arrival-prep" && (
                  <ArrivalPrepStep key="arrival-prep"
                    displayName={state.displayName}
                    enabledDomains={state.enabledDomains}
                    trustLevel={state.trustLevel}
                    rituals={state.rituals}
                    aiStyle={state.aiStyle}
                    primaryUseMode={state.primaryUseMode}
                    activeAdvisors={state.advisorActivation}
                    connectedSystems={state.connectedSystems}
                    firstWinAction={state.firstWin.action}
                    permissionChoices={state.permissionChoices}
                    deferredCount={state.deferredConnections.length}
                    deferredItems={state.deferredConnections}
                    trustCalibrationLevel={state.trustCalibration.level}
                    onNext={goNext} onPrev={goPrev} />
                )}

                {phase === "system-check" && (
                  <PhaseCard key="system-check" title="Initializing Your System" subtitle="Running final checks..." icon={Cpu}
                    step={currentStepNum} total={totalSteps} phaseStatus={phaseStatus} steppablePhases={steppablePhases} allPhaseStates={allPhaseStates}>
                    <SystemCheck onComplete={goNext} backgroundTasks={currentBgTasks} />
                  </PhaseCard>
                )}

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

            {showLearningPanel && (
              <LearningPanel state={state} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
