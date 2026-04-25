import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SitaCard, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Plus, Trash2, Brain, BookOpen, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AdvisorKnowledgePanelProps {
  advisorId: string;
  domain: string;
  title?: string;
}

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  confidence: number;
  source: string;
  is_system: boolean;
  editable: boolean;
  advisor_id: string;
  domain: string;
}

export function AdvisorKnowledgePanel({ advisorId, domain, title = "Advisor Knowledge" }: AdvisorKnowledgePanelProps) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["advisor-knowledge", advisorId, domain],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke("advisor-knowledge-manage", {
        method: "GET",
        body: undefined,
        headers: { "Content-Type": "application/json" },
      });
      // Fallback: query directly if edge function not available
      if (!data?.entries) {
        const { data: directData } = await (supabase as any)
          .from("advisor_knowledge")
          .select("*")
          .or(`user_id.eq.${(await supabase.auth.getUser()).data.user?.id},user_id.eq.00000000-0000-0000-0000-000000000000`)
          .in("advisor_id", [advisorId, "sita-advisor"])
          .in("domain", [domain, "general"])
          .eq("status", "active")
          .order("confidence", { ascending: false })
          .limit(100);

        return (directData || []).map((e: any) => ({
          ...e,
          is_system: e.user_id === "00000000-0000-0000-0000-000000000000",
          editable: e.source === "user",
        }));
      }
      return data.entries as KnowledgeEntry[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("advisor_knowledge").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        advisor_id: advisorId,
        domain,
        title: newTitle,
        content: newContent,
        tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
        confidence: 0.8,
        source: "user",
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-knowledge"] });
      setNewTitle("");
      setNewContent("");
      setNewTags("");
      setShowAdd(false);
      toast.success("Knowledge added — your advisor just got smarter!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("advisor_knowledge").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-knowledge"] });
      toast.success("Knowledge removed");
    },
  });

  const systemEntries = entries.filter((e: KnowledgeEntry) => e.is_system);
  const userEntries = entries.filter((e: KnowledgeEntry) => !e.is_system);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SitaSectionHeader title={title} subtitle={`${entries.length} knowledge articles powering this advisor`} />
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Teach
        </Button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <SitaCard className="p-4 space-y-3 border-primary/20">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Teach your advisor something new
              </div>
              <Input
                placeholder="Knowledge title (e.g., 'My billing cycle')"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="What should the advisor know? Be specific — the more detail, the smarter the advice."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                rows={3}
              />
              <Input
                placeholder="Tags (comma-separated, e.g., billing, schedule)"
                value={newTags}
                onChange={e => setNewTags(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button
                  size="sm"
                  onClick={() => addMutation.mutate()}
                  disabled={!newTitle.trim() || !newContent.trim() || addMutation.isPending}
                >
                  {addMutation.isPending ? "Adding..." : "Add Knowledge"}
                </Button>
              </div>
            </SitaCard>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && <div className="text-sm text-muted-foreground animate-pulse">Loading knowledge base...</div>}

      {/* User knowledge */}
      {userEntries.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <BookOpen className="h-3 w-3" />
            Your Knowledge ({userEntries.length})
          </div>
          {userEntries.map((entry: KnowledgeEntry) => (
            <SitaCard key={entry.id} className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{entry.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{entry.content}</p>
                  {entry.tags?.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {entry.tags.map((tag, i) => (
                        <span key={i} className="rounded-md bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteMutation.mutate(entry.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </SitaCard>
          ))}
        </div>
      )}

      {/* System knowledge */}
      {systemEntries.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Brain className="h-3 w-3" />
            Built-in Expertise ({systemEntries.length})
          </div>
          {systemEntries.map((entry: KnowledgeEntry) => (
            <SitaCard key={entry.id} className="p-3 opacity-80">
              <div className="flex items-start gap-3">
                <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{entry.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{entry.content}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-muted-foreground">Confidence: {(entry.confidence * 100).toFixed(0)}%</span>
                    {entry.tags?.length > 0 && entry.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="rounded-md bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </SitaCard>
          ))}
        </div>
      )}
    </div>
  );
}
