import { motion } from "framer-motion";
import { Shield, CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import type { BusinessAction } from "@/domains/engines/business-action-pipeline";

interface Props {
  actions: BusinessAction[];
}

export function ProofTimelinePanel({ actions }: Props) {
  const proofActions = actions.filter(a => a.proofReceipt || a.status === "completed" || a.status === "rejected");

  if (proofActions.length === 0) {
    return (
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 text-center">
        <Shield className="h-6 w-6 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-[10px] text-muted-foreground">No proof trail yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-3.5 w-3.5 text-[hsl(152_55%_48%)]" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Proof Timeline</span>
      </div>

      {proofActions.slice(0, 8).map((action, i) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.04)]"
        >
          {action.status === "completed" ? (
            <CheckCircle className="h-3 w-3 text-[hsl(152_55%_48%)] shrink-0" />
          ) : action.status === "rejected" ? (
            <XCircle className="h-3 w-3 text-[hsl(0_65%_50%)] shrink-0" />
          ) : (
            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-medium text-foreground truncate">{action.title}</p>
            <p className="text-[7px] text-muted-foreground">{action.advisorName} · {new Date(action.updatedAt).toLocaleTimeString()}</p>
          </div>
          {action.proofReceipt && (
            <Zap className="h-2.5 w-2.5 text-[hsl(38_85%_58%)] shrink-0" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
