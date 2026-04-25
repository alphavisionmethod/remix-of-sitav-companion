import { motion } from "framer-motion";
import { LayoutDashboard, Briefcase, Home, DollarSign, Layers, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const compositions = [
  { key: "calm", icon: LayoutDashboard, title: "Calm dashboard", desc: "Minimal, peaceful. Only what needs attention." },
  { key: "business", icon: Briefcase, title: "Business-first", desc: "Leads, revenue, client activity front and center." },
  { key: "family", icon: Home, title: "Family-first", desc: "Household, calendar, coordination prominently displayed." },
  { key: "money", icon: DollarSign, title: "Money-first", desc: "Cash position, bills, subscriptions, and budgets." },
  { key: "command", icon: Layers, title: "Full command center", desc: "Everything visible. For power users who want density." },
];

interface HomeCompositionStepProps {
  selected: string;
  onSelect: (key: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function HomeCompositionStep({ selected, onSelect, onNext, onPrev }: HomeCompositionStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">Default Home composition</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">What should your first Home screen emphasize?</p>
      </div>

      <div className="space-y-3">
        {compositions.map(c => (
          <button key={c.key} onClick={() => onSelect(c.key)}
            className={cn("w-full rounded-xl border p-4 text-left transition-all duration-200",
              selected === c.key ? "border-primary/50 bg-primary/8" : "border-border bg-card hover:border-primary/20")}>
            <div className="flex items-start gap-3">
              <div className={cn("rounded-lg p-2", selected === c.key ? "bg-primary/15" : "bg-secondary")}>
                <c.icon className={cn("h-4 w-4", selected === c.key ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{c.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
              </div>
              {selected === c.key && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </motion.div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
        <button onClick={onNext}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2">
          Continue <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
