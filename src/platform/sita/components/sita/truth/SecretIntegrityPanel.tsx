import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Key, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SecretEntry { name: string; environment: string; rotatedAt: string; maxAgeDays: number; required: boolean; present: boolean }
interface Props { secrets: SecretEntry[]; className?: string }

export function SecretIntegrityPanel({ secrets, className }: Props) {
  return (
    <Card className={cn("bg-card/50 border-border/50", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2"><Key className="w-4 h-4 text-primary" />Secret Integrity ({secrets.filter(s => s.present).length}/{secrets.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {secrets.map(s => {
          const ageDays = Math.round((Date.now() - new Date(s.rotatedAt).getTime()) / 86400000);
          const pct = (ageDays / s.maxAgeDays) * 100;
          return (
            <div key={s.name} className="flex items-center justify-between p-2 bg-muted/20 rounded">
              <div className="flex items-center gap-2">
                {s.present ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertTriangle className="w-3 h-3 text-red-400" />}
                <div>
                  <p className="text-[10px] font-mono text-foreground">{s.name}</p>
                  <p className="text-[9px] text-muted-foreground">{s.environment} • {ageDays}d old</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={Math.max(0, 100 - pct)} className="w-12 h-1.5" />
                <Badge variant={pct > 80 ? "destructive" : "default"} className="text-[8px]">{Math.max(0, Math.round(s.maxAgeDays - ageDays))}d</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
