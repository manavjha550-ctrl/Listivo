import React, { useState } from 'react';
import { Type, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TitleOptimizationResult } from '../types/keywordTypes';
import { keywordApiService } from '../services/keywordApiService';

interface TitleBuilderSectionProps {
  selectedKeywords: string[];
  productName: string;
  marketplace: string;
  onApplyToListing?: (title: string) => void;
}

export const TitleBuilderSection: React.FC<TitleBuilderSectionProps> = ({
  selectedKeywords,
  productName,
  marketplace,
  onApplyToListing,
}) => {
  const [result, setResult] = useState<TitleOptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customBrand, setCustomBrand] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBuildTitle = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await keywordApiService.optimizeTitle({
        keywords: selectedKeywords,
        productName: productName || 'Product',
        marketplace: marketplace || 'meesho',
        brand: customBrand || 'Generic',
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to generate title.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.title) return;
    navigator.clipboard.writeText(result.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card padding="md" className="border-[#E4E7EC] bg-white space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-[#E4E7EC] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/25 text-[#0F766E] flex items-center justify-center">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#101828]">02. Title Builder</h3>
            <p className="text-[11px] text-[#667085]">Compose compliant search titles</p>
          </div>
        </div>
        <Button
          size="xs"
          variant="primary"
          onClick={handleBuildTitle}
          isLoading={isLoading}
          icon={<Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />}
        >
          {result ? 'Rebuild' : 'Build Title'}
        </Button>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[11px] font-semibold text-[#475467] mb-1 uppercase tracking-wider">
            Brand Prefix (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Royal Ethnic"
            value={customBrand}
            onChange={(e) => setCustomBrand(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
          />
        </div>
        <div className="text-xs text-[#667085] pb-1.5">
          Active Pool:{' '}
          <strong className="font-mono tabular-nums text-[#101828]">{selectedKeywords.length}</strong> terms
        </div>
      </div>

      {result && (
        <div className="space-y-3 pt-3 border-t border-[#E4E7EC]">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#667085] mb-1.5">
              <span className="uppercase tracking-wider">{marketplace} Title</span>
              <span
                className={`font-mono tabular-nums ${
                  result.characterCount > result.maxAllowedCharacters ? 'text-rose-600' : 'text-[#0F766E]'
                }`}
              >
                {result.characterCount}/{result.maxAllowedCharacters} chars
              </span>
            </div>
            <div className="p-3 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg text-xs font-semibold text-[#101828] leading-relaxed">
              {result.title}
            </div>
          </div>

          {result.usedKeywords && result.usedKeywords.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-[#667085] block mb-1">Terms Incorporated</span>
              <p className="text-xs text-[#0F766E] font-medium leading-relaxed">
                {result.usedKeywords.join(' · ')}
              </p>
            </div>
          )}

          {result.warnings && result.warnings.length > 0 && (
            <div className="space-y-1">
              {result.warnings.map((warn, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              size="xs"
              variant="outline"
              onClick={handleCopy}
              icon={copied ? <Check className="w-3 h-3 text-[#0F766E]" /> : <Copy className="w-3 h-3" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>

            {onApplyToListing && (
              <Button size="xs" variant="teal" onClick={() => onApplyToListing(result.title)}>
                Use Title
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
