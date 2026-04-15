// ═══════════════════════════════════════════════════════════════
// SITA OS — App Store Windowed Shell
// Standalone windowed app following BusinessAppShell pattern
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from "react";
import {
  Store, Package, Download, RefreshCw, Shield, Link2, Layers, Globe,
  Terminal, Building2, Receipt, ExternalLink, Rocket, ChevronDown, ChevronRight,
  Search, Sparkles, Star, Grid3X3, TrendingUp, Gamepad2, Briefcase, Code2,
  Wallet, Lock, Wrench, Monitor, Heart, Home, BookOpen, LayoutGrid, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Lazy page imports ────────────────────────────────────────
const AppStorePage = lazy(() => import("@/pages/app-platform/AppStorePage"));
const AppDetailPage = lazy(() => import("@/pages/app-platform/AppDetailPage"));
const AppLibraryPage = lazy(() => import("@/pages/app-platform/AppLibraryPage"));
const AppUpdatesPage = lazy(() => import("@/pages/app-platform/AppUpdatesPage"));
const AppPermissionsCenterPage = lazy(() => import("@/pages/app-platform/AppPermissionsCenterPage"));
const AppAssociationsPage = lazy(() => import("@/pages/app-platform/AppAssociationsPage"));
const AppComparePage = lazy(() => import("@/pages/app-platform/AppComparePage"));
const AppManagePage = lazy(() => import("@/pages/app-platform/AppManagePage"));
const WebAppInstallPage = lazy(() => import("@/pages/app-platform/WebAppInstallPage"));
const ExternalInstallerPage = lazy(() => import("@/pages/app-platform/ExternalInstallerPage"));
const AppReceiptsPage = lazy(() => import("@/pages/app-platform/AppReceiptsPage"));
const AppReceiptDetailPage = lazy(() => import("@/pages/app-platform/AppReceiptDetailPage"));
const EnterpriseCatalogPage = lazy(() => import("@/pages/app-platform/EnterpriseCatalogPage"));
const DevToolsCatalogPage = lazy(() => import("@/pages/app-platform/DevToolsCatalogPage"));
const OpenWithPage = lazy(() => import("@/pages/app-platform/OpenWithPage"));
const FirstLaunchPage = lazy(() => import("@/pages/app-platform/FirstLaunchPage"));
const BundleDetailPage = lazy(() => import("@/pages/app-platform/BundleDetailPage"));

// ── Module Map ───────────────────────────────────────────────
const MODULE_MAP: Record<string, React.LazyExoticComponent<any>> = {
  "store": AppStorePage,
  "app-detail": AppDetailPage,
  "library": AppLibraryPage,
  "updates": AppUpdatesPage,
  "permissions": AppPermissionsCenterPage,
  "associations": AppAssociationsPage,
  "compare": AppComparePage,
  "manage": AppManagePage,
  "web-install": WebAppInstallPage,
  "external-install": ExternalInstallerPage,
  "receipts": AppReceiptsPage,
  "receipt-detail": AppReceiptDetailPage,
  "enterprise": EnterpriseCatalogPage,
  "dev-tools": DevToolsCatalogPage,
  "open-with": OpenWithPage,
  "first-launch": FirstLaunchPage,
  "bundle-detail": BundleDetailPage,
};

// ── Navigation Structure ─────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Discover",
    defaultOpen: true,
    items: [
      { id: "store", label: "Store Home", icon: <Store className="h-4 w-4" /> },
      { id: "trending", label: "Trending", icon: <TrendingUp className="h-4 w-4" /> },
      { id: "curated", label: "SITA Verified", icon: <Sparkles className="h-4 w-4" /> },
    ],
  },
  {
    label: "Categories",
    defaultOpen: false,
    items: [
      { id: "cat-productivity", label: "Productivity", icon: <Briefcase className="h-4 w-4" /> },
      { id: "cat-developer", label: "Developer", icon: <Code2 className="h-4 w-4" /> },
      { id: "cat-finance", label: "Finance", icon: <Wallet className="h-4 w-4" /> },
      { id: "cat-security", label: "Security", icon: <Lock className="h-4 w-4" /> },
      { id: "cat-utilities", label: "Utilities", icon: <Wrench className="h-4 w-4" /> },
      { id: "cat-entertainment", label: "Entertainment", icon: <Gamepad2 className="h-4 w-4" /> },
      { id: "cat-communication", label: "Communication", icon: <Monitor className="h-4 w-4" /> },
      { id: "cat-household", label: "Household", icon: <Home className="h-4 w-4" /> },
    ],
  },
  {
    label: "Library",
    defaultOpen: true,
    items: [
      { id: "library", label: "My Apps", icon: <LayoutGrid className="h-4 w-4" /> },
      { id: "updates", label: "Updates", icon: <RefreshCw className="h-4 w-4" /> },
      { id: "receipts", label: "Receipts", icon: <Receipt className="h-4 w-4" /> },
    ],
  },
  {
    label: "Management",
    defaultOpen: false,
    items: [
      { id: "permissions", label: "Permissions", icon: <Shield className="h-4 w-4" /> },
      { id: "associations", label: "Associations", icon: <Link2 className="h-4 w-4" /> },
      { id: "open-with", label: "Open With", icon: <ExternalLink className="h-4 w-4" /> },
      { id: "compare", label: "Compare", icon: <Layers className="h-4 w-4" /> },
    ],
  },
  {
    label: "Advanced",
    defaultOpen: false,
    items: [
      { id: "web-install", label: "Web Install", icon: <Globe className="h-4 w-4" /> },
      { id: "external-install", label: "External Package", icon: <Download className="h-4 w-4" /> },
      { id: "dev-tools", label: "Dev Tools", icon: <Terminal className="h-4 w-4" /> },
      { id: "enterprise", label: "Enterprise", icon: <Building2 className="h-4 w-4" /> },
    ],
  },
];

// ── Component ────────────────────────────────────────────────

export function AppStoreShell() {
  const [activeModule, setActiveModule] = useState<string>(() => {
    return (window as any).__appStoreInitialModule || "store";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV_GROUPS.forEach(g => { init[g.label] = g.defaultOpen ?? false; });
    return init;
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Listen for deep-link navigation events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.module) setActiveModule(detail.module);
    };
    window.addEventListener("sita-app-store-navigate", handler);
    return () => window.removeEventListener("sita-app-store-navigate", handler);
  }, []);

  const toggleGroup = useCallback((label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  }, []);

  // For category items, map to store with filter
  const handleModuleSelect = useCallback((id: string) => {
    if (id.startsWith("cat-") || id === "trending" || id === "curated") {
      // Route to store home — these are conceptual filters on the store
      setActiveModule("store");
    } else {
      setActiveModule(id);
    }
  }, []);

  // Resolve component
  const ActiveComponent = MODULE_MAP[activeModule] ?? MODULE_MAP["store"];

  return (
    <div className="flex h-full w-full overflow-hidden rounded-b-xl bg-[hsl(var(--background))]">
      {/* ── Sidebar ────────────────────────────────────── */}
      <div
        className={cn(
          "flex flex-col border-r border-border/20 bg-[hsl(var(--background))]/80 backdrop-blur-xl transition-all duration-200 flex-shrink-0",
          sidebarCollapsed ? "w-12" : "w-56"
        )}
      >
        {/* Store branding header */}
        <div className="px-3 py-3 border-b border-border/10">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[hsl(265,55%,58%)] to-[hsl(300,55%,45%)] flex items-center justify-center shadow-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground leading-none">SITA App Store</p>
                <p className="text-[10px] text-muted-foreground">Discover & Manage</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[hsl(265,55%,58%)] to-[hsl(300,55%,45%)] flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="px-2 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search apps…"
                className="w-full h-7 pl-7 pr-2 text-xs rounded-md bg-muted/40 border border-border/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
        )}

        {/* Nav groups */}
        <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-0.5">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              {!sidebarCollapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center gap-1 w-full px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedGroups[group.label]
                    ? <ChevronDown className="h-3 w-3" />
                    : <ChevronRight className="h-3 w-3" />}
                  {group.label}
                </button>
              )}

              <AnimatePresence initial={false}>
                {(expandedGroups[group.label] || sidebarCollapsed) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    {group.items.map(item => {
                      const isActive = activeModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleModuleSelect(item.id)}
                          className={cn(
                            "w-full flex items-center gap-2 rounded-lg transition-all duration-150",
                            sidebarCollapsed ? "px-2 py-1.5 justify-center" : "px-2.5 py-1.5",
                            isActive
                              ? "bg-primary/15 text-primary"
                              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          )}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          {isActive && !sidebarCollapsed && (
                            <div className="w-0.5 h-4 rounded-full bg-primary absolute left-0" />
                          )}
                          {item.icon}
                          {!sidebarCollapsed && (
                            <span className="text-xs font-medium truncate">{item.label}</span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="px-2 py-2 border-t border-border/10 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Content ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
                  <Store className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Loading…</p>
              </div>
            </div>
          }
        >
          <ActiveComponent />
        </Suspense>
      </div>
    </div>
  );
}
