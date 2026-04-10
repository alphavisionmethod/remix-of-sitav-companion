import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Database, Activity, Brain, Shield, Layers, GitBranch,
  Play, Server, AlertTriangle, RefreshCw
} from "lucide-react";

const cpsPages = [
  { label: "Overview", path: "/admin/core-persistence", icon: Database },
  { label: "Events", path: "/admin/event-stream", icon: Activity },
  { label: "Memory", path: "/admin/memory-continuity", icon: Brain },
  { label: "Policy", path: "/admin/policy-ledger", icon: Shield },
  { label: "Intelligence", path: "/admin/intelligence-library", icon: Layers },
  { label: "Lineage", path: "/admin/action-lineage", icon: GitBranch },
  { label: "Replay", path: "/admin/replay-console", icon: Play },
  { label: "Migration", path: "/admin/service-migration", icon: Server },
  { label: "Drift", path: "/admin/persistence-drift", icon: AlertTriangle },
  { label: "Continuity", path: "/admin/runtime-continuity", icon: RefreshCw },
];

export default function CPSSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto mb-4">
      {cpsPages.map(p => {
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
