import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Key, Loader2, Sparkles } from "lucide-react";

type Status = "real" | "blocked-on-secret" | "in-progress" | "deferred";

interface ReadinessItem {
  id: string;
  area: string;
  title: string;
  status: Status;
  evidence: string[];
  blocker?: string;
  activation?: string;
}

interface ReadinessManifest {
  generatedAt: string;
  totalItems: number;
  summary: Record<Status, number>;
  items: ReadinessItem[];
}

const statusMeta: Record<Status, { label: string; tone: "default" | "secondary" | "destructive" | "outline"; icon: typeof Check }> = {
  "real":               { label: "Real",               tone: "default",     icon: Check },
  "blocked-on-secret":  { label: "Awaiting secret",    tone: "secondary",   icon: Key },
  "in-progress":        { label: "In progress",        tone: "outline",     icon: Loader2 },
  "deferred":           { label: "Deferred",           tone: "outline",     icon: Loader2 },
};

export default function PlatformReadinessScorecard() {
  const [data, setData] = useState<ReadinessManifest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/generated/platform-readiness-manifest.json", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then((j) => { if (!cancelled) setData(j); })
      .catch((e) => { if (!cancelled) setError(String(e)); });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>Manifest not generated yet.</p>
            <p className="text-xs mt-2">Run <code className="px-1 py-0.5 bg-muted rounded">npx tsx scripts/architecture/generate-platform-readiness.ts</code> to produce it.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="container mx-auto p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading readiness manifest…
      </div>
    );
  }

  const realPct = Math.round((data.summary.real / data.totalItems) * 100);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            Platform Readiness
          </h1>
          <p className="text-muted-foreground">
            Live aggregate of the 15-point platform maturity manifest. Generated{" "}
            {new Date(data.generatedAt).toLocaleString()}.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-4xl font-bold">{realPct}%</div>
          <p className="text-xs text-muted-foreground">items shipped real</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(statusMeta) as Status[]).map((s) => {
          const Icon = statusMeta[s].icon;
          return (
            <Card key={s}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-md bg-muted p-2">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{data.summary[s]}</div>
                  <div className="text-xs text-muted-foreground">{statusMeta[s].label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({data.totalItems})</TabsTrigger>
          <TabsTrigger value="real">Real ({data.summary.real})</TabsTrigger>
          <TabsTrigger value="awaiting">Awaiting ({data.summary["blocked-on-secret"] + data.summary["in-progress"] + data.summary.deferred})</TabsTrigger>
        </TabsList>

        {(["all", "real", "awaiting"] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[560px]">
                  <div className="divide-y">
                    {data.items
                      .filter((i) => tab === "all" || (tab === "real" ? i.status === "real" : i.status !== "real"))
                      .map((i) => {
                        const Icon = statusMeta[i.status].icon;
                        return (
                          <div key={i.id} className="p-4 hover:bg-accent/30 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant={statusMeta[i.status].tone}>
                                    <Icon className="h-3 w-3 mr-1" /> {statusMeta[i.status].label}
                                  </Badge>
                                  <span className="font-mono text-xs text-muted-foreground">{i.id}</span>
                                  <span className="font-medium">{i.area}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{i.title}</p>
                                {i.blocker && (
                                  <p className="text-xs mt-2 rounded bg-warning/10 text-warning-foreground px-2 py-1">
                                    🔑 {i.blocker}
                                  </p>
                                )}
                                {i.activation && (
                                  <p className="text-xs mt-1 text-muted-foreground">
                                    <strong>Activation:</strong> {i.activation}
                                  </p>
                                )}
                                <details className="mt-2">
                                  <summary className="text-xs text-muted-foreground cursor-pointer">
                                    Evidence ({i.evidence.length} files)
                                  </summary>
                                  <ul className="mt-1 space-y-0.5 text-xs font-mono">
                                    {i.evidence.map((e) => (
                                      <li key={e} className="text-muted-foreground">{e}</li>
                                    ))}
                                  </ul>
                                </details>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How this manifest is built</CardTitle>
          <CardDescription>
            Each row is verified against real evidence in the codebase via{" "}
            <code className="px-1 py-0.5 bg-muted rounded text-xs">scripts/architecture/generate-platform-readiness.ts</code>.
            "Real" status means every listed evidence file exists and the integration is wired end-to-end.
            "Awaiting secret" means the code is shipped but a credential needs to be added to activate.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
