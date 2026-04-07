import { Ruler, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DESIGN_GOVERNANCE_RULES } from "@/lib/services/frontend/frontend-quality-engine";
import { useDataMode } from "@/contexts/DataModeContext";

const categoryColor = (cat: string) => {
  switch (cat) {
    case 'component': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'spacing': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'copy': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'state': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'anti-pattern': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'consistency': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    default: return '';
  }
};

export default function FE02DesignGovernance() {
  const { isDemoMode } = useDataMode();
  const enforced = DESIGN_GOVERNANCE_RULES.filter(r => r.enforced).length;
  const total = DESIGN_GOVERNANCE_RULES.length;
  const categories = [...new Set(DESIGN_GOVERNANCE_RULES.map(r => r.category))];

  return (
    <div className="space-y-6 p-6" data-testid="fe02-design-governance">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Ruler className="h-6 w-6 text-primary" /> FE02 — Design System Governance
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Component, spacing, copy, state, and anti-pattern rules for consistent premium quality
        </p>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4">
        <Card className="flex-1">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-foreground">{enforced}/{total}</div>
            <div className="text-xs text-muted-foreground">Rules Enforced</div>
          </CardContent>
        </Card>
        {categories.map((cat) => {
          const catRules = DESIGN_GOVERNANCE_RULES.filter(r => r.category === cat);
          const catEnforced = catRules.filter(r => r.enforced).length;
          return (
            <Card key={cat} className="flex-1">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-bold text-foreground">{catEnforced}/{catRules.length}</div>
                <div className="text-xs text-muted-foreground capitalize">{cat}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rules by Category */}
      {categories.map((cat) => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              <Badge className={categoryColor(cat)}>{cat}</Badge>
              Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DESIGN_GOVERNANCE_RULES.filter(r => r.category === cat).map((rule) => (
              <div key={rule.id} className="p-3 rounded-lg bg-card border border-border flex items-start gap-3">
                {rule.enforced ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{rule.id}</span>
                    <span className="text-sm font-medium">{rule.rule}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{rule.rationale}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
