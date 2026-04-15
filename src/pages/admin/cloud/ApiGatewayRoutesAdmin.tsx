import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Network, Search, Shield, Globe, Zap } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";

interface GatewayRoute {
  id: string;
  route_pattern: string;
  method: string;
  plane: string;
  required_token_class: string;
  required_permission: string | null;
  rate_limit_per_minute: number;
  description: string;
  enabled: boolean;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-500/20 text-green-400 border-green-500/30",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  DELETE: "bg-destructive/20 text-destructive border-destructive/30",
  PATCH: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const PLANE_COLORS: Record<string, string> = {
  control: "text-purple-400 border-purple-500/30",
  product: "text-blue-400 border-blue-500/30",
  "shared-core": "text-amber-400 border-amber-500/30",
};

export function ApiGatewayRoutesAdmin() {
  const [routes, setRoutes] = useState<GatewayRoute[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fromTable("api_gateway_routes")
      .select("*")
      .order("route_pattern")
      .then(({ data }: any) => {
        setRoutes(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = routes.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.route_pattern.toLowerCase().includes(s) ||
      r.description.toLowerCase().includes(s) ||
      r.plane.toLowerCase().includes(s) ||
      (r.required_permission || "").toLowerCase().includes(s)
    );
  });

  const controlRoutes = filtered.filter((r) => r.plane === "control");
  const coreRoutes = filtered.filter((r) => r.plane === "shared-core");
  const productRoutes = filtered.filter((r) => r.plane === "product");

  if (loading) {
    return <div className="h-48 bg-muted/30 rounded-lg animate-pulse" />;
  }

  const renderRouteGroup = (title: string, items: GatewayRoute[], icon: any) => {
    const Icon = icon;
    if (items.length === 0) return null;
    return (
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {title}
            <Badge variant="outline" className="text-[10px]">{items.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/20">
            {items.map((route) => (
              <div key={route.id} className="px-4 py-3 hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-[9px] font-mono ${METHOD_COLORS[route.method] || ""}`}>
                    {route.method}
                  </Badge>
                  <code className="text-xs font-mono text-foreground">{route.route_pattern}</code>
                  <Badge variant="outline" className={`text-[9px] ml-auto ${PLANE_COLORS[route.plane] || ""}`}>
                    {route.plane}
                  </Badge>
                  <Badge variant="outline" className="text-[9px]">
                    {route.required_token_class}
                  </Badge>
                  {!route.enabled && (
                    <Badge variant="outline" className="text-[9px] text-destructive border-destructive/30">
                      Disabled
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                  <span>{route.description}</span>
                  {route.required_permission && (
                    <span className="flex items-center gap-1">
                      <Shield className="h-2.5 w-2.5" />
                      {route.required_permission}
                    </span>
                  )}
                  <span className="flex items-center gap-1 ml-auto">
                    <Zap className="h-2.5 w-2.5" />
                    {route.rate_limit_per_minute}/min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Network className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">API Gateway Routes</h2>
        <Badge variant="outline" className="text-[10px]">{routes.length} routes</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search routes, permissions, planes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9 text-xs bg-muted/30"
        />
      </div>

      <div className="space-y-4">
        {renderRouteGroup("Control Plane Routes", controlRoutes, Shield)}
        {renderRouteGroup("Shared Core Routes", coreRoutes, Globe)}
        {renderRouteGroup("Product Plane Routes", productRoutes, Network)}
      </div>

      {filtered.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-8">No routes match your search</p>
      )}
    </div>
  );
}
