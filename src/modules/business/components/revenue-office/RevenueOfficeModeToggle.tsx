import { GraduationCap, Zap } from "lucide-react";
import { useRevenueOfficeMode } from "@/contexts/RevenueOfficeModeContext";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function RevenueOfficeModeToggle() {
  const { mode, toggleMode } = useRevenueOfficeMode();
  const isBeginner = mode === "beginner";

  return (
    <motion.button
      onClick={toggleMode}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-card/50 hover:bg-muted/30 transition-all text-sm"
      whileTap={{ scale: 0.97 }}
    >
      <div className={`relative flex items-center w-10 h-5 rounded-full transition-colors ${isBeginner ? "bg-primary/20" : "bg-muted/40"}`}>
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-primary shadow-sm"
          animate={{ x: isBeginner ? 2 : 22 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
      <div className="flex items-center gap-1.5">
        {isBeginner ? (
          <>
            <GraduationCap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Simple</span>
          </>
        ) : (
          <>
            <Zap className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Advanced</span>
          </>
        )}
      </div>
    </motion.button>
  );
}
