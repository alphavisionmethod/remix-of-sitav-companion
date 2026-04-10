import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Plug, Database, Users, RefreshCw, Activity,
  Presentation, Shield
} from "lucide-react";

const cnPages = [
  { label: "Overview", path: "/admin/connectors/overview", icon: Plug },
  { label: "Registry", path: "/admin/connectors/registry", icon: Database },
  { label: "Accounts", path: "/admin/connectors/accounts", icon: Users },
  { label: "Sync Truth", path: "/admin/connectors/sync", icon: RefreshCw },
  { label: "Health", path: "/admin/connectors/health", icon: Activity },
  { label: "Demo Review", path: "/admin/connectors/demo", icon: Presentation },
  { label: "Launch Gate", path: "/admin/connectors/launch-gate", icon: Shield },
];

export default function CNSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto mb-4">
      {cnPages.map(p => {
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
