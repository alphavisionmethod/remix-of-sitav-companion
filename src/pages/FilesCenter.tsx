import { SitaTabs } from "@/components/sita/SitaComponents";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import FilesOverview from "./files/FilesOverview";
import FilesAll from "./files/FilesAll";
import FilesProcessing from "./files/FilesProcessing";
import FilesReview from "./files/FilesReview";
import FilesSearch from "./files/FilesSearch";
import FilesMemoryReview from "./files/FilesMemoryReview";
import FilesSensitive from "./files/FilesSensitive";
import FilesSettings from "./files/FilesSettings";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

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
  const { isDemoMode } = useDataMode();
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = subpageFromPath(location.pathname);

  const goTo = (key: string) => {
    if (key === "overview") navigate("/files");
    else navigate(`/files/${key}`);
  };

  const PageComponent = pages[activePage];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DemoModeBadge />
      <motion.div
        className="overflow-x-auto -mx-2 px-2"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <SitaTabs
          tabs={[
            { key: "overview", label: "Overview" },
            { key: "all", label: "All Files" },
            { key: "processing", label: "Processing" },
            { key: "review", label: "Review" },
            { key: "search", label: "Search" },
            { key: "memory", label: "Memory" },
            { key: "sensitive", label: "Sensitive" },
            { key: "settings", label: "Settings" },
          ]}
          active={activePage}
          onChange={goTo}
        />
      </motion.div>

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
    </div>
  );
};

export default FilesCenter;
