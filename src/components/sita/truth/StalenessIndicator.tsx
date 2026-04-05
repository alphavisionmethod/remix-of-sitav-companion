import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StalenessIndicatorProps {
  lastUpdated: string | null;
  thresholdSeconds?: number;
  className?: string;
}

function timeSince(dateStr: string): { text: string; seconds: number } {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return { text: "just now", seconds: diff };
  if (diff < 3600) return { text: `${Math.floor(diff / 60)}m ago`, seconds: diff };
  if (diff < 86400) return { text: `${Math.floor(diff / 3600)}h ago`, seconds: diff };
  return { text: `${Math.floor(diff / 86400)}d ago`, seconds: diff };
}

export function StalenessIndicator({ lastUpdated, thresholdSeconds = 3600, className }: StalenessIndicatorProps) {
  if (!lastUpdated) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[10px] text-muted-foreground", className)}>
        <Clock className="w-2.5 h-2.5" /> Never synced
      </span>
    );
  }

  const { text, seconds } = timeSince(lastUpdated);
  const ratio = seconds / thresholdSeconds;
  const color = ratio < 0.5 ? "text-green-400" : ratio < 1 ? "text-amber-400" : ratio < 2 ? "text-orange-400" : "text-red-400";

  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px]", color, className)}>
      <Clock className="w-2.5 h-2.5" /> {text}
    </span>
  );
}
