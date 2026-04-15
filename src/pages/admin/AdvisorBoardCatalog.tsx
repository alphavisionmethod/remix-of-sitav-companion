import { AdminShell } from "@/components/admin/shells/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Users, Zap, Shield, Activity, Settings } from "lucide-react";
import { BUSINESS_ADVISORS } from "@/lib/engines/business-advisor-personas";
import { useState } from "react";

export default function AdvisorBoardCatalog() {
  const [advisorStates, setAdvisorStates] = useState(
    BUSINESS_ADVISORS.reduce((acc, a) => ({ ...acc, [a.id]: { enabled: true, intensity: 70 } }), {} as Record<string, { enabled: boolean; intensity: number }>)
  );

  const toggleAdvisor = (id: string) => {
    setAdvisorStates(prev => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled },
    }));
  };

  const setIntensity = (id: string, val: number) => {
    setAdvisorStates(prev => ({
      ...prev,
      [id]: { ...prev[id], intensity: val },
    }));
  };

  return (
    <AdminShell activePath="/admin/advisor-board/catalog" contextScope="Advisor Board Catalog">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Advisor Board Catalog
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage advisor configurations, intensity, and domain scope
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {BUSINESS_ADVISORS.length} Advisors
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUSINESS_ADVISORS.map((advisor) => {
            const state = advisorStates[advisor.id] ?? { enabled: true, intensity: 70 };
            return (
              <Card key={advisor.id} className={`transition-opacity ${state.enabled ? "" : "opacity-50"}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                        {advisor.emoji}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{advisor.displayName}</CardTitle>
                        <p className="text-[10px] text-muted-foreground">{advisor.role}</p>
                      </div>
                    </div>
                    <Switch checked={state.enabled} onCheckedChange={() => toggleAdvisor(advisor.id)} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {advisor.domainScope.map(d => (
                      <Badge key={d} variant="secondary" className="text-[9px]">{d}</Badge>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Intensity</span>
                      <span className="text-[10px] font-mono">{state.intensity}%</span>
                    </div>
                    <Slider
                      value={[state.intensity]}
                      onValueChange={([v]) => setIntensity(advisor.id, v)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    <span>Domains: {advisor.domainScope?.slice(0, 3).join(", ") ?? "General"}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
