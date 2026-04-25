import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { sanitizeAvatarUrl } from "@/lib/advisors/avatar-url-validation";
import { isAvatarDebugActive, BROKEN_AVATAR_URL } from "@/lib/advisors/avatar-debug";

interface TalkingAvatarProps {
  speaking: boolean;
  avatarUrl?: string;
  accentColor: string;
  size?: number;
  name: string;
  emoji?: string;
  className?: string;
}

// Orbiting particles
function ParticleField({ color, size, active }: { color: string; size: number; active: boolean }) {
  const particles = [
    { radius: size / 2 + 14, speed: 8, delay: 0, dotSize: 2.5 },
    { radius: size / 2 + 20, speed: 12, delay: 1.5, dotSize: 2 },
    { radius: size / 2 + 10, speed: 6, delay: 3, dotSize: 3 },
    { radius: size / 2 + 18, speed: 10, delay: 0.8, dotSize: 1.5 },
    { radius: size / 2 + 24, speed: 14, delay: 2.2, dotSize: 2 },
  ];

  if (!active) return null;

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.dotSize,
            height: p.dotSize,
            background: color,
            left: "50%",
            top: "50%",
            marginLeft: -p.dotSize / 2,
            marginTop: -p.dotSize / 2,
            boxShadow: `0 0 6px ${color}`,
          }}
          animate={{
            x: [
              Math.cos(0) * p.radius,
              Math.cos(Math.PI * 0.5) * p.radius,
              Math.cos(Math.PI) * p.radius,
              Math.cos(Math.PI * 1.5) * p.radius,
              Math.cos(Math.PI * 2) * p.radius,
            ],
            y: [
              Math.sin(0) * p.radius,
              Math.sin(Math.PI * 0.5) * p.radius,
              Math.sin(Math.PI) * p.radius,
              Math.sin(Math.PI * 1.5) * p.radius,
              Math.sin(Math.PI * 2) * p.radius,
            ],
            opacity: [0.3, 0.8, 0.4, 0.9, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: p.speed,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
}

// Double-ring sonar aura
function SonarRings({ color, size, active }: { color: string; size: number; active: boolean }) {
  if (!active) return null;

  return (
    <>
      {/* Fast inner ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 16,
          height: size + 16,
          left: -8,
          top: -8,
          border: `2px solid ${color}`,
          boxShadow: `0 0 20px ${color}40, inset 0 0 20px ${color}15`,
        }}
        animate={{
          scale: [1, 1.18, 1],
          opacity: [0.6, 0.2, 0.6],
        }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      />
      {/* Slow outer ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 32,
          height: size + 32,
          left: -16,
          top: -16,
          border: `1.5px solid ${color}60`,
          boxShadow: `0 0 30px ${color}20`,
        }}
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.3, 0.08, 0.3],
        }}
        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.4 }}
      />
    </>
  );
}

// Ripple burst on speak start
function RippleBurst({ color, size, trigger }: { color: string; size: number; trigger: boolean }) {
  const [show, setShow] = useState(false);
  const prevSpeaking = useRef(false);

  useEffect(() => {
    if (trigger && !prevSpeaking.current) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 800);
      return () => clearTimeout(t);
    }
    prevSpeaking.current = trigger;
  }, [trigger]);

  if (!show) return null;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: 0,
        top: 0,
        border: `2px solid ${color}`,
        boxShadow: `0 0 24px ${color}60`,
      }}
      initial={{ scale: 1, opacity: 0.9 }}
      animate={{ scale: 1.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    />
  );
}

// Rotating gradient border
function RotatingBorder({ color, size, active }: { color: string; size: number; active: boolean }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size + 6,
        height: size + 6,
        left: -3,
        top: -3,
        background: active
          ? `conic-gradient(from 0deg, ${color}, transparent 30%, ${color}80, transparent 60%, ${color}50, transparent 90%, ${color})`
          : `conic-gradient(from 0deg, ${color}30, transparent 50%, ${color}20)`,
        WebkitMask: `radial-gradient(circle, transparent ${size / 2 - 1}px, black ${size / 2}px)`,
        mask: `radial-gradient(circle, transparent ${size / 2 - 1}px, black ${size / 2}px)`,
      }}
      animate={{ rotate: active ? 360 : 0 }}
      transition={active ? { repeat: Infinity, duration: 3, ease: "linear" } : { duration: 0 }}
    />
  );
}

// Holographic shimmer
function HolographicShimmer({ size, active }: { size: number; active: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full pointer-events-none z-[5] overflow-hidden"
      style={{
        width: size,
        height: size,
        background: "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.06), transparent 40%, rgba(255,255,255,0.04), transparent 80%)",
        mixBlendMode: "overlay",
      }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: active ? 6 : 16, ease: "linear" }}
    />
  );
}

// Eye blink overlay
function EyeBlinks({ size }: { size: number }) {
  const eyeY = size * 0.42;
  const eyeSpacing = size * 0.14;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-[8]"
      width={size}
      height={size}
    >
      {[-1, 1].map((side) => (
        <motion.ellipse
          key={side}
          cx={size / 2 + side * eyeSpacing}
          cy={eyeY}
          rx={1.8}
          ry={1.8}
          fill="rgba(255,255,255,0.35)"
          animate={{
            scaleY: [1, 1, 0.05, 1, 1, 1, 1, 0.05, 1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            times: [0, 0.42, 0.45, 0.48, 0.7, 0.85, 0.88, 0.9, 0.93, 1],
            ease: "easeInOut",
          }}
          style={{ transformOrigin: `${size / 2 + side * eyeSpacing}px ${eyeY}px` }}
        />
      ))}
    </svg>
  );
}

// Enhanced mouth with gradient + blur
function EnhancedMouth({ size, speaking }: { size: number; speaking: boolean }) {
  const cx = size / 2;
  const cy = size * 0.72;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      width={size}
      height={size}
    >
      <defs>
        <radialGradient id="mouthGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.6)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
        </radialGradient>
        <filter id="mouthBlur">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
      </defs>
      <motion.ellipse
        cx={cx}
        cy={cy}
        fill="url(#mouthGrad)"
        filter="url(#mouthBlur)"
        animate={
          speaking
            ? {
                ry: [2, 7, 3, 9, 2, 5, 2],
                rx: [5, 7, 5, 8, 6, 5, 5],
              }
            : { ry: 1.5, rx: 4 }
        }
        transition={
          speaking
            ? { repeat: Infinity, duration: 0.5, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      />
      {/* Inner highlight */}
      {speaking && (
        <motion.ellipse
          cx={cx}
          cy={cy - 0.5}
          fill="rgba(80,20,20,0.15)"
          animate={{
            ry: [1, 4, 1.5, 5, 1],
            rx: [3, 5, 3, 6, 3],
          }}
          transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
        />
      )}
    </svg>
  );
}

// Idle breathing glow ring
function IdleBreathingGlow({ color, size }: { color: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none -z-[1]"
      style={{
        width: size + 10,
        height: size + 10,
        left: -5,
        top: -5,
        border: `1px solid ${color}25`,
        boxShadow: `0 0 12px ${color}10`,
      }}
      animate={{
        opacity: [0.3, 0.7, 0.3],
        scale: [1, 1.03, 1],
      }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    />
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
  const [retries, setRetries] = useState(0);

  const safeUrl = isAvatarDebugActive()
    ? BROKEN_AVATAR_URL
    : (sanitizeAvatarUrl(avatarUrl) ?? avatarUrl);
  const imgSrc = safeUrl
    ? (retries > 0 ? `${safeUrl}${safeUrl.includes("?") ? "&" : "?"}r=${retries}` : safeUrl)
    : null;

  const handleImgError = () => {
    if (retries < 3) {
      setTimeout(() => setRetries((r) => r + 1), [800, 1500, 3000][retries] ?? 3000);
    } else {
      setImgError(true);
    }
  };

  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      animate={
        speaking
          ? {
              scale: [1, 1.025, 1],
              x: [0, 1.5, -1, 0.5, 0],
              y: [0, -1, 0.5, -0.5, 0],
            }
          : { scale: [1, 1.012, 1], x: 0, y: 0 }
      }
      transition={
        speaking
          ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
          : { repeat: Infinity, duration: 4, ease: "easeInOut" }
      }
    >
      {/* Idle breathing glow */}
      {!speaking && <IdleBreathingGlow color={accentColor} size={size} />}

      {/* Sonar double rings — speaking */}
      <SonarRings color={accentColor} size={size} active={speaking} />

      {/* Ripple burst on speak start */}
      <RippleBurst color={accentColor} size={size} trigger={speaking} />

      {/* Rotating gradient border */}
      <RotatingBorder color={accentColor} size={size} active={speaking} />

      {/* Orbiting particles */}
      <ParticleField color={accentColor} size={size} active={speaking} />

      {/* Portrait */}
      <div
        className="rounded-full overflow-hidden relative"
        style={{ width: size, height: size }}
      >
        {!imgError && imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            className="w-full h-full object-cover"
            onError={handleImgError}
            loading="lazy"
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

        {/* Holographic shimmer */}
        <HolographicShimmer size={size} active={speaking} />

        {/* Eye blinks */}
        <EyeBlinks size={size} />

        {/* Enhanced mouth */}
        <EnhancedMouth size={size} speaking={speaking} />
      </div>

      {/* Glow beneath when speaking */}
      {speaking && (
        <motion.div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full blur-xl pointer-events-none -z-10"
          style={{
            width: size * 0.8,
            height: size * 0.3,
            background: accentColor,
          }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}
