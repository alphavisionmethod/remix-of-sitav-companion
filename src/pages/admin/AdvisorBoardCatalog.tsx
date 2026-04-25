import { AdminControlPlaneShell as AdminShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Users, Zap, Loader2, Save } from "lucide-react";
import { BUSINESS_ADVISORS } from "@/domains/engines/business-advisor-personas";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BoardAPI, type AutonomyPolicy } from "@/lib/services/board-api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LaunchHonestyBadge } from "@/platform/product/components/reality/LaunchHonestyBadge";
import { supabase } from "@/integrations/supabase/client";

type HonestyClass = "truthful" | "qualified" | "demo_governed" | "partial" | "unavailable" | "planned" | "internal_only";

const MATURITY_TO_HONESTY: Record<string, HonestyClass> = {
  production: "truthful",
  beta: "partial",
  alpha: "qualified",
  scaffold: "demo_governed",
};

function honestyFor(advisorId: string, honestyMap: Record<string, string>): HonestyClass {
  // Try direct match, then domain-suffixed variants
  const status =
    honestyMap[advisorId] ??
    honestyMap[advisorId.replace(/-advisor$/, "")] ??
    honestyMap[`${advisorId.replace(/-advisor$/, "")}-advisor`];
  return MATURITY_TO_HONESTY[status ?? ""] ?? "planned";
}

type AdvisorState = Record<string, { enabled: boolean; intensity: number }>;

function policiesToState(policies: AutonomyPolicy[]): AdvisorState {
  const base = BUSINESS_ADVISORS.reduce(
    (acc, a) => ({ ...acc, [a.id]: { enabled: true, intensity: 70 } }),
    {} as AdvisorState,
  );
  for (const p of policies) {
    // domain key maps to advisor id
    const match = BUSINESS_ADVISORS.find((a) => a.id === p.domain || a.domainScope?.[0] === p.domain);
    if (match) {
      base[match.id] = {
        enabled: p.autonomy_level > 0,
        intensity: Math.round(p.autonomy_level * 20), // 0-5 → 0-100
      };
    }
  }
  return base;
}

export default function AdvisorBoardCatalog() {
  const queryClient = useQueryClient();

  const { data: policiesData, isLoading } = useQuery({
    queryKey: ["advisor-autonomy-policies"],
    queryFn: async () => {
      const res = await BoardAPI.getSummary();
      return res.autonomyPolicies ?? [];
    },
    staleTime: 30_000,
  });

  const { data: honestyMap = {} } = useQuery({
    queryKey: ["advisor-launch-honesty"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_workforce_launch_honesty")
        .select("role_key, actual_status");
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const row of data ?? []) map[row.role_key] = row.actual_status;
      return map;
    },
    staleTime: 60_000,
  });

  const [advisorStates, setAdvisorStates] = useState<AdvisorState>(
    BUSINESS_ADVISORS.reduce(
      (acc, a) => ({ ...acc, [a.id]: { enabled: true, intensity: 70 } }),
      {} as AdvisorState,
    ),
  );
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (policiesData?.length) {
      setAdvisorStates(policiesToState(policiesData));
    }
  }, [policiesData]);

  const upsertMutation = useMutation({
    mutationFn: async (states: AdvisorState) => {
      const promises = Object.entries(states).map(([advisorId, s]) =>
        BoardAPI.upsertAutonomy({
          domain: advisorId,
          autonomy_level: s.enabled ? Math.round(s.intensity / 20) : 0,
          settings: { intensity: s.intensity, enabled: s.enabled },
        }),
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Advisor configurations saved");
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ["advisor-autonomy-policies"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleAdvisor = useCallback((id: string) => {
    setAdvisorStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled },
    }));
    setDirty(true);
  }, []);

  const setIntensity = useCallback((id: string, val: number) => {
    setAdvisorStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], intensity: val },
    }));
    setDirty(true);
  }, []);

  return (
    <AdminShell contextScope="Advisor Board Catalog">
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
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {BUSINESS_ADVISORS.length} Advisors
            </Badge>
            {dirty && (
              <Button
                size="sm"
                onClick={() => upsertMutation.mutate(advisorStates)}
                disabled={upsertMutation.isPending}
              >
                {upsertMutation.isPending ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Save className="h-3 w-3 mr-1" />
                )}
                Save Changes
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
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
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{advisor.displayName}</CardTitle>
                            <LaunchHonestyBadge honestyClass={honestyFor(advisor.id, honestyMap)} compact />
                          </div>
                          <p className="text-[10px] text-muted-foreground">{advisor.role}</p>
                        </div>
                      </div>
                      <Switch checked={state.enabled} onCheckedChange={() => toggleAdvisor(advisor.id)} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {advisor.domainScope.map((d) => (
                        <Badge key={d} variant="secondary" className="text-[9px]">
                          {d}
                        </Badge>
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
        )}
      </div>
    </AdminShell>
  );
}
