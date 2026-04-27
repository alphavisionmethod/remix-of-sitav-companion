import { useSitaOS } from "@/platform/sita/contexts/SitaOSContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Eye, Brain, Layers, BellOff } from "lucide-react";

export default function CAI03AttentionCenter() {
  const { attentionOS, sitaModes } = useSitaOS();

  const stack = attentionOS.getAttentionStack();
  const cogLoad = stack.cognitiveLoad;
  const mode = sitaModes.getMode();

  const loadColor = cogLoad.score > 70 ? "text-urgency-high" : cogLoad.score > 40 ? "text-urgency-medium" : "text-trust-safe";

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Eye} title="Priority Stack / Attention OS" subtitle="What matters now, what can wait, what should be suppressed — attention governance in real time" accent="trust" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Cognitive Load" value={`${cogLoad.score}%`} trend={cogLoad.score > 70 ? "down" : "up"} sub={cogLoad.level} /></SitaCard>
        <SitaCard><SitaMetric label="Critical Items" value={stack.critical.length} trend={stack.critical.length > 0 ? "down" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Active Items" value={stack.active.length} /></SitaCard>
        <SitaCard><SitaMetric label="Current Mode" value={mode} /></SitaCard>
      </div>

      {stack.critical.length > 0 && (
        <>
          <SitaSectionHeader title="Critical — Needs Immediate Attention" />
          <div className="space-y-2">
            {stack.critical.map((item, i) => (
              <SitaCard key={item.id ?? i} lane="action" glow>
                <SitaCardHeader>
                  <SitaCardTitle sub={item.source}>{item.title}</SitaCardTitle>
                  <span className="text-xs font-bold text-urgency-high">CRITICAL</span>
                </SitaCardHeader>
                <p className="text-xs text-muted-foreground">{item.domain} · urgency {item.urgency}</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      <SitaSectionHeader title="Active Stack" subtitle={`${stack.active.length} items competing for attention`} />
      <div className="space-y-2">
        {stack.active.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">Attention stack is clear. System is calm.</p></SitaCard>}
        {stack.active.slice(0, 12).map((item, i) => (
          <SitaCard key={item.id ?? i}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground">{item.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">{item.priority}</span>
            </div>
          </SitaCard>
        ))}
      </div>

      {stack.suppressed.length > 0 && (
        <>
          <SitaSectionHeader title="Suppressed" subtitle="Held back by mode or timing" />
          <div className="space-y-2">
            {stack.suppressed.slice(0, 6).map((item, i) => (
              <SitaCard key={item.id ?? i} lane="changed">
                <div className="flex items-center gap-2">
                  <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{item.title}</span>
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
            <p className={`text-lg font-bold ${loadColor}`}>{cogLoad.score}% Load — {cogLoad.level}</p>
            <p className="text-xs text-muted-foreground">
              {cogLoad.activeItems} active items · {cogLoad.pendingDecisions} pending decisions · {cogLoad.itemsThisHour}/{cogLoad.maxItemsPerHour} items/hr
            </p>
          </div>
        </div>
      </SitaCard>
    </div>
  );
}
