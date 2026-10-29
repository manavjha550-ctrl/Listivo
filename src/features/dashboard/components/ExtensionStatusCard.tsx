import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Puzzle, ShieldAlert, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react';
import { useExtensionStatus } from '../hooks/useExtensionStatus';
import { Button } from '../../../components/ui/Button';

export const ExtensionStatusCard: React.FC = () => {
  const navigate = useNavigate();
  const { extensionInfo, isLoading, refetch } = useExtensionStatus();

  const renderStatus = () => {
    if (extensionInfo.status === 'CONNECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#14B8A6]" />
          Connected
        </span>
      );
    }
    if (extensionInfo.status === 'SESSION_EXPIRED') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          Session Expired
        </span>
      );
    }
    if (extensionInfo.status === 'CONNECTION_ERROR') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          Connection Error
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
        <Puzzle className="w-3.5 h-3.5 text-amber-600" />
        Not Connected
      </span>
    );
  };

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#101828] text-white flex items-center justify-center shrink-0">
            <Puzzle className="w-4 h-4 text-[#14B8A6]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#101828]">Meesho Companion</h3>
            <p className="text-xs text-[#667085]">Chrome Extension Autofill</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          title="Re-check Extension Connection"
          className="p-2 text-[#667085] hover:text-[#101828] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-3.5 rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#667085]">Status</span>
          {renderStatus()}
        </div>

        <p className="text-xs text-[#101828] leading-relaxed">{extensionInfo.message}</p>

        {extensionInfo.version && (
          <div className="text-[11px] font-mono text-[#667085] pt-2 border-t border-[#E4E7EC]">
            v{extensionInfo.version} · Synced{' '}
            {extensionInfo.lastSyncedAt
              ? new Date(extensionInfo.lastSyncedAt).toLocaleTimeString()
              : 'recently'}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        icon={<ExternalLink className="w-3.5 h-3.5" />}
        onClick={() => navigate('/tutorials')}
      >
        {extensionInfo.status === 'CONNECTED' ? 'Extension Setup & Usage' : 'Install Unpacked Extension'}
      </Button>
    </div>
  );
};
