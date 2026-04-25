// ═══════════════════════════════════════════════════════════════
// SITA OS — Files Center (Full DomainAppShell App)
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { DomainAppShell } from "@/platform/sita/components/sita/shell/DomainAppShell";
import type { DomainConfig } from "@/platform/sita/components/sita/shell/DomainAppShell";
import type { NavTabGroup } from "@/platform/sita/components/sita/shell/AppSidebarNav";
import { GlobalErrorBoundary } from "@/platform/sita/components/sita/GlobalErrorBoundary";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStatePersistence, restoreAppState } from "@/hooks/useAppStatePersistence";
import {
  FileText, LayoutDashboard, FolderOpen, Search, Cpu, Brain,
  Eye, ShieldAlert, Settings, HardDrive,
} from "lucide-react";

// Wave 6 — sibling files migrated to platform/files/pages/ in Wave 5; use absolute aliases.
import FilesOverview from "@/platform/files/pages/FilesOverview";
import FilesAll from "@/platform/files/pages/FilesAll";
import FilesExplorer from "@/platform/files/pages/FilesExplorer";
import FilesProcessing from "@/platform/files/pages/FilesProcessing";
import FilesReview from "@/platform/files/pages/FilesReview";
import FilesSearch from "@/platform/files/pages/FilesSearch";
import FilesMemoryReview from "@/platform/files/pages/FilesMemoryReview";
import FilesSensitive from "@/platform/files/pages/FilesSensitive";
import FilesSettings from "@/platform/files/pages/FilesSettings";

const DOMAIN_CONFIG: DomainConfig = {
  id: "files",
  title: "Files",
  icon: FileText,
  accentFrom: "hsl(220 15% 55%)",
  accentTo: "hsl(230 15% 45%)",
  statusLabel: "Files Indexed",
  version: "Files v2.0",
};

type SubPage = "overview" | "explorer" | "all" | "processing" | "review" | "search" | "memory" | "sensitive" | "settings";

const subpageFromPath = (path: string): SubPage => {
  if (path.includes("/files/explorer")) return "explorer";
  if (path.includes("/files/all")) return "all";
  if (path.includes("/files/processing")) return "processing";
  if (path.includes("/files/review")) return "review";
  if (path.includes("/files/search")) return "search";
  if (path.includes("/files/memory")) return "memory";
  if (path.includes("/files/sensitive")) return "sensitive";
  if (path.includes("/files/settings")) return "settings";
  return "overview";
};

const TAB_GROUPS: NavTabGroup[] = [
  {
    label: "Browse",
    tabs: [
      { key: "overview", label: "Overview", icon: LayoutDashboard },
      { key: "explorer", label: "Explorer", icon: HardDrive },
      { key: "all", label: "All Files", icon: FolderOpen },
      { key: "search", label: "Search", icon: Search },
    ],
  },
  {
    label: "Intelligence",
    tabs: [
      { key: "processing", label: "Processing", icon: Cpu },
      { key: "memory", label: "Memory", icon: Brain },
      { key: "review", label: "Review", icon: Eye },
    ],
  },
  {
    label: "Security",
    tabs: [
      { key: "sensitive", label: "Sensitive", icon: ShieldAlert },
      { key: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const pages: Record<SubPage, React.ComponentType> = {
  overview: FilesOverview,
  explorer: FilesExplorer,
  all: FilesAll,
  processing: FilesProcessing,
  review: FilesReview,
  search: FilesSearch,
  memory: FilesMemoryReview,
  sensitive: FilesSensitive,
  settings: FilesSettings,
};

const FilesCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = subpageFromPath(location.pathname);
  const { restoreScroll } = useAppStatePersistence("files", activePage);

  React.useEffect(() => {
    if (location.pathname === "/files") {
      const saved = restoreAppState("files");
      if (saved && saved.activePage !== "overview") {
        navigate(`/files/${saved.activePage}`, { replace: true });
      }
    }
    restoreScroll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (key: string) => {
    if (key === "overview") navigate("/files");
    else navigate(`/files/${key}`);
  };

  const PageComponent = pages[activePage];

  return (
    <DomainAppShell
      domain={DOMAIN_CONFIG}
      activePage={activePage}
      onNavigate={goTo}
      tabGroups={TAB_GROUPS}
    >
      <h1 className="sr-only">Files Center</h1>
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <PageComponent />
        </motion.div>
      </AnimatePresence>
    </DomainAppShell>
  );
};

const FilesCenterWithBoundary = () => (
  <GlobalErrorBoundary>
    <FilesCenter />
  </GlobalErrorBoundary>
);

export default FilesCenterWithBoundary;
