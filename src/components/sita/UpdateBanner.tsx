// ═══════════════════════════════════════════════════════════════
// SITA OS — Gentle Update Notification Toast
// Compact floating card in bottom-right, OS-style
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { Download, X, Shield, Clock, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateDaemon } from "@/lib/services/update-daemon";
import { useNavigate } from "react-router-dom";

const SCHEDULE_OPTIONS = ["Tonight", "Tomorrow", "This Weekend"] as const;
type ScheduleOption = typeof SCHEDULE_OPTIONS[number];

export const UpdateBanner = () => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [catalog, setCatalog] = useState(updateDaemon.getState().catalog);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduled, setScheduled] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    updateDaemon.checkForUpdates().catch(() => {});
    const unsub = updateDaemon.subscribe(() => {
      setCatalog([...updateDaemon.getState().catalog]);
    });
    const interval = setInterval(() => {
      updateDaemon.checkForUpdates().catch(() => {});
    }, 3600000);
    return () => { unsub(); clearInterval(interval); };
  }, []);

  // Pick the most important undismissed update
  const visibleUpdate = catalog.find(u => !dismissedIds.has(u.id));
  const isCritical = visibleUpdate?.critical ?? false;
  const autoDismissMs = isCritical ? 30000 : 15000;

  // Auto-dismiss timer
  useEffect(() => {
    if (!visibleUpdate || hovered || scheduled) return;
    timerRef.current = setTimeout(() => {
      if (visibleUpdate) {
        setDismissedIds(prev => new Set(prev).add(visibleUpdate.id));
      }
    }, autoDismissMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visibleUpdate?.id, hovered, scheduled, autoDismissMs]);

  const handleDismiss = useCallback(() => {
    if (visibleUpdate) {
      setDismissedIds(prev => new Set(prev).add(visibleUpdate.id));
      setScheduleOpen(false);
      setScheduled(null);
    }
  }, [visibleUpdate]);

  const handleSchedule = useCallback((option: ScheduleOption) => {
    setScheduled(option);
    setScheduleOpen(false);
    setTimeout(() => {
      if (visibleUpdate) {
        setDismissedIds(prev => new Set(prev).add(visibleUpdate.id));
      }
      setScheduled(null);
    }, 2500);
  }, [visibleUpdate]);

  if (!visibleUpdate) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={visibleUpdate.id}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setScheduleOpen(false); }}
        className="fixed bottom-6 right-6 z-50 w-[340px] rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
      >
        {/* Content */}
        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="relative shrink-0 mt-0.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isCritical
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-primary/10 text-primary"
              }`}>
                {isCritical ? <Shield className="w-[18px] h-[18px]" /> : <Download className="w-[18px] h-[18px]" />}
              </div>
              {isCritical && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-[hsl(var(--background))]" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {isCritical ? "Security Update" : "Update Available"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug truncate">
                {visibleUpdate.version}
                {visibleUpdate.releaseNotes && ` — ${visibleUpdate.releaseNotes.slice(0, 50)}`}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="shrink-0 p-1 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scheduled confirmation */}
          <AnimatePresence mode="wait">
            {scheduled ? (
              <motion.div
                key="scheduled"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex items-center gap-2 text-xs text-emerald-400"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Scheduled for {scheduled}</span>
              </motion.div>
            ) : (
              <motion.div
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 flex items-center gap-2"
              >
                {/* Install */}
                <button
                  onClick={() => navigate("/update-center")}
                  className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors ${
                    isCritical
                      ? "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                      : "bg-primary/15 text-primary hover:bg-primary/25"
                  }`}
                >
                  Install Now
                </button>

                {/* Schedule dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setScheduleOpen(!scheduleOpen)}
                    className="h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors flex items-center gap-1.5"
                  >
                    <Clock className="w-3 h-3" />
                    Later
                    <ChevronDown className={`w-3 h-3 transition-transform ${scheduleOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {scheduleOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full right-0 mb-1.5 w-36 rounded-xl border border-white/[0.08] bg-[hsl(var(--background))] backdrop-blur-xl shadow-xl overflow-hidden"
                      >
                        {SCHEDULE_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleSchedule(opt)}
                            className="w-full px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                          >
                            {opt}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Auto-dismiss progress bar */}
        {!hovered && !scheduled && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: autoDismissMs / 1000, ease: "linear" }}
            className={`h-[2px] origin-left ${isCritical ? "bg-amber-400/30" : "bg-primary/30"}`}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};
