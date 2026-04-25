// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 8.b Admin: Workspace Federation Board
// Operator surface for cross-workspace memory federation.
//   • List active/revoked grants from workspace_federation_overview
//   • Create new federation (source → target, scopes, sensitivity)
//   • Revoke active federations
//   • Multi-modal ingest queue panel for the active workspace
// ═══════════════════════════════════════════════════════════════
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Network, Plus, Loader2, ShieldX } from "lucide-react";
import { toast } from "sonner";
import {
  useFederationOverview,
  useCreateFederation,
  useRevokeFederation,
} from "@/modules/_shared/knowledge/use-federation";
import { MultiModalIngestPanel } from "@/modules/_shared/knowledge/MultiModalIngestPanel";
import type { FederationSensitivity } from "@/modules/_shared/knowledge/federation-service";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  revoked: "destructive",
  expired: "outline",
};

const SENSITIVITIES: FederationSensitivity[] = ["public", "internal", "confidential", "restricted"];

function CreateFederationForm({ defaultSource, onCreated }: { defaultSource: string; onCreated: () => void }) {
  const [source, setSource] = useState(defaultSource);
  const [target, setTarget] = useState("");
  const [scopeChunks, setScopeChunks] = useState(true);
  const [scopeMemories, setScopeMemories] = useState(true);
  const [scopeVoice, setScopeVoice] = useState(false);
  const [maxSensitivity, setMaxSensitivity] = useState<FederationSensitivity>("internal");
  const [rationale, setRationale] = useState("");
  const create = useCreateFederation();

  const valid = source.length > 0 && target.length > 0 && rationale.trim().length >= 8;

  const submit = async () => {
    if (!valid) return;
    try {
      await create.mutateAsync({
        sourceWorkspaceId: source,
        targetWorkspaceId: target,
        scopeChunks,
        scopeMemories,
        scopeVoice,
        maxSensitivity,
        rationale: rationale.trim(),
      });
      toast.success("Federation created");
      setTarget("");
      setRationale("");
      onCreated();
    } catch (e) {
      toast.error("Create failed", { description: e instanceof Error ? e.message : String(e) });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="h-4 w-4" /> Grant federation
        </CardTitle>
        <CardDescription>
          Explicit, expiring share between workspaces. Owners on both sides keep RLS authority.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="src-ws">Source workspace ID</Label>
            <Input id="src-ws" value={source} onChange={(e) => setSource(e.target.value)} placeholder="uuid" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tgt-ws">Target workspace ID</Label>
            <Input id="tgt-ws" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="uuid" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="flex items-center justify-between gap-2 text-xs">
            <span>Chunks</span>
            <Switch checked={scopeChunks} onCheckedChange={setScopeChunks} />
          </label>
          <label className="flex items-center justify-between gap-2 text-xs">
            <span>Memories</span>
            <Switch checked={scopeMemories} onCheckedChange={setScopeMemories} />
          </label>
          <label className="flex items-center justify-between gap-2 text-xs">
            <span>Voice</span>
            <Switch checked={scopeVoice} onCheckedChange={setScopeVoice} />
          </label>
        </div>
        <div className="space-y-1">
          <Label>Max sensitivity</Label>
          <Select value={maxSensitivity} onValueChange={(v) => setMaxSensitivity(v as FederationSensitivity)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SENSITIVITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="rationale">Rationale</Label>
          <Textarea
            id="rationale"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Why is this share necessary? (>= 8 chars)"
            rows={2}
          />
        </div>
        <Button onClick={submit} disabled={!valid || create.isPending} className="w-full">
          {create.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Create federation
        </Button>
      </CardContent>
    </Card>
  );
}

function WorkspaceFederationBoard() {
  const { data, isLoading, refetch } = useFederationOverview();
  const revoke = useRevokeFederation();

  const [activeWorkspace, setActiveWorkspace] = useState("");

  const counts = useMemo(() => {
    const rows = data ?? [];
    return {
      total: rows.length,
      active: rows.filter((r) => r.status === "active").length,
      revoked: rows.filter((r) => r.status === "revoked").length,
      grants: rows.reduce((s, r) => s + (r.active_grants ?? 0), 0),
    };
  }, [data]);

  const onRevoke = async (id: string) => {
    try {
      await revoke.mutateAsync(id);
      toast.success("Federation revoked");
    } catch (e) {
      toast.error("Revoke failed", { description: e instanceof Error ? e.message : String(e) });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Network className="h-5 w-5" /> Workspace federation
        </h1>
        <p className="text-sm text-muted-foreground">
          Phase 8.b — explicit cross-workspace memory + voice + chunk sharing with expiry & revoke.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.total },
          { label: "Active", value: counts.active },
          { label: "Revoked", value: counts.revoked },
          { label: "Grants", value: counts.grants },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-2xl font-semibold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CreateFederationForm
          defaultSource={activeWorkspace}
          onCreated={() => refetch()}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active federations</CardTitle>
            <CardDescription>Latest 50 grants across both directions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[420px] pr-3">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : !data?.length ? (
                <p className="text-sm text-muted-foreground">No federations yet — grant your first share above.</p>
              ) : (
                <ul className="space-y-2">
                  {data.slice(0, 50).map((f) => (
                    <li key={f.federation_id ?? Math.random()} className="rounded-md border p-3 text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_VARIANT[f.status ?? "active"] ?? "default"}>{f.status}</Badge>
                        <span className="font-mono text-xs truncate">
                          {f.source_workspace_id?.slice(0, 8)} → {f.target_workspace_id?.slice(0, 8)}
                        </span>
                        <Badge variant="outline" className="ml-auto">{f.max_sensitivity}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                        {f.scope_chunks ? <span>chunks</span> : null}
                        {f.scope_memories ? <span>memories</span> : null}
                        {f.scope_voice ? <span>voice</span> : null}
                        <span className="ml-auto">grants {f.active_grants ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-muted-foreground">
                          expires {f.expires_at ? new Date(f.expires_at).toLocaleDateString() : "—"}
                        </span>
                        {f.status === "active" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => f.federation_id && onRevoke(f.federation_id)}
                            disabled={revoke.isPending}
                          >
                            <ShieldX className="h-3 w-3 mr-1" /> Revoke
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Multi-modal ingest sandbox</CardTitle>
          <CardDescription>
            Drop a workspace UUID below, then upload image/audio/video to queue for embedding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1 max-w-md">
            <Label htmlFor="active-ws">Active workspace ID</Label>
            <Input
              id="active-ws"
              value={activeWorkspace}
              onChange={(e) => setActiveWorkspace(e.target.value)}
              placeholder="uuid"
            />
          </div>
          {activeWorkspace ? (
            <MultiModalIngestPanel workspaceId={activeWorkspace} pillar="shared" />
          ) : (
            <p className="text-xs text-muted-foreground">Enter a workspace ID to enable uploads.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default WorkspaceFederationBoard;