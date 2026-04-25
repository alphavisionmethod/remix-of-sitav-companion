import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface RecoveryStateCardProps {
  title?: string;
  subtitle?: string;
  onResume: () => void;
  onRestart: () => void;
}

export function RecoveryStateCard({ title = "Welcome back", subtitle = "Continue where you left off?", onResume, onRestart }: RecoveryStateCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl px-6 py-4 shadow-2xl shadow-primary/10">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
        <RotateCcw className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex gap-2 ml-4">
        <button onClick={onRestart} className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          Start Over
        </button>
        <button onClick={onResume} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Continue
        </button>
      </div>
    </motion.div>
  );
}
