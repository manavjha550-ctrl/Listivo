import React, { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { listingService } from '../services/listingService';

interface AIDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (desc: string, features: string[]) => void;
  title: string;
  brand: string;
  category: string;
  subCategory?: string;
  material?: string;
}

export const AIDescriptionModal: React.FC<AIDescriptionModalProps> = ({
  isOpen,
  onClose,
  onApply,
  title,
  brand,
  category,
  subCategory,
  material,
}) => {
  const [tone, setTone] = useState<'professional' | 'seo' | 'festive' | 'concise'>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesc, setGeneratedDesc] = useState<string | null>(null);
  const [generatedFeatures, setGeneratedFeatures] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await listingService.generateAIDescription({
        title,
        brand,
        category,
        subCategory,
        material,
        tone,
      });
      setGeneratedDesc(res.description);
      setGeneratedFeatures(res.keyFeatures || []);
    } catch (err: any) {
      setError(err.message || 'Smart copy generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyClick = () => {
    if (generatedDesc) {
      onApply(generatedDesc, generatedFeatures);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Smart Listing Copywriter"
      subtitle="Generate marketplace-compliant descriptions and key feature bullets."
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApplyClick}
            disabled={!generatedDesc}
          >
            Apply to Listing
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#101828] mb-2">
            Copywriting Tone
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'professional', label: 'Professional' },
              { id: 'seo', label: 'Search Indexed' },
              { id: 'festive', label: 'Festive Season' },
              { id: 'concise', label: 'Short & Direct' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id as any)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  tone === t.id
                    ? 'bg-[#101828] text-white border-[#101828]'
                    : 'bg-[#F8FAFC] text-[#667085] border-[#E4E7EC] hover:text-[#101828]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          className="w-full"
          onClick={handleGenerate}
          isLoading={isGenerating}
          icon={<Sparkles className="w-4 h-4" />}
        >
          {isGenerating ? 'Generating Copy...' : 'Generate Description & Bullets'}
        </Button>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {generatedDesc && (
          <div className="bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F766E]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Generated Copy Preview</span>
            </div>

            <div>
              <span className="text-xs font-medium text-[#667085] block mb-1">Description</span>
              <p className="text-xs text-[#101828] leading-relaxed bg-white p-3 rounded-lg border border-[#E4E7EC]">
                {generatedDesc}
              </p>
            </div>

            {generatedFeatures.length > 0 && (
              <div>
                <span className="text-xs font-medium text-[#667085] block mb-1">
                  Key Feature Bullets
                </span>
                <ul className="list-disc list-inside text-xs text-[#101828] bg-white p-3 rounded-lg border border-[#E4E7EC] space-y-1">
                  {generatedFeatures.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
