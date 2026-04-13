import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Crown, Database, GitBranch, Copy, Target, Layers
} from "lucide-react";

const servPages = [
  { label: "Ownership", path: "/admin/services/ownership", icon: Crown },
  { label: "Domains", path: "/admin/services/domains", icon: Database },
  { label: "Route Trace", path: "/admin/services/route-trace", icon: GitBranch },
  { label: "Duplication", path: "/admin/services/duplication", icon: Copy },
  { label: "Canonical Actions", path: "/admin/services/canonical-actions", icon: Target },
  { label: "Flagship Trace", path: "/admin/services/flagship-trace", icon: Layers },
];

export default function SERVSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto mb-4">
      {servPages.map(p => {
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
