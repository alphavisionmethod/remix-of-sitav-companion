// ═══════════════════════════════════════════════════════════════
// ITC03 — Contract Verification Board (with type, consumers, orphans)
// ═══════════════════════════════════════════════════════════════

import { useSpecRegistry, useContractVerification } from "@/hooks/use-implementation-truth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, FileCheck, AlertTriangle, Package, Ghost } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  api: "text-blue-500 border-blue-500/30",
  event: "text-amber-500 border-amber-500/30",
  schema: "text-purple-500 border-purple-500/30",
  view_model: "text-cyan-500 border-cyan-500/30",
  action_state: "text-indigo-500 border-indigo-500/30",
  proof: "text-green-500 border-green-500/30",
  policy: "text-orange-500 border-orange-500/30",
  other: "text-muted-foreground border-border",
};

export default function ITC03ContractVerification() {
  const { data: specs, isLoading } = useSpecRegistry();
  const { totalRequired, contracts, orphans } = useContractVerification(specs);
  const present = contracts.filter(c => c.status === "present").length;
  const missing = contracts.filter(c => c.status === "missing").length;

  const duplicateCandidates: { a: string; b: string }[] = [];
  const names = contracts.map(c => c.contract);
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i].replace(/-/g, "").toLowerCase();
      const b = names[j].replace(/-/g, "").toLowerCase();
      if (a.includes(b) || b.includes(a)) duplicateCandidates.push({ a: names[i], b: names[j] });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileCheck className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Contract Verification Board</h1>
          <Badge variant="outline" className="text-[8px]">ITC-03</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Cross-reference contract existence, type classification, alignment, and shadow detection</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4 text-center"><Package className="h-5 w-5 mx-auto text-primary mb-1" /><div className="text-2xl font-bold">{totalRequired}</div><div className="text-[10px] text-muted-foreground">Total Contracts</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><CheckCircle2 className="h-5 w-5 mx-auto text-green-500 mb-1" /><div className="text-2xl font-bold text-green-500">{present}</div><div className="text-[10px] text-muted-foreground">Present</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><XCircle className="h-5 w-5 mx-auto text-destructive mb-1" /><div className="text-2xl font-bold text-destructive">{missing}</div><div className="text-[10px] text-muted-foreground">Missing</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-yellow-500 mb-1" /><div className="text-2xl font-bold text-yellow-500">{duplicateCandidates.length}</div><div className="text-[10px] text-muted-foreground">Shadows</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Ghost className="h-5 w-5 mx-auto text-orange-500 mb-1" /><div className="text-2xl font-bold text-orange-500">{orphans?.length || 0}</div><div className="text-[10px] text-muted-foreground">Orphans</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileCheck className="h-4 w-4" />Contract Registry ({contracts.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Contract</TableHead>
                <TableHead className="text-[10px]">Type</TableHead>
                <TableHead className="text-[10px]">Status</TableHead>
                <TableHead className="text-[10px]">Required By</TableHead>
                <TableHead className="text-[10px]">Consumers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-[11px] text-muted-foreground py-8">Loading…</TableCell></TableRow>
              ) : contracts.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-[11px] text-muted-foreground py-8">No contracts registered</TableCell></TableRow>
              ) : contracts.map(c => (
                <TableRow key={c.contract}>
                  <TableCell className="text-[11px] font-mono">{c.contract}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[8px] ${TYPE_COLORS[c.type] || ""}`}>{c.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {c.status === "present" ? (
                      <Badge variant="outline" className="text-[8px] text-green-500 border-green-500/30">Present</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[8px]">Missing</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">{c.requiredBy.map(r => <Badge key={r} variant="secondary" className="text-[8px]">{r}</Badge>)}</div>
                  </TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{c.consumers}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {orphans && orphans.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Ghost className="h-4 w-4 text-orange-500" />Orphan Contracts (single consumer, missing)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orphans.map((o, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <Badge variant="outline" className="text-[8px] font-mono">{o.contract}</Badge>
                  <Badge variant="outline" className={`text-[8px] ${TYPE_COLORS[o.type] || ""}`}>{o.type}</Badge>
                  <span className="text-muted-foreground">← {o.requiredBy[0]}</span>
                  <span className="text-[10px] text-orange-500">Orphaned</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {duplicateCandidates.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" />Potential Shadow Contracts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {duplicateCandidates.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <Badge variant="outline" className="text-[8px] font-mono">{d.a}</Badge>
                  <span className="text-muted-foreground">↔</span>
                  <Badge variant="outline" className="text-[8px] font-mono">{d.b}</Badge>
                  <span className="text-[10px] text-yellow-500">Possible duplicate</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
