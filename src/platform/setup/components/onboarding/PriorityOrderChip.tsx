import { motion } from "framer-motion";
import { GripVertical, X } from "lucide-react";

interface PriorityOrderChipProps {
  index: number;
  label: string;
  onRemove: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export function PriorityOrderChip({ index, label, onRemove, onPointerDown }: PriorityOrderChipProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-foreground select-none touch-none shrink-0"
    >
      <span
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        onPointerDown={onPointerDown}
      >
        <GripVertical className="h-3 w-3" />
      </span>
      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold shrink-0">
        {index + 1}
      </span>
      <span className="truncate max-w-[140px]">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

export default PriorityOrderChip;