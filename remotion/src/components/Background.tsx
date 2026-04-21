import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from "remotion";
import { COLORS } from "../tokens";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const drift = (offset: number) =>
    interpolate(frame, [0, durationInFrames], [0, 360 + offset], {
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Purple orb */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: COLORS.business,
          filter: "blur(120px)",
          opacity: 0.18,
          left: `${30 + Math.sin(drift(0) * (Math.PI / 180)) * 8}%`,
          top: `${20 + Math.cos(drift(0) * (Math.PI / 180)) * 6}%`,
          transform: "translate(-50%,-50%)",
        }}
      />
      {/* Green orb */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: COLORS.finance,
          filter: "blur(100px)",
          opacity: 0.12,
          left: `${70 + Math.sin(drift(120) * (Math.PI / 180)) * 10}%`,
          top: `${65 + Math.cos(drift(120) * (Math.PI / 180)) * 8}%`,
          transform: "translate(-50%,-50%)",
        }}
      />
      {/* Gold orb */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: COLORS.trust,
          filter: "blur(100px)",
          opacity: 0.1,
          left: `${55 + Math.sin(drift(240) * (Math.PI / 180)) * 6}%`,
          top: `${30 + Math.cos(drift(240) * (Math.PI / 180)) * 5}%`,
          transform: "translate(-50%,-50%)",
        }}
      />
      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};