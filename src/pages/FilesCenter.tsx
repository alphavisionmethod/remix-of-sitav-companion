// ═══════════════════════════════════════════════════════════════
// SITA OS — Files Center (App-in-OS Shell)
// ═══════════════════════════════════════════════════════════════

import { DomainAppShell } from "@/components/sita/shell/DomainAppShell";
import type { DomainConfig } from "@/components/sita/shell/DomainAppShell";
import type { NavTabGroup } from "@/components/sita/shell/AppSidebarNav";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppOpenTransition } from "@/components/sita/shell/AppOpenTransition";
import {
  FileText, LayoutDashboard, FolderOpen, Search, Cpu, Brain,
  CheckSquare, ShieldAlert, Settings, Eye
} from "lucide-react";

import FilesOverview from "./files/FilesOverview";
import FilesAll from "./files/FilesAll";
import FilesProcessing from "./files/FilesProcessing";
import FilesReview from "./files/FilesReview";
import FilesSearch from "./files/FilesSearch";
import FilesMemoryReview from "./files/FilesMemoryReview";
import FilesSensitive from "./files/FilesSensitive";
import FilesSettings from "./files/FilesSettings";

const DOMAIN_CONFIG: DomainConfig = {
  id: "files" as any,
  title: "Files",
  icon: FileText,
  accentFrom: "hsl(220 15% 55%)",
  accentTo: "hsl(230 15% 45%)",
  statusLabel: "Files Indexed",
  version: "Files v2.0",
};

type SubPage = "overview" | "all" | "processing" | "review" | "search" | "memory" | "sensitive" | "settings";

const subpageFromPath = (path: string): SubPage => {
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

  const goTo = (key: string) => {
    if (key === "overview") navigate("/files");
    else navigate(`/files/${key}`);
  };

  const PageComponent = pages[activePage];

  return (
    <AppOpenTransition>
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
    </AppOpenTransition>
  );
};

const FilesCenterWithBoundary = () => (
  <GlobalErrorBoundary>
    <FilesCenter />
  </GlobalErrorBoundary>
);

export default FilesCenterWithBoundary;
