import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRealityClassifications } from "@/platform/runtime/hooks/useRealityClassifications";
import { useMockReplacements } from "@/hooks/useMockReplacements";
import { PROGRESSION_REQUIREMENTS, EVIDENCE_SIGNALS } from "@/data/persistence/reality-classification-persistence";
import { Shield, Eye, Cpu, CheckCircle2, AlertTriangle, ArrowRight, FileCode, Database, Zap } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function FeatureRealityDetail() {
  const { data: classifications = [] } = useRealityClassifications();
  const { data: replacements = [] } = useMockReplacements();
  const [selectedId, setSelectedId] = useState<string>("");

  const feature = useMemo(() => classifications.find(c => c.id === selectedId), [classifications, selectedId]);
  const relatedMocks = useMemo(() =>
    feature ? replacements.filter(m => m.page_path === feature.route_path || m.feature_name === feature.feature_name) : [],
  [feature, replacements]);

  const nextTransition = useMemo(() => {
    if (!feature) return null;
    const map: Record<string, string> = { presentational: "presentational→simulated", simulated: "simulated→persisted", persisted: "persisted→proven" };
    const key = map[feature.classification];
    return key ? { key, requirements: PROGRESSION_REQUIREMENTS[key] ?? [] } : null;
  }, [feature]);

  const stateIcon = (s: string) => {
    if (s === "presentational") return <Eye className="h-4 w-4" />;
    if (s === "simulated") return <Cpu className="h-4 w-4 text-yellow-400" />;
    if (s === "persisted") return <Shield className="h-4 w-4 text-blue-400" />;
    return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  };

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold">Feature Reality Detail</h1>
        <p className="text-sm text-muted-foreground">Deep dive into feature classification — RCP03</p>
      </div>

      <Select value={selectedId} onValueChange={setSelectedId}>
        <SelectTrigger className="w-full max-w-md"><SelectValue placeholder="Select a classified feature..." /></SelectTrigger>
        <SelectContent>
          {classifications.map(c => (
            <SelectItem key={c.id} value={c.id}>{c.feature_name} — {c.route_path}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {feature && (
        <>
          {/* Hero */}
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              {stateIcon(feature.classification)}
              <div className="flex-1">
                <h2 className="text-xl font-bold">{feature.feature_name}</h2>
                <p className="text-sm text-muted-foreground font-mono">{feature.route_path}</p>
              </div>
              <Badge variant="outline" className="text-lg capitalize">{feature.classification}</Badge>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Confidence</div>
                <div className="text-2xl font-bold">{feature.confidence}%</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            {/* Evidence */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4" />Evidence Inputs</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {EVIDENCE_SIGNALS.map(sig => {
                  const has = feature.evidence_inputs.includes(sig);
                  return (
                    <div key={sig} className={`text-xs flex items-center gap-1 ${has ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {has ? <CheckCircle2 className="h-3 w-3" /> : <span className="w-3" />}
                      {sig.replace(/_/g, " ")}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Mock Usage */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileCode className="h-4 w-4" />Mock Usage</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {feature.mock_sources.length === 0 && <p className="text-xs text-muted-foreground">No mock sources recorded</p>}
                {feature.mock_sources.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-yellow-400 block">{s}</Badge>
                ))}
                {relatedMocks.length > 0 && (
                  <div className="pt-2 border-t space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Migration entries:</p>
                    {relatedMocks.map(m => (
                      <div key={m.id} className="text-xs flex justify-between">
                        <span>{m.mock_source}</span>
                        <Badge variant="outline" className="text-[10px]">{m.migration_status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Persistence & Contract */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4" />Persistence & Contract</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><span className="text-xs text-muted-foreground">Backend Target</span><p className="text-sm font-mono">{feature.backend_target || "—"}</p></div>
                <div><span className="text-xs text-muted-foreground">Contract Status</span><Badge variant="outline" className="capitalize">{feature.contract_status}</Badge></div>
                <div><span className="text-xs text-muted-foreground">Launch Impact</span><Badge variant="outline" className={feature.launch_impact === "blocking" ? "text-destructive" : ""}>{feature.launch_impact}</Badge></div>
                <div><span className="text-xs text-muted-foreground">Owner</span><p className="text-sm">{feature.owner || "Unassigned"}</p></div>
              </CardContent>
            </Card>
          </div>

          {/* Blockers + Transition */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Blockers & Missing</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {feature.blockers.length === 0 && feature.missing_requirements.length === 0 && <p className="text-xs text-muted-foreground">None</p>}
                {feature.blockers.map((b, i) => <Badge key={i} variant="destructive" className="mr-1">{b}</Badge>)}
                {feature.missing_requirements.map((m, i) => <Badge key={i} variant="outline" className="mr-1 text-yellow-400">{m}</Badge>)}
              </CardContent>
            </Card>
            {nextTransition && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ArrowRight className="h-4 w-4" />Path to Next State</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">{nextTransition.key}</p>
                  {nextTransition.requirements.map((r, i) => {
                    const met = feature.evidence_inputs.includes(r);
                    return (
                      <div key={i} className={`text-xs flex items-center gap-1 ${met ? "text-emerald-400" : "text-destructive"}`}>
                        {met ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {r.replace(/_/g, " ")}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {!feature && classifications.length > 0 && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Select a feature above to view its reality detail</CardContent></Card>
      )}
      {classifications.length === 0 && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No classifications yet — use the Reality Classification Matrix to classify features</CardContent></Card>
      )}
    </div>
  );
}
