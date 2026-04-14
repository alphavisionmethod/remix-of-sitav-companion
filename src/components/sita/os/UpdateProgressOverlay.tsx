// ═══════════════════════════════════════════════════════════════
// SITA OS — Update Progress Overlay
// Cinematic full-screen overlay during active update operations
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Loader2, AlertTriangle, RotateCcw, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { UpdateState, HealthCheckResult, DownloadProgress } from "@/lib/services/update-daemon";

interface Props {
  visible: boolean;
  state: UpdateState;
  downloadProgress: DownloadProgress | null;
  healthResults: HealthCheckResult[];
  error: string | null;
  onDismiss: () => void;
}

const stateMessages: Partial<Record<UpdateState, { title: string; subtitle: string }>> = {
  downloading: { title: "Downloading Update", subtitle: "Fetching verified payload…" },
  download_verified: { title: "Download Verified", subtitle: "Package integrity confirmed" },
  staging: { title: "Staging Update", subtitle: "Writing to inactive slot…" },
  staged: { title: "Update Staged", subtitle: "Ready to reboot" },
  awaiting_reboot: { title: "Awaiting Reboot", subtitle: "System will restart to apply update" },
  boot_validation: { title: "Validating Boot", subtitle: "Checking system health…" },
  health_validation: { title: "Health Validation", subtitle: "Verifying all services…" },
  succeeded: { title: "Update Complete", subtitle: "System is running the new version" },
  failed: { title: "Update Failed", subtitle: "An error occurred during the update" },
  rolled_back: { title: "System Restored", subtitle: "Previous version has been restored" },
};

const formatBytes = (b: number) => {
  if (b >= 1_000_000_000) return `${(b / 1_000_000_000).toFixed(1)} GB`;
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(0)} MB`;
  return `${(b / 1_000).toFixed(0)} KB`;
};

const healthStatusIcon = (s: string) => {
  if (s === "pass") return <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />;
  if (s === "fail") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
  if (s === "running") return <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />;
  return <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30" />;
};

export function UpdateProgressOverlay({ visible, state, downloadProgress, healthResults, error, onDismiss }: Props) {
  const msg = stateMessages[state] || { title: "Processing…", subtitle: "" };
  const isTerminal = ["succeeded", "failed", "rolled_back"].includes(state);
  const isRollback = state === "rolled_back";
  const isSuccess = state === "succeeded";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg mx-4 space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-3">
              <motion.div
                animate={!isTerminal ? { rotate: 360 } : {}}
                transition={!isTerminal ? { repeat: Infinity, duration: 3, ease: "linear" } : {}}
                className="inline-block"
              >
                {isRollback ? (
                  <div className="h-16 w-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto">
                    <RotateCcw className="h-8 w-8 text-accent" />
                  </div>
                ) : isSuccess ? (
                  <div className="h-16 w-16 rounded-2xl bg-[hsl(var(--trust-safe))]/15 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-[hsl(var(--trust-safe))]" />
                  </div>
                ) : state === "failed" ? (
                  <div className="h-16 w-16 rounded-2xl bg-destructive/15 flex items-center justify-center mx-auto">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                )}
              </motion.div>
              <h2 className="text-xl font-display font-bold text-foreground">{msg.title}</h2>
              <p className="text-sm text-muted-foreground">{msg.subtitle}</p>
            </div>

            {/* Download Progress */}
            {downloadProgress && state === "downloading" && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatBytes(downloadProgress.bytesDownloaded)} / {formatBytes(downloadProgress.bytesTotal)}</span>
                  <span>{formatBytes(downloadProgress.speedBps)}/s · {downloadProgress.eta}s left</span>
                </div>
                <Progress value={downloadProgress.percent} className="h-2" />
                <p className="text-center text-sm font-mono font-bold text-primary">{downloadProgress.percent}%</p>
              </div>
            )}

            {/* Health Checks */}
            {healthResults.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-2 max-h-64 overflow-y-auto">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Health Validation</p>
                {healthResults.map((r, i) => (
                  <motion.div
                    key={r.component}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2.5">
                      {healthStatusIcon(r.status)}
                      <span className="text-sm text-foreground font-mono">{r.component}</span>
                    </div>
                    <span className={cn(
                      "text-xs",
                      r.status === "pass" ? "text-[hsl(var(--trust-safe))]" : r.status === "fail" ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {r.details}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Rollback Triggered</p>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Dismiss */}
            {isTerminal && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onDismiss}
                className="w-full rounded-xl bg-primary/10 text-primary font-medium py-3 text-sm hover:bg-primary/20 transition-colors"
              >
                {isSuccess ? "Continue to Desktop" : isRollback ? "View Rollback Details" : "View Error Details"}
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
