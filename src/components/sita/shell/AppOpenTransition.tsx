import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AppOpenTransitionProps {
  children: ReactNode;
}

export function AppOpenTransition({ children }: AppOpenTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -4 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
