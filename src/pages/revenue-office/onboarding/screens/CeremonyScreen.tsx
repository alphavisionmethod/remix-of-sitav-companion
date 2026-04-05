import { motion } from "framer-motion";
import { Crown, ArrowRight, Zap } from "lucide-react";
import { CHAPTERS, type ScreenProps } from "../types";

export default function CeremonyScreen({ state, setState, onNext }: ScreenProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-center py-12 max-w-lg mx-auto">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
          <div className="relative w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
            <Crown className="h-10 w-10 text-primary" />
          </div>
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
            <div key={ch} className="p-2.5 rounded-lg bg-card/50 border border-border/30">
              <span className="text-primary font-semibold">{i + 1}.</span> {ch}
            </div>
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
