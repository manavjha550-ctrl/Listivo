import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  Save,
  ArrowRight,
  Type,
  FileText,
  Key,
  Tag,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { aiApiService } from '../features/ai/services/aiApiService';
import { QualityScoreWidget } from '../features/ai/components/QualityScoreWidget';
import { AIUsageBadge } from '../features/ai/components/AIUsageBadge';
import { SmartListingData } from '../features/ai/types/ai';

export const SmartListingsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');
  const [rawInput, setRawInput] = useState('');
  const [marketplace, setMarketplace] = useState<'meesho' | 'flipkart' | 'amazon'>('meesho');
  const [brand, setBrand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [result, setResult] = useState<SmartListingData | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSavedDrafts();
  }, []);

  useEffect(() => {
    const incomingKeywords = (location.state as any)?.keywords;
    if (Array.isArray(incomingKeywords) && incomingKeywords.length > 0) {
      setRawInput(`Target Keywords: ${incomingKeywords.join(', ')}`);
      setNotice({
        type: 'success',
        message: `Loaded ${incomingKeywords.length} research keywords into Smart Listing notes.`,
      });
    }
  }, [location.state]);

  const fetchSavedDrafts = async () => {
    try {
      const res = await fetch('/api/ai/smart-listing');
      const json = await res.json();
      if (json.success) {
        setSavedDrafts(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch smart listing drafts:', err);
    }
  };

  const handleGenerate = async () => {
    if (!rawInput.trim()) {
      setNotice({ type: 'error', message: 'Enter product specifications or raw catalog notes before generating.' });
      return;
    }

    setNotice(null);
    setIsLoading(true);
    try {
      const generated = await aiApiService.generateSmartListing({
        rawText: rawInput,
        marketplace,
        brand,
      });
      setResult(generated);
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Smart listing generation failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveDraft = async () => {
    if (!result) return;
    setSaving(true);
    setNotice(null);
    try {
      await aiApiService.saveSmartListing({
        ...result,
        marketplace,
        brand,
        rawInput,
      });
      setNotice({ type: 'success', message: 'Smart Listing draft saved to your workspace.' });
      fetchSavedDrafts();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to save draft.' });
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToListing = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await aiApiService.saveSmartListing({
        ...result,
        marketplace,
        brand,
        rawInput,
      });
    } catch {
      // Proceed to listing editor even if draft save already exists
    } finally {
      setSaving(false);
    }

    const keywordsList = [
      ...(result.keywords?.primaryKeywords || []),
      ...(result.keywords?.secondaryKeywords || []),
    ];
    navigate('/listings/new', {
      state: {
        prefilledSmartListing: {
          title: result.title,
          description: result.description,
          brand,
          marketplace,
          keyFeatures: result.keyFeatures,
          attributes: result.attributes,
        },
        prefilledKeywords: keywordsList,
        keywordsString: keywordsList.join(', '),
      },
    });
  };

  const sampleInputs = [
    'Women printed rayon straight kurti round neck yellow sizes M to XXL Rs 449 Meesho',
    'Velvet glass bangles set 24 pieces bridal maroon gold stone work Rs 279 Meesho',
    'Unisex white casual sneakers synthetic upper memory foam insole Rs 899 Flipkart',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101828]">Smart Listing Studio</h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Convert raw supplier specs or product notes into structured, policy-compliant marketplace catalog copy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AIUsageBadge />
          <div className="flex rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-white text-[#101828] shadow-2xs font-semibold border border-[#E4E7EC]/60'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Generator</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'saved'
                  ? 'bg-white text-[#101828] shadow-2xs font-semibold border border-[#E4E7EC]/60'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              Saved Drafts (<span className="font-mono tabular-nums">{savedDrafts.length}</span>)
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-xs ${
            notice.type === 'success'
              ? 'bg-[#14B8A6]/10 border-[#14B8A6]/30 text-[#101828]'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-[#667085] hover:text-[#101828] p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Panel */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="p-5 space-y-4 border-[#E4E7EC] bg-white">
              <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
                <h2 className="font-semibold text-sm text-[#101828] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0F766E]" />
                  <span>Product Input Notes</span>
                </h2>
                <span className="text-[11px] font-medium text-[#667085]">Raw Specs → Structured Copy</span>
              </div>

              {/* Target Marketplace Selector */}
              <div>
                <label className="text-xs font-semibold text-[#101828] block mb-1.5">Target Marketplace Profile</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'meesho', label: 'Meesho' },
                    { id: 'flipkart', label: 'Flipkart' },
                    { id: 'amazon', label: 'Amazon IN' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMarketplace(m.id as any)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-colors ${
                        marketplace === m.id
                          ? 'border-[#101828] bg-[#101828] text-white'
                          : 'border-[#E4E7EC] bg-[#F8FAFC] text-[#475467] hover:bg-white hover:text-[#101828]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Override */}
              <div>
                <label className="text-xs font-semibold text-[#101828] block mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. TrendApparel, UrbanStep (leave blank for Generic)"
                  className="w-full text-xs px-3 py-2 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] bg-white text-[#101828]"
                />
              </div>

              {/* Raw Product Notes */}
              <div>
                <label className="text-xs font-semibold text-[#101828] block mb-1.5">
                  Product Notes / Supplier Specifications <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Paste supplier WhatsApp notes or specs, e.g. Women Rayon Yellow Kurti round neck 3/4 sleeves sizes M L XL Rs 449..."
                  className="w-full text-xs p-3 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] bg-white text-[#101828] leading-relaxed"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px] font-mono tabular-nums text-[#667085]">
                    {rawInput.length} characters
                  </span>
                </div>
              </div>

              {/* Quick Sample Input Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[#667085] block">Load Sample Supplier Note:</span>
                <div className="space-y-1.5">
                  {sampleInputs.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRawInput(sample)}
                      className="w-full text-left text-xs px-3 py-2 bg-[#F8FAFC] hover:bg-[#14B8A6]/5 border border-[#E4E7EC] hover:border-[#14B8A6] rounded-lg text-[#475467] hover:text-[#101828] transition-colors truncate"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="teal"
                className="w-full py-2.5 font-semibold text-sm"
                onClick={handleGenerate}
                isLoading={isLoading}
              >
                <Sparkles className="w-4 h-4 mr-2" /> Generate Smart Listing
              </Button>
            </Card>

            {result && <QualityScoreWidget score={result.qualityScore} compact />}
          </div>

          {/* Right Column: Generated Smart Listing Result */}
          <div className="lg:col-span-7 space-y-5">
            {result ? (
              <div className="space-y-5">
                <QualityScoreWidget score={result.qualityScore} />

                {/* Optimized Product Title */}
                <Card className="p-5 space-y-4 border-[#E4E7EC] bg-white">
                  <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
                    <h3 className="font-semibold text-sm text-[#101828] flex items-center gap-2">
                      <Type className="w-4 h-4 text-[#0F766E]" />
                      <span>Optimized Product Title</span>
                    </h3>
                    <Button size="xs" variant="ghost" onClick={() => handleCopy(result.title, 'title')}>
                      {copiedField === 'title' ? (
                        <Check className="w-3.5 h-3.5 text-[#0F766E] mr-1" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 mr-1" />
                      )}
                      {copiedField === 'title' ? 'Copied' : 'Copy Title'}
                    </Button>
                  </div>

                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl">
                    <textarea
                      rows={2}
                      value={result.title}
                      onChange={(e) => setResult({ ...result, title: e.target.value })}
                      className="w-full text-xs sm:text-sm font-semibold text-[#101828] bg-transparent focus:outline-none resize-none"
                    />
                    <div className="flex items-center justify-between text-[11px] text-[#667085] mt-2 border-t border-[#E4E7EC] pt-2">
                      <span>
                        Length:{' '}
                        <strong className="font-mono tabular-nums text-[#101828]">{result.title.length}</strong> chars
                      </span>
                      <span className="uppercase tracking-wider font-medium text-[#0F766E]">
                        {marketplace} Format Ready
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Description & Key Features */}
                <Card className="p-5 space-y-4 border-[#E4E7EC] bg-white">
                  <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
                    <h3 className="font-semibold text-sm text-[#101828] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0F766E]" />
                      <span>Description & Feature Bullets</span>
                    </h3>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopy(`${result.description}\n\n${result.keyFeatures.join('\n')}`, 'desc')}
                    >
                      {copiedField === 'desc' ? (
                        <Check className="w-3.5 h-3.5 text-[#0F766E] mr-1" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 mr-1" />
                      )}
                      {copiedField === 'desc' ? 'Copied' : 'Copy Copy'}
                    </Button>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-[#101828] block mb-1.5">Product Description</label>
                      <textarea
                        rows={4}
                        value={result.description}
                        onChange={(e) => setResult({ ...result, description: e.target.value })}
                        className="w-full text-xs p-3 border border-[#E4E7EC] rounded-xl bg-[#F8FAFC] text-[#101828] leading-relaxed focus:bg-white focus:outline-none focus:border-[#14B8A6]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#101828] block mb-1.5">
                        Key Feature Bullet Points
                      </label>
                      <ul className="space-y-1.5 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E4E7EC] text-xs">
                        {result.keyFeatures.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#0F766E] font-bold mt-0.5">•</span>
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => {
                                const newFeats = [...result.keyFeatures];
                                newFeats[idx] = e.target.value;
                                setResult({ ...result, keyFeatures: newFeats });
                              }}
                              className="w-full text-xs text-[#101828] bg-transparent border-b border-transparent hover:border-[#D0D5DD] focus:border-[#14B8A6] focus:bg-white focus:outline-none px-1 py-0.5 rounded-xs"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Categorized Keywords */}
                <Card className="p-5 space-y-4 border-[#E4E7EC] bg-white">
                  <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
                    <h3 className="font-semibold text-sm text-[#101828] flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#0F766E]" />
                      <span>Search Terms & Backend Tags</span>
                    </h3>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() =>
                        handleCopy(
                          [
                            ...(result.keywords.primaryKeywords || []),
                            ...(result.keywords.secondaryKeywords || []),
                            ...(result.keywords.longTailKeywords || []),
                          ].join(', '),
                          'keywords'
                        )
                      }
                    >
                      {copiedField === 'keywords' ? (
                        <Check className="w-3.5 h-3.5 text-[#0F766E] mr-1" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 mr-1" />
                      )}
                      {copiedField === 'keywords' ? 'Copied' : 'Copy Terms'}
                    </Button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC]">
                      <span className="font-semibold text-[#101828] block mb-1">Primary Search Terms</span>
                      <p className="text-[#0F766E] font-medium leading-relaxed">
                        {(result.keywords.primaryKeywords || []).join(' · ')}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC]">
                      <span className="font-semibold text-[#101828] block mb-1">Secondary & Long-Tail Phrases</span>
                      <p className="text-[#475467] leading-relaxed">
                        {[
                          ...(result.keywords.secondaryKeywords || []),
                          ...(result.keywords.longTailKeywords || []),
                        ].join(' · ')}
                      </p>
                    </div>

                    {result.keywords.disclaimer && (
                      <p className="text-[11px] text-[#667085] pt-1">{result.keywords.disclaimer}</p>
                    )}
                  </div>
                </Card>

                {/* Inferred Attributes Table */}
                <Card className="p-5 space-y-4 border-[#E4E7EC] bg-white">
                  <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
                    <h3 className="font-semibold text-sm text-[#101828] flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#0F766E]" />
                      <span>Inferred Catalog Attributes</span>
                    </h3>
                  </div>

                  <div className="border border-[#E4E7EC] rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#F8FAFC] font-semibold text-[#475467] border-b border-[#E4E7EC]">
                        <tr>
                          <th className="py-2.5 px-3.5">Attribute Field</th>
                          <th className="py-2.5 px-3.5">Extracted Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4E7EC]">
                        {result.attributes.map((attr, idx) => (
                          <tr key={idx} className="hover:bg-[#F8FAFC]">
                            <td className="py-2.5 px-3.5 font-medium text-[#667085]">{attr.label || attr.key}</td>
                            <td className="py-2.5 px-3.5 text-[#101828] font-semibold">{attr.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Actions Bottom Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#101828] text-white rounded-xl border border-[#1D2939] shadow-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#98A2B3] hover:text-white hover:bg-white/10"
                    onClick={() => setResult(null)}
                  >
                    Clear Output
                  </Button>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                      onClick={handleSaveDraft}
                      isLoading={saving}
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" /> Save Draft
                    </Button>
                    <Button variant="teal" size="sm" onClick={handleConvertToListing}>
                      Open in Listing Editor <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="p-12 text-center border-dashed border-[#D0D5DD] bg-white">
                <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] flex items-center justify-center mx-auto mb-3.5">
                  <Wand2 className="w-6 h-6 text-[#0F766E]" />
                </div>
                <h3 className="font-semibold text-base text-[#101828]">Structured Listing Preview</h3>
                <p className="text-xs sm:text-sm text-[#667085] max-w-md mx-auto mt-1.5">
                  Paste raw product notes on the left and click Generate Smart Listing to create marketplace-ready
                  titles, feature bullets, backend search terms, and attributes.
                </p>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* Saved Drafts Tab — Compact Professional Table */
        <Card padding="none" className="border-[#E4E7EC] bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E4E7EC] flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm text-[#101828]">Saved Smart Listing Drafts</h2>
              <p className="text-xs text-[#667085] mt-0.5">Reload saved drafts into the Smart Listing editor</p>
            </div>
            <span className="text-xs font-mono tabular-nums text-[#667085]">{savedDrafts.length} drafts</span>
          </div>

          {savedDrafts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#475467] font-semibold uppercase tracking-wider border-b border-[#E4E7EC]">
                  <tr>
                    <th className="py-3 px-4">Draft Title</th>
                    <th className="py-3 px-4 w-28">Marketplace</th>
                    <th className="py-3 px-4 w-28">Score</th>
                    <th className="py-3 px-4 w-32">Created</th>
                    <th className="py-3 px-4 w-36 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC]">
                  {savedDrafts.map((draft) => (
                    <tr key={draft.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#101828] line-clamp-1">{draft.title}</div>
                        <div className="text-[11px] text-[#667085] line-clamp-1 mt-0.5">
                          {draft.generatedDescription || draft.description}
                        </div>
                      </td>
                      <td className="py-3 px-4 uppercase font-semibold text-[#475467]">{draft.marketplace}</td>
                      <td className="py-3 px-4 font-mono font-semibold tabular-nums text-[#0F766E]">
                        {draft.qualityScore?.overallScore || draft.qualityScore?.overall || 88}/100
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-[#667085]">
                        {draft.createdAt ? new Date(draft.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setResult({
                              ...draft,
                              description: draft.description || draft.generatedDescription || '',
                              keyFeatures: draft.keyFeatures || [],
                              keywords: draft.keywords || { primaryKeywords: [], secondaryKeywords: [] },
                              attributes: draft.attributes || [],
                            });
                            setActiveTab('create');
                          }}
                        >
                          Load in Studio
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 px-4 text-center">
              <p className="text-sm font-medium text-[#101828]">No saved drafts yet</p>
              <p className="text-xs text-[#667085] mt-1">
                Generate a Smart Listing and click Save Draft to store reusable copy here.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
