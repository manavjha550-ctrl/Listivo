import fs from 'fs';
import path from 'path';

// Minimal 1x1 valid PNG buffer generator or clean PNG icon writer
function generateMinimalPng(size) {
  // A valid 1x1 transparent/indigo PNG buffer expanded with header
  // Header bytes for a PNG image
  const pngHeader = Buffer.from([
    137, 80, 78, 71, 13, 10, 26, 10, // Magic PNG signature
    0, 0, 0, 13, 73, 72, 68, 82,   // IHDR chunk
    0, 0, 0, size, 0, 0, 0, size,  // Width and Height
    8, 6, 0, 0, 0                  // 8-bit RGBA, no compression/filter
  ]);

  // We can write a clean SVG icon and reference it or output clean PNG data
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
}

const iconsDir = path.join(process.cwd(), 'extension', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach((size) => {
  const iconPath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(iconPath, generateMinimalPng(size));
  console.log(`Generated extension icon: ${iconPath}`);
});
