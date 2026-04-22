import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Brain, RefreshCw, Clock, Globe, Eye, Link2, Search, Layers, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type MemoryScope = "business" | "finance" | "concierge" | "admin" | "boardroom" | "device" | "ai-gateway";

interface MemoryEvent {
  id: string;
  domain: MemoryScope;
  type: "action" | "decision" | "state-change" | "context-link" | "preference";
  description: string;
  actor: string;
  timestamp: string;
  linkedEntities: string[];
  privacyTier: "public" | "internal" | "sensitive";
}

interface MemoryScopeInfo {
  scope: MemoryScope;
  label: string;
  totalEvents: number;
  lastActivity: string;
  crossLinks: number;
  healthStatus: "healthy" | "stale" | "degraded";
}

const scopeColors: Record<MemoryScope, string> = {
  business: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  finance: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  concierge: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  admin: "bg-primary/10 text-primary border-primary/20",
  boardroom: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  device: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  "ai-gateway": "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const DEMO_EVENTS: MemoryEvent[] = [
  { id: "me1", domain: "business", type: "action", description: "Invoice #4821 sent to client Acme Corp", actor: "autopilot", timestamp: "2026-04-10T09:30:00Z", linkedEntities: ["Acme Corp", "Invoice #4821"], privacyTier: "internal" },
  { id: "me2", domain: "finance", type: "state-change", description: "Cash reserve threshold crossed — $12,400 available", actor: "system", timestamp: "2026-04-10T09:28:00Z", linkedEntities: ["Cash Reserve"], privacyTier: "sensitive" },
  { id: "me3", domain: "concierge", type: "action", description: "Booking confirmed: Dr. Miller appointment at 3 PM", actor: "concierge-agent", timestamp: "2026-04-10T09:25:00Z", linkedEntities: ["Dr. Miller", "Calendar"], privacyTier: "internal" },
  { id: "me4", domain: "admin", type: "decision", description: "Policy BP-3 budget threshold updated from $5K to $8K", actor: "operator@sita.os", timestamp: "2026-04-10T09:20:00Z", linkedEntities: ["Budget Policy BP-3"], privacyTier: "internal" },
  { id: "me5", domain: "ai-gateway", type: "state-change", description: "Model routing shifted: GPT-4o → Claude 3.5 for advisory capability", actor: "routing-engine", timestamp: "2026-04-10T09:15:00Z", linkedEntities: ["Routing Policy RP-7"], privacyTier: "internal" },
  { id: "me6", domain: "boardroom", type: "context-link", description: "Weekly boardroom connected lead recovery signal to revenue forecast", actor: "boardroom-agent", timestamp: "2026-04-10T09:10:00Z", linkedEntities: ["Lead Recovery", "Revenue Forecast"], privacyTier: "public" },
  { id: "me7", domain: "device", type: "preference", description: "Apple Watch notification routing updated — urgent-only during focus mode", actor: "user", timestamp: "2026-04-10T09:05:00Z", linkedEntities: ["Apple Watch", "Focus Mode"], privacyTier: "internal" },
  { id: "me8", domain: "business", type: "decision", description: "Win-back campaign approved for 3 dormant accounts", actor: "operator@sita.os", timestamp: "2026-04-10T09:00:00Z", linkedEntities: ["Win-Back Queue"], privacyTier: "internal" },
  { id: "me9", domain: "finance", type: "action", description: "Subscription renewal processed — Pro plan for Apex Ltd", actor: "system", timestamp: "2026-04-10T08:55:00Z", linkedEntities: ["Apex Ltd", "Subscription"], privacyTier: "sensitive" },
  { id: "me10", domain: "admin", type: "state-change", description: "Connector Google Calendar entered degraded mode — sync stale >10m", actor: "health-monitor", timestamp: "2026-04-10T08:50:00Z", linkedEntities: ["Google Calendar Connector"], privacyTier: "internal" },
];

const DEMO_SCOPES: MemoryScopeInfo[] = [
  { scope: "business", label: "Business OS", totalEvents: 1847, lastActivity: "2026-04-10T09:30:00Z", crossLinks: 42, healthStatus: "healthy" },
  { scope: "finance", label: "Finance OS", totalEvents: 1203, lastActivity: "2026-04-10T09:28:00Z", crossLinks: 31, healthStatus: "healthy" },
  { scope: "concierge", label: "Concierge OS", totalEvents: 892, lastActivity: "2026-04-10T09:25:00Z", crossLinks: 18, healthStatus: "stale" },
  { scope: "admin", label: "Admin Control Plane", totalEvents: 2341, lastActivity: "2026-04-10T09:32:00Z", crossLinks: 67, healthStatus: "healthy" },
  { scope: "boardroom", label: "Boardroom", totalEvents: 456, lastActivity: "2026-04-10T09:10:00Z", crossLinks: 24, healthStatus: "healthy" },
  { scope: "device", label: "Device Layer", totalEvents: 312, lastActivity: "2026-04-10T09:05:00Z", crossLinks: 8, healthStatus: "degraded" },
  { scope: "ai-gateway", label: "AI Gateway", totalEvents: 3102, lastActivity: "2026-04-10T09:15:00Z", crossLinks: 53, healthStatus: "healthy" },
];

const healthBadge = (h: string) => {
  const { isDemoMode } = useDataMode();
  switch (h) {
    case "healthy": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "stale": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "degraded": return "bg-red-500/10 text-red-500 border-red-500/20";
    default: return "";
  }
};

const CrossDomainMemoryExplorer = () => {
  const [tab, setTab] = useState("timeline");
  const [search, setSearch] = useState("");

  const filteredEvents = search
    ? (isDemoMode ? DEMO_EVENTS : [] as typeof DEMO_EVENTS).filter(e => e.description.toLowerCase().includes(search.toLowerCase()) || e.domain.includes(search.toLowerCase()))
    : DEMO_EVENTS;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> Cross-Domain Memory Explorer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Unified memory timeline — what changed across all domains, context links, and scope visualization</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Memory Events", value: (isDemoMode ? DEMO_SCOPES : [] as typeof DEMO_SCOPES).reduce((s, d) => s + d.totalEvents, 0).toLocaleString(), color: "text-foreground" },
          { label: "Active Domains", value: `${(isDemoMode ? DEMO_SCOPES : [] as typeof DEMO_SCOPES).length}`, color: "text-primary" },
          { label: "Cross-Links", value: (isDemoMode ? DEMO_SCOPES : [] as typeof DEMO_SCOPES).reduce((s, d) => s + d.crossLinks, 0).toString(), color: "text-blue-500" },
          { label: "Health Issues", value: String((isDemoMode ? DEMO_SCOPES : [] as typeof DEMO_SCOPES).filter(s => s.healthStatus !== "healthy").length), color: "text-amber-500" },
        ].map(m => (
          <motion.div key={m.label} variants={fadeUp}>
            <Card className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="timeline" className="text-xs">What Changed Timeline</TabsTrigger>
          <TabsTrigger value="scopes" className="text-xs">Memory Scopes</TabsTrigger>
          <TabsTrigger value="links" className="text-xs">Context Links</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4 space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search events, domains..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>

          <div className="space-y-2">
            {filteredEvents.map(event => (
              <Card key={event.id} className="hover:bg-muted/20 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[9px] ${scopeColors[event.domain]}`}>{event.domain}</Badge>
                      <Badge variant="outline" className="text-[9px]">{event.type}</Badge>
                      <span className="text-xs font-medium text-foreground">{event.description}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                    <span>By: {event.actor}</span>
                    <span>Privacy: <Badge variant="outline" className="text-[9px]">{event.privacyTier}</Badge></span>
                    {event.linkedEntities.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Link2 className="h-2.5 w-2.5" />
                        {event.linkedEntities.join(", ")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scopes" className="mt-4 space-y-3">
          {(isDemoMode ? DEMO_SCOPES : [] as typeof DEMO_SCOPES).map(scope => (
            <Card key={scope.scope} className="hover:bg-muted/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[9px] ${scopeColors[scope.scope]}`}>{scope.label}</Badge>
                    <Badge variant="outline" className={`text-[9px] ${healthBadge(scope.healthStatus)}`}>{scope.healthStatus}</Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Last: {new Date(scope.lastActivity).toLocaleTimeString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-[10px]">
                  <div><span className="text-muted-foreground">Events:</span> <span className="text-foreground font-medium">{scope.totalEvents.toLocaleString()}</span></div>
                  <div><span className="text-muted-foreground">Cross-Links:</span> <span className="text-foreground font-medium">{scope.crossLinks}</span></div>
                  <div><span className="text-muted-foreground">Health:</span> <span className={scope.healthStatus === "healthy" ? "text-emerald-500" : "text-amber-500"}>{scope.healthStatus}</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="links" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" /> Cross-Domain Context Links</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(isDemoMode ? DEMO_EVENTS : [] as typeof DEMO_EVENTS).filter(e => e.linkedEntities.length > 1).map(event => (
                <div key={event.id} className="p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-[9px] ${scopeColors[event.domain]}`}>{event.domain}</Badge>
                    <span className="text-xs font-medium text-foreground">{event.description}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {event.linkedEntities.map((entity, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && <span className="text-muted-foreground text-[10px]">↔</span>}
                        <Badge variant="outline" className="text-[9px]">{entity}</Badge>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrossDomainMemoryExplorer;
