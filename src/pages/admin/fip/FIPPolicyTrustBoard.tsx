import FIPSubNav from "@/platform/admin/components/admin/FIPSubNav";
import { motion } from "framer-motion";
import { Shield, Lock, AlertTriangle, CheckCircle2, Eye, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFeatureIntakes, useComplianceRecords } from "@/modules/business/hooks/use-fip-data";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const FIPPolicyTrustBoard = () => {
  const { data: intakes = [] } = useFeatureIntakes();
  const { data: compliance = [] } = useComplianceRecords();

  const trustBearing = intakes.filter((i: Record<string, any>) => i.trust_bearing);
  const policyDefined = compliance.filter((c: Record<string, any>) => c.policy_defined).length;
  const policyMissing = compliance.filter((c: Record<string, any>) => !c.policy_defined).length;

  const riskMatrix = [
    { tier: 'standard', count: intakes.filter((i: Record<string, any>) => i.risk_tier === 'standard').length, color: 'text-green-500' },
    { tier: 'elevated', count: intakes.filter((i: Record<string, any>) => i.risk_tier === 'elevated').length, color: 'text-yellow-500' },
    { tier: 'critical', count: intakes.filter((i: Record<string, any>) => i.risk_tier === 'critical').length, color: 'text-destructive' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /> FIP07 — Policy / Approval / Trust Board</h1>
        <p className="text-muted-foreground mt-1">Inspect governance semantics, risk tiers, and approval requirements</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{trustBearing.length}</p><p className="text-xs text-muted-foreground">Trust-Bearing Features</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-green-500">{policyDefined}</p><p className="text-xs text-muted-foreground">Policy Defined</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-destructive">{policyMissing}</p><p className="text-xs text-muted-foreground">Policy Missing</p></CardContent></Card>
        <Card><CardContent className="pt-4 flex gap-3">{riskMatrix.map(r => <div key={r.tier} className="text-center"><p className={`text-lg font-bold ${r.color}`}>{r.count}</p><p className="text-[10px] text-muted-foreground">{r.tier}</p></div>)}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Governance Matrix</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><Eye className="h-4 w-4" /> Approval Requirements</h3>
              {['none', 'single', 'dual', 'owner-only'].map(type => {
                const count = intakes.filter((i: Record<string, unknown>) => (i.metadata && typeof i.metadata === "object" && !Array.isArray(i.metadata) ? (i.metadata as Record<string, unknown>).approval_type : undefined) === type).length;
                return <div key={type} className="flex justify-between text-sm py-1"><span>{type}</span><Badge variant="outline">{count}</Badge></div>;
              })}
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><Shield className="h-4 w-4" /> Autonomy Tiers</h3>
              {['observe', 'diagnose', 'recommend', 'draft', 'simulate', 'approval_ready', 'constrained_action_ready'].map(tier => {
                const count = intakes.filter((i: Record<string, unknown>) => i.autonomy_tier === tier).length;
                return <div key={tier} className="flex justify-between text-sm py-1"><span className="truncate">{tier.replace(/_/g, ' ')}</span><Badge variant="outline">{count}</Badge></div>;
              })}
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Trust Risks</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Hidden policy bypass</span><Badge variant="outline">0 detected</Badge></div>
                <div className="flex justify-between"><span>Invisible autonomy escalation</span><Badge variant="outline">0 detected</Badge></div>
                <div className="flex justify-between"><span>Ungoverned trust workflow</span><Badge variant="outline">{policyMissing} at risk</Badge></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold">Trust-Bearing Features</h2>
        {trustBearing.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No trust-bearing features identified yet</CardContent></Card> :
          trustBearing.map((f: Record<string, any>) => (
            <Card key={f.id} className="border-destructive/30">
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-destructive" /><span className="font-medium">{f.feature_name}</span></div>
                <div className="flex gap-2">
                  <Badge variant="destructive" className="text-xs">{f.risk_tier}</Badge>
                  <Badge variant="outline" className="text-xs">{f.autonomy_tier}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default FIPPolicyTrustBoard;
