// ═══════════════════════════════════════════════════════════════
// SITA OS — ExplainPanel (Jarvis Bridge)
// "Why this, why now" — composes persona + confidence + council
// vote + reversibility + memories + plan steps for any selected
// item from the unified action queue.
// ═══════════════════════════════════════════════════════════════

import { ShieldQuestion, Brain, Vote, Repeat, ListTree, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { useExplanation } from "@/lib/sita-jarvis";
import type { JarvisActionItem } from "@/lib/sita-jarvis";
import { useAuth } from "@/contexts/AuthContext";

interface Props { item: JarvisActionItem | null; }

const GATE_BADGE = {
  auto: { label: "Auto-allowed", variant: "outline" as const },
  approval: { label: "Needs approval", variant: "outline" as const },
  block: { label: "Blocked", variant: "destructive" as const },
  unknown: { label: "Unknown", variant: "outline" as const },
};

export function ExplainPanel({ item }: Props) {
  const { user } = useAuth();
  const { explanation, loading } = useExplanation(item, user?.id ?? null);

  if (!item) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldQuestion className="h-4 w-4 text-primary" /> Explain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PremiumEmptyState
            variant="first-use"
            title="Select an item"
            description="Pick anything from the action queue to see why Sita surfaced it, who recommended it, the council vote, and what it will do."
          />
        </CardContent>
      </Card>
    );
  }

  if (loading || !explanation) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldQuestion className="h-4 w-4" /> Explain</CardTitle></CardHeader>
        <CardContent className="space-y-2"><Skeleton className="h-20 w-full" /><Skeleton className="h-12 w-full" /></CardContent>
      </Card>
    );
  }

  const gate = GATE_BADGE[explanation.confidence.gate];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldQuestion className="h-4 w-4 text-primary" /> Explain
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <div className="font-medium leading-tight">{explanation.item.title}</div>
          {explanation.item.summary && <div className="mt-1 text-xs text-muted-foreground">{explanation.item.summary}</div>}
        </div>

        {/* Persona / advisor identity */}
        <Section icon={<Brain className="h-3.5 w-3.5" />} label="Who recommended">
          {explanation.persona ? (
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-[10px]">{explanation.persona.advisorId}</Badge>
              <Badge variant="outline" className="text-[10px]">{explanation.persona.role}</Badge>
              {explanation.persona.fenced.length > 0 && (
                <Badge variant="outline" className="text-[10px]">fenced: {explanation.persona.fenced.join(", ")}</Badge>
              )}
            </div>
          ) : <span className="text-xs text-muted-foreground">No advisor attribution.</span>}
        </Section>

        {/* Confidence + gate */}
        <Section icon={<Vote className="h-3.5 w-3.5" />} label="Confidence">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {explanation.confidence.score != null ? `${(explanation.confidence.score * 100).toFixed(0)}%` : "—"}
            </Badge>
            <Badge variant={gate.variant} className="text-[10px]">{gate.label}</Badge>
          </div>
        </Section>

        {/* Reversibility */}
        <Section icon={<Repeat className="h-3.5 w-3.5" />} label="Reversibility">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {explanation.reversibility.reversible === true ? "reversible" : explanation.reversibility.reversible === false ? "irreversible" : "unknown"}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              rollback {explanation.reversibility.rollbackEligible ? "available" : "unavailable"}
            </Badge>
          </div>
        </Section>

        {/* Council votes */}
        {explanation.councilVotes.length > 0 && (
          <Section icon={<Vote className="h-3.5 w-3.5" />} label="Council vote">
            <ul className="space-y-1">
              {explanation.councilVotes.map((v, i) => (
                <li key={`${v.advisorId}-${i}`} className="flex items-center justify-between text-xs">
                  <span className="font-mono">{v.advisorId}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={v.vote === "dissent" ? "destructive" : "outline"} className="text-[10px]">{v.vote}</Badge>
                    <span className="font-mono text-[10px] text-muted-foreground">{v.score.toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Plan steps */}
        {explanation.steps.length > 0 && (
          <Section icon={<ListTree className="h-3.5 w-3.5" />} label="What it will do">
            <ol className="space-y-1 list-decimal list-inside text-xs text-muted-foreground">
              {explanation.steps.map((s) => (
                <li key={s.id}>
                  <span className="text-foreground">{s.summary}</span>{" "}
                  <Badge variant="outline" className="text-[9px]">risk {s.risk}</Badge>{" "}
                  {s.reversible && <Badge variant="outline" className="text-[9px]">reversible</Badge>}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Source memories */}
        {explanation.memories.length > 0 && (
          <Section icon={<BookOpen className="h-3.5 w-3.5" />} label="Source memories">
            <ul className="space-y-1 text-xs text-muted-foreground">
              {explanation.memories.slice(0, 3).map((m) => (
                <li key={m.id} className="line-clamp-2">{m.content}</li>
              ))}
            </ul>
          </Section>
        )}
      </CardContent>
    </Card>
  );
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">{icon} {label}</div>
      <div>{children}</div>
    </div>
  );
}