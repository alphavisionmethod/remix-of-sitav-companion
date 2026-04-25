// ═══════════════════════════════════════════════════════════════
// SITA OS — Live Activity Bar (Dynamic Island concept)
// Persistent mini-bar at top center showing live context
// Expands on hover, contracts to pill when inactive
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Timer, Music, Download, Brain, Pause, X } from "lucide-react";

export interface LiveActivity {
  id: string;
  type: "timer" | "music" | "download" | "focus" | "custom";
  label: string;
  sublabel?: string;
  progress?: number; // 0-1
  icon?: React.ReactNode;
  onAction?: () => void;
  onDismiss?: () => void;
}

// Global activity registry
const activityListeners = new Set<(activities: LiveActivity[]) => void>();
let currentActivities: LiveActivity[] = [];

export function registerActivity(activity: LiveActivity) {
  currentActivities = [...currentActivities.filter(a => a.id !== activity.id), activity];
  activityListeners.forEach(fn => fn(currentActivities));
}

export function removeActivity(id: string) {
  currentActivities = currentActivities.filter(a => a.id !== id);
  activityListeners.forEach(fn => fn(currentActivities));
}

export function updateActivity(id: string, updates: Partial<LiveActivity>) {
  currentActivities = currentActivities.map(a => a.id === id ? { ...a, ...updates } : a);
  activityListeners.forEach(fn => fn(currentActivities));
}

function useActivities() {
  const [activities, setActivities] = useState<LiveActivity[]>(currentActivities);

  useEffect(() => {
    activityListeners.add(setActivities);
    return () => { activityListeners.delete(setActivities); };
  }, []);

  return activities;
}

const typeIcons: Record<LiveActivity["type"], React.ReactNode> = {
  timer: <Timer className="w-3 h-3" />,
  music: <Music className="w-3 h-3" />,
  download: <Download className="w-3 h-3" />,
  focus: <Brain className="w-3 h-3" />,
  custom: null,
};

export function LiveActivityBar() {
  const activities = useActivities();
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);

  if (activities.length === 0) return null;

  const primary = activities[0];

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto">
      <motion.div
        layout
        onMouseEnter={() => { setHovering(true); setExpanded(true); }}
        onMouseLeave={() => { setHovering(false); setExpanded(false); }}
        className={cn(
          "relative overflow-hidden",
          "bg-[hsl(0_0%_0%/0.85)] dark:bg-[hsl(0_0%_5%/0.9)]",
          "backdrop-blur-xl border border-[hsl(0_0%_100%/0.1)]",
          "text-[hsl(0_0%_95%)] shadow-2xl",
          "cursor-pointer select-none"
        )}
        animate={{
          borderRadius: expanded ? 16 : 24,
          width: expanded ? 280 : Math.min(180, 100 + activities.length * 40),
          height: expanded ? "auto" : 32,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Contracted pill */}
        <AnimatePresence mode="wait">
          {!expanded ? (
            <motion.div
              key="pill"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 h-8"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium">
                {primary.icon || typeIcons[primary.type]}
                <span className="truncate max-w-[100px]">{primary.label}</span>
              </div>
              {primary.progress !== undefined && (
                <div className="flex-1 h-1 bg-[hsl(0_0%_100%/0.15)] rounded-full overflow-hidden min-w-[30px]">
                  <motion.div
                    className="h-full bg-[hsl(var(--primary))] rounded-full"
                    animate={{ width: `${primary.progress * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
              {activities.length > 1 && (
                <span className="text-[10px] text-[hsl(0_0%_100%/0.5)] font-medium">
                  +{activities.length - 1}
                </span>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 space-y-2"
            >
              {activities.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center gap-2 group"
                  onClick={() => activity.onAction?.()}
                >
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary)/0.2)] flex items-center justify-center flex-shrink-0">
                    {activity.icon || typeIcons[activity.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{activity.label}</div>
                    {activity.sublabel && (
                      <div className="text-[10px] text-[hsl(0_0%_100%/0.5)] truncate">{activity.sublabel}</div>
                    )}
                    {activity.progress !== undefined && (
                      <div className="h-1 bg-[hsl(0_0%_100%/0.1)] rounded-full mt-1 overflow-hidden">
                        <motion.div
                          className="h-full bg-[hsl(var(--primary))] rounded-full"
                          animate={{ width: `${activity.progress * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                  {activity.onDismiss && (
                    <button
                      onClick={(e) => { e.stopPropagation(); activity.onDismiss?.(); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-[hsl(0_0%_100%/0.1)]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
