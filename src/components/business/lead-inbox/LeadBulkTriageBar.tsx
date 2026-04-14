import { AnimatePresence, motion } from "framer-motion";
import { SitaButton } from "@/components/sita/SitaCard";
import { Check, Ban, ArrowRight, X } from "lucide-react";

interface Props {
  count: number;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onRouteAll: (dest: string) => void;
  onClear: () => void;
}

export const LeadBulkTriageBar = ({ count, onAcceptAll, onRejectAll, onRouteAll, onClear }: Props) => (
  <AnimatePresence>
    {count > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl px-5 py-3 shadow-xl"
      >
        <span className="text-sm font-semibold text-foreground">{count} selected</span>
        <div className="h-5 w-px bg-border" />
        <SitaButton variant="primary" size="sm" onClick={onAcceptAll}>
          <Check className="h-3.5 w-3.5" /> Accept All
        </SitaButton>
        <SitaButton variant="secondary" size="sm" onClick={() => onRouteAll("consult")}>
          <ArrowRight className="h-3.5 w-3.5" /> Route
        </SitaButton>
        <SitaButton variant="ghost" size="sm" onClick={onRejectAll}>
          <Ban className="h-3.5 w-3.5" /> Reject
        </SitaButton>
        <button onClick={onClear} className="text-muted-foreground hover:text-foreground ml-1">
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);
