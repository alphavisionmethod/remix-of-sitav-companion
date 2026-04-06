// ═══════════════════════════════════════════════════════
// SITA OS — V06: Verification Evidence Explorer
// Screenshots, traces, receipts, test logs
// ═══════════════════════════════════════════════════════

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVerificationRuns, useVerificationEvidence } from "@/lib/verification/verification-hooks";
import { FileSearch, Image, FileText, Terminal } from "lucide-react";

const typeIcons: Record<string, any> = { screenshot: Image, log: Terminal, trace: FileText };

export default function VerificationEvidenceExplorer() {
  const { data: runs } = useVerificationRuns();
  const [selectedRunId, setSelectedRunId] = useState<string | undefined>();
  const { data: evidence } = useVerificationEvidence(selectedRunId);

  return (
    <div className="space-y-6 p-6" data-testid="verification-evidence-explorer">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileSearch className="h-6 w-6 text-primary" />
          V06 — Evidence Explorer
        </h1>
        <p className="text-muted-foreground mt-1">Browse verification evidence: screenshots, logs, traces</p>
      </div>

      <div className="flex gap-3">
        <Select value={selectedRunId || ""} onValueChange={(v) => setSelectedRunId(v || undefined)}>
          <SelectTrigger className="w-96"><SelectValue placeholder="Select a verification run..." /></SelectTrigger>
          <SelectContent>
            {(runs || []).slice(0, 50).map((r: any) => (
              <SelectItem key={r.id} value={r.id}>
                {r.run_type} — {r.mode} — {r.passed ? "✅" : "❌"} — {new Date(r.created_at).toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedRunId ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Select a verification run to view evidence</CardContent></Card>
      ) : (evidence || []).length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No evidence for this run</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(evidence || []).map((e: any) => {
            const Icon = typeIcons[e.evidence_type] || FileText;
            return (
              <Card key={e.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{e.evidence_type}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                      </div>
                      {e.content && <pre className="mt-2 text-xs bg-muted/50 p-2 rounded max-h-40 overflow-auto">{e.content}</pre>}
                      {e.file_url && <a href={e.file_url} target="_blank" rel="noopener" className="text-xs text-primary underline mt-1 block">View file</a>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
