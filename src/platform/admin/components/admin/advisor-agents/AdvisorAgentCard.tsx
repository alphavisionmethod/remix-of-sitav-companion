import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Shield, Brain, ChevronUp, ChevronDown, Play,
  DollarSign, Briefcase, Home, Clock
} from "lucide-react";
import type { AdvisorAgent } from "@/platform/advisors/hooks/use-advisor-agents";
import { LaunchHonestyBadge } from "@/platform/product/components/reality/LaunchHonestyBadge";

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  money: DollarSign,
  business: Briefcase,
  concierge: Home,
};

const AUTONOMY_LABELS = ["L0 Observe", "L1 Diagnose", "L2 Recommend", "L3 Draft", "L4 Simulate", "L5 Approval Ready", "L6 Constrained Action"];

const MATURITY_TO_HONESTY: Record<string, "truthful" | "qualified" | "demo_governed" | "partial" | "planned"> = {
  production: "truthful",
  beta: "partial",
  alpha: "qualified",
  scaffold: "demo_governed",
};

interface Props {
  agent: AdvisorAgent;
  onToggle: (id: string, active: boolean) => void;
  onAutonomyChange: (id: string, level: number) => void;
  onInvoke: (advisorId: string) => void;
  invoking: boolean;
}

export function AdvisorAgentCard({ agent, onToggle, onAutonomyChange, onInvoke, invoking }: Props) {
  const DomainIcon = DOMAIN_ICONS[agent.domain] || Brain;
  const budgetPct = agent.budget_daily_tokens > 0
    ? Math.round((agent.tokens_used_today / agent.budget_daily_tokens) * 100)
    : 0;

  const timeSince = (iso: string | null) => {
    if (!iso) return "Never";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Card className={`transition-all ${!agent.is_active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DomainIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{agent.display_name}</CardTitle>
            <LaunchHonestyBadge honestyClass={MATURITY_TO_HONESTY[agent.maturity] ?? "planned"} compact />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={agent.is_active ? "default" : "secondary"} className="text-xs">
              {agent.is_active ? "Active" : "Paused"}
            </Badge>
            <Switch
              checked={agent.is_active}
              onCheckedChange={(v) => onToggle(agent.id, v)}
            />
          </div>
        </div>
        {agent.mission && (
          <p className="text-xs text-muted-foreground mt-1">{agent.mission}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Autonomy Level */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Autonomy
            </span>
            <span className="font-mono text-primary">
              {AUTONOMY_LABELS[agent.autonomy_level] || `L${agent.autonomy_level}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" size="icon" className="h-6 w-6"
              onClick={() => onAutonomyChange(agent.id, agent.autonomy_level - 1)}
              disabled={agent.autonomy_level <= 0}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Slider
              value={[agent.autonomy_level]}
              min={0} max={6} step={1}
              onValueChange={([v]) => onAutonomyChange(agent.id, v)}
              className="flex-1"
            />
            <Button
              variant="ghost" size="icon" className="h-6 w-6"
              onClick={() => onAutonomyChange(agent.id, agent.autonomy_level + 1)}
              disabled={agent.autonomy_level >= 6}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last scan: {timeSince(agent.last_observation_at)}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Brain className="h-3 w-3" />
            Confidence: {(Number(agent.confidence_threshold) * 100).toFixed(0)}%
          </div>
          <div className="text-muted-foreground">
            Budget: {budgetPct}% used ({agent.tokens_used_today.toLocaleString()}/{agent.budget_daily_tokens.toLocaleString()})
          </div>
          <div className="text-muted-foreground">
            Invocations: {agent.invocations_today} today
          </div>
        </div>

        {/* Maturity + Invoke */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">{agent.maturity}</Badge>
          <Button
            size="sm" variant="outline"
            onClick={() => onInvoke(agent.advisor_id)}
            disabled={!agent.is_active || invoking}
          >
            <Play className="h-3 w-3 mr-1" />
            Run Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
