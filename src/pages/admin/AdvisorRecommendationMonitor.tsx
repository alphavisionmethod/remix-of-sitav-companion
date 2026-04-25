import { AdminControlPlaneShell as AdminShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BoardAPI, type BoardRecommendation } from "@/lib/services/board-api-client";

export default function AdvisorRecommendationMonitor() {
  const newRecs = useQuery({ queryKey: ["admin-recs-new"], queryFn: () => BoardAPI.listRecommendations("new", 100) });
  const acceptedRecs = useQuery({ queryKey: ["admin-recs-accepted"], queryFn: () => BoardAPI.listRecommendations("accepted", 100) });
  const dismissedRecs = useQuery({ queryKey: ["admin-recs-dismissed"], queryFn: () => BoardAPI.listRecommendations("dismissed", 100) });

  const allNew = newRecs.data?.recommendations ?? [];
  const allAccepted = acceptedRecs.data?.recommendations ?? [];
  const allDismissed = dismissedRecs.data?.recommendations ?? [];

  const avgConfidence = allNew.length > 0 ? allNew.reduce((s, r) => s + r.confidence_score, 0) / allNew.length : 0;
  const highUrgency = allNew.filter(r => r.urgency_score > 0.7).length;

  const RecCard = ({ rec }: { rec: BoardRecommendation }) => (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{rec.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{rec.advisor_id} · {rec.domain}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant={rec.urgency_score > 0.7 ? "destructive" : "secondary"} className="text-[9px]">
            {Math.round(rec.confidence_score * 100)}%
          </Badge>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{rec.summary}</p>
    </Card>
  );

  return (
    <AdminShell contextScope="Recommendation Monitor">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Recommendation Monitor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Live recommendation feed, confidence distribution, collision detection</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <Card className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-muted-foreground" />
            <p className="text-lg font-bold mt-1">{allNew.length}</p>
            <p className="text-[10px] text-muted-foreground">New</p>
          </Card>
          <Card className="p-3 text-center">
            <CheckCircle className="h-4 w-4 mx-auto text-[hsl(var(--chart-2))]" />
            <p className="text-lg font-bold mt-1">{allAccepted.length}</p>
            <p className="text-[10px] text-muted-foreground">Accepted</p>
          </Card>
          <Card className="p-3 text-center">
            <XCircle className="h-4 w-4 mx-auto text-destructive" />
            <p className="text-lg font-bold mt-1">{allDismissed.length}</p>
            <p className="text-[10px] text-muted-foreground">Dismissed</p>
          </Card>
          <Card className="p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-primary" />
            <p className="text-lg font-bold mt-1">{Math.round(avgConfidence * 100)}%</p>
            <p className="text-[10px] text-muted-foreground">Avg Confidence</p>
          </Card>
        </div>

        <Tabs defaultValue="new">
          <TabsList>
            <TabsTrigger value="new">New ({allNew.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({allAccepted.length})</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed ({allDismissed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="new" className="space-y-2 mt-3">
            {allNew.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No new recommendations</p>}
            {allNew.map(r => <RecCard key={r.id} rec={r} />)}
          </TabsContent>
          <TabsContent value="accepted" className="space-y-2 mt-3">
            {allAccepted.map(r => <RecCard key={r.id} rec={r} />)}
          </TabsContent>
          <TabsContent value="dismissed" className="space-y-2 mt-3">
            {allDismissed.map(r => <RecCard key={r.id} rec={r} />)}
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}
