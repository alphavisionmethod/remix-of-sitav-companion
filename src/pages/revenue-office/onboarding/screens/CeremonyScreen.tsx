import { motion } from "framer-motion";
import { Crown, ArrowRight, Zap, BarChart3, Target, Brain, Search, FileText, Phone, TrendingUp } from "lucide-react";
import { CHAPTERS, type ScreenProps } from "../types";

const floatingNodes = [
  { icon: BarChart3, label: "Boardroom", x: -80, y: -60, delay: 1.2 },
  { icon: Target, label: "Journey", x: 80, y: -40, delay: 1.4 },
  { icon: Brain, label: "Advisors", x: -70, y: 50, delay: 1.6 },
  { icon: Search, label: "Leaks", x: 90, y: 60, delay: 1.8 },
  { icon: FileText, label: "Quotes", x: -40, y: -90, delay: 2.0 },
  { icon: Phone, label: "Calls", x: 50, y: 90, delay: 2.2 },
  { icon: TrendingUp, label: "Growth", x: 0, y: -100, delay: 2.4 },
];

export default function CeremonyScreen({ state, setState, onNext }: ScreenProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-center py-12 max-w-lg mx-auto">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
          <div className="relative w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center z-10">
            <Crown className="h-10 w-10 text-primary" />
          </div>
          {floatingNodes.map((node, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: [0, 0.7, 0.5], scale: [0, 1, 0.9], x: node.x, y: node.y }}
              transition={{ delay: node.delay, duration: 1.2, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5"
            >
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/15">
                <node.icon className="h-3 w-3 text-primary/60" />
              </div>
              <span className="text-[7px] text-muted-foreground/50">{node.label}</span>
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: node.delay + 0.3, duration: 0.8 }}
                className="absolute w-px h-8 bg-gradient-to-t from-primary/20 to-transparent"
                style={{ top: node.y > 0 ? "-2rem" : "auto", bottom: node.y <= 0 ? "-2rem" : "auto" }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">Business Formation Ceremony</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          SITA will learn how your business actually grows, sells, delivers, and retains — then build Revenue Office around that reality.
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          By the end, your Revenue Office will be fully personalized: advisors activated, automations calibrated, leaks identified, and your first win ready.
        </p>
      </motion.div>
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="space-y-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-[10px] text-muted-foreground mb-6">
          {CHAPTERS.map((ch, i) => (
            <motion.div
              key={ch}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + i * 0.08 }}
              className="p-2.5 rounded-lg bg-card/50 border border-border/30"
            >
              <span className="text-primary font-semibold">{i + 1}.</span> {ch}
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => { setState(p => ({ ...p, setupDepth: "deep" })); onNext(); }}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            Deeper Setup <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => { setState(p => ({ ...p, setupDepth: "quick" })); onNext(); }}
            className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors">
            <Zap className="h-4 w-4" /> Faster Setup
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground">Deeper takes ~12 min, Faster ~5 min</p>
      </motion.div>
    </motion.div>
  );
}
