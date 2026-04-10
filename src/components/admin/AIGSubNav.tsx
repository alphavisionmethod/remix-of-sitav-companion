import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Server, Database, GitBranch, DollarSign, Receipt,
  Target, Eye, AlertTriangle, Shield
} from "lucide-react";

const aigPages = [
  { label: "Providers", path: "/admin/aig/providers", icon: Server },
  { label: "Models", path: "/admin/aig/models", icon: Database },
  { label: "Routing", path: "/admin/aig/routing", icon: GitBranch },
  { label: "Budget", path: "/admin/aig/budget", icon: DollarSign },
  { label: "Usage Ledger", path: "/admin/aig/usage-ledger", icon: Receipt },
  { label: "Receipts/Traces", path: "/admin/aig/receipts", icon: Eye },
  { label: "Launch Truth", path: "/admin/aig/launch-truth", icon: Target },
  { label: "Launch Detail", path: "/admin/aig/launch-truth-detail", icon: Eye },
  { label: "Degraded", path: "/admin/aig/degraded", icon: AlertTriangle },
  { label: "Verification", path: "/admin/aig/runtime-verification", icon: Shield },
];

export default function AIGSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto mb-4">
      {aigPages.map(p => {
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
