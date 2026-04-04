// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust & Autonomy Calibration Step (Phase 2.12)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, MessageSquare, FlaskConical, ShieldCheck, Zap,
  ChevronRight, ChevronDown, DollarSign, Calendar, Mail, Bell,
  AlertTriangle, Users, Briefcase, Shield, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

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
  const selectedLevel = TRUST_LEVELS.find(t => t.level === data.level);

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
          <div className="text-center lg:text-left">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-foreground">Choose how SITA should help</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">You control what SITA can suggest, simulate, and handle</p>
          </div>

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
                      onClick={() => update({ [ctrl.key]: !data[ctrl.key] } as any)}
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
            <button onClick={onNext} disabled={data.level === 0}
              className={cn(
                "rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2",
                data.level > 0
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}>
              Continue <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
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
                return (
                  <motion.div
                    key={stage}
                    animate={{ opacity: isActive ? 1 : 0.3, scale: isActive ? 1 : 0.97 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className={cn(
                      "rounded-xl border p-3 transition-all",
                      isActive
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/30 bg-secondary/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors",
                        isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {i + 1}
                      </div>
                      <div>
                        <p className={cn("text-sm font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>{stage}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {i === 0 && "SITA prepares the action"}
                          {i === 1 && "Review before execution"}
                          {i === 2 && "Your explicit approval"}
                          {i === 3 && "Action is carried out"}
                          {i === 4 && "Verified proof recorded"}
                        </p>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto h-2 w-2 rounded-full bg-[hsl(var(--trust-safe))]"
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust summary */}
            {data.level > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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

            {/* Example workflow */}
            {data.level > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Example</p>
                <div className="rounded-lg bg-secondary/30 p-3 space-y-1.5">
                  <p className="text-[11px] text-foreground font-medium">💳 Subscription renewal detected</p>
                  <div className="space-y-1">
                    {data.level >= 1 && <p className="text-[10px] text-muted-foreground">→ SITA detects the charge pattern</p>}
                    {data.level >= 2 && <p className="text-[10px] text-muted-foreground">→ Suggests "Cancel unused service"</p>}
                    {data.level >= 3 && <p className="text-[10px] text-muted-foreground">→ Simulates savings: $14.99/month</p>}
                    {data.level >= 4 && <p className="text-[10px] text-muted-foreground">→ Drafts cancellation, awaits approval</p>}
                    {data.level >= 5 && <p className="text-[10px] text-[hsl(var(--trust-safe))]">→ Auto-cancels with proof receipt</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
