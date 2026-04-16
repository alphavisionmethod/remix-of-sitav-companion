// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Primary Navigation Bar
// Horizontal top-bar with 7 canonical domain tabs + global actions
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { AdminDomain } from "./AdminDomainNav";
import { Button } from "@/components/ui/button";
import {
  Home,
  Brain,
  Shield,
  Rocket,
  ShieldCheck,
  Server,
  LifeBuoy,
  Search,
  Bell,
} from "lucide-react";

interface DomainTab {
  id: AdminDomain;
  label: string;
  icon: React.ElementType;
  path: string;
}

const DOMAIN_TABS: DomainTab[] = [
  { id: "home", label: "Home", icon: Home, path: "/admin/dashboard" },
  { id: "intelligence", label: "Intelligence & AI", icon: Brain, path: "/admin/ai-gateway/providers" },
  { id: "governance", label: "Governance", icon: Shield, path: "/admin/architecture" },
  { id: "launch", label: "Launch", icon: Rocket, path: "/admin/launch-readiness" },
  { id: "security", label: "Security", icon: ShieldCheck, path: "/admin/security" },
  { id: "operations", label: "Operations", icon: Server, path: "/admin/fleet-health" },
  { id: "support", label: "Support", icon: LifeBuoy, path: "/admin/mc/support" },
  { id: "strategic", label: "Strategic", icon: Shield, path: "/admin/founder/command" },
];

interface AdminPrimaryNavProps {
  activeDomain: AdminDomain;
}

export function AdminPrimaryNav({ activeDomain }: AdminPrimaryNavProps) {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 h-11">
        {/* Left: SITA admin logo + domain tabs */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold tracking-wider text-primary mr-4 select-none">
            SITA <span className="text-muted-foreground font-normal">Control Plane</span>
          </span>

          {DOMAIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeDomain === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: global actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Search className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Bell className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
