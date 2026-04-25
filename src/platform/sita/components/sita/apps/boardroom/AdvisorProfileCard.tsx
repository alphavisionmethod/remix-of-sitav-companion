import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MessageCircle, FileCheck } from "lucide-react";
import { ConfidenceBar } from "@/platform/sita/components/sita/primitives";
import type { AdvisorRole } from "@/domains/advisors/topology";
import { TalkingAvatar } from "./TalkingAvatar";

interface AdvisorProfileCardProps {
  advisor: AdvisorRole;
  recommendation?: string;
  confidence?: number;
  evidenceCount?: number;
  status?: "active" | "thinking" | "idle" | "speaking";
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Sound wave bars for speaking state
function SpeakingWaves({ color }: { color: string }) {
  return (
    <div className="flex items-end gap-[2px] h-2.5 ml-1">
      {[0.5, 1, 0.6].map((s, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full"
          style={{ background: color }}
          animate={{ height: [3, 10 * s, 3] }}
          transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function AdvisorProfileCard({
  advisor,
  recommendation,
  confidence = 50,
  evidenceCount = 0,
  status = "active",
  selected = false,
  onClick,
  size = "md",
  className,
}: AdvisorProfileCardProps) {
  const avatarPx = { sm: 56, md: 80, lg: 96 };
  const ringSizes = { sm: "w-16 h-16", md: "w-[88px] h-[88px]", lg: "w-[104px] h-[104px]" };

  const isSpeaking = status === "speaking";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "rounded-2xl border p-4 text-left transition-all duration-300 relative group backdrop-blur-md overflow-hidden",
        selected
          ? "border-[hsl(280_50%_55%/0.35)] bg-[hsl(280_40%_50%/0.1)] shadow-[0_0_30px_hsl(280_50%_50%/0.1)]"
          : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] hover:bg-[hsl(0_0%_100%/0.05)] hover:border-[hsl(0_0%_100%/0.14)]",
        className,
      )}
    >
      {/* Shimmer/reflection effect on hover */}
      <motion.div
        className="absolute inset-0 -z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `linear-gradient(105deg, transparent 40%, ${advisor.accentColor}08 45%, ${advisor.accentColor}15 50%, ${advisor.accentColor}08 55%, transparent 60%)`,
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
        style={{
          background: `radial-gradient(ellipse at center, ${advisor.accentColor}12, transparent 70%)`,
        }}
      />

      {/* Avatar with glowing ring */}
      <div className="flex flex-col items-center mb-3">
        <div className="relative">
          {/* Glowing ring */}
          <div
            className={cn(
              "rounded-full flex items-center justify-center transition-all duration-500",
              ringSizes[size],
            )}
            style={{
              background: `linear-gradient(135deg, ${advisor.accentColor}, ${advisor.accentColor}55)`,
              padding: "3px",
              boxShadow: isSpeaking || selected
                ? `0 0 28px ${advisor.accentColor}45, 0 0 56px ${advisor.accentColor}18`
                : `0 0 10px ${advisor.accentColor}18`,
            }}
          >
            {/* Talking Avatar */}
            <TalkingAvatar
              speaking={isSpeaking}
              avatarUrl={advisor.avatarUrl}
              accentColor={advisor.accentColor}
              size={avatarPx[size]}
              name={advisor.name}
              emoji={advisor.emoji}
            />
          </div>

          {/* Speaking pulse ring */}
          {isSpeaking && (
            <motion.div
              className="absolute inset-[-4px] rounded-full border-2 pointer-events-none"
              style={{ borderColor: `${advisor.accentColor}60` }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            />
          )}

          {/* Status dot */}
          <div
            className={cn(
              "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[hsl(220_18%_8%)]",
              status === "active" && "bg-[hsl(152_55%_48%)]",
              status === "speaking" && "bg-[hsl(152_55%_48%)]",
              status === "thinking" && "bg-[hsl(280_50%_55%)] animate-pulse",
              status === "idle" && "bg-[hsl(0_0%_100%/0.25)]",
            )}
          />
        </div>
      </div>

      {/* Name and role */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-1">
          <p className="text-[12px] font-bold text-[hsl(0_0%_100%/0.88)] leading-tight truncate">
            {advisor.name}
          </p>
          {isSpeaking && <SpeakingWaves color={advisor.accentColor} />}
        </div>
        <p className="text-[10px] font-semibold mt-0.5 truncate" style={{ color: advisor.accentColor }}>
          {advisor.role}
        </p>
        <p className="text-[9px] text-[hsl(0_0%_100%/0.3)] mt-0.5 line-clamp-1">
          {advisor.specialty}
        </p>
      </div>

      {/* Recommendation bubble */}
      {recommendation && (
        <div className="relative rounded-lg bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] p-2.5 mb-2.5">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[hsl(0_0%_100%/0.03)] border-l border-t border-[hsl(0_0%_100%/0.06)]" />
          <div className="flex items-start gap-1.5">
            <MessageCircle size={9} className="text-[hsl(280_50%_60%/0.5)] mt-0.5 shrink-0" />
            <p className="text-[10px] text-[hsl(0_0%_100%/0.6)] leading-relaxed italic line-clamp-3">
              "{recommendation}"
            </p>
          </div>
        </div>
      )}

      {/* Confidence + evidence */}
      <div className="space-y-1.5">
        <ConfidenceBar value={confidence} size="sm" />
        {evidenceCount > 0 && (
          <div className="flex items-center justify-center gap-1 text-[9px] text-[hsl(0_0%_100%/0.25)]">
            <FileCheck size={8} /> {evidenceCount} sources cited
          </div>
        )}
      </div>
    </motion.button>
  );
}
