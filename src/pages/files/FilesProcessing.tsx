import { SitaPageHeader, SitaCard, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { ProcessingCard, type ProcessingStage } from "@/components/sita/FilesComponents";
import { Loader2, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFilesProcessing } from "@/hooks/use-domain-data";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const stageFromStatus = (status: string): ProcessingStage => {
  const map: Record<string, ProcessingStage> = {
    uploading: "ocr",
    processing: "parsing",
    classifying: "classifying",
    scanning: "scanning",
    review: "sensitivity-review",
    processed: "extraction-complete",
    linked: "linked",
    ready: "workflow-ready",
  };
  return map[status] || "parsing";
};

const inProgressStatuses = ["uploading", "processing", "classifying", "scanning", "review"];

const FilesProcessing = () => {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const { data: mockData = [] } = useFilesProcessing();

  const { data: realFiles } = useQuery({
    queryKey: ["file-processing-queue", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("file_metadata")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    staleTime: 10000,
  });

  const ingestedFiles = useMemo(() => {
    const files = realFiles && realFiles.length > 0 ? realFiles : mockData;
    return files.map((f: any) => ({
      ...f,
      filename: f.filename || f.name || "Unknown",
      textContent: f.extracted_data?.text || f.textContent || "",
      stage: stageFromStatus(f.status || "processing") as ProcessingStage,
      inProgress: inProgressStatuses.includes(f.status || "processing"),
    }));
  }, [realFiles, mockData]);

  const processingItems = ingestedFiles.filter(f => f.inProgress);
  const completedItems = ingestedFiles.filter(f => !f.inProgress);

  const domainFromText = (text: string) => {
    if (text.includes("invoice") || text.includes("NDA") || text.includes("agreement")) return "Business";
    if (text.includes("bank") || text.includes("statement") || text.includes("Insurance")) return "Finance";
    if (text.includes("school") || text.includes("Soccer") || text.includes("swimming")) return "Household";
    if (text.includes("Hotel") || text.includes("reservation")) return "Travel";
    return "General";
  };

  const sensitivityFromText = (text: string): "internal" | "confidential" | "restricted" | "governed" => {
    const lower = text.toLowerCase();
    if (lower.includes("ssn") || lower.includes("passport")) return "restricted";
    if (lower.includes("confidential") || lower.includes("nda") || lower.includes("bank")) return "confidential";
    if (lower.includes("insurance") || lower.includes("policy")) return "governed";
    return "internal";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <DemoModeBadge />
      <SitaPageHeader title="Processing Queue" subtitle="Real-time visibility into file intelligence pipeline" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="In Progress" value={processingItems.length} icon={Loader2} sub="Currently processing" />
        <KPITile label="Completed Today" value={completedItems.length} icon={CheckCircle} />
        <KPITile label="Needs Attention" value={ingestedFiles.filter(f => f.status === "review" || f.status === "failed").length || 1} icon={AlertTriangle} sub="Failed or uncertain" />
        <KPITile label="Avg Processing" value="~45s" icon={Clock} sub="Per file" />
      </div>

      <SitaSectionHeader title="In Progress" subtitle={`${processingItems.length} files being processed`} />
      <div className="space-y-2">
        {processingItems.map((item, i) => (
          <ProcessingCard
            key={i}
            name={item.filename}
            fileType={item.filename.split(".").pop() || "file"}
            stage={item.stage}
            domain={domainFromText(item.textContent || "")}
            sensitivity={sensitivityFromText(item.textContent || "")}
            confidence={65 + Math.round(Math.random() * 30)}
            highlights={item.textContent?.split(",").slice(0, 2).map((s: string) => s.trim())}
          />
        ))}
      </div>

      <SitaSectionHeader title="Recently Completed" subtitle="Ready for review or already linked" />
      <div className="space-y-2">
        {completedItems.map((item, i) => (
          <ProcessingCard
            key={i}
            name={item.filename}
            fileType={item.filename.split(".").pop() || "file"}
            stage={item.stage}
            domain={domainFromText(item.textContent || "")}
            sensitivity={sensitivityFromText(item.textContent || "")}
            confidence={85 + Math.round(Math.random() * 12)}
            highlights={item.textContent?.split(",").slice(0, 3).map((s: string) => s.trim())}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default FilesProcessing;
