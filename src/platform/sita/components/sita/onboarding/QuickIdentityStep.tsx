import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, Check, Sparkles, BarChart3, MessageSquare,
  Brain, Shield, Users, DollarSign, Briefcase, Bell, Zap, Layout,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SetupStageHeader, StageTransitionController } from "@/platform/sita/components/sita/setup";

export interface QuickIdentityData {
  runFirst: string[];
  slipPoints: string[];
  supportStyle: string;
  infoPreference: string[];
  easierFirst: string;
}

interface Props {
  data: QuickIdentityData;
  onUpdate: (data: QuickIdentityData) => void;
  onNext: () => void;
  onPrev: () => void;
}

const RUN_FIRST = ["Business ops", "Family management", "Money tracking", "Daily scheduling", "Everything"];
const SLIP_POINTS = ["Follow-ups", "Bills & payments", "Calendar conflicts", "Client communication", "Household tasks", "Deadlines"];
const SUPPORT_STYLES = [
  { key: "proactive", title: "Proactive partner", desc: "SITA anticipates needs and acts ahead of you", icon: Sparkles },
  { key: "quiet", title: "Quiet assistant", desc: "SITA works silently, surfaces only what matters", icon: MessageSquare },
  { key: "expert", title: "On-demand expert", desc: "SITA waits for your questions, then goes deep", icon: BarChart3 },
];
const INFO_PREFS = ["Visual dashboards", "Short summaries", "Detailed reports", "Real-time alerts"];

const spring = { type: "spring" as const, damping: 28, stiffness: 280 };

const QUESTIONS = [
  { id: "runFirst", label: "What should SITA help you run first?" },
  { id: "slipPoints", label: "Where do things most often slip?" },
  { id: "supportStyle", label: "What kind of support feels right?" },
  { id: "infoPreference", label: "How do you prefer information?" },
  { id: "easierFirst", label: "What would you most like SITA to make easier first?" },
];

// Advisor suggestions based on selections
const ADVISOR_MAP: Record<string, { name: string; icon: typeof Brain; desc: string }> = {
  "Business ops": { name: "Business Advisor", icon: Briefcase, desc: "CRM, revenue, pipeline" },
  "Family management": { name: "Family Advisor", icon: Users, desc: "Schedules, tasks, coordination" },
  "Money tracking": { name: "Money Advisor", icon: DollarSign, desc: "Bills, budgets, savings" },
  "Daily scheduling": { name: "Schedule Advisor", icon: Bell, desc: "Calendar, routines, reminders" },
  "Everything": { name: "Full Advisory Council", icon: Sparkles, desc: "All advisors active" },
};

const TRUST_DEFAULTS: Record<string, string> = {
  "proactive": "Open — SITA acts freely on routine items",
  "quiet": "Balanced — important items need approval",
  "expert": "Guarded — SITA proposes, you decide",
};

const DESKTOP_EMPHASIS: Record<string, string> = {
  "Visual dashboards": "Rich charts and graphs prominent",
  "Short summaries": "Card-based digest layout",
  "Detailed reports": "Document-style deep analysis",
  "Real-time alerts": "Notification-first with live feeds",
};

export function QuickIdentityStep({ data, onUpdate, onNext, onPrev }: Props) {
  const [visibleQ, setVisibleQ] = useState(1);

  useEffect(() => {
    if (data.runFirst.length > 0 && visibleQ < 2) setVisibleQ(2);
    if (data.slipPoints.length > 0 && visibleQ < 3) setVisibleQ(3);
    if (data.supportStyle && visibleQ < 4) setVisibleQ(4);
    if (data.infoPreference.length > 0 && visibleQ < 5) setVisibleQ(5);
  }, [data, visibleQ]);

  const toggleChip = (field: "runFirst" | "slipPoints" | "infoPreference", value: string) => {
    const current = data[field];
    onUpdate({
      ...data,
      [field]: current.includes(value) ? current.filter(v => v !== value) : [...current, value],
    });
  };

  const answeredCount = [
    data.runFirst.length > 0,
    data.slipPoints.length > 0,
    data.supportStyle.length > 0,
    data.infoPreference.length > 0,
    data.easierFirst.length > 0,
  ].filter(Boolean).length;

  const canAdvance = answeredCount >= 2;

  // Derive suggestions
  const suggestedAdvisors = data.runFirst.map(r => ADVISOR_MAP[r]).filter(Boolean);
  const firstWinCandidates = data.slipPoints.slice(0, 3);
  const trustDefault = TRUST_DEFAULTS[data.supportStyle] || null;
  const desktopEmphasis = data.infoPreference.map(p => DESKTOP_EMPHASIS[p]).filter(Boolean);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      transition={spring} className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">

      <div className="flex-1 min-w-0">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="mb-6">
          <SetupStageHeader
            icon={Compass}
            title="Help SITA understand where to begin"
            subtitle="A few quick choices will shape your environment"
            align="left"
          />
        </motion.div>

        <div className="space-y-6">
          <AnimatePresence>
            {visibleQ >= 1 && (
              <QuestionBlock key="q1" label={QUESTIONS[0].label} index={0}>
                <div className="flex flex-wrap gap-2">
                  {RUN_FIRST.map(chip => (
                    <ChipButton key={chip} label={chip} selected={data.runFirst.includes(chip)}
                      onClick={() => toggleChip("runFirst", chip)} />
                  ))}
                </div>
              </QuestionBlock>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {visibleQ >= 2 && (
              <QuestionBlock key="q2" label={QUESTIONS[1].label} index={1}>
                <div className="flex flex-wrap gap-2">
                  {SLIP_POINTS.map(chip => (
                    <ChipButton key={chip} label={chip} selected={data.slipPoints.includes(chip)}
                      onClick={() => toggleChip("slipPoints", chip)} />
                  ))}
                </div>
              </QuestionBlock>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {visibleQ >= 3 && (
              <QuestionBlock key="q3" label={QUESTIONS[2].label} index={2}>
                <div className="space-y-2">
                  {SUPPORT_STYLES.map(s => (
                    <button key={s.key} onClick={() => onUpdate({ ...data, supportStyle: s.key })}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                        data.supportStyle === s.key ? "border-primary/50 bg-primary/8" : "border-border/30 bg-secondary/20 hover:border-primary/20"
                      )}>
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg",
                        data.supportStyle === s.key ? "bg-primary/15" : "bg-secondary")}>
                        <s.icon className={cn("h-4 w-4", data.supportStyle === s.key ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                      {data.supportStyle === s.key && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </QuestionBlock>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {visibleQ >= 4 && (
              <QuestionBlock key="q4" label={QUESTIONS[3].label} index={3}>
                <div className="flex flex-wrap gap-2">
                  {INFO_PREFS.map(chip => (
                    <ChipButton key={chip} label={chip} selected={data.infoPreference.includes(chip)}
                      onClick={() => toggleChip("infoPreference", chip)} />
                  ))}
                </div>
              </QuestionBlock>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {visibleQ >= 5 && (
              <QuestionBlock key="q5" label={QUESTIONS[4].label} index={4}>
                <input value={data.easierFirst} onChange={e => onUpdate({ ...data, easierFirst: e.target.value })}
                  placeholder="Optional — type anything"
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all" />
              </QuestionBlock>
            )}
          </AnimatePresence>
        </div>

        <StageTransitionController
          onPrev={onPrev}
          onNext={onNext}
          canAdvance={canAdvance}
        />
      </div>

      {/* Right — Rich Live Preview */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, ...spring }}
        className="lg:w-80 shrink-0 hidden lg:block space-y-4">
        
        {/* Suggested Advisors */}
        <div className="rounded-2xl border border-border/30 bg-card/60 p-5" style={{ backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Suggested Advisors</p>
          <AnimatePresence mode="popLayout">
            {suggestedAdvisors.length > 0 ? (
              <div className="space-y-2">
                {suggestedAdvisors.map((adv, i) => (
                  <motion.div key={adv.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2.5 rounded-xl bg-primary/[0.06] border border-primary/10 p-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                      <adv.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-foreground">{adv.name}</p>
                      <p className="text-[10px] text-muted-foreground">{adv.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground/50 italic">Select what to run first to see advisor suggestions</p>
            )}
          </AnimatePresence>
        </div>

        {/* First Win Candidates */}
        <AnimatePresence>
          {firstWinCandidates.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl border border-border/30 bg-card/60 p-5" style={{ backdropFilter: "blur(12px)" }}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">First Win Targets</p>
              <div className="space-y-1.5">
                {firstWinCandidates.map((c, i) => (
                  <motion.div key={c} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-2 text-xs">
                    <Zap className="h-3 w-3 text-[hsl(var(--sita-gold))]" />
                    <span className="text-foreground">{c}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Default + Desktop Emphasis */}
        <div className="rounded-2xl border border-border/30 bg-card/60 p-5" style={{ backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Environment Preview</p>
          
          {trustDefault && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--trust-safe))]/[0.06] border border-[hsl(var(--trust-safe))]/10 p-2.5 mb-2">
              <Shield className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground">Trust default</p>
                <p className="text-[11px] text-foreground">{trustDefault}</p>
              </div>
            </motion.div>
          )}

          {desktopEmphasis.length > 0 && (
            <div className="space-y-1.5 mt-2">
              <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <Layout className="h-3 w-3" /> Desktop emphasis
              </p>
              {desktopEmphasis.map((em, i) => (
                <motion.p key={em} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                  className="text-[11px] text-foreground pl-4">
                  • {em}
                </motion.p>
              ))}
            </div>
          )}

          {!trustDefault && desktopEmphasis.length === 0 && (
            <p className="text-[11px] text-muted-foreground/50 italic">Answer questions to see how your environment will look</p>
          )}
        </div>

        {/* Signal Count */}
        <div className="rounded-2xl border border-border/30 bg-card/60 p-4" style={{ backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">{answeredCount}/5</span> identity signals captured
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function QuestionBlock({ label, index, children }: { label: string; index: number; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 28, stiffness: 280 }}
      className="rounded-2xl border border-border/30 bg-card/40 p-5">
      <p className="text-sm font-semibold text-foreground mb-3">{label}</p>
      {children}
    </motion.div>
  );
}

function ChipButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn("rounded-xl border px-4 py-2 text-sm transition-all duration-200",
        selected ? "border-primary/40 bg-primary/10 text-foreground font-medium" : "border-border/30 bg-secondary/20 text-muted-foreground hover:border-border hover:text-foreground")}>
      {selected && <Check className="inline h-3 w-3 mr-1.5 text-primary" />}
      {label}
    </button>
  );
}
