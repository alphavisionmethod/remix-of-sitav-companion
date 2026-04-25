import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, LayoutGrid, Settings, Bell, CalendarDays, ArrowRight, BriefcaseBusiness, Plus, Minus, RotateCcw, TrendingUp, Users, UserCheck, Brain, Sparkles, DollarSign, CheckSquare, CloudSun, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetInstance } from "@/hooks/useDesktopWidgets";
import { DesktopSeedSampleButton } from "@/components/sita/DesktopSeedSampleButton";

const WIDGET_ICONS: Record<string, any> = {
  clock: Clock,
  "quick-actions": LayoutGrid,
  system: Settings,
  calendar: CalendarDays,
  notifications: Bell,
  continuity: ArrowRight,
  "what-matters": BriefcaseBusiness,
  "notifications-feed": Bell,
  "investment-pulse": TrendingUp,
  "crm-pipeline": Users,
  "leads-recovered": UserCheck,
  "calendar-today": CalendarDays,
  "boardroom-brief": Brain,
  "advisor-council": Sparkles,
  "business-kpi": TrendingUp,
  "finance-snapshot": DollarSign,
  "concierge-tasks": CheckSquare,
  weather: CloudSun,
  "portfolio-globe": PieChart,
};

interface WidgetPickerProps {
  open: boolean;
  onClose: () => void;
  hiddenWidgets: WidgetInstance[];
  allWidgets: WidgetInstance[];
  allTypes: WidgetInstance[];
  onAdd: (type: string) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
}

export function WidgetPicker({ open, onClose, hiddenWidgets, allWidgets, allTypes, onAdd, onRemove, onReset }: WidgetPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("clock");

  const filteredTypes = useMemo(() => {
    if (!search.trim()) return allTypes;
    const q = search.toLowerCase();
    return allTypes.filter(w => w.label.toLowerCase().includes(q) || w.description?.toLowerCase().includes(q));
  }, [allTypes, search]);

  const selectedWidget = allTypes.find(w => w.type === selectedType) || allTypes[0];
  const isOnDesktop = allWidgets.find(w => w.type === selectedType)?.visible ?? false;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" onClick={onClose} />

          {/* Gallery Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex w-[880px] h-[540px] rounded-3xl border border-white/[0.08] bg-[hsl(240,10%,8%)]/90 backdrop-blur-3xl shadow-2xl overflow-hidden"
          >
            {/* ── Left Sidebar ── */}
            <div className="w-[200px] border-r border-white/[0.06] flex flex-col">
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search Widgets"
                    className="w-full rounded-lg bg-white/[0.06] border border-white/[0.06] pl-8 pr-3 py-2 text-xs text-white/90 placeholder:text-white/25 outline-none focus:border-white/[0.15] transition-colors"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-1.5 pb-3">
                {filteredTypes.map(w => {
                  const Icon = WIDGET_ICONS[w.type] || LayoutGrid;
                  const active = selectedType === w.type;
                  const onDesktop = allWidgets.find(aw => aw.type === w.type)?.visible;
                  return (
                    <button
                      key={w.type}
                      onClick={() => setSelectedType(w.type)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors",
                        active
                          ? "bg-white/[0.12] text-white"
                          : "text-white/50 hover:bg-white/[0.05] hover:text-white/70"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-medium truncate flex-1">{w.label}</span>
                      {onDesktop && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Center Preview ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">
              {selectedWidget && (() => {
                const Icon = WIDGET_ICONS[selectedWidget.type] || LayoutGrid;
                return (
                  <>
                    {/* Large icon preview */}
                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center mb-5 shadow-lg">
                      <Icon className="h-12 w-12 text-white/60" />
                    </div>

                    <h2 className="text-lg font-semibold text-white mb-1">{selectedWidget.label}</h2>
                    <p className="text-xs text-white/40 text-center max-w-[260px] mb-6 leading-relaxed">
                      {selectedWidget.description}
                    </p>

                    {/* Add / Remove toggle */}
                    {isOnDesktop ? (
                      <button
                        onClick={() => {
                          const w = allWidgets.find(aw => aw.type === selectedType);
                          if (w) onRemove(w.id);
                        }}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                        Remove from Desktop
                      </button>
                    ) : (
                      <button
                        onClick={() => onAdd(selectedType)}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/[0.1] border border-white/[0.12] text-white text-xs font-medium hover:bg-white/[0.18] transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add to Desktop
                      </button>
                    )}
                  </>
                );
              })()}
            </div>

            {/* ── Right Column: Active Widgets ── */}
            <div className="w-[220px] border-l border-white/[0.06] flex flex-col">
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">On Desktop</h3>
              </div>
              <div className="flex-1 overflow-y-auto px-2 pb-2">
                {allWidgets.filter(w => w.visible).map(w => {
                  const Icon = WIDGET_ICONS[w.type] || LayoutGrid;
                  return (
                    <div
                      key={w.id}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg group hover:bg-white/[0.04] transition-colors"
                    >
                      <Icon className="h-4 w-4 text-white/40 shrink-0" />
                      <span className="text-xs text-white/70 flex-1 truncate">{w.label}</span>
                      <button
                        onClick={() => onRemove(w.id)}
                        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"
                        title="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
                {allWidgets.filter(w => w.visible).length === 0 && (
                  <p className="text-[11px] text-white/20 text-center py-6">No widgets on desktop</p>
                )}
              </div>

              {/* Reset + admin seed */}
              <div className="border-t border-white/[0.06] px-3 py-2.5 flex items-center justify-between gap-2">
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/50 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Layout
                </button>
                <DesktopSeedSampleButton />
              </div>
            </div>
          </motion.div>

          {/* Done button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.15, duration: 0.25 }}
            onClick={onClose}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] px-8 py-2.5 rounded-full bg-white/[0.15] border border-white/[0.12] backdrop-blur-xl text-sm font-medium text-white hover:bg-white/[0.25] transition-colors shadow-xl"
          >
            Done
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
