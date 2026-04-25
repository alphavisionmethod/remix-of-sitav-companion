import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Brain, ListChecks, ArrowRight, Layers, CheckCircle2
} from "lucide-react";

const rexPages = [
  { label: "Intelligence", path: "/admin/rex/intelligence", icon: Brain },
  { label: "Approval Queue", path: "/admin/rex/approval-queue", icon: ListChecks },
  { label: "Execution", path: "/admin/rex/execution", icon: ArrowRight },
  { label: "Programs", path: "/admin/rex/programs", icon: Layers },
  { label: "Outcomes", path: "/admin/rex/outcomes", icon: CheckCircle2 },
];

export default function REXSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto mb-4">
      {rexPages.map(p => {
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
