// ════════════════════════════════════════════════════════════════
// ONBOARDING SURFACE: money-introduction  (registry: ONBOARDING_SURFACES)
// SCOPE: Optional Finance-app onboarding. Runs inside the Money app
//        on first visit. NOT the OS first-boot flow, NOT business formation.
// Truth source: src/lib/architecture/onboarding-surface-registry.ts
// ════════════════════════════════════════════════════════════════
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SetupShell } from "@/platform/sita/components/sita/setup/SetupShell";
import {
  DEFAULT_ONBOARDING_STATE,
  persistMoneyOnboarding,
  type MoneyOnboardingState,
  type MoneyMode,
  type FinancialPriority,
  type BudgetStyle,
  type OperatingMode,
  type ConnectedAccountStub,
  type StructureItem,
} from "./types";
import { MoneyWelcomeStep } from "./MoneyWelcomeStep";
import { MoneyIdentityStep } from "./MoneyIdentityStep";
import { FinancialPrioritiesStep } from "./FinancialPrioritiesStep";
import { ConnectAccountsStep } from "./ConnectAccountsStep";
import { MoneyStructureStep } from "./MoneyStructureStep";
import { BudgetStyleStep } from "./BudgetStyleStep";
import { FounderBoundaryStep } from "./FounderBoundaryStep";
import { HouseholdSharingStep } from "./HouseholdSharingStep";
import { OperatingModeStep } from "./OperatingModeStep";
import { MoneyOfficeRevealStep } from "./MoneyOfficeRevealStep";

type StepId = "welcome" | "identity" | "priorities" | "connect" | "structure" | "budget-style" | "founder" | "household" | "operating-mode" | "reveal";

interface Props {
  onComplete: () => void;
}

export function MoneyOnboardingFlow({ onComplete }: Props) {
  const reduced = useReducedMotion();
  const [state, setState] = useState<MoneyOnboardingState>(DEFAULT_ONBOARDING_STATE);
  const [currentStep, setCurrentStep] = useState<StepId>("welcome");

  const showFounder = state.moneyMode === "founder" || state.moneyMode === "hybrid" || state.includesBusiness;
  const showHousehold = state.moneyMode === "household" || state.moneyMode === "hybrid" || state.includesHousehold;

  const steps = useMemo<StepId[]>(() => {
    const base: StepId[] = ["welcome", "identity", "priorities", "connect", "structure", "budget-style"];
    if (showFounder) base.push("founder");
    if (showHousehold) base.push("household");
    base.push("operating-mode", "reveal");
    return base;
  }, [showFounder, showHousehold]);

  const currentIndex = steps.indexOf(currentStep);
  const next = useCallback(() => {
    const nextIdx = currentIndex + 1;
    if (nextIdx < steps.length) setCurrentStep(steps[nextIdx]);
  }, [currentIndex, steps]);

  const patch = useCallback((p: Partial<MoneyOnboardingState>) => {
    setState((prev) => ({ ...prev, ...p }));
  }, []);

  const handleComplete = useCallback(() => {
    const final = { ...state, completed: true };
    persistMoneyOnboarding(final);
    onComplete();
  }, [state, onComplete]);

  const togglePriority = useCallback((p: FinancialPriority) => {
    setState((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(p) ? prev.priorities.filter((x) => x !== p) : [...prev.priorities, p],
    }));
  }, []);

  const toggleAccount = useCallback((type: ConnectedAccountStub["type"]) => {
    setState((prev) => {
      const exists = prev.connectedAccounts.find((a) => a.type === type);
      if (exists) {
        return { ...prev, connectedAccounts: prev.connectedAccounts.map((a) => (a.type === type ? { ...a, connected: !a.connected } : a)) };
      }
      return { ...prev, connectedAccounts: [...prev.connectedAccounts, { type, label: type, connected: true }] };
    });
  }, []);

  const toggleStructure = useCallback((type: StructureItem["type"]) => {
    setState((prev) => {
      const exists = prev.structureItems.find((s) => s.type === type);
      if (exists) {
        return { ...prev, structureItems: prev.structureItems.map((s) => (s.type === type ? { ...s, enabled: !s.enabled } : s)) };
      }
      return { ...prev, structureItems: [...prev.structureItems, { type, label: type, enabled: true }] };
    });
  }, []);

  const toggleBlurPoint = useCallback((bp: string) => {
    setState((prev) => ({
      ...prev,
      founderSetup: {
        ...prev.founderSetup,
        blurPoints: prev.founderSetup.blurPoints.includes(bp)
          ? prev.founderSetup.blurPoints.filter((x) => x !== bp)
          : [...prev.founderSetup.blurPoints, bp],
      },
    }));
  }, []);

  // Progress bar
  const progress = steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 0;

  return (
    <SetupShell>
      <div className="w-full max-w-xl mx-auto pb-24 sm:pb-0">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Financial Formation
            </span>
            <span className="text-[10px] text-muted-foreground">
              {currentIndex + 1} / {steps.length}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-sita-gold"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={reduced ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === "welcome" && (
              <MoneyWelcomeStep
                selected={state.moneyMode}
                onSelect={(m: MoneyMode) => patch({ moneyMode: m })}
                onContinue={next}
              />
            )}
            {currentStep === "identity" && (
              <MoneyIdentityStep
                moneyMode={state.moneyMode}
                includesBusiness={state.includesBusiness}
                includesHousehold={state.includesHousehold}
                onChange={(p) => patch(p as Partial<MoneyOnboardingState>)}
                onContinue={next}
              />
            )}
            {currentStep === "priorities" && (
              <FinancialPrioritiesStep selected={state.priorities} onToggle={togglePriority} onContinue={next} />
            )}
            {currentStep === "connect" && (
              <ConnectAccountsStep connected={state.connectedAccounts} onToggle={toggleAccount} onContinue={next} />
            )}
            {currentStep === "structure" && (
              <MoneyStructureStep items={state.structureItems} onToggle={toggleStructure} onContinue={next} />
            )}
            {currentStep === "budget-style" && (
              <BudgetStyleStep
                budgetStyle={state.budgetStyle}
                rollover={state.rollover}
                sinkingFunds={state.sinkingFunds}
                onChange={(p) => patch(p as Partial<MoneyOnboardingState>)}
                onContinue={next}
              />
            )}
            {currentStep === "founder" && (
              <FounderBoundaryStep
                founderSetup={state.founderSetup}
                onChange={(p) => patch({ founderSetup: { ...state.founderSetup, ...p } })}
                onToggleBlur={toggleBlurPoint}
                onContinue={next}
              />
            )}
            {currentStep === "household" && (
              <HouseholdSharingStep
                householdSetup={state.householdSetup}
                onChange={(p) => patch({ householdSetup: { ...state.householdSetup, ...p } })}
                onContinue={next}
              />
            )}
            {currentStep === "operating-mode" && (
              <OperatingModeStep
                selected={state.operatingMode}
                onSelect={(m: OperatingMode) => patch({ operatingMode: m })}
                onContinue={next}
              />
            )}
            {currentStep === "reveal" && (
              <MoneyOfficeRevealStep state={state} onEnterMoneyOffice={handleComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </SetupShell>
  );
}
