import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Filter, Receipt, CheckCircle, Zap, FileText, DollarSign, Briefcase, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "@/contexts/DataModeContext";

interface TimelineEntry {
  id: string;
  domain: "business" | "finance" | "life" | "system";
  type: "action" | "receipt" | "approval" | "event";
  title: string;
  description?: string;
  time: string;
  proofLink?: string;
}

const MOCK_TIMELINE: TimelineEntry[] = [
  { id: "1", domain: "finance", type: "action", title: "Paid office rent", description: "$2,500 via ACH", time: "Today 9:15 AM", proofLink: "#" },
  { id: "2", domain: "business", type: "receipt", title: "Invoice sent to Acme Corp", description: "#INV-2024-048 — $12,000", time: "Today 8:42 AM", proofLink: "#" },
  { id: "3", domain: "system", type: "approval", title: "Quarterly tax payment approved", description: "$4,200 — auto-approved by policy", time: "Yesterday 4:30 PM", proofLink: "#" },
  { id: "4", domain: "life", type: "event", title: "HVAC service confirmed", description: "ServicePro — Thursday 2:00 PM", time: "Yesterday 2:15 PM" },
  { id: "5", domain: "business", type: "action", title: "Follow-up sent to James Morton", description: "Re-engagement email via CRM", time: "Yesterday 11:00 AM", proofLink: "#" },
  { id: "6", domain: "finance", type: "receipt", title: "AWS billing processed", description: "$342 — auto-paid", time: "2 days ago", proofLink: "#" },
  { id: "7", domain: "life", type: "event", title: "Grocery order placed", description: "Weekly staples — $186", time: "2 days ago" },
  { id: "8", domain: "system", type: "approval", title: "New connector authorized", description: "QuickBooks sync enabled", time: "3 days ago", proofLink: "#" },
];

const DOMAIN_ICONS: Record<string, typeof Clock> = { business: Briefcase, finance: DollarSign, life: Home, system: Zap };
const TYPE_ICONS: Record<string, typeof Clock> = { action: Zap, receipt: Receipt, approval: CheckCircle, event: FileText };
const DOMAINS = ["all", "business", "finance", "life", "system"] as const;

interface UniversalTimelineProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversalTimeline = ({
  const { isDemoMode } = useDataMode(); isOpen, onClose }: UniversalTimelineProps) => {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? MOCK_TIMELINE : (isDemoMode ? MOCK_TIMELINE : [] as typeof MOCK_TIMELINE).filter(e => e.domain === filter);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm border-l border-border bg-background shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Timeline</span>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-2 overflow-x-auto">
              <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
              {DOMAINS.map(d => (
                <button
                  key={d}
                  onClick={() => setFilter(d)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-all whitespace-nowrap",
                    filter === d ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Entries */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
              <div className="relative">
                <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />
                <div className="space-y-1">
                  {filtered.map((entry, i) => {
                    const TypeIcon = TYPE_ICONS[entry.type];
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="relative flex gap-3 py-2.5 pl-1"
                      >
                        <div className="relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-card border border-border shrink-0">
                          <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 pb-2">
                          <p className="text-xs font-medium text-foreground">{entry.title}</p>
                          {entry.description && <p className="text-[11px] text-muted-foreground mt-0.5">{entry.description}</p>}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground/60">{entry.time}</span>
                            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground capitalize">{entry.domain}</span>
                            {entry.proofLink && (
                              <a href={entry.proofLink} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                                <Receipt className="h-2.5 w-2.5" /> Proof
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
