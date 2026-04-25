import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Brain, Database, GitBranch, Shield, Activity, DollarSign,
  TrendingUp, Layers, Receipt, RotateCcw, Cpu, Lock
} from "lucide-react";

const sagPages = [
  { label: "Overview", path: "/admin/sag/overview", icon: Brain },
  { label: "Models", path: "/admin/sag/models", icon: Database },
  { label: "Routing", path: "/admin/sag/routing", icon: GitBranch },
  { label: "Health", path: "/admin/sag/health", icon: Activity },
  { label: "Prompts", path: "/admin/sag/prompts", icon: Layers },
  { label: "Economics", path: "/admin/sag/economics", icon: DollarSign },
  { label: "Cost Lab", path: "/admin/sag/cost-confidence", icon: TrendingUp },
  { label: "Multi-Stage", path: "/admin/sag/multi-stage", icon: GitBranch },
  { label: "Receipts", path: "/admin/sag/receipts", icon: Receipt },
  { label: "Fallback", path: "/admin/sag/fallback", icon: RotateCcw },
  { label: "Builder", path: "/admin/sag/builder", icon: Cpu },
  { label: "Compliance", path: "/admin/sag/compliance", icon: Shield },
];

export default function SAGSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto mb-4">
      {sagPages.map(p => {
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
