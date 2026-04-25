import { AdminControlPlaneShell as AdminShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Archive, AlertCircle, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BoardAPI, type BoardMemory } from "@/lib/services/board-api-client";
import { toast } from "sonner";

export default function AdvisorMemoryInspector() {
  const queryClient = useQueryClient();

  const shortTerm = useQuery({ queryKey: ["admin-memory-short"], queryFn: () => BoardAPI.listMemory({ memory_layer: "short_term", limit: 100 }) });
  const midTerm = useQuery({ queryKey: ["admin-memory-mid"], queryFn: () => BoardAPI.listMemory({ memory_layer: "mid_term", limit: 100 }) });
  const longTerm = useQuery({ queryKey: ["admin-memory-long"], queryFn: () => BoardAPI.listMemory({ memory_layer: "long_term", limit: 100 }) });
  const preference = useQuery({ queryKey: ["admin-memory-pref"], queryFn: () => BoardAPI.listMemory({ memory_layer: "preference", limit: 100 }) });
  const procedural = useQuery({ queryKey: ["admin-memory-proc"], queryFn: () => BoardAPI.listMemory({ memory_layer: "procedural", limit: 100 }) });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => BoardAPI.archiveMemory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-memory-short"] });
      queryClient.invalidateQueries({ queryKey: ["admin-memory-mid"] });
      queryClient.invalidateQueries({ queryKey: ["admin-memory-long"] });
      queryClient.invalidateQueries({ queryKey: ["admin-memory-pref"] });
      queryClient.invalidateQueries({ queryKey: ["admin-memory-proc"] });
      toast.success("Memory archived");
    },
  });

  const MemoryCard = ({ mem }: { mem: BoardMemory }) => (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium">{mem.content}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {mem.advisor_id} · {mem.category} · Importance: {Math.round(mem.importance * 100)}%
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge variant="secondary" className="text-[9px]">{Math.round(mem.confidence * 100)}%</Badge>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => archiveMutation.mutate(mem.id)}>
            <Archive className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );

  const layers = [
    { key: "short_term", label: "Short-term", data: shortTerm.data?.memories ?? [] },
    { key: "mid_term", label: "Mid-term", data: midTerm.data?.memories ?? [] },
    { key: "long_term", label: "Long-term", data: longTerm.data?.memories ?? [] },
    { key: "preference", label: "Preference", data: preference.data?.memories ?? [] },
    { key: "procedural", label: "Procedural", data: procedural.data?.memories ?? [] },
  ];

  const totalMemories = layers.reduce((s, l) => s + l.data.length, 0);

  return (
    <AdminShell contextScope="Memory Inspector">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Advisor Memory Inspector
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Browse, correct, and archive advisor memory across all 5 layers</p>
          </div>
          <Badge variant="outline">{totalMemories} memories</Badge>
        </div>

        <Tabs defaultValue="short_term">
          <TabsList>
            {layers.map(l => (
              <TabsTrigger key={l.key} value={l.key}>{l.label} ({l.data.length})</TabsTrigger>
            ))}
          </TabsList>
          {layers.map(l => (
            <TabsContent key={l.key} value={l.key} className="space-y-2 mt-3">
              {l.data.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No {l.label.toLowerCase()} memories stored</p>}
              {l.data.map(m => <MemoryCard key={m.id} mem={m} />)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminShell>
  );
}
