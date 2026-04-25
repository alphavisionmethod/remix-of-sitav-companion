import { motion } from "framer-motion";
import { Eye, BarChart3, Shield, ChevronRight } from "lucide-react";
import { useMemo } from "react";

interface FirstActionsStepProps {
  enabledDomains: string[];
  protectionPriorities: string[];
  onNext: () => void;
  onPrev: () => void;
}

export function FirstActionsStep({ enabledDomains, protectionPriorities, onNext, onPrev }: FirstActionsStepProps) {
  const actions = useMemo(() => {
    const items = [
      { icon: Eye, title: "Surface things likely to slip", desc: "SITA will scan for overdue items, silent clients, and forgotten tasks." },
    ];

    if (enabledDomains.includes("business") || enabledDomains.includes("money")) {
      items.push({ icon: BarChart3, title: "Prepare your first weekly review", desc: "A boardroom-ready summary of your week will be ready by Friday." });
    } else {
      items.push({ icon: BarChart3, title: "Set up your first daily pulse", desc: "Tomorrow morning, SITA will have your priorities ready." });
    }

    if (protectionPriorities.length > 0) {
      const area = protectionPriorities[0].replace(/-/g, " ");
      items.push({ icon: Shield, title: `Watch for ${area}`, desc: `Your selected priority area is now actively monitored.` });
    } else {
      items.push({ icon: Shield, title: "Activate your trust layer", desc: "Every action SITA takes will be logged with proof." });
    }

    return items;
  }, [enabledDomains, protectionPriorities]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">First 3 things SITA will do</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Here's what happens the moment you enter.</p>
      </div>

      <div className="space-y-3">
        {actions.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <a.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
              </div>
            </div>
          </motion.div>
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
