import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCRMContacts } from "@/hooks/use-crm-data";
import { Heart, TrendingUp, TrendingDown, AlertTriangle, Users, Sparkles, ShieldAlert, Eye } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

type HealthBucket = { label: string; icon: React.ElementType; color: string; bg: string; min: number; max: number };

const BUCKETS: HealthBucket[] = [
  { label: "Healthy", icon: Heart, color: "text-green-400", bg: "bg-green-500/10", min: 80, max: 101 },
  { label: "Warming", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", min: 70, max: 80 },
  { label: "Stable", icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10", min: 60, max: 70 },
  { label: "Drifting", icon: TrendingDown, color: "text-yellow-400", bg: "bg-yellow-500/10", min: 40, max: 60 },
  { label: "At Risk", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", min: 20, max: 40 },
  { label: "Critical", icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10", min: 0, max: 20 },
];

const CRMHealth = () => {
  const { data: contacts = [] } = useCRMContacts();

  const bucketData = useMemo(() => {
    return BUCKETS.map(b => ({
      ...b,
      contacts: contacts.filter(c => (c.health_score ?? 50) >= b.min && (c.health_score ?? 50) < b.max),
    }));
  }, [contacts]);

  const avgHealth = contacts.length > 0 ? Math.round(contacts.reduce((s, c) => s + (c.health_score ?? 50), 0) / contacts.length) : 0;

  return (
    <div className="space-y-6">
      <PageTruthBanner domain="business" subLabel="Relationship Health" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Relationship Health</h2>
          <p className="text-xs text-muted-foreground">Understand the state of every relationship</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">{avgHealth}</p>
            <p className="text-xs text-muted-foreground">Avg Health</p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${avgHealth >= 70 ? "bg-green-500/20" : avgHealth >= 40 ? "bg-yellow-500/20" : "bg-red-500/20"}`}>
            <Heart className={`h-6 w-6 ${avgHealth >= 70 ? "text-green-400" : avgHealth >= 40 ? "text-yellow-400" : "text-red-400"}`} />
          </div>
        </div>
      </div>

      {/* Health buckets */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bucketData.map(b => (
          <Card key={b.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${b.bg} flex items-center justify-center`}>
                  <b.icon className={`h-4 w-4 ${b.color}`} />
                </div>
                <div>
                  <span className="text-foreground">{b.label}</span>
                  <p className="text-xs text-muted-foreground font-normal">{b.min}–{b.max === 101 ? 100 : b.max} score</p>
                </div>
                <span className={`ml-auto text-lg font-bold ${b.color}`}>{b.contacts.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {b.contacts.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 py-2">No contacts in this range</p>
              ) : (
                <div className="space-y-1.5">
                  {b.contacts.slice(0, 4).map(c => (
                    <div key={c.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted/30 rounded px-1 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {c.first_name[0]}{c.last_name[0]}
                      </div>
                      <span className="text-sm flex-1 truncate">{c.first_name} {c.last_name}</span>
                      <span className={`text-xs font-semibold ${b.color}`}>{c.health_score}</span>
                    </div>
                  ))}
                  {b.contacts.length > 4 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">+{b.contacts.length - 4} more</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {contacts.length === 0 && (
        <div className="py-12 text-center">
          <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Add contacts to see relationship health insights</p>
        </div>
      )}
    </div>
  );
};

export default CRMHealth;
