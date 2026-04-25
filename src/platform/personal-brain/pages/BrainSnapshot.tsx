import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Loader2, RefreshCw, Search, Sparkles } from "lucide-react";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { PageShell } from "@/components/sita/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MemoryCategoryFilter } from "@/components/personal-brain/MemoryCategoryFilter";
import { MemoryRow } from "@/components/personal-brain/MemoryRow";
import { PendingReviewTray } from "@/components/personal-brain/PendingReviewTray";
import { AddMemoryDialog } from "@/components/personal-brain/AddMemoryDialog";
import {
  usePbMemories,
  type PbMemoryCategory,
  type PbMemoryStatus,
} from "@/components/personal-brain/hooks/usePbMemories";

type StatusTab = "active" | "disabled" | "all";

function SnapshotInner() {
  const navigate = useNavigate();
  const {
    memories, loading, refresh, save, toggle, remove, triggerScan,
  } = usePbMemories();
  const [category, setCategory] = useState<PbMemoryCategory | "all">("all");
  const [statusTab, setStatusTab] = useState<StatusTab>("active");
  const [search, setSearch] = useState("");
  const [scanning, setScanning] = useState(false);

  const pending = useMemo(() => memories.filter((m) => m.status === "pending"), [memories]);

  const counts = useMemo(() => {
    const map: Partial<Record<PbMemoryCategory | "all", number>> = { all: 0 };
    for (const m of memories) {
      if (m.status === "pending") continue;
      map.all = (map.all ?? 0) + 1;
      const c = m.category as PbMemoryCategory;
      map[c] = (map[c] ?? 0) + 1;
    }
    return map;
  }, [memories]);

  const filtered = useMemo(() => {
    return memories.filter((m) => {
      if (m.status === "pending") return false;
      if (statusTab === "active" && m.status !== "active") return false;
      if (statusTab === "disabled" && m.status !== "disabled") return false;
      if (category !== "all" && m.category !== category) return false;
      if (search.trim() && !m.content.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [memories, statusTab, category, search]);

  const explicitCount = memories.filter((m) => m.kind === "explicit" && m.status !== "pending").length;
  const inferredCount = memories.filter((m) => m.kind === "inferred" && m.status === "active").length;
  const avgConfidence = (() => {
    const inf = memories.filter((m) => m.kind === "inferred" && m.status === "active");
    if (!inf.length) return 0;
    return Math.round((inf.reduce((s, m) => s + Number(m.confidence), 0) / inf.length) * 100);
  })();

  const handleApprove = async (id: string) => {
    try {
      await toggle(id, "active" as PbMemoryStatus);
      toast.success("Memory approved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const handleReject = async (id: string) => {
    try {
      await remove(id);
      toast.success("Memory rejected");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const handleScan = async () => {
    setScanning(true);
    try {
      await triggerScan();
      toast.success("Scan complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };
  const handleSave = async (input: { content: string; category: PbMemoryCategory }) => {
    try {
      await save({ ...input, kind: "explicit", confidence: 1.0 });
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => navigate("/personal-brain")}>
              <ArrowLeft className="h-4 w-4" />
              Brain
            </Button>
            <div className="rounded-lg bg-primary/10 p-2">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-foreground">Brain Snapshot</h1>
              <p className="truncate text-xs text-muted-foreground">
                Everything the Brain has learned about you. You stay in control.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void refresh()} className="h-8 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <AddMemoryDialog onSave={handleSave} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Explicit memories</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{explicitCount}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Things you've taught me directly</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Inferred memories</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{inferredCount}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Patterns I've picked up</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Avg confidence</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{avgConfidence}%</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Across active inferred items</p>
            </CardContent>
          </Card>
        </div>

        <PendingReviewTray
          pending={pending}
          onApprove={handleApprove}
          onReject={handleReject}
          onScan={handleScan}
          scanning={scanning}
        />

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">Memory library</h2>
              <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as StatusTab)}>
                <TabsList className="h-8">
                  <TabsTrigger value="active" className="h-6 text-[11px]">Active</TabsTrigger>
                  <TabsTrigger value="disabled" className="h-6 text-[11px]">Paused</TabsTrigger>
                  <TabsTrigger value="all" className="h-6 text-[11px]">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search memories…"
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>

            <MemoryCategoryFilter value={category} onChange={setCategory} counts={counts} />

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
                <Sparkles className="mx-auto h-6 w-6 text-muted-foreground/60" />
                <p className="mt-2 text-sm font-medium text-foreground">No memories yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use <code className="rounded bg-muted px-1">/remember …</code> in chat or click "Add memory" above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {filtered.map((m) => (
                  <MemoryRow
                    key={m.id}
                    memory={m}
                    onToggle={toggle}
                    onDelete={remove}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

export default function BrainSnapshot() {
  return (
    <GlobalErrorBoundary>
      <SnapshotInner />
    </GlobalErrorBoundary>
  );
}
