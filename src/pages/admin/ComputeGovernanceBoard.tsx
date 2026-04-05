import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Cpu, BarChart3, AlertTriangle, TrendingUp, DollarSign, RefreshCw, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const MODEL_ROUTES = [
  { model: "gpt-4o", provider: "OpenAI", usage: 4200, cost: 84, confidence: 0.92, fallback: "gpt-4o-mini", status: "active" as const },
  { model: "claude-3.5-sonnet", provider: "Anthropic", usage: 2800, cost: 56, confidence: 0.94, fallback: "claude-3-haiku", status: "active" as const },
  { model: "gemini-2.0-flash", provider: "Google", usage: 1500, cost: 15, confidence: 0.88, fallback: null, status: "active" as const },
  { model: "gpt-4o-mini", provider: "OpenAI", usage: 8400, cost: 42, confidence: 0.85, fallback: null, status: "active" as const },
];

const ADVISOR_SPEND = [
  { advisor: "Financial Advisor", tokens: 120000, cost: 48, sessions: 45 },
  { advisor: "Business Advisor", tokens: 95000, cost: 38, sessions: 32 },
  { advisor: "Concierge", tokens: 80000, cost: 32, sessions: 28 },
  { advisor: "Tech Advisor", tokens: 60000, cost: 24, sessions: 20 },
];

const ANOMALIES = [
  { id: "an-1", description: "Token spend spike on Financial Advisor +340% vs baseline", severity: "high", detected: "2h ago" },
  { id: "an-2", description: "Claude-3.5 latency drift — p99 up 180ms from baseline", severity: "medium", detected: "4h ago" },
];

const ComputeGovernanceBoard = () => {
  const [tab, setTab] = useState("routing");

  const { data: tokenUsage } = useQuery({
    queryKey: ["compute-token-usage"],
    queryFn: async () => {
      const { data } = await supabase.from("ai_token_usage").select("*").order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const totalCost = MODEL_ROUTES.reduce((s, r) => s + r.cost, 0);
  const totalTokens = MODEL_ROUTES.reduce((s, r) => s + r.usage, 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" /> Compute Governance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI model routing, spend control, and compute anomaly detection</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Spend", value: `$${totalCost}`, icon: DollarSign, color: "text-primary" },
            { label: "Total Tokens", value: `${(totalTokens / 1000).toFixed(1)}k`, icon: Zap, color: "text-blue-500" },
            { label: "Active Models", value: String(MODEL_ROUTES.length), icon: Cpu, color: "text-emerald-500" },
            { label: "Anomalies", value: String(ANOMALIES.length), icon: AlertTriangle, color: ANOMALIES.length > 0 ? "text-amber-500" : "text-emerald-500" },
          ].map(m => (
            <Card key={m.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-2 mb-1"><m.icon className={`h-4 w-4 ${m.color}`} /><span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{m.label}</span></div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="routing">Model Routing</TabsTrigger>
            <TabsTrigger value="spend">Advisor Spend</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          </TabsList>

          <TabsContent value="routing" className="mt-4 space-y-2">
            {MODEL_ROUTES.map(r => (
              <motion.div key={r.model} variants={fadeUp}>
                <Card className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground font-mono">{r.model}</span>
                        <Badge variant="outline" className="text-[9px]">{r.provider}</Badge>
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{r.status}</Badge>
                      </div>
                      <span className="text-sm font-bold text-foreground">${r.cost}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>Calls: <span className="text-foreground">{r.usage.toLocaleString()}</span></span>
                      <span>Confidence: <span className={r.confidence > 0.9 ? "text-emerald-500" : "text-amber-500"}>{(r.confidence * 100).toFixed(0)}%</span></span>
                      {r.fallback && <span>Fallback: <span className="text-foreground font-mono">{r.fallback}</span></span>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="spend" className="mt-4 space-y-2">
            {ADVISOR_SPEND.map(a => (
              <motion.div key={a.advisor} variants={fadeUp}>
                <Card className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.advisor}</p>
                      <p className="text-[10px] text-muted-foreground">{a.sessions} sessions · {(a.tokens / 1000).toFixed(0)}k tokens</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">${a.cost}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="anomalies" className="mt-4 space-y-2">
            {ANOMALIES.map(a => (
              <motion.div key={a.id} variants={fadeUp}>
                <Card className={a.severity === "high" ? "border-red-500/30" : ""}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 ${a.severity === "high" ? "text-red-500" : "text-amber-500"}`} />
                    <div>
                      <p className="text-sm text-foreground">{a.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Detected {a.detected}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {ANOMALIES.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No anomalies detected</p>}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ComputeGovernanceBoard;
