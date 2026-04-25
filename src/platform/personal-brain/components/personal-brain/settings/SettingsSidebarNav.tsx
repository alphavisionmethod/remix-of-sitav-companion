// ═══════════════════════════════════════════════════════════════
// Personal Brain — Settings sidebar navigation
// ═══════════════════════════════════════════════════════════════

import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  UserRound,
  Brain,
  SlidersHorizontal,
  Briefcase,
  FileText,
  Mic,
  Bell,
  ShieldAlert,
  Database,
  FlaskConical,
  Sparkles,
  Clock,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Brain;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: "/personal-brain/settings", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/personal-brain/settings/profile", label: "Profile", icon: UserRound },
  { to: "/personal-brain/settings/memory", label: "Memory & Learning", icon: Brain },
  { to: "/personal-brain/settings/modes", label: "Modes & Behavior", icon: SlidersHorizontal },
  { to: "/personal-brain/settings/workspaces", label: "Workspaces", icon: Briefcase },
  { to: "/personal-brain/settings/files", label: "Files & Knowledge", icon: FileText },
  { to: "/personal-brain/voice-settings", label: "Voice & Audio", icon: Mic },
  { to: "/personal-brain/settings/notifications", label: "Notifications", icon: Bell },
  { to: "/personal-brain/settings/security", label: "Security & Privacy", icon: ShieldAlert },
  { to: "/personal-brain/settings/data", label: "Data & Controls", icon: Database },
  { to: "/personal-brain/settings/labs", label: "Advanced / Labs", icon: FlaskConical },
];

const LEGACY: NavItem[] = [
  { to: "/personal-brain/settings/learning", label: "Learning preset", icon: Sparkles },
  { to: "/personal-brain/settings/retention", label: "Retention preset", icon: Clock },
];

export function SettingsSidebarNav() {
  return (
    <nav
      data-testid="brain-settings-sidebar"
      aria-label="Brain settings"
      className="space-y-0.5 lg:sticky lg:top-4"
    >
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-foreground font-medium"
                  : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        );
      })}
      <div className="pt-3 mt-3 border-t border-border/40">
        <p className="px-2.5 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          Quick presets
        </p>
        {LEGACY.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                  isActive
                    ? "bg-primary/10 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default SettingsSidebarNav;
