import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Eye, Brain, Layers, BellOff } from "lucide-react";

export default function CAI03AttentionCenter() {
  const { attentionOS, sitaModes } = useSitaOS();

  const stack = attentionOS.getAttentionStack();
  const cogLoad = attentionOS.getCognitiveLoad();
  const mode = sitaModes.getMode();

  const loadColor = cogLoad.score > 0.7 ? "text-urgency-high" : cogLoad.score > 0.4 ? "text-urgency-medium" : "text-trust-safe";

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Eye} title="Priority Stack / Attention OS" subtitle="What matters now, what can wait, what should be suppressed — attention governance in real time" accent="trust" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Cognitive Load" value={`${Math.round(cogLoad.score * 100)}%`} trend={cogLoad.score > 0.7 ? "down" : "up"} sub={cogLoad.label ?? "Normal"} /></SitaCard>
        <SitaCard><SitaMetric label="Critical Items" value={stack.critical.length} trend={stack.critical.length > 0 ? "down" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Active Items" value={stack.active.length} /></SitaCard>
        <SitaCard><SitaMetric label="Current Mode" value={mode} /></SitaCard>
      </div>

      {stack.critical.length > 0 && (
        <>
          <SitaSectionHeader title="Critical — Needs Immediate Attention" />
          <div className="space-y-2">
            {stack.critical.map((item: any, i: number) => (
              <SitaCard key={i} lane="action" glow>
                <SitaCardHeader>
                  <SitaCardTitle sub={item.source ?? "system"}>{item.title ?? item.label ?? `Critical #${i + 1}`}</SitaCardTitle>
                  <span className="text-xs font-bold text-urgency-high">CRITICAL</span>
                </SitaCardHeader>
                {item.reason && <p className="text-xs text-muted-foreground">{item.reason}</p>}
              </SitaCard>
            ))}
          </div>
        </>
      )}

      <SitaSectionHeader title="Active Stack" subtitle={`${stack.active.length} items competing for attention`} />
      <div className="space-y-2">
        {stack.active.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">Attention stack is clear. System is calm.</p></SitaCard>}
        {stack.active.slice(0, 12).map((item: any, i: number) => (
          <SitaCard key={i}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground">{item.title ?? item.label ?? `Item ${i + 1}`}</span>
              </div>
              <span className="text-xs text-muted-foreground">{item.urgency ?? "normal"}</span>
            </div>
          </SitaCard>
        ))}
      </div>

      {(stack.deferred?.length ?? 0) > 0 && (
        <>
          <SitaSectionHeader title="Deferred / Suppressed" subtitle="Held back by timing or mode" />
          <div className="space-y-2">
            {stack.deferred.slice(0, 6).map((item: any, i: number) => (
              <SitaCard key={i} lane="changed">
                <div className="flex items-center gap-2">
                  <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{item.title ?? `Deferred #${i + 1}`}</span>
                </div>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      <SitaSectionHeader title="Cognitive Load Breakdown" />
      <SitaCard>
        <div className="flex items-center gap-3">
          <Brain className={`h-6 w-6 ${loadColor}`} />
          <div>
            <p className={`text-lg font-bold ${loadColor}`}>{Math.round(cogLoad.score * 100)}% Load</p>
            <p className="text-xs text-muted-foreground">
              {cogLoad.factors?.map((f: any) => f.label ?? f).join(" · ") ?? "No contributing factors"}
            </p>
          </div>
        </div>
      </SitaCard>
    </div>
  );
}
