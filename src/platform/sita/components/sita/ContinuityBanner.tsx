// ═══════════════════════════════════════════════════════════════
// SITA OS — Continuity Banner
// Shows when an unconsumed handoff packet exists for the current user
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHandoffService, type PersistedHandoff } from "@/lib/core-services/handoff";
import { useAuth } from "@/contexts/AuthContext";

export function ContinuityBanner() {
  const { user } = useAuth();
  const [handoff, setHandoff] = useState<PersistedHandoff | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkHandoffs = async () => {
      try {
        const service = getHandoffService();
        const pending = await service.getPendingHandoffs(user.id);
        if (pending.length > 0) {
          setHandoff(pending[0]);
        }
      } catch {
        // Not critical — don't crash
      }
    };

    checkHandoffs();
  }, [user]);

  const handleAccept = async () => {
    if (!handoff) return;
    const service = getHandoffService();
    await service.acceptHandoff(handoff.id);
    setHandoff(null);
  };

  const handleDismiss = async () => {
    if (!handoff) return;
    const service = getHandoffService();
    await service.dismissHandoff(handoff.id);
    setDismissed(true);
    setHandoff(null);
  };

  if (!handoff || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="border-b border-border bg-primary/5"
      >
        <div className="flex items-center gap-3 px-4 py-2 max-w-screen-xl mx-auto">
          <ArrowRightLeft className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm text-foreground flex-1">
            Continue where you left off — <span className="font-medium">{handoff.domain}</span> context from {handoff.from_surface}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" variant="ghost" onClick={handleAccept} className="h-7 text-xs gap-1">
              <Check className="h-3 w-3" /> Resume
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-7 w-7 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
