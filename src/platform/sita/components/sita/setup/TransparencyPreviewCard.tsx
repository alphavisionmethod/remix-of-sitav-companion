import { motion } from "framer-motion";
import { Shield, Eye, FileText, Lock } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TransparencyPreviewCardProps {
  className?: string;
}

export function TransparencyPreviewCard({ className }: TransparencyPreviewCardProps) {
  const reduced = useReducedMotion();
  const items = [
    { icon: Eye, label: "Every action is logged", desc: "Full audit trail with timestamps" },
    { icon: FileText, label: "Proofs are verifiable", desc: "Cryptographic receipts for every decision" },
    { icon: Lock, label: "Data stays on-device first", desc: "Local-first with encrypted sync" },
    { icon: Shield, label: "You can revoke anytime", desc: "Permissions are always reversible" },
  ];

  return (
    <div className={className}>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">How SITA protects you</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div key={i}
            initial={reduced ? {} : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : 0.3 + i * 0.1 }}
            className="flex items-start gap-2.5 rounded-lg bg-secondary/20 p-2.5"
          >
            <item.icon className="h-3.5 w-3.5 text-trust-safe shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-foreground">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
