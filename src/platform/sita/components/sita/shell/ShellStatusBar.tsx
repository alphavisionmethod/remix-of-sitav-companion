// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Status Bar Indicators
// Compact status chips for approvals, incidents, workflows
// ═══════════════════════════════════════════════════════════════

import { CheckCircle, AlertTriangle, Workflow, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShellIndicators } from "@/hooks/use-shell-indicators";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StatusPillProps {
  icon: React.ElementType;
  count: number;
  label: string;
  color: string;
  onClick: () => void;
}

function StatusPill({ icon: Icon, count, label, color, onClick }: StatusPillProps) {
  if (count === 0) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all hover:scale-105",
            color
          )}
        >
          <Icon className="h-3 w-3" />
          <span>{count}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {count} {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function ShellStatusBar() {
  const indicators = useShellIndicators();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1">
      <StatusPill
        icon={CheckCircle}
        count={indicators.pendingApprovals}
        label="pending approvals"
        color="bg-[hsl(var(--sita-gold))]/15 text-[hsl(var(--sita-gold))]"
        onClick={() => navigate("/approvals")}
      />
      <StatusPill
        icon={AlertTriangle}
        count={indicators.activeIncidents}
        label="active incidents"
        color="bg-destructive/15 text-destructive"
        onClick={() => navigate("/mission-control")}
      />
      <StatusPill
        icon={Workflow}
        count={indicators.activeWorkflows}
        label="running workflows"
        color="bg-primary/15 text-primary"
        onClick={() => navigate("/workflows")}
      />
    </div>
  );
}
