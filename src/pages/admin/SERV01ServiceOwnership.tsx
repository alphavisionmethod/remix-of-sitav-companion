import { SERVICE_OWNERSHIP_REGISTRY, getHighRiskDomains, getClassificationSummary, ANTI_SPRAWL_RULES, SERVICE_DIRECTORY_CLASSIFICATION } from "@/lib/core-services/service-registry/service-ownership-registry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Server, AlertTriangle, ShieldCheck, Package, Shield, BarChart3 } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

const critColors: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive",
  high: "bg-amber-500/15 text-amber-400",
  medium: "bg-blue-500/15 text-blue-400",
  low: "bg-muted text-muted-foreground",
};

const riskColors: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-destructive",
};

const classColors: Record<string, string> = {
  canonical: "bg-emerald-500/15 text-emerald-400",
  supporting: "bg-blue-500/15 text-blue-400",
  speculative: "bg-amber-500/15 text-amber-400",
  "re-export": "bg-muted text-muted-foreground",
  "deprecated-candidate": "bg-destructive/15 text-destructive",
};

export default function SERV01ServiceOwnership() {
  const { isDemoMode } = useDataMode();
  const highRisk = getHighRiskDomains();
  const summary = getClassificationSummary();
  const budgetPct = Math.round((summary.total / summary.budget) * 100);
  const overBudget = summary.total > summary.budget;

  return (
    <div className="space-y-6" data-testid="serv01-board">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SERV01 — Domain Service Ownership</h1>
        <p className="text-muted-foreground">12 major domains: primary services, routes, criticality, duplicate risk, shadow-service risk.</p>
      </div>

      {/* Budget / Sprawl Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" data-testid="serv01-budget-summary">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Server className="h-5 w-5 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-foreground">{SERVICE_OWNERSHIP_REGISTRY.length}</p>
            <p className="text-xs text-muted-foreground">Domains</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-amber-400" />
            <p className="text-2xl font-bold text-foreground">{highRisk.length}</p>
            <p className="text-xs text-muted-foreground">High-Risk Domains</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <ShieldCheck className="h-5 w-5 mx-auto mb-2 text-emerald-400" />
            <p className="text-2xl font-bold text-foreground">
              {SERVICE_OWNERSHIP_REGISTRY.filter((d) => d.flagshipLoop).length}
            </p>
            <p className="text-xs text-muted-foreground">Flagship-Linked</p>
          </CardContent>
        </Card>
        <Card className={`bg-card border-border ${overBudget ? "border-destructive/50" : ""}`}>
          <CardContent className="p-4 text-center">
            <Package className="h-5 w-5 mx-auto mb-2 text-amber-400" />
            <p className={`text-2xl font-bold ${overBudget ? "text-destructive" : "text-foreground"}`}>
              {summary.total}/{summary.budget}
            </p>
            <p className="text-xs text-muted-foreground">Directory Budget</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-foreground">{summary.canonical}</p>
            <p className="text-xs text-muted-foreground">Canonical Services</p>
          </CardContent>
        </Card>
      </div>

      {/* Directory Classification Breakdown */}
      <Card className="bg-card border-border" data-testid="serv01-classification">
        <CardHeader><CardTitle className="text-foreground text-sm">Directory Classification ({summary.total} classified)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20">Budget</span>
            <Progress value={Math.min(budgetPct, 100)} className="h-2 flex-1" />
            <span className={`text-xs font-mono ${overBudget ? "text-destructive" : "text-muted-foreground"}`}>{budgetPct}%</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(["canonical", "supporting", "re-export", "speculative", "deprecated-candidate"] as const).map((cls) => (
              <div key={cls} className="text-center p-2 rounded-lg bg-muted/30">
                <div className="text-lg font-bold text-foreground">{summary[cls === "deprecated-candidate" ? "deprecated-candidate" : cls]}</div>
                <Badge className={`${classColors[cls]} text-xs`}>{cls}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anti-Sprawl Governance Rules */}
      <Card className="bg-card border-border" data-testid="serv01-governance-rules">
        <CardHeader>
          <CardTitle className="text-foreground text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Anti-Sprawl Governance Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ANTI_SPRAWL_RULES.map((rule) => (
            <div key={rule.ruleKey} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <Badge className={critColors[rule.severity]} variant="outline">{rule.severity}</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{rule.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
              </div>
              <Badge variant={rule.enforcementStatus === "enforced" ? "default" : "outline"} className="text-xs shrink-0">
                {rule.enforcementStatus}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Domain Registry Table */}
      <Card className="bg-card border-border" data-testid="serv01-domain-registry">
        <CardHeader><CardTitle className="text-foreground">Domain Registry</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Primary Service</TableHead>
                <TableHead>Routes</TableHead>
                <TableHead>Criticality</TableHead>
                <TableHead>Dup Risk</TableHead>
                <TableHead>Shadow Risk</TableHead>
                <TableHead>Flagship</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SERVICE_OWNERSHIP_REGISTRY.map((d) => (
                <TableRow key={d.domain}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.displayName}</p>
                      <p className="text-xs text-muted-foreground">{d.domain}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.primaryService}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.routes.length}</TableCell>
                  <TableCell>
                    <Badge className={critColors[d.launchCriticality]}>{d.launchCriticality}</Badge>
                  </TableCell>
                  <TableCell className={`text-sm font-medium ${riskColors[d.duplicateRisk]}`}>
                    {d.duplicateRisk}
                  </TableCell>
                  <TableCell className={`text-sm font-medium ${riskColors[d.shadowServiceRisk]}`}>
                    {d.shadowServiceRisk}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {d.flagshipLoop || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {highRisk.length > 0 && (
        <Card className="bg-card border-border border-amber-500/30" data-testid="serv01-high-risk">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> High-Risk Domains — Consolidation Targets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highRisk.map((d) => (
              <div key={d.domain} className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm font-medium text-foreground">{d.displayName}</p>
                <p className="text-xs text-muted-foreground mt-1">{d.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
