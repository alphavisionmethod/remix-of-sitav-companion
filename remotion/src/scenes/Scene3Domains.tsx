import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { COLORS, SPRING_SNAPPY } from "../tokens";

const DOMAINS = [
  { name: "Business", icon: "💼", color: COLORS.business },
  { name: "Finance", icon: "📊", color: COLORS.finance },
  { name: "Concierge", icon: "✨", color: COLORS.concierge },
  { name: "Investment", icon: "📈", color: COLORS.investment },
  { name: "Trust", icon: "🛡️", color: COLORS.trust },
];

export const Scene3Domains: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = spring({ frame, fps, config: { damping: 25, stiffness: 150 } });

  // Stats line
  const statsOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp" });
  const statsY = spring({ frame: frame - 80, fps, config: SPRING_SNAPPY });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Section title */}
      <div
        style={{
          position: "absolute",
          top: 160,
          fontFamily: "Inter, sans-serif",
          fontSize: 48,
          fontWeight: 700,
          color: COLORS.textPrimary,
          opacity: titleOpacity,
          transform: `translateY(${interpolate(titleY, [0, 1], [30, 0])}px)`,
        }}
      >
        Five Domains. One Shell.
      </div>

      {/* Domain cards */}
      <div style={{ display: "flex", gap: 32, marginTop: 40 }}>
        {DOMAINS.map((d, i) => {
          const s = spring({ frame: frame - 15 - i * 10, fps, config: SPRING_SNAPPY });
          const op = interpolate(frame, [15 + i * 10, 30 + i * 10], [0, 1], { extrapolateRight: "clamp" });
          // Glow pulse
          const glow = interpolate(frame, [50 + i * 8, 70 + i * 8, 90 + i * 8], [0, 0.6, 0.3], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

          return (
            <div
              key={i}
              style={{
                width: 180,
                height: 200,
                borderRadius: 24,
                background: COLORS.glass,
                border: `1px solid ${COLORS.glassBorder}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                opacity: op,
                transform: `scale(${0.7 + s * 0.3}) translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
                boxShadow: `0 0 ${40 * glow}px ${d.color}`,
              }}
            >
              <div style={{ fontSize: 48 }}>{d.icon}</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 600, color: d.color }}>{d.name}</div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          fontFamily: "Inter, sans-serif",
          fontSize: 22,
          color: COLORS.textSecondary,
          letterSpacing: "2px",
          opacity: statsOpacity,
          transform: `translateY(${interpolate(statsY, [0, 1], [20, 0])}px)`,
        }}
      >
        227 Services · 433 Tables · 193 Functions
      </div>
    </AbsoluteFill>
  );
};