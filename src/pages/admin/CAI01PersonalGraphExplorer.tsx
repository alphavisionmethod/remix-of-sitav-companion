import { useSitaOS } from "@/platform/sita/contexts/SitaOSContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Share2, Layers, AlertTriangle, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function CAI01PersonalGraphExplorer() {
  const { personalGraph } = useSitaOS();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const stats = personalGraph.getStats();
  const ignoredItems = personalGraph.getIgnoredItems();
  const crossDomain = selectedNode ? personalGraph.resolveCrossDomain(selectedNode) : null;
  const domains = Object.keys(stats.byDomain);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Share2} title="Personal Operating Graph" subtitle="Canonical graph of your operating world — identity, relationships, tasks, devices, and opportunities" accent="primary" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Total Nodes" value={stats.totalNodes} /></SitaCard>
        <SitaCard><SitaMetric label="Total Edges" value={stats.totalEdges} /></SitaCard>
        <SitaCard><SitaMetric label="Domains" value={domains.length} /></SitaCard>
        <SitaCard><SitaMetric label="Avg Trust" value={`${Math.round(stats.avgTrust * 100)}%`} trend={stats.avgTrust > 0.7 ? "up" : "flat"} /></SitaCard>
      </div>

      <SitaSectionHeader title="Nodes by Domain" subtitle="Distribution across the personal operating graph" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map((domain) => (
          <SitaCard key={domain} hover onClick={() => setSelectedNode(domain)}>
            <SitaCardHeader>
              <SitaCardTitle>{domain}</SitaCardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </SitaCardHeader>
            <p className="text-xs text-muted-foreground">{stats.byDomain[domain] ?? 0} nodes · {stats.byType[domain] ?? 0} by type</p>
          </SitaCard>
        ))}
      </div>

      {crossDomain && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <SitaSectionHeader title="Cross-Domain Resolution" subtitle={`Resolving: ${selectedNode}`} />
          <SitaCard>
            <p className="text-sm text-foreground font-medium">{crossDomain.narrative}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {crossDomain.touchedDomains.map((d: string) => (
                <span key={d} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{d}</span>
              ))}
            </div>
          </SitaCard>
        </motion.div>
      )}

      {ignoredItems.length > 0 && (
        <>
          <SitaSectionHeader title="Ignored Items" subtitle="Items deprioritized by the attention system" />
          <div className="grid gap-2 sm:grid-cols-2">
            {ignoredItems.slice(0, 8).map((item, i) => (
              <SitaCard key={item.id ?? i} lane="unresolved">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-urgency-medium" />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.domain} · touched {item.touchCount} times</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      <SitaSectionHeader title="Meeting Context Lookup" subtitle="Select a contact node to preview meeting context" />
      <SitaCard>
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a relationship node above to view meeting context and cross-domain connections.</p>
        </div>
      </SitaCard>
    </div>
  );
}
