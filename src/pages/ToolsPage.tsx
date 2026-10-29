import React, { useState, useRef } from 'react';
import { Upload, Download, FileCheck2, PackageCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

interface LabelInspectionSummary {
  fileName: string;
  sizeKb: number;
  pageCount: number;
  detectedSkus: string[];
  detectedPincodes: string[];
}

export const ToolsPage: React.FC = () => {
  const { user } = useAuth();
  const defaultStoreName = user?.companyName || user?.fullName || 'Your Store';
  const defaultContact = user?.email || '';

  const [storeTitle, setStoreTitle] = useState(defaultStoreName);
  const [cardHeadline, setCardHeadline] = useState('Thank You For Your Order');
  const [cardNote, setCardNote] = useState(
    'We appreciate your purchase. Every item is quality-checked before dispatch. If you love your product, your review helps our store grow.'
  );
  const [contactLine, setContactLine] = useState(defaultContact);

  const [labelSummary, setLabelSummary] = useState<LabelInspectionSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInspectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const pageMatches = text.match(/\/Type\s*\/Page\b/g);
    const pageCount = pageMatches ? pageMatches.length : 1;

    const skuMatches = Array.from(new Set(text.match(/\bSKU[-_A-Z0-9]{3,16}\b/gi) || [])).slice(0, 6);
    const pinMatches = Array.from(new Set(text.match(/\b[1-8][0-9]{5}\b/g) || [])).slice(0, 6);

    setLabelSummary({
      fileName: file.name,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
      pageCount,
      detectedSkus: skuMatches,
      detectedPincodes: pinMatches,
    });

    e.target.value = '';
  };

  const handleDownloadCardSvg = () => {
    const safeStore = (storeTitle || defaultStoreName).replace(/[<>&"]/g, '');
    const safeHead = cardHeadline.replace(/[<>&"]/g, '');
    const safeNote = cardNote.slice(0, 160).replace(/[<>&"]/g, '');
    const safeContact = contactLine.replace(/[<>&"]/g, '');

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="540" viewBox="0 0 900 540">
  <rect width="900" height="540" rx="24" fill="#101828"/>
  <rect x="28" y="28" width="844" height="484" rx="16" fill="none" stroke="#14B8A6" stroke-opacity="0.45" stroke-width="2"/>
  <text x="64" y="108" font-family="Plus Jakarta Sans, Inter, sans-serif" font-size="16" font-weight="700" letter-spacing="2" fill="#14B8A6">${safeStore.toUpperCase()}</text>
  <text x="64" y="176" font-family="Plus Jakarta Sans, Inter, sans-serif" font-size="36" font-weight="700" fill="#FFFFFF">${safeHead}</text>
  <text x="64" y="252" font-family="Plus Jakarta Sans, Inter, sans-serif" font-size="18" fill="#D0D5DD">${safeNote.slice(0, 80)}</text>
  <text x="64" y="284" font-family="Plus Jakarta Sans, Inter, sans-serif" font-size="18" fill="#D0D5DD">${safeNote.slice(80, 160)}</text>
  <line x1="64" y1="420" x2="836" y2="420" stroke="#1D2939" stroke-width="2"/>
  <text x="64" y="462" font-family="JetBrains Mono, monospace" font-size="15" fill="#98A2B3">Seller Support: ${safeContact || safeStore}</text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeStore.toLowerCase().replace(/\s+/g, '-') || 'seller'}-insert-card.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="border-b border-[#E4E7EC] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101828]">Packaging & Dispatch Utilities</h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Inspect shipping label PDFs locally and generate printable package insert cards for marketplace orders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* A. Shipping Label Inspector */}
        <Card
          title="01. Shipping Label File Inspector"
          subtitle="Inspect label PDFs or manifest CSVs locally in your browser"
          className="border-[#E4E7EC]"
        >
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.csv"
              onChange={handleInspectFile}
              className="hidden"
            />
            <div className="p-8 border border-dashed border-[#D0D5DD] rounded-xl text-center bg-[#F8FAFC]">
              <div className="w-10 h-10 rounded-lg bg-white border border-[#E4E7EC] flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5 text-[#0F766E]" />
              </div>
              <h4 className="text-xs font-semibold text-[#101828]">Select Shipping Label PDF or Manifest</h4>
              <p className="text-xs text-[#667085] mt-1">
                Counts label pages and scans uncompressed text streams for SKU and pincode tokens
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
            </div>

            {labelSummary && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-2">
                  <span className="font-semibold text-[#101828] flex items-center gap-1.5 truncate">
                    <FileCheck2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <span className="truncate">{labelSummary.fileName}</span>
                  </span>
                  <span className="font-mono tabular-nums text-[#667085] shrink-0">
                    {labelSummary.sizeKb} KB · {labelSummary.pageCount} page{labelSummary.pageCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex justify-between text-[#475467]">
                  <span>Detected SKUs</span>
                  <span className="font-mono text-[#101828]">
                    {labelSummary.detectedSkus.length > 0
                      ? labelSummary.detectedSkus.join(', ')
                      : 'Compressed PDF stream'}
                  </span>
                </div>
                <div className="flex justify-between text-[#475467]">
                  <span>Detected Pincodes</span>
                  <span className="font-mono tabular-nums text-[#101828]">
                    {labelSummary.detectedPincodes.length > 0 ? labelSummary.detectedPincodes.join(', ') : '—'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* B. Thank You Card Maker */}
        <Card
          title="02. Package Insert Card Studio"
          subtitle="Create a clean printable insert card for dispatched parcels"
          className="border-[#E4E7EC]"
        >
          <div className="space-y-4">
            {/* Live Preview */}
            <div className="p-5 bg-[#101828] text-white rounded-xl border border-[#1D2939] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#14B8A6]">
                  {storeTitle || defaultStoreName}
                </span>
                <PackageCheck className="w-4 h-4 text-[#14B8A6]" />
              </div>
              <h4 className="text-base font-bold text-white">{cardHeadline}</h4>
              <p className="text-xs text-[#D0D5DD] leading-relaxed">{cardNote}</p>
              <div className="pt-2.5 border-t border-white/10 text-[11px] font-mono text-[#98A2B3]">
                Support: {contactLine || storeTitle || defaultStoreName}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Store Header"
                value={storeTitle}
                onChange={(e) => setStoreTitle(e.target.value)}
                placeholder="Store Name"
              />
              <Input
                label="Card Headline"
                value={cardHeadline}
                onChange={(e) => setCardHeadline(e.target.value)}
                placeholder="Thank You For Your Order"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101828] mb-1.5">Customer Message</label>
              <textarea
                rows={2}
                value={cardNote}
                onChange={(e) => setCardNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828] focus:outline-none focus:border-[#14B8A6]"
              />
            </div>

            <Input
              label="Support Email / Contact"
              value={contactLine}
              onChange={(e) => setContactLine(e.target.value)}
              placeholder="support@yourstore.in"
            />

            <Button
              type="button"
              variant="teal"
              size="sm"
              className="w-full justify-center"
              onClick={handleDownloadCardSvg}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Download Printable Insert Card (.SVG)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
