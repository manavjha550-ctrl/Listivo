import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

async function buildExtension() {
  console.log('[LISTIVO Extension Build] Starting extension bundle build...');

  const rootDir = process.cwd();
  const extDir = path.join(rootDir, 'extension');
  const distDir = path.join(extDir, 'dist');

  // Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // 1. Build Background Service Worker (ESM format for MV3)
  await esbuild.build({
    entryPoints: [path.join(extDir, 'background', 'service-worker.ts')],
    bundle: true,
    outfile: path.join(distDir, 'background', 'service-worker.js'),
    format: 'esm',
    target: 'chrome100',
    sourcemap: false,
    minify: false,
  });

  // 2. Build Content Script (IIFE format for MV3 injection)
  await esbuild.build({
    entryPoints: [path.join(extDir, 'content', 'content-script.ts')],
    bundle: true,
    outfile: path.join(distDir, 'content', 'content-script.js'),
    format: 'iife',
    target: 'chrome100',
    sourcemap: false,
    minify: false,
  });

  // 3. Build Popup React Bundle
  await esbuild.build({
    entryPoints: [path.join(extDir, 'popup', 'main.tsx')],
    bundle: true,
    outfile: path.join(distDir, 'popup', 'main.js'),
    format: 'iife',
    target: 'chrome100',
    jsx: 'automatic',
    sourcemap: false,
    minify: false,
  });

  // 4. Copy HTML, CSS, Icons, Manifest
  fs.mkdirSync(path.join(distDir, 'popup'), { recursive: true });
  fs.mkdirSync(path.join(distDir, 'icons'), { recursive: true });

  // Popup HTML
  const popupHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LISTIVO Assistant</title>
    <link rel="stylesheet" href="./popup.css" />
  </head>
  <body class="bg-[#0B0F19] text-slate-100 antialiased m-0 p-0 font-sans">
    <div id="root"></div>
    <script src="./main.js"></script>
  </body>
</html>`;
  fs.writeFileSync(path.join(distDir, 'popup', 'index.html'), popupHtmlContent);

  // Popup CSS
  if (fs.existsSync(path.join(extDir, 'popup', 'popup.css'))) {
    fs.copyFileSync(
      path.join(extDir, 'popup', 'popup.css'),
      path.join(distDir, 'popup', 'popup.css')
    );
  }

  // Icons
  const iconFiles = fs.readdirSync(path.join(extDir, 'icons'));
  for (const file of iconFiles) {
    fs.copyFileSync(path.join(extDir, 'icons', file), path.join(distDir, 'icons', file));
  }

  // Manifest JSON
  fs.copyFileSync(path.join(extDir, 'manifest.json'), path.join(distDir, 'manifest.json'));

  console.log('[LISTIVO Extension Build] Extension successfully built to /extension/dist/');
}

buildExtension().catch((err) => {
  console.error('[LISTIVO Extension Build Error]', err);
  process.exit(1);
});
