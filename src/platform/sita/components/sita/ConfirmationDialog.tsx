// ═══════════════════════════════════════════════════════════════
// SITA OS — Confirmation Dialog
// Trust-aware destructive action confirmation with optional typed confirm
// ═══════════════════════════════════════════════════════════════

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConfirmationState } from "@/hooks/use-confirmation";

const VARIANT_CONFIG = {
  destructive: { icon: AlertTriangle, iconColor: "text-destructive", bgColor: "bg-destructive/10" },
  warning: { icon: Shield, iconColor: "text-amber-400", bgColor: "bg-amber-500/10" },
  default: { icon: Info, iconColor: "text-primary", bgColor: "bg-primary/10" },
};

export function ConfirmationDialog({ state }: { state: ConfirmationState }) {
  const variant = state.variant ?? "default";
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  const isConfirmDisabled =
    state.requireTypedConfirmation != null &&
    state.typedValue !== state.requireTypedConfirmation;

  return (
    <AlertDialog open={state.isOpen} onOpenChange={(open) => !open && state.onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("rounded-full p-2", config.bgColor)}>
              <Icon className={cn("h-5 w-5", config.iconColor)} />
            </div>
            <AlertDialogTitle className="text-base">{state.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
            {state.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {state.requireTypedConfirmation && (
          <div className="space-y-2 py-2">
            <p className="text-xs text-muted-foreground">
              Type <span className="font-mono font-bold text-foreground">{state.requireTypedConfirmation}</span> to confirm
            </p>
            <Input
              value={state.typedValue}
              onChange={(e) => state.setTypedValue(e.target.value)}
              placeholder={state.requireTypedConfirmation}
              className="font-mono text-sm"
              autoFocus
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={state.onCancel}>
            {state.cancelLabel ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={state.onConfirm}
            disabled={isConfirmDisabled}
            className={cn(
              variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {state.confirmLabel ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
