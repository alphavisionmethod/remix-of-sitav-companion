import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { COLORS, SPRING_SNAPPY } from "../tokens";

export const Scene1Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: SPRING_SNAPPY });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const taglineY = spring({ frame: frame - 30, fps, config: { damping: 25, stiffness: 150 } });
  const taglineOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });

  // Glass panel materializes
  const panelOpacity = interpolate(frame, [5, 35], [0, 1], { extrapolateRight: "clamp" });
  const panelScale = spring({ frame: frame - 5, fps, config: { damping: 30, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Glass card */}
      <div
        style={{
          width: 800,
          padding: "80px 60px",
          borderRadius: 32,
          background: COLORS.glass,
          border: `1px solid ${COLORS.glassBorder}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          opacity: panelOpacity,
          transform: `scale(${0.9 + panelScale * 0.1})`,
        }}
      >
        {/* Logo text */}
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 96,
            fontWeight: 800,
            color: COLORS.textPrimary,
            letterSpacing: "-3px",
            opacity: logoOpacity,
            transform: `scale(${0.8 + logoScale * 0.2})`,
          }}
        >
          SITA OS
        </div>
        {/* Tagline */}
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 28,
            fontWeight: 300,
            color: COLORS.textSecondary,
            letterSpacing: "4px",
            textTransform: "uppercase",
            opacity: taglineOpacity,
            transform: `translateY(${interpolate(taglineY, [0, 1], [20, 0])}px)`,
          }}
        >
          Your Life. One Operating System.
        </div>
      </div>
    </AbsoluteFill>
  );
};