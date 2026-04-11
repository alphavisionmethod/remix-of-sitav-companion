import { memo, useState } from "react";
import {
  Home, Briefcase, DollarSign, Headphones, FolderOpen, Settings, Shield, LogOut,
  LayoutDashboard, TrendingUp, Calendar, ListTodo, BarChart3, Brain,
  ChevronRight, Sparkles, Grid3X3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import logo from "@/assets/logo.webp";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

// ── Primary Navigation (6 items max) ─────────────────────────
const primaryNav = [
  { title: "Desktop", url: "/home", icon: LayoutDashboard },
  { title: "Daily Pulse", url: "/pulse", icon: Home },
  { title: "Business", url: "/business", icon: Briefcase },
  { title: "Money", url: "/money", icon: DollarSign },
  { title: "Concierge", url: "/concierge", icon: Headphones },
  { title: "Files", url: "/files", icon: FolderOpen },
];

// ── Favorites (user-pinnable defaults) ───────────────────────
const favoritesNav = [
  { title: "Revenue Office", url: "/revenue-office", icon: TrendingUp },
  { title: "Boardroom", url: "/boardroom", icon: BarChart3 },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
];

// ── Bottom utilities ─────────────────────────────────────────
const bottomNav = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Control Room", url: "/owner", icon: Shield },
];

const NavItems = ({ items, collapsed }: { items: typeof primaryNav; collapsed: boolean }) => {
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

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
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-foreground border border-primary/12"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
                activeClassName=""
              >
                <item.icon
                  className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")}
                  strokeWidth={1.8}
                />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};

export const AppSidebar = memo(function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const { isDemoMode } = useDataMode();
  const navigate = useNavigate();

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
      <SidebarHeader className="p-4 pb-6">
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
              <h1 className="font-display text-[15px] font-bold tracking-tight gradient-sita-text">
                SITA
              </h1>
              <p
                className={`text-[9px] tracking-[0.2em] uppercase font-semibold ${
                  isDemoMode ? "text-amber-500" : "text-emerald-500"
                }`}
              >
                {isDemoMode ? "Demo" : "Live"}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 scrollbar-thin">
        {/* Primary */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50 mt-1">
              Spaces
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <NavItems items={primaryNav} collapsed={collapsed} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Favorites */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50 mt-2">
              Favorites
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <NavItems items={favoritesNav} collapsed={collapsed} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* All Apps link */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/app-store"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground/60 hover:text-foreground hover:bg-sidebar-accent/40 transition-all duration-200"
                    activeClassName=""
                  >
                    <Grid3X3 className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                    {!collapsed && <span>All Apps</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4 border-t border-sidebar-border pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <NavItems items={bottomNav} collapsed={collapsed} />
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <div className="mt-2 px-1 flex items-center gap-1">
            <button
              onClick={() => navigate("/profile")}
              className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/60 hover:text-foreground min-w-0"
              title="My Profile"
            >
              {collapsed ? (
                <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary shrink-0">
                  {initials}
                </div>
              ) : (
                <>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                </>
              )}
            </button>
            <button
              onClick={signOut}
              data-testid="sign-out-btn"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
});
