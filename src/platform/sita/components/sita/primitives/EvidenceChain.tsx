// ═══════════════════════════════════════════════════════════════
// SITA OS — EvidenceChain Primitive
// Connected node graph showing how a conclusion was reached
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FileCheck, Database, User, Brain, ExternalLink, Shield } from "lucide-react";

export interface EvidenceNode {
  id: string;
  label: string;
  type: "source" | "inference" | "verification" | "conclusion" | "user-confirmed";
  confidence: number;
  detail?: string;
}

interface EvidenceChainProps {
  title: string;
  nodes: EvidenceNode[];
  className?: string;
}

const nodeIcons: Record<EvidenceNode["type"], React.ElementType> = {
  source: Database,
  inference: Brain,
  verification: Shield,
  conclusion: FileCheck,
  "user-confirmed": User,
};

const nodeColors: Record<EvidenceNode["type"], string> = {
  source: "hsl(210 60% 55%)",
  inference: "hsl(265 55% 58%)",
  verification: "hsl(152 55% 48%)",
  conclusion: "hsl(38 85% 58%)",
  "user-confirmed": "hsl(190 60% 50%)",
};

export function EvidenceChain({ title, nodes, className }: EvidenceChainProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</p>

      <div className="space-y-0">
        {nodes.map((node, i) => {
          const Icon = nodeIcons[node.type];
          const color = nodeColors[node.type];
          const isLast = i === nodes.length - 1;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-3"
            >
              {/* Connector line + node dot */}
              <div className="flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}22` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
                {!isLast && (
                  <div className="w-px flex-1 min-h-[16px] bg-border" />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-3 flex-1 min-w-0", isLast && "pb-0")}>
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-medium text-foreground">{node.label}</p>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase"
                    style={{ background: `${color}15`, color }}
                  >
                    {node.type.replace("-", " ")}
                  </span>
                  <span className="text-[9px] tabular-nums text-muted-foreground/50 ml-auto">{node.confidence}%</span>
                </div>
                {node.detail && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{node.detail}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
