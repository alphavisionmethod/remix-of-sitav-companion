import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { COLORS, SPRING_SNAPPY } from "../tokens";

export const Scene6Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const textOp = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const textS = spring({ frame, fps, config: { damping: 30, stiffness: 100 } });

  const logoOp = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp" });
  const logoS = spring({ frame: frame - 30, fps, config: SPRING_SNAPPY });

  // Fade out at end
  const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
      {/* Tagline */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 42,
          fontWeight: 300,
          color: COLORS.textPrimary,
          textAlign: "center",
          maxWidth: 800,
          lineHeight: 1.4,
          opacity: textOp,
          transform: `translateY(${interpolate(textS, [0, 1], [40, 0])}px)`,
        }}
      >
        Built for the next era of personal computing.
      </div>

      {/* Logo mark */}
      <div
        style={{
          marginTop: 60,
          fontFamily: "Inter, sans-serif",
          fontSize: 64,
          fontWeight: 800,
          letterSpacing: "-2px",
          color: COLORS.textPrimary,
          opacity: logoOp,
          transform: `scale(${0.8 + logoS * 0.2})`,
        }}
      >
        SITA
      </div>
    </AbsoluteFill>
  );
};