import React from 'react';
import { Clock, FileText, Package, FileSpreadsheet, Sparkles, Puzzle } from 'lucide-react';
import { useRecentActivity } from '../hooks/useRecentActivity';

export const RecentActivityList: React.FC = () => {
  const { activities, isLoading, error } = useRecentActivity();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'template_created':
        return <FileText className="w-3.5 h-3.5 text-[#0F766E]" />;
      case 'listing_created':
        return <Package className="w-3.5 h-3.5 text-[#101828]" />;
      case 'csv_imported':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-[#2563EB]" />;
      case 'ai_generated':
        return <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />;
      case 'extension_autofill':
        return <Puzzle className="w-3.5 h-3.5 text-[#14B8A6]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[#667085]" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#101828]">Recent Activity</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-11 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#101828]">Recent Activity</h3>
        <span className="text-xs text-[#667085]">Workspace log</span>
      </div>

      {error ? (
        <p className="text-xs text-rose-700">Failed to load activity stream.</p>
      ) : activities.length === 0 ? (
        <div className="py-8 px-4 text-center bg-[#F8FAFC] rounded-lg border border-dashed border-[#E4E7EC]">
          <Clock className="w-5 h-5 text-[#667085] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#101828]">No recent activity yet</p>
          <p className="text-xs text-[#667085] mt-1">
            Create a template or listing to track catalog updates here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#E4E7EC]">
          {activities.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-[#F8FAFC] border border-[#E4E7EC] flex items-center justify-center shrink-0 mt-0.5">
                {getActivityIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-[#101828] truncate">{item.title}</h4>
                  <span className="text-[11px] font-mono tabular-nums text-[#667085] shrink-0">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-[#667085] mt-0.5 line-clamp-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
