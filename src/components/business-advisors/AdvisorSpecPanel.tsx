// ═══════════════════════════════════════════════════════════════
// SITA OS — Generic Advisor Spec Renderer
//
// One renderer for the 23-section build spec. Per-advisor
// *SpecPanel.tsx files pass their typed spec to this component
// so we never duplicate UI.
//
// Visuals use semantic tokens only.
// ═══════════════════════════════════════════════════════════════

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  Crown,
  FileSearch,
  FlaskConical,
  GitBranch,
  Layers,
  Lock,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import type { BusinessAdvisorSpec } from "@/lib/ai-platform/specs";

function SectionHeader({ icon: Icon, title, description }: {
  icon: typeof Sparkles;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-md bg-muted p-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

function PillList({ items }: { items: readonly string[] }) {
  if (items.length === 0) return <p className="text-xs text-muted-foreground">—</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it, i) => (
        <Badge key={`${it}-${i}`} variant="secondary" className="text-xs font-normal">
          {it}
        </Badge>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  if (items.length === 0) return <p className="text-xs text-muted-foreground">—</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 text-sm">
          <span className="text-muted-foreground mt-1.5 h-1 w-1 rounded-full bg-current shrink-0" />
          <span className="leading-relaxed">{it}</span>
        </li>
      ))}
    </ul>
  );
}

export interface AdvisorSpecPanelProps {
  spec: BusinessAdvisorSpec;
}

export function AdvisorSpecPanel({ spec }: AdvisorSpecPanelProps) {
  return (
    <div className="space-y-4" data-testid="advisor-spec-panel">
      {/* 1. Identity + 2. Mission */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={Compass}
            title="Identity & mission"
            description="What this advisor is and why it exists in Business OS."
          />
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed">{spec.positioning}</p>
          <p className="text-sm leading-relaxed">{spec.mission}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Distinction</p>
              <p className="text-sm">{spec.distinction}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Intelligence archetype</p>
              <p className="text-sm">{spec.intelligenceArchetype}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">User feel</p>
              <p className="text-sm">{spec.userFeel}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Trusted by</p>
              <p className="text-sm">{spec.trustedBy}</p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Outcomes improved</p>
            <BulletList items={spec.outcomesImproved} />
          </div>
        </CardContent>
      </Card>

      {/* 3. Boundaries */}
      <Card>
        <CardHeader>
          <SectionHeader icon={GitBranch} title="Domain boundaries" description="What this advisor owns, refuses, and escalates." />
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Handles</p>
            <PillList items={spec.handles} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Does not handle</p>
            <PillList items={spec.doesNotHandle} />
          </div>
          {spec.escalatesTo.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Escalates to</p>
              <ul className="space-y-1 text-sm">
                {spec.escalatesTo.map((e, i) => (
                  <li key={i}>
                    <Badge variant="outline" className="mr-2">{e.advisorId}</Badge>
                    <span className="text-muted-foreground">{e.trigger}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Use cases + 5. Questions */}
      <Card>
        <CardHeader>
          <SectionHeader icon={Target} title="Use cases & questions" description="Real operator scenarios." />
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Core use cases</p>
            <BulletList items={spec.coreUseCases} />
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Typical questions</p>
            <BulletList items={spec.typicalQuestions} />
          </div>
        </CardContent>
      </Card>

      {/* 6. Inputs + 7. Behaviors + 8. Outputs */}
      <Card>
        <CardHeader>
          <SectionHeader icon={Layers} title="Inputs, intelligence & outputs" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Required inputs</p>
              <PillList items={spec.requiredInputs} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Optional inputs</p>
              <PillList items={spec.optionalInputs} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Future inputs</p>
              <PillList items={spec.highValueFutureInputs} />
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Intelligence behaviors</p>
            <ul className="space-y-2">
              {spec.intelligenceBehaviors.map((b, i) => (
                <li key={i} className="rounded-md border border-border p-2">
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                </li>
              ))}
            </ul>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Output types</p>
            <PillList items={spec.outputTypes} />
          </div>
        </CardContent>
      </Card>

      {/* 9. UI surfaces + 10. OS integrations */}
      <Card>
        <CardHeader>
          <SectionHeader icon={Sparkles} title="UI surfaces & OS integrations" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">UI surfaces</p>
            <PillList items={spec.uiSurfaces} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">OS integration points</p>
            <PillList items={spec.osIntegrationPoints} />
          </div>
        </CardContent>
      </Card>

      {/* 11. Automation matrix L0–L5 */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={Lock}
            title="Automation model (L0 → L5)"
            description={`Current authority ceiling: ${spec.currentAuthorityCeiling}`}
          />
        </CardHeader>
        <CardContent className="space-y-3">
          {spec.automationMatrix.map((entry) => (
            <div key={entry.level} className="rounded-md border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{entry.level}</Badge>
                  <p className="text-sm font-medium">{entry.label}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Can do
                  </p>
                  <BulletList items={entry.canDo} />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Must not do
                  </p>
                  <BulletList items={entry.mustNotDo} />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Approval required
                  </p>
                  <BulletList items={entry.approvalRequiredFor} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 12 + 13 */}
      <Card>
        <CardHeader>
          <SectionHeader icon={ShieldCheck} title="Trust, safety & explainability" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Trust rules</p>
            <BulletList items={spec.trustRules} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Disallowed autonomous actions</p>
            <PillList items={spec.disallowedAutonomousActions} />
          </div>
          {spec.receiptedActions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Receipted actions</p>
              <PillList items={spec.receiptedActions} />
            </div>
          )}
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Explainability requirements</p>
            <BulletList items={spec.explainabilityRequirements} />
          </div>
        </CardContent>
      </Card>

      {/* 14. Simulation contract */}
      <Card>
        <CardHeader>
          <SectionHeader icon={FlaskConical} title="Simulation contract" description={spec.simulation.summary} />
        </CardHeader>
        <CardContent className="space-y-2">
          {spec.simulation.scenarios.map((s) => (
            <div key={s.id} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{s.label}</p>
                {s.nonAuthoritative && (
                  <Badge variant="destructive" className="text-xs">non-authoritative</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Compares: {s.compares}</p>
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                <div>
                  <p className="font-medium text-muted-foreground">Required</p>
                  <PillList items={s.requiredInputs} />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Optional</p>
                  <PillList items={s.optionalInputs} />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Outputs</p>
                  <PillList items={s.outputs} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 15 + 16 + 17 */}
      <Card>
        <CardHeader>
          <SectionHeader icon={Megaphone} title="Memory, proactive signals & knowledge" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Memory rules</p>
            <BulletList items={spec.memoryRules} />
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Proactive signals</p>
            <ul className="space-y-2">
              {spec.proactiveSignals.map((p, i) => (
                <li key={i} className="rounded-md border border-border p-2 text-xs">
                  <p className="text-sm font-medium">{p.trigger}</p>
                  <p className="text-muted-foreground">
                    {p.surface} · {p.cadence} · {p.mode}
                    {p.approvalRequired ? " · approval required" : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Knowledge sources</p>
            <ul className="space-y-2">
              {spec.knowledgeSources.map((k, i) => (
                <li key={i} className="rounded-md border border-border p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{k.label}</p>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">{k.scope}</Badge>
                      <Badge variant={k.sensitivity === "critical" || k.sensitivity === "high" ? "destructive" : "secondary"} className="text-xs">
                        {k.sensitivity}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-1">{k.extracts}</p>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 18 + 19 + 20 */}
      <Card>
        <CardHeader>
          <SectionHeader icon={FileSearch} title="Analytics, oversight & testing" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Analytics events</p>
            <PillList items={spec.analyticsEvents} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Admin oversight surfaces</p>
            <PillList items={spec.adminOversightSurfaces} />
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Testing matrix</p>
            <ul className="space-y-2">
              {spec.testingMatrix.map((t, i) => (
                <li key={i} className="rounded-md border border-border p-2">
                  <Badge variant="outline" className="mb-1 text-xs uppercase">{t.category}</Badge>
                  <BulletList items={t.scenarios} />
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 21 + 22 + 23 */}
      <Card>
        <CardHeader>
          <SectionHeader icon={Crown} title="Deployment readiness, roadmap & wow" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Definition of Done</p>
            <BulletList items={spec.definitionOfDone} />
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["phase1", "phase2", "phase3"] as const).map((p, idx) => {
              const r = spec.roadmap[p];
              return (
                <div key={p} className="rounded-md border border-border p-2">
                  <Badge variant="outline" className="mb-1">Phase {idx + 1}</Badge>
                  <p className="text-sm font-medium mb-1">{r.title}</p>
                  <BulletList items={r.outcomes} />
                </div>
              );
            })}
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Wow differentiators</p>
            <BulletList items={spec.wowDifferentiators} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export interface AdvisorSpecEmptyStateProps {
  advisorName: string;
}

export function AdvisorSpecEmptyState({ advisorName }: AdvisorSpecEmptyStateProps) {
  return (
    <Card data-testid="advisor-spec-empty">
      <CardHeader>
        <CardTitle className="text-base">Build spec not yet authored</CardTitle>
        <CardDescription>
          The full 23-section build specification for {advisorName} has not been registered yet.
          Specs are authored phase-by-phase against the canonical contract — see{" "}
          <code className="text-xs">src/lib/ai-platform/specs/spec-types.ts</code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This is intentional empty-state honesty: nothing is fabricated until the spec is real.
        </p>
      </CardContent>
    </Card>
  );
}