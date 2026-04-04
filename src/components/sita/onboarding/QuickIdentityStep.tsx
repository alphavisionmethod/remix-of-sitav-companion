import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, ChevronRight, Check, Sparkles, BarChart3, MessageSquare, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function QuickIdentityStep({ data, onUpdate, onNext, onPrev }: Props) {
  const [visibleQ, setVisibleQ] = useState(1);

  // Progressive reveal
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

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      transition={spring} className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">

      <div className="flex-1 min-w-0">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
            <Compass className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Help SITA understand where to begin</h2>
            <p className="text-sm text-muted-foreground">A few quick choices will shape your environment</p>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Q1: Run First */}
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

          {/* Q2: Slip Points */}
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

          {/* Q3: Support Style */}
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

          {/* Q4: Info Preference */}
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

          {/* Q5: Easier First */}
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

        <div className="flex items-center justify-between pt-6">
          <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
          <button onClick={onNext} disabled={!canAdvance}
            className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2",
              canAdvance ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
            Continue <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Right — Live Preview */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, ...spring }}
        className="lg:w-72 shrink-0 hidden lg:block">
        <div className="rounded-2xl border border-border/30 bg-card/60 p-6 sticky top-8" style={{ backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Identity Signals</p>
          <div className="space-y-4">
            {QUESTIONS.map((q, i) => {
              const filled = i === 0 ? data.runFirst.length > 0
                : i === 1 ? data.slipPoints.length > 0
                : i === 2 ? data.supportStyle.length > 0
                : i === 3 ? data.infoPreference.length > 0
                : data.easierFirst.length > 0;
              return (
                <div key={q.id} className="flex items-center gap-3">
                  <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                    filled ? "bg-primary/20 text-primary" : "bg-secondary/40 text-muted-foreground/40")}>
                    {filled ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className={cn("text-xs", filled ? "text-foreground" : "text-muted-foreground/50")}>
                    {q.label.slice(0, 30)}…
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-border/20">
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-semibold">{answeredCount}/5</span> signals captured
            </p>
          </div>
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
