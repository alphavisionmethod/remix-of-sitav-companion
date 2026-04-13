import { useNavigate } from "react-router-dom";
import { Presentation, CheckCircle2, FileText, Settings } from "lucide-react";
import { DesktopWidgetCard } from "./DesktopWidgetCard";

interface Props {
  onOpenCommand?: () => void;
}

export function DesktopQuickActionsWidget({ onOpenCommand }: Props) {
  const navigate = useNavigate();

  const actions = [
    { label: "Boardroom", icon: Presentation, action: () => navigate("/boardroom") },
    { label: "Approvals", icon: CheckCircle2, action: () => navigate("/approvals") },
    { label: "Search", icon: FileText, action: () => onOpenCommand?.() },
    { label: "Settings", icon: Settings, action: () => navigate("/settings") },
  ];

  return (
    <DesktopWidgetCard title="Quick Actions" accent="from-white/10 via-white/[0.05] to-violet-500/10">
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.action}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.06] border border-white/[0.08] px-3 py-3 text-center text-xs text-white/70 transition hover:bg-white/[0.12] hover:text-white hover:-translate-y-0.5"
          >
            <a.icon className="h-5 w-5" />
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </DesktopWidgetCard>
  );
}
