import { motion, AnimatePresence } from "framer-motion";
import { SitaCard, SitaCardTitle, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { Copy, ArrowRight, X, Check, Mail, Phone, Building2 } from "lucide-react";
import type { InboxItem } from "./mock-inbox-data";

interface Props {
  item: InboxItem;
  matchItem?: InboxItem | null;
  open: boolean;
  onClose: () => void;
  onMerge: () => void;
  onKeepBoth: () => void;
}

const FieldRow = ({ label, left, right, conflict }: { label: string; left?: string | null; right?: string | null; conflict?: boolean }) => (
  <div className="grid grid-cols-[100px_1fr_1fr] gap-2 items-center py-1.5 border-b border-border/20 last:border-0">
    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
    <span className="text-xs text-foreground truncate">{left || "—"}</span>
    <span className={`text-xs truncate ${conflict ? "text-[hsl(var(--trust-degraded))] font-medium" : "text-foreground"}`}>
      {right || "—"}
    </span>
  </div>
);

export const LeadDuplicateDrawer = ({ item, matchItem, open, onClose, onMerge, onKeepBoth }: Props) => {
  // Generate a synthetic match for demo if no real match
  const match: Partial<InboxItem> = matchItem || {
    contact_name: item.contact_name,
    contact_email: item.contact_email,
    contact_phone: item.contact_phone ? null : "+1-555-999-0000",
    company: item.company || "Unknown Corp",
    source: "crm-sync" as const,
    quality_score: Math.max(40, item.quality_score - 15),
    inquiry_text: "Previously contacted regarding similar services.",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  };

  const hasEmailConflict = item.contact_email !== match.contact_email && !!match.contact_email;
  const hasPhoneConflict = item.contact_phone !== match.contact_phone && !!item.contact_phone && !!match.contact_phone;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <SitaCard hover={false} className="p-0 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-[hsl(var(--trust-degraded))]/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[hsl(var(--trust-degraded))]/10 flex items-center justify-center">
                    <Copy className="h-5 w-5 text-[hsl(var(--trust-degraded))]" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-foreground">Duplicate Comparison</h3>
                    <p className="text-[11px] text-muted-foreground">
                      {item.duplicate_status === "definite" ? "Definite match found" : "Possible match detected"} — review before accepting
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[100px_1fr_1fr] gap-2 px-6 py-2.5 bg-muted/10 border-b border-border/20">
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Field</span>
                <span className="text-[10px] text-primary font-bold uppercase flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> New Record
                </span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Existing
                </span>
              </div>

              {/* Comparison rows */}
              <div className="px-6 py-3">
                <FieldRow label="Name" left={item.contact_name} right={match.contact_name} />
                <FieldRow label="Email" left={item.contact_email} right={match.contact_email} conflict={hasEmailConflict} />
                <FieldRow label="Phone" left={item.contact_phone} right={match.contact_phone} conflict={hasPhoneConflict} />
                <FieldRow label="Company" left={item.company} right={match.company} />
                <FieldRow label="Source" left={item.source} right={match.source} />
                <FieldRow label="Quality" left={`${item.quality_score}/100`} right={`${match.quality_score}/100`} />
                <FieldRow label="Inquiry" left={item.inquiry_text?.slice(0, 60)} right={match.inquiry_text?.slice(0, 60)} />
              </div>

              {/* Confidence */}
              <div className="px-6 py-3 bg-muted/5 border-t border-border/20">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[11px] text-muted-foreground">Match Confidence</p>
                    <div className="h-2 rounded-full bg-muted/30 mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.duplicate_status === "definite" ? "bg-[hsl(var(--trust-degraded))]" : "bg-[hsl(var(--sita-gold))]"}`}
                        style={{ width: item.duplicate_status === "definite" ? "92%" : "65%" }}
                      />
                    </div>
                  </div>
                  <span className="font-display text-lg font-bold text-foreground">
                    {item.duplicate_status === "definite" ? "92%" : "65%"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 px-6 py-4 border-t border-border/40">
                <SitaButton variant="primary" onClick={onMerge} className="flex-1">
                  <ArrowRight className="h-4 w-4" /> Merge Records
                </SitaButton>
                <SitaButton variant="secondary" onClick={onKeepBoth} className="flex-1">
                  <Check className="h-4 w-4" /> Keep Both
                </SitaButton>
                <SitaButton variant="ghost" onClick={onClose}>
                  Cancel
                </SitaButton>
              </div>
            </SitaCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
