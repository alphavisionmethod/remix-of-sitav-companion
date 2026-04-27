import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCRMContacts, useCRMSegments } from "@/modules/business/hooks/use-crm-data";
import { Filter, Plus, Users, AlertTriangle, Clock, Star, TrendingUp, X, Search, Eye, Save, Trash2, ChevronDown } from "lucide-react";
import { isPast, differenceInDays } from "date-fns";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { supabase } from "@/integrations/supabase/client";
import { dbAny } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { SEGMENT_FILTER_FIELDS, SEGMENT_OPERATORS } from "./_config/CRMSegments.config";

type FilterCondition = {
  field: string;
  operator: string;
  value: string;
};

function matchesFilter(contact: any, condition: FilterCondition): boolean {
  const { field, operator, value } = condition;
  if (!value) return true;

  if (field === "last_contacted_days") {
    const days = contact.last_contacted_at ? differenceInDays(new Date(), new Date(contact.last_contacted_at)) : 999;
    const target = parseInt(value);
    if (operator === "gt") return days > target;
    if (operator === "lt") return days < target;
    if (operator === "gte") return days >= target;
    if (operator === "lte") return days <= target;
    return days === target;
  }

  if (field === "health_score") {
    const score = contact.health_score ?? 50;
    const target = parseInt(value);
    if (operator === "gt") return score > target;
    if (operator === "lt") return score < target;
    if (operator === "gte") return score >= target;
    if (operator === "lte") return score <= target;
    return score === target;
  }

  if (field === "tags") {
    const tags = contact.tags || [];
    return tags.some((t: string) => t.toLowerCase().includes(value.toLowerCase()));
  }

  const fieldValue = (contact[field] || "").toString().toLowerCase();
  const targetValue = value.toLowerCase();
  if (operator === "eq") return fieldValue === targetValue;
  if (operator === "neq") return fieldValue !== targetValue;
  if (operator === "contains") return fieldValue.includes(targetValue);
  return false;
}

const CRMSegments = () => {
  const { data: contacts = [] } = useCRMContacts();
  const { data: segments = [] } = useCRMSegments();
  const { adaptations, primaryMode } = useBusinessProfile();
  const crmLang = adaptations.crm.language;
  const [showBuilder, setShowBuilder] = useState(false);
  const [conditions, setConditions] = useState<FilterCondition[]>([{ field: "lifecycle_stage", operator: "eq", value: "" }]);
  const [segmentName, setSegmentName] = useState("");
  const [activeSmartView, setActiveSmartView] = useState<string | null>(null);

  // Archetype-aware smart view labels
  const contactLabel = crmLang.contactLabel || "Contacts";
  const smartViews = useMemo(() => [
    { id: "all", label: `All ${contactLabel}`, icon: Users, count: contacts.length, color: "text-primary", filter: () => true },
    { id: "at_risk", label: "At Risk", icon: AlertTriangle, count: contacts.filter(c => (c.health_score ?? 50) < 40).length, color: "text-destructive", filter: (c: any) => (c.health_score ?? 50) < 40 },
    { id: "follow_up", label: "Needs Follow-Up", icon: Clock, count: contacts.filter(c => c.next_follow_up_at && isPast(new Date(c.next_follow_up_at))).length, color: "text-orange-400", filter: (c: any) => c.next_follow_up_at && isPast(new Date(c.next_follow_up_at)) },
    { id: "vip", label: primaryMode === "ecommerce" ? "High LTV" : "VIP", icon: Star, count: contacts.filter(c => c.tags?.includes("VIP")).length, color: "text-yellow-400", filter: (c: any) => c.tags?.includes("VIP") },
    { id: "leads", label: primaryMode === "ecommerce" ? "New Buyers" : primaryMode === "appointment-based" ? "New Bookings" : "New Leads", icon: TrendingUp, count: contacts.filter(c => c.lifecycle_stage === "lead").length, color: "text-blue-400", filter: (c: any) => c.lifecycle_stage === "lead" },
    { id: "customers", label: primaryMode === "service" ? "Active Clients" : primaryMode === "membership" ? "Members" : "Active Customers", icon: Users, count: contacts.filter(c => c.lifecycle_stage === "customer").length, color: "text-[hsl(var(--trust-safe))]", filter: (c: any) => c.lifecycle_stage === "customer" },
  ], [contacts, contactLabel, primaryMode]);

  const filteredContacts = useMemo(() => {
    if (activeSmartView) {
      const sv = smartViews.find(s => s.id === activeSmartView);
      return sv ? contacts.filter(sv.filter) : contacts;
    }
    if (conditions.some(c => c.value)) {
      return contacts.filter(c => conditions.every(cond => matchesFilter(c, cond)));
    }
    return [];
  }, [contacts, activeSmartView, conditions, smartViews]);

  const addCondition = () => setConditions(prev => [...prev, { field: "status", operator: "eq", value: "" }]);
  const removeCondition = (i: number) => setConditions(prev => prev.filter((_, idx) => idx !== i));

  const saveSegment = async () => {
    if (!segmentName.trim()) { toast.error("Enter a segment name"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await dbAny.from("crm_segments").insert({
      user_id: user.id,
      name: segmentName,
      filter_config: conditions,
      contact_count: filteredContacts.length,
    });
    toast.success("Segment saved");
    setShowBuilder(false);
    setSegmentName("");
  };

  return (
    <div className="space-y-6">
      <PageTruthBanner truthState="demo" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{contactLabel} Segments & Smart Views</h2>
          <p className="text-xs text-muted-foreground">Slice your {contactLabel.toLowerCase()} with filters, or use built-in smart views</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowBuilder(true)}>
          <Plus className="h-3.5 w-3.5" /> New Segment
        </Button>
      </div>

      {/* Smart Views */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Smart Views</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {smartViews.map(sv => (
            <Card
              key={sv.id}
              className={`border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer ${
                activeSmartView === sv.id ? "border-primary ring-1 ring-primary/20" : ""
              }`}
              onClick={() => setActiveSmartView(activeSmartView === sv.id ? null : sv.id)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                  <sv.icon className={`h-4 w-4 ${sv.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{sv.label}</p>
                </div>
                <span className="text-lg font-bold text-foreground">{sv.count}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Segments */}
      {segments.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Custom Segments</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {segments.map((s: any) => (
              <Card key={s.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Filter className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                  </div>
                  <span className="text-lg font-bold text-foreground">{s.contact_count}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active view results */}
      {(activeSmartView || conditions.some(c => c.value)) && filteredContacts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {activeSmartView ? smartViews.find(s => s.id === activeSmartView)?.label : "Filter Results"} ({filteredContacts.length})
            </h3>
            {activeSmartView && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setActiveSmartView(null)}>
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-3 py-2 text-left font-semibold">Name</th>
                  <th className="px-3 py-2 text-left font-semibold">Email</th>
                  <th className="px-3 py-2 text-left font-semibold">Stage</th>
                  <th className="px-3 py-2 text-left font-semibold">Health</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.slice(0, 20).map((c: any) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/10">
                    <td className="px-3 py-2 font-medium text-foreground">{c.first_name} {c.last_name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{c.email || "—"}</td>
                    <td className="px-3 py-2"><span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">{c.lifecycle_stage}</span></td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${c.health_score ?? 50}%` }} />
                        </div>
                        <span className="text-muted-foreground">{c.health_score ?? 50}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Segment Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Filter className="h-4 w-4 text-primary" /> Build Segment</DialogTitle>
            <DialogDescription>Define filter conditions to create a segment</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input placeholder="Segment name..." value={segmentName} onChange={e => setSegmentName(e.target.value)} className="text-sm" />

            <div className="space-y-2">
              {conditions.map((cond, i) => {
                const fieldDef = SEGMENT_FILTER_FIELDS.find(f => f.key === cond.field);
                const ops = SEGMENT_OPERATORS[fieldDef?.type || "text"];
                return (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-[10px] text-muted-foreground font-medium">AND</span>}
                    <select
                      value={cond.field}
                      onChange={e => setConditions(prev => prev.map((c, idx) => idx === i ? { ...c, field: e.target.value, value: "" } : c))}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs flex-1"
                    >
                      {SEGMENT_FILTER_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                    <select
                      value={cond.operator}
                      onChange={e => setConditions(prev => prev.map((c, idx) => idx === i ? { ...c, operator: e.target.value } : c))}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs w-20"
                    >
                      {ops.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                    </select>
                    {fieldDef?.type === "select" ? (
                      <select
                        value={cond.value}
                        onChange={e => setConditions(prev => prev.map((c, idx) => idx === i ? { ...c, value: e.target.value } : c))}
                        className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs flex-1"
                      >
                        <option value="">Select...</option>
                        {fieldDef.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <Input
                        value={cond.value}
                        onChange={e => setConditions(prev => prev.map((c, idx) => idx === i ? { ...c, value: e.target.value } : c))}
                        placeholder="Value..."
                        className="text-xs h-8 flex-1"
                      />
                    )}
                    {conditions.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeCondition(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addCondition}>
              <Plus className="h-3 w-3" /> Add Condition
            </Button>

            {conditions.some(c => c.value) && (
              <div className="rounded-lg bg-muted/20 px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Matching contacts</span>
                <span className="text-sm font-bold text-foreground">{filteredContacts.length}</span>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowBuilder(false)}>Cancel</Button>
              <Button size="sm" className="gap-1.5" onClick={saveSegment} disabled={!segmentName.trim()}>
                <Save className="h-3.5 w-3.5" /> Save Segment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMSegments;
