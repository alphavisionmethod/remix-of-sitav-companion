import { memo, useState, useEffect, useCallback } from "react";
import {
  Home, Briefcase, DollarSign, Headphones, FolderOpen, Settings, Shield, LogOut,
  LayoutDashboard, TrendingUp, Calendar, ListTodo, BarChart3,
  Grid3X3, ChevronRight, Clock, Users, FileText, Receipt, CreditCard, PiggyBank,
  ShoppingCart, GraduationCap, Plane, Wrench, Target, Zap, Brain
} from "lucide-react";
import { getRunningApps, restoreAppState } from "@/hooks/useAppStatePersistence";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { predictivePrefetch } from "@/lib/services/predictive-prefetch";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import logo from "@/assets/sita-logo.jpeg";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarContextMenu } from "./shell/SidebarContextMenu";


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
  "/intelligence":   { bg: "from-cyan-400 to-blue-500",       ring: "ring-cyan-400/50" },
};

const getColors = (url: string) => domainColors[url] || { bg: "from-gray-500 to-gray-700", ring: "ring-gray-400/40" };

// ── Sub-navigation routes ────────────────────────────────────
interface SubRoute {
  title: string;
  url: string;
  icon: React.ElementType;
}

const domainSubRoutes: Record<string, SubRoute[]> = {
  "/business": [
    { title: "Overview", url: "/business", icon: LayoutDashboard },
    { title: "Leads", url: "/business/leads", icon: Target },
    { title: "Customers", url: "/business/customers", icon: Users },
    { title: "Invoices", url: "/business/invoices", icon: Receipt },
    { title: "Revenue", url: "/business/revenue-autopilot", icon: TrendingUp },
    { title: "Boardroom", url: "/business/boardroom", icon: BarChart3 },
  ],
  "/money": [
    { title: "Overview", url: "/money", icon: LayoutDashboard },
    { title: "Bills", url: "/money/bills", icon: FileText },
    { title: "Subscriptions", url: "/money/subscriptions", icon: CreditCard },
    { title: "Reserves", url: "/money/reserves", icon: PiggyBank },
    { title: "Net Worth", url: "/money/net-worth", icon: TrendingUp },
    { title: "Budgets", url: "/money/budgets", icon: Receipt },
  ],
  "/concierge": [
    { title: "Overview", url: "/concierge", icon: LayoutDashboard },
    { title: "Tasks", url: "/concierge/tasks", icon: ListTodo },
    { title: "Calendar", url: "/concierge/calendar", icon: Calendar },
    { title: "School", url: "/concierge/school", icon: GraduationCap },
    { title: "Travel", url: "/concierge/travel", icon: Plane },
    { title: "Providers", url: "/concierge/providers", icon: Wrench },
  ],
};

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
  { title: "Revenue",      url: "/revenue-office", icon: TrendingUp },
  { title: "Boardroom",    url: "/boardroom",      icon: BarChart3 },
  { title: "Intelligence", url: "/intelligence",   icon: Brain },
  { title: "Calendar",     url: "/calendar",       icon: Calendar },
  { title: "Tasks",        url: "/tasks",          icon: ListTodo },
];

const bottomNav = [
  { title: "Settings",     url: "/settings", icon: Settings },
  { title: "Control Room", url: "/owner",    icon: Shield },
];

// ── Recents Tracker ──────────────────────────────────────────
const MAX_RECENTS = 5;
function useRecents() {
  const [recents, setRecents] = useState<{ title: string; url: string }[]>([]);
  const location = useLocation();

  useEffect(() => {
    const allItems = [...primaryNav, ...favoritesNav, ...bottomNav];
    const match = allItems.find(i => location.pathname.startsWith(i.url) && i.url !== "/home");
    if (match) {
      setRecents(prev => {
        const filtered = prev.filter(r => r.url !== match.url);
        return [{ title: match.title, url: match.url }, ...filtered].slice(0, MAX_RECENTS);
      });
    }
  }, [location.pathname]);

  return recents;
}

// ── App Icon Item ────────────────────────────────────────────
// Domain ID map for running state
const DOMAIN_MAP: Record<string, string> = {
  "/business": "business",
  "/money": "finance",
  "/concierge": "concierge",
  "/files": "files",
};

function AppIconItem({ item, collapsed, active, hasSubNav, expanded, onToggleExpand, onContextMenu }: {
  item: { title: string; url: string; icon: React.ElementType };
  collapsed: boolean;
  active: boolean;
  hasSubNav?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}) {
  const colors = getColors(item.url);
  const Icon = item.icon;
  const domainKey = DOMAIN_MAP[item.url];
  const isRunning = domainKey ? getRunningApps().has(domainKey) : false;
  const savedState = domainKey ? restoreAppState(domainKey) : null;
  const lastPage = savedState?.activePage && savedState.activePage !== "overview" ? savedState.activePage : null;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} className="h-auto p-0 hover:bg-transparent active:bg-transparent">
        <NavLink
          to={item.url}
          end={item.url === "/"}
          data-prefetch-path={item.url}
          onMouseEnter={() => predictivePrefetch.onHoverStart(item.url)}
          onMouseLeave={() => predictivePrefetch.onHoverEnd(item.url)}
          onContextMenu={onContextMenu}
          className={cn(
            "flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all duration-200 group/app",
            collapsed && "justify-center px-0 py-2",
            active
              ? "bg-white/[0.06]"
              : "hover:bg-white/[0.04]"
          )}
          activeClassName=""
          title={domainKey && lastPage ? `${item.title} — Last: ${lastPage}` : item.title}
        >
          {/* Animated active pill indicator */}
          {active && !collapsed && (
            <motion.div
              layoutId="sidebar-active-pill"
              className="absolute left-0 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-[hsl(265_55%_60%)] to-[hsl(280_50%_50%)]"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}

          {/* App Icon Square */}
          <div className="relative">
            <motion.div
              animate={active ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.18 }}
              className={cn(
                "relative flex items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-all duration-200",
                colors.bg,
                collapsed ? "h-9 w-9" : "h-8 w-8",
                active && `ring-2 ${colors.ring} scale-105`,
                "group-hover/app:scale-105 group-hover/app:shadow-xl"
              )}
            >
              <Icon className="h-[18px] w-[18px] text-white drop-shadow-sm" strokeWidth={1.8} />
            </motion.div>
            {/* Running indicator dot */}
            {isRunning && !active && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[hsl(152_55%_48%)]"
                style={{ boxShadow: "0 0 4px hsl(152 55% 48% / 0.5)" }}
              />
            )}
          </div>

          {/* Label */}
          {!collapsed && (
            <span className={cn(
              "text-[13px] font-medium transition-colors flex-1",
              active ? "text-foreground" : "text-sidebar-foreground/80 group-hover/app:text-foreground"
            )}>
              {item.title}
            </span>
          )}

          {/* Expand chevron for domains with sub-nav */}
          {hasSubNav && !collapsed && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleExpand?.(); }}
              className="p-0.5 rounded hover:bg-white/[0.08] transition-colors"
            >
              <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                <ChevronRight className="h-3 w-3 text-sidebar-foreground/40" />
              </motion.div>
            </button>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// ── Sub-Nav Items ────────────────────────────────────────────
function SubNavItems({ routes, collapsed }: { routes: SubRoute[]; collapsed: boolean }) {
  const location = useLocation();
  if (collapsed) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="overflow-hidden ml-5 pl-3 border-l border-sidebar-border/20"
    >
      {routes.map(route => {
        const isActive = location.pathname === route.url || 
          (route.url !== "/business" && route.url !== "/money" && route.url !== "/concierge" && location.pathname.startsWith(route.url));
        return (
          <NavLink
            key={route.url}
            to={route.url}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1 my-0.5 text-[11px] transition-all duration-150",
              isActive
                ? "text-foreground bg-white/[0.06] font-medium"
                : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-white/[0.03]"
            )}
            activeClassName=""
          >
            <route.icon className="h-3 w-3" strokeWidth={1.5} />
            <span>{route.title}</span>
          </NavLink>
        );
      })}
    </motion.div>
  );
}

// ── Nav Group ────────────────────────────────────────────────
function AppNavGroup({ items, collapsed, onSidebarContextMenu }: { items: typeof primaryNav; collapsed: boolean; onSidebarContextMenu?: (e: React.MouseEvent, item: { title: string; url: string }) => void }) {
  const location = useLocation();
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  // Auto-expand the active domain
  useEffect(() => {
    for (const item of items) {
      if (domainSubRoutes[item.url] && location.pathname.startsWith(item.url)) {
        setExpandedDomain(item.url);
        return;
      }
    }
  }, [location.pathname, items]);

  return (
    <SidebarMenu className={cn(collapsed ? "items-center gap-1" : "gap-0.5")}>
      {items.map((item) => {
        const hasSubNav = !!domainSubRoutes[item.url];
        const isExpanded = expandedDomain === item.url;

        return (
          <div key={item.url}>
            <AppIconItem
              item={item}
              collapsed={collapsed}
              active={isActive(item.url)}
              hasSubNav={hasSubNav}
              expanded={isExpanded}
              onToggleExpand={() => setExpandedDomain(isExpanded ? null : item.url)}
              onContextMenu={onSidebarContextMenu ? (e) => { e.preventDefault(); onSidebarContextMenu(e, item); } : undefined}
            />
            {/* Collapsible sub-navigation */}
            <AnimatePresence>
              {hasSubNav && isExpanded && (
                <SubNavItems routes={domainSubRoutes[item.url]} collapsed={collapsed} />
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </SidebarMenu>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────
export const AppSidebar = memo(function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const { isDemoMode } = useDataMode();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const recents = useRecents();
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; title: string; url: string } | null>(null);

  const handleSidebarContextMenu = useCallback((e: React.MouseEvent, item: { title: string; url: string }) => {
    setCtxMenu({ x: e.clientX, y: e.clientY, title: item.title, url: item.url });
  }, []);

  // Filter bottom nav: only show Control Room to admins
  const visibleBottomNav = isAdmin
    ? [...bottomNav, { title: "Mission Control", url: "/admin", icon: Shield }]
    : [bottomNav[0]]; // Settings only

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
      className="border-r border-sidebar-border/40 transition-[width] duration-300 ease-in-out"
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
            <AppNavGroup items={primaryNav} collapsed={collapsed} onSidebarContextMenu={handleSidebarContextMenu} />
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
            <AppNavGroup items={favoritesNav} collapsed={collapsed} onSidebarContextMenu={handleSidebarContextMenu} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recents */}
        {!collapsed && recents.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50 mb-1 mt-1">
              <Clock className="h-3 w-3 inline mr-1 -mt-px" />Recents
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {recents.map(r => (
                  <SidebarMenuItem key={r.url}>
                    <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent">
                      <NavLink
                        to={r.url}
                        className="flex items-center gap-2 rounded-lg px-3 py-1 text-[11px] text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-white/[0.04] transition-all"
                        activeClassName=""
                      >
                        <Clock className="h-3 w-3 text-sidebar-foreground/30" />
                        <span>{r.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

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
            <AppNavGroup items={visibleBottomNav} collapsed={collapsed} />
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

      {/* Context Menu */}
      <AnimatePresence>
        {ctxMenu && (
          <SidebarContextMenu
            x={ctxMenu.x}
            y={ctxMenu.y}
            itemTitle={ctxMenu.title}
            itemUrl={ctxMenu.url}
            onClose={() => setCtxMenu(null)}
            onClearState={() => {
              try { const store = JSON.parse(sessionStorage.getItem("sita-app-state") || "{}"); const domainMap: Record<string, string> = { "/business": "business", "/money": "finance", "/concierge": "concierge", "/files": "files" }; const key = domainMap[ctxMenu.url]; if (key) { delete store[key]; sessionStorage.setItem("sita-app-state", JSON.stringify(store)); } } catch {}
            }}
            onOpenInNew={() => window.open(ctxMenu.url, "_blank")}
          />
        )}
      </AnimatePresence>
    </Sidebar>
  );
});
