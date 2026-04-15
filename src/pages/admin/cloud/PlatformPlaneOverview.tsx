import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Shield, Monitor, Server, ArrowRight, AlertTriangle } from "lucide-react";
import { planeRegistry, type PlaneInfo } from "@/lib/platform-plane";
import { fromTable } from "@/lib/supabase-helpers";

export function PlatformPlaneOverview() {
  const [planes, setPlanes] = useState<PlaneInfo[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, { data: v }] = await Promise.all([
        planeRegistry.getPlanes(),
        fromTable("admin_action_audit")
          .select("*")
          .eq("action", "plane_boundary_violation")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setPlanes(p);
      setViolations(v || []);
      setLoading(false);
    };
    load();
  }, []);

  const planeIcons: Record<string, any> = {
    control: Shield,
    product: Monitor,
    "shared-core": Server,
  };

  const planeColors: Record<string, string> = {
    control: "border-purple-500/30 bg-purple-500/5",
    product: "border-blue-500/30 bg-blue-500/5",
    "shared-core": "border-amber-500/30 bg-amber-500/5",
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Layers className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Platform Architecture</h2>
        <Badge variant="outline" className="text-[10px]">3-Plane Model</Badge>
      </div>

      {/* Plane Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {planes.map((plane) => {
          const Icon = planeIcons[plane.planeKey] || Layers;
          return (
            <Card key={plane.id} className={`${planeColors[plane.planeKey]} border`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4" />
                  {plane.displayName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{plane.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Services</span>
                  <Badge variant="secondary" className="text-[10px]">{plane.serviceCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">
                    {plane.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Boundary Rules */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Cross-Plane Access Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {[
              { from: "Product", to: "Shared Core", allowed: true },
              { from: "Product", to: "Control", allowed: false },
              { from: "Control", to: "Shared Core", allowed: true },
              { from: "Control", to: "Product", allowed: false },
              { from: "Shared Core", to: "Product", allowed: true },
              { from: "Shared Core", to: "Control", allowed: true },
            ].map((rule, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                <span className="text-muted-foreground">{rule.from}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{rule.to}</span>
                <Badge
                  variant="outline"
                  className={`ml-auto text-[9px] ${
                    rule.allowed
                      ? "text-green-400 border-green-500/30"
                      : "text-red-400 border-red-500/30"
                  }`}
                >
                  {rule.allowed ? "Allowed" : "Blocked"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Violations */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Recent Boundary Violations
            <Badge variant="outline" className="text-[10px]">{violations.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No violations recorded</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {violations.map((v: any) => (
                <div key={v.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/20 text-xs">
                  <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="text-muted-foreground truncate">{v.justification}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(v.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
