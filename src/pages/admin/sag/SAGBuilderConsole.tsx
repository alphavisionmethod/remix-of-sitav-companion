import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, ArrowRight, CheckCircle2, Layers, FileText, Shield, Zap, MessageSquare, Database, Code2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useModelRegistry, usePromptFamilies, useRoutingPolicies, useTaskRequests } from "@/hooks/use-sag-data";
import { TASK_CLASSES, MODEL_CLASSES } from "@/lib/sovereign-ai-gateway/types";
import SAGSubNav from "@/components/admin/SAGSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const DEMO_BUILDER_STEPS: any[] = [];

const SAGBuilderConsole = () => {
  const { data: models = [] } = useModelRegistry();
  const { data: prompts = [] } = usePromptFamilies();
  const { data: policies = [] } = useRoutingPolicies();
  const { data: tasks = [] } = useTaskRequests();
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
<SAGSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Cpu className="h-6 w-6 text-primary" /> SAG11 — AI Builder Console</h1>
        <p className="text-muted-foreground mt-1">Structured methodology for integrating AI features correctly</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{models.length}</p><p className="text-xs text-muted-foreground">Registered Models</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{prompts.length}</p><p className="text-xs text-muted-foreground">Prompt Families</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{policies.length}</p><p className="text-xs text-muted-foreground">Routing Policies</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{tasks.length}</p><p className="text-xs text-muted-foreground">Total Tasks</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">AI Feature Builder Workflow</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-1">
            {([] as any[]).map(s => (
              <button key={s.step} onClick={() => setActiveStep(s.step)}
                className={`flex-1 p-3 rounded-lg border text-center transition-colors ${activeStep === s.step ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                <s.icon className={`h-4 w-4 mx-auto mb-1 ${activeStep === s.step ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-[10px] font-medium">{s.label}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-sm mb-1">Step {activeStep}: {DEMO_BUILDER_STEPS[activeStep - 1].label}</h3>
            <p className="text-sm text-muted-foreground">{DEMO_BUILDER_STEPS[activeStep - 1].desc}</p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" disabled={activeStep === 1} onClick={() => setActiveStep(p => p - 1)}>Previous</Button>
              <Button size="sm" disabled={activeStep === 10} onClick={() => setActiveStep(p => p + 1)}>Next <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Available Task Classes</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {TASK_CLASSES.map(tc => <Badge key={tc} variant="outline" className="text-xs">{tc}</Badge>)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Model Classes</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {MODEL_CLASSES.map(mc => <Badge key={mc} variant="outline" className="text-xs">{mc}</Badge>)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-yellow-500/30">
        <CardHeader><CardTitle className="text-base text-yellow-500">⚠ Sovereign Gateway Rules</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1 text-muted-foreground">
          <p>• No direct provider SDK usage from feature/page/domain code</p>
          <p>• All AI usage must go through the Sovereign AI Gateway</p>
          <p>• All requests must reference: feature ID, capability ID, prompt family ID, output schema</p>
          <p>• All structured outputs must be schema-validated</p>
          <p>• Premium models governed by budget and escalation logic</p>
          <p>• Critical capabilities must have fallback chains</p>
          <p>• Inference traces and receipts mandatory for meaningful AI actions</p>
          <p>• Reuse/caching/differential reasoning before premium inference</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SAGBuilderConsole;
