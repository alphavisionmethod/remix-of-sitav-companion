import { Wifi } from "lucide-react";

export function FinanceCreditCard() {
  return (
    <div className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(260 40% 25%), hsl(280 35% 18%))",
        minHeight: 200,
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/[0.06]" />
      <div className="absolute -right-4 top-8 w-24 h-24 rounded-full bg-white/[0.04]" />

      {/* Chip + Contactless */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-7 rounded bg-amber-400/80 border border-amber-300/40" />
        <Wifi className="h-5 w-5 text-white/50 rotate-90" />
      </div>

      {/* Card Number */}
      <p className="text-lg tracking-[0.25em] text-white/90 font-mono mb-6">
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
          <p className="text-xl font-bold text-white/90 italic tracking-wider">VISA</p>
        </div>
      </div>

      {/* Carousel dots */}
      <div className="flex gap-1.5 justify-center mt-5">
        <div className="w-2 h-2 rounded-full bg-white/60" />
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="w-2 h-2 rounded-full bg-white/20" />
      </div>
    </div>
  );
}
