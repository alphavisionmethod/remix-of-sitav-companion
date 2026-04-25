// ═══════════════════════════════════════════════════════════════
// SITA OS — Premium Error State
// Never looks like a crash — trust-aware, recovery-focused
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, RefreshCw, RotateCcw, MessageCircle } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function MissionErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full rounded-2xl border border-accent/20 bg-card p-10 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 mx-auto mb-5">
          <Shield className="h-8 w-8 text-accent" />
        </div>

        <h1 className="font-display text-xl font-bold text-foreground mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          This page couldn't load as expected. Your data is safe — no actions were taken.
          If this persists, the diagnostics team can help.
        </p>

        <div className="space-y-2">
          <button onClick={() => navigate("/mission-control")}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Mission Control
          </button>
          <button onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground mt-6">
          If this error is linked to a recent change, check{" "}
          <button onClick={() => navigate("/mission-control")} className="text-primary hover:underline">
            rollback center
          </button>{" "}
          for recovery options.
        </p>
      </motion.div>
    </div>
  );
}
