import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EncryptionDomain { name: string; atRest: boolean; inTransit: boolean; classification: "public" | "internal" | "confidential" | "restricted"; coverage: number }
interface Props { domains: EncryptionDomain[]; className?: string }

export function EncryptionCoverageMap({ domains, className }: Props) {
  const avgCoverage = Math.round(domains.reduce((s, d) => s + d.coverage, 0) / domains.length);
  const classColors = { public: "text-muted-foreground", internal: "text-blue-400", confidential: "text-amber-400", restricted: "text-red-400" };

  return (
    <Card className={cn("bg-card/50 border-border/50", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2"><Lock className="w-4 h-4 text-primary" />Encryption Coverage ({avgCoverage}%)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {domains.map(d => (
          <div key={d.name} className="flex items-center justify-between p-2 bg-muted/20 rounded">
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-muted-foreground" />
              <div>
                <p className="text-[10px] font-medium text-foreground">{d.name}</p>
                <div className="flex items-center gap-1.5 text-[9px]">
                  <span className="text-muted-foreground">At-rest:</span>{d.atRest ? <CheckCircle className="w-2 h-2 text-green-400" /> : <XCircle className="w-2 h-2 text-red-400" />}
                  <span className="text-muted-foreground ml-1">Transit:</span>{d.inTransit ? <CheckCircle className="w-2 h-2 text-green-400" /> : <XCircle className="w-2 h-2 text-red-400" />}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-[8px]", classColors[d.classification])}>{d.classification}</Badge>
              <Progress value={d.coverage} className="w-12 h-1.5" />
              <span className="text-[9px] text-muted-foreground">{d.coverage}%</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
