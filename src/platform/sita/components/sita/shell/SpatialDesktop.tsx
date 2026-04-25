// ═══════════════════════════════════════════════════════════════
// SITA OS — Spatial Desktop v2
// 5 workspaces, expanded routes, arrow-key nav, activity badges,
// search/filter, app-level route previews
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, DollarSign, Headphones, Settings, BarChart3,
  FolderOpen, Calendar, ListTodo, LayoutDashboard, Minus, Plus,
  Maximize2, Grid3X3, Brain, Shield, Users, FileText, CreditCard,
  TrendingUp, Receipt, PieChart, Zap, Search, Clock, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ambientContext } from "@/lib/services/ambient-context-engine";

// ── Zoom Levels ───────────────────────────────────────────────

export type ZoomLevel = "overview" | "workspace" | "app";

interface WorkspaceConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  routes: { path: string; label: string; icon: React.ElementType }[];
  position: { x: number; y: number };
}

const WORKSPACES: WorkspaceConfig[] = [
  {
    id: "business",
    label: "Business",
    icon: Briefcase,
    color: "hsl(220 80% 60%)",
    gradient: "from-blue-500/20 to-indigo-500/20",
    routes: [
      { path: "/business", label: "Dashboard", icon: LayoutDashboard },
      { path: "/business/leads", label: "Leads", icon: Users },
      { path: "/business/pipeline", label: "Pipeline", icon: TrendingUp },
      { path: "/business/clients", label: "Clients", icon: Users },
      { path: "/revenue-office", label: "Revenue Office", icon: BarChart3 },
      { path: "/pulse", label: "Daily Pulse", icon: Zap },
    ],
    position: { x: 0, y: 0 },
  },
  {
    id: "money",
    label: "Finance",
    icon: DollarSign,
    color: "hsl(150 70% 50%)",
    gradient: "from-emerald-500/20 to-green-500/20",
    routes: [
      { path: "/money", label: "Dashboard", icon: LayoutDashboard },
      { path: "/money/transactions", label: "Transactions", icon: CreditCard },
      { path: "/money/invoices", label: "Invoices", icon: Receipt },
      { path: "/money/cash-flow", label: "Cash Flow", icon: TrendingUp },
      { path: "/money/budgets", label: "Budgets", icon: PieChart },
    ],
    position: { x: 1, y: 0 },
  },
  {
    id: "concierge",
    label: "Concierge",
    icon: Headphones,
    color: "hsl(280 70% 60%)",
    gradient: "from-purple-500/20 to-fuchsia-500/20",
    routes: [
      { path: "/concierge", label: "Dashboard", icon: LayoutDashboard },
      { path: "/tasks", label: "Tasks", icon: ListTodo },
      { path: "/calendar", label: "Calendar", icon: Calendar },
      { path: "/concierge/errands", label: "Errands", icon: Activity },
      { path: "/concierge/delegation", label: "Delegation", icon: Users },
    ],
    position: { x: 0, y: 1 },
  },
  {
    id: "intelligence",
    label: "Intelligence",
    icon: Brain,
    color: "hsl(38 85% 58%)",
    gradient: "from-amber-500/20 to-yellow-500/20",
    routes: [
      { path: "/advisors", label: "Advisors", icon: Brain },
      { path: "/boardroom", label: "Boardroom", icon: Users },
      { path: "/sita", label: "Jarvis Bridge", icon: Brain },
      { path: "/proof-center", label: "Proof Center", icon: Shield },
      { path: "/admin/kernel", label: "Kernel", icon: Settings },
    ],
    position: { x: 1, y: 1 },
  },
  {
    id: "system",
    label: "System",
    icon: Settings,
    color: "hsl(0 0% 60%)",
    gradient: "from-gray-500/20 to-slate-500/20",
    routes: [
      { path: "/settings", label: "Settings", icon: Settings },
      { path: "/files", label: "Files", icon: FolderOpen },
      { path: "/app-store", label: "Apps", icon: Grid3X3 },
      { path: "/profile", label: "Profile", icon: Users },
    ],
    position: { x: 2, y: 0 },
  },
];

// ── Spatial Desktop Component ─────────────────────────────────

interface SpatialDesktopProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export function SpatialDesktop({ isOpen, onClose, onNavigate }: SpatialDesktopProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("overview");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Determine active workspace from current route
  const activeWorkspaceId = useMemo(() => {
    const segment = location.pathname.split("/").filter(Boolean)[0] || "home";
    const match = WORKSPACES.find(ws =>
      ws.routes.some(r => r.path.startsWith(`/${segment}`)) || ws.id === segment
    );
    return match?.id || null;
  }, [location.pathname]);

  // Activity badges from ambient context
  const activityBadges = useMemo(() => {
    const stats: Record<string, { lastVisit: number; visits: number }> = {};
    const summary = ambientContext.getActivitySummary();
    for (const ws of WORKSPACES) {
      let visits = 0;
      let lastVisit = 0;
      for (const route of ws.routes) {
        const related = summary.recentPages.find(p => p.path === route.path);
        if (related) {
          visits++;
          lastVisit = Math.max(lastVisit, Date.now());
        }
      }
      stats[ws.id] = { lastVisit, visits };
    }
    return stats;
  }, [isOpen]);

  // Filtered workspaces for search
  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery) return WORKSPACES;
    const q = searchQuery.toLowerCase();
    return WORKSPACES.filter(ws =>
      ws.label.toLowerCase().includes(q) ||
      ws.routes.some(r => r.label.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (searchQuery) { setSearchQuery(""); return; }
        if (zoomLevel === "app") setZoomLevel("workspace");
        else if (zoomLevel === "workspace") setZoomLevel("overview");
        else onClose();
      }
      if (e.key === "-" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (zoomLevel === "app") setZoomLevel("workspace");
        else if (zoomLevel === "workspace") setZoomLevel("overview");
      }
      if (e.key === "=" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (zoomLevel === "overview" && selectedWorkspace) setZoomLevel("workspace");
        else if (zoomLevel === "workspace") setZoomLevel("app");
      }

      // Arrow-key spatial navigation
      if (zoomLevel === "overview" && !searchQuery) {
        const cols = 3;
        const total = filteredWorkspaces.length;
        if (e.key === "ArrowRight") {
          e.preventDefault();
          setFocusedIdx(i => Math.min(i + 1, total - 1));
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setFocusedIdx(i => Math.max(i - 1, 0));
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedIdx(i => Math.min(i + cols, total - 1));
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedIdx(i => Math.max(i - cols, 0));
        }
        if (e.key === "Enter") {
          e.preventDefault();
          const ws = filteredWorkspaces[focusedIdx];
          if (ws) handleWorkspaceClick(ws.id);
        }
      }

      // Focus search on "/"
      if (e.key === "/" && zoomLevel === "overview" && !searchQuery) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, zoomLevel, selectedWorkspace, onClose, focusedIdx, filteredWorkspaces, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setFocusedIdx(0);
    }
  }, [isOpen]);

  const handleWorkspaceClick = useCallback((wsId: string) => {
    setSelectedWorkspace(wsId);
    setZoomLevel("workspace");
  }, []);

  const handleRouteClick = useCallback((path: string) => {
    navigate(path);
    onNavigate?.(path);
    onClose();
  }, [navigate, onNavigate, onClose]);

  const zoomIn = useCallback(() => {
    if (zoomLevel === "overview" && selectedWorkspace) setZoomLevel("workspace");
    else if (zoomLevel === "workspace") setZoomLevel("app");
  }, [zoomLevel, selectedWorkspace]);

  const zoomOut = useCallback(() => {
    if (zoomLevel === "app") setZoomLevel("workspace");
    else if (zoomLevel === "workspace") setZoomLevel("overview");
  }, [zoomLevel]);

  if (!isOpen) return null;

  const currentWorkspace = WORKSPACES.find(ws => ws.id === selectedWorkspace);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[180] flex flex-col"
        style={{
          background: "hsl(0 0% 0% / 0.7)",
          backdropFilter: "blur(30px) saturate(1.5)",
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground/80">
              {zoomLevel === "overview" ? "All Workspaces" :
               zoomLevel === "workspace" ? currentWorkspace?.label || "Workspace" :
               "App View"}
            </span>
            <div className="flex items-center gap-1 bg-muted/20 rounded-lg px-2 py-1">
              {(["overview", "workspace", "app"] as ZoomLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    if (level === "overview") setZoomLevel("overview");
                    else if (level === "workspace" && selectedWorkspace) setZoomLevel("workspace");
                    else if (level === "app" && selectedWorkspace) setZoomLevel("app");
                  }}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-medium transition-all",
                    zoomLevel === level
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground/50 hover:text-foreground/70"
                  )}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={zoomOut} className="p-1.5 rounded-lg bg-muted/20 hover:bg-muted/40 text-foreground/60 transition-colors" title="Zoom out (Ctrl+-)">
              <Minus className="h-4 w-4" />
            </button>
            <button onClick={zoomIn} className="p-1.5 rounded-lg bg-muted/20 hover:bg-muted/40 text-foreground/60 transition-colors" title="Zoom in (Ctrl+=)">
              <Plus className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-muted/20 hover:bg-muted/40 text-foreground/60 transition-colors">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Bar (overview only) */}
        {zoomLevel === "overview" && (
          <div className="px-6 pb-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setFocusedIdx(0); }}
                placeholder="Search workspaces & apps… (press /)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/20 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/40 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div ref={containerRef} className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* OVERVIEW */}
            {zoomLevel === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl w-full"
              >
                {filteredWorkspaces.map((ws, idx) => {
                  const Icon = ws.icon;
                  const isActive = ws.id === activeWorkspaceId;
                  const isFocused = idx === focusedIdx;
                  const badge = activityBadges[ws.id];
                  return (
                    <motion.button
                      key={ws.id}
                      whileHover={{ scale: 1.04, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleWorkspaceClick(ws.id)}
                      className={cn(
                        "relative flex flex-col items-center gap-3 p-6 sm:p-8 rounded-2xl border transition-all duration-300",
                        "bg-gradient-to-br",
                        ws.gradient,
                        isActive
                          ? "border-primary/40 ring-2 ring-primary/20"
                          : isFocused
                          ? "border-primary/30 ring-1 ring-primary/10"
                          : "border-border/20 hover:border-border/40"
                      )}
                      style={{ boxShadow: `0 8px 40px -12px ${ws.color}33` }}
                    >
                      <div
                        className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl shadow-lg"
                        style={{ background: ws.color }}
                      >
                        <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm sm:text-base font-semibold text-foreground">{ws.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {ws.routes.length} apps
                        </p>
                      </div>

                      {/* Activity badge */}
                      {badge && badge.visits > 0 && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary/15 px-2 py-0.5 rounded-full">
                          <Activity className="h-2.5 w-2.5 text-primary/70" />
                          <span className="text-[9px] font-medium text-primary/70">{badge.visits}</span>
                        </div>
                      )}

                      {isActive && (
                        <div className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {/* WORKSPACE */}
            {zoomLevel === "workspace" && currentWorkspace && (
              <motion.div
                key={`workspace-${currentWorkspace.id}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="flex flex-col items-center gap-8 max-w-3xl w-full"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center h-12 w-12 rounded-xl shadow-lg"
                    style={{ background: currentWorkspace.color }}
                  >
                    <currentWorkspace.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{currentWorkspace.label}</h2>
                    <p className="text-sm text-muted-foreground">{currentWorkspace.routes.length} apps in this workspace</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                  {currentWorkspace.routes.map((route, idx) => {
                    const RouteIcon = route.icon;
                    const isActive = location.pathname === route.path || location.pathname.startsWith(route.path + "/");
                    return (
                      <motion.button
                        key={route.path}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleRouteClick(route.path)}
                        className={cn(
                          "flex flex-col items-center gap-3 p-5 sm:p-6 rounded-xl border transition-all duration-200",
                          isActive
                            ? "border-primary/40 bg-primary/10"
                            : "border-border/20 bg-card/50 hover:bg-card/80 hover:border-border/40"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center h-12 w-12 rounded-xl",
                          isActive ? "bg-primary/20" : "bg-muted/30"
                        )}>
                          <RouteIcon className={cn("h-6 w-6", isActive ? "text-primary" : "text-foreground/70")} />
                        </div>
                        <span className={cn(
                          "text-sm font-medium",
                          isActive ? "text-primary" : "text-foreground/80"
                        )}>
                          {route.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setZoomLevel("overview")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to all workspaces
                </button>
              </motion.div>
            )}

            {/* APP: Route preview cards */}
            {zoomLevel === "app" && currentWorkspace && (
              <motion.div
                key="app-view"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-6 max-w-2xl w-full"
              >
                <p className="text-lg font-semibold text-foreground">
                  {currentWorkspace.label} — Recent Activity
                </p>

                {/* Recent activity from ambient context */}
                <div className="w-full space-y-2">
                  {currentWorkspace.routes.map((route) => {
                    const RouteIcon = route.icon;
                    const isActive = location.pathname === route.path;
                    const related = ambientContext.getRelatedFiles(route.path);
                    return (
                      <motion.button
                        key={route.path}
                        whileHover={{ x: 4 }}
                        onClick={() => handleRouteClick(route.path)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                          isActive
                            ? "border-primary/40 bg-primary/10"
                            : "border-border/15 bg-card/40 hover:bg-card/60 hover:border-border/30"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center h-10 w-10 rounded-lg shrink-0",
                          isActive ? "bg-primary/20" : "bg-muted/20"
                        )}>
                          <RouteIcon className={cn("h-5 w-5", isActive ? "text-primary" : "text-foreground/60")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{route.label}</p>
                          <p className="text-[11px] text-muted-foreground/60">
                            {related.length > 0
                              ? `Related: ${related.slice(0, 2).map(r => r.label).join(", ")}`
                              : route.path}
                          </p>
                        </div>
                        {isActive && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setZoomLevel("workspace")}
                  className="text-xs text-primary hover:underline"
                >
                  ← Back to workspace
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Minimap */}
        <div className="fixed bottom-6 right-6 w-36 h-28 rounded-xl border border-border/20 bg-card/30 backdrop-blur-xl p-2 hidden lg:block">
          <div className="relative w-full h-full">
            {WORKSPACES.map((ws) => {
              const isSelected = ws.id === selectedWorkspace && zoomLevel !== "overview";
              const cols = 3;
              const row = Math.floor(WORKSPACES.indexOf(ws) / cols);
              const col = WORKSPACES.indexOf(ws) % cols;
              return (
                <div
                  key={ws.id}
                  className={cn(
                    "absolute rounded-md transition-all duration-300",
                    isSelected ? "ring-2 ring-primary/60 scale-110" : "opacity-60"
                  )}
                  style={{
                    left: `${col * 35}%`,
                    top: `${row * 52}%`,
                    width: "30%",
                    height: "42%",
                    background: ws.color + "33",
                    border: `1px solid ${ws.color}44`,
                  }}
                >
                  <span className="text-[7px] text-foreground/50 p-1 block truncate">{ws.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SpatialDesktop;
