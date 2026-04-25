import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useState } from "react";

/* ── Chapter color palette ── */
export const CHAPTER_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  "🔷 Formation":  { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/30", glow: "shadow-violet-500/20" },
  "⚙️ Engine":     { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", glow: "shadow-emerald-500/20" },
  "📦 Delivery":   { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/30",    glow: "shadow-blue-500/20" },
  "🏗️ Operations": { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/30",   glow: "shadow-amber-500/20" },
  "📥 Import":     { bg: "bg-cyan-500/10",    text: "text-cyan-400",    border: "border-cyan-500/30",    glow: "shadow-cyan-500/20" },
  "🤝 Trust":      { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/30",    glow: "shadow-rose-500/20" },
  "🚀 Launch":     { bg: "bg-yellow-500/10",  text: "text-yellow-400",  border: "border-yellow-500/30",  glow: "shadow-yellow-500/20" },
};
const defaultColor = { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30", glow: "shadow-primary/20" };
export function chapterColor(chapter?: string) { return (chapter && CHAPTER_COLORS[chapter]) || defaultColor; }

/* ── Toggle ── */
export function Toggle({ label, desc, icon: Icon, selected, onToggle, badge }: {
  label: string; desc?: string; icon: any; selected: boolean; onToggle: () => void; badge?: string;
}) {
  const [justSelected, setJustSelected] = useState(false);
  const handleClick = () => {
    if (!selected) { setJustSelected(true); setTimeout(() => setJustSelected(false), 500); }
    onToggle();
  };
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={handleClick}
      className={`relative p-4 rounded-xl border text-left transition-all overflow-hidden ${selected
        ? "bg-primary/10 border-l-[3px] border-l-primary border-t-primary/30 border-r-primary/30 border-b-primary/30 ring-1 ring-primary/20 shadow-lg shadow-primary/10"
        : "bg-card/50 border-border/50 hover:border-primary/20 hover:bg-card/80"}`}>
      {/* Selection burst */}
      <AnimatePresence>
        {justSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-primary/20 pointer-events-none"
          />
        )}
      </AnimatePresence>
      <div className="flex items-start gap-3 relative z-10">
        <div className={`p-2 rounded-lg transition-colors ${selected ? "bg-gradient-to-br from-primary/30 to-violet-500/20" : "bg-muted"}`}>
          <Icon className={`h-4 w-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${selected ? "text-foreground" : "text-foreground/80"}`}>{label}</p>
          {desc && <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {badge && <Badge className="bg-emerald-500/10 text-emerald-400 text-[9px]">{badge}</Badge>}
          {selected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-primary-foreground" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

/* ── SectionTitle ── */
export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <p className="text-sm font-semibold text-foreground">{children}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

/* ── ChapterBanner ── */
export function ChapterBanner({ chapter, subtitle }: { chapter: string; subtitle: string }) {
  const c = chapterColor(chapter);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
      <Badge className={`${c.bg} ${c.text} text-[10px] mb-2 ${c.glow} shadow-md`}>{chapter}</Badge>
      <div className={`mx-auto mt-1 h-0.5 w-16 rounded-full bg-gradient-to-r from-transparent via-current to-transparent ${c.text} opacity-30`} />
      <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
    </motion.div>
  );
}

/* ── ScreenHeader ── */
export function ScreenHeader({ icon: Icon, title, subtitle, color = "text-primary" }: {
  icon: any; title: string; subtitle: string; color?: string;
}) {
  return (
    <div className="text-center mb-6 relative">
      <div className="relative mx-auto w-14 h-14 mb-3">
        <div className="absolute inset-0 rounded-xl bg-primary/10 blur-xl animate-pulse" />
        <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/10 border border-primary/20 flex items-center justify-center">
          <Icon className={`h-7 w-7 ${color}`} />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary"
        />
      </div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

/* ── SingleSelect ── */
export function SingleSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      {options.map(o => (
        <motion.button key={o.id} whileTap={{ scale: 0.98 }} onClick={() => onChange(o.id)}
          className={`w-full p-2.5 rounded-xl border text-xs font-medium transition-all text-left flex items-center gap-2 ${
            value === o.id
              ? "bg-primary/10 border-l-[3px] border-l-primary border-t-primary/30 border-r-primary/30 border-b-primary/30 text-foreground shadow-sm shadow-primary/10"
              : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/20"
          }`}>
          <div className={`w-2 h-2 rounded-full transition-colors ${value === o.id ? "bg-primary" : "bg-muted-foreground/20"}`} />
          {o.label}
        </motion.button>
      ))}
    </div>
  );
}
