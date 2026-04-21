import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { COLORS, SPRING_SNAPPY } from "../tokens";

const ADVISORS = [
  "Strategy", "Finance", "Legal", "Growth", "Ops",
  "Risk", "Brand", "Tech", "People", "Market",
];

export const Scene4Boardroom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleS = spring({ frame, fps, config: { damping: 25, stiffness: 150 } });

  // Center node
  const centerS = spring({ frame: frame - 10, fps, config: SPRING_SNAPPY });
  const centerPulse = 0.95 + Math.sin(frame * 0.08) * 0.05;

  // Hash cascade
  const hashes = ["0xA7F3…E2B1", "0x3C9D…7F42", "0xB1E8…D593", "0x6F2A…8C17"];

  // Stats
  const statsOp = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 120,
          fontFamily: "Inter, sans-serif",
          fontSize: 44,
          fontWeight: 700,
          color: COLORS.textPrimary,
          opacity: titleOp,
          transform: `translateY(${interpolate(titleS, [0, 1], [30, 0])}px)`,
        }}
      >
        AI Boardroom
      </div>

      {/* Orbital layout */}
      <div style={{ position: "relative", width: 500, height: 500, marginTop: 20 }}>
        {/* Center decision node */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%,-50%) scale(${centerS * centerPulse})`,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${COLORS.business}, ${COLORS.investment})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            color: "white",
          }}
        >
          DECIDE
        </div>

        {/* Advisor nodes */}
        {ADVISORS.map((name, i) => {
          const angle = (i / ADVISORS.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 200;
          const orbitOffset = frame * 0.003;
          const x = Math.cos(angle + orbitOffset) * radius + 250;
          const y = Math.sin(angle + orbitOffset) * radius + 250;
          const s = spring({ frame: frame - 15 - i * 4, fps, config: SPRING_SNAPPY });
          const op = interpolate(frame, [15 + i * 4, 30 + i * 4], [0, 1], { extrapolateRight: "clamp" });

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - 30,
                top: y - 30,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: COLORS.glass,
                border: `1px solid ${COLORS.glassBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Inter, sans-serif",
                fontSize: 9,
                fontWeight: 600,
                color: COLORS.textSecondary,
                opacity: op,
                transform: `scale(${0.5 + s * 0.5})`,
              }}
            >
              {name}
            </div>
          );
        })}
      </div>

      {/* Receipt hashes cascade */}
      <div style={{ position: "absolute", right: 120, top: 300, display: "flex", flexDirection: "column", gap: 8 }}>
        {hashes.map((h, i) => {
          const hOp = interpolate(frame, [60 + i * 12, 72 + i * 12], [0, 0.6], { extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                color: COLORS.finance,
                opacity: hOp,
              }}
            >
              {h}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div
        style={{
          position: "absolute",
          bottom: 130,
          fontFamily: "Inter, sans-serif",
          fontSize: 20,
          color: COLORS.textSecondary,
          letterSpacing: "2px",
          opacity: statsOp,
        }}
      >
        10 Autonomous Advisors · Deterministic Receipts · L0–L6 Autonomy
      </div>
    </AbsoluteFill>
  );
};