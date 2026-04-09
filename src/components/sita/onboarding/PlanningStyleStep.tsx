import { motion } from "framer-motion";
import { Layout, ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlanningStyleData {
  viewPreference: string;
  focusPreference: string;
}

const VIEW_OPTIONS = [
  { id: "summaries", label: "Summaries", desc: "Condensed overview cards" },
  { id: "lists", label: "Lists", desc: "Organized task/item lists" },
  { id: "boards", label: "Boards", desc: "Kanban-style columns" },
  { id: "timelines", label: "Timelines", desc: "Chronological view" },
  { id: "mix", label: "Mix of everything", desc: "Adaptive layout" },
];

const FOCUS_OPTIONS = [
  { id: "daily", label: "Daily focus", desc: "What's on today" },
  { id: "weekly", label: "Weekly planning", desc: "Week-at-a-glance" },
  { id: "overview", label: "Overview first", desc: "Big picture then drill down" },
  { id: "action", label: "Action-first", desc: "Show what needs doing now" },
];

interface Props {
  data: PlanningStyleData;
  onUpdate: (data: PlanningStyleData) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const PlanningStyleStep = ({ data, onUpdate, onNext, onPrev }: Props) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    className="w-full max-w-xl mx-auto">
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4">
        <Layout className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Planning Style</span>
      </div>
      <h2 className="text-xl font-semibold text-foreground">How do you think best?</h2>
      <p className="text-sm text-muted-foreground mt-1">SITA will present information your way</p>
    </div>

    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground mb-3">Preferred view style</p>
        <div className="space-y-2">
          {VIEW_OPTIONS.map(v => (
            <button key={v.id} onClick={() => onUpdate({ ...data, viewPreference: v.id })}
              className={cn("w-full rounded-xl border p-3.5 text-left transition-all",
                data.viewPreference === v.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
              <p className="text-sm font-medium text-foreground">{v.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{v.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {data.viewPreference && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs text-muted-foreground mb-3">How should SITA start your day?</p>
          <div className="space-y-2">
            {FOCUS_OPTIONS.map(f => (
              <button key={f.id} onClick={() => onUpdate({ ...data, focusPreference: f.id })}
                className={cn("w-full rounded-xl border p-3.5 text-left transition-all",
                  data.focusPreference === f.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                <p className="text-sm font-medium text-foreground">{f.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Show what this changes (Req #8) */}
      {data.viewPreference && data.focusPreference && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-3 mt-4">
          <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">This changes</p>
          <p className="text-[11px] text-muted-foreground">
            Home screen: <span className="text-foreground capitalize">{data.viewPreference}</span> layout · 
            Start of day: <span className="text-foreground capitalize">{data.focusPreference}</span> view · 
            Task presentation: <span className="text-foreground">{data.viewPreference === "boards" ? "kanban columns" : data.viewPreference === "timelines" ? "timeline view" : "card-based"}</span>
          </p>
        </motion.div>
      )}
    </div>

    <p className="text-[10px] text-muted-foreground text-center mt-4">
      You can refine planning style anytime in Settings.
    </p>

    <div className="flex items-center justify-between mt-4">
      <button onClick={onPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3 w-3" /> Back
      </button>
      <button onClick={onNext} disabled={!data.viewPreference || !data.focusPreference}
        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40">
        Continue <ChevronRight className="inline h-4 w-4 ml-1" />
      </button>
    </div>
  </motion.div>
);
