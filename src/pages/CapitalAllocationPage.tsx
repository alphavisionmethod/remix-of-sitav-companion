import { PageSkeleton } from "@/components/sita/PageSkeleton";
import { useState } from "react";
import { motion } from "framer-motion";
import { PieChart, TrendingUp, ArrowUpDown, Shield, DollarSign, BarChart3, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

import { ASSET_COLORS } from "@/lib/constants/ui-config";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
export default function CapitalAllocationPage() {
  const { user , isDemo} = useAuth();
  const { data: realAllocations } = useQuery({
    queryKey: ["capital-allocations", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data } = await fromTable("financial_accounts").select("*").eq("user_id", user!.id);
      if (!data?.length) return null;
      const total = data.reduce((s: number,  a: Record<string, any>) => s + (a.balance_cents || 0), 0);
      return data.map((a: any, i: number) => {
        const value = (a.balance_cents || 0) / 100;
        const current = total > 0 ? (a.balance_cents / total) * 100 : 0;
        const target = Math.round(current); // Use current as target baseline
        return {
          asset: a.account_name || a.account_type || `Account ${i + 1}`,
          target,
          current: Math.round(current * 10) / 10,
          value,
          drift: Math.round((current - target) * 10) / 10,
          color: ASSET_COLORS[i % ASSET_COLORS.length],
        };
      });
    },
  });

  const allocations = (realAllocations ?? []);
  const totalValue = allocations.reduce((s, a) => s + a.value, 0);

  return (
    <div className="space-y-6 p-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><PieChart className="h-6 w-6 text-primary" /> Capital Allocation</h1>
          <p className="text-muted-foreground text-sm mt-1">Portfolio optimization, rebalancing, and allocation tracking</p>
        </div>
        <Button size="sm" variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Rebalance</Button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Portfolio", value: `$${(totalValue / 1000).toFixed(0)}K`, icon: DollarSign },
          { label: "YTD Return", value: "+8.4%", icon: TrendingUp },
          { label: "Max Drift", value: `${Math.max(...allocations.map(a => Math.abs(a.drift))).toFixed(1)}%`, icon: ArrowUpDown },
          { label: "Risk Score", value: "Moderate", icon: Shield },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className="h-5 w-5 text-primary" />
              <div><p className="text-xs text-muted-foreground">{kpi.label}</p><p className="text-xl font-bold text-foreground">{kpi.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="positions">
        <TabsList>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="rebalance">Rebalance Plan</TabsTrigger>
        </TabsList>
        <TabsContent value="positions" className="mt-4 space-y-3">
          {allocations.map((a, i) => (
            <motion.div key={a.asset} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${a.color}`} />
                    <div><p className="font-medium text-foreground">{a.asset}</p><p className="text-xs text-muted-foreground">Target: {a.target}%</p></div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right"><p className="text-xs text-muted-foreground">Current</p><p className="text-sm font-medium text-foreground">{a.current}%</p></div>
                    <div className="text-right"><p className="text-xs text-muted-foreground">Value</p><p className="text-sm font-medium text-foreground">${(a.value / 1000).toFixed(0)}K</p></div>
                    <div className="text-right"><p className="text-xs text-muted-foreground">Drift</p>
                      <Badge variant={Math.abs(a.drift) > 1.5 ? "destructive" : "secondary"} className="text-xs">
                        {a.drift > 0 ? "+" : ""}{a.drift}%
                      </Badge>
                    </div>
                    <Progress value={a.current} className="w-20 h-1.5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
        <TabsContent value="rebalance" className="mt-4">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-sm">Proposed Rebalance Orders</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {allocations.filter(a => Math.abs(a.drift) > 0.5).map(a => (
                <div key={a.asset} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm text-foreground">{a.asset}</p>
                    <p className="text-xs text-muted-foreground">{a.drift > 0 ? "Sell" : "Buy"} to reach {a.target}% target</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={a.drift > 0 ? "destructive" : "default"}>{a.drift > 0 ? "Sell" : "Buy"}</Badge>
                    <span className="text-sm font-medium text-foreground">${(Math.abs(a.drift) / 100 * totalValue / 1000).toFixed(1)}K</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
