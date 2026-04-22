import FIPSubNav from "@/components/admin/FIPSubNav";
import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, ArrowRight, CheckCircle2, Layers, FileText, Shield, Zap, Rocket, Database, Code2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFeatureIntakes, useCapabilities, useFeatureSpecs, useComplianceRecords, useRolloutRecords } from "@/hooks/use-fip-data";
import { READINESS_STAGES } from "@/lib/fip/types";
import { DEMO_ADMIN_BUILDER_STEPS as DEMO_BUILDER_STEPS, DEMO_DOMAIN_PACKS } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const FIPBuilderConsole = () => {
  const { isDemoMode } = useDataMode();
  const { data: intakes = [] } = useFeatureIntakes();
  const { data: caps = [] } = useCapabilities();
  const { data: specs = [] } = useFeatureSpecs();
  const { data: compliance = [] } = useComplianceRecords();
  const { data: rollouts = [] } = useRolloutRecords();
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Cpu className="h-6 w-6 text-primary" /> FIP14 — AI Engineer Builder Console</h1>
        <p className="text-muted-foreground mt-1">Structured methodology interface for AI engineering teams</p>
      </motion.div>

      <div className="grid grid-cols-5 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{intakes.length}</p><p className="text-xs text-muted-foreground">Intakes</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{caps.length}</p><p className="text-xs text-muted-foreground">Capabilities</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{specs.length}</p><p className="text-xs text-muted-foreground">Specs</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{compliance.length}</p><p className="text-xs text-muted-foreground">Compliance</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{rollouts.length}</p><p className="text-xs text-muted-foreground">Rollouts</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Builder Workflow — Feature Methodology Steps</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-1">
            {(isDemoMode ? DEMO_BUILDER_STEPS : [] as typeof DEMO_BUILDER_STEPS).map((s, i) => (
              <button key={s.step} onClick={() => setActiveStep(s.step)}
                className={`flex-1 p-3 rounded-lg border text-center transition-colors ${activeStep === s.step ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                <s.icon className={`h-4 w-4 mx-auto mb-1 ${activeStep === s.step ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-[10px] font-medium">{s.label}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-sm mb-1">Step {activeStep}: {DEMO_BUILDER_STEPS[activeStep - 1].label}</h3>
            <p className="text-sm text-muted-foreground">{DEMO_BUILDER_STEPS[activeStep - 1].description}</p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" disabled={activeStep === 1} onClick={() => setActiveStep(p => p - 1)}>Previous</Button>
              <Button size="sm" disabled={activeStep === 10} onClick={() => setActiveStep(p => p + 1)}>Next Step <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Domain Methodology Packs</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {(isDemoMode ? DEMO_DOMAIN_PACKS : [] as typeof DEMO_DOMAIN_PACKS).map(pack => (
              <div key={pack.id} className="p-3 border rounded-lg hover:border-primary/30 transition-colors cursor-pointer">
                <Badge className={`text-xs mb-2 ${pack.color}`}>{pack.name}</Badge>
                <div className="space-y-1">
                  {pack.features.map(f => <p key={f} className="text-xs text-muted-foreground">• {f}</p>)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-500/30">
        <CardHeader><CardTitle className="text-base text-yellow-500">⚠ Prohibited Shortcuts</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1 text-muted-foreground">
          <p>• No feature without owner declaration</p>
          <p>• No boundary-crossing feature without canonical contracts</p>
          <p>• No trust-bearing feature without policy/approval/refusal semantics</p>
          <p>• No side-effecting feature without execution path and receipts</p>
          <p>• No launch claim without passing readiness gates</p>
          <p>• No architecture drift in the name of speed</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FIPBuilderConsole;
