# NovaOS — Bootable Minimal OS Prototype Spec

> Target: Phase 3 of the NovaOS migration path.
> This spec documents the bare-metal boot pipeline that connects the compositor/rasterizer (see `COMPOSITOR_RASTERIZER_SPEC.md`) to real hardware.

---

## 1. Bootloader (GRUB)

```
# grub.cfg
menuentry "NovaOS" {
    multiboot /boot/kernel.bin
}
```

GRUB loads `kernel.bin` as a multiboot-compliant ELF binary.

---

## 2. Kernel Entry Point

```cpp
#include "compositor.h"
#include "framebuffer.h"

extern "C" void kernel_main() {
    init_framebuffer();   // map video memory
    init_compositor();    // set up surface list, damage tracker

    while (1) {
        handle_input();   // poll keyboard/mouse
        update_windows(); // drag physics, focus changes
        composite();      // blend all surfaces → framebuffer
    }
}
```

The kernel runs a continuous update/render loop — no OS scheduler yet. Input and rendering are synchronous in Phase 3.

---

## 3. Framebuffer Access

### Linux (`/dev/fb0`)
```cpp
#include <fcntl.h>
#include <sys/mman.h>

int fd = open("/dev/fb0", O_RDWR);
uint32_t* framebuffer = (uint32_t*)mmap(
    NULL, width * height * 4,
    PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0
);
```

### Bare Metal (multiboot)
```cpp
// Address provided by bootloader in multiboot info struct
uint32_t* framebuffer = (uint32_t*)multiboot_info->framebuffer_addr;
int width  = multiboot_info->framebuffer_width;
int height = multiboot_info->framebuffer_height;
```

---

## 4. Simple Draw Test

```cpp
// Fill entire screen blue — first visual proof of life
for (int i = 0; i < width * height; i++) {
    framebuffer[i] = 0xFF0000FF; // ARGB: opaque blue
}
```

---

## 5. Compositor Integration

```cpp
#include "compositor.h"

Framebuffer fb = {
    .pixels = framebuffer,
    .width  = width,
    .height = height,
};

// Create test surfaces
Surface desktop = create_surface(width, height);
fill_rect(desktop.buffer, desktop.stride, 0, 0, width, height, 0xFF202020);

Surface window1 = create_surface(400, 300);
window1.x = 100;
window1.y = 80;
fill_rect(window1.buffer, window1.stride, 0, 0, 400, 300, 0xE0FFFFFF);

std::vector<Surface*> surfaces = { &desktop, &window1 };
composite(fb, surfaces);
```

---

## 6. Build System

### Cross-Compiler Toolchain
```bash
# Install cross-compiler (Ubuntu/Debian)
sudo apt install g++-x86-64-linux-gnu

# Compile (freestanding — no stdlib)
x86_64-elf-g++ -ffreestanding -nostdlib -c kernel.cpp -o kernel.o
x86_64-elf-g++ -ffreestanding -nostdlib -c compositor.cpp -o compositor.o
x86_64-elf-g++ -ffreestanding -nostdlib -c rasterizer.cpp -o rasterizer.o

# Link
ld -T linker.ld -o kernel.bin kernel.o compositor.o rasterizer.o
```

### Linker Script (`linker.ld`)
```ld
ENTRY(kernel_main)

SECTIONS {
    . = 1M;  /* Load at 1MB mark */

    .text : { *(.text) }
    .data : { *(.data) }
    .bss  : { *(.bss)  }
}
```

---

## 7. Running in QEMU

```bash
# Boot the kernel in a virtual machine
qemu-system-x86_64 -kernel kernel.bin

# With serial console for debug output
qemu-system-x86_64 -kernel kernel.bin -serial stdio

# With specific resolution
qemu-system-x86_64 -kernel kernel.bin -vga std
```

---

## 8. Full System Pipeline

```
Hardware Input (mouse/keyboard)
        ↓
   Input Driver
        ↓
   Window Manager (drag, focus, snap)
        ↓
   UI Toolkit (views, layout)
        ↓
   CPU Rasterizer (SIMD-accelerated)
        ↓
   Compositor (alpha blend, z-order)
        ↓
   Framebuffer (RAM)
        ↓
   Display Controller → Screen
```

---

## 9. Phase 3 Milestones

| # | Milestone | Deliverable |
|---|-----------|------------|
| 1 | Blue screen boot | `kernel.bin` boots in QEMU, fills framebuffer blue |
| 2 | Compositor boot | Two surfaces composited on screen |
| 3 | Mouse input | Cursor movement via PS/2 or USB HID |
| 4 | Window drag | Pointer capture + surface position update |
| 5 | Full desktop | Desktop bg + 2 windows + dock bar rendered |

---

## References

- [`COMPOSITOR_RASTERIZER_SPEC.md`](./COMPOSITOR_RASTERIZER_SPEC.md) — C++ compositor and rasterizer implementation
- [`NOVA_OS_ARCHITECTURE.md`](./NOVA_OS_ARCHITECTURE.md) — Full architecture and migration path
- [`rendering-pipeline-manifest.json`](../../generated/rendering-pipeline-manifest.json) — Pipeline configuration
