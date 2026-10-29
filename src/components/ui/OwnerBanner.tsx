import React from 'react';
import { ShieldCheck, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const OwnerBanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isOwner = user.role === 'owner' || user.plan === 'lifetime_free' || user.isOwner;
  if (!isOwner) return null;

  return (
    <div className="px-4 py-2.5 rounded-xl bg-white border border-[#E4E7EC] mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#101828] text-[#14B8A6] flex items-center justify-center shrink-0">
          <Crown className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-semibold text-[#101828]">Owner Workspace Active</span>
          <span className="text-[#667085]" aria-hidden="true">·</span>
          <span className="text-[#667085]">
            Lifetime Free Plan · Unlimited Templates, Bulk Catalog &amp; AI Credits
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/settings')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:text-[#101828] transition-colors cursor-pointer whitespace-nowrap shrink-0"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[#14B8A6]" />
        <span>Workspace Settings</span>
      </button>
    </div>
  );
};
