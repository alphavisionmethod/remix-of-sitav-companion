import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RUNTIME_CAPABILITY_MATRIX } from "@/lib/runtime/runtime-capability-matrix";
import { FEATURE_TIER_REGISTRY, getLaunchReadyFeatures } from "@/lib/runtime/feature-tier-registry";
import { RUNTIME_FLAGS, getEnabledFlags } from "@/lib/runtime/runtime-flags";
import { SIMULATED_SURFACES } from "@/lib/runtime/simulated-surface-registry";

const RuntimeTruthCoverageDashboard = () => {
  const launchReady = getLaunchReadyFeatures();
  const enabledFlags = getEnabledFlags();

  const tierColors: Record<string, string> = {
    production: "bg-green-500/20 text-green-300",
    prototype: "bg-yellow-500/20 text-yellow-300",
    simulated: "bg-blue-500/20 text-blue-300",
    "spec-only": "bg-muted text-muted-foreground",
    experimental: "bg-purple-500/20 text-purple-300",
  };

  const availColors: Record<string, string> = {
    native: "bg-green-500/20 text-green-300",
    fallback: "bg-yellow-500/20 text-yellow-300",
    unavailable: "bg-red-500/20 text-red-300",
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Runtime Truth Coverage</h1>
        <p className="text-muted-foreground">
          {FEATURE_TIER_REGISTRY.length} features | {launchReady.length} launch-ready | {SIMULATED_SURFACES.length} simulated surfaces | {enabledFlags.length}/{RUNTIME_FLAGS.length} flags enabled
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(["production", "prototype", "simulated", "spec-only", "experimental"] as const).map((tier) => (
          <Card key={tier}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground capitalize">{tier}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{FEATURE_TIER_REGISTRY.filter((f) => f.tier === tier).length}</p></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Cross-Runtime Capability Matrix</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capability</TableHead>
                <TableHead>Web</TableHead>
                <TableHead>Desktop</TableHead>
                <TableHead>Mobile PWA</TableHead>
                <TableHead>Appliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RUNTIME_CAPABILITY_MATRIX.map((cap) => (
                <TableRow key={cap.capabilityId}>
                  <TableCell className="font-medium text-sm">{cap.name}</TableCell>
                  <TableCell><Badge className={availColors[cap.web]}>{cap.web}</Badge></TableCell>
                  <TableCell><Badge className={availColors[cap.desktop]}>{cap.desktop}</Badge></TableCell>
                  <TableCell><Badge className={availColors[cap.mobilePwa]}>{cap.mobilePwa}</Badge></TableCell>
                  <TableCell><Badge className={availColors[cap.appliance]}>{cap.appliance}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Feature Tier Registry</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Launch Ready</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FEATURE_TIER_REGISTRY.map((f) => (
                <TableRow key={f.featureId}>
                  <TableCell className="font-medium text-sm">{f.name}</TableCell>
                  <TableCell className="text-xs">{f.domain}</TableCell>
                  <TableCell><Badge className={tierColors[f.tier]}>{f.tier}</Badge></TableCell>
                  <TableCell>{f.launchReady ? <Badge className="bg-green-500/20 text-green-300">✓</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Simulated Surfaces ({SIMULATED_SURFACES.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Surface</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Technology</TableHead>
                <TableHead>Production Alt.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SIMULATED_SURFACES.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-sm">{s.name}</TableCell>
                  <TableCell><Badge variant="secondary">{s.category}</Badge></TableCell>
                  <TableCell className="text-xs max-w-40 truncate">{s.simulationTechnology}</TableCell>
                  <TableCell className="text-xs max-w-40 truncate">{s.productionAlternative || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RuntimeTruthCoverageDashboard;
