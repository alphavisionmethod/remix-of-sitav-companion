// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain-Aware Motion System
// App-launch ceremonies, domain-paced transitions, skeleton morph
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ReactNode, createContext, useContext } from "react";
import { DOMAIN_MOTION, getDomainSpring } from "@/platform/design-system/sita-design-tokens";
import type { DomainId } from "@/components/sita/shell/DomainAppShell";

// ── Domain Context for Motion ────────────────────────────────

const DomainMotionContext = createContext<DomainId>("business");

export function DomainMotionProvider({ domain, children }: { domain: DomainId; children: ReactNode }) {
  return <DomainMotionContext.Provider value={domain}>{children}</DomainMotionContext.Provider>;
}

export function useDomainMotion() {
  return useContext(DomainMotionContext);
}

// ── App Open Ceremony ────────────────────────────────────────
// Cinematic app launch: scale up from center with domain-specific pacing

export function AppOpenCeremony({ children, domain }: { children: ReactNode; domain?: DomainId }) {
  const d = domain || "business";
  const spring = getDomainSpring(d);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...spring, opacity: { duration: DOMAIN_MOTION[d].enterDuration / 1000 } }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

// ── App Launch Transition (Legacy compat) ────────────────────

export function AppLaunchTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 28, mass: 0.7 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

// ── Domain Transition ────────────────────────────────────────
// Generic wrapper that reads domain from context

export function DomainTransition({ children, className }: { children: ReactNode; className?: string }) {
  const domain = useDomainMotion();
  const spring = getDomainSpring(domain);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Module Slide ─────────────────────────────────────────────
// Horizontal slide between modules within an app

export function ModuleSlide({ children, moduleKey, domain }: { children: ReactNode; moduleKey: string; domain?: DomainId }) {
  const d = domain || useDomainMotion();
  const config = DOMAIN_MOTION[d];

  return (
    <motion.div
      key={moduleKey}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{
        type: "spring",
        stiffness: config.stiffness,
        damping: config.damping,
        mass: config.mass,
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Module Transition (Legacy compat) ────────────────────────

export function ModuleTransition({ children, moduleKey }: { children: ReactNode; moduleKey: string }) {
  return (
    <motion.div
      key={moduleKey}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ── List Reveal (Domain-paced stagger) ───────────────────────

export function ListReveal({ children, className, domain }: { children: ReactNode; className?: string; domain?: DomainId }) {
  const d = domain || useDomainMotion();
  const config = DOMAIN_MOTION[d];

  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: config.staggerDelay / 1000 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}

export function ListRevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

// ── Legacy List Stagger (compat) ─────────────────────────────

const listContainerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export function ListStagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={listContainerVariants} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}

export function ListStaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={listItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

// ── Card Entrance ────────────────────────────────────────────

export function CardEntrance({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const domain = useDomainMotion();
  const spring = getDomainSpring(domain);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring, delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Card Hover Elevation ─────────────────────────────────────

export function CardHoverElevation({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 24px -8px hsl(0 0% 0% / 0.25)" }}
      transition={{ duration: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Drawer Reveal ────────────────────────────────────────────

export function DrawerReveal({ children, isOpen, className, domain }: { children: ReactNode; isOpen: boolean; className?: string; domain?: DomainId }) {
  const d = domain || useDomainMotion();
  const spring = getDomainSpring(d);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={spring}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Skeleton Morph ───────────────────────────────────────────
// Skeleton shapes morph into real content (not just crossfade)

export function SkeletonMorph({ isLoaded, skeleton, children }: { isLoaded: boolean; skeleton: ReactNode; children: ReactNode }) {
  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!isLoaded ? (
          <motion.div
            key="skeleton"
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {skeleton}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Legacy Skeleton Reveal (compat) ──────────────────────────

export function SkeletonReveal({ isLoaded, skeleton, children }: { isLoaded: boolean; skeleton: ReactNode; children: ReactNode }) {
  return (
    <motion.div initial={false} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {isLoaded ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
          {children}
        </motion.div>
      ) : (
        skeleton
      )}
    </motion.div>
  );
}

// ── Boardroom Cinematic Entry ────────────────────────────────

export function BoardroomCinematic({ children, domain }: { children: ReactNode; domain?: DomainId }) {
  const d = domain || "business";

  const variants: Record<string, { initial: object; animate: object; transition: object }> = {
    business: {
      initial: { opacity: 0, scale: 1.02, clipPath: "inset(50% 0% 50% 0%)" },
      animate: { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" },
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
    finance: {
      initial: { opacity: 0, filter: "blur(8px)" },
      animate: { opacity: 1, filter: "blur(0px)" },
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
    concierge: {
      initial: { opacity: 0, scale: 0.96, borderRadius: "32px" },
      animate: { opacity: 1, scale: 1, borderRadius: "16px" },
      transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
    },
    files: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, ease: "easeOut" },
    },
    trust: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const v = variants[d] || variants.business;

  return (
    <motion.div
      initial={v.initial as any}
      animate={v.animate as any}
      transition={v.transition as any}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
