import { motion } from "framer-motion";
import { RotateCcw, Calendar, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestorePreviewCardProps {
  lastBackup?: string;
  itemCount?: number;
  selected?: boolean;
  onClick?: () => void;
}

export function RestorePreviewCard({ lastBackup, itemCount = 0, selected, onClick }: RestorePreviewCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-all",
        selected ? "border-primary/50 bg-primary/8" : "border-border bg-secondary/20 hover:border-primary/20"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/15 p-2">
          <RotateCcw className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Restore from backup</p>
          {lastBackup && (
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Last: {lastBackup}</span>
              <span className="text-[10px] text-muted-foreground">• {itemCount} items</span>
            </div>
          )}
        </div>
        <Shield className="h-4 w-4 text-trust-safe" />
      </div>
    </motion.button>
  );
}
