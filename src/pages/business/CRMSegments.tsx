import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCRMContacts, useCRMSegments } from "@/hooks/use-crm-data";
import { Filter, Plus, Users, AlertTriangle, Clock, Star, TrendingUp } from "lucide-react";
import { isPast } from "date-fns";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const CRMSegments = () => {
  const { data: contacts = [] } = useCRMContacts();
  const { data: segments = [] } = useCRMSegments();

  const smartViews = [
    { label: "All Contacts", icon: Users, count: contacts.length, color: "text-primary" },
    { label: "At Risk", icon: AlertTriangle, count: contacts.filter(c => (c.health_score ?? 50) < 40).length, color: "text-red-400" },
    { label: "Needs Follow-Up", icon: Clock, count: contacts.filter(c => c.next_follow_up_at && isPast(new Date(c.next_follow_up_at))).length, color: "text-orange-400" },
    { label: "VIP / High Value", icon: Star, count: contacts.filter(c => c.tags?.includes("VIP")).length, color: "text-yellow-400" },
    { label: "New Leads", icon: TrendingUp, count: contacts.filter(c => c.lifecycle_stage === "lead").length, color: "text-blue-400" },
    { label: "Customers", icon: Users, count: contacts.filter(c => c.lifecycle_stage === "customer").length, color: "text-green-400" },
  ];

  return (
    <div className="space-y-6">
      <PageTruthBanner domain="business" subLabel="CRM Segments" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Segments & Smart Views</h2>
          <p className="text-xs text-muted-foreground">Slice your contacts by any criteria</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Segment
        </Button>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Smart Views</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {smartViews.map(sv => (
            <Card key={sv.label} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center`}>
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

      {segments.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Custom Segments</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {segments.map(s => (
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
    </div>
  );
};

export default CRMSegments;
