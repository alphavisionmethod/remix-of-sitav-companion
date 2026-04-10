// ═══════════════════════════════════════════════════════════════
// ITC10 — Runtime Evidence Center
// Aggregates live signals per spec from os_event_log, sita_receipts, etc.
// ═══════════════════════════════════════════════════════════════

import { useSpecRegistry, type SpecRegistryEntry } from "@/hooks/use-implementation-truth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Zap, FileCheck2, Database, Brain, CheckCircle2, XCircle } from "lucide-react";

interface DomainEvidence {
  domain: string;
  eventCount: number;
  receiptCount: number;
  actionCount: number;
  memoryCount: number;
}

function useRuntimeEvidence() {
  return useQuery({
    queryKey: ["runtime-evidence-counts"],
    queryFn: async (): Promise<DomainEvidence[]> => {
      const domains = new Map<string, DomainEvidence>();
      const ensure = (d: string) => {
        if (!domains.has(d)) domains.set(d, { domain: d, eventCount: 0, receiptCount: 0, actionCount: 0, memoryCount: 0 });
        return domains.get(d)!;
      };

      // Event log counts by domain
      try {
        const { data: events } = await supabase
          .from("os_event_log")
          .select("event_domain")
          .limit(1000);
        (events || []).forEach((e: any) => { ensure(e.event_domain || "unknown").eventCount++; });
      } catch {}

      // Receipt counts by domain
      try {
        const { data: receipts } = await supabase
          .from("sita_receipts")
          .select("domain")
          .limit(1000);
        (receipts || []).forEach((r: any) => { ensure(r.domain || "unknown").receiptCount++; });
      } catch {}

      // Action lineage counts by domain
      try {
        const { data: actions } = await supabase
          .from("os_action_lineage")
          .select("domain")
          .limit(1000);
        (actions || []).forEach((a: any) => { ensure(a.domain || "unknown").actionCount++; });
      } catch {}

      // Memory counts by scope
      try {
        const { data: memories } = await supabase
          .from("os_memory_scoped")
          .select("scope")
          .limit(1000);
        (memories || []).forEach((m: any) => { ensure(m.scope || "unknown").memoryCount++; });
      } catch {}

      return Array.from(domains.values()).sort((a, b) => {
        const totalA = a.eventCount + a.receiptCount + a.actionCount + a.memoryCount;
        const totalB = b.eventCount + b.receiptCount + b.actionCount + b.memoryCount;
        return totalB - totalA;
      });
    },
    staleTime: 30_000,
  });
}

function SpecEvidenceRow({ spec, evidence }: { spec: SpecRegistryEntry; evidence: Map<string, DomainEvidence> }) {
  const module = spec.owning_module.toLowerCase();
  const ev = evidence.get(module) || evidence.get(spec.spec_id) || null;
  const total = ev ? ev.eventCount + ev.receiptCount + ev.actionCount + ev.memoryCount : 0;
  const isLive = total > 0;

  return (
    <TableRow>
      <TableCell className="text-[11px] font-medium">{spec.canonical_name}</TableCell>
      <TableCell><Badge variant="outline" className="text-[8px] h-4 font-mono">{spec.owning_module}</Badge></TableCell>
      <TableCell className="text-center text-[11px]">{ev?.eventCount || 0}</TableCell>
      <TableCell className="text-center text-[11px]">{ev?.receiptCount || 0}</TableCell>
      <TableCell className="text-center text-[11px]">{ev?.actionCount || 0}</TableCell>
      <TableCell className="text-center text-[11px]">{ev?.memoryCount || 0}</TableCell>
      <TableCell>
        {isLive ? (
          <Badge className="text-[8px] h-4 bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Live
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[8px] h-4">
            <XCircle className="h-2.5 w-2.5 mr-1" /> No Evidence
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function ITC10RuntimeEvidence() {
  const { data: specs, isLoading: loadingSpecs } = useSpecRegistry();
  const { data: evidence, isLoading: loadingEvidence } = useRuntimeEvidence();

  const evidenceMap = new Map((evidence || []).map(e => [e.domain, e]));
  const totalEvents = (evidence || []).reduce((s, e) => s + e.eventCount, 0);
  const totalReceipts = (evidence || []).reduce((s, e) => s + e.receiptCount, 0);
  const totalActions = (evidence || []).reduce((s, e) => s + e.actionCount, 0);
  const totalMemory = (evidence || []).reduce((s, e) => s + e.memoryCount, 0);

  const isLoading = loadingSpecs || loadingEvidence;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Runtime Evidence Center</h1>
          <Badge variant="outline" className="text-[8px]">ITC10</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Aggregated runtime signals proving features are live, not just built</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><Zap className="h-4 w-4 text-primary mx-auto mb-1" /><div className="text-2xl font-bold text-foreground">{totalEvents}</div><div className="text-[10px] text-muted-foreground">Events</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><FileCheck2 className="h-4 w-4 text-primary mx-auto mb-1" /><div className="text-2xl font-bold text-foreground">{totalReceipts}</div><div className="text-[10px] text-muted-foreground">Receipts</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Database className="h-4 w-4 text-primary mx-auto mb-1" /><div className="text-2xl font-bold text-foreground">{totalActions}</div><div className="text-[10px] text-muted-foreground">Actions</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Brain className="h-4 w-4 text-primary mx-auto mb-1" /><div className="text-2xl font-bold text-foreground">{totalMemory}</div><div className="text-[10px] text-muted-foreground">Memories</div></CardContent></Card>
      </div>

      {/* Per-domain raw evidence */}
      {(evidence || []).length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Evidence by Domain</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Domain</TableHead>
                  <TableHead className="text-[10px] text-center">Events</TableHead>
                  <TableHead className="text-[10px] text-center">Receipts</TableHead>
                  <TableHead className="text-[10px] text-center">Actions</TableHead>
                  <TableHead className="text-[10px] text-center">Memories</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(evidence || []).map(e => (
                  <TableRow key={e.domain}>
                    <TableCell className="text-[11px] font-mono">{e.domain}</TableCell>
                    <TableCell className="text-center text-[11px]">{e.eventCount}</TableCell>
                    <TableCell className="text-center text-[11px]">{e.receiptCount}</TableCell>
                    <TableCell className="text-center text-[11px]">{e.actionCount}</TableCell>
                    <TableCell className="text-center text-[11px]">{e.memoryCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Per-spec evidence mapping */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Per-Spec Runtime Evidence</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Spec</TableHead>
                <TableHead className="text-[10px]">Module</TableHead>
                <TableHead className="text-[10px] text-center">Events</TableHead>
                <TableHead className="text-[10px] text-center">Receipts</TableHead>
                <TableHead className="text-[10px] text-center">Actions</TableHead>
                <TableHead className="text-[10px] text-center">Memories</TableHead>
                <TableHead className="text-[10px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground text-sm py-4">Loading...</TableCell></TableRow>
              ) : (specs || []).length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground text-sm py-4">No specs registered</TableCell></TableRow>
              ) : (
                (specs || []).map(s => <SpecEvidenceRow key={s.id} spec={s} evidence={evidenceMap} />)
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
