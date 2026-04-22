import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  FileText, Download, CheckCircle2, AlertTriangle, Shield, Code,
  FileJson, BookOpen, GitBranch, Users, Sparkles, RotateCcw, Eye
} from "lucide-react";
import { useAIEngDomain } from "@/hooks/use-ai-engineering-data";
import { DEMO_BUNDLE_ITEMS, DEMO_EXPORT_MODES } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

type ExportMode = "json" | "markdown" | "approval" | "pr-ready" | "investor";

const typeColors: Record<string, string> = {
  fix: "text-[hsl(var(--trust-safe))]",
  "self-heal": "text-primary",
  improvement: "text-amber-500",
};

const AIEvidenceBundleComposer = () => {
  const { isDemo } = useAIEngDomain("missions", DEMO_BUNDLE_ITEMS);
  const [selectedMode, setSelectedMode] = useState<ExportMode>("markdown");
  const [selectedItems, setSelectedItems] = useState<string[]>((isDemoMode ? DEMO_BUNDLE_ITEMS : [] as typeof DEMO_BUNDLE_ITEMS).map(b => b.id));
  const [tab, setTab] = useState("compose");

  const toggleItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selected = DEMO_BUNDLE_ITEMS.filter(b => selectedItems.includes(b.id));
  const totalEvidence = selected.reduce((a, b) => a + b.evidence.length, 0);
  const totalTests = selected.reduce((a, b) => a + b.tests.length, 0);
  const avgConfidence = selected.length > 0 ? Math.round(selected.reduce((a, b) => a + b.confidence, 0) / selected.length) : 0;

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={FileText} title="Evidence Bundle Composer" subtitle="Export machine-readable and human-readable proof of missions, fixes, and releases" accent="primary" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Items Selected", v: selected.length },
          { l: "Evidence Pieces", v: totalEvidence },
          { l: "Tests Included", v: totalTests },
          { l: "Avg Confidence", v: `${avgConfidence}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-xl font-bold">{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="compose"><FileText className="h-3.5 w-3.5 mr-1" />Compose</TabsTrigger>
          <TabsTrigger value="preview"><Eye className="h-3.5 w-3.5 mr-1" />Preview</TabsTrigger>
          <TabsTrigger value="export"><Download className="h-3.5 w-3.5 mr-1" />Export</TabsTrigger>
        </TabsList>

        {/* COMPOSE TAB */}
        <TabsContent value="compose" className="space-y-4 mt-4">
          {/* Export Mode Selector */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Export Format</p>
            <div className="grid grid-cols-5 gap-2">
              {(isDemoMode ? DEMO_EXPORT_MODES : [] as typeof DEMO_EXPORT_MODES).map(m => (
                <div
                  key={m.mode}
                  onClick={() => setSelectedMode(m.mode)}
                  className={`rounded-xl border p-3 cursor-pointer transition-all text-center ${
                    selectedMode === m.mode ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "border-border/40 bg-card hover:bg-muted/30"
                  }`}
                >
                  <m.icon className={`h-4 w-4 mx-auto mb-1 ${selectedMode === m.mode ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-xs font-semibold">{m.label}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{m.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Item Selector */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Items to Include</p>
            <div className="space-y-2">
              {(isDemoMode ? DEMO_BUNDLE_ITEMS : [] as typeof DEMO_BUNDLE_ITEMS).map(b => (
                <div
                  key={b.id}
                  onClick={() => toggleItem(b.id)}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedItems.includes(b.id) ? "border-primary/30 bg-primary/5" : "border-border/40 bg-card opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                        selectedItems.includes(b.id) ? "border-primary bg-primary" : "border-border"
                      }`}>
                        {selectedItems.includes(b.id) && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="text-sm font-semibold">{b.missionTitle}</span>
                      <Badge variant="outline" className={`text-[10px] ${typeColors[b.type]}`}>{b.type}</Badge>
                    </div>
                    <span className="text-sm font-bold">{b.confidence}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    {b.agent} · {b.evidence.length} evidence · {b.tests.length} tests · {b.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* PREVIEW TAB */}
        <TabsContent value="preview" className="space-y-4 mt-4">
          <div className="rounded-xl border border-border/40 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold">SITA OS — Engineering Evidence Bundle</h3>
              <Badge variant="outline" className="text-[10px]">{selectedMode}</Badge>
            </div>

            {/* Metadata Summary */}
            <div className="rounded-lg bg-muted/20 p-3 mb-4">
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div><span className="text-muted-foreground">Generated:</span> {new Date().toLocaleDateString()}</div>
                <div><span className="text-muted-foreground">Items:</span> {selected.length}</div>
                <div><span className="text-muted-foreground">Evidence:</span> {totalEvidence} pieces</div>
                <div><span className="text-muted-foreground">Avg Confidence:</span> {avgConfidence}%</div>
              </div>
            </div>

            {/* Per-item preview */}
            {selected.map(b => (
              <div key={b.id} className="border-t border-border/20 pt-4 mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${typeColors[b.type]}`}>{b.type}</Badge>
                  <h4 className="text-sm font-semibold">{b.missionTitle}</h4>
                  <span className="text-xs font-bold ml-auto">{b.confidence}% confidence</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Agent</p>
                    <p className="text-xs">{b.agent}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                    <Badge variant={b.status === "applied" ? "default" : "outline"} className="text-[10px]">{b.status}</Badge>
                  </div>
                </div>

                {/* Evidence */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Evidence ({b.evidence.length})</p>
                  <div className="space-y-1">
                    {b.evidence.map((e, i) => (
                      <div key={i} className="rounded-lg bg-muted/10 p-2 flex items-start gap-2">
                        <Badge variant="outline" className="text-[9px] shrink-0">{e.type}</Badge>
                        <p className="text-xs">{e.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tests */}
                {b.tests.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tests ({b.tests.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {b.tests.map((t, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))]" />
                          <span>{t.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verification Gates */}
                {b.verificationGates.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Verification Gates</p>
                    <div className="flex flex-wrap gap-2">
                      {b.verificationGates.map((g, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] text-[hsl(var(--trust-safe))]">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> {g.gate}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rollback & Impact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/10 p-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Rollback Plan</p>
                    <p className="text-xs">{b.rollbackPlan}</p>
                  </div>
                  <div className="rounded-lg bg-[hsl(var(--trust-safe))]/5 p-2">
                    <p className="text-[10px] text-[hsl(var(--trust-safe))] uppercase tracking-wider mb-0.5">Impact</p>
                    <p className="text-xs">{b.impact}</p>
                  </div>
                </div>

                {/* Receipt */}
                {b.receipt && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Receipt: <code className="font-mono text-foreground">{b.receipt}</code></span>
                    <span>· Applied: {b.appliedAt}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* EXPORT TAB */}
        <TabsContent value="export" className="space-y-4 mt-4">
          <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold">Export Evidence Bundle</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/40 p-4">
                <p className="text-sm font-semibold mb-1">Bundle Summary</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Format: <strong className="text-foreground">{(isDemoMode ? DEMO_EXPORT_MODES : [] as typeof DEMO_EXPORT_MODES).find(m => m.mode === selectedMode)?.label}</strong></p>
                  <p>Items: <strong className="text-foreground">{selected.length}</strong></p>
                  <p>Evidence: <strong className="text-foreground">{totalEvidence} pieces</strong></p>
                  <p>Tests: <strong className="text-foreground">{totalTests}</strong></p>
                  <p>Avg Confidence: <strong className="text-foreground">{avgConfidence}%</strong></p>
                </div>
              </div>

              <div className="rounded-xl border border-border/40 p-4">
                <p className="text-sm font-semibold mb-1">Includes</p>
                <div className="space-y-1 text-xs">
                  {[
                    { item: "Confidence scores", included: true },
                    { item: "Test results", included: totalTests > 0 },
                    { item: "Evidence references", included: true },
                    { item: "Verification gates", included: true },
                    { item: "Rollback plans", included: true },
                    { item: "Impact assessments", included: true },
                    { item: "Execution receipts", included: selected.some(b => b.receipt) },
                  ].map(i => (
                    <div key={i.item} className="flex items-center gap-1">
                      {i.included ? <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> : <AlertTriangle className="h-3 w-3 text-muted-foreground" />}
                      <span className={i.included ? "" : "text-muted-foreground"}>{i.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-sm font-semibold text-primary mb-1">Ready to Export</p>
              <p className="text-xs text-muted-foreground">
                {selected.length} items · {totalEvidence} evidence pieces · {avgConfidence}% avg confidence
              </p>
              <div className="flex justify-center gap-2 mt-3">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1">
                  <Download className="h-3 w-3 mr-1" /> Download {(isDemoMode ? DEMO_EXPORT_MODES : [] as typeof DEMO_EXPORT_MODES).find(m => m.mode === selectedMode)?.label}
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1">
                  <Code className="h-3 w-3 mr-1" /> Copy to Clipboard
                </Badge>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIEvidenceBundleComposer;
