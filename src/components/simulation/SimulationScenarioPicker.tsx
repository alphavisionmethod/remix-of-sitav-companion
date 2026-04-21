// ═══════════════════════════════════════════════════════════════
// SITA OS — SimulationScenarioPicker
// Premium scenario selection grid with three domain families
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play, Settings2, Briefcase, Headphones, DollarSign, Sparkles } from "lucide-react";
import {
  DOMAIN_SCENARIOS,
  DOMAIN_META,
  getPopularScenarios,
  type DomainScenario,
  type ScenarioDomain,
} from "@/domains/simulation/domain-scenarios";

interface SimulationScenarioPickerProps {
  onSelect: (scenario: DomainScenario, mode: "quick" | "customize") => void;
  className?: string;
}

const DOMAIN_ICONS: Record<ScenarioDomain, React.ElementType> = {
  business: Briefcase,
  concierge: Headphones,
  finance: DollarSign,
};

export function SimulationScenarioPicker({ onSelect, className }: SimulationScenarioPickerProps) {
  const popular = getPopularScenarios();
  const domains: ScenarioDomain[] = ["business", "concierge", "finance"];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Popular */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Popular Scenarios</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((s) => {
            const meta = DOMAIN_META[s.domain];
            return (
              <ScenarioCard key={s.id} scenario={s} meta={meta} onSelect={onSelect} />
            );
          })}
        </div>
      </div>

      {/* By domain */}
      {domains.map((d) => {
        const meta = DOMAIN_META[d];
        const Icon = DOMAIN_ICONS[d];
        const scenarios = DOMAIN_SCENARIOS.filter((s) => s.domain === d);

        return (
          <div key={d}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={cn("h-4 w-4", meta.color)} />
              <h3 className="text-sm font-semibold text-foreground">{meta.label}</h3>
              <span className="text-[10px] text-muted-foreground">{meta.description}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {scenarios.map((s) => (
                <ScenarioCard key={s.id} scenario={s} meta={meta} onSelect={onSelect} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScenarioCard({
  scenario,
  meta,
  onSelect,
}: {
  scenario: DomainScenario;
  meta: { label: string; color: string };
  onSelect: (s: DomainScenario, mode: "quick" | "customize") => void;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm p-3 space-y-2 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground line-clamp-1">{scenario.label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{scenario.question}</p>
        </div>
        <span className={cn("text-[9px] font-medium shrink-0", meta.color)}>{meta.label}</span>
      </div>
      <p className="text-[10px] text-foreground/50 line-clamp-1">{scenario.variables.length} variables</p>
      <div className="flex gap-1.5">
        <Button
          variant="default"
          size="sm"
          className="h-6 text-[10px] gap-1 flex-1"
          onClick={() => onSelect(scenario, "quick")}
        >
          <Play className="h-3 w-3" /> Quick Run
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-6 text-[10px] gap-1"
          onClick={() => onSelect(scenario, "customize")}
        >
          <Settings2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}