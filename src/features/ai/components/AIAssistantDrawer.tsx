import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Wand2,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  Send,
  Layers,
  Type,
  FileText,
  Key,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { aiApiService } from '../services/aiApiService';
import { AIUsageBadge } from './AIUsageBadge';
import { ValidationResult } from '../types/ai';

export interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'title' | 'description' | 'bullets' | 'keywords' | 'attributes' | 'refine';
  contextData?: {
    title?: string;
    brand?: string;
    category?: string;
    subCategory?: string;
    material?: string;
    color?: string;
    marketplace?: string;
    price?: number;
    mrp?: number;
    keyFeatures?: string[];
    currentText?: string;
    productId?: string;
  };
  onApply?: (field: string, value: any) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  initialMode = 'title',
  contextData = {} as NonNullable<AIAssistantDrawerProps['contextData']>,
  onApply,
}) => {
  const [activeTab, setActiveTab] = useState(initialMode);
  const [tone, setTone] = useState<'professional' | 'seo' | 'festive' | 'concise'>('professional');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [editedValue, setEditedValue] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setErrorMessage(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedResult(null);
    setValidation(null);
    setErrorMessage(null);

    try {
      if (activeTab === 'title') {
        const res = await aiApiService.generateTitle({
          ...contextData,
          rawText: customPrompt || contextData?.title,
        });
        setGeneratedResult(res);
        setEditedValue(res.recommendedTitle);
        setValidation(res.validation);
      } else if (activeTab === 'description') {
        const res = await aiApiService.generateDescription({
          ...contextData,
          tone,
          customInstructions: customPrompt,
        });
        setGeneratedResult(res);
        setEditedValue(res.description);
        setValidation(res.validation);
      } else if (activeTab === 'bullets') {
        const res = await aiApiService.generateBullets({
          ...contextData,
          rawText: customPrompt,
        });
        setGeneratedResult(res);
        setEditedValue(res.bulletPoints);
      } else if (activeTab === 'keywords') {
        const res = await aiApiService.generateKeywords({
          ...contextData,
        });
        setGeneratedResult(res);
        setEditedValue(res);
      } else if (activeTab === 'attributes') {
        const res = await aiApiService.generateAttributes({
          ...contextData,
          rawText: customPrompt,
        });
        setGeneratedResult(res.attributes);
        setEditedValue(res.attributes);
      } else if (activeTab === 'refine') {
        const res = await aiApiService.refineText({
          text: contextData?.currentText || customPrompt,
          instruction: customPrompt || 'Optimize for readability and SEO',
          ...contextData,
        });
        setGeneratedResult(res);
        setEditedValue(res.refinedText);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Content generation encountered an issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyClick = () => {
    if (!onApply) return;

    if (activeTab === 'title') {
      onApply('title', editedValue);
    } else if (activeTab === 'description') {
      onApply('description', editedValue);
      if (generatedResult?.keyFeatures) {
        onApply('keyFeatures', generatedResult.keyFeatures);
      }
    } else if (activeTab === 'bullets') {
      onApply('keyFeatures', editedValue);
    } else if (activeTab === 'keywords') {
      const allKw = [
        ...(editedValue.primaryKeywords || []),
        ...(editedValue.secondaryKeywords || []),
      ];
      onApply('tags', allKw);
    } else if (activeTab === 'attributes') {
      onApply('attributes', editedValue);
    } else if (activeTab === 'refine') {
      onApply('currentText', editedValue);
    }

    onClose();
  };

  const quickPromptChips = [
    'Make shorter & mobile-friendly',
    'Add festive India search terms',
    'Highlight fabric & wash care',
    'Format for Meesho compliance',
    'High-conversion catalog tone',
  ];

  const tabs: Array<{ id: NonNullable<AIAssistantDrawerProps['initialMode']>; label: string; icon: React.ReactNode }> = [
    { id: 'title', label: 'Title', icon: <Type className="w-3.5 h-3.5" /> },
    { id: 'description', label: 'Description', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'bullets', label: 'Bullet Points', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'keywords', label: 'Keywords', icon: <Key className="w-3.5 h-3.5" /> },
    { id: 'attributes', label: 'Attributes', icon: <Tag className="w-3.5 h-3.5" /> },
    { id: 'refine', label: 'Refine Text', icon: <Wand2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#101828]/50 backdrop-blur-[2px] flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-[#E4E7EC]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1D2939] flex items-center justify-between bg-[#101828] text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/15 border border-[#14B8A6]/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#14B8A6]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white">LISTIVO Copy Assistant</h2>
              <p className="text-xs text-[#98A2B3]">Generate, refine, and validate marketplace catalog copy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant"
            className="p-1.5 rounded-lg text-[#98A2B3] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-[#F8FAFC] border-b border-[#E4E7EC] overflow-x-auto text-xs font-medium">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setErrorMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#101828] text-white font-semibold shadow-2xs'
                  : 'text-[#667085] hover:text-[#101828] hover:bg-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Usage status bar */}
        <div className="px-5 py-2.5 bg-white border-b border-[#E4E7EC] flex flex-wrap items-center justify-between gap-2 text-xs">
          <AIUsageBadge />
          <span className="text-[#667085] font-medium">
            Target Marketplace:{' '}
            <strong className="text-[#101828] uppercase tracking-wide">
              {contextData?.marketplace || 'Meesho'}
            </strong>
          </span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#F8FAFC]">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Controls & Tone Selector */}
          <div className="space-y-3.5 bg-white p-4 rounded-xl border border-[#E4E7EC]">
            {activeTab === 'description' && (
              <div>
                <label className="text-xs font-semibold text-[#101828] block mb-1.5">Copywriting Tone</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'professional', label: 'Professional' },
                    { id: 'seo', label: 'Search Dense' },
                    { id: 'festive', label: 'Festive India' },
                    { id: 'concise', label: 'Concise Mobile' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id as any)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs text-center transition-colors ${
                        tone === t.id
                          ? 'bg-[#101828] border-[#101828] text-white font-semibold'
                          : 'bg-[#F8FAFC] border-[#E4E7EC] text-[#475467] hover:bg-white hover:text-[#101828]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#101828] block mb-1.5">
                {activeTab === 'refine' ? 'Refinement Instruction' : 'Product Focus / Optional Instructions'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder={
                    activeTab === 'refine'
                      ? 'e.g. Make it concise and highlight wash care'
                      : 'e.g. Highlight breathable rayon fabric and foil print'
                  }
                  className="flex-1 text-xs px-3 py-2 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] bg-white text-[#101828]"
                />
                <Button size="sm" variant="teal" onClick={handleGenerate} isLoading={isLoading}>
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Run
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-[#667085] mr-1">Presets:</span>
              {quickPromptChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCustomPrompt(chip)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E4E7EC] text-[#475467] hover:border-[#14B8A6] hover:text-[#0F766E] transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Result Output Preview Card */}
          {generatedResult ? (
            <div className="space-y-4 bg-white p-4 rounded-xl border border-[#E4E7EC]">
              <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                  Generated Output Preview
                </h3>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() =>
                    handleCopy(
                      typeof editedValue === 'string' ? editedValue : JSON.stringify(editedValue, null, 2)
                    )
                  }
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#0F766E] mr-1" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 mr-1" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>

              {validation && validation.issues.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Marketplace Compliance Notices</span>
                  </div>
                  {validation.issues.map((issue, idx) => (
                    <p key={idx} className="text-amber-800 pl-5">
                      • {issue.message}
                    </p>
                  ))}
                </div>
              )}

              {activeTab === 'title' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#101828] block mb-1">
                      Recommended Title (Editable)
                    </label>
                    <input
                      type="text"
                      value={editedValue}
                      onChange={(e) => setEditedValue(e.target.value)}
                      className="w-full text-xs font-medium p-3 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] bg-[#F8FAFC] text-[#101828]"
                    />
                  </div>

                  {generatedResult.alternativeTitles && generatedResult.alternativeTitles.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-semibold text-[#667085] block">Alternative Title Options</span>
                      {generatedResult.alternativeTitles.map((alt: string, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditedValue(alt)}
                          className="w-full text-left p-2.5 bg-[#F8FAFC] hover:bg-[#14B8A6]/5 border border-[#E4E7EC] hover:border-[#14B8A6] rounded-lg text-xs text-[#101828] transition-colors"
                        >
                          {alt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(activeTab === 'description' || activeTab === 'refine') && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#101828] block mb-1">Description (Editable)</label>
                    <textarea
                      rows={5}
                      value={editedValue}
                      onChange={(e) => setEditedValue(e.target.value)}
                      className="w-full text-xs p-3 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] bg-[#F8FAFC] text-[#101828] leading-relaxed"
                    />
                  </div>

                  {generatedResult.keyFeatures && (
                    <div>
                      <label className="text-xs font-semibold text-[#101828] block mb-1">Key Feature Highlights</label>
                      <ul className="space-y-1.5 bg-[#F8FAFC] p-3 rounded-lg border border-[#E4E7EC] text-xs text-[#475467]">
                        {generatedResult.keyFeatures.map((feat: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#0F766E] font-bold">•</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bullets' && (
                <div>
                  <label className="text-xs font-semibold text-[#101828] block mb-1.5">Generated Bullet Points</label>
                  <div className="space-y-2">
                    {Array.isArray(editedValue) &&
                      editedValue.map((bullet: string, idx: number) => (
                        <input
                          key={idx}
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const newArr = [...editedValue];
                            newArr[idx] = e.target.value;
                            setEditedValue(newArr);
                          }}
                          className="w-full text-xs p-2.5 border border-[#D0D5DD] rounded-lg bg-[#F8FAFC] text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
                        />
                      ))}
                  </div>
                </div>
              )}

              {activeTab === 'keywords' && generatedResult && (
                <div className="space-y-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E4E7EC] text-xs">
                  <div>
                    <span className="font-semibold text-[#101828] block mb-1.5">Primary Search Terms</span>
                    <p className="text-[#0F766E] font-medium leading-relaxed">
                      {(generatedResult.primaryKeywords || []).join(' · ')}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-[#101828] block mb-1.5">Secondary & Long-Tail Phrases</span>
                    <p className="text-[#475467] leading-relaxed">
                      {[...(generatedResult.secondaryKeywords || []), ...(generatedResult.longTailKeywords || [])].join(
                        ' · '
                      )}
                    </p>
                  </div>

                  {generatedResult.disclaimer && (
                    <p className="text-[11px] text-[#667085] pt-2 border-t border-[#E4E7EC]">
                      {generatedResult.disclaimer}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'attributes' && (
                <div className="border border-[#E4E7EC] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8FAFC] font-semibold text-[#475467] border-b border-[#E4E7EC]">
                      <tr>
                        <th className="py-2.5 px-3">Attribute</th>
                        <th className="py-2.5 px-3">Inferred Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7EC]">
                      {Array.isArray(editedValue) &&
                        editedValue.map((attr: any, idx: number) => (
                          <tr key={idx} className="hover:bg-[#F8FAFC]">
                            <td className="py-2.5 px-3 font-medium text-[#667085]">{attr.label || attr.key}</td>
                            <td className="py-2.5 px-3 text-[#101828] font-semibold">{attr.value}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-white rounded-xl border border-dashed border-[#D0D5DD]">
              <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] flex items-center justify-center mx-auto mb-3">
                <Wand2 className="w-5 h-5 text-[#0F766E]" />
              </div>
              <h3 className="font-semibold text-sm text-[#101828]">Ready to Generate Copy</h3>
              <p className="text-xs text-[#667085] max-w-sm mx-auto mt-1 mb-4">
                Generate marketplace-compliant copy structured for Meesho, Flipkart, Amazon India, and Myntra.
              </p>
              <Button size="sm" variant="teal" onClick={handleGenerate} isLoading={isLoading}>
                <Sparkles className="w-4 h-4 mr-1.5" /> Generate Content
              </Button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 border-t border-[#E4E7EC] bg-white flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleGenerate} isLoading={isLoading}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Regenerate
            </Button>
            {onApply && (
              <Button variant="primary" size="sm" onClick={handleApplyClick} disabled={!editedValue}>
                <Check className="w-3.5 h-3.5 mr-1.5" /> Apply to Listing
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
