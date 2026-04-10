import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { CORE_SERVICE_PERSISTENCE, getCoreServiceHealth } from "@/lib/reality-audit/reality-audit-registry";

const stateColors: Record<string, string> = {
  "in-memory": "text-red-400 bg-red-500/10 border-red-500/30",
  "partially-persisted": "text-amber-400 bg-amber-500/10 border-amber-500/30",
  "fully-persisted": "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
};

const CoreServicePersistence = () => {
  const health = getCoreServiceHealth();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Database className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Core Service Persistence Program</h1>
          <p className="text-sm text-muted-foreground">Converting in-memory OS core into durable, persistent services</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Services", value: health.total, color: "text-blue-400" },
          { label: "Fully Persisted", value: health.persisted, color: health.persisted > 0 ? "text-emerald-400" : "text-muted-foreground" },
          { label: "In-Memory", value: health.inMemory, color: health.inMemory > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "P0 Blockers", value: health.p0Blockers, color: health.p0Blockers > 0 ? "text-red-400" : "text-emerald-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Service cards */}
      <div className="space-y-4">
        {CORE_SERVICE_PERSISTENCE.map(s => (
          <Card key={s.id} className={s.currentState === "in-memory" && s.priority === "P0" ? "border-red-500/30" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" /> {s.serviceName}
                  <Badge variant={s.priority === "P0" ? "destructive" : "secondary"} className="text-[10px]">{s.priority}</Badge>
                </CardTitle>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${stateColors[s.currentState]}`}>{s.currentState}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {/* Current → Target */}
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded border ${stateColors[s.currentState]}`}>{s.currentState}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">{s.persistenceTarget}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground text-xs">Event Model</span>
                  <p className="text-xs mt-0.5">{s.eventModel}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Projection Model</span>
                  <p className="text-xs mt-0.5">{s.projectionModel}</p>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-xs">Blocks</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {s.blockerFor.map(b => <Badge key={b} variant="outline" className="text-[10px]">{b}</Badge>)}
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground p-2 rounded bg-muted/30">{s.notes}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Migration path */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recommended Migration Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {CORE_SERVICE_PERSISTENCE.filter(s => s.priority === "P0").map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-400">{s.serviceName}</div>
                {i < CORE_SERVICE_PERSISTENCE.filter(x => x.priority === "P0").length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            {CORE_SERVICE_PERSISTENCE.filter(s => s.priority === "P1").map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm font-medium text-amber-400">{s.serviceName}</div>
                {i < CORE_SERVICE_PERSISTENCE.filter(x => x.priority === "P1").length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoreServicePersistence;
