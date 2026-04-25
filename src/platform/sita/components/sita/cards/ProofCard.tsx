import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { motion } from "framer-motion";
import { Shield, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

interface ProofStep { label: string; hash?: string; verified?: boolean; timestamp?: string; }

interface ProofCardProps {
  title: string;
  chain: ProofStep[];
  status?: "verified" | "pending" | "failed";
  className?: string;
}

const STATUS_STYLE = {
  verified: { color: "text-[hsl(152_55%_48%)]", bg: "bg-[hsl(152_55%_48%/0.12)]", label: "Verified" },
  pending:  { color: "text-[hsl(38_85%_58%)]",  bg: "bg-[hsl(38_85%_58%/0.12)]",  label: "Pending" },
  failed:   { color: "text-[hsl(0_70%_55%)]",   bg: "bg-[hsl(0_70%_55%/0.12)]",   label: "Failed" },
};

export function ProofCard({ title, chain, status = "verified", className }: ProofCardProps) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_STYLE[status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className={cn("h-3.5 w-3.5", s.color)} />
          <h4 className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)]")}>{title}</h4>
        </div>
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", s.bg, s.color)}>{s.label}</span>
      </div>

      <div className="space-y-1.5">
        {(expanded ? chain : chain.slice(0, 2)).map((step, i) => (
          <div key={i} className="flex items-center gap-2 pl-1">
            <div className={cn("w-1 h-1 rounded-full", status === "verified" ? "bg-[hsl(152_55%_48%)]" : "bg-[hsl(0_0%_40%)]")} />
            <span className={cn(SITA_TYPE.systemMono, "text-[hsl(0_0%_70%)] truncate flex-1")}>{step.label}</span>
            {step.hash && <span className={cn(SITA_TYPE.systemMono, "text-[hsl(0_0%_40%)]")}>{step.hash.slice(0, 8)}</span>}
          </div>
        ))}
      </div>

      {chain.length > 2 && (
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-2 text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_70%)] transition-colors">
          <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
          <span className={cn(SITA_TYPE.microLabel)}>{expanded ? "Collapse" : `${chain.length - 2} more steps`}</span>
        </button>
      )}
    </motion.div>
  );
}
