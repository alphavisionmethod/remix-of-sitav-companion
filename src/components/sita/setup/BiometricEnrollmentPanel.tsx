import { motion } from "framer-motion";
import { Fingerprint, Scan, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BiometricEnrollmentPanelProps {
  enrolled: boolean;
  onEnroll: () => void;
  type?: "fingerprint" | "face";
}

export function BiometricEnrollmentPanel({ enrolled, onEnroll, type = "fingerprint" }: BiometricEnrollmentPanelProps) {
  const reduced = useReducedMotion();
  const Icon = type === "face" ? Scan : Fingerprint;

  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-5 text-center">
      <motion.div
        animate={enrolled ? {} : reduced ? {} : { scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: enrolled ? 0 : Infinity }}
        className="inline-flex"
      >
        <div className={cn(
          "h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors",
          enrolled ? "bg-trust-safe/15" : "bg-primary/15"
        )}>
          {enrolled ? <Check className="h-8 w-8 text-trust-safe" /> : <Icon className="h-8 w-8 text-primary" />}
        </div>
      </motion.div>
      <p className="text-sm font-semibold text-foreground">
        {enrolled ? "Biometric enrolled" : `Set up ${type === "face" ? "Face ID" : "Fingerprint"}`}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {enrolled ? "Your biometric is securely stored on-device" : "Quick, secure access to SITA"}
      </p>
      {!enrolled && (
        <button onClick={onEnroll}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Enroll Now
        </button>
      )}
    </div>
  );
}
