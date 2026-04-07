// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Mode Badge
// Visible indicator when a surface is running on demo/mock data
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import { Badge } from "@/components/ui/badge";
import { FlaskConical } from "lucide-react";

interface DemoModeBadgeProps {
  /** Override: force show even in live mode (e.g., for surfaces with mixed sources) */
  forceShow?: boolean;
  /** Label override */
  label?: string;
  /** Compact mode — icon only */
  compact?: boolean;
}

export function DemoModeBadge({ forceShow, label, compact }: DemoModeBadgeProps) {
  const { isDemoMode } = useDataMode();

  if (!isDemoMode && !forceShow) return null;

  if (compact) {
    return (
      <span role="status" aria-label="Demo Mode" data-testid="demo-mode-badge" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400" title="Demo Mode">
        <FlaskConical className="w-3 h-3" />
      </span>
    );
  }

  return (
    <Badge role="status" aria-label={label ?? "Demo Mode"} data-testid="demo-mode-badge" variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-xs gap-1">
      <FlaskConical className="w-3 h-3" />
      {label ?? "Demo Mode"}
    </Badge>
  );
}
