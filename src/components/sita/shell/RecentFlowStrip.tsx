// ═══════════════════════════════════════════════════════════════
// SITA OS — Recent Flow Strip
// Subtle workflow chain above dock: Chrome → Docs → Notes
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AppDefinition } from "@/lib/app-platform/types";
import { ChevronRight } from "lucide-react";

interface FlowEntry {
  appId: string;
  timestamp: number;
}

interface RecentFlowStripProps {
  flow: FlowEntry[];
  apps: AppDefinition[];
  visible: boolean;
  onAppClick: (appId: string) => void;
}

export function RecentFlowStrip({ flow, apps, visible, onAppClick }: RecentFlowStripProps) {
  if (flow.length < 2) return null;

  const flowApps = flow
    .slice(0, 4)
    .map(f => apps.find(a => a.id === f.appId))
    .filter(Boolean) as AppDefinition[];

  if (flowApps.length < 2) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 backdrop-blur-xl border border-[hsl(0_0%_100%/0.12)] bg-[hsl(0_0%_0%/0.25)]"
        >
          <span className="text-[9px] font-medium text-[hsl(0_0%_100%/0.4)] mr-1 uppercase tracking-wider">Flow</span>
          {flowApps.map((app, i) => (
            <div key={app.id} className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAppClick(app.id)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs hover:ring-1 hover:ring-[hsl(0_0%_100%/0.2)] transition-all"
                style={{ background: "hsl(0 0% 100% / 0.08)" }}
                title={app.name}
              >
                {app.icon}
              </motion.button>
              {i < flowApps.length - 1 && (
                <ChevronRight className="w-2.5 h-2.5 text-[hsl(0_0%_100%/0.25)] mx-0.5 flex-shrink-0" />
              )}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
