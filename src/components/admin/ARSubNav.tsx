import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Activity, ListChecks, HeartPulse, Bot, Wrench,
  Search, AlertTriangle, Power, ShieldCheck
} from "lucide-react";

const arPages = [
  { label: "Overview", path: "/admin/automation/overview", icon: Activity },
  { label: "Job Registry", path: "/admin/automation/jobs", icon: ListChecks },
  { label: "Self-Healing", path: "/admin/automation/self-healing", icon: HeartPulse },
  { label: "Agent Scheduler", path: "/admin/automation/agent-scheduler", icon: Bot },
  { label: "Maintenance", path: "/admin/automation/maintenance", icon: Wrench },
  { label: "Traces", path: "/admin/automation/traces", icon: Search },
  { label: "Failures", path: "/admin/automation/failures", icon: AlertTriangle },
  { label: "Kill Switches", path: "/admin/automation/kill-switches", icon: Power },
  { label: "Launch Gate", path: "/admin/automation/launch-gate", icon: ShieldCheck },
];

export default function ARSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto mb-4">
      {arPages.map(p => {
        const active = location.pathname === p.path;
        return (
          <button
            key={p.path}
            onClick={() => navigate(p.path)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap",
              active
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <p.icon className="h-3 w-3" />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
