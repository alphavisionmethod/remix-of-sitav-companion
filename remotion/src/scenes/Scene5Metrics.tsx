import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { COLORS, SPRING_SNAPPY } from "../tokens";

const METRICS = [
  { label: "Validators", value: 650, suffix: "+", color: COLORS.business },
  { label: "Edge Functions", value: 193, suffix: "", color: COLORS.finance },
  { label: "A11y Score", value: 100, suffix: "%", color: COLORS.concierge },
  { label: "Database Tables", value: 433, suffix: "", color: COLORS.trust },
];

export const Scene5Metrics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleS = spring({ frame, fps, config: { damping: 25, stiffness: 150 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 180,
          fontFamily: "Inter, sans-serif",
          fontSize: 44,
          fontWeight: 700,
          color: COLORS.textPrimary,
          opacity: titleOp,
          transform: `translateY(${interpolate(titleS, [0, 1], [30, 0])}px)`,
        }}
      >
        Enterprise Grade
      </div>

      <div style={{ display: "flex", gap: 48, marginTop: 60 }}>
        {METRICS.map((m, i) => {
          const s = spring({ frame: frame - 15 - i * 10, fps, config: SPRING_SNAPPY });
          const op = interpolate(frame, [15 + i * 10, 30 + i * 10], [0, 1], { extrapolateRight: "clamp" });
          // Counting animation
          const countProgress = interpolate(frame, [20 + i * 10, 70 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const displayValue = Math.round(m.value * countProgress);

          return (
            <div
              key={i}
              style={{
                width: 220,
                padding: "40px 24px",
                borderRadius: 24,
                background: COLORS.glass,
                border: `1px solid ${COLORS.glassBorder}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                opacity: op,
                transform: `scale(${0.8 + s * 0.2}) translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 56,
                  fontWeight: 800,
                  color: m.color,
                }}
              >
                {displayValue}{m.suffix}
              </div>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 16,
                  fontWeight: 500,
                  color: COLORS.textSecondary,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {m.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};