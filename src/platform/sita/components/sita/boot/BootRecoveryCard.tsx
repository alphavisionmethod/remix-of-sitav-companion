// ═══════════════════════════════════════════════════════════════
// SITA OS — Boot Recovery Card
// Calm, premium failure/degraded-mode display
// Never alarming — explains clearly, offers actions
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown, RefreshCw, ArrowRight, AlertTriangle } from "lucide-react";
import logo from "@/assets/logo.webp";

export type BootIssueKind =
  | "storage"
  | "secure-boot"
  | "recovery-assets"
  | "integrity"
  | "unsupported-config"
  | "insufficient-storage"
  | "generic";

interface BootRecoveryCardProps {
  issueKind: BootIssueKind;
  technicalDetail?: string;
  statusCode?: string;
  onRetry: () => void;
  onContinueDegraded: () => void;
}

const ISSUE_COPY: Record<BootIssueKind, { title: string; body: string }> = {
  storage: {
    title: "Storage needs attention",
    body: "This device couldn't verify storage readiness. Your data may need a different storage path.",
  },
  "secure-boot": {
    title: "Security check incomplete",
    body: "This device couldn't finish one of its security checks. You can try again or continue with reduced protection.",
  },
  "recovery-assets": {
    title: "Recovery setup incomplete",
    body: "Some recovery resources aren't available yet. Setup can continue, but recovery options may be limited.",
  },
  integrity: {
    title: "System verification paused",
    body: "We couldn't verify part of this environment. This may resolve on retry.",
  },
  "unsupported-config": {
    title: "Configuration not fully supported",
    body: "This device supports a basic protection model, but some hardware-backed security features aren't available.",
  },
  "insufficient-storage": {
    title: "Limited storage available",
    body: "There may not be enough space to complete full setup. You can continue with essential features.",
  },
  generic: {
    title: "We need to resolve something before continuing",
    body: "This device couldn't complete one of its startup checks. You can try again now or review options.",
  },
};

export function BootRecoveryCard({
  issueKind,
  technicalDetail,
  statusCode,
  onRetry,
  onContinueDegraded,
}: BootRecoveryCardProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  const copy = ISSUE_COPY[issueKind] || ISSUE_COPY.generic;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center select-none"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      {/* Ambient glow — subdued */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 70%)",
        }}
      />

      {/* Mark */}
      <motion.img
        src={logo}
        alt="SITA"
        className="h-16 w-16 rounded-xl mb-8 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 0.6 }}
      />

      {/* Problem card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 w-full max-w-sm rounded-2xl border p-6"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Icon */}
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <AlertTriangle className="h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.5)" }} />
          </div>
          <h2
            className="text-[14px] font-medium"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {copy.title}
          </h2>
        </div>

        <p
          className="text-[12px] leading-relaxed mb-5"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {copy.body}
        </p>

        {/* Actions */}
        <div className="flex gap-2.5 mb-4">
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="flex-1 border-border/30 bg-transparent text-foreground/80 hover:bg-white/5 text-[12px] gap-1.5"
          >
            <RefreshCw className="h-3 w-3" />
            Try again
          </Button>
          <Button
            onClick={onContinueDegraded}
            variant="outline"
            size="sm"
            className="flex-1 border-border/30 bg-transparent text-foreground/80 hover:bg-white/5 text-[12px] gap-1.5"
          >
            <ArrowRight className="h-3 w-3" />
            Continue
          </Button>
        </div>

        {/* Technical disclosure */}
        {(technicalDetail || statusCode) && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} className="pt-3">
            <button
              onClick={() => setShowTechnical(o => !o)}
              className="flex items-center gap-1.5 text-[10px] tracking-wide transition-colors"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              <span>View technical details</span>
              <motion.span animate={{ rotate: showTechnical ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-2.5 w-2.5" />
              </motion.span>
            </button>

            <AnimatePresence>
              {showTechnical && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-1">
                    {statusCode && (
                      <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                        Status: {statusCode}
                      </p>
                    )}
                    {technicalDetail && (
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                        {technicalDetail}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
