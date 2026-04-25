import { motion } from "framer-motion";
import { Inbox, CheckCircle2, Search, Sparkles, Plus, Plug } from "lucide-react";
import { SitaButton } from "@/components/sita/SitaCard";

interface EmptyProps {
  variant: "first-use" | "caught-up" | "no-results";
  onAddLead?: () => void;
  onImport?: () => void;
}

export const LeadEmptyState = ({ variant, onAddLead, onImport }: EmptyProps) => {
  if (variant === "caught-up") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-3xl bg-[hsl(var(--trust-safe))]/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-[hsl(var(--trust-safe))]" />
          </div>
          <motion.div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[hsl(var(--trust-safe))] flex items-center justify-center"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
            <Sparkles className="h-3 w-3 text-background" />
          </motion.div>
        </div>
        <h3 className="mt-6 font-display text-lg font-bold text-foreground">You're all caught up</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">All incoming leads have been triaged. New arrivals will appear here automatically.</p>
      </motion.div>
    );
  }

  if (variant === "no-results") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 font-display text-sm font-semibold text-foreground">No matching items</h3>
        <p className="mt-1 text-xs text-muted-foreground">Try adjusting your filters or search term.</p>
      </motion.div>
    );
  }

  // first-use
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative">
        <div className="h-24 w-24 rounded-3xl gradient-sita flex items-center justify-center shadow-glow-purple">
          <Inbox className="h-12 w-12 text-primary-foreground" />
        </div>
      </div>
      <h3 className="mt-6 font-display text-xl font-bold text-foreground">Welcome to Lead Inbox</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        This is your intelligent triage desk. Incoming leads from forms, imports, and integrations arrive here for fast review, scoring, and routing.
      </p>
      <div className="mt-6 flex gap-3">
        {onAddLead && <SitaButton variant="primary" onClick={onAddLead}><Plus className="h-4 w-4" /> Add First Lead</SitaButton>}
        {onImport && <SitaButton variant="secondary" onClick={onImport}><Plug className="h-4 w-4" /> Connect Sources</SitaButton>}
      </div>
      <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
        {[
          { label: "Receive", desc: "From forms, imports, CRM" },
          { label: "Triage", desc: "Score, dedupe, review" },
          { label: "Route", desc: "To leads, consults, quotes" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border/30 bg-card/50 p-3">
            <p className="text-xs font-semibold text-foreground">{s.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
