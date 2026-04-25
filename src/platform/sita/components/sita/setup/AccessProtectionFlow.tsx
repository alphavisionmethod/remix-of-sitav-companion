import { Shield, Key, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessProtectionFlowProps {
  accessMethod: string;
  onMethodChange: (method: string) => void;
  children?: React.ReactNode;
}

const METHODS = [
  { key: "password", icon: Key, title: "Password", desc: "Secure password with optional two-factor" },
  { key: "biometric", icon: Fingerprint, title: "Biometric", desc: "Face or fingerprint recognition" },
  { key: "passkey", icon: Shield, title: "Passkey", desc: "Hardware-backed passwordless authentication" },
];

export function AccessProtectionFlow({ accessMethod, onMethodChange, children }: AccessProtectionFlowProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {METHODS.map(m => (
          <button key={m.key} onClick={() => onMethodChange(m.key)}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
              accessMethod === m.key ? "border-primary/50 bg-primary/8" : "border-border bg-secondary/20 hover:border-primary/20"
            )}>
            <m.icon className={cn("h-4 w-4", accessMethod === m.key ? "text-primary" : "text-muted-foreground")} />
            <div>
              <p className="text-sm font-semibold text-foreground">{m.title}</p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
