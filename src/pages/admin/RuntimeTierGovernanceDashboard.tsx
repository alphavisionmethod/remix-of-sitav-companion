// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Tier Governance Dashboard
// Surfaces the canonical 4-Tier runtime model + governance report.
// Plane: Control (Admin) — consumes runtime tier registries.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, AlertTriangle, Layers, Monitor, Server, Sparkles } from "lucide-react";
import { useRuntimeTier, useRuntimeProbe } from "@/lib/runtime/runtime-context";
import { RUNTIME_TIERS, type RuntimeTier } from "@/lib/runtime/runtime-tier-model";
import { FEATURE_RUNTIME_TIER_MAPPING } from "@/lib/runtime/feature-runtime-tier-registry";

const TIER_ICON: Record<RuntimeTier, typeof Monitor> = {
  WEB_APP: Monitor,
  DESKTOP_HOST: Layers,
  APPLIANCE_RUNTIME: Server,
  SIMULATED_OS_EXPERIENCE: Sparkles,
};

const HONESTY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  honest: "default",
  "needs-disclosure": "secondary",
  "drift-risk": "destructive",
};

export default function RuntimeTierGovernanceDashboard() {
  const activeTier = useRuntimeTier();
  const probe = useRuntimeProbe();

  const stats = useMemo(() => {
    const total = FEATURE_RUNTIME_TIER_MAPPING.length;
    const honest = FEATURE_RUNTIME_TIER_MAPPING.filter((f) => f.launchHonesty === "honest").length;
    const needsDisclosure = FEATURE_RUNTIME_TIER_MAPPING.filter((f) => f.launchHonesty === "needs-disclosure").length;
    const driftRisk = FEATURE_RUNTIME_TIER_MAPPING.filter((f) => f.launchHonesty === "drift-risk").length;
    return { total, honest, needsDisclosure, driftRisk };
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Runtime Tier Governance</h1>
        <p className="text-muted-foreground">
          Canonical 4-Tier runtime model. Authoritative source for product reality, launch honesty, and capability gating.
        </p>
      </div>

      {/* Active Tier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Active Runtime Tier
          </CardTitle>
          <CardDescription>Detected at provider mount via runtime-detection.ts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="text-base px-4 py-2">
              {activeTier}
            </Badge>
            <div className="text-sm text-muted-foreground">
              <div><span className="font-medium">Confidence:</span> {(probe.confidence * 100).toFixed(0)}%</div>
              <div><span className="font-medium">Reason:</span> {probe.reason}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Honesty Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Features</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Launch Honest</CardDescription>
            <CardTitle className="text-3xl text-primary">{stats.honest}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Needs Disclosure</CardDescription>
            <CardTitle className="text-3xl">{stats.needsDisclosure}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drift Risk</CardDescription>
            <CardTitle className="text-3xl text-destructive">{stats.driftRisk}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="tiers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tiers">4-Tier Model</TabsTrigger>
          <TabsTrigger value="features">Feature Classification</TabsTrigger>
          <TabsTrigger value="disclosures">Disclosures Required</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RUNTIME_TIERS.map((tier) => {
              const Icon = TIER_ICON[tier.id];
              const isActive = tier.id === activeTier;
              return (
                <Card key={tier.id} className={isActive ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className="h-5 w-5" />
                      {tier.label}
                      {isActive && <Badge variant="default" className="ml-auto">Active</Badge>}
                    </CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><span className="font-medium">Host Authority:</span> {tier.hostAuthority}</div>
                    <div><span className="font-medium">Honest OS:</span> {tier.honestOS ? "✅" : "❌"}</div>
                    <div><span className="font-medium">Sandbox:</span> {tier.sandbox}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Runtime Classification</CardTitle>
              <CardDescription>
                Every runtime-sensitive feature declares supported / simulated / fallback / prohibited tiers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Supported</TableHead>
                      <TableHead>Simulated</TableHead>
                      <TableHead>Honesty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FEATURE_RUNTIME_TIER_MAPPING.map((feature) => (
                      <TableRow key={feature.featureId}>
                        <TableCell className="font-medium">{feature.name}</TableCell>
                        <TableCell><Badge variant="outline">{feature.ownerDomain}</Badge></TableCell>
                        <TableCell className="text-xs">
                          {feature.supportedTiers.length > 0 ? feature.supportedTiers.join(", ") : "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {feature.simulatedTiers.length > 0 ? feature.simulatedTiers.join(", ") : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={HONESTY_VARIANT[feature.launchHonesty] ?? "outline"}>
                            {feature.launchHonesty}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disclosures">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Features Requiring Disclosure
              </CardTitle>
              <CardDescription>
                These features need explicit user-facing copy explaining their tier behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {FEATURE_RUNTIME_TIER_MAPPING.filter((f) => f.launchHonesty !== "honest").map((feature) => (
                <div key={feature.featureId} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{feature.name}</div>
                    <Badge variant={HONESTY_VARIANT[feature.launchHonesty]}>{feature.launchHonesty}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{feature.fallback}</div>
                  {feature.notes && (
                    <div className="text-xs text-muted-foreground italic">{feature.notes}</div>
                  )}
                </div>
              ))}
              {stats.needsDisclosure + stats.driftRisk === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  All features are launch-honest. No disclosures pending.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
