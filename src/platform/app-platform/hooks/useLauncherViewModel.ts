// ═══════════════════════════════════════════════════════════════
// SITA OS — Launcher ViewModel Hook v2.1.1
// Composites launcher data from AppPlatform + AppSurfacing
// Provides: sections, weighted search, telemetry, state
// ═══════════════════════════════════════════════════════════════

import { useMemo, useCallback, useEffect, useRef } from "react";
import { useAppPlatform } from "@/platform/app-platform/contexts/AppPlatformContext";
import { useAppSurfacing } from "@/hooks/useAppSurfacing";
import type { AppDefinition, AppCategory } from "@/domains/apps/types";

// ── Telemetry ───────────────────────────────────────────────────

function trackLauncher(event: string, data?: Record<string, unknown>) {
  console.info(`[launcher:telemetry] ${event}`, data);
}

// ── Search scoring ──────────────────────────────────────────────

interface ScoredApp {
  app: AppDefinition;
  score: number;
}

function scoreApp(
  app: AppDefinition,
  query: string,
  pinnedIds: Set<string>,
  recentIds: Set<string>,
): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const name = app.name.toLowerCase();
  const tags = app.tags.map(t => t.toLowerCase());
  const desc = app.shortDescription.toLowerCase();
  const cat = app.category.toLowerCase();

  let score = 0;

  // Exact name match — highest
  if (name === q) score += 100;
  // Name starts with query
  else if (name.startsWith(q)) score += 80;
  // Name contains query
  else if (name.includes(q)) score += 60;
  // Tag exact match
  else if (tags.some(t => t === q)) score += 50;
  // Tag contains
  else if (tags.some(t => t.includes(q))) score += 40;
  // Category match
  else if (cat.includes(q)) score += 35;
  // Description contains
  else if (desc.includes(q)) score += 25;
  // Fuzzy match
  else {
    let qi = 0;
    for (let i = 0; i < name.length && qi < q.length; i++) {
      if (name[i] === q[qi]) qi++;
    }
    if (qi >= q.length) score += 10;
  }

  if (score === 0) return 0;

  // Boost factors
  if (pinnedIds.has(app.id)) score += 15;
  if (recentIds.has(app.id)) score += 10;
  if (app.installStatus === "installed") score += 8;
  if (app.featured) score += 3;

  return score;
}

// ── Types ───────────────────────────────────────────────────────

export type AppInstallCTA = "open" | "install" | "locked" | "request-access" | "update";

export interface LauncherAppItem {
  app: AppDefinition;
  cta: AppInstallCTA;
  isPinned: boolean;
  isRecent: boolean;
  isNew: boolean;
  hasUpdate: boolean;
  badgeCount: number;
  firstLaunch: boolean;
}

export interface LauncherSection {
  key: string;
  label: string;
  apps: LauncherAppItem[];
}

export interface LauncherViewModel {
  pinnedSection: LauncherSection;
  recentSection: LauncherSection;
  allAppsGrouped: LauncherSection[];
  searchResults: LauncherAppItem[] | null; // null = not searching
  totalResults: number;
  categories: { key: string; label: string; count: number }[];
  isLoading: boolean;
}

// ── Category labels ─────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  browsers: "Internet",
  communication: "Chat",
  productivity: "Work",
  "developer-tools": "Dev",
  business: "Business",
  finance: "Finance",
  media: "Media",
  utilities: "System",
  household: "Home",
  security: "Security",
  education: "Learn",
  entertainment: "Fun",
  enterprise: "Enterprise",
  extensions: "Extensions",
};

// ── Hook ────────────────────────────────────────────────────────

export function useLauncherViewModel(query: string, activeCategory: string | null, isOpen: boolean) {
  const { apps, isLoading, installApp } = useAppPlatform();
  const { getRecentFlow, getTopApps, recordLaunch } = useAppSurfacing();
  const prevOpen = useRef(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // Telemetry: open/close
  useEffect(() => {
    if (isOpen && !prevOpen.current) {
      trackLauncher("launcher_opened");
    } else if (!isOpen && prevOpen.current) {
      trackLauncher("launcher_closed");
    }
    prevOpen.current = isOpen;
  }, [isOpen]);

  // Telemetry: debounced search
  useEffect(() => {
    if (!query.trim()) return;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      trackLauncher("search_performed", { query, queryLength: query.length });
    }, 500);
    return () => clearTimeout(searchTimer.current);
  }, [query]);

  // Derived sets
  const pinnedIds = useMemo(() => new Set(apps.filter(a => a.pinnedToDock).map(a => a.id)), [apps]);
  const recentFlow = useMemo(() => getRecentFlow(8), [getRecentFlow]);
  const recentIds = useMemo(() => new Set(recentFlow.map(f => f.appId)), [recentFlow]);

  // CTA resolver
  const getCTA = useCallback((app: AppDefinition): AppInstallCTA => {
    switch (app.installStatus) {
      case "installed": return "open";
      case "update-available": return "update";
      case "requires-approval": return "request-access";
      case "blocked": return "locked";
      default: return "install";
    }
  }, []);

  // Build launcher item
  const buildItem = useCallback((app: AppDefinition): LauncherAppItem => ({
    app,
    cta: getCTA(app),
    isPinned: pinnedIds.has(app.id),
    isRecent: recentIds.has(app.id),
    isNew: app.isNew ?? false,
    hasUpdate: app.installStatus === "update-available",
    badgeCount: app.badgeCount ?? 0,
    firstLaunch: app.installStatus === "installed" && !recentIds.has(app.id) && !app.lastUsedAt,
  }), [getCTA, pinnedIds, recentIds]);

  // Visible apps (permission filter — show all, but mark locked)
  const visibleApps = useMemo(() => {
    if (activeCategory) return apps.filter(a => a.category === activeCategory);
    return apps;
  }, [apps, activeCategory]);

  // View model
  const viewModel = useMemo((): LauncherViewModel => {
    const isSearching = query.trim().length > 0;

    // Search results
    let searchResults: LauncherAppItem[] | null = null;
    if (isSearching) {
      const scored: ScoredApp[] = visibleApps
        .map(app => ({ app, score: scoreApp(app, query, pinnedIds, recentIds) }))
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score);
      searchResults = scored.map(s => buildItem(s.app));
    }

    // Pinned section
    const pinnedApps = apps.filter(a => a.pinnedToDock && a.installStatus === "installed");
    const pinnedSection: LauncherSection = {
      key: "pinned",
      label: "Pinned",
      apps: pinnedApps.map(buildItem),
    };

    // Recent section
    const recentAppDefs: AppDefinition[] = [];
    const seenRecent = new Set<string>();
    for (const entry of recentFlow) {
      if (seenRecent.has(entry.appId)) continue;
      seenRecent.add(entry.appId);
      const app = apps.find(a => a.id === entry.appId && a.installStatus === "installed");
      if (app) recentAppDefs.push(app);
      if (recentAppDefs.length >= 8) break;
    }
    // Fill with top apps if not enough
    if (recentAppDefs.length < 4) {
      const topApps = getTopApps(8);
      for (const t of topApps) {
        if (seenRecent.has(t.appId)) continue;
        seenRecent.add(t.appId);
        const app = apps.find(a => a.id === t.appId && a.installStatus === "installed");
        if (app) recentAppDefs.push(app);
        if (recentAppDefs.length >= 8) break;
      }
    }
    // Fill with first installed
    if (recentAppDefs.length < 4) {
      for (const app of apps) {
        if (app.installStatus !== "installed" || seenRecent.has(app.id)) continue;
        seenRecent.add(app.id);
        recentAppDefs.push(app);
        if (recentAppDefs.length >= 8) break;
      }
    }
    const recentSection: LauncherSection = {
      key: "recent",
      label: "Recently Used",
      apps: recentAppDefs.map(buildItem),
    };

    // All apps grouped by category
    const grouped = new Map<string, LauncherAppItem[]>();
    for (const app of visibleApps) {
      const cat = app.category;
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(buildItem(app));
    }
    // Sort each group: installed first, then by name
    const allAppsGrouped: LauncherSection[] = Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, items]) => ({
        key: cat,
        label: CATEGORY_LABELS[cat] || cat,
        apps: items.sort((a, b) => {
          const aI = a.app.installStatus === "installed" ? 0 : 1;
          const bI = b.app.installStatus === "installed" ? 0 : 1;
          if (aI !== bI) return aI - bI;
          return a.app.name.localeCompare(b.app.name);
        }),
      }));

    // Categories summary
    const categories = allAppsGrouped.map(g => ({
      key: g.key,
      label: g.label,
      count: g.apps.length,
    }));

    return {
      pinnedSection,
      recentSection,
      allAppsGrouped,
      searchResults,
      totalResults: searchResults?.length ?? visibleApps.length,
      categories,
      isLoading,
    };
  }, [query, visibleApps, apps, pinnedIds, recentIds, recentFlow, getTopApps, buildItem, isLoading]);

  // Actions
  const launchApp = useCallback((appId: string, onLaunch: (id: string) => void) => {
    recordLaunch(appId);
    trackLauncher("app_opened", { appId });
    onLaunch(appId);
  }, [recordLaunch]);

  const handleInstall = useCallback(async (appId: string) => {
    trackLauncher("app_installed_from_launcher", { appId });
    await installApp(appId);
  }, [installApp]);

  const trackPin = useCallback((appId: string, pinned: boolean) => {
    trackLauncher(pinned ? "app_pinned" : "app_unpinned", { appId });
  }, []);

  const trackQuickAction = useCallback((appId: string, actionId: string) => {
    trackLauncher("quick_action_triggered", { appId, actionId });
  }, []);

  return { viewModel, launchApp, handleInstall, trackPin, trackQuickAction };
}
