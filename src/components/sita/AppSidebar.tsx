import { Home, Briefcase, DollarSign, Headphones, Workflow, Receipt, BarChart3, FolderOpen, Settings, Shield, LogOut,
  Brain, Sparkles, Inbox, Activity, Zap, Eye, Server, CheckCircle, Users, FileText, Table2, Presentation, Package, Heart, ChevronRight, Globe, Sliders, Key, ScrollText, CreditCard, Cpu, Gauge, RotateCcw, Target, GitBranch, MessageSquare, Bell, Mail, Lock, Image, Cloud, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useUserPreferences, showBusinessNav, showConciergeNav } from "@/hooks/use-user-preferences";
import logo from "@/assets/logo.jpeg";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

const primaryNav = [
  { title: "Daily Pulse", url: "/", icon: Home },
  { title: "Brain", url: "/personal-brain", icon: Brain },
  { title: "Life Dashboard", url: "/life", icon: Heart },
  { title: "Business", url: "/business", icon: Briefcase },
  { title: "Money", url: "/money", icon: DollarSign },
  { title: "Concierge", url: "/concierge", icon: Headphones },
  { title: "Files", url: "/files", icon: FolderOpen },
];

const intelligenceNav = [
  { title: "Advisors", url: "/advisors", icon: Users },
  { title: "Outcomes", url: "/outcomes", icon: Target },
  { title: "Spillovers", url: "/spillovers", icon: GitBranch },
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "Activity", url: "/activity", icon: Activity },
  { title: "Opportunities", url: "/opportunities", icon: Sparkles },
  { title: "Approvals", url: "/approvals", icon: CheckCircle },
  { title: "Integrations", url: "/integrations", icon: Globe },
  { title: "Digital Twins", url: "/digital-twins", icon: Cpu },
  { title: "Scenario Lab", url: "/scenario-lab", icon: Sliders },
  { title: "AI Economics", url: "/ai-economics", icon: Gauge },
  { title: "Recovered Value", url: "/recovered-value", icon: CreditCard },
];

const workspaceNav = [
  { title: "Docs", url: "/docs", icon: FileText },
  { title: "Sheets", url: "/sheets", icon: Table2 },
  { title: "Slides", url: "/slides", icon: Presentation },
];

const systemNav = [
  { title: "Workflows", url: "/workflows", icon: Workflow },
  { title: "Proof", url: "/proof", icon: Receipt },
  { title: "Boardroom", url: "/boardroom", icon: BarChart3 },
];

const controlNav = [
  { title: "Personalization", url: "/personalization", icon: Brain },
  { title: "Memory", url: "/memory", icon: Eye },
  { title: "Automation", url: "/automation", icon: Zap },
  { title: "Agent Activity", url: "/agent-activity", icon: Activity },
  { title: "Communications", url: "/communications", icon: MessageSquare },
  { title: "Notifications", url: "/notifications/settings", icon: Bell },
  { title: "System", url: "/system", icon: Shield },
];

const appsNav = [
  { title: "Email", url: "/apps/email", icon: Mail },
  { title: "Messenger", url: "/apps/messenger", icon: MessageSquare },
  { title: "Vault", url: "/apps/vault", icon: Lock },
  { title: "Health", url: "/apps/health", icon: Heart },
  { title: "Gallery", url: "/apps/gallery", icon: Image },
  { title: "Weather & News", url: "/apps/weather-news", icon: Cloud },
];

const bottomNav = [
  { title: "Admin", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "AI Tokens", url: "/admin/ai-tokens", icon: Gauge },
  { title: "System Mgmt", url: "/admin/system", icon: Server },
  { title: "Pack Store", url: "/store", icon: Package },
  { title: "Enterprise", url: "/admin/enterprise", icon: Globe },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Control Room", url: "/owner", icon: Shield },
];

const ownerSubNav = [
  { title: "Mission Control", url: "/mission-control", icon: Gauge },
  { title: "Leases", url: "/owner/leases", icon: Key },
  { title: "Constitution", url: "/owner/constitution", icon: ScrollText },
  { title: "Pricing", url: "/owner/pricing", icon: CreditCard },
  { title: "Packs", url: "/owner/packs", icon: Package },
  { title: "Advisors", url: "/owner/advisors", icon: Cpu },
  { title: "Policy Simulator", url: "/mission/policies/simulate", icon: Sliders },
  { title: "Workflow Replay", url: "/mission/workflows/latest/replay", icon: RotateCcw },
  { title: "Observability", url: "/observability", icon: Activity },
  { title: "Users", url: "/users", icon: Users },
];

const NavItems = ({ items, collapsed }: { items: typeof primaryNav; collapsed: boolean }) => {
  const location = useLocation();
  const isActive = (path: string) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <SidebarMenu>
      {items.map((item) => {
        const active = isActive(item.url);
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={active}>
              <NavLink
                to={item.url}
                end={item.url === "/"}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
                  active
                    ? "bg-primary/8 text-foreground shadow-xs border border-primary/10"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                activeClassName=""
              >
                <item.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} strokeWidth={1.8} />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};

const CollapsibleNavGroup = ({ items, label, collapsed, defaultOpen = false }: {
  items: typeof primaryNav; label: string; collapsed: boolean; defaultOpen?: boolean;
}) => {
  const location = useLocation();
  const hasActive = items.some(item => item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url));
  const [open, setOpen] = useState(defaultOpen || hasActive);

  if (collapsed) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <NavItems items={items} collapsed={collapsed} />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarGroup>
        <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-1.5 group">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
            {label}
          </span>
          <ChevronRight className={cn(
            "h-3 w-3 text-muted-foreground/40 transition-transform duration-200",
            open && "rotate-90"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <NavItems items={items} collapsed={collapsed} />
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const { isDemoMode } = useDataMode();
  const { preferences } = useUserPreferences();
  const role = preferences.role;
  const location = useLocation();
  const isOwnerArea = location.pathname.startsWith("/owner");

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const filteredPrimary = primaryNav.filter(item => {
    if (item.url === "/business" && !showBusinessNav(role)) return false;
    if (item.url === "/concierge" && !showConciergeNav(role)) return false;
    return true;
  });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border glass-panel">
      <SidebarHeader className="p-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={logo} alt="SITA OS" className="h-9 w-9 rounded-xl shadow-xs" />
            <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar ${isDemoMode ? "bg-amber-500" : "bg-emerald-500"}`} title={isDemoMode ? "Demo Mode" : "Live Mode"} />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display text-[15px] font-bold tracking-tight gradient-sita-text">SITA</h1>
              <p className={`text-[9px] tracking-[0.2em] uppercase font-semibold ${isDemoMode ? "text-amber-500" : "text-emerald-500"}`}>
                {isDemoMode ? "Demo" : "Live"}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 scrollbar-thin">
        {/* Primary — always visible */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50 mt-1">
              Spaces
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <NavItems items={filteredPrimary} collapsed={collapsed} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collapsible groups */}
        <CollapsibleNavGroup items={intelligenceNav} label="Intelligence" collapsed={collapsed} />
        <CollapsibleNavGroup items={workspaceNav} label="Workspace" collapsed={collapsed} />
        <CollapsibleNavGroup items={systemNav} label="System" collapsed={collapsed} />
        <CollapsibleNavGroup items={controlNav} label="Control" collapsed={collapsed} />
        <CollapsibleNavGroup items={appsNav} label="Apps" collapsed={collapsed} />
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4 border-t border-sidebar-border pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <NavItems items={bottomNav} collapsed={collapsed} />
          </SidebarGroupContent>
        </SidebarGroup>
        {isOwnerArea && !collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
              Owner Controls
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavItems items={ownerSubNav} collapsed={collapsed} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {user && (
          <div className="mt-2 px-1">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
            >
              {collapsed ? (
                <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              ) : (
                <>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                </>
              )}
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
