import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AmbientFormationCanvasProps {
  primaryHue?: string;
  secondaryHue?: string;
}

export function AmbientFormationCanvas({
  primaryHue = "hsl(265 55% 58% / 0.04)",
  secondaryHue = "hsl(38 85% 58% / 0.03)",
}: AmbientFormationCanvasProps) {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[120px]"
        style={{ background: primaryHue }} />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full blur-[100px]"
        style={{ background: secondaryHue }} />
    </div>
  );
}
