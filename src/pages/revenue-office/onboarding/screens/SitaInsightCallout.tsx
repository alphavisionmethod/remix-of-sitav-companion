import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

interface SitaInsightCalloutProps {
  show: boolean;
  message: string;
  type?: "detected" | "recommendation" | "confirmation";
  icon?: React.ReactNode;
}

const typeStyles = {
  detected: "bg-primary/5 border-primary/20",
  recommendation: "bg-emerald-500/5 border-emerald-500/20",
  confirmation: "bg-blue-500/5 border-blue-500/20",
};

const typeIconColors = {
  detected: "text-primary",
  recommendation: "text-emerald-400",
  confirmation: "text-blue-400",
};

export default function SitaInsightCallout({ show, message, type = "detected", icon }: SitaInsightCalloutProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -8 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`rounded-xl border p-3.5 flex items-start gap-3 ${typeStyles[type]}`}
        >
          <div className={`p-1.5 rounded-lg bg-background/50 ${typeIconColors[type]}`}>
            {icon || (type === "recommendation" ? <Sparkles className="h-3.5 w-3.5" /> : <Brain className="h-3.5 w-3.5" />)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground mb-0.5 uppercase tracking-wider">
              {type === "detected" ? "SITA noticed" : type === "recommendation" ? "SITA recommends" : "SITA is checking"}
            </p>
            <p className="text-xs text-foreground leading-relaxed">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
