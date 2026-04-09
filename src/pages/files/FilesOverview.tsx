import { SitaPageHeader, SitaCard, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { UniversalIntakeBox, ProcessingCard, WorkflowSuggestionCard, ConnectorStatusCard } from "@/components/sita/FilesComponents";
import { Upload, FolderOpen, Brain, Shield, FileText, Sparkles, Link2, AlertTriangle, Calendar, Bookmark } from "lucide-react";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState, useMemo } from "react";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { motion } from "framer-motion";
import { classifyFile, detectSensitivity, type FileClassification, type SensitivityLevel } from "@/lib/utils/file-classification";
import { FileUploader } from "@/components/sita/FileUploader";
import { useFilesOverview } from "@/hooks/use-domain-data";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAIInsight } from "@/hooks/use-backend-actions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";



type ViewVariant = "founder" | "household" | "finance" | "premium";


const sensitivityColor: Record<SensitivityLevel, string> = {
  public: "text-trust-safe",
  internal: "text-muted-foreground",
  confidential: "text-accent",
  restricted: "text-destructive",
};

const FilesOverview = () => {
  const { isDemoMode } = useDataMode();
  const { data: filesData = [] } = useFilesOverview();
  const { user } = useAuth();
  const aiInsight = useAIInsight();
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [analyzingFile, setAnalyzingFile] = useState<string | null>(null);

  // Real KPIs from file_metadata
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
      const result = await aiInsight.mutateAsync({
        intent: "file_analysis",
        domain: "general",
        context: { filename: fileName, text_preview: text?.slice(0, 500) || "" },
      });
      setAiResult(result?.recommendation || result?.response || "Analysis complete — no actionable insights found.");
      toast.success("AI analysis complete");
    } catch {
      toast.error("AI analysis unavailable");
    } finally {
      setAnalyzingFile(null);
    }
  };

  const [view, setView] = useState<ViewVariant>("founder");

  const classifiedFiles = useMemo(() =>
    filesData.map(f => ({
      ...f,
      classification: classifyFile(f.name, f.mime, f.text),
      sensitivity: detectSensitivity(f.text),
    })),
  []);

  const sensitiveCount = classifiedFiles.filter(f => f.sensitivity === "confidential" || f.sensitivity === "restricted").length;
  const classificationCounts = classifiedFiles.reduce((acc, f) => {
    acc[f.classification] = (acc[f.classification] || 0) + 1;
    return acc;
  }, {} as Record<FileClassification, number>);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <DemoModeBadge />
      <SitaPageHeader
        title="Files & Knowledge"
        subtitle="Intelligence intake layer — upload, scan, extract, link, and act"
        actions={<SitaButton variant="primary"><Upload className="h-4 w-4" /> Upload</SitaButton>}
      />

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

      <FileUploader />
      <UniversalIntakeBox />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Files This Week" value={realKpis?.total || classifiedFiles.length} trend="up" icon={FolderOpen} />
        <KPITile label="Sensitive Files" value={sensitiveCount} icon={Shield} sub="Confidential + Restricted" />
        <KPITile label="Obligations Found" value={realKpis?.obligations || 7} icon={Calendar} sub="From uploaded docs" />
        <KPITile label="Linked to Workflows" value={realKpis?.linked || 18} icon={Link2} />
      </div>

      {/* Classification breakdown */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(classificationCounts).slice(0, 4).map(([cls, count]) => (
          <KPITile key={cls} label={cls.charAt(0).toUpperCase() + cls.slice(1).replace("-", " ")} value={count as number} icon={FileText} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <SitaSectionHeader title="Classified Files" subtitle="Auto-classified with sensitivity detection" />
          {classifiedFiles.map((f, i) => (
            <SitaCard key={i} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg bg-primary/8 p-2"><FileText className="h-4 w-4 text-primary" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center rounded-md border border-border bg-secondary/40 px-1.5 py-px text-[10px] font-medium text-foreground">
                        {f.classification}
                      </span>
                      <span className={`text-[10px] font-medium ${sensitivityColor[f.sensitivity]}`}>
                        {f.sensitivity}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SitaButton
                    variant="ghost"
                    className="text-[10px] h-6 px-2"
                    onClick={() => handleAnalyze(f.name, f.text)}
                  >
                    {analyzingFile === f.name ? (
                      <span className="animate-pulse">Analyzing…</span>
                    ) : (
                      <><Brain className="h-3 w-3" /> Analyze</>
                    )}
                  </SitaButton>
                  <TrustBadge level={f.sensitivity === "restricted" ? "degraded" : f.sensitivity === "confidential" ? "review" : "verified"} size="sm" />
                </div>
              </div>
              {aiResult && analyzingFile === null && f.name === filesData[0]?.name && (
                <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 p-2">
                  <p className="text-[10px] text-primary font-medium flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Insight</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{aiResult}</p>
                </div>
              )}
            </SitaCard>
          ))}

          <SitaSectionHeader title="Workflow Suggestions" subtitle="Generated from recent uploads" />
          <WorkflowSuggestionCard title="Create bill reminder for Apex Corp contract" reason="Auto-renew clause detected — renewal date Mar 15, 2025" domain="Business · Money" affectsWho="Business operations" confidence={91} needsApproval />
          <WorkflowSuggestionCard title="Add school enrollment deadline to family calendar" reason="Form due date detected: April 15, 2024" domain="Household" affectsWho="Family" confidence={87} />
        </div>

        <div className="space-y-4">
          <SitaSectionHeader title="Knowledge Health" />
          <LiveAdvisorCard advisor="general" intent="knowledge_health" demoName="Knowledge Advisor" demoRole="Files Intelligence" demoConfidence="High" demoRecommendation={`${sensitiveCount} sensitive files detected. ${classifiedFiles.length} files auto-classified. Review restricted items.`} demoReasoning="Unlinked obligations may cause missed deadlines" />

          <SitaSectionHeader title="Recent Changes" />
          <SitaCard className="p-3">
            <div className="space-y-2.5">
              {[
                { action: "Contract uploaded & classified", time: "2h ago", trust: "verified" as const },
                { action: "Receipt OCR completed", time: "4h ago", trust: "safe" as const },
                { action: "Statement extraction corrected", time: "Yesterday", trust: "review" as const },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-foreground">{c.action}</p>
                    <p className="text-[10px] text-muted-foreground">{c.time}</p>
                  </div>
                  <TrustBadge level={c.trust} size="sm" />
                </div>
              ))}
            </div>
          </SitaCard>

          <SitaSectionHeader title="Sources & Connectors" />
          <ConnectorStatusCard name="Direct Upload" status="connected" lastSync="Now" />
          <ConnectorStatusCard name="Email Intake" status="disconnected" />
          <ConnectorStatusCard name="Cloud Drive" status="disconnected" />
          <ConnectorStatusCard name="Bank Statements" status="disconnected" />
        </div>
      </div>
    </motion.div>
  );
};

export default FilesOverview;
