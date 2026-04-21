import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Sequence } from "remotion";
import { COLORS, SPRING_SNAPPY } from "../tokens";

const GlassWindow: React.FC<{ x: number; y: number; w: number; h: number; delay: number; label: string; accent: string }> = ({
  x, y, w, h, delay, label, accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: SPRING_SNAPPY });
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 16,
        background: COLORS.glass,
        border: `1px solid ${COLORS.glassBorder}`,
        opacity,
        transform: `scale(${0.85 + s * 0.15}) translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
        overflow: "hidden",
      }}
    >
      {/* Title bar */}
      <div style={{ height: 36, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", padding: "0 14px", gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.textSecondary, marginLeft: 12 }}>{label}</span>
      </div>
      {/* Accent line */}
      <div style={{ height: 2, background: accent, opacity: 0.6 }} />
      {/* Content placeholder lines */}
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {[0.7, 0.5, 0.85, 0.4].map((w2, i) => (
          <div key={i} style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", width: `${w2 * 100}%` }} />
        ))}
      </div>
    </div>
  );
};

export const Scene2Shell: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Menu bar
  const menuOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* Menu bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 32,
          background: "rgba(255,255,255,0.04)",
          borderBottom: `1px solid ${COLORS.glassBorder}`,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 20,
          opacity: menuOpacity,
        }}
      >
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>SITA</span>
        {["File", "Edit", "View", "Domains", "Help"].map((m) => (
          <span key={m} style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.textSecondary }}>{m}</span>
        ))}
      </div>

      {/* Floating windows */}
      <GlassWindow x={120} y={80} w={550} h={380} delay={10} label="Business — Dashboard" accent={COLORS.business} />
      <GlassWindow x={500} y={200} w={480} h={340} delay={25} label="Finance — Portfolio" accent={COLORS.finance} />
      <GlassWindow x={900} y={120} w={500} h={300} delay={40} label="Concierge — Tasks" accent={COLORS.concierge} />

      {/* Dock */}
      <Sequence from={20}>
        <DockBar />
      </Sequence>
    </AbsoluteFill>
  );
};

const DockBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 25, stiffness: 150 } });
  const icons = ["Biz", "Fin", "Con", "Inv", "Tru", "Set", "Src", "Fls"];
  const colors = [COLORS.business, COLORS.finance, COLORS.concierge, COLORS.investment, COLORS.trust, "rgba(255,255,255,0.3)", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.3)"];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: `translateX(-50%) translateY(${interpolate(s, [0, 1], [60, 0])}px)`,
        display: "flex",
        gap: 12,
        padding: "10px 24px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.05)",
        border: `1px solid ${COLORS.glassBorder}`,
      }}
    >
      {icons.map((icon, i) => {
        const d = spring({ frame: frame - i * 3, fps, config: SPRING_SNAPPY });
        return (
          <div
            key={i}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: colors[i],
              opacity: 0.7 + d * 0.3,
              transform: `scale(${0.6 + d * 0.4})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {icon}
          </div>
        );
      })}
    </div>
  );
};