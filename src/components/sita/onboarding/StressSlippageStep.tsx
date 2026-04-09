import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StressMapData {
  heavierThanShould: string[];
  affectedFirst: string[];
}

const HEAVIER_OPTIONS = [
  { id: "too-much-to-track", label: "Too much to track" },
  { id: "too-many-decisions", label: "Too many decisions" },
  { id: "too-many-messages", label: "Too many messages" },
  { id: "too-many-moving-parts", label: "Too many moving parts" },
  { id: "not-enough-structure", label: "Not enough structure" },
  { id: "things-slipping", label: "Things slipping through" },
  { id: "reactive", label: "Reactive instead of ahead" },
];

const AFFECTED_OPTIONS = [
  { id: "scheduling", label: "Scheduling" },
  { id: "communication", label: "Communication" },
  { id: "money", label: "Money" },
  { id: "tasks", label: "Tasks" },
  { id: "follow-up", label: "Follow-up" },
  { id: "household", label: "Household" },
  { id: "routines", label: "Routines" },
];

interface Props {
  data: StressMapData;
  onUpdate: (data: StressMapData) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StressSlippageStep = ({ data, onUpdate, onNext, onPrev }: Props) => {
  const toggle = (key: "heavierThanShould" | "affectedFirst", val: string) => {
    const arr = data[key];
    onUpdate({ ...data, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] });
  };

  const showAffected = data.heavierThanShould.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 mb-4">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-[10px] font-semibold text-destructive uppercase tracking-wider">Stress Mapping</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Where does support matter most?</h2>
        <p className="text-sm text-muted-foreground mt-1">SITA will prioritize help where life feels heaviest</p>
        <p className="text-[10px] text-muted-foreground/60 mt-2 italic">
          This is private — skip if you prefer. You can revisit anytime.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs text-muted-foreground mb-3">What feels heavier than it should?</p>
          <div className="grid grid-cols-2 gap-2">
            {HEAVIER_OPTIONS.map(o => {
              const sel = data.heavierThanShould.includes(o.id);
              return (
                <button key={o.id} onClick={() => toggle("heavierThanShould", o.id)}
                  className={cn("rounded-xl border p-3 text-left transition-all text-sm",
                    sel ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground")}>
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        {showAffected && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <p className="text-xs text-muted-foreground mb-3">What gets affected first?</p>
            <div className="grid grid-cols-2 gap-2">
              {AFFECTED_OPTIONS.map(o => {
                const sel = data.affectedFirst.includes(o.id);
                return (
                  <button key={o.id} onClick={() => toggle("affectedFirst", o.id)}
                    className={cn("rounded-xl border p-3 text-left transition-all text-sm",
                      sel ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground")}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Live support-load visualization */}
        {data.heavierThanShould.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-3">Support Load Map</p>
            <div className="space-y-2">
              {data.heavierThanShould.map(id => {
                const label = HEAVIER_OPTIONS.find(o => o.id === id)?.label || id;
                const affected = data.affectedFirst.length;
                const intensity = Math.min(30 + affected * 10, 90);
                return (
                  <div key={id} className="flex items-center gap-3">
                    <span className="text-[11px] text-foreground w-36 truncate">{label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${intensity}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-primary/60" />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Recovery/forgiveness UX (Req #6) — compassionate transition when overwhelmed */}
        {data.heavierThanShould.length >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5 p-4"
          >
            <p className="text-xs text-foreground font-medium mb-1">
              That's a lot to carry — SITA sees that
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              You're managing more than most. SITA will adopt a gentler, more restorative approach —
              focusing on what matters most, keeping noise low, and helping you regain ground step by step.
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6">
        <button onClick={onPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
        <button onClick={onNext} disabled={data.heavierThanShould.length === 0}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40">
          Continue <ChevronRight className="inline h-4 w-4 ml-1" />
        </button>
      </div>
    </motion.div>
  );
};
