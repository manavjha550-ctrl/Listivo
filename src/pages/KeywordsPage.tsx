import React, { useState, useEffect } from 'react';
import { Sparkles, Folder, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { KeywordResearchForm } from '../features/keywords/components/KeywordResearchForm';
import { KeywordGrid } from '../features/keywords/components/KeywordGrid';
import { KeywordQualityPanel } from '../features/keywords/components/KeywordQualityPanel';
import { TitleBuilderSection } from '../features/keywords/components/TitleBuilderSection';
import { DescriptionOptimizerSection } from '../features/keywords/components/DescriptionOptimizerSection';
import { KeywordSetsModal } from '../features/keywords/components/KeywordSetsModal';
import { ApplyToListingModal } from '../features/keywords/components/ApplyToListingModal';
import { AIAssistantDrawer } from '../features/ai/components/AIAssistantDrawer';
import { AIUsageBadge } from '../features/ai/components/AIUsageBadge';
import {
  KeywordIntelligenceItem,
  KeywordResearchInput,
  KeywordQualityAnalysis,
  SavedKeywordSet,
} from '../features/keywords/types/keywordTypes';
import { keywordApiService } from '../features/keywords/services/keywordApiService';

export const KeywordsPage: React.FC = () => {
  const [keywords, setKeywords] = useState<KeywordIntelligenceItem[]>([
    {
      id: 'kw-init-1',
      keyword: 'rayon kurti for women',
      category: 'PRIMARY',
      relevanceScore: 96,
      suggestedUsage: 'Title & Main Product Bullet',
      confidenceLabel: 'HIGH',
      intent: 'HIGH',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: 'kw-init-2',
      keyword: 'printed straight kurti under 400',
      category: 'LONG-TAIL',
      relevanceScore: 92,
      suggestedUsage: 'First 200 chars of Description',
      confidenceLabel: 'HIGH',
      intent: 'HIGH',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: 'kw-init-3',
      keyword: 'festive wear ethnic kurti set',
      category: 'SEASONAL',
      relevanceScore: 88,
      suggestedUsage: 'Bullet Points & Search Tags',
      confidenceLabel: 'MEDIUM',
      intent: 'HIGH',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: 'kw-init-4',
      keyword: 'soft pure rayon daily wear kurti',
      category: 'ATTRIBUTE',
      relevanceScore: 90,
      suggestedUsage: 'Fabric & Material Description',
      confidenceLabel: 'HIGH',
      intent: 'MEDIUM',
      risk: 'LOW',
      status: 'active',
    },
    {
      id: 'kw-init-5',
      keyword: 'women ethnic office wear kurta',
      category: 'BUYING-INTENT',
      relevanceScore: 85,
      suggestedUsage: 'Product Search Keywords',
      confidenceLabel: 'MEDIUM',
      intent: 'HIGH',
      risk: 'LOW',
      status: 'active',
    },
  ]);

  const [productName, setProductName] = useState('Women Rayon Printed Straight Kurti');
  const [marketplace, setMarketplace] = useState('meesho');
  const [disclaimer, setDisclaimer] = useState('Search volume unavailable — relevance is estimated from marketplace signals.');
  const [qualityAnalysis, setQualityAnalysis] = useState<KeywordQualityAnalysis | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSavedSetsModalOpen, setIsSavedSetsModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [aiDrawerContext, setAIDrawerContext] = useState<any>({});

  useEffect(() => {
    runQualityAnalysis(keywords);
  }, [keywords]);

  const runQualityAnalysis = async (kwList: KeywordIntelligenceItem[]) => {
    if (kwList.length === 0) {
      setQualityAnalysis(null);
      return;
    }
    try {
      const res = await keywordApiService.analyzeQuality(kwList);
      setQualityAnalysis(res);
    } catch (err) {
      console.error('Failed to run quality analysis', err);
    }
  };

  const handleResearchSubmit = async (input: KeywordResearchInput) => {
    setIsLoading(true);
    setNotice(null);
    try {
      setProductName(input.productName);
      setMarketplace(input.marketplace || 'meesho');

      const res = await keywordApiService.researchKeywords(input);
      setKeywords(res.keywords);
      if (res.disclaimer) {
        setDisclaimer(res.disclaimer);
      }
      setNotice({
        type: 'success',
        message: `Generated ${res.keywords.length} search keywords for "${input.productName}".`,
      });
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err.message || 'Keyword discovery encountered an error. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadKeywordSet = (set: SavedKeywordSet) => {
    if (set.keywords && set.keywords.length > 0) {
      setKeywords(set.keywords);
      setMarketplace(set.marketplace);
      setNotice({
        type: 'success',
        message: `Loaded ${set.keywords.length} keywords from "${set.name}".`,
      });
    }
  };

  const handleOpenAIAssistantWithKeywords = (kwList: string[]) => {
    setAIDrawerContext({
      title: productName,
      marketplace,
      keyFeatures: kwList,
      currentText: `Search Keywords: ${kwList.join(', ')}`,
    });
    setIsAIDrawerOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101828]">Keyword Research</h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Discover buyer search phrases, audit keyword density, and build compliant marketplace titles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <AIUsageBadge />

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSavedSetsModalOpen(true)}
            icon={<Folder className="w-4 h-4 text-[#0F766E]" />}
          >
            Saved Sets
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => handleOpenAIAssistantWithKeywords(keywords.map((k) => k.keyword))}
            icon={<Sparkles className="w-4 h-4 text-[#14B8A6]" />}
          >
            Copy Assistant
          </Button>
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
            aria-label="Dismiss notification"
            className="text-[#667085] hover:text-[#101828] p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Form Section */}
      <KeywordResearchForm onSubmit={handleResearchSubmit} isLoading={isLoading} />

      {/* Main Grid & Intelligence Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <KeywordGrid
            keywords={keywords}
            onUpdateKeywords={setKeywords}
            onSaveSet={() => setIsSavedSetsModalOpen(true)}
            onOpenApplyModal={() => setIsApplyModalOpen(true)}
            disclaimer={disclaimer}
          />
        </div>

        <div className="space-y-5">
          <KeywordQualityPanel analysis={qualityAnalysis} />

          <TitleBuilderSection
            selectedKeywords={keywords.slice(0, 8).map((k) => k.keyword)}
            productName={productName}
            marketplace={marketplace}
            onApplyToListing={(title) => {
              setProductName(title);
              navigator.clipboard.writeText(title);
              setNotice({
                type: 'success',
                message: 'Updated active product title and copied to clipboard.',
              });
            }}
          />

          <DescriptionOptimizerSection
            selectedKeywords={keywords.slice(0, 8).map((k) => k.keyword)}
            productName={productName}
            marketplace={marketplace}
            onApplyDescription={(desc) => {
              navigator.clipboard.writeText(desc);
              setNotice({
                type: 'success',
                message: 'Optimized description applied and copied to clipboard.',
              });
            }}
          />
        </div>
      </div>

      {/* Modals */}
      <KeywordSetsModal
        isOpen={isSavedSetsModalOpen}
        onClose={() => setIsSavedSetsModalOpen(false)}
        activeKeywords={keywords}
        currentMarketplace={marketplace}
        onLoadKeywordSet={handleLoadKeywordSet}
      />

      <ApplyToListingModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        selectedKeywords={keywords}
        onOpenAIAssistant={handleOpenAIAssistantWithKeywords}
      />

      {/* Copy Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        initialMode="keywords"
        contextData={aiDrawerContext}
        onApply={(field, val) => {
          if (field === 'title' && typeof val === 'string') {
            setProductName(val);
          }
          setNotice({
            type: 'success',
            message: `Applied Copy Assistant output (${field}) to workspace.`,
          });
        }}
      />
    </div>
  );
};
