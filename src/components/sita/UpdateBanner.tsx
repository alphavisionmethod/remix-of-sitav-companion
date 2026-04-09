import { useState, useEffect } from "react";
import { Download, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SystemUpdateService, type UpdateRelease } from "@/lib/core-services/system-updates";
import { motion, AnimatePresence } from "framer-motion";

export const UpdateBanner = () => {
  const [update, setUpdate] = useState<UpdateRelease | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    SystemUpdateService.checkForUpdates().then(setUpdate).catch(() => {});
    const interval = setInterval(() => {
      SystemUpdateService.checkForUpdates().then(setUpdate).catch(() => {});
    }, 3600000); // Check hourly
    return () => clearInterval(interval);
  }, []);

  if (!update || dismissed) return null;

  const isCritical = update.is_critical;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`relative z-50 px-4 py-2 flex items-center justify-between gap-3 text-sm ${
          isCritical
            ? 'bg-destructive text-destructive-foreground'
            : 'bg-primary/10 text-primary border-b border-primary/20'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isCritical ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Download className="h-4 w-4 shrink-0" />}
          <span className="truncate font-medium">
            {isCritical ? 'Critical update' : 'Update available'}: v{update.version}
          </span>
          {update.release_notes && (
            <span className="hidden md:inline truncate text-xs opacity-70">— {update.release_notes.slice(0, 80)}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant={isCritical ? "secondary" : "default"} className="h-7 text-xs" onClick={() => window.location.reload()}>
            Update Now
          </Button>
          {!isCritical && (
            <button onClick={() => setDismissed(true)} className="p-1 rounded hover:bg-foreground/10">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
