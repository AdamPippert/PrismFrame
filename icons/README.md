# PrismFrame Icon Kit

Vector icon for PrismFrame (modernized eDEX-UI). This mark fuses a **prism** (triangular glass) with a **frame** (rounded-square outline). Clean geometry, minimal details, and high contrast to read well from 16px to 1024px.

## Files
- `svg/prismframe_dark.svg` — transparent background, dark lines + rainbow spectrum (best on light UIs).
- `svg/prismframe_light.svg` — deep navy background, light lines + rainbow (preview on dark UIs).
- `svg/prismframe_monochrome.svg` — single-colour variant for tiny sizes or constrained palettes.

## Quick export
```bash
cd prismframe_icon_kit
./scripts/export_icons.sh svg/prismframe_dark.svg build
# or choose a different variant:
# ./scripts/export_icons.sh svg/prismframe_light.svg build
# ./scripts/export_icons.sh svg/prismframe_monochrome.svg build
```

This will generate:
- Linux PNGs: `build/linux/prismframe-{16,24,32,48,64,128,256,512}.png`
- macOS iconset: `build/mac/PrismFrame.iconset/*`
- macOS `.icns` (if `iconutil` is present): `build/mac/PrismFrame.icns`

## Colour palette
- Frame & prism (dark): `#0F172A` (slate-900)
- Light variant keyline: `#F8FAFC` (slate-50) on `#0B1020` bg
- Spectrum: `#F87171`, `#F59E0B`, `#FBBF24`, `#34D399`, `#60A5FA`, `#A78BFA`
- Monochrome accent: `#2563EB`

## Guidance
- Use **dark** variant by default on light backgrounds; use **light** variant on dark backgrounds.
- Prefer **monochrome** at very small sizes (<24px) for clarity.
- The design leaves the outer rounded square **unfilled** so macOS applies its platform mask cleanly.
- Safe area: keep text and overlays inside the inner 80% of the canvas.

## License
CC0 (Public Domain). Free to use, modify, and redistribute.
