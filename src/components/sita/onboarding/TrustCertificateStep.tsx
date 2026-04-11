import { motion } from "framer-motion";
import { Shield, Brain, Globe, Lock, Check, ChevronRight } from "lucide-react";
import logo from "@/assets/logo.webp";

interface TrustCertificateStepProps {
  displayName: string;
  trustLevel: string;
  enabledDomains: string[];
  rituals: string[];
  onFinish: () => void;
}

export function TrustCertificateStep({ displayName, trustLevel, enabledDomains, rituals, onFinish }: TrustCertificateStepProps) {
  const trustLabels: Record<string, string> = { open: "Open", balanced: "Balanced", guarded: "Guarded" };
  const advisorCount = enabledDomains.length + 1;

  const stats = [
    { icon: Shield, label: "Trust Mode", value: trustLabels[trustLevel] || trustLevel },
    { icon: Brain, label: "Advisors", value: `${advisorCount} active` },
    { icon: Globe, label: "Domains", value: `${enabledDomains.length} enabled` },
    { icon: Lock, label: "Proof", value: "Active" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl mx-auto text-center space-y-8"
    >
      {/* Seal */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
        <div className="relative mx-auto w-24 h-24">
          <img src={logo} loading="lazy" alt="SITA" className="h-24 w-24 rounded-3xl shadow-2xl shadow-primary/30" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--trust-safe))] shadow-lg"
          >
            <Check className="h-5 w-5 text-primary-foreground" />
          </motion.div>
        </div>
      </motion.div>

      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--trust-safe))] mb-2"
        >
          Environment Ready
        </motion.p>
        <h1 className="font-display text-3xl font-bold gradient-sita-text">
          {displayName ? `Welcome, ${displayName}` : "SITA OS Ready"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your operating system is configured and all systems are online.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="rounded-xl border border-border bg-card p-3 text-center"
          >
            <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-xs font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {rituals.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-muted-foreground"
        >
          {rituals.length} ritual{rituals.length !== 1 ? "s" : ""} configured — your first review is being prepared
        </motion.p>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        onClick={onFinish}
        className="w-full max-w-sm mx-auto rounded-xl bg-gradient-to-r from-primary to-primary/80 py-3.5 text-sm font-semibold text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
      >
        Enter SITA OS <ChevronRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}
