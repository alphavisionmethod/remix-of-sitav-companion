// ═══════════════════════════════════════════════════════════════
// SITA OS — Color Management System
// ICC profile simulation, color space conversion (sRGB, Display
// P3, linear RGB, HSL, Lab, XYZ), wide-gamut awareness, HDR
// tone mapping, color blindness simulation filters.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export type ColorSpaceId = "srgb" | "linear-rgb" | "display-p3" | "adobe-rgb" | "hsl" | "lab" | "xyz";
export type ColorBlindnessType = "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";
export type ToneMappingOperator = "reinhard" | "aces" | "hable" | "clamp";
export type RenderingIntent = "perceptual" | "relative-colorimetric" | "saturation" | "absolute-colorimetric";

export interface RGBColor { r: number; g: number; b: number; a?: number }
export interface HSLColor { h: number; s: number; l: number; a?: number }
export interface LabColor { L: number; a: number; b: number; alpha?: number }
export interface XYZColor { x: number; y: number; z: number }

export interface ICCProfile {
  id: string;
  name: string;
  colorSpace: ColorSpaceId;
  whitePoint: XYZColor;
  primaries: { red: XYZColor; green: XYZColor; blue: XYZColor };
  gamma: number;
  matrix3x3: number[]; // row-major RGB→XYZ 3×3
}

export interface ColorManagementStats {
  profileCount: number;
  activeProfileId: string;
  outputProfileId: string;
  toneMappingOperator: ToneMappingOperator;
  colorBlindnessFilter: ColorBlindnessType | null;
  conversionsPerformed: number;
}

// ── Well-known profiles ──────────────────────────────────────

const D65: XYZColor = { x: 0.9505, y: 1.0, z: 1.089 };

const SRGB_PROFILE: ICCProfile = {
  id: "srgb", name: "sRGB IEC61966-2.1", colorSpace: "srgb",
  whitePoint: D65,
  primaries: {
    red: { x: 0.4124, y: 0.2126, z: 0.0193 },
    green: { x: 0.3576, y: 0.7152, z: 0.1192 },
    blue: { x: 0.1805, y: 0.0722, z: 0.9505 },
  },
  gamma: 2.2,
  matrix3x3: [0.4124, 0.3576, 0.1805, 0.2126, 0.7152, 0.0722, 0.0193, 0.1192, 0.9505],
};

const P3_PROFILE: ICCProfile = {
  id: "display-p3", name: "Display P3", colorSpace: "display-p3",
  whitePoint: D65,
  primaries: {
    red: { x: 0.4866, y: 0.2290, z: 0.0000 },
    green: { x: 0.2657, y: 0.6917, z: 0.0451 },
    blue: { x: 0.1982, y: 0.0793, z: 1.0439 },
  },
  gamma: 2.2,
  matrix3x3: [0.4866, 0.2657, 0.1982, 0.2290, 0.6917, 0.0793, 0.0000, 0.0451, 1.0439],
};

const ADOBE_RGB_PROFILE: ICCProfile = {
  id: "adobe-rgb", name: "Adobe RGB (1998)", colorSpace: "adobe-rgb",
  whitePoint: D65,
  primaries: {
    red: { x: 0.5767, y: 0.2974, z: 0.0270 },
    green: { x: 0.1856, y: 0.6273, z: 0.0707 },
    blue: { x: 0.1882, y: 0.0753, z: 0.9911 },
  },
  gamma: 2.2,
  matrix3x3: [0.5767, 0.1856, 0.1882, 0.2974, 0.6273, 0.0753, 0.0270, 0.0707, 0.9911],
};

// ── Color blindness simulation matrices (LMS) ───────────────

const CB_MATRICES: Record<ColorBlindnessType, number[]> = {
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  achromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
};

// ═════════════════════════════════════════════════════════════

export class ColorManagement {
  private _profiles = new Map<string, ICCProfile>();
  private _activeProfileId = "srgb";
  private _outputProfileId = "srgb";
  private _toneMapping: ToneMappingOperator = "clamp";
  private _cbFilter: ColorBlindnessType | null = null;
  private _conversions = 0;

  // Pre-built sRGB gamma LUTs
  private _srgbToLinear: Float32Array;
  private _linearToSrgb: Uint8Array;

  constructor() {
    this._profiles.set("srgb", SRGB_PROFILE);
    this._profiles.set("display-p3", P3_PROFILE);
    this._profiles.set("adobe-rgb", ADOBE_RGB_PROFILE);

    // Build LUTs
    this._srgbToLinear = new Float32Array(256);
    this._linearToSrgb = new Uint8Array(4096);

    for (let i = 0; i < 256; i++) {
      const c = i / 255;
      this._srgbToLinear[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    for (let i = 0; i < 4096; i++) {
      const c = i / 4095;
      const s = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
      this._linearToSrgb[i] = Math.round(Math.max(0, Math.min(1, s)) * 255);
    }
  }

  // ── Profile management ─────────────────────────────────────

  addProfile(profile: ICCProfile): void {
    this._profiles.set(profile.id, profile);
  }

  getProfile(id: string): ICCProfile | undefined {
    return this._profiles.get(id);
  }

  setActiveProfile(id: string): boolean {
    if (!this._profiles.has(id)) return false;
    this._activeProfileId = id;
    return true;
  }

  setOutputProfile(id: string): boolean {
    if (!this._profiles.has(id)) return false;
    this._outputProfileId = id;
    return true;
  }

  // ── Color space conversions ────────────────────────────────

  srgbToLinear(r: number, g: number, b: number): RGBColor {
    this._conversions++;
    return {
      r: this._srgbToLinear[Math.round(r * 255)] ?? 0,
      g: this._srgbToLinear[Math.round(g * 255)] ?? 0,
      b: this._srgbToLinear[Math.round(b * 255)] ?? 0,
    };
  }

  linearToSrgb(r: number, g: number, b: number): RGBColor {
    this._conversions++;
    return {
      r: (this._linearToSrgb[Math.round(Math.max(0, Math.min(1, r)) * 4095)] ?? 0) / 255,
      g: (this._linearToSrgb[Math.round(Math.max(0, Math.min(1, g)) * 4095)] ?? 0) / 255,
      b: (this._linearToSrgb[Math.round(Math.max(0, Math.min(1, b)) * 4095)] ?? 0) / 255,
    };
  }

  rgbToHsl(r: number, g: number, b: number): HSLColor {
    this._conversions++;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return { h, s, l };
  }

  hslToRgb(h: number, s: number, l: number): RGBColor {
    this._conversions++;
    if (s === 0) return { r: l, g: l, b: l };
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return { r: hue2rgb(p, q, h + 1 / 3), g: hue2rgb(p, q, h), b: hue2rgb(p, q, h - 1 / 3) };
  }

  rgbToXyz(r: number, g: number, b: number, profileId?: string): XYZColor {
    this._conversions++;
    const profile = this._profiles.get(profileId ?? this._activeProfileId) ?? SRGB_PROFILE;
    const lin = this.srgbToLinear(r, g, b);
    const m = profile.matrix3x3;
    return {
      x: m[0] * lin.r + m[1] * lin.g + m[2] * lin.b,
      y: m[3] * lin.r + m[4] * lin.g + m[5] * lin.b,
      z: m[6] * lin.r + m[7] * lin.g + m[8] * lin.b,
    };
  }

  xyzToLab(xyz: XYZColor): LabColor {
    this._conversions++;
    const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);
    const fx = f(xyz.x / D65.x);
    const fy = f(xyz.y / D65.y);
    const fz = f(xyz.z / D65.z);
    return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
  }

  rgbToLab(r: number, g: number, b: number): LabColor {
    return this.xyzToLab(this.rgbToXyz(r, g, b));
  }

  /** Convert between two ICC profiles via XYZ */
  convertColor(r: number, g: number, b: number, fromProfile: string, toProfile: string): RGBColor {
    this._conversions++;
    const xyz = this.rgbToXyz(r, g, b, fromProfile);
    const to = this._profiles.get(toProfile) ?? SRGB_PROFILE;
    // Invert matrix (simplified — use pre-computed inverse for production)
    const m = to.matrix3x3;
    // Approximate inverse by adjugate (good enough for well-conditioned ICC matrices)
    const det = m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);
    if (Math.abs(det) < 1e-10) return { r, g, b };
    const inv = [
      (m[4] * m[8] - m[5] * m[7]) / det, (m[2] * m[7] - m[1] * m[8]) / det, (m[1] * m[5] - m[2] * m[4]) / det,
      (m[5] * m[6] - m[3] * m[8]) / det, (m[0] * m[8] - m[2] * m[6]) / det, (m[2] * m[3] - m[0] * m[5]) / det,
      (m[3] * m[7] - m[4] * m[6]) / det, (m[1] * m[6] - m[0] * m[7]) / det, (m[0] * m[4] - m[1] * m[3]) / det,
    ];
    const linR = inv[0] * xyz.x + inv[1] * xyz.y + inv[2] * xyz.z;
    const linG = inv[3] * xyz.x + inv[4] * xyz.y + inv[5] * xyz.z;
    const linB = inv[6] * xyz.x + inv[7] * xyz.y + inv[8] * xyz.z;
    return this.linearToSrgb(linR, linG, linB);
  }

  // ── Tone mapping (HDR → SDR) ───────────────────────────────

  setToneMapping(op: ToneMappingOperator): void {
    this._toneMapping = op;
  }

  toneMap(r: number, g: number, b: number): RGBColor {
    this._conversions++;
    switch (this._toneMapping) {
      case "reinhard": return this._reinhardToneMap(r, g, b);
      case "aces": return this._acesToneMap(r, g, b);
      case "hable": return this._hableToneMap(r, g, b);
      case "clamp":
      default: return { r: Math.min(1, r), g: Math.min(1, g), b: Math.min(1, b) };
    }
  }

  private _reinhardToneMap(r: number, g: number, b: number): RGBColor {
    return { r: r / (1 + r), g: g / (1 + g), b: b / (1 + b) };
  }

  private _acesToneMap(r: number, g: number, b: number): RGBColor {
    const f = (x: number) => (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
    return { r: Math.min(1, f(r)), g: Math.min(1, f(g)), b: Math.min(1, f(b)) };
  }

  private _hableToneMap(r: number, g: number, b: number): RGBColor {
    const f = (x: number) => {
      const A = 0.15, B = 0.50, C = 0.10, D = 0.20, E = 0.02, F = 0.30;
      return ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F;
    };
    const W = 11.2;
    const wScale = 1 / f(W);
    return { r: f(r) * wScale, g: f(g) * wScale, b: f(b) * wScale };
  }

  // ── Color blindness simulation ─────────────────────────────

  setColorBlindnessFilter(type: ColorBlindnessType | null): void {
    this._cbFilter = type;
  }

  simulateColorBlindness(r: number, g: number, b: number, type?: ColorBlindnessType): RGBColor {
    this._conversions++;
    const t = type ?? this._cbFilter;
    if (!t) return { r, g, b };
    const m = CB_MATRICES[t];
    return {
      r: Math.max(0, Math.min(1, m[0] * r + m[1] * g + m[2] * b)),
      g: Math.max(0, Math.min(1, m[3] * r + m[4] * g + m[5] * b)),
      b: Math.max(0, Math.min(1, m[6] * r + m[7] * g + m[8] * b)),
    };
  }

  /** CIEDE2000-simplified perceptual distance */
  colorDistance(c1: RGBColor, c2: RGBColor): number {
    const lab1 = this.rgbToLab(c1.r, c1.g, c1.b);
    const lab2 = this.rgbToLab(c2.r, c2.g, c2.b);
    return Math.sqrt(
      (lab1.L - lab2.L) ** 2 +
      (lab1.a - lab2.a) ** 2 +
      (lab1.b - lab2.b) ** 2
    );
  }

  // ── Stats ──────────────────────────────────────────────────

  getStats(): ColorManagementStats {
    return {
      profileCount: this._profiles.size,
      activeProfileId: this._activeProfileId,
      outputProfileId: this._outputProfileId,
      toneMappingOperator: this._toneMapping,
      colorBlindnessFilter: this._cbFilter,
      conversionsPerformed: this._conversions,
    };
  }
}
