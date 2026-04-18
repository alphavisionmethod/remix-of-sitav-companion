// ═══════════════════════════════════════════════════════════════
// SITA OS — Session Threat Detector
// Behavioral anomaly detection & session security
// ═══════════════════════════════════════════════════════════════

const DETECTOR_VERSION = "1.0.0";
const MAX_CONCURRENT_SESSIONS = 3;
const REAUTH_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
const IMPOSSIBLE_TRAVEL_SPEED_KPH = 900; // faster than commercial flight

// ── Device Fingerprint ─────────────────────────────────────────

export interface DeviceFingerprint {
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  colorDepth: number;
  touchSupport: boolean;
  hardwareConcurrency: number;
  hash: string;
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  const components = {
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    colorDepth: screen.colorDepth,
    touchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
  };

  const fingerprintString = Object.values(components).join("|");
  const hash = await hashString(fingerprintString);

  return { ...components, hash };
}

// ── Behavioral Biometrics ──────────────────────────────────────

interface KeystrokeEvent {
  key: string;
  downTime: number;
  upTime: number;
  dwellTime: number;
  flightTime: number;
}

interface MouseEvent {
  x: number;
  y: number;
  time: number;
  speed: number;
}

interface BehavioralBaseline {
  avgDwellTime: number;
  stdDwellTime: number;
  avgFlightTime: number;
  stdFlightTime: number;
  avgMouseSpeed: number;
  stdMouseSpeed: number;
  sampleCount: number;
}

let _keystrokeBuffer: KeystrokeEvent[] = [];
let _mouseBuffer: MouseEvent[] = [];
let _baseline: BehavioralBaseline | null = null;
let _lastKeyDown: { key: string; time: number } | null = null;
let _lastKeystroke: KeystrokeEvent | null = null;
let _lastMousePos: { x: number; y: number; time: number } | null = null;
let _anomalyCount = 0;

const BASELINE_MIN_SAMPLES = 50;
const ANOMALY_SIGMA = 3;

function recordKeystroke(event: KeyboardEvent, phase: "down" | "up") {
  const now = performance.now();

  if (phase === "down") {
    _lastKeyDown = { key: event.key, time: now };
  } else if (phase === "up" && _lastKeyDown) {
    const dwellTime = now - _lastKeyDown.time;
    const flightTime = _lastKeystroke
      ? _lastKeyDown.time - _lastKeystroke.upTime
      : 0;

    const entry: KeystrokeEvent = {
      key: event.key.length === 1 ? "*" : event.key, // Don't log actual keys
      downTime: _lastKeyDown.time,
      upTime: now,
      dwellTime,
      flightTime,
    };

    _keystrokeBuffer.push(entry);
    _lastKeystroke = entry;

    // Keep buffer manageable
    if (_keystrokeBuffer.length > 500) {
      _keystrokeBuffer = _keystrokeBuffer.slice(-200);
    }
  }
}

function recordMouseMove(x: number, y: number) {
  const now = performance.now();

  if (_lastMousePos) {
    const dx = x - _lastMousePos.x;
    const dy = y - _lastMousePos.y;
    const dt = now - _lastMousePos.time;
    const speed = dt > 0 ? Math.sqrt(dx * dx + dy * dy) / dt : 0;

    _mouseBuffer.push({ x, y, time: now, speed });

    if (_mouseBuffer.length > 500) {
      _mouseBuffer = _mouseBuffer.slice(-200);
    }
  }

  _lastMousePos = { x, y, time: now };
}

function computeBaseline(): BehavioralBaseline | null {
  if (_keystrokeBuffer.length < BASELINE_MIN_SAMPLES) return null;

  const dwellTimes = _keystrokeBuffer.map((k) => k.dwellTime);
  const flightTimes = _keystrokeBuffer
    .filter((k) => k.flightTime > 0)
    .map((k) => k.flightTime);
  const mouseSpeeds = _mouseBuffer.map((m) => m.speed);

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const std = (arr: number[], mean: number) =>
    arr.length
      ? Math.sqrt(
          arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length
        )
      : 0;

  const avgDwell = avg(dwellTimes);
  const avgFlight = avg(flightTimes);
  const avgMouse = avg(mouseSpeeds);

  return {
    avgDwellTime: avgDwell,
    stdDwellTime: std(dwellTimes, avgDwell),
    avgFlightTime: avgFlight,
    stdFlightTime: std(flightTimes, avgFlight),
    avgMouseSpeed: avgMouse,
    stdMouseSpeed: std(mouseSpeeds, avgMouse),
    sampleCount: _keystrokeBuffer.length,
  };
}

// ── Session Replay Detection ───────────────────────────────────

interface SessionBehavior {
  hasMouseMovement: boolean;
  hasScrollEvents: boolean;
  avgClickInterval: number;
  clickCount: number;
  startTime: number;
}

let _sessionBehavior: SessionBehavior = {
  hasMouseMovement: false,
  hasScrollEvents: false,
  avgClickInterval: 0,
  clickCount: 0,
  startTime: Date.now(),
};
let _lastClickTime = 0;
let _clickIntervals: number[] = [];

function recordClick() {
  const now = Date.now();
  _sessionBehavior.clickCount++;

  if (_lastClickTime > 0) {
    const interval = now - _lastClickTime;
    _clickIntervals.push(interval);

    // Impossibly fast clicks (< 50ms) suggest automation
    if (interval < 50) {
      _anomalyCount++;
    }
  }
  _lastClickTime = now;
}

function recordScroll() {
  _sessionBehavior.hasScrollEvents = true;
}

function isReplaySession(): boolean {
  const elapsed = Date.now() - _sessionBehavior.startTime;

  // After 60 seconds, if no mouse movement or scroll, suspicious
  if (elapsed > 60000) {
    if (!_sessionBehavior.hasMouseMovement && _sessionBehavior.clickCount > 5) {
      return true;
    }
    if (!_sessionBehavior.hasScrollEvents && _sessionBehavior.clickCount > 10) {
      return true;
    }
  }

  // Check for robotic click patterns (very consistent intervals)
  if (_clickIntervals.length > 10) {
    const avg =
      _clickIntervals.reduce((a, b) => a + b, 0) / _clickIntervals.length;
    const variance =
      _clickIntervals.reduce((sum, v) => sum + (v - avg) ** 2, 0) /
      _clickIntervals.length;
    const coeffOfVariation = Math.sqrt(variance) / avg;

    // Humans have high variance; bots have low variance
    if (coeffOfVariation < 0.05) return true;
  }

  return false;
}

// ── Threat Assessment ──────────────────────────────────────────

export interface ThreatAssessment {
  level: "safe" | "low" | "medium" | "high" | "critical";
  score: number; // 0-100, 0 = safe
  factors: string[];
  requiresReauth: boolean;
  isReplay: boolean;
  anomalyCount: number;
}

export function assessThreat(
  sessionAgeMs: number
): ThreatAssessment {
  const factors: string[] = [];
  let score = 0;

  // Check behavioral anomalies
  if (_baseline) {
    const current = computeBaseline();
    if (current) {
      const dwellDeviation = Math.abs(
        current.avgDwellTime - _baseline.avgDwellTime
      );
      if (dwellDeviation > _baseline.stdDwellTime * ANOMALY_SIGMA) {
        factors.push("Keystroke pattern deviation");
        score += 20;
      }

      const mouseDeviation = Math.abs(
        current.avgMouseSpeed - _baseline.avgMouseSpeed
      );
      if (mouseDeviation > _baseline.stdMouseSpeed * ANOMALY_SIGMA) {
        factors.push("Mouse behavior deviation");
        score += 15;
      }
    }
  }

  // Check replay detection
  const replay = isReplaySession();
  if (replay) {
    factors.push("Automated/scripted interaction detected");
    score += 30;
  }

  // Check anomaly count
  if (_anomalyCount > 5) {
    factors.push(`${_anomalyCount} behavioral anomalies detected`);
    score += _anomalyCount * 3;
  }

  // Session age check for sensitive actions
  const requiresReauth = sessionAgeMs > REAUTH_THRESHOLD_MS;
  if (requiresReauth) {
    factors.push("Session exceeds re-auth threshold");
    score += 10;
  }

  score = Math.min(100, score);

  let level: ThreatAssessment["level"] = "safe";
  if (score >= 70) level = "critical";
  else if (score >= 50) level = "high";
  else if (score >= 30) level = "medium";
  else if (score >= 10) level = "low";

  return {
    level,
    score,
    factors,
    requiresReauth,
    isReplay: replay,
    anomalyCount: _anomalyCount,
  };
}

// ── Initialization ─────────────────────────────────────────────

let _initialized = false;

export function initSessionThreatDetector() {
  if (_initialized) return;
  _initialized = true;

  // Keystroke listeners
  document.addEventListener("keydown", (e) => recordKeystroke(e, "down"), {
    passive: true,
  });
  document.addEventListener("keyup", (e) => recordKeystroke(e, "up"), {
    passive: true,
  });

  // Mouse listener (throttled)
  let _mouseThrottle = 0;
  document.addEventListener(
    "mousemove",
    (e) => {
      _sessionBehavior.hasMouseMovement = true;
      const now = performance.now();
      if (now - _mouseThrottle > 100) {
        _mouseThrottle = now;
        recordMouseMove(e.clientX, e.clientY);
      }
    },
    { passive: true }
  );

  // Click listener
  document.addEventListener("click", () => recordClick(), { passive: true });

  // Scroll listener
  document.addEventListener("scroll", () => recordScroll(), { passive: true });

  // Build baseline after initial period
  setTimeout(() => {
    _baseline = computeBaseline();
    if (_baseline) {
      console.log(
        `[session-threat] Baseline established (${_baseline.sampleCount} samples)`
      );
    }
  }, 120000); // 2 minutes

  console.log(`[session-threat] Detector v${DETECTOR_VERSION} initialized`);
}

export function getDetectorStatus() {
  return {
    version: DETECTOR_VERSION,
    initialized: _initialized,
    baselineEstablished: !!_baseline,
    sampleCount: _keystrokeBuffer.length,
    anomalyCount: _anomalyCount,
    maxConcurrentSessions: MAX_CONCURRENT_SESSIONS,
    replayDetected: isReplaySession(),
  };
}

export { generateDeviceFingerprint as getDeviceFingerprint };
