import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Terminal, Activity, Cloud, HardDrive, Users, Smartphone,
  Shield, Layers, Rocket, Brain, AlertTriangle, ScrollText, Flag, DollarSign,
  Wrench, HeadphonesIcon, BookOpen, ChevronDown, ChevronRight, PanelLeftClose,
  PanelLeft, Settings, Sparkles, SlidersHorizontal, ShieldAlert, FileText,
  Zap, Monitor, Radio, RotateCcw, Network
} from "lucide-react";
import { GlossaryDrawer } from "./GlossaryDrawer";
import { useState as useReactState } from "react";
import { LearningYouPanel } from "./LearningYouPanel";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number | string;
  badgeVariant?: "default" | "destructive" | "warning";
}

interface NavGroup {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    defaultOpen: true,
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
      { label: "Command Center", icon: Terminal, path: "/admin/founder/command" },
      { label: "System Health", icon: Activity, path: "/admin/mc/system-health" },
    ],
  },
  {
    title: "Infrastructure",
    defaultOpen: true,
    items: [
      { label: "Sync Cloud", icon: Cloud, path: "/admin/mc/sync-cloud" },
      { label: "Communication Hub", icon: Network, path: "/admin/communication-hub" },
      { label: "Storage", icon: HardDrive, path: "/admin/mc/storage" },
      { label: "Devices", icon: Smartphone, path: "/admin/mc/devices" },
      { label: "Workspaces", icon: Layers, path: "/admin/mc/workspaces" },
    ],
  },
  {
    title: "People & Trust",
    items: [
      { label: "Users", icon: Users, path: "/admin/mc/users" },
      { label: "Trust & Security", icon: Shield, path: "/admin/mc/trust-security" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "AI Control", icon: Brain, path: "/admin/mc/ai-control" },
      { label: "Costs & Budgets", icon: DollarSign, path: "/admin/mc/costs" },
      { label: "Policies & Flags", icon: Flag, path: "/admin/mc/policies" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Releases", icon: Rocket, path: "/admin/mc/releases" },
      { label: "Incidents", icon: AlertTriangle, path: "/admin/mc/incidents", badge: 0 },
      { label: "Jobs & Maintenance", icon: Wrench, path: "/admin/mc/jobs" },
      { label: "Logs & Audit", icon: ScrollText, path: "/admin/mc/logs" },
    ],
  },
  {
    title: "Support & Knowledge",
    items: [
      { label: "Support", icon: HeadphonesIcon, path: "/admin/mc/support" },
      { label: "Knowledge Base", icon: BookOpen, path: "/admin/mc/knowledge" },
    ],
  },
  {
    title: "Authority & Control",
    items: [
      { label: "Authority Matrix", icon: Shield, path: "/admin/mc/authority-matrix" },
      { label: "Control Receipts", icon: FileText, path: "/admin/mc/control-receipts" },
      { label: "Emergency Authority", icon: ShieldAlert, path: "/admin/mc/emergency" },
      { label: "Platform Adaptation", icon: Zap, path: "/admin/mc/platform-adaptation" },
      { label: "State Authority Map", icon: Layers, path: "/admin/mc/state-authority" },
      { label: "Data Retention", icon: ScrollText, path: "/admin/data-retention" },
    ],
  },
  {
    title: "Architecture Governance",
    items: [
      { label: "Dashboard", icon: Network, path: "/admin/mc/architecture" },
      { label: "Feature Ownership", icon: Layers, path: "/admin/mc/feature-ownership" },
      { label: "Command Routing", icon: Radio, path: "/admin/mc/command-routing" },
      { label: "Approval Flow", icon: ShieldAlert, path: "/admin/mc/approval-flow" },
      { label: "Failure & Recovery", icon: RotateCcw, path: "/admin/mc/failure-recovery" },
      { label: "Event Routing", icon: Activity, path: "/admin/mc/event-routing" },
      { label: "Architecture Tests", icon: Shield, path: "/admin/mc/architecture-tests" },
    ],
  },
];

export function FounderSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [prefsOpen, setPrefsOpen] = useReactState(false);
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV_GROUPS.forEach(g => { init[g.title] = g.defaultOpen ?? false; });
    // Auto-open the group containing the current path
    NAV_GROUPS.forEach(g => {
      if (g.items.some(item => location.pathname.startsWith(item.path))) {
        init[g.title] = true;
      }
    });
    return init;
  });

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  if (collapsed) {
    return (
      <div className="w-14 border-r border-border/30 bg-card/30 backdrop-blur-xl flex flex-col items-center py-3 gap-1 shrink-0">
        <button onClick={onToggle} className="p-2 hover:bg-muted/40 rounded-lg mb-2 transition-colors">
          <PanelLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        {NAV_GROUPS.flatMap(g => g.items).slice(0, 12).map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "p-2 rounded-lg transition-colors relative group",
              isActive(item.path) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            )}
            title={item.label}
          >
            <item.icon className="h-4 w-4" />
            {item.badge && Number(item.badge) > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-destructive text-[8px] text-destructive-foreground flex items-center justify-center font-bold">{item.badge}</span>
            )}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="w-56 border-r border-border/30 bg-card/30 backdrop-blur-xl flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-3 border-b border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground tracking-tight">Control Center</span>
        </div>
        <button onClick={onToggle} className="p-1 hover:bg-muted/40 rounded transition-colors">
          <PanelLeftClose className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Environment Badge */}
      <div className="px-3 py-2 border-b border-border/10">
        <Badge variant="outline" className="text-[9px] h-4 w-full justify-center bg-primary/5 text-primary border-primary/20">
          Production Environment
        </Badge>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto py-1 space-y-0.5">
        {NAV_GROUPS.map(group => (
          <div key={group.title}>
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{group.title}</span>
              {openGroups[group.title] ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            {openGroups[group.title] && (
              <div className="space-y-0.5 pb-1">
                {group.items.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "mx-1.5 px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all",
                      isActive(item.path)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && Number(item.badge) > 0 && (
                      <Badge variant="destructive" className="text-[8px] h-4 px-1.5 min-w-0">{item.badge}</Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border/20 space-y-0.5">
        <Link
          to="/admin/system"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Platform Settings</span>
        </Link>
        <button
          onClick={() => setPrefsOpen(true)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Preferences</span>
        </button>
        <GlossaryDrawer />
        <LearningYouPanel open={prefsOpen} onOpenChange={setPrefsOpen} />
      </div>
    </div>
  );
}
