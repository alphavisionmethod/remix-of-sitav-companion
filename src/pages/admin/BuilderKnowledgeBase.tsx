import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { motion } from "framer-motion";
import { BookMarked, Code, Layers, FileText, Cpu, Shield, Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CANONICAL_DOMAIN_PACKS } from "@/lib/delivery-methodology/domain-packs";
import { LIFECYCLE_STAGES, getStageLabel } from "@/lib/delivery-methodology/feature-lifecycle";
import { DEMO_ARCHETYPE_DOCS } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const BuilderKnowledgeBase = () => {
  const { isDemoMode } = useDataMode();
  const { data: archetypes } = useQuery({
    queryKey: ["kb-archetypes"],
    queryFn: async () => {
      const { data } = await fromTable("feature_archetypes").select("*").order("display_name");
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <BookMarked className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Builder Knowledge Base</h1>
        </div>
        <p className="text-muted-foreground">Patterns, archetypes, domain packs, lifecycle reference — the builder memory of the platform</p>
      </motion.div>

      <Tabs defaultValue="archetypes">
        <TabsList>
          <TabsTrigger value="archetypes">Archetypes</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="domains">Domain Packs</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="archetypes" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isDemoMode ? DEMO_ARCHETYPE_DOCS : [] as typeof DEMO_ARCHETYPE_DOCS).map(arch => (
              <Card key={arch.key}>
                <CardHeader><CardTitle className="text-base">{arch.label}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{arch.desc}</p>
                  <div>
                    <div className="text-xs font-semibold mb-1 flex items-center gap-1"><Code className="h-3 w-3" /> Expected Files</div>
                    <div className="flex flex-wrap gap-1">{arch.files.map(f => <Badge key={f} variant="outline" className="text-xs font-mono">{f}</Badge>)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-1 flex items-center gap-1"><FileText className="h-3 w-3" /> Required Contracts</div>
                    <div className="flex flex-wrap gap-1">{arch.contracts.map(c => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lifecycle" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Canonical Feature Lifecycle (13 Stages)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {LIFECYCLE_STAGES.map((stage, i) => (
                  <div key={stage} className="flex items-center gap-3 p-2 rounded border">
                    <Badge variant="outline" className="w-6 text-center">{i + 1}</Badge>
                    <span className="font-medium text-sm w-40">{getStageLabel(stage)}</span>
                    <span className="text-xs text-muted-foreground">
                      {stage === "proposed" && "Feature request normalized into blueprint"}
                      {stage === "specified" && "Blueprint approved with full classification"}
                      {stage === "generated" && "Artifacts auto-generated from blueprint"}
                      {stage === "contract-defined" && "Contract stubs created and registered"}
                      {stage === "scaffolded" && "Route, shell, and manifest registered"}
                      {stage === "implemented" && "Components built and services wired"}
                      {stage === "wired" && "Persistence, events, and interactions connected"}
                      {stage === "tested" && "Journey and interaction tests passing"}
                      {stage === "runtime-verified" && "Runtime probes pass, no mock dependencies"}
                      {stage === "launch-ready" && "Readiness threshold met, owner signoff"}
                      {stage === "monitored" && "Deployed with active monitoring"}
                      {stage === "evolving" && "Under active iteration"}
                      {stage === "deprecated" && "Marked for removal, migration complete"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CANONICAL_DOMAIN_PACKS.map(pack => (
              <Card key={pack.domainKey}>
                <CardHeader><CardTitle className="text-base">{pack.displayName}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{pack.description}</p>
                  <div className="text-xs"><span className="font-semibold">Routes:</span> {pack.expectedRoutes.length} | <span className="font-semibold">Contracts:</span> {pack.requiredContracts.length} | <span className="font-semibold">Events:</span> {pack.expectedEvents.length} | <span className="font-semibold">Proofs:</span> {pack.requiredProofs.length}</div>
                  <Badge variant="outline">{pack.maturityTarget}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Layers, title: "Persistence Pattern", desc: "Every durable feature uses Supabase table → adapter → hook → component. Never localStorage for critical state." },
              { icon: Network, title: "Event Pattern", desc: "Actions emit events via EventBus → persisted to os_event_log → consumed by projections. Correlation IDs link chains." },
              { icon: Shield, title: "Trust Pattern", desc: "Critical actions → policy evaluation → approval gate → action receipt → proof lineage. Every step traceable." },
              { icon: Cpu, title: "Intelligence Pattern", desc: "Signal intake → asset generation → pattern extraction → domain packet → reuse decision. Budget-governed." },
              { icon: FileText, title: "Contract Pattern", desc: "Type-safe contracts in src/packages/contracts/. Producer/consumer declared. Deterministic validation flagged." },
              { icon: Code, title: "Route Pattern", desc: "Lazy-loaded page → shell layout → manifest registration → interaction registry → journey test → runtime probe." },
            ].map(p => (
              <Card key={p.title}>
                <CardContent className="pt-4">
                  <p.icon className="h-6 w-6 text-primary mb-2" />
                  <h3 className="font-semibold text-sm">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuilderKnowledgeBase;
