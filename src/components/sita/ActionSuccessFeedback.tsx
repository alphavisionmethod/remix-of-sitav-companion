// ═══════════════════════════════════════════════════════════════
// SITA OS — Action Success Feedback
// Provides optimistic UI feedback with trust receipts
// ═══════════════════════════════════════════════════════════════

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, LucideIcon } from "lucide-react";
import { useState, useCallback } from "react";
import { useOptimisticMutation, type MutationStatus } from "@/hooks/use-optimistic-mutation";

export interface SuccessFeedback {
  id: string;
  icon?: LucideIcon;
  message: string;
  detail?: string;
}

export function useActionFeedback() {
  const [feedbacks, setFeedbacks] = useState<SuccessFeedback[]>([]);

  const showSuccess = useCallback((message: string, detail?: string, icon?: LucideIcon) => {
    const id = crypto.randomUUID();
    setFeedbacks((prev) => [...prev, { id, icon, message, detail }]);
    setTimeout(() => setFeedbacks((prev) => prev.filter((f) => f.id !== id)), 3000);
    return id;
  }, []);

  return { feedbacks, showSuccess };
}

export function ActionFeedbackStack({ feedbacks }: { feedbacks: SuccessFeedback[] }) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-xs">
      <AnimatePresence>
        {feedbacks.map((fb) => {
          const Icon = fb.icon ?? CheckCircle;
          return (
            <motion.div
              key={fb.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="flex items-start gap-2.5 rounded-xl border border-trust-safe/20 bg-trust-safe/5 px-4 py-3 shadow-lg"
            >
              <Icon className="h-4 w-4 text-trust-safe mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{fb.message}</p>
                {fb.detail && <p className="text-[11px] text-muted-foreground mt-0.5">{fb.detail}</p>}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Re-export optimistic mutation for co-located patterns
export { useOptimisticMutation, type MutationStatus } from "@/hooks/use-optimistic-mutation";
