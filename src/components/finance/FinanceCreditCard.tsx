import { Wifi } from "lucide-react";

export function FinanceCreditCard() {
  return (
    <div className="rounded-2xl p-6 relative overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
      style={{
        background: "linear-gradient(135deg, hsl(265 55% 35%), hsl(285 45% 22%), hsl(310 40% 18%))",
        minHeight: 200,
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/[0.07] group-hover:bg-white/[0.1] transition-colors duration-500" />
      <div className="absolute -right-4 top-8 w-28 h-28 rounded-full bg-white/[0.04] group-hover:bg-white/[0.06] transition-colors duration-500" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-[hsl(265_60%_60%/0.08)]" />

      {/* Shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Chip + Contactless */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-300/90 to-amber-500/80 border border-amber-300/40 shadow-[0_0_12px_hsl(38_85%_58%/0.3)]" />
        <Wifi className="h-5 w-5 text-white/50 rotate-90" />
      </div>

      {/* Card Number */}
      <p className="text-lg tracking-[0.25em] text-white/90 font-mono mb-6" style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
        •••• •••• •••• 4285
      </p>

      {/* Bottom row */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-0.5">Card Holder</p>
          <p className="text-sm text-white/80 font-medium">SITA USER</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-0.5">Expires</p>
          <p className="text-sm text-white/80 font-medium">09/28</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white/90 italic tracking-wider" style={{ textShadow: '0 0 16px rgba(255,255,255,0.15)' }}>VISA</p>
        </div>
      </div>

      {/* Carousel dots */}
      <div className="flex gap-1.5 justify-center mt-5">
        <div className="w-2 h-2 rounded-full bg-white/70 shadow-[0_0_6px_rgba(255,255,255,0.3)]" />
        <div className="w-2 h-2 rounded-full bg-white/25" />
        <div className="w-2 h-2 rounded-full bg-white/25" />
      </div>
    </div>
  );
}
