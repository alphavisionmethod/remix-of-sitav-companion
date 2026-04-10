import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { FileText, Sparkles, List } from "lucide-react";
import { useState } from "react";
import type { Digest, DigestType } from "@/lib/services/digest-engine/digest-engine";

const DIGEST_TYPES: DigestType[] = ["daily_pulse", "weekly_boardroom", "travel_brief", "risk_digest", "opportunity_digest", "readiness_digest", "assistant_catchup"];

export default function CAI09DigestConsole() {
  const { digestEngine } = useSitaOS();
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<Digest | null>(null);

  const stats = digestEngine.getStats();
  const history = digestEngine.getHistory("current-user");

  const handleGenerate = async (type: DigestType) => {
    setGenerating(true);
    try {
      const digest = await digestEngine.generateDigest(type, "current-user", "Operator");
      setPreview(digest);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={FileText} title="Unified Digest / Pulse Engine" subtitle="Perfectly synthesized summaries — daily pulse, weekly boardroom, and more" accent="primary" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SitaCard><SitaMetric label="Total Generated" value={stats.totalGenerated} /></SitaCard>
        <SitaCard><SitaMetric label="Read Rate" value={`${Math.round(stats.readRate * 100)}%`} trend={stats.readRate > 0.7 ? "up" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Digest Types" value={DIGEST_TYPES.length} /></SitaCard>
      </div>

      <SitaSectionHeader title="Generate Digest" subtitle="Create a real-time summary from all registered providers" />
      <div className="flex flex-wrap gap-2">
        {DIGEST_TYPES.map(type => (
          <SitaButton key={type} variant="secondary" size="sm" onClick={() => handleGenerate(type)} disabled={generating}>
            <Sparkles className="h-3.5 w-3.5" /> {type.replace(/_/g, " ")}
          </SitaButton>
        ))}
      </div>

      {preview && (
        <>
          <SitaSectionHeader title="Preview" subtitle={`${preview.type} · ${preview.sections.length} sections`} />
          <div className="space-y-2">
            {preview.sections.map((section, i) => (
              <SitaCard key={i}>
                <SitaCardHeader>
                  <SitaCardTitle sub={section.source}>{section.title}</SitaCardTitle>
                </SitaCardHeader>
                <p className="text-sm text-foreground">{section.content}</p>
                {section.items.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {section.items.slice(0, 5).map((item, j) => (
                      <li key={j} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <List className="h-3 w-3" /> {item}
                      </li>
                    ))}
                  </ul>
                )}
              </SitaCard>
            ))}
          </div>
        </>
      )}

      <SitaSectionHeader title="By Type" subtitle="Distribution of generated digests" />
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {Object.entries(stats.byType).map(([type, count]) => (
          <SitaCard key={type}>
            <SitaMetric label={type.replace(/_/g, " ")} value={count} />
          </SitaCard>
        ))}
      </div>

      {history.length > 0 && (
        <>
          <SitaSectionHeader title="Recent History" subtitle="Previously generated digests" />
          <div className="space-y-2">
            {history.slice(0, 6).map((d) => (
              <SitaCard key={d.id}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{d.type.replace(/_/g, " ")}</span>
                  <span className="text-xs text-muted-foreground">{d.generatedAt}</span>
                </div>
              </SitaCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
