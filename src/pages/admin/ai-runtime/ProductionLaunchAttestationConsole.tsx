// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 16 · Production Launch Attestation Console
// Operator-facing surface for the production-launch-attestor edge
// function and the production_launch_attestations append-only table.
// Read-only history + signed attestation issuance with evidence hash.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, FileSignature, RefreshCw, Lock, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Attestation {
  id: string;
  surface_key: string;
  launch_posture: string;
  attested_by: string | null;
  evidence_hash: string | null;
  signature: string | null;
  release_tag: string | null;
  evidence: unknown;
  attested_at: string;
  created_at: string;
}

const POSTURES = ["green", "yellow", "red", "deferred", "archived"] as const;
const SURFACES = [
  "web-spa",
  "ubuntu-iso",
  "electron-shell",
  "edge-functions",
  "evidence-graph",
  "security-fabric",
  "advisor-board",
] as const;

export default function ProductionLaunchAttestationConsole() {
  const [items, setItems] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [surface, setSurface] = useState<string>(SURFACES[0]);
  const [posture, setPosture] = useState<string>("green");
  const [releaseTag, setReleaseTag] = useState("");
  const [evidence, setEvidence] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("production_launch_attestations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) toast.error(error.message);
    else setItems((data ?? []) as Attestation[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function attest() {
    if (!surface || !posture) {
      toast.error("Select surface and posture");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.functions.invoke("production-launch-attestor", {
      body: {
        surface_key: surface,
        launch_posture: posture,
        release_tag: releaseTag || null,
        evidence: evidence ? { raw: evidence } : null,
      },
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Attestation signed and recorded");
      setReleaseTag("");
      setEvidence("");
      load();
    }
    setSubmitting(false);
  }

  const latestBySurface = useMemo(() => {
    const map = new Map<string, Attestation>();
    for (const a of items) if (!map.has(a.surface_key)) map.set(a.surface_key, a);
    return map;
  }, [items]);

  const postureTone = (p: string) =>
    p === "green" ? "default" : p === "yellow" ? "secondary" : p === "red" ? "destructive" : "outline";

  return (
    <AdminControlPlaneShell contextScope="AI Runtime · Production Launch Attestation">
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6" /> Production Launch Attestation
            </h1>
            <p className="text-sm text-muted-foreground">
              Phase 16 · Sign launch postures per surface. Records are append-only and SHA-256 signed.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSignature className="h-5 w-5" /> Issue new attestation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Surface</Label>
                <Select value={surface} onValueChange={setSurface}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SURFACES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Posture</Label>
                <Select value={posture} onValueChange={setPosture}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {POSTURES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Release tag (optional)</Label>
              <Input value={releaseTag} onChange={e => setReleaseTag(e.target.value)} placeholder="e.g. v2026.04.19-rc1" />
            </div>
            <div className="space-y-2">
              <Label>Evidence reference (optional)</Label>
              <Textarea value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="Paste evidence JSON, report path, or release-decisions ID…" rows={3} />
            </div>
            <div className="flex justify-end">
              <Button onClick={attest} disabled={submitting}>
                <Lock className="h-4 w-4 mr-1" />
                {submitting ? "Signing…" : "Sign & record"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latest posture by surface</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SURFACES.map(s => {
              const a = latestBySurface.get(s);
              return (
                <div key={s} className="flex items-center justify-between border rounded-md p-3 text-sm">
                  <span className="font-mono text-xs">{s}</span>
                  {a ? (
                    <div className="flex items-center gap-3">
                      <Badge variant={postureTone(a.launch_posture)}>{a.launch_posture}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline">no attestation</Badge>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attestation history (append-only)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!loading && items.length === 0 && (
              <div className="text-sm text-muted-foreground">No attestations recorded yet.</div>
            )}
            {items.map(a => (
              <div key={a.id} className="border rounded-md p-3 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{a.surface_key}</span>
                    <Badge variant={postureTone(a.launch_posture)}>{a.launch_posture}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </span>
                </div>
                {a.release_tag && <div className="text-xs text-muted-foreground">tag: {a.release_tag}</div>}
                {a.signature && (
                  <div className="text-[10px] font-mono text-muted-foreground truncate">
                    sig: {a.signature.slice(0, 32)}…
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminControlPlaneShell>
  );
}
