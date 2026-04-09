import {
  Globe, Shield, Lock, Eye, CheckCircle, XCircle,
  AlertTriangle, Activity, Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const DEMO_PATTERNS = [
  { id: "ct-1", label: "API timeout cascade after deploy", type: "issue_fingerprint", domain: "engineering", confidence: 94, tenants: 18, anonymization: "k_anonymity", approved: true, restrictions: ["confidence_gated"], privacyGates: ["no_pii", "min_source_count", "min_confidence"] },
  { id: "ct-2", label: "Lead cold after 48hr no follow-up", type: "workflow_pattern", domain: "revenue-business", confidence: 88, tenants: 31, anonymization: "aggregation", approved: true, restrictions: ["confidence_gated"], privacyGates: ["no_pii", "min_source_count"] },
  { id: "ct-3", label: "Migration timeout on large tables", type: "deployment_pattern", domain: "engineering", confidence: 91, tenants: 12, anonymization: "k_anonymity", approved: true, restrictions: ["enterprise_opt_out"], privacyGates: ["no_pii", "min_source_count", "min_confidence", "low_false_positive"] },
  { id: "ct-4", label: "Cache flush resolves 80% of 5xx", type: "self_heal_pattern", domain: "engineering", confidence: 96, tenants: 45, anonymization: "aggregation", approved: true, restrictions: [], privacyGates: ["no_pii", "min_source_count", "min_confidence", "low_false_positive"] },
  { id: "ct-5", label: "Mobile CTA below fold drop", type: "conversion_pattern", domain: "digital-presence", confidence: 74, tenants: 8, anonymization: "k_anonymity", approved: false, restrictions: ["confidence_gated", "low_source_count"], privacyGates: ["no_pii"] },
  { id: "ct-6", label: "Dark mode contrast failures", type: "design_pattern", domain: "digital-presence", confidence: 78, tenants: 5, anonymization: "aggregation", approved: false, restrictions: ["low_source_count"], privacyGates: ["no_pii"] },
  { id: "ct-7", label: "Env var drift staging/prod", type: "config_drift", domain: "engineering", confidence: 85, tenants: 0, anonymization: "redaction", approved: false, restrictions: ["tenant_private", "enterprise_opt_out"], privacyGates: [] },
];

const DEMO_RESTRICTED_DOMAINS = ["investment-finance", "concierge-household"];
const DEMO_ENTERPRISE_EXCLUSIONS = ["Acme Corp (custom policy)", "FinanceHQ (regulatory)"];

const CrossTenantGovernance = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;

  const approved = DEMO_PATTERNS.filter(p => p.approved).length;
  const pending = DEMO_PATTERNS.filter(p => !p.approved && p.tenants > 0).length;
  const blocked = DEMO_PATTERNS.filter(p => p.tenants === 0).length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <SitaPageHeader
        icon={<Globe className="h-6 w-6" />}
        title="Cross-Tenant Intelligence Governance"
        subtitle="Govern generalized learning safely — privacy controls, restrictions, and approvals"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Patterns", value: String(DEMO_PATTERNS.length) },
          { label: "Approved", value: String(approved), color: "text-emerald-400" },
          { label: "Pending Review", value: String(pending), color: "text-amber-400" },
          { label: "Blocked (Private)", value: String(blocked), color: "text-rose-400" },
        ].map(m => (
          <Card key={m.label} className="bg-card/80 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${m.color || "text-foreground"}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generalization Approval Table */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Generalization Approval Table</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Pattern</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Domain</TableHead>
                <TableHead className="text-xs text-right">Confidence</TableHead>
                <TableHead className="text-xs text-right">Tenants</TableHead>
                <TableHead className="text-xs">Anonymization</TableHead>
                <TableHead className="text-xs text-center">Approved</TableHead>
                <TableHead className="text-xs">Restrictions</TableHead>
                <TableHead className="text-xs">Privacy Gates</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_PATTERNS.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs font-medium text-foreground max-w-[200px] truncate">{p.label}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px]">{p.type.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.domain}</TableCell>
                  <TableCell className="text-xs text-right"><span className={p.confidence >= 85 ? "text-emerald-400" : "text-foreground"}>{p.confidence}%</span></TableCell>
                  <TableCell className="text-xs text-right font-mono">{p.tenants}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px]">{p.anonymization.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell className="text-center">{p.approved ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mx-auto" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground mx-auto" />}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">{p.restrictions.map(r => <Badge key={r} variant="outline" className="text-[8px]">{r.replace(/_/g, " ")}</Badge>)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">{p.privacyGates.map(g => <Badge key={g} variant="secondary" className="text-[8px]">{g.replace(/_/g, " ")}</Badge>)}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Privacy Control Panel */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4 text-rose-400" /> Privacy Controls</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-secondary/20 space-y-2">
              <p className="text-xs font-medium text-foreground">Restricted Domains</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_RESTRICTED_DOMAINS.map(d => <Badge key={d} variant="destructive" className="text-[9px]">{d}</Badge>)}
              </div>
              <p className="text-[10px] text-muted-foreground">These domains never participate in cross-tenant generalization</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/20 space-y-2">
              <p className="text-xs font-medium text-foreground">Enterprise Exclusions</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_ENTERPRISE_EXCLUSIONS.map(e => <Badge key={e} variant="outline" className="text-[9px]">{e}</Badge>)}
              </div>
              <p className="text-[10px] text-muted-foreground">Opted out of cross-tenant learning by policy</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/20 space-y-2">
              <p className="text-xs font-medium text-foreground">Global Privacy Rules</p>
              <ul className="space-y-1 text-[10px] text-muted-foreground">
                <li>• No direct tenant data in generalized patterns</li>
                <li>• Minimum 3 source tenants for generalization</li>
                <li>• Minimum 70% confidence threshold</li>
                <li>• Maximum 15% false positive rate</li>
                <li>• Enterprise opt-out always honored</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Pattern Eligibility */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4 text-blue-400" /> Pattern Eligibility Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {DEMO_PATTERNS.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{p.label}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge variant="outline" className="text-[8px]">{p.domain}</Badge>
                    <span className="text-[9px] text-muted-foreground">{p.tenants} tenants</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {p.approved ? (
                    <Badge variant="secondary" className="text-[9px] text-emerald-400">approved</Badge>
                  ) : p.tenants > 0 ? (
                    <Badge variant="outline" className="text-[9px] text-amber-400">pending</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[9px]">blocked</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrossTenantGovernance;
