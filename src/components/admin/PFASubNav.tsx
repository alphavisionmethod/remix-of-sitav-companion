import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  FolderOpen, LayoutGrid, Key, ShieldCheck, Lock,
  ArrowUpRight, Activity, Network, Rocket, Globe,
  ArrowRight
} from "lucide-react";

const pfaPages = [
  { label: "Families", path: "/admin/pfa/families", icon: FolderOpen },
  { label: "Capabilities", path: "/admin/pfa/capabilities", icon: LayoutGrid },
  { label: "OAuth Clients", path: "/admin/pfa/oauth-clients", icon: Key },
  { label: "Consent", path: "/admin/pfa/consent", icon: ShieldCheck },
  { label: "Scope Policy", path: "/admin/pfa/scope-policy", icon: Lock },
  { label: "Upgrades", path: "/admin/pfa/upgrades", icon: ArrowUpRight },
  { label: "Health Drift", path: "/admin/pfa/health-drift", icon: Activity },
  { label: "Account Graph", path: "/admin/pfa/account-graph", icon: Network },
  { label: "Launch Honesty", path: "/admin/pfa/launch-honesty", icon: Rocket },
  { label: "Google", path: "/admin/pfa/google", icon: Globe },
];

const crossLinks = [
  { label: "Connectors", path: "/admin/connectors/overview", icon: Globe },
  { label: "DRS Reality", path: "/admin/drs/overview", icon: Activity },
];

export default function PFASubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="space-y-1 mb-4">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto">
        {pfaPages.map(p => {
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
