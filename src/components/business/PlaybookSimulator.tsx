// ═══════════════════════════════════════════════════════════════
// SITA OS — Playbook Simulator
// Step-through simulation UI for previewing playbook outcomes
// before activating live.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import {
  Play, Pause, SkipForward, RotateCcw, CheckCircle, XCircle,
  Users, DollarSign, TrendingUp, Clock, Zap, GitBranch, Shield,
  Mail, Phone, MessageSquare, AlertTriangle, RefreshCw, ArrowUpRight,
  ChevronRight, Sparkles
} from "lucide-react";
import {
  simulatePlaybook,
  MOCK_CUSTOMERS,
  type PlaybookDraftSim,
  type StepOutcome,
  type SimulationResult,
  type MockCustomer,
} from "@/lib/domain-engines/playbook-simulator";
import { useDataMode } from "@/contexts/DataModeContext";

// ── Icon map ─────────────────────────────────────────────────────

const ACTION_ICONS: Record<string, typeof Mail> = {
  email: Mail, sms: MessageSquare, call: Phone,
  escalation: AlertTriangle, "follow-up": RefreshCw,
  upsell: ArrowUpRight, discount: DollarSign, task: CheckCircle,
};

const STEP_ICONS: Record<string, typeof Zap> = {
  action: Zap, condition: GitBranch, delay: Clock, gate: Shield,
};

// ── Customer avatar ──────────────────────────────────────────────

const CustomerChip = ({ customer, filtered }: { customer: MockCustomer; filtered?: boolean }) => (
  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
    filtered
      ? "bg-destructive/10 text-destructive/60 line-through"
      : "bg-primary/10 text-primary"
  }`}>
    <div className={`h-1.5 w-1.5 rounded-full ${filtered ? "bg-destructive/40" : customer.healthScore > 50 ? "bg-trust-safe" : "bg-urgency-high"}`} />
    {customer.name}
  </div>
);

// ── Step outcome card ────────────────────────────────────────────

const StepOutcomeCard = ({
  outcome, isActive, stepNumber }: { outcome: StepOutcome; isActive: boolean; stepNumber: number }) => {
  const Icon = outcome.action
    ? ACTION_ICONS[outcome.action] || Zap
    : STEP_ICONS[outcome.stepType] || Zap;

  const typeColors: Record<string, string> = {
    action: "border-primary/30 bg-primary/5",
    condition: "border-accent/30 bg-accent/5",
    delay: "border-muted-foreground/20 bg-muted/30",
    gate: "border-destructive/30 bg-destructive/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05, duration: 0.3 }}
      className={`relative rounded-xl border transition-all ${
        isActive ? `${typeColors[outcome.stepType]} shadow-lg ring-1 ring-primary/20` : "border-border bg-card/60"
      }`}
    >
      {/* Step header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
          outcome.stepType === "action" ? "bg-primary/15 text-primary"
          : outcome.stepType === "condition" ? "bg-accent/15 text-accent"
          : outcome.stepType === "delay" ? "bg-muted text-muted-foreground"
          : "bg-destructive/15 text-destructive"
        }`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Step {stepNumber}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase">{outcome.stepType}</span>
          </div>
          <p className="text-sm font-semibold text-foreground">{outcome.stepName}</p>
        </div>
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
          />
        )}
      </div>

      {/* Narrative */}
      <div className="px-4 pb-3">
        <p className="text-[11px] text-muted-foreground leading-relaxed">{outcome.narrative}</p>
      </div>

      {/* Customers affected */}
      <div className="px-4 pb-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">
          {outcome.stepType === "condition" ? "Customers Passing" : "Customers Reached"}
        </p>
        <div className="flex flex-wrap gap-1">
          {outcome.customersAffected.map(c => (
            <CustomerChip key={c.id} customer={c} />
          ))}
        </div>
        {outcome.customersFiltered.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5 mt-2">Filtered Out</p>
            <div className="flex flex-wrap gap-1">
              {outcome.customersFiltered.map(c => (
                <CustomerChip key={c.id} customer={c} filtered />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Branch results */}
      {outcome.branchResults && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-2">
          {outcome.branchResults.map((b, i) => (
            <div key={i} className={`p-2.5 rounded-lg border ${i === 0 ? "border-trust-safe/20 bg-trust-safe/5" : "border-destructive/20 bg-destructive/5"}`}>
              <p className={`text-[10px] font-semibold ${i === 0 ? "text-trust-safe" : "text-destructive"}`}>{b.label}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{b.customers.length} customer(s)</p>
            </div>
          ))}
        </div>
      )}

      {/* Metrics row for action steps */}
      {outcome.stepType === "action" && (
        <div className="px-4 pb-4 flex gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-trust-safe/10">
            <DollarSign className="h-3 w-3 text-trust-safe" />
            <span className="text-[10px] font-bold text-trust-safe">+${outcome.revenueDelta.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">{(outcome.predictedResponseRate * 100).toFixed(0)}% response</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/10">
            <Users className="h-3 w-3 text-accent" />
            <span className="text-[10px] font-bold text-accent">{outcome.customersAffected.length} reached</span>
          </div>
        </div>
      )}

      {/* Delay visual */}
      {outcome.stepType === "delay" && outcome.delayLabel && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-[11px] font-medium text-foreground">Waiting {outcome.delayLabel}</span>
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden ml-2">
              <motion.div
                className="h-full rounded-full bg-muted-foreground/40"
                initial={{ width: "0%" }}
                animate={{ width: isActive ? "100%" : "0%" }}
                transition={{ duration: 2, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Gate visual */}
      {outcome.stepType === "gate" && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/15">
            <Shield className="h-4 w-4 text-destructive" />
            <span className="text-[11px] font-medium text-foreground">Requires approval before continuing</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ── Summary dashboard ────────────────────────────────────────────

const SimulationSummary = ({ result, onActivate, onBack }: {
  result: SimulationResult;
  onActivate: () => void;
  onBack: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    <SitaCard className="p-5 border-trust-safe/20" hover={false}>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-trust-safe/15 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-trust-safe" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Simulation Complete</p>
          <p className="text-[11px] text-muted-foreground">All steps processed with {result.totalReach} mock customers</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-trust-safe/5 border border-trust-safe/10">
          <DollarSign className="h-4 w-4 text-trust-safe mb-1" />
          <p className="text-lg font-bold text-trust-safe">${result.expectedRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Projected Revenue</p>
        </div>
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
          <TrendingUp className="h-4 w-4 text-primary mb-1" />
          <p className="text-lg font-bold text-primary">{(result.conversionRate * 100).toFixed(0)}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Conversion</p>
        </div>
        <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
          <Users className="h-4 w-4 text-accent mb-1" />
          <p className="text-lg font-bold text-accent">+{result.avgHealthImprovement.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground">Avg Health Δ</p>
        </div>
        <div className="p-3 rounded-xl bg-secondary border border-border">
          <Clock className="h-4 w-4 text-muted-foreground mb-1" />
          <p className="text-lg font-bold text-foreground">{result.timelineDays.toFixed(1)}d</p>
          <p className="text-[10px] text-muted-foreground">Total Duration</p>
        </div>
      </div>

      <div className="flex gap-2 mt-5">
        <SitaButton variant="primary" size="sm" className="flex-1" onClick={onActivate}>
          <CheckCircle className="h-3.5 w-3.5" /> Looks Good — Activate
        </SitaButton>
        <SitaButton variant="secondary" size="sm" className="flex-1" onClick={onBack}>
          <RotateCcw className="h-3.5 w-3.5" /> Adjust Playbook
        </SitaButton>
      </div>
    </SitaCard>
  </motion.div>
);

// ── Customer selector ────────────────────────────────────────────

const CustomerSelector = ({ customers, selected, onToggle }: {
  customers: MockCustomer[];
  selected: string[];
  onToggle: (id: string) => void;
}) => (
  <SitaCard className="p-4" hover={false}>
    <SitaCardTitle sub="Select customers for simulation">Mock Customers</SitaCardTitle>
    <div className="mt-3 space-y-1.5">
      {customers.map(c => (
        <button
          key={c.id}
          onClick={() => onToggle(c.id)}
          className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
            selected.includes(c.id)
              ? "bg-primary/10 border border-primary/20"
              : "bg-secondary/30 border border-transparent hover:border-border"
          }`}
        >
          <div className={`h-2 w-2 rounded-full shrink-0 ${c.healthScore > 50 ? "bg-trust-safe" : "bg-urgency-high"}`} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-foreground">{c.name}</p>
            <p className="text-[9px] text-muted-foreground">{c.segment} · Health {c.healthScore} · ${c.dealValue.toLocaleString()}</p>
          </div>
          {selected.includes(c.id) && <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />}
        </button>
      ))}
    </div>
  </SitaCard>
);

// ── Main simulator component ─────────────────────────────────────

interface PlaybookSimulatorProps {
  draft: PlaybookDraftSim;
  onBack: () => void;
  onActivate: () => void;
}

const PlaybookSimulator = ({ draft, onBack, onActivate }: PlaybookSimulatorProps) => {
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>((isDemoMode ? MOCK_CUSTOMERS : [] as typeof MOCK_CUSTOMERS).map(c => c.id));
  const [currentStep, setCurrentStep] = useState(-1); // -1 = not started
  const [autoPlay, setAutoPlay] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedCustomers = (isDemoMode ? MOCK_CUSTOMERS : [] as typeof MOCK_CUSTOMERS).filter(c => selectedCustomerIds.includes(c.id));

  // Run simulation
  useEffect(() => {
    if (selectedCustomers.length > 0) {
      setResult(simulatePlaybook(draft, selectedCustomers));
    } else {
      setResult(null);
    }
  }, [draft, selectedCustomerIds]);

  // Auto-play
  useEffect(() => {
    if (autoPlay && result) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev + 1;
          if (next >= result.steps.length) {
            setAutoPlay(false);
            setShowSummary(true);
            return prev;
          }
          return next;
        });
      }, 2000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoPlay, result]);

  const handleNext = () => {
    if (!result) return;
    if (currentStep < result.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleReset = () => {
    setCurrentStep(-1);
    setAutoPlay(false);
    setShowSummary(false);
  };

  const toggleCustomer = (id: string) => {
    setSelectedCustomerIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    handleReset();
  };

  const started = currentStep >= 0;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <SitaCard className="p-4" hover={false}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent/15 flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Simulation Mode</p>
              <p className="text-[10px] text-muted-foreground">
                {!started ? "Press play to walk through each step" :
                 showSummary ? "Simulation complete" :
                 `Step ${currentStep + 1} of ${result?.steps.length || 0}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!started ? (
              <SitaButton variant="primary" size="sm" onClick={() => { setCurrentStep(0); }}>
                <Play className="h-3.5 w-3.5" /> Start
              </SitaButton>
            ) : (
              <>
                <SitaButton variant="secondary" size="sm" onClick={() => setAutoPlay(!autoPlay)}>
                  {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {autoPlay ? "Pause" : "Auto"}
                </SitaButton>
                <SitaButton variant="secondary" size="sm" onClick={handleNext} disabled={showSummary}>
                  <SkipForward className="h-3.5 w-3.5" /> Next
                </SitaButton>
                <SitaButton variant="secondary" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </SitaButton>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {started && result && (
          <div className="mt-3 flex items-center gap-2">
            {result.steps.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  i <= currentStep ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>
        )}
      </SitaCard>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: Step timeline */}
        <div className="lg:col-span-2 space-y-3">
          {!started && !showSummary && (
            <div className="flex items-center justify-center p-12 rounded-xl border border-dashed border-border bg-card/30">
              <div className="text-center">
                <Play className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Press Start to begin simulation</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {selectedCustomers.length} customer(s) · {draft.steps.filter(s => s.enabled).length} step(s)
                </p>
              </div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {started && result && result.steps.slice(0, currentStep + 1).map((outcome, i) => (
              <StepOutcomeCard
                key={outcome.stepId}
                outcome={outcome}
                isActive={i === currentStep && !showSummary}
                stepNumber={i + 1}
              />
            ))}
          </AnimatePresence>

          {showSummary && result && (
            <SimulationSummary result={result} onActivate={onActivate} onBack={onBack} />
          )}
        </div>

        {/* Right: Customer selector */}
        <div>
          <CustomerSelector
            customers={MOCK_CUSTOMERS}
            selected={selectedCustomerIds}
            onToggle={toggleCustomer}
          />
        </div>
      </div>
    </div>
  );
};

export default PlaybookSimulator;
