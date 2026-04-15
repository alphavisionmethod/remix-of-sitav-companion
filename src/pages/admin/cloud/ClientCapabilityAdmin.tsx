// ═══════════════════════════════════════════════════════════════
// SITA OS — Client Capability Matrix Admin
// Track features supported per client type/platform/version
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Laptop, Smartphone, Globe, Shield, Monitor, Wrench,
  CheckCircle2, XCircle, MinusCircle
} from "lucide-react";

interface ClientCapability {
  id: string;
  client_type: string;
  platform: string;
  display_name: string;
  current_version: string | null;
  min_version: string | null;
  supported_features: string[];
  unsupported_features: string[] | null;
  status: string;
}

const CLIENT_ICONS: Record<string, typeof Laptop> = {
  desktop: Laptop,
  "mobile-ios": Smartphone,
  "mobile-android": Smartphone,
  web: Globe,
  "admin-web": Shield,
  "support-console": Wrench,
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  beta: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  deprecated: "bg-destructive/20 text-destructive border-destructive/30",
  planned: "bg-muted text-muted-foreground border-border",
};

export function ClientCapabilityAdmin() {
  const [clients, setClients] = useState<ClientCapability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("client_capability_matrix")
      .select("*")
      .order("display_name")
      .then(({ data }) => {
        setClients((data ?? []) as ClientCapability[]);
        setLoading(false);
      });
  }, []);

  const allFeatures = Array.from(
    new Set(clients.flatMap((c) => [...c.supported_features, ...(c.unsupported_features ?? [])]))
  ).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
          <Monitor className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Client Capability Matrix</h2>
          <p className="text-sm text-muted-foreground">Feature support tracking per client type, platform, and version</p>
        </div>
        <Badge variant="outline" className="ml-auto">{clients.length} clients</Badge>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading…</div>
      ) : clients.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Monitor className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No client capability data yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Client Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => {
              const Icon = CLIENT_ICONS[client.client_type] ?? Globe;
              return (
                <Card key={client.id} className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm truncate">{client.display_name}</CardTitle>
                        <CardDescription className="text-[10px] font-mono">{client.platform}</CardDescription>
                      </div>
                      <Badge className={`text-[10px] ${STATUS_COLORS[client.status] ?? ""}`}>{client.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-muted-foreground">Current</div>
                      <div className="font-mono">{client.current_version ?? "—"}</div>
                      <div className="text-muted-foreground">Min Version</div>
                      <div className="font-mono">{client.min_version ?? "—"}</div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1.5">
                        Supported ({client.supported_features.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {client.supported_features.slice(0, 8).map((f) => (
                          <Badge key={f} variant="secondary" className="text-[9px] font-mono gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                            {f}
                          </Badge>
                        ))}
                        {client.supported_features.length > 8 && (
                          <Badge variant="secondary" className="text-[9px]">
                            +{client.supported_features.length - 8}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {(client.unsupported_features?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1.5">
                          Unsupported ({client.unsupported_features!.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {client.unsupported_features!.slice(0, 5).map((f) => (
                            <Badge key={f} variant="outline" className="text-[9px] font-mono gap-1 text-destructive/70">
                              <XCircle className="h-2.5 w-2.5" />
                              {f}
                            </Badge>
                          ))}
                          {client.unsupported_features!.length > 5 && (
                            <Badge variant="outline" className="text-[9px]">
                              +{client.unsupported_features!.length - 5}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feature Compatibility Grid */}
          {allFeatures.length > 0 && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Feature Compatibility Grid</CardTitle>
                <CardDescription>Cross-client feature support overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Feature</th>
                        {clients.map((c) => (
                          <th key={c.id} className="text-center py-2 px-2 text-muted-foreground font-medium min-w-[80px]">
                            {c.display_name.split(" ")[0]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allFeatures.slice(0, 15).map((feature) => (
                        <tr key={feature} className="border-b border-border/20">
                          <td className="py-1.5 pr-4 font-mono text-[10px]">{feature}</td>
                          {clients.map((c) => {
                            const supported = c.supported_features.includes(feature);
                            const unsupported = c.unsupported_features?.includes(feature);
                            return (
                              <td key={c.id} className="text-center py-1.5 px-2">
                                {supported ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mx-auto" />
                                ) : unsupported ? (
                                  <XCircle className="h-3.5 w-3.5 text-destructive/60 mx-auto" />
                                ) : (
                                  <MinusCircle className="h-3.5 w-3.5 text-muted-foreground/40 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
