import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Target, Eye, BarChart3 } from "lucide-react";

const flPages = [
  { label: "Executive Board", path: "/admin/flagship/executive", icon: Target },
  { label: "Loop Detail", path: "/admin/flagship/detail", icon: Eye },
  { label: "Prioritization", path: "/admin/flagship/prioritization", icon: BarChart3 },
];

export default function FLSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto mb-4">
      {flPages.map(p => {
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
