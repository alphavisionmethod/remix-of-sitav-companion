// ═══════════════════════════════════════════════════════════════
// SITA OS — Wired Update Banner
// Connected to UpdateDaemon — replaces static UpdateBanner
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { Download, X, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { updateDaemon } from "@/lib/services/update-daemon";
import { useNavigate } from "react-router-dom";

export const UpdateBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [catalog, setCatalog] = useState(updateDaemon.getState().catalog);

  useEffect(() => {
    // Initial check
    updateDaemon.checkForUpdates().catch(() => {});

    const unsub = updateDaemon.subscribe(() => {
      setCatalog([...updateDaemon.getState().catalog]);
    });

    const interval = setInterval(() => {
      updateDaemon.checkForUpdates().catch(() => {});
    }, 3600000);

    return () => { unsub(); clearInterval(interval); };
  }, []);

  const navigate = useNavigate();
  const criticalUpdate = catalog.find(u => u.critical);
  const hasUpdates = catalog.length > 0;

  if (!hasUpdates || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`relative z-50 px-4 py-2 flex items-center justify-between gap-3 text-sm ${
          criticalUpdate
            ? "bg-destructive text-destructive-foreground"
            : "bg-primary/10 text-primary border-b border-primary/20"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {criticalUpdate ? <Shield className="h-4 w-4 shrink-0" /> : <Download className="h-4 w-4 shrink-0" />}
          <span className="truncate font-medium">
            {criticalUpdate
              ? `Critical security update: ${criticalUpdate.version}`
              : `${catalog.length} update${catalog.length > 1 ? "s" : ""} available`}
          </span>
          {criticalUpdate && (
            <span className="hidden md:inline truncate text-xs opacity-80">— {criticalUpdate.releaseNotes?.slice(0, 80)}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant={criticalUpdate ? "secondary" : "default"}
            className="h-7 text-xs"
            onClick={() => navigate("/update-center")}
          >
            View Updates
          </Button>
          {!criticalUpdate && (
            <button onClick={() => setDismissed(true)} className="p-1 rounded hover:bg-foreground/10">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
