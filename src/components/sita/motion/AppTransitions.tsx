// ═══════════════════════════════════════════════════════════════
// SITA OS — Premium Motion Layer
// App-launch, list stagger, skeleton reveal, card elevation
// ═══════════════════════════════════════════════════════════════

import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

/* ── App Launch Transition ── */
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

/* ── Module Transition ── */
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

/* ── List Stagger ── */
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

/* ── Card Hover Elevation ── */
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

/* ── Skeleton Reveal ── */
export function SkeletonReveal({ isLoaded, skeleton, children }: { isLoaded: boolean; skeleton: ReactNode; children: ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
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
