import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIGovernance } from "@/platform/governance/hooks/useAIGovernance";
import { Brain, DollarSign, Shield, ScrollText } from "lucide-react";

export default function AIGovernancePage() {
  const governance = useAIGovernance();
  const auditLog = governance.getAuditLog(50);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Governance</h1>
        <p className="text-muted-foreground">Prompt safety, model routing, budget tracking, tool policies, and audit log</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4" /> Prompt Safety</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-500">Active</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Action Gating</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-500">Enforced</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4" /> Budget Gate</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-500">Online</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ScrollText className="h-4 w-4" /> Audit Entries</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{auditLog.length}</p></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="safety">
        <TabsList>
          <TabsTrigger value="safety">Prompt Safety</TabsTrigger>
          <TabsTrigger value="routing">Model Routing</TabsTrigger>
          <TabsTrigger value="budget">Budget Tracker</TabsTrigger>
          <TabsTrigger value="tools">Tool Policies</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="safety">
          <Card>
            <CardHeader><CardTitle>Prompt Safety Evaluation</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Evaluate prompts against trust boundaries. Detect sensitive field references, 
                missing guardrails, and unredacted sensitive variables. Risk scoring from 0–1.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing">
          <Card>
            <CardHeader><CardTitle>Model Routing Policies</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Route AI tasks to optimal models based on task class, risk tier, and budget policy. 
                Supports circuit breakers, fallback chains, and data residency compliance.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {["utility", "standard", "premium", "sovereign"].map(t => (
                  <Badge key={t} variant="outline">{t}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader><CardTitle>Budget & Cost Tracking</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Daily spend ceilings, alert thresholds, and enforcement modes (soft_warn, hard_block, throttle_and_downgrade).
                Automatic tier downgrade when approaching limits.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader><CardTitle>Tool Policy Enforcement</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Per-role tool permissions: full_access, supervised, restricted, read_only, forbidden.
                Sandbox execution, data exposure scoping, and high-risk action restrictions.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader><CardTitle>AI Audit Log</CardTitle></CardHeader>
            <CardContent>
              {auditLog.length === 0 ? (
                <p className="text-muted-foreground">No audit entries yet. AI actions will appear here as they are processed.</p>
              ) : (
                <div className="space-y-2">
                  {auditLog.slice(0, 20).map(entry => (
                    <div key={entry.audit_id} className="flex items-center gap-3 text-sm border-b border-border pb-2">
                      <Badge variant="outline">{entry.action_type}</Badge>
                      <span className="text-muted-foreground">{entry.role_key}</span>
                      <Badge variant="secondary">{entry.gate_result}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{entry.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
