import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, RefreshCw, FileWarning, ShieldCheck, ShieldAlert,
  Wrench, ChevronDown, ChevronRight, Search, Sparkles, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type StorageFile = { name: string; created_at?: string; updated_at?: string; metadata?: { size?: number } | null };
type Receipt = {
  id: string;
  timestamp: string;
  attestation: "auto" | "human" | string;
  approvers?: string[];
  file: string;
  failureClass: string;
  tier: "T0" | "T1" | "T2" | "T3" | "T4" | "REFUSAL" | string;
  action: string;
  before?: { signals?: string[] };
  after?: { applied?: boolean; notes?: string };
};

const TIER_TONE: Record<string, string> = {
  T0: "bg-muted text-muted-foreground",
  T1: "bg-trust-safe/15 text-trust-safe border-trust-safe/30",
  T2: "bg-primary/15 text-primary border-primary/30",
  T3: "bg-trust-warning/15 text-trust-warning border-trust-warning/30",
  T4: "bg-destructive/15 text-destructive border-destructive/30",
  REFUSAL: "bg-destructive/20 text-destructive border-destructive/40",
};

function tierTone(tier: string) {
  return TIER_TONE[tier] ?? "bg-secondary text-secondary-foreground";
}

export default function SelfHealRunsDashboard() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [receipts, setReceipts] = useState<Record<string, Receipt | { error: string }>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string | null>(null);

  const load = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("self-heal-receipts", {
        body: undefined,
        method: "GET",
      });
      if (error) throw error;
      const list = (data as { ok?: boolean; files?: StorageFile[] })?.files ?? [];
      setFiles(list);
    } catch (e) {
      setError((e as Error)?.message ?? "Failed to load heal receipts.");
      setFiles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const fetchReceipt = async (path: string) => {
    if (receipts[path]) return;
    try {
      const { data, error } = await supabase.functions.invoke(
        `self-heal-receipts?action=get&path=${encodeURIComponent(path)}`,
        { method: "GET" },
      );
      if (error) throw error;
      setReceipts(prev => ({ ...prev, [path]: (data as { receipt: Receipt }).receipt }));
    } catch (e) {
      setReceipts(prev => ({ ...prev, [path]: { error: (e as Error)?.message ?? "Failed" } }));
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return files.filter(f => {
      if (q && !f.name.toLowerCase().includes(q)) return false;
      if (tierFilter) {
        const r = receipts[f.name];
        if (!r || "error" in r) return false;
        if (r.tier !== tierFilter) return false;
      }
      return true;
    });
  }, [files, query, tierFilter, receipts]);

  const stats = useMemo(() => {
    const all = Object.values(receipts).filter((r): r is Receipt => !!r && !("error" in r));
    return {
      total: files.length,
      loaded: all.length,
      auto: all.filter(r => r.attestation === "auto").length,
      applied: all.filter(r => r.after?.applied).length,
      refused: all.filter(r => r.tier === "REFUSAL").length,
    };
  }, [files, receipts]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Self-Heal Run Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audit trail of every triage + heal action emitted by <code className="text-xs">scripts/test-self-heal.mjs</code>.
            Receipts are written by CI to the private <code className="text-xs">heal-receipts</code> store.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={refreshing}>
          <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total receipts" value={stats.total} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Loaded" value={stats.loaded} icon={<Sparkles className="h-4 w-4" />} />
        <StatCard label="Auto-attested" value={stats.auto} icon={<Wrench className="h-4 w-4" />} />
        <StatCard label="Applied" value={stats.applied} icon={<ShieldCheck className="h-4 w-4" />} tone="safe" />
        <StatCard label="Refusals" value={stats.refused} icon={<ShieldAlert className="h-4 w-4" />} tone="danger" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Heal attempts</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by filename…"
                  className="h-8 pl-7 w-56 text-xs"
                />
              </div>
              <div className="flex gap-1">
                {["T1", "T2", "T3", "T4", "REFUSAL"].map(t => (
                  <Button
                    key={t}
                    size="sm"
                    variant={tierFilter === t ? "default" : "outline"}
                    className="h-7 px-2 text-[10px]"
                    onClick={() => setTierFilter(tierFilter === t ? null : t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive flex items-center gap-2 mb-3">
              <FileWarning className="h-4 w-4" />
              {error}
            </div>
          )}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No heal receipts found. Run <code className="text-xs">npm run test:heal</code> in CI to populate.
            </div>
          ) : (
            <ScrollArea className="h-[520px] pr-3">
              <div className="space-y-1.5">
                {visible.map(f => {
                  const r = receipts[f.name];
                  const isOpen = expanded === f.name;
                  const receipt: Receipt | null = r && !("error" in r) ? r : null;
                  return (
                    <div key={f.name} className="rounded-lg border border-border/40 bg-card/50">
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary/30 rounded-lg transition-colors"
                        onClick={() => {
                          const next = isOpen ? null : f.name;
                          setExpanded(next);
                          if (next) fetchReceipt(f.name);
                        }}
                      >
                        {isOpen
                          ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{f.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {f.created_at ? new Date(f.created_at).toLocaleString() : "—"}
                            {receipt && (
                              <>
                                {" · "}
                                <span className="text-foreground/70">{receipt.action}</span>
                                {" on "}
                                <code>{receipt.file}</code>
                              </>
                            )}
                          </div>
                        </div>
                        {receipt && (
                          <>
                            <Badge variant="outline" className={cn("text-[10px] h-5", tierTone(receipt.tier))}>
                              {receipt.tier}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] h-5",
                                receipt.after?.applied
                                  ? "bg-trust-safe/15 text-trust-safe border-trust-safe/30"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {receipt.after?.applied ? "applied" : "proposed"}
                            </Badge>
                          </>
                        )}
                      </button>
                      {isOpen && (
                        <ReceiptDetails record={r} />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label, value, icon, tone,
}: { label: string; value: number; icon: React.ReactNode; tone?: "safe" | "danger" }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/40 bg-card p-3",
        tone === "safe" && "border-trust-safe/30",
        tone === "danger" && "border-destructive/30",
      )}
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}{label}
      </div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function ReceiptDetails({ record }: { record: Receipt | { error: string } | undefined }) {
  if (!record) {
    return (
      <div className="border-t border-border/30 px-4 py-3 text-xs text-muted-foreground">
        Loading receipt…
      </div>
    );
  }
  if ("error" in record) {
    return (
      <div className="border-t border-border/30 px-4 py-3 text-xs text-destructive flex items-center gap-2">
        <FileWarning className="h-3.5 w-3.5" />
        {record.error}
      </div>
    );
  }
  return (
    <div className="border-t border-border/30 px-4 py-3 space-y-3 text-xs">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KV label="Receipt ID" value={<code className="text-[10px]">{record.id}</code>} />
        <KV label="Timestamp" value={new Date(record.timestamp).toLocaleString()} />
        <KV label="Failure class" value={<code className="text-[10px]">{record.failureClass}</code>} />
        <KV label="Attestation" value={<Badge variant="outline" className="h-5 text-[10px]">{record.attestation}</Badge>} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Strategy</div>
        <div className="rounded-md bg-secondary/40 px-2 py-1.5 font-mono text-[11px]">{record.action}</div>
      </div>
      {record.before?.signals && record.before.signals.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Before · signals</div>
          <div className="flex flex-wrap gap-1">
            {record.before.signals.map(s => (
              <Badge key={s} variant="outline" className="text-[10px] h-5">{s}</Badge>
            ))}
          </div>
        </div>
      )}
      <div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">After · result</div>
        <div className={cn(
          "rounded-md border px-2 py-1.5 text-[11px]",
          record.after?.applied
            ? "border-trust-safe/30 bg-trust-safe/5"
            : "border-border/40 bg-muted/30"
        )}>
          <span className="font-medium">{record.after?.applied ? "Applied" : "Not applied"}</span>
          {record.after?.notes && <span className="text-muted-foreground"> — {record.after.notes}</span>}
        </div>
      </div>
      {record.approvers && record.approvers.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Approvers</div>
          <div className="flex flex-wrap gap-1">
            {record.approvers.map(a => (
              <Badge key={a} variant="outline" className="text-[10px] h-5">{a}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}