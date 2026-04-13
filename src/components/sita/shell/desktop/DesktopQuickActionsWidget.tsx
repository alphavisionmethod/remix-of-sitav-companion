import { useNavigate } from "react-router-dom";
import { Presentation, CheckCircle2, FileText, Settings } from "lucide-react";
import { DesktopWidgetCard } from "./DesktopWidgetCard";

interface Props {
  onOpenCommand?: () => void;
}

export function DesktopQuickActionsWidget({ onOpenCommand }: Props) {
  const navigate = useNavigate();

  const actions = [
    { label: "Open Boardroom", icon: Presentation, action: () => navigate("/boardroom") },
    { label: "Review approvals", icon: CheckCircle2, action: () => navigate("/approvals") },
    { label: "Search files", icon: FileText, action: () => onOpenCommand?.() },
    { label: "System settings", icon: Settings, action: () => navigate("/settings") },
  ];

  return (
    <DesktopWidgetCard title="Quick actions" accent="from-white/10 via-white/[0.05] to-violet-500/10">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.action}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/15 px-4 py-4 text-left text-sm text-white/80 transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <a.icon className="h-4 w-4" />
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
