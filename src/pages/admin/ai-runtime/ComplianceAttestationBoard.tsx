// ═══════════════════════════════════════════════════════════════
// Phase 9C — Compliance & Attestation board
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminControlPlaneShell } from "@/components/admin/shells/AdminControlPlaneShell";
import { Scale, FileBadge, RefreshCw, Gavel } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/sita/EmptyState";

interface Control { id: string; framework: string; control_id: string; title: string; status: string; collection_cadence: string; }
interface Evidence { id: string; control_id: string; collected_at: string; pass: boolean; failure_reason: string | null; }
interface Rule { id: string; rule_key: string; display_name: string; status: string; enforcement: string; version: number; }
interface Packet { id: string; packet_key: string; framework: string; controls_total: number; controls_passing: number; status: string; created_at: string; }

export default function ComplianceAttestationBoard() {
  const [controls, setControls] = useState<Control[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const [c, e, r, p] = await Promise.all([
      supabase.from("compliance_controls").select("*").order("framework").limit(50),
      supabase.from("compliance_evidence").select("*").order("collected_at", { ascending: false }).limit(30),
      supabase.from("policy_as_code_rules").select("*").order("rule_key").limit(50),
      supabase.from("attestation_packets").select("*").order("created_at", { ascending: false }).limit(10),
    ]);
    setControls((c.data as Control[]) ?? []);
    setEvidence((e.data as Evidence[]) ?? []);
    setRules((r.data as Rule[]) ?? []);
    setPackets((p.data as Packet[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function collectEvidence() {
    const { error } = await supabase.functions.invoke("compliance-evidence-collector", { body: {} });
    if (error) toast.error(error.message); else { toast.success("Evidence collected"); refresh(); }
  }

  async function buildPacket() {
    const { error } = await supabase.functions.invoke("attestation-packet-builder", { body: { framework: "soc2" } });
    if (error) toast.error(error.message); else { toast.success("Attestation packet sealed"); refresh(); }
  }

  return (
    <AdminControlPlaneShell contextScope="Compliance & Attestation">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2"><Scale className="h-6 w-6" /> Compliance & Attestation</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Continuous SOC2/ISO/HIPAA evidence + signed regulator-ready packets. L3 ceiling: drafts proposed, never auto-published.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" onClick={collectEvidence}>Collect evidence</Button>
            <Button size="sm" variant="secondary" onClick={buildPacket}>Build SOC2 packet</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Active controls ({controls.length})</CardTitle></CardHeader>
            <CardContent>
              {controls.length === 0 ? (
                <EmptyState
                  icon={<Scale className="h-5 w-5" />}
                  title="No compliance controls registered"
                  description="Controls populate as soon as a framework (SOC 2, ISO 27001, HIPAA…) is enabled in the compliance configuration. Each control declares its collection cadence and evidence type."
                />
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {controls.map(c => (
                    <div key={c.id} className="text-sm border-b pb-1">
                      <div className="font-medium">{c.framework.toUpperCase()} · {c.control_id}</div>
                      <div className="text-xs text-muted-foreground">{c.title} · {c.collection_cadence}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Gavel className="h-4 w-4" /> Policy-as-code rules</CardTitle></CardHeader>
            <CardContent>
              {rules.length === 0 ? (
                <EmptyState
                  icon={<Gavel className="h-5 w-5" />}
                  title="No policy-as-code rules registered"
                  description="Policy rules govern auto-enforcement against the active control set. Add a rule to enforce, monitor, or block at runtime."
                />
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {rules.map(r => (
                    <div key={r.id} className="flex items-center justify-between text-sm border-b pb-1">
                      <div>
                        <div className="font-medium">{r.display_name}</div>
                        <div className="text-xs text-muted-foreground">{r.rule_key} · v{r.version}</div>
                      </div>
                      <Badge variant={r.status === "active" ? "default" : "secondary"}>{r.enforcement}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileBadge className="h-4 w-4" /> Sealed attestation packets</CardTitle></CardHeader>
          <CardContent>
            {packets.length === 0 ? (
              <EmptyState
                icon={<FileBadge className="h-5 w-5" />}
                title="No attestation packets sealed yet"
                description="Packets are signed bundles of evidence at a point in time. They are produced on cadence per framework and immutable once sealed."
              />
            ) : (
              <div className="space-y-2">
                {packets.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm border-b pb-2">
                    <div>
                      <div className="font-medium">{p.packet_key}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.framework.toUpperCase()} · {p.controls_passing}/{p.controls_total} passing
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600">{p.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent evidence ({evidence.length})</CardTitle></CardHeader>
          <CardContent>
            {evidence.length === 0 ? (
              <EmptyState
                icon={<FileBadge className="h-5 w-5" />}
                title="No evidence collected in the current window"
                description="Evidence is gathered automatically by allow-listed collectors. The most recent collection per control is shown here once any data has been recorded."
              />
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {evidence.map(e => (
                  <div key={e.id} className="flex items-center justify-between text-xs border-b py-1">
                    <span className="font-mono">{e.id.slice(0, 8)}…</span>
                    <span className="text-muted-foreground">{new Date(e.collected_at).toLocaleString()}</span>
                    <Badge variant={e.pass ? "default" : "destructive"}>{e.pass ? "pass" : "fail"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminControlPlaneShell>
  );
}
