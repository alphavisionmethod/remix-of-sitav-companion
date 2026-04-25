import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionValuePreviewCardProps {
  connectionName: string;
  capabilities: string[];
  visible: boolean;
}

export function ConnectionValuePreviewCard({ connectionName, capabilities, visible }: ConnectionValuePreviewCardProps) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={reduced ? {} : { opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="rounded-lg border border-trust-safe/20 bg-trust-safe/5 p-3 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3 w-3 text-trust-safe" />
              <span className="text-[10px] font-semibold text-trust-safe">SITA can now</span>
            </div>
            <div className="space-y-1">
              {capabilities.map(c => (
                <div key={c} className="flex items-center gap-2 text-[11px] text-foreground">
                  <Check className="h-2.5 w-2.5 text-trust-safe shrink-0" />
                  {c}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
