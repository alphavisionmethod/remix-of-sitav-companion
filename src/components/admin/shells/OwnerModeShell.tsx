import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Shield, ArrowLeft, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface OwnerModeShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function OwnerModeShell({ children, title, subtitle }: OwnerModeShellProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Safe Mode Banner */}
      <div className="bg-primary/5 border-b border-primary/20 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Owner Safe Mode</p>
            <p className="text-[10px] text-muted-foreground">Simplified controls · Plain-English labels · Protective defaults active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20">Safe Mode Active</Badge>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-3 w-3 mr-1" /> Back
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 max-w-5xl mx-auto space-y-6">
        {title && (
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
