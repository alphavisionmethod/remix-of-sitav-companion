// ═══════════════════════════════════════════════════════════════
// SITA OS — SRE04: Code Standards & Test Generation Engine
// Standards enforcement + auto-generated test proposals
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BookCheck, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Wrench,
  TestTube, FileCode, Layers, Zap, Lock, Cpu, Eye, RotateCcw
} from "lucide-react";
import { getCodeStandardRules, getTestProposals, type CodeStandardRule, type TestProposal } from "@/lib/services/engineering-governance";

const CAT_ICON: Record<string, React.ElementType> = {
  style: FileCode, correctness: CheckCircle2, concurrency: Layers, memory: Cpu,
  api_contract: Zap, architecture: Layers, performance: Zap, observability: Eye,
  error_handling: AlertTriangle, rollback: RotateCcw, test_coverage: TestTube, security: Lock,
};

const SEV_COLORS: Record<string, string> = {
  blocker: "text-destructive", error: "text-orange-400", warning: "text-amber-400",
};

const TEST_TYPE_COLORS: Record<string, string> = {
  unit: "bg-blue-500/20 text-blue-300", integration: "bg-purple-500/20 text-purple-300",
  contract: "bg-cyan-500/20 text-cyan-300", load: "bg-amber-500/20 text-amber-300",
  stress: "bg-red-500/20 text-red-300", chaos: "bg-pink-500/20 text-pink-300",
  regression: "bg-orange-500/20 text-orange-300", performance: "bg-emerald-500/20 text-emerald-300",
  rollback: "bg-teal-500/20 text-teal-300", rollout_guard: "bg-indigo-500/20 text-indigo-300",
};

export default function SRE04CodeStandardsTestGen() {
  const [rules] = useState<CodeStandardRule[]>(getCodeStandardRules);
  const [tests] = useState<TestProposal[]>(getTestProposals);

  const totalViolations = rules.reduce((s, r) => s + r.violations_count, 0);
  const blockerViolations = rules.filter(r => r.severity === "blocker" && r.violations_count > 0).length;
  const passingTests = tests.filter(t => t.status === "passing").length;
  const failingTests = tests.filter(t => t.status === "failing").length;

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={BookCheck}
        title="Code Standards & Test Generation"
        subtitle="Every change must pass standards — AI generates tests automatically for all significant changes"
        accent="primary"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Rules Enforced", value: rules.filter(r => r.enforced).length, icon: ShieldCheck, color: "text-trust-safe" },
          { label: "Total Violations", value: totalViolations, icon: AlertTriangle, color: totalViolations > 0 ? "text-amber-400" : "text-trust-safe" },
          { label: "Tests Generated", value: tests.length, icon: TestTube, color: "text-primary" },
          { label: "Tests Passing", value: `${passingTests}/${tests.length}`, icon: CheckCircle2, color: failingTests > 0 ? "text-amber-400" : "text-trust-safe" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="standards">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="standards" className="text-xs gap-1.5"><BookCheck className="h-3 w-3" />Code Standards ({rules.length})</TabsTrigger>
          <TabsTrigger value="tests" className="text-xs gap-1.5"><TestTube className="h-3 w-3" />Test Generation ({tests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="standards" className="mt-4 space-y-2">
          {rules.map((rule, i) => {
            const RIcon = CAT_ICON[rule.category] || FileCode;
            return (
              <motion.div key={rule.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={`border-border/50 bg-card/80 ${rule.violations_count > 0 && rule.severity === "blocker" ? "border-destructive/30" : ""}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/40 shrink-0">
                        <RIcon className={`h-4 w-4 ${SEV_COLORS[rule.severity] || "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{rule.rule}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px] h-4">{rule.category.replace(/_/g, " ")}</Badge>
                          <Badge variant={rule.severity === "blocker" ? "destructive" : rule.severity === "error" ? "secondary" : "outline"} className="text-[10px] h-4">{rule.severity}</Badge>
                          {rule.violations_count > 0 ? (
                            <Badge variant="destructive" className="text-[10px] h-4">{rule.violations_count} violations</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] h-4 text-trust-safe border-trust-verified/30">Clean</Badge>
                          )}
                          {rule.auto_fix_available && <Badge variant="outline" className="text-[10px] h-4 gap-0.5"><Wrench className="h-2.5 w-2.5" />Auto-fix</Badge>}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {rule.enforced ? (
                          <ShieldCheck className="h-4 w-4 text-trust-safe" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="tests" className="mt-4 space-y-4">
          {/* Policy rules */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3 space-y-1">
              <p className="text-xs font-semibold text-foreground">Test Generation Policies</p>
              {["New critical path → required tests", "Bug fix → must add regression test", "New API → must add contract tests", "New automation → must add safety tests"].map((p, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-trust-safe" />{p}</p>
              ))}
            </CardContent>
          </Card>

          {/* Test proposals grouped by change */}
          {Array.from(new Set(tests.map(t => t.change_id))).map(changeId => {
            const changeTests = tests.filter(t => t.change_id === changeId);
            return (
              <Card key={changeId} className="border-border/50 bg-card/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{changeId} — {changeTests.length} tests generated</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {changeTests.map(test => (
                    <div key={test.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-border/30">
                      <TestTube className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">{test.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-[10px] h-4 border-0 ${TEST_TYPE_COLORS[test.test_type] || ""}`}>{test.test_type.replace("_", " ")}</Badge>
                          {test.status === "passing" ? (
                            <CheckCircle2 className="h-3 w-3 text-trust-safe" />
                          ) : test.status === "failing" ? (
                            <XCircle className="h-3 w-3 text-destructive" />
                          ) : null}
                          <span className="text-[10px] text-muted-foreground">+{test.coverage_impact}% coverage</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
