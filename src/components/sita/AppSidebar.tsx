import { memo } from "react";
import {
  Home, Briefcase, DollarSign, Headphones, FolderOpen, Settings, Shield, LogOut,
  LayoutDashboard, TrendingUp, Calendar, ListTodo, BarChart3,
  Grid3X3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { predictivePrefetch } from "@/lib/services/predictive-prefetch";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import logo from "@/assets/sita-logo.jpeg";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

// ── Domain color map — vibrant macOS-style with brand purple/gold ─
const domainColors: Record<string, { bg: string; ring: string }> = {
  "/home":           { bg: "from-violet-500 to-purple-600",   ring: "ring-violet-400/50" },
  "/pulse":          { bg: "from-amber-400 to-orange-500",    ring: "ring-amber-400/50" },
  "/business":       { bg: "from-blue-400 to-indigo-500",     ring: "ring-blue-400/50" },
  "/money":          { bg: "from-emerald-400 to-green-500",   ring: "ring-emerald-400/50" },
  "/concierge":      { bg: "from-purple-400 to-fuchsia-500",  ring: "ring-purple-400/50" },
  "/files":          { bg: "from-sky-400 to-blue-500",        ring: "ring-sky-400/50" },
  "/revenue-office": { bg: "from-yellow-400 to-amber-500",    ring: "ring-yellow-400/50" },
  "/boardroom":      { bg: "from-indigo-400 to-violet-500",   ring: "ring-indigo-400/50" },
  "/calendar":       { bg: "from-rose-400 to-pink-500",       ring: "ring-rose-400/50" },
  "/tasks":          { bg: "from-teal-400 to-cyan-500",       ring: "ring-teal-400/50" },
  "/settings":       { bg: "from-gray-400 to-slate-500",      ring: "ring-gray-400/50" },
  "/owner":          { bg: "from-red-400 to-rose-500",        ring: "ring-red-400/50" },
  "/app-store":      { bg: "from-violet-400 to-purple-500",   ring: "ring-violet-400/50" },
};

const getColors = (url: string) => domainColors[url] || { bg: "from-gray-500 to-gray-700", ring: "ring-gray-400/40" };

// ── Navigation data ──────────────────────────────────────────
const primaryNav = [
  { title: "Desktop",   url: "/home",      icon: LayoutDashboard },
  { title: "Daily Pulse", url: "/pulse",   icon: Home },
  { title: "Business",  url: "/business",  icon: Briefcase },
  { title: "Money",     url: "/money",     icon: DollarSign },
  { title: "Concierge", url: "/concierge", icon: Headphones },
  { title: "Files",     url: "/files",     icon: FolderOpen },
];

const favoritesNav = [
  { title: "Revenue",   url: "/revenue-office", icon: TrendingUp },
  { title: "Boardroom", url: "/boardroom",      icon: BarChart3 },
  { title: "Calendar",  url: "/calendar",       icon: Calendar },
  { title: "Tasks",     url: "/tasks",          icon: ListTodo },
];

const bottomNav = [
  { title: "Settings",     url: "/settings", icon: Settings },
  { title: "Control Room", url: "/owner",    icon: Shield },
];

// ── App Icon Item ────────────────────────────────────────────
function AppIconItem({ item, collapsed, active }: {
  item: { title: string; url: string; icon: React.ElementType };
  collapsed: boolean;
  active: boolean;
}) {
  const colors = getColors(item.url);
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} className="h-auto p-0 hover:bg-transparent active:bg-transparent">
        <NavLink
          to={item.url}
          end={item.url === "/"}
          data-prefetch-path={item.url}
          onMouseEnter={() => predictivePrefetch.onHoverStart(item.url)}
          onMouseLeave={() => predictivePrefetch.onHoverEnd(item.url)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all duration-200 group/app",
            collapsed && "justify-center px-0 py-2",
            active
              ? "bg-white/[0.06]"
              : "hover:bg-white/[0.04]"
          )}
          activeClassName=""
        >
          {/* App Icon Square */}
          <div
            className={cn(
              "relative flex items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-all duration-200",
              colors.bg,
              collapsed ? "h-9 w-9" : "h-8 w-8",
              active && `ring-2 ${colors.ring} scale-105`,
              "group-hover/app:scale-105 group-hover/app:shadow-xl"
            )}
          >
            <Icon className="h-[18px] w-[18px] text-white drop-shadow-sm" strokeWidth={1.8} />
          </div>

          {/* Label */}
          {!collapsed && (
            <span className={cn(
              "text-[13px] font-medium transition-colors",
              active ? "text-foreground" : "text-sidebar-foreground/80 group-hover/app:text-foreground"
            )}>
              {item.title}
            </span>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// ── Nav Group ────────────────────────────────────────────────
function AppNavGroup({ items, collapsed }: { items: typeof primaryNav; collapsed: boolean }) {
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <SidebarMenu className={cn(collapsed ? "items-center gap-1" : "gap-0.5")}>
      {items.map((item) => (
        <AppIconItem key={item.url} item={item} collapsed={collapsed} active={isActive(item.url)} />
      ))}
    </SidebarMenu>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────
export const AppSidebar = memo(function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const { isDemoMode } = useDataMode();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border/40 transition-[width] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
      style={{
        background: "hsl(var(--sidebar-background) / 0.85)",
        backdropFilter: "blur(32px) saturate(1.4)",
        WebkitBackdropFilter: "blur(32px) saturate(1.4)",
      }}
      data-testid="sidebar-nav"
      aria-label="Main navigation sidebar"
    >
      {/* Logo Header */}
      <SidebarHeader className="p-4 pb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={logo} alt="SITA OS" width={36} height={36} className="h-9 w-9 rounded-xl shadow-xs" />
            <div
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar ${
                isDemoMode ? "bg-amber-500" : "bg-emerald-500"
              }`}
              title={isDemoMode ? "Demo Mode" : "Live Mode"}
            />
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
        {/* Spaces */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50 mb-1">
              Spaces
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <AppNavGroup items={primaryNav} collapsed={collapsed} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Favorites */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50 mb-1 mt-1">
              Favorites
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <AppNavGroup items={favoritesNav} collapsed={collapsed} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* All Apps */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className={cn(collapsed ? "items-center" : "")}>
              <AppIconItem
                item={{ title: "All Apps", url: "/app-store", icon: Grid3X3 }}
                collapsed={collapsed}
                active={location.pathname.startsWith("/app-store")}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-2 pb-4 border-t border-sidebar-border/30 pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <AppNavGroup items={bottomNav} collapsed={collapsed} />
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <div className={cn("mt-2 px-1 flex items-center", collapsed ? "justify-center" : "gap-1")}>
            <button
              onClick={() => navigate("/profile")}
              className={cn(
                "flex items-center rounded-lg transition-all duration-200 hover:bg-white/[0.06] min-w-0",
                collapsed ? "h-9 w-9 justify-center" : "flex-1 gap-3 px-2 py-2"
              )}
              title="My Profile"
            >
              <div className={cn(
                "flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-primary text-white font-bold shrink-0 shadow-md",
                collapsed ? "h-8 w-8 text-[10px]" : "h-8 w-8 text-[10px]"
              )}>
                {initials}
              </div>
              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
            </button>
            {!collapsed && (
              <button
                onClick={signOut}
                data-testid="sign-out-btn"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.8} />
              </button>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
});
