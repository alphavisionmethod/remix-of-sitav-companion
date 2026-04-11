# SITA OS — Compositor & CPU Rasterizer Implementation Spec

> Native engine reference for Phase 2+. All code targets C++17 with optional AVX2/NEON SIMD.

---

## Part 1 — Real Compositor

### 1.1 Core Data Structures

```cpp
#include <cstdint>
#include <vector>

struct Color {
    uint8_t r, g, b, a;
};

struct Rect {
    int x, y, w, h;

    bool intersects(const Rect& o) const {
        return x < o.x + o.w && x + w > o.x &&
               y < o.y + o.h && y + h > o.y;
    }

    Rect merge(const Rect& o) const {
        int nx = std::min(x, o.x);
        int ny = std::min(y, o.y);
        return { nx, ny,
                 std::max(x + w, o.x + o.w) - nx,
                 std::max(y + h, o.y + o.h) - ny };
    }
};

struct Surface {
    uint32_t* buffer;   // RGBA pre-multiplied
    int width;
    int height;
    int stride;         // pixels per row (may include padding)

    int x, y;           // position on screen
    float opacity;
    bool visible;
};

struct Framebuffer {
    uint32_t* pixels;
    int width;
    int height;
};
```

### 1.2 Alpha Blending (source-over)

```cpp
inline uint32_t blend(uint32_t fg, uint32_t bg) {
    uint8_t fa = (fg >> 24) & 0xFF;

    uint8_t fr = (fg >> 16) & 0xFF;
    uint8_t fg_g = (fg >> 8) & 0xFF;
    uint8_t fb = fg & 0xFF;

    uint8_t br = (bg >> 16) & 0xFF;
    uint8_t bg_g = (bg >> 8) & 0xFF;
    uint8_t bb = bg & 0xFF;

    uint8_t r = (fr * fa + br * (255 - fa)) / 255;
    uint8_t g = (fg_g * fa + bg_g * (255 - fa)) / 255;
    uint8_t b = (fb * fa + bb * (255 - fa)) / 255;

    return (255u << 24) | (r << 16) | (g << 8) | b;
}
```

### 1.3 Compositing Loop (Z-order)

```cpp
// windows vector is sorted back → front
std::vector<Surface*> windows;

void composite(Framebuffer& fb) {
    for (int y = 0; y < fb.height; y++) {
        for (int x = 0; x < fb.width; x++) {
            uint32_t final_color = 0xFF202020; // desktop background

            for (auto& win : windows) {
                if (!win->visible) continue;

                int wx = x - win->x;
                int wy = y - win->y;

                if (wx < 0 || wy < 0 || wx >= win->width || wy >= win->height)
                    continue;

                uint32_t src = win->buffer[wy * win->stride + wx];
                final_color = blend(src, final_color);
            }

            fb.pixels[y * fb.width + x] = final_color;
        }
    }
}
```

### 1.4 Damage-Region Optimization

```cpp
std::vector<Rect> damage_regions;

void composite_region(Framebuffer& fb, const Rect& r) {
    for (int y = r.y; y < r.y + r.h && y < fb.height; y++) {
        for (int x = r.x; x < r.x + r.w && x < fb.width; x++) {
            uint32_t final_color = 0xFF202020;

            for (auto& win : windows) {
                if (!win->visible) continue;
                int wx = x - win->x;
                int wy = y - win->y;
                if (wx < 0 || wy < 0 || wx >= win->width || wy >= win->height)
                    continue;
                uint32_t src = win->buffer[wy * win->stride + wx];
                final_color = blend(src, final_color);
            }

            fb.pixels[y * fb.width + x] = final_color;
        }
    }
}

void composite_damaged(Framebuffer& fb) {
    for (auto& r : damage_regions) {
        composite_region(fb, r);
    }
    damage_regions.clear();
}
```

> Coalescing: merge rects with gap < 8px when merged area < sum of individual areas + threshold. See `PERFORMANCE_RENDERING.md` §Damage Tracker.

---

## Part 2 — CPU Rasterizer (SIMD-Accelerated)

### 2.1 Scalar Rectangle Fill

```cpp
void fill_rect(uint32_t* buffer, int stride,
               int x, int y, int w, int h, uint32_t color) {
    for (int j = 0; j < h; j++) {
        uint32_t* row = buffer + (y + j) * stride + x;
        for (int i = 0; i < w; i++) {
            row[i] = color;
        }
    }
}
```

### 2.2 AVX2 SIMD Fill (8 pixels/cycle)

```cpp
#include <immintrin.h>

void fill_rect_simd(uint32_t* buffer, int stride,
                    int x, int y, int w, int h, uint32_t color) {
    __m256i col = _mm256_set1_epi32(color);

    for (int j = 0; j < h; j++) {
        uint32_t* row = buffer + (y + j) * stride + x;

        int i = 0;
        for (; i <= w - 8; i += 8) {
            _mm256_storeu_si256((__m256i*)(row + i), col);
        }
        // scalar tail
        for (; i < w; i++) {
            row[i] = color;
        }
    }
}
```

> **Compile**: `g++ -mavx2 -O2` or `clang++ -mavx2 -O2`
> **ARM**: Replace with NEON intrinsics (`vdupq_n_u32`, `vst1q_u32`) for 4-wide.

### 2.3 Gradient Interpolation

```cpp
inline uint32_t lerp_color(uint32_t a, uint32_t b, float t) {
    auto ch = [&](int shift) -> uint8_t {
        uint8_t ca = (a >> shift) & 0xFF;
        uint8_t cb = (b >> shift) & 0xFF;
        return (uint8_t)(ca + (cb - ca) * t);
    };
    return (ch(24) << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0);
}
```

### 2.4 Box Blur (3×3 Approximation)

```cpp
void box_blur_3x3(uint32_t* src, uint32_t* dst, int w, int h) {
    for (int y = 1; y < h - 1; y++) {
        for (int x = 1; x < w - 1; x++) {
            uint32_t rsum = 0, gsum = 0, bsum = 0;

            for (int ky = -1; ky <= 1; ky++) {
                for (int kx = -1; kx <= 1; kx++) {
                    uint32_t px = src[(y + ky) * w + (x + kx)];
                    rsum += (px >> 16) & 0xFF;
                    gsum += (px >> 8) & 0xFF;
                    bsum += px & 0xFF;
                }
            }

            dst[y * w + x] = (0xFF << 24)
                            | ((rsum / 9) << 16)
                            | ((gsum / 9) << 8)
                            | (bsum / 9);
        }
    }
}
```

> For backdrop-blur, apply 3 passes (H → V → H) as described in `NOVA_OS_ARCHITECTURE.md`.

---

## Build & Integration Notes

| Item | Value |
|------|-------|
| Language | C++17 minimum |
| SIMD | AVX2 (x86-64), NEON (AArch64) |
| Compile flags | `-mavx2 -O2 -std=c++17` |
| Tile size | 64×64 pixels (from `PERFORMANCE_RENDERING.md`) |
| Buffer alignment | 64-byte cache-line aligned (`aligned_alloc`) |
| Pixel format | ARGB8888 (alpha in high byte) |
| Framebuffer target | Linux `/dev/fb0` or DRM/KMS (Phase 3) |

### Related Documents

- `infra/docs/NOVA_OS_ARCHITECTURE.md` — system architecture & migration path
- `infra/docs/PERFORMANCE_RENDERING.md` — tile system, thread pool, damage tracker
- `generated/rendering-pipeline-manifest.json` — pipeline configuration manifest
