import { KPITile } from "@/components/sita/SitaComponents";
import { MemoryReviewCard } from "@/components/sita/FilesComponents";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { Brain, Eye, RotateCcw, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAllFiles } from "@/hooks/use-domain-data";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";

const FilesMemoryReview = () => {
  const { data: files = [], isLoading: loadingFiles } = useAllFiles();

  const { data: memories = [], isLoading: loadingMemories } = useQuery({
    queryKey: ["advisor-memories-files"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await db.from("advisor_memories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error || !data) return [];
      return data;
    },
  });

  const memoryItems = useMemo(() => {
    const fromMemories = memories.map((m: Record<string, any>) => ({
      learned: m.content,
      source: m.metadata?.source_file || "System learned",
      writtenTo: `${m.memory_type} Memory`,
      canCorrect: true,
      canForget: true,
    }));

    const fromFiles = files
      .filter((f: Record<string, any>) => f.extracted_data?.text && f.status === "complete")
      .slice(0, 10)
      .map((f: Record<string, any>) => {
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

  const graphLinks = useMemo(() => {
    const entityMap: Record<string, string[]> = {};
    files.forEach((f: Record<string, any>) => {
      const text = `${f.filename} ${f.extracted_data?.text || ""}`;
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
      <PageTruthBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Memory Items" value={memoryItems.length} icon={Brain} sub="From files & advisors" />
        <KPITile label="Graph Links" value={graphLinks.reduce((s, g) => s + g.linkCount, 0)} icon={Eye} sub="Cross-domain connections" />
        <KPITile label="Source Files" value={files.filter((f: Record<string, any>) => f.extracted_data?.text).length} icon={RotateCcw} sub="With extracted data" />
        <KPITile label="Forgotten Items" value={0} icon={Trash2} sub="User-removed" />
      </div>

      {isLoading ? (
        <SectionSkeleton cards={3} columns={1} />
      ) : (
        <>
          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">What the System Learned</h3>
            {memoryItems.length > 0 ? (
              memoryItems.map((item, i) => <MemoryReviewCard key={i} {...item} />)
            ) : (
              <PremiumEmptyState variant="no-data" icon={Brain} title="No memory items yet" description="Upload and process files to build system memory. Each extracted fact becomes a reviewable memory item." />
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Entity Graph Links</h3>
            {graphLinks.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {graphLinks.map((g, i) => (
                  <div key={i} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
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
                  </div>
                ))}
              </div>
            ) : (
              <PremiumEmptyState variant="no-data" icon={Eye} title="No graph links yet" description="Process more files to build entity connections across domains." />
            )}
          </div>
        </>
      )}

      <ModuleAdvisorInsight advisorName="Memory & Knowledge Advisor" domain="business" insight={memoryItems.length > 0
            ? `${memoryItems.length} memory items from ${files.filter((f: Record<string, any>) => f.extracted_data?.text).length} source files. ${graphLinks.length} entity graph clusters detected. You can correct or forget any item.`
            : "No memory items yet. Upload and process files to build your knowledge graph."} linkedItems={["Entity graph", "Memory corrections", "Source files"]} />
    </motion.div>
  );
};

function classifyMemoryDomain(f: Record<string, any>): string {
  const text = `${f.filename} ${f.classification || ""}`.toLowerCase();
  if (text.includes("invoice") || text.includes("contract")) return "Business";
  if (text.includes("bank") || text.includes("statement")) return "Finance";
  if (text.includes("school") || text.includes("kid")) return "Household";
  return "General";
}

function extractEntities(text: string): string[] {
  const entities: string[] = [];
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
