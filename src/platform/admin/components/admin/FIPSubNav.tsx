import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Inbox, FileText, Users, Layers, Shield, Zap, Lock,
  Brain, Activity, Rocket, Database, Target, Archive, Cpu
} from "lucide-react";

const fipPages = [
  { label: "Intake", path: "/admin/fip/intake", icon: Inbox },
  { label: "Spec Studio", path: "/admin/fip/spec-studio", icon: FileText },
  { label: "Owners", path: "/admin/fip/owner-boundary", icon: Users },
  { label: "Capabilities", path: "/admin/fip/capability-registry", icon: Layers },
  { label: "Compliance", path: "/admin/fip/compliance", icon: Shield },
  { label: "Execution", path: "/admin/fip/execution-paths", icon: Zap },
  { label: "Policy/Trust", path: "/admin/fip/policy-trust", icon: Lock },
  { label: "Memory/Graph", path: "/admin/fip/memory-graph", icon: Brain },
  { label: "Observability", path: "/admin/fip/observability", icon: Activity },
  { label: "Rollout", path: "/admin/fip/rollout", icon: Rocket },
  { label: "Gen Truth", path: "/admin/fip/generated-truth", icon: Database },
  { label: "Readiness", path: "/admin/fip/readiness", icon: Target },
  { label: "Deprecation", path: "/admin/fip/deprecation", icon: Archive },
  { label: "Builder", path: "/admin/fip/builder", icon: Cpu },
];

export default function FIPSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto mb-4">
      {fipPages.map(p => {
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
