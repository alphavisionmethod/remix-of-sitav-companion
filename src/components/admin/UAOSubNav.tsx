import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Radio, Smartphone, Users, Bell, HeartPulse, Shield, Route, Rocket,
  ArrowRight, Activity
} from "lucide-react";

const uaoPages = [
  { label: "Presence", path: "/admin/uao/presence", icon: Radio },
  { label: "Devices", path: "/admin/uao/devices", icon: Smartphone },
  { label: "Team", path: "/admin/uao/team", icon: Users },
  { label: "Notifications", path: "/admin/uao/notifications", icon: Bell },
  { label: "Health", path: "/admin/uao/health", icon: HeartPulse },
  { label: "Trust", path: "/admin/uao/trust", icon: Shield },
  { label: "Journeys", path: "/admin/uao/journeys", icon: Route },
  { label: "Launch", path: "/admin/uao/launch", icon: Rocket },
];

const crossLinks = [
  { label: "DWE Devices", path: "/admin/dwe/devices", icon: Smartphone },
  { label: "DWE Wearables", path: "/admin/dwe/wearables", icon: Activity },
];

export default function UAOSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="space-y-1 mb-4">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto">
        {uaoPages.map(p => {
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
