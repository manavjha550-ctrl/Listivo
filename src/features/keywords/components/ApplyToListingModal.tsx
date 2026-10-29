import React from 'react';
import { X, Send, Package, Sparkles, FileText, Bot, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { KeywordIntelligenceItem } from '../types/keywordTypes';

interface ApplyToListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKeywords: KeywordIntelligenceItem[];
  onOpenAIAssistant: (keywords: string[]) => void;
}

export const ApplyToListingModal: React.FC<ApplyToListingModalProps> = ({
  isOpen,
  onClose,
  selectedKeywords,
  onOpenAIAssistant,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const keywordList = selectedKeywords.map((k) => k.keyword);
  const kwString = keywordList.join(', ');

  const destinations = [
    {
      title: 'Listing Editor',
      description: 'Create or edit a marketplace product listing with keywords preloaded',
      icon: <Package className="w-4 h-4 text-[#0F766E]" />,
      onClick: () => {
        navigate('/listings/new', { state: { prefilledKeywords: keywordList, keywordsString: kwString } });
        onClose();
      },
    },
    {
      title: 'Smart Listing Studio',
      description: 'Generate complete marketplace copy using these search terms',
      icon: <Sparkles className="w-4 h-4 text-[#0F766E]" />,
      onClick: () => {
        navigate('/smart-listings', { state: { keywords: keywordList } });
        onClose();
      },
    },
    {
      title: 'Copy Assistant Drawer',
      description: 'Open the side copy assistant preloaded with this keyword cluster',
      icon: <Bot className="w-4 h-4 text-[#2563EB]" />,
      onClick: () => {
        onOpenAIAssistant(keywordList);
        onClose();
      },
    },
    {
      title: 'Catalog Templates',
      description: 'Navigate to templates with this keyword cluster ready for reuse',
      icon: <FileText className="w-4 h-4 text-[#475467]" />,
      onClick: () => {
        navigate('/templates', { state: { keywords: keywordList } });
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/55 backdrop-blur-[2px] p-4">
      <div className="bg-white w-full max-w-lg rounded-xl border border-[#E4E7EC] shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 bg-[#101828] text-white flex items-center justify-between border-b border-[#1D2939]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/15 border border-[#14B8A6]/30 flex items-center justify-center">
              <Send className="w-4 h-4 text-[#14B8A6]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Send Keywords to Module</h2>
              <p className="text-xs text-[#98A2B3]">
                <span className="font-mono tabular-nums">{selectedKeywords.length}</span> keywords ready for transfer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#98A2B3] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-2.5">
          {destinations.map((dest) => (
            <button
              key={dest.title}
              type="button"
              onClick={dest.onClick}
              className="w-full p-3.5 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] hover:bg-white hover:border-[#14B8A6] transition-colors text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-[#E4E7EC] flex items-center justify-center shrink-0">
                  {dest.icon}
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#101828]">{dest.title}</h3>
                  <p className="text-[11px] text-[#667085] mt-0.5">{dest.description}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#98A2B3] group-hover:text-[#0F766E] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>

        <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E4E7EC] text-right">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
