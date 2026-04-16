// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Manifest Dashboard
// Admin visibility into domain ownership, completeness, and health
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllDomains, getAllDomainCompleteness, getCrossDomainEvents } from "@/lib/domain-system";
import type { DomainManifest } from "@/lib/domain-system";
import type { DomainCompletenessScore } from "@/lib/domain-system/domain-completeness";
import { CheckCircle, XCircle, ArrowRight, Briefcase, Wallet, Home, Settings } from "lucide-react";

const domainIcons: Record<string, React.ReactNode> = {
  business: <Briefcase className="h-5 w-5" />,
  finance: <Wallet className="h-5 w-5" />,
  concierge: <Home className="h-5 w-5" />,
  platform: <Settings className="h-5 w-5" />,
};

function gradeColor(grade: string): string {
  if (grade === "A") return "text-emerald-400";
  if (grade === "B") return "text-blue-400";
  if (grade === "C") return "text-amber-400";
  if (grade === "D") return "text-orange-400";
  return "text-red-400";
}

function progressColor(pct: number): string {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function DomainCard({ manifest, score }: { manifest: DomainManifest; score: DomainCompletenessScore }) {
  return (
    <Card className="bg-card/60 backdrop-blur border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">{domainIcons[manifest.id] ?? <Settings className="h-5 w-5" />}</div>
            <div>
              <CardTitle className="text-base">{manifest.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{manifest.owner}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${gradeColor(score.grade)}`}>{score.grade}</span>
            <p className="text-xs text-muted-foreground">{score.percentage}%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={score.percentage} className="h-2" />
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Entities</span>
            <Badge variant="secondary" className="text-xs px-1.5">{manifest.entities.length}</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Workflows</span>
            <Badge variant="secondary" className="text-xs px-1.5">{manifest.workflows.length}</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Commands</span>
            <Badge variant="secondary" className="text-xs px-1.5">{manifest.shellIntegration.commandPalette.length}</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Events</span>
            <Badge variant="secondary" className="text-xs px-1.5">{manifest.crossDomainEvents.length}</Badge>
          </div>
        </div>
        <div className="space-y-1.5">
          {score.checks.map((check) => (
            <div key={check.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                {check.passed ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                <span className="text-muted-foreground">{check.name}</span>
              </div>
              <span className="font-mono text-muted-foreground">{check.earnedPoints}/{check.maxPoints}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EventFlowView() {
  const events = getCrossDomainEvents();
  return (
    <div className="space-y-2">
      {events.map((e) => (
        <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/40 border border-border/30 text-sm">
          <Badge variant="outline" className="text-xs shrink-0">{e.sourceDomain}</Badge>
          <code className="text-xs text-muted-foreground shrink-0">{e.sourceEvent}</code>
          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          <Badge variant="outline" className="text-xs shrink-0">{e.targetDomain}</Badge>
          <code className="text-xs text-muted-foreground shrink-0">{e.targetEvent}</code>
          <span className="text-xs text-muted-foreground ml-auto hidden md:block">{e.description}</span>
        </div>
      ))}
    </div>
  );
}

function EntityListView({ manifests }: { manifests: DomainManifest[] }) {
  return (
    <div className="space-y-4">
      {manifests.map((m) => (
        <div key={m.id}>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">{domainIcons[m.id]} {m.name} ({m.entities.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {m.entities.map((e) => (
              <div key={e.id} className="p-2 rounded bg-card/30 border border-border/20 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{e.name}</span>
                  {e.dbTable ? <Badge variant="secondary" className="text-[10px] px-1">DB</Badge> : <Badge variant="outline" className="text-[10px] px-1">No DB</Badge>}
                </div>
                <p className="text-muted-foreground mt-0.5">{e.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TruthModelView({ manifests }: { manifests: DomainManifest[] }) {
  return (
    <div className="space-y-4">
      {manifests.map((m) => (
        <Card key={m.id} className="bg-card/40 border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">{domainIcons[m.id]} {m.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground font-medium">Freshness Thresholds</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {Object.entries(m.truthModel.freshnessThresholds).map(([k, v]) => (
                  <Badge key={k} variant="outline" className="text-[10px]">{k}: {v < 3600 ? `${v / 60}m` : `${v / 3600}h`}</Badge>
                ))}
              </div>
            </div>
            {m.truthModel.deterministic.length > 0 && (
              <div>
                <span className="text-muted-foreground font-medium">Deterministic (No LLM)</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {m.truthModel.deterministic.map((d) => (
                    <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>
                  ))}
                </div>
              </div>
            )}
            {m.truthModel.simulatedSurfaces.length > 0 && (
              <div>
                <span className="text-muted-foreground font-medium">Simulated Surfaces</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {m.truthModel.simulatedSurfaces.map((s) => (
                    <Badge key={s} variant="destructive" className="text-[10px]">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DomainManifestDashboard() {
  const manifests = useMemo(() => getAllDomains(), []);
  const scores = useMemo(() => getAllDomainCompleteness(), []);

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, sc) => s + sc.percentage, 0) / scores.length) : 0;
  const totalEntities = manifests.reduce((s, m) => s + m.entities.length, 0);
  const totalWorkflows = manifests.reduce((s, m) => s + m.workflows.length, 0);
  const totalEvents = getCrossDomainEvents().length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Domain Manifest Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Ownership, completeness, and cross-domain health</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/60"><CardContent className="pt-4 text-center"><div className="text-2xl font-bold">{manifests.length}</div><div className="text-xs text-muted-foreground">Domains</div></CardContent></Card>
        <Card className="bg-card/60"><CardContent className="pt-4 text-center"><div className="text-2xl font-bold">{totalEntities}</div><div className="text-xs text-muted-foreground">Entities</div></CardContent></Card>
        <Card className="bg-card/60"><CardContent className="pt-4 text-center"><div className="text-2xl font-bold">{totalWorkflows}</div><div className="text-xs text-muted-foreground">Workflows</div></CardContent></Card>
        <Card className="bg-card/60"><CardContent className="pt-4 text-center"><div className="text-2xl font-bold">{avgScore}%</div><div className="text-xs text-muted-foreground">Avg Completeness</div></CardContent></Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="events">Event Flows</TabsTrigger>
          <TabsTrigger value="truth">Truth Models</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {manifests.map((m, i) => (
              <DomainCard key={m.id} manifest={m} score={scores[i]} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="entities" className="mt-4">
          <ScrollArea className="h-[600px]">
            <EntityListView manifests={manifests} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <ScrollArea className="h-[600px]">
            <EventFlowView />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="truth" className="mt-4">
          <ScrollArea className="h-[600px]">
            <TruthModelView manifests={manifests} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
