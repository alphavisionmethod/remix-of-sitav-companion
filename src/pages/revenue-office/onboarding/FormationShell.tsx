// ════════════════════════════════════════════════════════════════
// ONBOARDING SURFACE: business-formation  (registry: ONBOARDING_SURFACES)
// SCOPE: Per-business workspace formation. Runs inside BusinessAppShell
//        AFTER OS first-boot (os-first-boot) is complete, when
//        business_onboarding.completed_at IS NULL.
// NOT THE OS FIRST-BOOT FLOW. See OSSetupExperience for that.
// Truth source: src/lib/architecture/onboarding-surface-registry.ts
// ════════════════════════════════════════════════════════════════
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Waves } from "lucide-react";

import { STAGES, CHAPTERS, defaultOnboardingState, type OnboardingState, type StageId } from "./types";
import LiveOfficeSidebar from "./LiveOfficeSidebar";
import { useBusinessOnboarding } from "@/hooks/useBusinessOnboarding";

import CeremonyScreen from "./screens/CeremonyScreen";
import IdentityScreen from "./screens/IdentityScreen";
import PrioritiesScreen from "./screens/PrioritiesScreen";
import RevenueModelScreen from "./screens/RevenueModelScreen";
import AcquisitionScreen from "./screens/AcquisitionScreen";
import ConversionScreen from "./screens/ConversionScreen";
import JourneyScreen from "./screens/JourneyScreen";
import DeliveryScreen from "./screens/DeliveryScreen";
import FrictionScreen from "./screens/FrictionScreen";
import TeamScreen from "./screens/TeamScreen";
import ShapeSummaryScreen from "./screens/ShapeSummaryScreen";
import IntakeHubScreen from "./screens/IntakeHubScreen";
import ConnectionsScreen from "./screens/ConnectionsScreen";
import FileImportScreen from "./screens/FileImportScreen";
import ArtifactScreen from "./screens/ArtifactScreen";
import URLIntakeScreen from "./screens/URLIntakeScreen";
import ReconciliationScreen from "./screens/ReconciliationScreen";
import AutomationScreen from "./screens/AutomationScreen";
import AdvisorActivationScreen from "./screens/AdvisorActivationScreen";
import FirstWinScreen from "./screens/FirstWinScreen";
import RevealScreen from "./screens/RevealScreen";

const screenMap: Record<StageId, React.ComponentType<any>> = {
  ceremony: CeremonyScreen,
  identity: IdentityScreen,
  priorities: PrioritiesScreen,
  revenue_model: RevenueModelScreen,
  acquisition: AcquisitionScreen,
  conversion: ConversionScreen,
  journey: JourneyScreen,
  delivery: DeliveryScreen,
  friction: FrictionScreen,
  team: TeamScreen,
  shape_summary: ShapeSummaryScreen,
  intake_hub: IntakeHubScreen,
  connections: ConnectionsScreen,
  file_import: FileImportScreen,
  artifacts: ArtifactScreen,
  url_intake: URLIntakeScreen,
  reconciliation: ReconciliationScreen,
  automation: AutomationScreen,
  advisors: AdvisorActivationScreen,
  firstwin: FirstWinScreen,
  reveal: RevealScreen,
};

interface FormationShellProps {
  onComplete?: (finalState?: OnboardingState) => void;
}

export default function FormationShell({ onComplete }: FormationShellProps) {
  const { isLoading, isCompleted, savedState, saveProgress, markComplete } = useBusinessOnboarding();
  const [stage, setStage] = useState(0);
  const [state, setState] = useState<OnboardingState>(defaultOnboardingState);
  const [showChapterTransition, setShowChapterTransition] = useState(false);
  const initializedRef = useRef(false);

  // If already completed, call onComplete
  useEffect(() => {
    if (!isLoading && isCompleted && onComplete) {
      onComplete(savedState);
    }
  }, [isLoading, isCompleted, onComplete]);

  // Load saved progress
  useEffect(() => {
    if (!isLoading && !isCompleted && !initializedRef.current) {
      initializedRef.current = true;
      if (savedState.businessName || savedState.businessTypes.length > 0) {
        setState(savedState);
      }
    }
  }, [isLoading, isCompleted, savedState]);

  // Auto-save progress on stage change (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (stage > 0 && initializedRef.current) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveProgress(state);
      }, 1000);
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [stage, state, saveProgress]);

  const currentChapter = STAGES[stage]?.chapter;
  const pct = (stage / (STAGES.length - 1)) * 100;

  const shouldSkip = useCallback((idx: number): boolean => {
    const id = STAGES[idx]?.id;
    if (!id) return false;
    if (id === "connections" && !state.intakePaths.includes("connect")) return true;
    if (id === "file_import" && !state.intakePaths.includes("import")) return true;
    if (id === "artifacts" && !state.intakePaths.includes("artifacts")) return true;
    if (id === "url_intake" && !state.intakePaths.includes("urls")) return true;
    if (id === "reconciliation" && state.importedFiles.length === 0 && state.connectedSystems.length === 0) return true;
    if (state.setupDepth === "quick") {
      if (["team", "shape_summary"].includes(id)) return true;
    }
    return false;
  }, [state]);

  const nextStage = useCallback((from: number): number => {
    let n = from + 1;
    while (n < STAGES.length && shouldSkip(n)) n++;
    return Math.min(n, STAGES.length - 1);
  }, [shouldSkip]);

  const prevStage = useCallback((from: number): number => {
    let n = from - 1;
    while (n > 0 && shouldSkip(n)) n--;
    return Math.max(n, 0);
  }, [shouldSkip]);

  const next = useCallback(() => {
    const ns = nextStage(stage);
    const nc = STAGES[ns]?.chapter;
    if (nc !== currentChapter && ns < STAGES.length - 1) {
      setShowChapterTransition(true);
      setTimeout(() => { setShowChapterTransition(false); setStage(ns); }, 700);
    } else {
      setStage(ns);
    }
  }, [stage, currentChapter, nextStage]);

  const back = useCallback(() => setStage(prevStage(stage)), [stage, prevStage]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  if (isCompleted) return null;

  const Screen = screenMap[STAGES[stage].id];

  return (
    <div className="h-full bg-background relative overflow-hidden flex flex-col">
      <h1 className="sr-only">Business Formation</h1>
      {/* Background blobs — contained within the window */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[160px] transition-opacity duration-1000"
          style={{ background: "hsl(var(--primary) / 0.03)", opacity: stage > 0 ? 1 : 0.5 }} />
        <div className="absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full blur-[120px] transition-opacity duration-1000"
          style={{ background: "hsl(var(--sita-gold) / 0.02)", opacity: stage > 5 ? 1 : 0 }} />
      </div>

      {/* Chapter transition overlay — contained within window */}
      <AnimatePresence>
        {showChapterTransition && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background flex items-center justify-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }}>
              <p className="text-2xl font-bold text-foreground text-center">{STAGES[nextStage(stage)]?.chapter}</p>
              <div className="flex justify-center mt-3"><Waves className="h-5 w-5 text-primary animate-pulse" /></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar — normal flow, not sticky */}
      {stage > 0 && (
        <div className="z-10 bg-background/95 backdrop-blur-md border-b border-border/30 px-6 py-3 shrink-0">
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary text-[9px]">{currentChapter}</Badge>
                <p className="text-[10px] text-muted-foreground">Step {stage} of {STAGES.length - 1}</p>
                {state.setupDepth && (
                  <Badge className="bg-muted text-muted-foreground text-[8px] capitalize">{state.setupDepth} mode</Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">{Math.round(pct)}%</p>
            </div>
            <Progress value={pct} className="h-1.5 mb-2" />
            <div className="flex items-center gap-0.5 overflow-x-auto pb-1 scrollbar-none">
              {STAGES.slice(1).map((s, i) => {
                const idx = i + 1;
                const skipped = shouldSkip(idx);
                if (skipped) return null;
                return (
                  <button key={s.id} onClick={() => idx <= stage ? setStage(idx) : null}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      idx === stage ? "bg-primary/10 text-primary" :
                      idx < stage ? "text-[hsl(var(--trust-safe))] cursor-pointer" :
                      "text-muted-foreground/50"
                    }`}>
                    {idx < stage ? <Check className="h-2.5 w-2.5 inline mr-0.5" /> : null}
                    <span className="hidden md:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main content — scrollable within window */}
      <div className="relative z-[1] flex-1 overflow-y-auto px-6 py-8 flex gap-8">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={STAGES[stage].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <Screen state={state} setState={setState} onNext={next} onBack={back} markComplete={markComplete} onComplete={onComplete} />
            </motion.div>
          </AnimatePresence>

          {stage > 0 && STAGES[stage].id !== "reveal" && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/20">
              <button onClick={back} className="px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors">
                <ArrowLeft className="h-4 w-4" />Back
              </button>
              <button onClick={next} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
                {stage === STAGES.length - 2 ? "Build My Revenue Office" : "Continue"}<ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <LiveOfficeSidebar state={state} stage={stage} />
      </div>
    </div>
  );
}
