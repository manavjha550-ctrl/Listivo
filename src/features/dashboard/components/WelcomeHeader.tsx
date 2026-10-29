import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';

export const WelcomeHeader: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.role === 'owner' || user?.plan === 'lifetime_free' || user?.isOwner;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.fullName ? user.fullName.trim().split(' ')[0] : 'Seller';

  return (
    <div className="pb-5 border-b border-[#E4E7EC]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085]">
            <span className="font-medium text-[#101828]">
              {user?.companyName || 'Seller Workspace'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{isOwner ? 'Lifetime Free Owner Account' : 'Seller Account'}</span>
            {user?.gstNumber && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px]">GSTIN {user.gstNumber}</span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101828]">
            {getGreeting()}, {firstName}
          </h1>

          <p className="text-sm text-[#667085]">
            Here is your store catalog summary and workspace shortcuts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4 text-[#667085]" />}
            onClick={() => navigate('/bulk')}
          >
            Bulk Import
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/listings')}
          >
            Create Listing
          </Button>
        </div>
      </div>
    </div>
  );
};
