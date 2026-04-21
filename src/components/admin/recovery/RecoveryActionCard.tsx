import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createRecoveryJob } from "@/lib/recovery-ops/recovery-job-service";
import type { RecoveryActionType } from "@/lib/recovery-ops/types";
import { Play, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  actionType: RecoveryActionType;
  label: string;
  description: string;
  icon: React.ReactNode;
  riskLevel: "low" | "medium" | "high";
  operatorId: string;
  canExecute: boolean;
}

const riskColors: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-destructive",
};

export function RecoveryActionCard({ actionType, label, description, icon, riskLevel, operatorId, canExecute }: Props) {
  const { toast } = useToast();
  const [isDryRun, setIsDryRun] = useState(true);

  const execute = () => {
    if (!canExecute) {
      toast({ title: "Permission denied", description: "admin.recovery permission required", variant: "destructive" });
      return;
    }
    createRecoveryJob(actionType, `${label}${isDryRun ? " (dry-run)" : ""}`, operatorId, isDryRun);
    toast({
      title: isDryRun ? "Dry-run started" : "Action started",
      description: `${label} is now ${isDryRun ? "simulating" : "executing"}`,
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-foreground">{label}</h3>
              <span className={`text-[10px] ${riskColors[riskLevel]}`}>● {riskLevel} risk</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch id={`dry-${actionType}`} checked={isDryRun} onCheckedChange={setIsDryRun} />
            <Label htmlFor={`dry-${actionType}`} className="text-xs text-muted-foreground cursor-pointer">
              Dry-run mode {isDryRun ? "(safe preview)" : "(LIVE execution)"}
            </Label>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant={isDryRun ? "outline" : "destructive"} className="text-xs" disabled={!canExecute}>
                {isDryRun ? <Play className="h-3 w-3 mr-1" /> : <ShieldAlert className="h-3 w-3 mr-1" />}
                {isDryRun ? "Preview" : "Execute"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isDryRun ? "Run Dry-Run?" : "⚠️ Execute Recovery Action?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isDryRun
                    ? `This will simulate "${label}" without making any changes. You can review the results before executing for real.`
                    : `This will execute "${label}" for real. This action has ${riskLevel} risk and may modify production data. Are you sure?`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={execute}>
                  {isDryRun ? "Start Dry-Run" : "Execute Now"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}