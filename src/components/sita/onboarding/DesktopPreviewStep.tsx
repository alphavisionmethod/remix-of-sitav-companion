import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, BarChart3, Shield, Brain, Clock, Zap, FileText, Target, Layout } from "lucide-react";

const hotspots = [
  { icon: BarChart3, label: "Top Bar", desc: "This is where priorities appear", x: "50%", y: "5%" },
  { icon: Target, label: "Mission Control", desc: "Your command layer for active workflows", x: "15%", y: "30%" },
  { icon: Brain, label: "Advisors", desc: "Your AI advisors live here", x: "85%", y: "25%" },
  { icon: Clock, label: "Timeline", desc: "Everything that happened and what's next", x: "15%", y: "55%" },
  { icon: Shield, label: "Proof Center", desc: "This is your proof trail", x: "85%", y: "55%" },
  { icon: Zap, label: "Quick Actions", desc: "Fast access to frequent actions", x: "50%", y: "90%" },
  { icon: FileText, label: "Boardroom", desc: "This is your boardroom", x: "30%", y: "75%" },
  { icon: Layout, label: "Dock", desc: "Your OS surface switcher", x: "50%", y: "95%" },
];

interface DesktopPreviewStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export function DesktopPreviewStep({ onNext, onPrev }: DesktopPreviewStepProps) {
  const [active, setActive] = useState(0);
  const [autoTour, setAutoTour] = useState(true);

  useEffect(() => {
    if (!autoTour) return;
    const timer = setInterval(() => {
      setActive(prev => {
        if (prev >= hotspots.length - 1) { setAutoTour(false); return prev; }
        return prev + 1;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [autoTour]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">Your SITA desktop</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">A preview of your operating environment</p>
      </div>

      {/* Desktop mockup */}
      <div className="relative aspect-[16/10] rounded-2xl border border-border bg-card overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3" />

        {/* Hotspots */}
        {hotspots.map((h, i) => (
          <button
            key={h.label}
            onClick={() => { setActive(i); setAutoTour(false); }}
            style={{ left: h.x, top: h.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <motion.div
              animate={i === active ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 1.5, repeat: i === active ? Infinity : 0 }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                i === active
                  ? "bg-primary shadow-lg shadow-primary/30 scale-110"
                  : "bg-secondary/80 hover:bg-secondary"
              }`}
            >
              <h.icon className={`h-4 w-4 ${i === active ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </motion.div>
          </button>
        ))}

        {/* Active label */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-card border border-border px-4 py-2.5 shadow-lg text-center"
        >
          <p className="text-xs font-bold text-foreground">{hotspots[active].label}</p>
          <p className="text-[11px] text-muted-foreground">{hotspots[active].desc}</p>
        </motion.div>
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
