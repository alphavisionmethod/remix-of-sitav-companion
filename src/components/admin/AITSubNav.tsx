import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Bot, Users, Terminal, Activity, DollarSign,
  Lightbulb, Shield, Target, ClipboardCheck
} from "lucide-react";

const aitPages = [
  { label: "Overview", path: "/admin/ai-team", icon: Bot },
  { label: "Roles", path: "/admin/ai-team/roles", icon: Users },
  { label: "Invoke", path: "/admin/ai-team/invoke", icon: Terminal },
  { label: "Activity", path: "/admin/ai-team/activity", icon: Activity },
  { label: "Cost", path: "/admin/ai-team/cost", icon: DollarSign },
  { label: "Recommendations", path: "/admin/ai-team/recommendations", icon: Lightbulb },
  { label: "Approvals", path: "/admin/ai-team/approvals", icon: Shield },
  { label: "Launch Truth", path: "/admin/ai-team/truth", icon: Target },
  { label: "Setup", path: "/admin/ai-team/setup", icon: ClipboardCheck },
];

export default function AITSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto mb-4">
      {aitPages.map(p => {
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
