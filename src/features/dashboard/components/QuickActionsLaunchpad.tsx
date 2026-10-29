import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Package,
  FileSpreadsheet,
  Calculator,
  Sparkles,
  Image as ImageIcon,
  Search,
  ArrowUpRight,
} from 'lucide-react';

interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  route: string;
}

export const QuickActionsLaunchpad: React.FC = () => {
  const navigate = useNavigate();

  const actions: QuickActionItem[] = [
    {
      id: 'create-template',
      label: 'Create Template',
      description: 'Reusable GST, HSN & attribute presets',
      icon: <FileText className="w-4 h-4 text-[#14B8A6]" />,
      route: '/templates/new',
    },
    {
      id: 'create-listing',
      label: 'Listings Manager',
      description: 'Single product or multi-size variants',
      icon: <Package className="w-4 h-4 text-[#101828]" />,
      route: '/listings',
    },
    {
      id: 'bulk-upload',
      label: 'Bulk Catalog',
      description: 'Import CSV/XLSX & export portal sheets',
      icon: <FileSpreadsheet className="w-4 h-4 text-[#60A5FA]" />,
      route: '/bulk',
    },
    {
      id: 'smart-listing',
      label: 'Smart Listing AI',
      description: 'Optimize titles, bullets & attributes',
      icon: <Sparkles className="w-4 h-4 text-[#14B8A6]" />,
      route: '/smart-listings',
    },
    {
      id: 'price-calculator',
      label: 'Price Calculator',
      description: 'Model settlement payout & net margin',
      icon: <Calculator className="w-4 h-4 text-[#101828]" />,
      route: '/price-calculator',
    },
    {
      id: 'image-workspace',
      label: 'Image Workspace',
      description: 'Compliance framing & aspect presets',
      icon: <ImageIcon className="w-4 h-4 text-[#60A5FA]" />,
      route: '/image-maker',
    },
    {
      id: 'keyword-research',
      label: 'Keyword Research',
      description: 'High-intent marketplace search terms',
      icon: <Search className="w-4 h-4 text-[#14B8A6]" />,
      route: '/keywords',
    },
  ];

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#101828]">Quick Actions</h3>
          <p className="text-xs text-[#667085] mt-0.5">
            Direct shortcuts across your catalog workflow
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => navigate(action.route)}
            className="group p-3.5 bg-[#F8FAFC] hover:bg-white border border-[#E4E7EC] hover:border-[#14B8A6] rounded-lg text-left transition-colors cursor-pointer flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E4E7EC] flex items-center justify-center shrink-0">
                {action.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#101828] group-hover:text-[#0F766E] transition-colors truncate">
                  {action.label}
                </div>
                <p className="text-[11px] text-[#667085] mt-0.5 leading-snug line-clamp-2">
                  {action.description}
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#667085] group-hover:text-[#0F766E] shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
};
