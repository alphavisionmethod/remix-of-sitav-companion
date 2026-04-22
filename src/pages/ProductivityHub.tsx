import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { FileText, Table2, Presentation, Sparkles, Clock, Star, Plus } from "lucide-react";
import { DEMO_RECENT_DOCS } from "@/data/seed/core-pages";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const DocsWorkspace = lazy(() => import("./workspace/DocsWorkspace"));
const SheetsWorkspace = lazy(() => import("./workspace/SheetsWorkspace"));
const SlidesWorkspace = lazy(() => import("./workspace/SlidesWorkspace"));

type SubPage = "overview" | "docs" | "sheets" | "slides";

const subpageFromPath = (path: string): SubPage => {
  if (path.includes("/docs")) return "docs";
  if (path.includes("/sheets")) return "sheets";
  if (path.includes("/slides")) return "slides";
  return "overview";
};

const OverviewPage = () => {
  const { isDemoMode } = useDataMode();
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
<div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Documents", count: 24, icon: FileText, path: "/productivity/docs", color: "text-blue-500" },
          { label: "Spreadsheets", count: 12, icon: Table2, path: "/productivity/sheets", color: "text-emerald-500" },
          { label: "Presentations", count: 8, icon: Presentation, path: "/productivity/slides", color: "text-orange-500" },
        ].map(item => (
          <SitaCard key={item.label} className="p-5 cursor-pointer" onClick={() => navigate(item.path)}>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-secondary p-2.5">
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">{item.count}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </SitaCard>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" /> Recent Documents
        </h3>
        <SitaButton variant="ghost" size="sm">
          <Plus className="h-3.5 w-3.5 mr-1" /> New Document
        </SitaButton>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(isDemoMode ? DEMO_RECENT_DOCS : [] as typeof DEMO_RECENT_DOCS).map(doc => (
          <SitaCard key={doc.id} className="p-4 cursor-pointer group">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <doc.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{doc.updated}</p>
              </div>
              <Star className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
            </div>
          </SitaCard>
        ))}
      </div>

      <SitaCard className="p-5" hover={false}>
        <SitaCardTitle sub="SITA can draft documents, analyze spreadsheets, and create presentations from your data">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI-Assisted Workspace</div>
        </SitaCardTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Draft a proposal from opportunity data", action: "Try it" },
            { label: "Create a budget from your bills & income", action: "Try it" },
            { label: "Build a board deck from boardroom data", action: "Try it" },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-border p-3">
              <p className="text-xs text-foreground">{item.label}</p>
              <SitaButton variant="ghost" size="sm" className="mt-2 text-primary">{item.action} →</SitaButton>
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
};

const pages: Record<SubPage, React.ComponentType> = {
  overview: OverviewPage,
  docs: DocsWorkspace,
  sheets: SheetsWorkspace,
  slides: SlidesWorkspace,
};

const ProductivityHub = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = subpageFromPath(location.pathname);

  const goTo = (key: string) => {
    if (key === "overview") navigate("/productivity");
    else navigate(`/productivity/${key}`);
  };

  const PageComponent = pages[activePage];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SitaPageHeader title="Workspace" subtitle="Documents, spreadsheets, and presentations — AI-assisted" />
      <SitaTabs
        tabs={[
          { key: "overview", label: "Overview" },
          { key: "docs", label: "Documents" },
          { key: "sheets", label: "Sheets" },
          { key: "slides", label: "Slides" },
        ]}
        active={activePage}
        onChange={goTo}
      />
      <AnimatePresence mode="wait">
        <motion.div key={activePage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          <Suspense fallback={<div className="p-6"><SectionSkeleton cards={2} columns={2} /></div>}>
            <PageComponent />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProductivityHub;
