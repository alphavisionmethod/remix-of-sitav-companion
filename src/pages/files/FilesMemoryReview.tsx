import { SitaPageHeader, SitaSectionHeader, SitaCard } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { MemoryReviewCard } from "@/components/sita/FilesComponents";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { Brain, Eye, RotateCcw, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAllFiles } from "@/hooks/use-domain-data";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";


interface FilesMemoryReviewRow {
  classification?: unknown;
  content?: unknown;
  extracted_data?: unknown;
  filename?: unknown;
  memory_type?: unknown;
  metadata?: unknown;
  sensitivity?: unknown;
  status?: string;
}

const FilesMemoryReview = () => {
  const { isDemoMode } = useDataMode();
  const { data: files = [], isLoading: loadingFiles } = useAllFiles();

  // Fetch advisor memories derived from files
  const { data: memories = [], isLoading: loadingMemories } = useQuery({
    queryKey: ["advisor-memories-files"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("advisor_memories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error || !data) return [];
      return data;
    },
  });

  // Build memory items from files that have extracted data
  const memoryItems = useMemo(() => {
    // First use real advisor memories
    const fromMemories = memories.map((m: FilesMemoryReviewRow) => ({
      learned: m.content,
      source: m.metadata?.source_file || "System learned",
      writtenTo: `${m.memory_type} Memory`,
      canCorrect: true,
      canForget: true,
    }));

    // Then augment with file-derived knowledge
    const fromFiles = files
      .filter((f: FilesMemoryReviewRow) => f.extracted_data?.text && f.status === "complete")
      .slice(0, 10)
      .map((f: FilesMemoryReviewRow) => {
        const text = (f.extracted_data?.text || "") as string;
        return {
          learned: text.length > 120 ? text.slice(0, 120) + "..." : text,
          source: f.filename,
          writtenTo: `${classifyMemoryDomain(f)} Memory`,
          canCorrect: true,
          canForget: f.sensitivity !== "restricted",
        };
      });

    return fromMemories.length > 0 ? fromMemories : fromFiles;
  }, [memories, files]);

  // Build entity graph from files
  const graphLinks = useMemo(() => {
    const entityMap: Record<string, string[]> = {};
    files.forEach((f: FilesMemoryReviewRow) => {
      const text = `${f.filename} ${f.extracted_data?.text || ""}`;
      // Simple entity extraction
      const entities = extractEntities(text);
      entities.forEach(entity => {
        if (!entityMap[entity]) entityMap[entity] = [];
        entityMap[entity].push(f.filename);
      });
    });
    return Object.entries(entityMap)
      .filter(([, items]) => items.length >= 1)
      .slice(0, 8)
      .map(([entity, items]) => ({
        entity,
        linkedItems: [...new Set(items)].slice(0, 5),
        linkCount: items.length,
      }));
  }, [files]);

  const isLoading = loadingFiles || loadingMemories;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <DemoModeBadge />
      <SitaPageHeader title="Memory Review" subtitle="What the system learned from your files — review, correct, or forget" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Memory Items" value={memoryItems.length} icon={Brain} sub="From files & advisors" />
        <KPITile label="Graph Links" value={graphLinks.reduce((s, g) => s + g.linkCount, 0)} icon={Eye} sub="Cross-domain connections" />
        <KPITile label="Source Files" value={files.filter((f: FilesMemoryReviewRow) => f.extracted_data?.text).length} icon={RotateCcw} sub="With extracted data" />
        <KPITile label="Forgotten Items" value={0} icon={Trash2} sub="User-removed" />
      </div>

      {isLoading ? (
        <SectionSkeleton cards={3} columns={1} />
      ) : (
        <>
          <SitaSectionHeader title="What the System Learned" subtitle="Each item shows source, destination, and your control options" />
          {memoryItems.length > 0 ? (
            <div className="space-y-3">
              {memoryItems.map((item, i) => <MemoryReviewCard key={i} {...item} />)}
            </div>
          ) : (
            <EmptyState icon={Brain} title="No memory items yet" description="Upload and process files to build system memory" />
          )}

          <SitaSectionHeader title="Entity Graph Links" subtitle="How files created cross-domain connections" />
          {graphLinks.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {graphLinks.map((g, i) => (
                <SitaCard key={i} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/8 font-display text-xs font-semibold text-primary">
                      {g.entity.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{g.entity}</p>
                      <p className="text-[10px] text-muted-foreground">{g.linkCount} connection{g.linkCount !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.linkedItems.map((item, j) => (
                      <span key={j} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground truncate max-w-[200px]">{item}</span>
                    ))}
                  </div>
                </SitaCard>
              ))}
            </div>
          ) : (
            <EmptyState icon={Eye} title="No graph links yet" description="Process more files to build entity connections" />
          )}
        </>
      )}
    </motion.div>
  );
};

function classifyMemoryDomain(f: FilesMemoryReviewRow): string {
  const text = `${f.filename} ${f.classification || ""}`.toLowerCase();
  if (text.includes("invoice") || text.includes("contract")) return "Business";
  if (text.includes("bank") || text.includes("statement")) return "Finance";
  if (text.includes("school") || text.includes("kid")) return "Household";
  return "General";
}

function extractEntities(text: string): string[] {
  const entities: string[] = [];
  // Simple proper noun extraction (capitalized words)
  const matches = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
  if (matches) {
    matches
      .filter(m => m.length > 3 && !["The", "This", "That", "From", "With", "For"].includes(m))
      .slice(0, 5)
      .forEach(m => entities.push(m));
  }
  return [...new Set(entities)];
}

export default FilesMemoryReview;
