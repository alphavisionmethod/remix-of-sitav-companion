import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Plug, Shield, Zap, Globe, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const INTEGRATION_PROVIDERS: any[] = [];
const PROVIDER_CATEGORIES: any[] = [];
export default function IntegrationsCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();

  const filtered = INTEGRATION_PROVIDERS.filter(p => {
    const matchSearch = !search || p.displayName.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  const demoConns = [];
  const connectedIds = new Set(demoConns.filter(c => c.status === "connected").map(c => c.providerId));
  const expiredIds = new Set(demoConns.filter(c => c.status === "expired").map(c => c.providerId));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integration Hub</h1>
          <p className="text-muted-foreground">Connect your tools — CRMs, ad platforms, accounting, payments, and more</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/integrations/connections")} className="gap-1.5">
            <Plug className="w-3.5 h-3.5" /> My Connections ({demoConns.length})
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/integrations/actions")} className="gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Approvals
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Available", value: INTEGRATION_PROVIDERS.length.toString(), icon: Globe, color: "text-blue-400" },
          { label: "Connected", value: demoConns.filter(c => c.status === "connected").length.toString(), icon: CheckCircle, color: "text-green-400" },
          { label: "Needs Attention", value: demoConns.filter(c => c.status === "expired" || c.status === "error").length.toString(), icon: AlertTriangle, color: "text-amber-400" },
          { label: "Write-Enabled", value: INTEGRATION_PROVIDERS.filter(p => p.capabilities.some(c => c.type === "write")).length.toString(), icon: Zap, color: "text-purple-400" },
        ].map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={`w-4 h-4 ${s.color} shrink-0`} />
              <div>
                <p className="text-lg font-bold text-foreground leading-tight">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Category */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search integrations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-muted/30 border-border/50" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PROVIDER_CATEGORIES.map(c => (
            <Button key={c.id} variant={category === c.id ? "default" : "outline"} size="sm" className="text-xs gap-1" onClick={() => setCategory(c.id)}>
              <span>{c.icon}</span> {c.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Provider Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((provider, i) => {
          const isConnected = connectedIds.has(provider.id);
          const isExpired = expiredIds.has(provider.id);
          const writeActions = provider.capabilities.filter(c => c.type === "write");
          const readActions = provider.capabilities.filter(c => c.type === "read");

          return (
            <motion.div key={provider.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Card className={`bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer group ${isConnected ? "ring-1 ring-green-500/20" : isExpired ? "ring-1 ring-amber-500/20" : ""}`}
                onClick={() => navigate(`/integrations/provider/${provider.id}`)}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: provider.color + "15" }}>
                        {provider.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{provider.displayName}</h3>
                        <p className="text-[10px] text-muted-foreground capitalize">{provider.category}</p>
                      </div>
                    </div>
                    {isConnected && <Badge className="text-[9px] bg-green-500/15 text-green-400 border-green-500/30">Connected</Badge>}
                    {isExpired && <Badge variant="destructive" className="text-[9px]">Expired</Badge>}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">{provider.description}</p>

                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[9px]">{provider.authType === "oauth2" ? "OAuth 2.0" : provider.authType === "api_key" ? "API Key" : "None"}</Badge>
                    {readActions.length > 0 && <Badge variant="outline" className="text-[9px]">📖 {readActions.length} read</Badge>}
                    {writeActions.length > 0 && <Badge variant="outline" className="text-[9px]">✏️ {writeActions.length} write</Badge>}
                    {provider.supportsWebhooks && <Badge variant="outline" className="text-[9px]">🔔 Webhooks</Badge>}
                    {writeActions.some(w => w.requiresApproval) && <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-400/30">🔒 Approval</Badge>}
                  </div>

                  <Button variant="ghost" size="sm" className="w-full text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isConnected ? "Manage" : isExpired ? "Reconnect" : "Connect"} <ArrowRight className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
