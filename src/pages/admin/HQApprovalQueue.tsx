import { useAction } from "@/hooks/use-action";
// ═══════════════════════════════════════════════════════════════
// SITA OS — HQ01-HQ04: Human Approval & Recommendation Queue
// Full governance queue with overview, detail, decision history, filters
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
// Note: db alias removed in favor of direct supabase client + per-call casting at boundary
import { fromTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import {
  CheckCircle, XCircle, Clock, Shield, AlertTriangle, Eye, ArrowRight,
  ChevronDown, ChevronUp, Filter, History, LayoutDashboard, FileText,
  DollarSign, Zap, RotateCcw, MessageSquare,
} from "lucide-react";
import { DEMO_RISK_TIERS } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const DEMO_STATUSES: any[] = [];




// Production fallback — seed data removed
const DEMO_DOMAINS: any[] = [];

// ── Types ──
// Aligned to canonical `ai_workforce_approval_queue` schema.
// Legacy fields (risk_tier, severity, impacted_domain, ...) are derived
// from the joined `ai_workforce_recommendations` row when available.
interface QueueItem {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  priority: string;
  status: string;
  evidence_links: any | null;
  cost_implications: string | null;
  launch_implications: string | null;
  reviewer_user_id: string | null;
  reviewer_comments: string | null;
  decision_at: string | null;
  remediation_binding_id: string | null;
  recommendation_id: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  // Derived for UI compatibility
  role_key: string;
  risk_tier: string;
  severity: string | null;
  impacted_domain: string | null;
  recommendation_type: string | null;
  estimated_impact: string | null;
  budget_impact: string | null;
  launch_impact: string | null;
  evidence_summary: string | null;
  proposed_action_summary: string | null;
  evidence: any | null;
  proposed_changes: any | null;
  review_notes: string | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  invocation_id: string | null;
  originating_receipt_id: string | null;
  resolved_at: string | null;
  action_type: string;
}

const priorityToRiskTier = (p: string): string =>
  p === "urgent" ? "critical" : p === "high" ? "high" : p === "low" ? "low" : "standard";

// ── Data fetching ──
async function fetchQueue(filters: Record<string, string>) {
  let query = supabase
    .from("ai_workforce_approval_queue")
    .select("*, ai_workforce_recommendations(domain, severity, role_key, confidence, evidence)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.priority && filters.priority !== "all") query = query.eq("priority", filters.priority);
  const { data, error } = await query;
  if (error) { console.error("[HQ] Queue fetch error:", error); return []; }

  let items = ((data ?? []) as Array<Record<string, any>>).map((row): QueueItem => {
    const rec = row.ai_workforce_recommendations || {};
    return {
      id: row.id,
      title: row.title,
      summary: row.summary,
      description: row.summary,
      priority: row.priority,
      status: row.status,
      evidence_links: row.evidence_links,
      cost_implications: row.cost_implications,
      launch_implications: row.launch_implications,
      reviewer_user_id: row.reviewer_user_id,
      reviewer_comments: row.reviewer_comments,
      decision_at: row.decision_at,
      remediation_binding_id: row.remediation_binding_id,
      recommendation_id: row.recommendation_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_id: row.user_id,
      // Derived
      role_key: rec.role_key || "system",
      risk_tier: priorityToRiskTier(row.priority),
      severity: rec.severity ?? null,
      impacted_domain: rec.domain ?? null,
      recommendation_type: rec.role_key ?? null,
      estimated_impact: row.cost_implications,
      budget_impact: row.cost_implications,
      launch_impact: row.launch_implications,
      evidence_summary: row.summary,
      proposed_action_summary: row.summary,
      evidence: row.evidence_links,
      proposed_changes: null,
      review_notes: null,
      reviewer_notes: row.reviewer_comments,
      reviewed_at: row.decision_at,
      reviewed_by: row.reviewer_user_id,
      invocation_id: null,
      originating_receipt_id: null,
      resolved_at: row.decision_at,
      action_type: rec.role_key || "system",
    };
  });

  // Apply derived-field filters in JS (column doesn't exist on the base table)
  if (filters.risk_tier && filters.risk_tier !== "all") items = items.filter(i => i.risk_tier === filters.risk_tier);
  if (filters.role_key && filters.role_key !== "all") items = items.filter(i => i.role_key === filters.role_key);
  if (filters.severity && filters.severity !== "all") items = items.filter(i => i.severity === filters.severity);
  if (filters.impacted_domain && filters.impacted_domain !== "all") items = items.filter(i => i.impacted_domain === filters.impacted_domain);

  return items;
}

// ── Risk color helpers ──
const riskColor = (tier: string) =>
  tier === "critical" ? "destructive" : tier === "high" ? "default" : "secondary";
const severityColor = (sev: string) =>
  sev === "critical" ? "text-destructive" : sev === "high" ? "text-amber-500" : "text-muted-foreground";

// ════════════════════════════════════════════════════════════════
// Main Page
// ════════════════════════════════════════════════════════════════
export default function HQApprovalQueue() {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Human Approval & Recommendation Queue
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Govern AI workforce proposals with evidence-backed human review</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-1"><LayoutDashboard className="h-3.5 w-3.5" />HQ01 Overview</TabsTrigger>
          <TabsTrigger value="detail" className="gap-1"><FileText className="h-3.5 w-3.5" />HQ02 Queue</TabsTrigger>
          <TabsTrigger value="history" className="gap-1"><History className="h-3.5 w-3.5" />HQ03 Decisions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><HQ01Overview /></TabsContent>
        <TabsContent value="detail"><HQ02QueueDetail /></TabsContent>
        <TabsContent value="history"><HQ03DecisionHistory /></TabsContent>
      </Tabs>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HQ01 — Queue Overview
// ════════════════════════════════════════════════════════════════
function HQ01Overview() {
  const { isDemoMode } = useDataMode();
  const { data: allItems = [] } = useQuery({
    queryKey: ["hq-all-items"],
    queryFn: () => fetchQueue({ status: "all" }),
  });

  const pending = allItems.filter(i => i.status === "pending" || i.status === "under_review");
  const highRiskPending = pending.filter(i => i.risk_tier === "high" || i.risk_tier === "critical");
  const todayStr = new Date().toDateString();
  const todayItems = allItems.filter(i => new Date(i.created_at).toDateString() === todayStr);
  const approvedToday = todayItems.filter(i => i.status === "approved").length;
  const rejectedToday = todayItems.filter(i => i.status === "rejected").length;
  const deferred = allItems.filter(i => i.status === "deferred").length;
  const aging = pending.filter(i => Date.now() - new Date(i.created_at).getTime() > 86400000);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Pending", value: pending.length, icon: Clock, color: "text-amber-500" },
          { label: "High-Risk Pending", value: highRiskPending.length, icon: AlertTriangle, color: "text-destructive" },
          { label: "Aging (>24h)", value: aging.length, icon: Clock, color: "text-amber-500" },
          { label: "Approved Today", value: approvedToday, icon: CheckCircle, color: "text-emerald-500" },
          { label: "Rejected Today", value: rejectedToday, icon: XCircle, color: "text-destructive" },
          { label: "Deferred", value: deferred, icon: RotateCcw, color: "text-muted-foreground" },
          { label: "Total Items", value: allItems.length, icon: FileText, color: "text-primary" },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 text-center">
              <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk distribution */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Pending by Risk Tier</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {([] as typeof DEMO_RISK_TIERS).map(tier => {
              const count = pending.filter(i => i.risk_tier === tier).length;
              return (
                <div key={tier} className="text-center p-3 rounded border">
                  <div className="text-xl font-bold">{count}</div>
                  <Badge variant={riskColor(tier)} className="text-[10px] mt-1">{tier}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent high-risk items */}
      {highRiskPending.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-destructive" />High-Risk Items Needing Review</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {highRiskPending.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded border text-xs">
                <div>
                  <span className="font-medium">{item.title}</span>
                  <span className="text-muted-foreground ml-2">from {item.role_key}</span>
                </div>
                <div className="flex gap-1">
                  <Badge variant={riskColor(item.risk_tier)} className="text-[10px]">{item.risk_tier}</Badge>
                  {item.launch_impact && <Badge variant="outline" className="text-[10px]">Launch: {item.launch_impact}</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HQ02 — Queue Item Detail View (with HQ04 filters built in)
// ════════════════════════════════════════════════════════════════
function HQ02QueueDetail() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<Record<string, string>>({ status: "pending" });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const { data: items = [] } = useQuery({
    queryKey: ["hq-queue", filters],
    queryFn: () => fetchQueue(filters),
  });

  const updateItem = useAction("admin", "approval.update", {
    invalidateKeys: [["hq-queue"]],
  });

  const setFilter = (key: string, val: string) => setFilters(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-4">
      {/* HQ04 — Filters */}
      <Card>
        <CardContent className="pt-3 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {[
              { key: "status", label: "Status", options: ["all", ...DEMO_STATUSES] },
              { key: "risk_tier", label: "Risk", options: ["all", ...DEMO_RISK_TIERS] },
              { key: "severity", label: "Severity", options: ["all", "low", "medium", "high", "critical"] },
              { key: "impacted_domain", label: "Domain", options: ["all", ...DEMO_DOMAINS] },
            ].map(f => (
              <Select key={f.key} value={filters[f.key] ?? "all"} onValueChange={v => setFilter(f.key, v)}>
                <SelectTrigger className="w-[130px] h-7 text-[10px]"><SelectValue placeholder={f.label} /></SelectTrigger>
                <SelectContent>{f.options.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
              </Select>
            ))}
            <Badge variant="outline" className="text-[10px]">{items.length} items</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Queue Items */}
      {items.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No items match filters.</CardContent></Card>
      ) : items.map(item => {
        const expanded = expandedId === item.id;
        return (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 space-y-2">
              {/* Header row */}
              <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(expanded ? null : item.id)}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.title}</span>
                    {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </div>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{item.role_key?.replace(/_/g, " ")}</Badge>
                    <Badge variant="outline" className="text-[10px]">{item.recommendation_type ?? item.action_type}</Badge>
                    {item.impacted_domain && <Badge variant="outline" className="text-[10px]">{item.impacted_domain}</Badge>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Badge variant={riskColor(item.risk_tier)} className="text-[10px]">{item.risk_tier} risk</Badge>
                  {item.severity && <Badge variant="secondary" className={`text-[10px] ${severityColor(item.severity)}`}>{item.severity}</Badge>}
                  <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                </div>
              </div>

              {/* Description */}
              {item.description && <p className="text-xs text-muted-foreground">{item.description.slice(0, 300)}</p>}

              {/* Expanded detail */}
              {expanded && (
                <div className="space-y-3 pt-2 border-t">
                  {/* Evidence */}
                  {item.evidence_summary && (
                    <div className="p-2 rounded border bg-muted/20 text-xs">
                      <div className="font-medium mb-1 flex items-center gap-1"><Eye className="h-3 w-3" />Evidence Summary</div>
                      <p>{item.evidence_summary}</p>
                    </div>
                  )}

                  {/* Proposed action */}
                  {item.proposed_action_summary && (
                    <div className="p-2 rounded border bg-muted/20 text-xs">
                      <div className="font-medium mb-1 flex items-center gap-1"><ArrowRight className="h-3 w-3" />Proposed Action</div>
                      <p>{item.proposed_action_summary}</p>
                    </div>
                  )}

                  {/* Impact badges */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {item.estimated_impact && (
                      <div className="flex items-center gap-1 p-1.5 rounded border"><Zap className="h-3 w-3" />Impact: {item.estimated_impact}</div>
                    )}
                    {item.budget_impact && (
                      <div className="flex items-center gap-1 p-1.5 rounded border"><DollarSign className="h-3 w-3" />Budget: {item.budget_impact}</div>
                    )}
                    {item.launch_impact && (
                      <div className="flex items-center gap-1 p-1.5 rounded border"><Shield className="h-3 w-3" />Launch: {item.launch_impact}</div>
                    )}
                  </div>

                  {/* Raw evidence JSON */}
                  {item.evidence && (
                    <details className="text-[10px]">
                      <summary className="cursor-pointer text-muted-foreground">Raw evidence data</summary>
                      <pre className="mt-1 p-2 rounded bg-muted/30 overflow-auto max-h-40">{JSON.stringify(item.evidence, null, 2)}</pre>
                    </details>
                  )}

                  {/* Reviewer notes input */}
                  <div>
                    <label className="text-[10px] font-medium flex items-center gap-1 mb-1"><MessageSquare className="h-3 w-3" />Reviewer Notes</label>
                    <Textarea
                      placeholder="Add review notes, request clarification, or note concerns..."
                      value={reviewNotes[item.id] ?? ""}
                      onChange={e => setReviewNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                      className="text-xs h-16"
                    />
                  </div>

                  {/* Decision controls */}
                  {(item.status === "pending" || item.status === "under_review" || item.status === "returned_for_revision") && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button size="sm" variant="default" className="h-7 text-xs gap-1"
                        onClick={() => updateItem.mutate({ id: item.id, status: "approved", notes: reviewNotes[item.id] })}>
                        <CheckCircle className="h-3 w-3" />Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs gap-1"
                        onClick={() => updateItem.mutate({ id: item.id, status: "rejected", notes: reviewNotes[item.id] })}>
                        <XCircle className="h-3 w-3" />Reject
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                        onClick={() => updateItem.mutate({ id: item.id, status: "returned_for_revision", notes: reviewNotes[item.id] })}>
                        <RotateCcw className="h-3 w-3" />Request Revision
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                        onClick={() => updateItem.mutate({ id: item.id, status: "under_review", notes: reviewNotes[item.id] })}>
                        <Eye className="h-3 w-3" />Mark Under Review
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                        onClick={() => updateItem.mutate({ id: item.id, status: "deferred", notes: reviewNotes[item.id] })}>
                        <Clock className="h-3 w-3" />Defer
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                        onClick={() => updateItem.mutate({ id: item.id, status: "queued_for_execution", notes: reviewNotes[item.id] })}>
                        <Zap className="h-3 w-3" />Queue for Execution
                      </Button>
                    </div>
                  )}

                  {/* Past reviewer notes */}
                  {item.reviewer_notes && (
                    <div className="p-2 rounded border bg-muted/10 text-[10px]">
                      <span className="font-medium">Previous review: </span>{item.reviewer_notes}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                    <span>Created: {new Date(item.created_at).toLocaleString()}</span>
                    {item.reviewed_at && <span>Reviewed: {new Date(item.reviewed_at).toLocaleString()}</span>}
                    {item.resolved_at && <span>Resolved: {new Date(item.resolved_at).toLocaleString()}</span>}
                    {item.invocation_id && <span>Invocation: {item.invocation_id.slice(0, 8)}...</span>}
                    {item.originating_receipt_id && <span>Receipt: {item.originating_receipt_id.slice(0, 8)}...</span>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HQ03 — Decision History View
// ════════════════════════════════════════════════════════════════
function HQ03DecisionHistory() {
  const { data: resolved = [] } = useQuery({
    queryKey: ["hq-resolved"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ai_workforce_approval_queue")
        .select("*, ai_workforce_recommendations(domain, severity, role_key)")
        .in("status", ["approved", "rejected", "deferred", "executed", "expired"])
        .order("decision_at", { ascending: false, nullsFirst: false })
        .limit(100);
      if (error) return [];
      return ((data ?? []) as Array<Record<string, unknown>>).map((row): QueueItem => {
        const rec = (row.ai_workforce_recommendations as Record<string, unknown> | null) || {};
        return {
          ...(row as unknown as QueueItem),
          summary: row.summary as string | null,
          description: row.summary as string | null,
          role_key: (rec.role_key as string) || "system",
          risk_tier: priorityToRiskTier(row.priority as string),
          severity: (rec.severity as string | null) ?? null,
          impacted_domain: (rec.domain as string | null) ?? null,
          recommendation_type: (rec.role_key as string | null) ?? null,
          reviewer_notes: row.reviewer_comments as string | null,
          reviewed_at: row.decision_at as string | null,
          reviewed_by: row.reviewer_user_id as string | null,
          resolved_at: row.decision_at as string | null,
          action_type: (rec.role_key as string) || "system",
        } as QueueItem;
      });
    },
  });

  const approvedCount = resolved.filter(i => i.status === "approved").length;
  const rejectedCount = resolved.filter(i => i.status === "rejected").length;
  const deferredCount = resolved.filter(i => i.status === "deferred").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-emerald-500">{approvedCount}</div>
          <div className="text-[10px] text-muted-foreground">Approved</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-destructive">{rejectedCount}</div>
          <div className="text-[10px] text-muted-foreground">Rejected</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-muted-foreground">{deferredCount}</div>
          <div className="text-[10px] text-muted-foreground">Deferred</div>
        </CardContent></Card>
      </div>

      <div className="space-y-2">
        {resolved.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No decision history yet.</CardContent></Card>
        ) : resolved.map(item => (
          <Card key={item.id}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">{item.role_key?.replace(/_/g, " ")}</span>
                </div>
                <div className="flex gap-1">
                  <Badge variant={item.status === "approved" ? "default" : item.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">{item.status}</Badge>
                  <Badge variant={riskColor(item.risk_tier)} className="text-[10px]">{item.risk_tier}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-muted-foreground">
                {item.resolved_at && <span>Resolved: {new Date(item.resolved_at).toLocaleString()}</span>}
                {item.reviewer_notes && <span>• Notes: {item.reviewer_notes.slice(0, 100)}</span>}
                {item.impacted_domain && <span>• Domain: {item.impacted_domain}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
