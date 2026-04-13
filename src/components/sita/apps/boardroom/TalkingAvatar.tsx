import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

interface TalkingAvatarProps {
  speaking: boolean;
  avatarUrl?: string;
  accentColor: string;
  size?: number;
  name: string;
  emoji?: string;
  className?: string;
}

// Circular waveform bars around avatar
function WaveformRing({ color, size }: { color: string; size: number }) {
  const barCount = 12;
  const radius = size / 2 + 6;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={size + 24}
      height={size + 24}
      style={{ left: -12, top: -12 }}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
        const cx = (size + 24) / 2;
        const cy = (size + 24) / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        return (
          <motion.rect
            key={i}
            x={x - 1.5}
            y={y - 2}
            width={3}
            height={4}
            rx={1.5}
            fill={color}
            transform={`rotate(${(i / barCount) * 360}, ${x}, ${y})`}
            animate={{
              height: [4, 10 + Math.random() * 6, 4, 8 + Math.random() * 4, 4],
              y: [y - 2, y - 5 - Math.random() * 3, y - 2, y - 4 - Math.random() * 2, y - 2],
              opacity: [0.5, 0.9, 0.5, 0.8, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 0.6 + Math.random() * 0.4,
              delay: i * 0.05,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </svg>
  );
}

// Mouth overlay SVG
function MouthOverlay({ size, speaking }: { size: number; speaking: boolean }) {
  const cx = size / 2;
  const cy = size * 0.72;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      width={size}
      height={size}
    >
      <motion.ellipse
        cx={cx}
        cy={cy}
        rx={speaking ? 6 : 4}
        fill="rgba(0,0,0,0.45)"
        animate={
          speaking
            ? { ry: [2, 7, 3, 9, 2, 5, 2], rx: [5, 7, 5, 8, 6, 5, 5] }
            : { ry: 1.5, rx: 4 }
        }
        transition={
          speaking
            ? { repeat: Infinity, duration: 0.5, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      />
    </svg>
  );
}

export function TalkingAvatar({
  speaking,
  avatarUrl,
  accentColor,
  size = 52,
  name,
  emoji = "🤖",
  className,
}: TalkingAvatarProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      // Breathing idle animation
      animate={
        speaking
          ? {
              scale: [1, 1.02, 1],
              x: [0, 1.5, -1, 0.5, 0],
              y: [0, -1, 0.5, -0.5, 0],
            }
          : { scale: [1, 1.015, 1], x: 0, y: 0 }
      }
      transition={
        speaking
          ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
          : { repeat: Infinity, duration: 4, ease: "easeInOut" }
      }
    >
      {/* Waveform ring — only when speaking */}
      {speaking && <WaveformRing color={accentColor} size={size} />}

      {/* Portrait */}
      <div
        className="rounded-full overflow-hidden relative"
        style={{ width: size, height: size }}
      >
        {!imgError && avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-bold"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
            }}
          >
            <span style={{ fontSize: size * 0.4 }}>{emoji}</span>
          </div>
        )}

        {/* Mouth animation overlay */}
        <MouthOverlay size={size} speaking={speaking} />
      </div>

      {/* Glow beneath when speaking */}
      {speaking && (
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full blur-lg pointer-events-none -z-10"
          style={{
            width: size * 0.7,
            height: size * 0.25,
            background: accentColor,
          }}
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}
