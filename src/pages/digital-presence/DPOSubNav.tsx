import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3, Layout, Globe, Palette, Link2, Target, Store, Megaphone,
  Users, AlertTriangle, Clock, Rocket, Wrench, Smartphone, BarChart2,
  Server, History
} from "lucide-react";

const dpoPages = [
  { label: "Hub", path: "/digital-presence", icon: Globe },
  { label: "Boardroom", path: "/digital-presence/boardroom", icon: BarChart3 },
  { label: "Twin", path: "/digital-presence/website-twin", icon: Layout },
  { label: "Builder", path: "/digital-presence/builder", icon: Layout },
  { label: "Brand", path: "/digital-presence/brand-studio", icon: Palette },
  { label: "Connected", path: "/digital-presence/connected-sites", icon: Link2 },
  { label: "CRO", path: "/digital-presence/cro", icon: Target },
  { label: "Commerce", path: "/digital-presence/ecommerce", icon: Store },
  { label: "Promos", path: "/digital-presence/promotions", icon: Megaphone },
  { label: "AI Team", path: "/digital-presence/ai-team", icon: Users },
  { label: "Radar", path: "/digital-presence/radar", icon: AlertTriangle },
  { label: "Freshness", path: "/digital-presence/freshness", icon: Clock },
  { label: "Launch", path: "/digital-presence/launch", icon: Rocket },
  { label: "Healing", path: "/digital-presence/self-healing", icon: Wrench },
  { label: "Analytics", path: "/digital-presence/analytics", icon: BarChart2 },
  { label: "Domains", path: "/digital-presence/domains", icon: Server },
  { label: "Time", path: "/digital-presence/time-machine", icon: History },
  { label: "App", path: "/digital-presence/app-studio", icon: Smartphone },
];

export default function DPOSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto">
      {dpoPages.map(p => {
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
