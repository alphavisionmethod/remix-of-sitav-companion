// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust & Autonomy Calibration Step (Phase 2.12)
// ═══════════════════════════════════════════════════════════════

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, MessageSquare, FlaskConical, ShieldCheck, Zap,
  ChevronDown, DollarSign, Calendar, Mail, Bell,
  AlertTriangle, Users, Briefcase, Shield, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SetupStageHeader, StageTransitionController, TrustLadderControl } from "@/platform/sita/components/sita/setup";
import { ProofPreviewCard } from "@/platform/sita/components/sita/onboarding/ProofPreviewCard";

export interface TrustCalibrationData {
  level: number;
  spendingThreshold: number;
  financialApprovals: boolean;
  calendarApprovals: boolean;
  communicationApprovals: boolean;
  reminderFrequency: string;
  escalationBehavior: string;
  familyPermissions: boolean;
  businessPermissions: boolean;
  silentAutomation: boolean;
}

interface TrustCalibrationStepProps {
  data: TrustCalibrationData;
  onUpdate: (data: TrustCalibrationData) => void;
  onNext: () => void;
  onPrev: () => void;
}

const TRUST_LEVELS = [
  { level: 1, icon: Eye, title: "Observe only", desc: "SITA watches, never acts", stages: [true, false, false, false, false] },
  { level: 2, icon: MessageSquare, title: "Suggest", desc: "SITA recommends, you decide", stages: [true, true, false, false, false] },
  { level: 3, icon: FlaskConical, title: "Simulate before action", desc: "SITA previews outcomes, asks before proceeding", stages: [true, true, true, false, false] },
  { level: 4, icon: ShieldCheck, title: "Ask before acting", desc: "SITA prepares actions, executes only on approval", stages: [true, true, true, true, false] },
  { level: 5, icon: Zap, title: "Handle routine tasks", desc: "SITA manages repetitive tasks, flags exceptions", stages: [true, true, true, true, true] },
];

const WORKFLOW_STAGES = ["Draft", "Preview", "Approval", "Execute", "Proof"];

const REMINDER_OPTIONS = ["minimal", "balanced", "frequent"];
const ESCALATION_OPTIONS = ["silent", "notify", "urgent"];

export function TrustCalibrationStep({ data, onUpdate, onNext, onPrev }: TrustCalibrationStepProps) {
  const [showFineTune, setShowFineTune] = useState(false);
  const [prevLevel, setPrevLevel] = useState(data.level);
  const directionRef = useRef<"up" | "down">("up");
  const selectedLevel = TRUST_LEVELS.find(t => t.level === data.level);
  const prefersReduced = useReducedMotion();

  // Track direction of trust level change for directional animations
  if (data.level !== prevLevel) {
    directionRef.current = data.level > prevLevel ? "up" : "down";
    setPrevLevel(data.level);
  }

  const update = (partial: Partial<TrustCalibrationData>) => onUpdate({ ...data, ...partial });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Trust ladder + controls */}
        <div className="lg:col-span-3 space-y-5">
          {/* Header */}
          <SetupStageHeader
            icon={Shield}
            title="Choose how SITA should help"
            subtitle="You control what SITA can suggest, simulate, and handle"
            align="left"
          />

          {/* Trust Ladder */}
          <div className="space-y-1">
            {TRUST_LEVELS.map((t, i) => {
              const isSelected = data.level === t.level;
              const isBelow = data.level > t.level;
              return (
                <div key={t.level}>
                  <motion.button
                    onClick={() => update({ level: t.level })}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left transition-all duration-300 relative",
                      isSelected
                        ? "border-primary/50 bg-primary/8 shadow-sm shadow-primary/10"
                        : isBelow
                          ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/3"
                          : "border-border bg-secondary/20 hover:border-primary/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "rounded-lg p-2 transition-colors",
                        isSelected ? "bg-primary/15" : isBelow ? "bg-[hsl(var(--trust-safe))]/10" : "bg-secondary"
                      )}>
                        <t.icon className={cn("h-4 w-4",
                          isSelected ? "text-primary" : isBelow ? "text-[hsl(var(--trust-safe))]" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                      {(isSelected || isBelow) && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className={cn("flex h-5 w-5 items-center justify-center rounded-full",
                            isSelected ? "bg-primary" : "bg-[hsl(var(--trust-safe))]"
                          )}>
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                  {/* Connector line */}
                  {i < TRUST_LEVELS.length - 1 && (
                    <div className="flex justify-start pl-7">
                      <div className={cn(
                        "w-0.5 h-1 transition-colors",
                        data.level > t.level ? "bg-[hsl(var(--trust-safe))]/40" : "bg-border"
                      )} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Fine-tune section */}
          <motion.button
            onClick={() => setShowFineTune(!showFineTune)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", showFineTune && "rotate-180")} />
            Fine-tune controls
          </motion.button>

          <AnimatePresence>
            {showFineTune && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Spending threshold */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Spending threshold</span>
                    <span className="ml-auto text-xs text-primary font-mono">${data.spendingThreshold}</span>
                  </div>
                  <input
                    type="range" min={0} max={500} step={25}
                    value={data.spendingThreshold}
                    onChange={e => update({ spendingThreshold: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <p className="text-[10px] text-muted-foreground">Actions above this amount require your approval</p>
                </div>

                {/* Toggle controls */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "financialApprovals" as const, icon: DollarSign, label: "Financial approvals" },
                    { key: "calendarApprovals" as const, icon: Calendar, label: "Calendar changes" },
                    { key: "communicationApprovals" as const, icon: Mail, label: "Outbound comms" },
                    { key: "familyPermissions" as const, icon: Users, label: "Family permissions" },
                    { key: "businessPermissions" as const, icon: Briefcase, label: "Business workflows" },
                  ].map(ctrl => (
                    <button
                      key={ctrl.key}
                      onClick={() => update({ [ctrl.key]: !data[ctrl.key] } as never)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-all",
                        data[ctrl.key]
                          ? "border-primary/40 bg-primary/8"
                          : "border-border bg-secondary/20 hover:border-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <ctrl.icon className={cn("h-3.5 w-3.5", data[ctrl.key] ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-xs font-medium text-foreground">{ctrl.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {data[ctrl.key] ? "Requires approval" : "Auto-handled"}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Reminder frequency */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Reminder frequency</span>
                  </div>
                  <div className="flex gap-2">
                    {REMINDER_OPTIONS.map(opt => (
                      <button key={opt}
                        onClick={() => update({ reminderFrequency: opt })}
                        className={cn(
                          "flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-all",
                          data.reminderFrequency === opt
                            ? "border-primary/40 bg-primary/8 text-primary"
                            : "border-border bg-secondary/20 text-muted-foreground hover:border-primary/20"
                        )}
                      >{opt}</button>
                    ))}
                  </div>
                </div>

                {/* Escalation behavior */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Escalation behavior</span>
                  </div>
                  <div className="flex gap-2">
                    {ESCALATION_OPTIONS.map(opt => (
                      <button key={opt}
                        onClick={() => update({ escalationBehavior: opt })}
                        className={cn(
                          "flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-all",
                          data.escalationBehavior === opt
                            ? "border-primary/40 bg-primary/8 text-primary"
                            : "border-border bg-secondary/20 text-muted-foreground hover:border-primary/20"
                        )}
                      >{opt}</button>
                    ))}
                  </div>
                </div>

                {/* Silent automation toggle */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary" />
                      <div>
                        <span className="text-xs font-semibold text-foreground">Silent automation</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {data.silentAutomation
                            ? "Routine tasks run quietly — no notification unless flagged"
                            : "Every automated action shows a visible notification"}
                        </p>
                      </div>
                    </div>
                    <div
                      onClick={() => update({ silentAutomation: !data.silentAutomation })}
                      className={cn("relative h-6 w-11 rounded-full cursor-pointer transition-colors",
                        data.silentAutomation ? "bg-primary" : "bg-muted")}
                    >
                      <motion.div
                        animate={{ x: data.silentAutomation ? 20 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 h-4 w-4 rounded-full bg-white shadow"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Refine later */}
          <p className="text-[10px] text-muted-foreground text-center">
            You can refine trust and autonomy anytime in Settings → Trust & Governance.
          </p>

          {/* Navigation */}
          <StageTransitionController
            onPrev={onPrev}
            onNext={onNext}
            canAdvance={data.level > 0}
          />
        </div>

        {/* Right: Workflow preview */}
        <div className="lg:col-span-2 hidden lg:block">
          <div className="sticky top-8 rounded-2xl border border-border bg-card/50 p-6 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Workflow preview</h3>
              <p className="text-[10px] text-muted-foreground">How SITA processes actions at this trust level</p>
            </div>

            {/* Pipeline visualization */}
            <div className="space-y-2">
              {WORKFLOW_STAGES.map((stage, i) => {
                const isActive = selectedLevel ? selectedLevel.stages[i] : false;
                const stageDirection = directionRef.current;
                return (
                  <motion.div
                    key={stage}
                    layout={!prefersReduced}
                    animate={{
                      opacity: isActive ? 1 : 0.3,
                      scale: isActive ? 1 : 0.95,
                      x: isActive ? 0 : 4,
                      filter: isActive ? "blur(0px)" : "blur(1px)",
                    }}
                    transition={{
                      type: "spring",
                      damping: 22,
                      stiffness: 260,
                      delay: prefersReduced ? 0 : i * 0.06,
                    }}
                    className={cn(
                      "rounded-xl border p-3 transition-colors duration-300",
                      isActive
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/30 bg-secondary/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{
                          backgroundColor: isActive
                            ? "hsl(var(--primary) / 0.15)"
                            : "hsl(var(--muted))",
                          scale: isActive ? 1 : 0.9,
                        }}
                        transition={{ type: "spring", damping: 18, stiffness: 300, delay: prefersReduced ? 0 : i * 0.06 }}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      >
                        <span className={cn(isActive ? "text-primary" : "text-muted-foreground")}>{i + 1}</span>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold transition-colors duration-200", isActive ? "text-foreground" : "text-muted-foreground")}>{stage}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {i === 0 && "SITA prepares the action"}
                          {i === 1 && "Review before execution"}
                          {i === 2 && "Your explicit approval"}
                          {i === 3 && "Action is carried out"}
                          {i === 4 && "Verified proof recorded"}
                        </p>
                      </div>
                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            key={`dot-${stage}-active`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                              type: "spring",
                              damping: 15,
                              stiffness: 400,
                              delay: prefersReduced ? 0 : i * 0.08,
                            }}
                            className="ml-auto flex items-center gap-1.5"
                          >
                            <motion.div
                              animate={{ scale: [1, 1.4, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                              className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--trust-safe))]/40"
                            />
                            <div className="h-2 w-2 rounded-full bg-[hsl(var(--trust-safe))]" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {/* Progress bar within active stages */}
                    <motion.div
                      className="mt-2 h-0.5 rounded-full bg-primary/20 overflow-hidden"
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary/60 to-[hsl(var(--trust-safe))]"
                        initial={{ width: "0%" }}
                        animate={{ width: isActive ? "100%" : "0%" }}
                        transition={{
                          duration: prefersReduced ? 0.1 : 0.8,
                          ease: "easeOut",
                          delay: prefersReduced ? 0 : 0.15 + i * 0.1,
                        }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust summary */}
            <AnimatePresence mode="wait">
              {data.level > 0 && (
                <motion.div
                  key={`summary-${data.level}`}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ type: "spring", damping: 24, stiffness: 300 }}
                  className="rounded-xl bg-primary/5 border border-primary/20 p-4"
                >
                  <p className="text-xs text-foreground font-semibold mb-1">
                    {selectedLevel?.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {data.level === 1 && "SITA observes patterns and learns, but takes no action. You maintain full manual control."}
                    {data.level === 2 && "SITA drafts suggestions and surfaces insights. Every action requires your explicit decision."}
                    {data.level === 3 && "SITA simulates outcomes before proposing actions. You see what would happen before approving."}
                    {data.level === 4 && "SITA prepares and queues actions. Each one waits for your approval before executing."}
                    {data.level === 5 && "SITA handles routine tasks automatically. Exceptions and high-impact actions still need approval."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Proof-of-action preview */}
            <AnimatePresence mode="wait">
              {data.level > 0 && (
                <motion.div
                  key={`proof-${data.level}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ type: "spring", damping: 24, stiffness: 260, delay: 0.05 }}
                >
                  <ProofPreviewCard trustLevel={data.level} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
