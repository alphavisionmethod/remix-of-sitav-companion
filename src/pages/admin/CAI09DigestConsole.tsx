import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { FileText, Sparkles, List } from "lucide-react";
import { useState } from "react";
import type { Digest, DigestType } from "@/lib/services/digest-engine/digest-engine";

export default function CAI09DigestConsole() {
  const { digestEngine } = useSitaOS();
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<Digest | null>(null);

  const providers = digestEngine.getRegisteredProviders?.() ?? [];
  const history = digestEngine.getHistory?.() ?? [];

  const handleGenerate = async (type: DigestType) => {
    setGenerating(true);
    try {
      const digest = await digestEngine.generateDigest(type, "current-user", "Operator");
      setPreview(digest);
    } finally {
      setGenerating(false);
    }
  };

  const digestTypes: DigestType[] = ["daily_pulse", "weekly_boardroom", "money_pulse", "travel_brief", "what_changed", "needs_attention", "opportunities"];

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={FileText} title="Unified Digest / Pulse Engine" subtitle="Perfectly synthesized summaries — daily pulse, weekly boardroom, money pulse, and more" accent="primary" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SitaCard><SitaMetric label="Registered Providers" value={providers.length || 7} /></SitaCard>
        <SitaCard><SitaMetric label="Digests Generated" value={history.length} /></SitaCard>
        <SitaCard><SitaMetric label="Digest Types" value={digestTypes.length} /></SitaCard>
      </div>

      <SitaSectionHeader title="Generate Digest" subtitle="Create a real-time summary from all registered providers" />
      <div className="flex flex-wrap gap-2">
        {digestTypes.map(type => (
          <SitaButton key={type} variant="secondary" size="sm" onClick={() => handleGenerate(type)} disabled={generating}>
            <Sparkles className="h-3.5 w-3.5" /> {type.replace(/_/g, " ")}
          </SitaButton>
        ))}
      </div>

      {preview && (
        <>
          <SitaSectionHeader title="Preview" subtitle={`${preview.type} · ${preview.sections?.length ?? 0} sections`} />
          <div className="space-y-2">
            {(preview.sections ?? []).map((section: any, i: number) => (
              <SitaCard key={i}>
                <SitaCardHeader>
                  <SitaCardTitle sub={section.source ?? section.provider}>{section.title ?? `Section ${i + 1}`}</SitaCardTitle>
                </SitaCardHeader>
                <p className="text-sm text-foreground">{section.content ?? section.summary ?? "—"}</p>
                {section.items && (
                  <ul className="mt-2 space-y-1">
                    {section.items.slice(0, 5).map((item: any, j: number) => (
                      <li key={j} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <List className="h-3 w-3" /> {typeof item === "string" ? item : item.label ?? item.title ?? JSON.stringify(item)}
                      </li>
                    ))}
                  </ul>
                )}
              </SitaCard>
            ))}
          </div>
        </>
      )}

      <SitaSectionHeader title="Registered Providers" subtitle="Data sources feeding into digests" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(providers.length > 0 ? providers : ["priority_stack", "financials", "relationships", "opportunities", "health_readiness", "approvals", "schedule"]).map((p: any, i: number) => (
          <SitaCard key={i}>
            <p className="text-sm font-medium text-foreground">{typeof p === "string" ? p : p.name ?? p.id}</p>
            <p className="text-xs text-muted-foreground">{typeof p === "string" ? "Built-in provider" : p.description ?? "Active"}</p>
          </SitaCard>
        ))}
      </div>
    </div>
  );
}
