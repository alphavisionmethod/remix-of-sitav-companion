import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

export function Toggle({ label, desc, icon: Icon, selected, onToggle, badge }: {
  label: string; desc?: string; icon: any; selected: boolean; onToggle: () => void; badge?: string;
}) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onToggle}
      className={`p-4 rounded-xl border text-left transition-all ${selected
        ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20 shadow-sm shadow-primary/5"
        : "bg-card/50 border-border/50 hover:border-primary/20 hover:bg-card/80"}`}>
      <DemoModeBadge />
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg transition-colors ${selected ? "bg-primary/20" : "bg-muted"}`}>
          <Icon className={`h-4 w-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${selected ? "text-foreground" : "text-foreground/80"}`}>{label}</p>
          {desc && <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {badge && <Badge className="bg-emerald-500/10 text-emerald-400 text-[9px]">{badge}</Badge>}
          {selected && <Check className="h-4 w-4 text-primary" />}
        </div>
      </div>
    </motion.button>
  );
}

export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  const { isDemoMode } = useDataMode();
  return (
    <div className="mb-3">
      <p className="text-sm font-semibold text-foreground">{children}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

export function ChapterBanner({ chapter, subtitle }: { chapter: string; subtitle: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
      <Badge className="bg-primary/10 text-primary text-[10px] mb-2">{chapter}</Badge>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}

export function ScreenHeader({ icon: Icon, title, subtitle, color = "text-primary" }: {
  icon: any; title: string; subtitle: string; color?: string;
}) {
  return (
    <div className="text-center mb-6">
      <Icon className={`h-7 w-7 ${color} mx-auto mb-2`} />
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

export function SingleSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={`w-full p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
            value === o.id ? "bg-primary/10 border-primary/40 text-foreground" : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/20"
          }`}>{o.label}</button>
      ))}
    </div>
  );
}
