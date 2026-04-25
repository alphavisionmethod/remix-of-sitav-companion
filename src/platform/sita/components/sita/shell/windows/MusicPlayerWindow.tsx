// ═══════════════════════════════════════════════════════════════
// Nova OS — Music Player Window App
// Waveform visualizer, playlist, album art, spatial audio
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX,
  ListMusic, Heart, MoreHorizontal, Music2
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  color: string;
}

const TRACKS: Track[] = [
  { id: "1", title: "Midnight Protocol", artist: "Neural Wave", album: "Digital Horizons", duration: 234, color: "hsl(265 55% 58%)" },
  { id: "2", title: "Sovereign Dreams", artist: "Ambient Core", album: "Trust Layer", duration: 198, color: "hsl(38 85% 58%)" },
  { id: "3", title: "Deep Work Flow", artist: "Focus Engine", album: "Calm Sessions", duration: 312, color: "hsl(152 55% 48%)" },
  { id: "4", title: "Electric Pulse", artist: "Synth Atlas", album: "Neon Nights", duration: 267, color: "hsl(340 70% 55%)" },
  { id: "5", title: "Morning Light", artist: "Ambient Core", album: "Dawn Protocol", duration: 289, color: "hsl(35 80% 55%)" },
  { id: "6", title: "Binary Sunset", artist: "Neural Wave", album: "Digital Horizons", duration: 345, color: "hsl(220 60% 50%)" },
  { id: "7", title: "Gentle Cascade", artist: "Focus Engine", album: "Calm Sessions", duration: 256, color: "hsl(190 55% 50%)" },
  { id: "8", title: "Starfield", artist: "Synth Atlas", album: "Neon Nights", duration: 278, color: "hsl(280 50% 55%)" },
];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ── Waveform Visualizer ──
function WaveformVisualizer({ playing, color }: { playing: boolean; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const barsRef = useRef<number[]>(Array.from({ length: 64 }, () => Math.random() * 0.3 + 0.1));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const bars = barsRef.current;
      const barW = width / bars.length;

      bars.forEach((val, i) => {
        if (playing) {
          bars[i] += (Math.random() - 0.5) * 0.08;
          bars[i] = Math.max(0.05, Math.min(1, bars[i]));
        } else {
          bars[i] += (0.15 - bars[i]) * 0.05;
        }
        const h = bars[i] * height * 0.8;
        const x = i * barW;
        const y = (height - h) / 2;

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3 + bars[i] * 0.7;
        ctx.beginPath();
        ctx.roundRect(x + 1, y, barW - 2, h, 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, color]);

  return <canvas ref={canvasRef} width={400} height={80} className="w-full h-16 rounded-lg" />;
}

export function MusicPlayerWindow() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const track = TRACKS[currentIdx];

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= track.duration) {
          setCurrentIdx(i => (i + 1) % TRACKS.length);
          return 0;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, track.duration]);

  const next = () => { setCurrentIdx(i => (shuffle ? Math.floor(Math.random() * TRACKS.length) : (i + 1) % TRACKS.length)); setProgress(0); };
  const prev = () => { setCurrentIdx(i => i === 0 ? TRACKS.length - 1 : i - 1); setProgress(0); };

  return (
    <div className="flex h-[420px] bg-[hsl(0_0%_8%)] text-[hsl(0_0%_90%)] overflow-hidden rounded-b-xl">
      {/* Album Art + Controls */}
      <div className="flex-1 flex flex-col items-center justify-between p-5 min-w-[260px]">
        {/* Album Art */}
        <motion.div
          key={track.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative w-44 h-44 rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${track.color}, ${track.color}88)` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Music2 className="h-16 w-16 text-[hsl(0_0%_100%/0.3)]" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0_0%_0%/0.4)] to-transparent" />
          {/* Spinning disc effect when playing */}
          <motion.div
            animate={{ rotate: playing ? 360 : 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full border-2 border-[hsl(0_0%_100%/0.15)]" />
            <div className="absolute w-3 h-3 rounded-full bg-[hsl(0_0%_100%/0.2)]" />
          </motion.div>
        </motion.div>

        {/* Track Info */}
        <div className="text-center mt-3 w-full">
          <p className="text-sm font-semibold truncate">{track.title}</p>
          <p className="text-[11px] text-[hsl(0_0%_60%)]">{track.artist} — {track.album}</p>
        </div>

        {/* Waveform */}
        <WaveformVisualizer playing={playing} color={track.color} />

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2 mt-1">
          <span className="text-[10px] text-[hsl(0_0%_50%)] tabular-nums w-8 text-right">{formatTime(progress)}</span>
          <div className="flex-1 h-1 bg-[hsl(0_0%_20%)] rounded-full overflow-hidden cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setProgress((e.clientX - rect.left) / rect.width * track.duration);
            }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: track.color, width: `${(progress / track.duration) * 100}%` }}
              layout
            />
          </div>
          <span className="text-[10px] text-[hsl(0_0%_50%)] tabular-nums w-8">{formatTime(track.duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-2">
          <button onClick={() => setShuffle(!shuffle)} className={cn("p-1.5 rounded-full transition-colors", shuffle ? "text-[hsl(265_55%_65%)]" : "text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_70%)]")}>
            <Shuffle className="h-3.5 w-3.5" />
          </button>
          <button onClick={prev} className="p-1.5 text-[hsl(0_0%_70%)] hover:text-[hsl(0_0%_95%)] transition-colors">
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{ background: track.color }}
          >
            {playing ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white ml-0.5" />}
          </button>
          <button onClick={next} className="p-1.5 text-[hsl(0_0%_70%)] hover:text-[hsl(0_0%_95%)] transition-colors">
            <SkipForward className="h-4 w-4" />
          </button>
          <button onClick={() => setRepeat(!repeat)} className={cn("p-1.5 rounded-full transition-colors", repeat ? "text-[hsl(265_55%_65%)]" : "text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_70%)]")}>
            <Repeat className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 mt-2 w-full max-w-[180px]">
          <button onClick={() => setMuted(!muted)} className="text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_70%)]">
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <div className="flex-1 h-1 bg-[hsl(0_0%_20%)] rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setVolume((e.clientX - r.left) / r.width); setMuted(false); }}
          >
            <div className="h-full bg-[hsl(0_0%_50%)] rounded-full" style={{ width: `${(muted ? 0 : volume) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Playlist Sidebar */}
      {showPlaylist && (
        <div className="w-48 border-l border-[hsl(0_0%_15%)] flex flex-col">
          <div className="p-3 flex items-center justify-between border-b border-[hsl(0_0%_15%)]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(0_0%_50%)]">Queue</span>
            <ListMusic className="h-3.5 w-3.5 text-[hsl(0_0%_40%)]" />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {TRACKS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => { setCurrentIdx(i); setProgress(0); setPlaying(true); }}
                className={cn(
                  "w-full text-left px-3 py-2 flex items-center gap-2 transition-colors",
                  i === currentIdx ? "bg-[hsl(0_0%_15%)]" : "hover:bg-[hsl(0_0%_12%)]"
                )}
              >
                <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] shrink-0"
                  style={{ background: `${t.color}33` }}
                >
                  {i === currentIdx && playing ? (
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                      <Music2 className="h-3 w-3" style={{ color: t.color }} />
                    </motion.div>
                  ) : (
                    <span className="text-[hsl(0_0%_50%)]">{i + 1}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[11px] truncate", i === currentIdx ? "text-[hsl(0_0%_90%)] font-medium" : "text-[hsl(0_0%_65%)]")}>{t.title}</p>
                  <p className="text-[9px] text-[hsl(0_0%_40%)] truncate">{t.artist}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setLiked(l => { const n = new Set(l); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; }); }}
                  className="shrink-0"
                >
                  <Heart className={cn("h-3 w-3 transition-colors", liked.has(t.id) ? "fill-[hsl(340_70%_55%)] text-[hsl(340_70%_55%)]" : "text-[hsl(0_0%_25%)] hover:text-[hsl(0_0%_50%)]")} />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
