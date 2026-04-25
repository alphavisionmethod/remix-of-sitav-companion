import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Workflow, Layout, Activity, FlaskConical, Receipt, ShieldCheck, Zap
} from "lucide-react";

const automationPages = [
  { label: "Office", path: "/revenue-office/automation", icon: Workflow },
  { label: "Builder", path: "/revenue-office/automation/builder", icon: Zap },
  { label: "Templates", path: "/revenue-office/automation/templates", icon: Layout },
  { label: "Sim Lab", path: "/revenue-office/automation/simlab", icon: FlaskConical },
  { label: "Health", path: "/revenue-office/automation/health", icon: Activity },
  { label: "Receipts", path: "/revenue-office/automation/receipts", icon: Receipt },
  { label: "Policies", path: "/revenue-office/automation/policy", icon: ShieldCheck },
];

export default function AutomationSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto">
      {automationPages.map(p => {
        const active = location.pathname === p.path;
        return (
          <button
            key={p.path}
            onClick={() => navigate(p.path)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
              active
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <p.icon className="h-3.5 w-3.5" />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
