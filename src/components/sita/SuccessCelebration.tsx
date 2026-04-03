import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Sparkles } from "lucide-react";

interface SuccessCelebrationProps {
  show: boolean;
  message?: string;
  onDone?: () => void;
}

export const SuccessCelebration = ({ show, message = "Done!", onDone }: SuccessCelebrationProps) => {
  useEffect(() => {
    if (show) {
      const t = setTimeout(() => onDone?.(), 2000);
      return () => clearTimeout(t);
    }
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, times: [0, 0.6, 1] }}
            className="flex flex-col items-center gap-3"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                className="absolute -inset-4"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                    transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
                    className="absolute h-2 w-2 rounded-full bg-accent"
                    style={{
                      top: `${50 + 45 * Math.sin((i * 2 * Math.PI) / 6)}%`,
                      left: `${50 + 45 * Math.cos((i * 2 * Math.PI) / 6)}%`,
                    }}
                  />
                ))}
              </motion.div>
              <div className="rounded-full bg-trust-safe/20 p-5">
                <CheckCircle className="h-12 w-12 text-trust-safe" />
              </div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg font-bold text-foreground bg-card/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-border"
            >
              <Sparkles className="h-4 w-4 inline mr-2 text-accent" />
              {message}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
