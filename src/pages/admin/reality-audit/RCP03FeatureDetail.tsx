import RCPSubNav from "@/platform/admin/components/admin/RCPSubNav";
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, Shield, FileCode, Database, Zap, ArrowRight } from "lucide-react";
import {
  getFeatureById, getMockReplacementsForFeature, SOURCE_INVENTORY,
  type RealityState, type FeatureRealityRecord
} from "@/runtimes/reality/reality-audit-registry";

const stateColors: Record<RealityState, string> = {
  presentational: "bg-red-500/15 text-red-400 border-red-500/30",
  simulated: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  persisted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  proven: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const stateLabels: Record<RealityState, string> = {
  presentational: "A — Presentational",
  simulated: "B — Simulated",
  persisted: "C — Persisted",
  proven: "D — Proven",
};

const transitionChecklist: Record<string, string[]> = {
  "presentational→simulated": ["Wire to local state management", "Add demo data flow", "Implement basic interactions"],
  "simulated→persisted": ["Create Supabase tables/schema", "Wire to real endpoints", "Implement real mutations", "Add contract alignment", "Remove primary mock dependency"],
  "persisted→proven": ["Add E2E tests", "Wire runtime probes", "Verify interaction completeness", "Generate proof receipts", "Pass runtime truth gate"],
};

const Indicator = ({ ok, label }: { ok: boolean; label: string }) => (
  <div className={`flex items-center gap-1.5 text-xs p-2 rounded ${ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
    {ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} {label}
  </div>
);

const RCP03FeatureDetail = () => {
  const { featureId } = useParams<{ featureId: string }>();
  const navigate = useNavigate();
  const feature = useMemo(() => featureId ? getFeatureById(featureId) : undefined, [featureId]);
  const replacements = useMemo(() => featureId ? getMockReplacementsForFeature(featureId) : [], [featureId]);
  const relatedMockSources = useMemo(() =>
    SOURCE_INVENTORY.filter(s => s.importedByPages.some(p => feature?.route && p.startsWith(feature.route.split("/").slice(0, 2).join("/")))),
  [feature]);

  if (!feature) {
    return (
      <div className="p-6 space-y-4">
        <RCPSubNav />
        <Button variant="ghost" onClick={() => navigate("/admin/reality-audit")}><ArrowLeft className="h-4 w-4 mr-2" /> Back to Matrix</Button>
        <p className="text-muted-foreground">Feature not found.</p>
      </div>
    );
  }

  const nextTransition = feature.realityState === "presentational" ? "presentational→simulated"
    : feature.realityState === "simulated" ? "simulated→persisted"
    : feature.realityState === "persisted" ? "persisted→proven" : null;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <RCPSubNav />
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin/reality-audit")}><ArrowLeft className="h-4 w-4 mr-2" /> Back to Matrix</Button>

      {/* FeatureRealityHero */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-3">
                <Shield className="h-5 w-5" /> {feature.name}
                <span className={`text-sm px-3 py-1 rounded border ${stateColors[feature.realityState]}`}>{stateLabels[feature.realityState]}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{feature.notes}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{feature.confidence}%</div>
              <div className="text-[10px] text-muted-foreground">Confidence</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
            <div><span className="text-muted-foreground text-xs">Domain</span><div className="capitalize font-medium">{feature.domain}</div></div>
            <div><span className="text-muted-foreground text-xs">Route</span><div className="font-mono text-xs">{feature.route}</div></div>
            <div><span className="text-muted-foreground text-xs">Scope</span><div className="capitalize">{feature.scopeLevel}</div></div>
            <div><span className="text-muted-foreground text-xs">Criticality</span><div><Badge variant={feature.launchCriticality === "P0" ? "destructive" : "secondary"}>{feature.launchCriticality}</Badge></div></div>
            <div><span className="text-muted-foreground text-xs">Owner</span><div>{feature.owner || "Unassigned"}</div></div>
          </div>
        </CardContent>
      </Card>

      {/* EvidenceSourcePanel */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4" /> Evidence & Status</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Indicator ok={feature.hasRealData} label="Real Data" />
            <Indicator ok={feature.hasRealMutation} label="Real Mutation" />
            <Indicator ok={feature.runtimeEvidenceAvailable} label="Runtime Evidence" />
            <Indicator ok={feature.contractComplete} label="Contract Complete" />
            <Indicator ok={feature.interactionComplete} label="Interactions" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <span className="text-muted-foreground text-xs">Components</span>
              <div className="flex flex-wrap gap-1 mt-1">{feature.components.map(c => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Services</span>
              <div className="flex flex-wrap gap-1 mt-1">{feature.services.map(s => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-muted-foreground text-xs">Backing Source Types</span>
            <div className="flex flex-wrap gap-1 mt-1">{feature.backingSourceTypes.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>
          </div>
        </CardContent>
      </Card>

      {/* MockUsagePanel */}
      {relatedMockSources.length > 0 && (
        <Card className="border-amber-500/20">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FileCode className="h-4 w-4 text-amber-400" /> Mock Sources Used</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {relatedMockSources.map(s => (
                <div key={s.id} className={`p-2 rounded border text-sm ${s.forbidden ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">{s.sourcePath}</span>
                    <div className="flex gap-1">
                      {s.forbidden && <Badge variant="destructive" className="text-[9px]">FORBIDDEN</Badge>}
                      <Badge variant="outline" className="text-[9px]">{s.type}</Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{s.sourceDescription}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PersistenceStatusStrip */}
      {replacements.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4" /> Migration Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {replacements.map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                  <div>
                    <span className="font-medium">{m.page}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">{m.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize">{m.migrationStatus.replace("_", " ")}</Badge>
                    <Badge variant={m.migrationPriority === "P0" ? "destructive" : "secondary"} className="text-[10px]">{m.migrationPriority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* StateTransitionChecklist */}
      {nextTransition && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" /> Next Transition: {nextTransition.split("→").join(" → ")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{feature.nextRequiredTransition}</p>
            <div className="space-y-1">
              {(transitionChecklist[nextTransition] || []).map(item => (
                <div key={item} className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/30">
                  <XCircle className="h-3 w-3 text-muted-foreground" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            {feature.transitionBlockers.length > 0 && (
              <div>
                <span className="text-muted-foreground text-xs">Blockers</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {feature.transitionBlockers.map(b => <Badge key={b} variant="destructive" className="text-[10px]">{b}</Badge>)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RCP03FeatureDetail;
