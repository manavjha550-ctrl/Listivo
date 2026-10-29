export function buildStudioSampleDataUri(
  title: string,
  subtitle: string,
  accentHex: string = '#14B8A6',
  secondaryHex: string = '#101828'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#F1F5F9"/>
      </linearGradient>
    </defs>
    <rect width="1000" height="1000" fill="url(#bg)"/>
    <rect x="64" y="64" width="872" height="872" rx="36" fill="#FFFFFF" stroke="#E4E7EC" stroke-width="4"/>
    <circle cx="500" cy="420" r="190" fill="${accentHex}" fill-opacity="0.10"/>
    <rect x="360" y="250" width="280" height="340" rx="28" fill="${secondaryHex}"/>
    <rect x="392" y="286" width="216" height="180" rx="16" fill="${accentHex}" fill-opacity="0.88"/>
    <rect x="392" y="492" width="140" height="22" rx="8" fill="#FFFFFF" fill-opacity="0.85"/>
    <rect x="392" y="528" width="96" height="16" rx="6" fill="#98A2B3"/>
    <text x="500" y="720" text-anchor="middle" font-family="Plus Jakarta Sans, Inter, sans-serif" font-size="38" font-weight="700" fill="#101828">${title}</text>
    <text x="500" y="772" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="24" font-weight="500" fill="#667085">${subtitle}</text>
    <text x="500" y="868" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="20" font-weight="600" fill="${accentHex}">1000 × 1000 PX · 1:1 STUDIO FRAME</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const STUDIO_FALLBACK_DATA_URI = buildStudioSampleDataUri(
  'Catalog Product Image',
  'Preview Unavailable',
  '#667085',
  '#1D2939'
);

export const STUDIO_CATALOG_SAMPLES = [
  {
    id: 'studio-sample-1',
    label: 'Kurti Front Frame',
    title: 'Rayon Kurti Front Studio Shot',
    url: buildStudioSampleDataUri('Rayon Kurti — Front View', 'SKU-KRT-101 · PRIMARY', '#14B8A6', '#101828'),
  },
  {
    id: 'studio-sample-2',
    label: 'Fabric Weave Detail',
    title: 'Fabric & Foil Print Macro',
    url: buildStudioSampleDataUri('Fabric & Print Detail', 'SKU-KRT-101 · MACRO', '#0D9488', '#1E293B'),
  },
  {
    id: 'studio-sample-3',
    label: 'Size & Fit Guide',
    title: 'Apparel Measurement Chart',
    url: buildStudioSampleDataUri('Measurement & Fit Guide', 'S · M · L · XL · XXL', '#60A5FA', '#101828'),
  },
  {
    id: 'studio-sample-4',
    label: 'Footwear Profile',
    title: 'Sneaker Lateral Studio Angle',
    url: buildStudioSampleDataUri('Casual Sneaker — Profile', 'SKU-SNK-204 · 1:1', '#14B8A6', '#0F172A'),
  },
];
