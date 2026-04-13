import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Clock, LayoutGrid, Settings, Bell, CalendarDays, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetInstance } from "@/hooks/useDesktopWidgets";

const WIDGET_ICONS: Record<string, any> = {
  clock: Clock,
  "quick-actions": LayoutGrid,
  system: Settings,
  calendar: CalendarDays,
  notifications: Bell,
  continuity: ArrowRight,
};

interface WidgetPickerProps {
  open: boolean;
  onClose: () => void;
  hiddenWidgets: WidgetInstance[];
  allTypes: WidgetInstance[];
  onAdd: (type: string) => void;
  onReset: () => void;
}

export function WidgetPicker({ open, onClose, hiddenWidgets, allTypes, onAdd, onReset }: WidgetPickerProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-[360px] rounded-2xl border border-white/[0.08] bg-black/70 backdrop-blur-2xl shadow-2xl"
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="text-sm font-medium text-white/80">Add Widgets</h3>
            <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 pb-3">
            {hiddenWidgets.length === 0 ? (
              <p className="text-xs text-white/30 py-4 text-center">All widgets are on the desktop</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {hiddenWidgets.map(w => {
                  const Icon = WIDGET_ICONS[w.type] || Plus;
                  return (
                    <button
                      key={w.id}
                      onClick={() => { onAdd(w.type); }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                    >
                      <Icon className="h-5 w-5 text-white/50" />
                      <span className="text-[10px] text-white/40">{w.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.06] px-4 py-2.5 flex justify-end">
            <button onClick={onReset} className="text-[11px] text-white/30 hover:text-white/60 transition-colors">
              Reset Layout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
