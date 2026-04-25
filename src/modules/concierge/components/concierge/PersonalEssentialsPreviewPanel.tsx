import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FileText, Shield, Clock, Stethoscope, Plane, Home } from "lucide-react";

export interface EssentialDoc {
  id: string;
  name: string;
  type: "medical" | "travel" | "insurance" | "contract" | "form" | "general";
  sensitivity: "normal" | "sensitive" | "confidential";
  expiryWarning?: string;
  linkedContext?: string;
}

const typeIcons = { medical: Stethoscope, travel: Plane, insurance: Shield, contract: FileText, form: FileText, general: Home };
const sensitivityBadge = {
  normal: null,
  sensitive: { class: "bg-amber-500/10 text-amber-600", label: "Sensitive" },
  confidential: { class: "bg-destructive/10 text-destructive", label: "Confidential" },
};

export const PersonalEssentialsPreviewPanel = ({ docs, className }: { docs: EssentialDoc[]; className?: string }) => (
  <motion.div
    className={cn("rounded-2xl border border-border/50 bg-card p-4", className)}
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <FileText className="h-4 w-4 text-primary" />
      <p className="text-xs font-semibold text-foreground">Essential Documents</p>
    </div>
    <div className="space-y-2">
      {docs.map(doc => {
        const Icon = typeIcons[doc.type] || FileText;
        const badge = sensitivityBadge[doc.sensitivity];
        return (
          <div key={doc.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-secondary/20 transition-colors cursor-pointer">
            <div className="rounded-lg bg-primary/8 p-1.5 shrink-0">
              <Icon className="h-3 w-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground truncate">{doc.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {doc.linkedContext && <span className="text-[9px] text-primary">↗ {doc.linkedContext}</span>}
                {doc.expiryWarning && (
                  <span className="flex items-center gap-0.5 text-[9px] text-amber-500">
                    <Clock className="h-2.5 w-2.5" />{doc.expiryWarning}
                  </span>
                )}
              </div>
            </div>
            {badge && (
              <span className={cn("rounded-full px-2 py-0.5 text-[8px] font-medium shrink-0", badge.class)}>{badge.label}</span>
            )}
          </div>
        );
      })}
    </div>
  </motion.div>
);
