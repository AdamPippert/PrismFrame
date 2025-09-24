#!/usr/bin/env bash
set -euo pipefail

SRC=${1:-svg/prismframe_dark.svg}
OUTROOT=${2:-build}
mkdir -p "$OUTROOT"
mkdir -p "$OUTROOT/linux"
mkdir -p "$OUTROOT/mac/PrismFrame.iconset"

convert_svg() {
  local in_svg="$1"
  local out_png="$2"
  local size="$3"

  if command -v inkscape >/dev/null 2>&1; then
    inkscape -w "$size" -h "$size" "$in_svg" -o "$out_png"
  elif command -v rsvg-convert >/dev/null 2>&1; then
    rsvg-convert -w "$size" -h "$size" "$in_svg" -o "$out_png"
  elif command -v magick >/dev/null 2>&1; then
    magick -background none -density 512 "$in_svg" -resize "${size}x${size}" "$out_png"
  elif command -v convert >/dev/null 2>&1; then
    convert -background none -density 512 "$in_svg" -resize "${size}x${size}" "$out_png"
  else
    echo "No SVG→PNG converter found. Install inkscape, rsvg-convert, or ImageMagick."
    exit 1
  fi
}

# Linux sizes
for sz in 16 24 32 48 64 128 256 512; do
  convert_svg "$SRC" "$OUTROOT/linux/prismframe-${sz}.png" "$sz"
done

# macOS .iconset sizes
convert_svg "$SRC" "$OUTROOT/mac/PrismFrame.iconset/icon_16x16.png" 16
convert_svg "$SRC" "$OUTROOT/mac/PrismFrame.iconset/icon_16x16@2x.png" 32
convert_svg "$SRC" "$OUTROOT/mac/PrismFrame.iconset/icon_32x32.png" 32
convert_svg "$SRC" "$OUTROOT/mac/PrismFrame.iconset/icon_32x32@2x.png" 64
convert_svg "$SRC" "$OUTROOT/mac/PrismFrame.iconset/icon_128x128.png" 128
convert_svg "$SRC" "$OUTROOT/mac/PrismFrame.iconset/icon_128x128@2x.png" 256
convert_svg "$SRC" "$OUTROOT/mac/PrismFrame.iconset/icon_256x256.png" 256
convert_svg "$SRC" "$OUTROOT/mac/PrismFrame.iconset/icon_256x256@2x.png" 512
convert_svg "$SRC" "$OUTROOT/mac/PrismFrame.iconset/icon_512x512.png" 512
convert_svg "$SRC" "$OUTROOT/mac/PrismFrame.iconset/icon_512x512@2x.png" 1024

# Build .icns on macOS
if command -v iconutil >/dev/null 2>&1; then
  (cd "$OUTROOT/mac" && iconutil -c icns PrismFrame.iconset -o PrismFrame.icns)
  echo "Created $OUTROOT/mac/PrismFrame.icns"
else
  echo "iconutil not found; skipping .icns build. Use Xcode tools on macOS."
fi

echo "Done. Outputs in $OUTROOT/"
