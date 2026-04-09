import { motion } from "framer-motion";
import { Layers, ArrowRight, Zap, DollarSign, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRoutingPolicies } from "@/hooks/use-sag-data";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";



const DEMO_EXAMPLE_STAGES = [
  { pattern: 'Classify → Synthesize → Resolve', stages: [
    { label: 'Utility Classifier', model: 'gemini-2.5-flash-lite', cost: '0.1¢', purpose: 'Cheap task classification' },
    { label: 'Standard Synthesis', model: 'gemini-3-flash', cost: '2¢', purpose: 'Mid-tier content synthesis' },
    { label: 'Premium Resolver', model: 'gemini-2.5-pro', cost: '25¢', purpose: 'Only if ambiguity remains' },
  ]},
  { pattern: 'Retrieve → Differential → Deep', stages: [
    { label: 'Cache/Reuse Check', model: 'deterministic', cost: '0¢', purpose: 'Check intelligence library' },
    { label: 'Differential Reasoning', model: 'gemini-2.5-flash', cost: '1¢', purpose: 'Reason about what changed' },
    { label: 'Deep Reasoning', model: 'gpt-5', cost: '50¢', purpose: 'Only if invalidated' },
  ]},
  { pattern: 'Extract → Ground → Explain', stages: [
    { label: 'Utility Extraction', model: 'flash-lite', cost: '0.1¢', purpose: 'Structured data extraction' },
    { label: 'Deterministic Grounding', model: 'code', cost: '0¢', purpose: 'Validate against state' },
    { label: 'Standard Explanation', model: 'gemini-3-flash', cost: '3¢', purpose: 'User-facing explanation' },
  ]},
  { pattern: 'Draft → Verify → Escalate', stages: [
    { label: 'Draft Model', model: 'gpt-5-nano', cost: '0.5¢', purpose: 'Fast initial draft' },
    { label: 'Verifier Model', model: 'gemini-2.5-flash', cost: '1¢', purpose: 'Quality validation' },
    { label: 'Premium Escalation', model: 'claude-sonnet-4', cost: '30¢', purpose: 'Only when needed' },
  ]},
];

const SAGMultiStageExplorer = () => {
  const { isDemoMode } = useDataMode();
  const { data: policies = [] } = useRoutingPolicies();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="h-6 w-6 text-primary" /> SAG08 — Multi-Stage Route Explorer</h1>
        <p className="text-muted-foreground mt-1">Inspect staged inference paths — premium only where justified</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{DEMO_EXAMPLE_STAGES.length}</p><p className="text-xs text-muted-foreground">Stage Patterns</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{policies.filter((p: Record<string, any>) => p.fallback_chain?.length > 0).length}</p><p className="text-xs text-muted-foreground">Policies with Fallback Chains</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{policies.filter((p: Record<string, any>) => p.reuse_eligible).length}</p><p className="text-xs text-muted-foreground">Reuse-Eligible Policies</p></CardContent></Card>
      </div>

      <div className="space-y-4">
        {DEMO_EXAMPLE_STAGES.map((pattern, pi) => (
          <Card key={pi}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{pattern.pattern}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {pattern.stages.map((stage, si) => (
                  <div key={si} className="flex items-center gap-2">
                    <div className={`p-3 rounded-lg border flex-1 min-w-[160px] ${si === pattern.stages.length - 1 ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{stage.label}</span>
                        <Badge variant="outline" className="text-[10px]">{stage.cost}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">{stage.model}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{stage.purpose}</p>
                    </div>
                    {si < pattern.stages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span><DollarSign className="h-3 w-3 inline" /> Total if stage 1 resolves: {pattern.stages[0].cost}</span>
                <span><DollarSign className="h-3 w-3 inline" /> Total if escalated: {pattern.stages.reduce((s, st) => s + parseFloat(st.cost), 0).toFixed(1)}¢</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SAGMultiStageExplorer;
