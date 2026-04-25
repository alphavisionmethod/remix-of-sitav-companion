import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Route, Bot, AlertTriangle, Layers, Smartphone, Rocket,
  ArrowRight, Bell, Activity
} from "lucide-react";

const nrcPages = [
  { label: "Routing Studio", path: "/admin/nrc/routing", icon: Route },
  { label: "Calmness", path: "/admin/nrc/calmness", icon: Bot },
  { label: "Fatigue", path: "/admin/nrc/fatigue", icon: AlertTriangle },
  { label: "Queue/Interrupt", path: "/admin/nrc/queue-interrupt", icon: Layers },
  { label: "Cross-Device", path: "/admin/nrc/cross-device", icon: Smartphone },
  { label: "Launch Honesty", path: "/admin/nrc/launch-honesty", icon: Rocket },
];

const crossLinks = [
  { label: "DWE Notifications", path: "/admin/dwe/notifications", icon: Bell },
  { label: "Health Influence", path: "/admin/hrs/notification-influence", icon: Activity },
  { label: "Native Shell Push", path: "/admin/nss/strategy", icon: Smartphone },
];

export default function NRCSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="space-y-1 mb-4">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto">
        {nrcPages.map(p => {
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
      <div className="flex items-center gap-1 pl-1">
        <span className="text-[10px] text-muted-foreground mr-1">Related:</span>
        {crossLinks.map(l => (
          <button
            key={l.path}
            onClick={() => navigate(l.path)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors whitespace-nowrap"
          >
            <l.icon className="h-2.5 w-2.5" />
            {l.label}
            <ArrowRight className="h-2 w-2 opacity-50" />
          </button>
        ))}
      </div>
    </div>
  );
}
