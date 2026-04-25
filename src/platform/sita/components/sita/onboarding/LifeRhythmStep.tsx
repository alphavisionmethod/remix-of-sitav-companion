import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, Sun, Moon, AlertTriangle, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LifeRhythmData {
  weekStructure: string;
  overloadMoments: string[];
  planningHorizon: string;
  planningSupport: string[];
}

const WEEK_TYPES = [
  { id: "structured", label: "Structured", desc: "Predictable routine, clear blocks" },
  { id: "variable", label: "Variable", desc: "Changes week to week" },
  { id: "chaotic", label: "Chaotic", desc: "Rarely goes as planned" },
  { id: "mixed", label: "Mixed", desc: "Some structure, some surprises" },
];

const OVERLOAD_MOMENTS = [
  { id: "mornings", label: "Mornings", icon: Sun },
  { id: "midweek", label: "Midweek crunch", icon: Calendar },
  { id: "sundays", label: "Sunday dread", icon: Moon },
  { id: "month-end", label: "End of month", icon: Clock },
  { id: "random", label: "Random spikes", icon: AlertTriangle },
];

const PLANNING_HORIZONS = [
  { id: "today", label: "Today", desc: "One day at a time" },
  { id: "this-week", label: "This week", desc: "Weekly planning" },
  { id: "this-month", label: "This month", desc: "Monthly outlook" },
  { id: "longer", label: "Longer-term", desc: "Quarterly or beyond" },
];

const PLANNING_SUPPORT = [
  { id: "daily-structure", label: "Daily structure" },
  { id: "weekly-planning", label: "Weekly planning" },
  { id: "commitments", label: "Staying on top of commitments" },
  { id: "recovering", label: "Recovering what slips" },
];

interface Props {
  data: LifeRhythmData;
  onUpdate: (data: LifeRhythmData) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const LifeRhythmStep = ({ data, onUpdate, onNext, onPrev }: Props) => {
  const [step, setStep] = useState(0);

  const toggle = (key: "overloadMoments" | "planningSupport", val: string) => {
    const arr = data[key];
    onUpdate({ ...data, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Life Rhythm</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">How does your week flow?</h2>
        <p className="text-sm text-muted-foreground mt-1">SITA will adapt to your natural rhythm</p>
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-3">What does a normal week feel like?</p>
          {WEEK_TYPES.map(w => (
            <button key={w.id} onClick={() => { onUpdate({ ...data, weekStructure: w.id }); setStep(1); }}
              className={cn("w-full rounded-xl border p-4 text-left transition-all",
                data.weekStructure === w.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
              <p className="text-sm font-medium text-foreground">{w.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{w.desc}</p>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-3">When does overload hit? <span className="text-muted-foreground/50">(select all that apply)</span></p>
          {OVERLOAD_MOMENTS.map(m => {
            const Icon = m.icon;
            const sel = data.overloadMoments.includes(m.id);
            return (
              <button key={m.id} onClick={() => toggle("overloadMoments", m.id)}
                className={cn("w-full flex items-center gap-3 rounded-xl border p-3.5 transition-all",
                  sel ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                <Icon className={cn("h-4 w-4", sel ? "text-primary" : "text-muted-foreground")} />
                <span className="text-sm text-foreground">{m.label}</span>
              </button>
            );
          })}
          <button onClick={() => setStep(2)} className="w-full mt-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-3">How far ahead do you usually think?</p>
          {PLANNING_HORIZONS.map(h => (
            <button key={h.id} onClick={() => { onUpdate({ ...data, planningHorizon: h.id }); setStep(3); }}
              className={cn("w-full rounded-xl border p-4 text-left transition-all",
                data.planningHorizon === h.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
              <p className="text-sm font-medium text-foreground">{h.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{h.desc}</p>
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-3">What kind of planning help would you like?</p>
          {PLANNING_SUPPORT.map(s => {
            const sel = data.planningSupport.includes(s.id);
            return (
              <button key={s.id} onClick={() => toggle("planningSupport", s.id)}
                className={cn("w-full rounded-xl border p-3.5 text-left transition-all",
                  sel ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                <span className="text-sm text-foreground">{s.label}</span>
              </button>
            );
          })}
          <button onClick={onNext} disabled={data.planningSupport.length === 0}
            className="w-full mt-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40">
            Continue <ChevronRight className="inline h-4 w-4 ml-1" />
          </button>

          {/* Show what this changes (Req #8) */}
          {data.planningSupport.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-2xl border border-primary/20 bg-primary/5 p-3 mt-3">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">This changes</p>
              <p className="text-[11px] text-muted-foreground">
                Boardroom density: <span className="text-foreground">{data.weekStructure === "chaotic" ? "flexible" : "structured"}</span> · 
                Daily summary: <span className="text-foreground">{data.planningHorizon === "today" ? "morning-focused" : "horizon-aware"}</span> · 
                Notifications: <span className="text-foreground">{data.overloadMoments.length > 2 ? "quieter during peak times" : "standard timing"}</span>
              </p>
            </motion.div>
          )}
        </div>
      )}

      <button onClick={step > 0 ? () => setStep(s => s - 1) : onPrev}
        className="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto">
        <ArrowLeft className="h-3 w-3" /> Back
      </button>
    </motion.div>
  );
};
