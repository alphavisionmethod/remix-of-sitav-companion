import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, MessageSquare, FileText, DollarSign, Users, Brain, Bell,
  Shield, ChevronDown, ChevronRight, Check, Eye, Lock, RefreshCw,
  ArrowRight, AlertTriangle, CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SetupStageHeader, StageTransitionController } from "@/components/sita/setup";

interface Props {
  permissionChoices: Record<string, boolean>;
  onUpdate: (choices: Record<string, boolean>) => void;
  deviceOwnership?: "personal" | "family" | "work" | "";
  onNext: () => void;
  onPrev: () => void;
}

const PERMISSIONS = [
  {
    id: "calendar", icon: Calendar, title: "Calendar & Schedule Awareness",
    canSee: ["Upcoming events and deadlines", "Recurring patterns", "Free/busy time blocks"],
    canDo: ["Suggest optimal meeting times", "Detect conflicts early", "Prepare briefings before events"],
    needsApproval: ["Rescheduling or cancelling events", "Sending availability to others", "Creating new calendar entries"],
    changeLater: "Full control in Settings → Privacy → Calendar at any time.",
  },
  {
    id: "communication", icon: MessageSquare, title: "Communication Awareness",
    canSee: ["Email subject lines and senders", "Message urgency signals", "Follow-up patterns"],
    canDo: ["Flag unanswered messages", "Draft reply suggestions", "Prioritize your inbox"],
    needsApproval: ["Sending any message on your behalf", "Accessing message content", "Sharing contact information"],
    changeLater: "Full control in Settings → Privacy → Communication at any time.",
  },
  {
    id: "files", icon: FileText, title: "Files & Documents Awareness",
    canSee: ["File names and types", "Recent activity patterns", "Shared access status"],
    canDo: ["Organize and suggest filing", "Detect duplicates", "Surface relevant documents"],
    needsApproval: ["Opening or reading file contents", "Sharing files externally", "Deleting or moving files"],
    changeLater: "Full control in Settings → Privacy → Files at any time.",
  },
  {
    id: "money", icon: DollarSign, title: "Money & Financial Visibility",
    canSee: ["Account balances and trends", "Upcoming bills and due dates", "Spending categories"],
    canDo: ["Alert on unusual activity", "Track budget progress", "Forecast cash flow"],
    needsApproval: ["Initiating any payment", "Connecting new accounts", "Sharing financial data"],
    changeLater: "Full control in Settings → Privacy → Finances at any time.",
  },
  {
    id: "household", icon: Users, title: "Household & Shared Coordination",
    canSee: ["Shared calendar events", "Task assignments", "Household member preferences"],
    canDo: ["Coordinate schedules", "Distribute tasks fairly", "Send household reminders"],
    needsApproval: ["Adding or removing members", "Sharing household data externally", "Making purchases"],
    changeLater: "Full control in Settings → Privacy → Household at any time.",
  },
  {
    id: "behavior", icon: Brain, title: "Behavior Learning",
    canSee: ["Usage patterns over time", "Preference signals", "Routine rhythms"],
    canDo: ["Personalize suggestions", "Predict needs", "Optimize timing of actions"],
    needsApproval: ["Sharing learned patterns", "Cross-domain inference", "Behavioral profiling for third parties"],
    changeLater: "Full control in Settings → Privacy → Learning at any time.",
  },
  {
    id: "notifications", icon: Bell, title: "Notifications & Proactive Support",
    canSee: ["Alert types and frequency", "Response patterns", "Quiet hour preferences"],
    canDo: ["Filter noise intelligently", "Batch low-priority alerts", "Surface urgent items first"],
    needsApproval: ["Silencing critical alerts", "Contacting you on new channels", "Escalating to household members"],
    changeLater: "Full control in Settings → Privacy → Notifications at any time.",
  },
];

const SECTION_META = [
  { key: "canSee", icon: Eye, label: "What SITA can see", color: "text-primary" },
  { key: "canDo", icon: RefreshCw, label: "What it can do", color: "text-[hsl(var(--trust-safe))]" },
  { key: "needsApproval", icon: Lock, label: "What requires approval", color: "text-[hsl(var(--sita-gold))]" },
];

const spring = { type: "spring" as const, damping: 28, stiffness: 280 };

// Proof model preview steps
const PROOF_STEPS = [
  { icon: AlertTriangle, label: "Overlapping meetings detected", detail: "Board call + investor lunch at 2pm Tuesday", color: "text-[hsl(var(--sita-gold))]" },
  { icon: Brain, label: "Suggestion generated", detail: "Move investor lunch to Wednesday 12:30pm — both calendars free", color: "text-primary" },
  { icon: Lock, label: "Approval required before action", detail: "SITA will not reschedule without your explicit approval", color: "text-[hsl(var(--trust-safe))]" },
];

export function PrivacyTransparencyStep({ permissionChoices, onUpdate, deviceOwnership, onNext, onPrev }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [proofStep, setProofStep] = useState(0);

  const toggleExpand = (id: string) => {
    setReviewed(prev => new Set(prev).add(id));
    setExpandedId(prev => prev === id ? null : id);
  };

  const togglePermission = (id: string) => {
    onUpdate({ ...permissionChoices, [id]: !permissionChoices[id] });
  };

  const allReviewed = true; // Allow advancing without reviewing every domain
  const enabledCount = Object.values(permissionChoices).filter(Boolean).length;

  // Animate proof steps
  useEffect(() => {
    const interval = setInterval(() => {
      setProofStep(prev => (prev + 1) % (PROOF_STEPS.length + 1));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      transition={spring} className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">

      {/* Left — Permission Cards */}
      <div className="flex-1 min-w-0">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="mb-2">
          <SetupStageHeader
            icon={Shield}
            title="Your data, your control"
            subtitle="Choose how SITA can learn, personalize, and assist"
            align="left"
          />
        </motion.div>

        <p className="text-xs text-muted-foreground/70 mb-6">
          Expand each card to review what SITA can access. Toggle permissions on or off. Every choice can be changed later.
        </p>

        {deviceOwnership === "work" && (
          <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--sita-gold))]/30 bg-[hsl(var(--sita-gold))]/5 px-4 py-3 mb-4">
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--sita-gold))] shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Managed device:</span> Your organization may have visibility into work-related data. Personal items remain private by default.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {PERMISSIONS.map((perm, i) => {
            const isExpanded = expandedId === perm.id;
            const isEnabled = permissionChoices[perm.id] ?? false;
            const wasReviewed = reviewed.has(perm.id);

            return (
              <motion.div key={perm.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ...spring }}
                className={cn(
                  "rounded-2xl border transition-all duration-300",
                  isExpanded ? "border-primary/40 bg-card shadow-lg shadow-primary/5" : "border-border/30 bg-card/40",
                  isEnabled && !isExpanded && "border-primary/20 bg-primary/[0.03]"
                )}>
                {/* Header */}
                <button onClick={() => toggleExpand(perm.id)}
                  className="w-full flex items-center gap-3 p-4 text-left">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                    isEnabled ? "bg-primary/15" : "bg-secondary/40")}>
                    <perm.icon className={cn("h-5 w-5", isEnabled ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{perm.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {isEnabled ? "Enabled" : "Disabled"} · {wasReviewed ? "Reviewed" : "Not reviewed"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div onClick={e => { e.stopPropagation(); togglePermission(perm.id); }}
                      className={cn("relative h-6 w-11 rounded-full cursor-pointer transition-colors",
                        isEnabled ? "bg-primary" : "bg-muted")}>
                      <motion.div animate={{ x: isEnabled ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 h-4 w-4 rounded-full bg-white shadow" />
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-4">
                        {SECTION_META.map(sec => (
                          <div key={sec.key} className="rounded-xl bg-secondary/20 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <sec.icon className={cn("h-3.5 w-3.5", sec.color)} />
                              <span className="text-xs font-semibold text-foreground">{sec.label}</span>
                            </div>
                            <ul className="space-y-1">
                              {((perm as unknown as Record<string, string[]>)[sec.key] ?? []).map((item: string, j: number) => (
                                <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <span className="mt-1 h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        <div className="rounded-xl bg-primary/[0.04] border border-primary/10 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <RefreshCw className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-semibold text-foreground">Can be changed later</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{perm.changeLater}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <StageTransitionController
          onPrev={onPrev}
          onNext={onNext}
          canAdvance={allReviewed}
        />
      </div>

      {/* Right — Transparency Map + Proof Preview */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, ...spring }}
        className="lg:w-80 shrink-0 hidden lg:block space-y-4">
        {/* Transparency Map */}
        <div className="rounded-2xl border border-border/30 bg-card/60 p-6" style={{ backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Transparency Map</p>
          <div className="space-y-3">
            {PERMISSIONS.map(perm => {
              const isEnabled = permissionChoices[perm.id] ?? false;
              return (
                <div key={perm.id} className="flex items-center gap-3">
                  <motion.div animate={{ scale: isEnabled ? 1.1 : 1, opacity: isEnabled ? 1 : 0.4 }}
                    className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                      isEnabled ? "bg-primary/15" : "bg-secondary/30")}>
                    <perm.icon className={cn("h-3.5 w-3.5", isEnabled ? "text-primary" : "text-muted-foreground/40")} />
                  </motion.div>
                  <span className={cn("text-xs flex-1", isEnabled ? "text-foreground font-medium" : "text-muted-foreground/50")}>
                    {perm.title.split(" ")[0]}
                  </span>
                  {isEnabled && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="h-2 w-2 rounded-full bg-[hsl(var(--trust-safe))]" />
                  )}
                </div>
              );
            })}
          </div>
          {/* Connection lines between enabled domains */}
          <AnimatePresence>
            {enabledCount >= 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mt-4 pt-3 border-t border-border/20">
                <p className="text-[10px] text-muted-foreground/70 mb-2">Cross-domain intelligence</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(permissionChoices).filter(([, v]) => v).map(([k], i, arr) => {
                    if (i >= arr.length - 1) return null;
                    const nextKey = arr[i + 1]?.[0];
                    return (
                      <motion.div key={`${k}-${nextKey}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className="rounded-lg bg-primary/[0.06] border border-primary/10 px-2 py-0.5 text-[9px] text-primary">
                        {k.slice(0, 4)} ↔ {nextKey?.slice(0, 4)}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-4 pt-3 border-t border-border/20">
            <div className="flex items-center gap-2">
              <motion.div animate={{ scale: enabledCount === 7 ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 1.5, repeat: enabledCount === 7 ? Infinity : 0 }}>
                <Shield className={cn("h-4 w-4", enabledCount === 7 ? "text-[hsl(var(--trust-safe))]" : "text-muted-foreground")} />
              </motion.div>
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-semibold">{enabledCount}/7</span> domains enabled
              </p>
            </div>
          </div>
        </div>

        {/* Proof Model Preview */}
        <div className="rounded-2xl border border-border/30 bg-card/60 p-5" style={{ backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">How SITA works</p>
          <div className="space-y-3">
            {PROOF_STEPS.map((step, i) => (
              <motion.div key={i}
                animate={{ opacity: proofStep >= i ? 1 : 0.3, y: proofStep >= i ? 0 : 4 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-3">
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg shrink-0",
                  proofStep >= i ? "bg-primary/10" : "bg-secondary/30")}>
                  {proofStep > i ? (
                    <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />
                  ) : (
                    <step.icon className={cn("h-3.5 w-3.5", proofStep >= i ? step.color : "text-muted-foreground/30")} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[11px] font-semibold", proofStep >= i ? "text-foreground" : "text-muted-foreground/40")}>
                    {step.label}
                  </p>
                  <p className={cn("text-[10px]", proofStep >= i ? "text-muted-foreground" : "text-muted-foreground/30")}>
                    {step.detail}
                  </p>
                </div>
                {i < PROOF_STEPS.length - 1 && (
                  <ArrowRight className={cn("h-3 w-3 mt-1 shrink-0", proofStep > i ? "text-primary/40" : "text-muted-foreground/20")} />
                )}
              </motion.div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground/50 mt-3 text-center">
            Every action follows: detect → suggest → approve → act
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
