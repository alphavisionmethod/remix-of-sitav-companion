import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRegisteredDomains, getProviderMetadata, type ProviderDomain } from "@/lib/dual-reality/mode-aware-provider";
import { registerAllProviders } from "@/lib/dual-reality/providers";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { Plug, CheckCircle2, AlertCircle } from "lucide-react";
import { DEMO_ADMIN_ALL_DOMAINS as DEMO_ALL_DOMAINS } from "@/data/seed/admin-platform";
import DRSSubNav from "@/components/admin/DRSSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

export default function DRS05ProviderConsole() {
  registerAllProviders();
  const { mode } = useRealityModeSafe();
  const registered = getRegisteredDomains();

  return (
    <div className="space-y-6 p-6">
<DRSSubNav />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DRS05 — Mode-Aware Provider Console</h1>
        <p className="text-sm text-muted-foreground mt-1">Inspect provider resolution across domains</p>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Current Mode: <Badge className="ml-2">{mode}</Badge></CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 text-muted-foreground font-medium">Domain</th>
                  <th className="py-2 pr-4 text-muted-foreground font-medium">Registered</th>
                  <th className="py-2 pr-4 text-muted-foreground font-medium">Active Provider</th>
                  <th className="py-2 pr-4 text-muted-foreground font-medium">Freshness</th>
                  <th className="py-2 pr-4 text-muted-foreground font-medium">Safety</th>
                </tr>
              </thead>
              <tbody>
                {([] as typeof DEMO_ALL_DOMAINS).map(domain => {
                  const isRegistered = registered.includes(domain);
                  const meta = isRegistered ? getProviderMetadata(domain, mode) : null;
                  return (
                    <tr key={domain} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-4 flex items-center gap-2">
                        <Plug className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-foreground capitalize">{domain}</span>
                      </td>
                      <td className="py-2.5 pr-4">
                        {isRegistered ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="outline" className="text-xs">{meta?.providerType ?? "none"}</Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground">{meta?.dataFreshness ?? "—"}</td>
                      <td className="py-2.5 pr-4">
                        <Badge className={`text-xs ${meta?.sideEffectSafetyClass === "safe" ? "bg-green-500/20 text-green-400" : meta?.sideEffectSafetyClass === "restricted" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                          {meta?.sideEffectSafetyClass ?? "—"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
