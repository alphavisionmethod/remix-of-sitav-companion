import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/sita/PageShell";
const MOCK_WEEK = {
  focus: "Revenue pipeline and household logistics",
  highlights: [
    { label: "3 deals expected to close", domain: "business", status: "on-track" },
    { label: "Quarterly review prep needed", domain: "business", status: "needs-attention" },
    { label: "Family dentist appointments", domain: "concierge", status: "scheduled" },
    { label: "Insurance renewal due Friday", domain: "finance", status: "urgent" },
  ],
  advisorInsights: [
    "Revenue Advisor: Two proposals need follow-up by Wednesday",
    "Finance Advisor: Cash position strong — safe to proceed with equipment purchase",
    "Household Advisor: Grocery order queued for Monday delivery",
  ],
  priorities: [
    "Close pending deals before Thursday",
    "Review and approve quarterly budget",
    "Complete insurance renewal",
    "Prepare family weekend logistics",
  ],
};

const statusIcon = (status: string) => {
  
  if (status === "urgent") return <AlertTriangle className="h-4 w-4 text-destructive" />;
  if (status === "needs-attention") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
};

const WeeklyBoardroom = () => {
  return (
    <PageShell width="standard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Weekly Boardroom</h1>
          <p className="text-muted-foreground mt-1">Your week at a glance — across all domains</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Calendar className="h-3 w-3" />
          This Week
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Week Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground font-medium">{MOCK_WEEK.focus}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Key Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_WEEK.highlights.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {statusIcon(item.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.domain}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Advisor Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_WEEK.advisorInsights.map((insight, i) => (
              <p key={i} className="text-sm text-muted-foreground">{insight}</p>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">This Week's Priorities</CardTitle>
          <CardDescription>Ranked by urgency and domain weight</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {MOCK_WEEK.priorities.map((priority, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm">{priority}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </PageShell>
  );
};

export default WeeklyBoardroom;
