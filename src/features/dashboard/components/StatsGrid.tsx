import React from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';

export const StatsGrid: React.FC = () => {
  const { stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 bg-white border border-[#E4E7EC] rounded-xl animate-pulse space-y-2.5"
          >
            <div className="h-3 bg-[#F8FAFC] rounded w-1/2" />
            <div className="h-7 bg-[#F8FAFC] rounded w-2/5" />
            <div className="h-3 bg-[#F8FAFC] rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
        Unable to load dashboard statistics right now.
      </div>
    );
  }

  const statItems = [
    {
      id: 'listings',
      label: 'Total Listings',
      value: String(stats.totalListings),
      subtext: `${stats.readyListings} ready · ${stats.draftListings} drafts`,
      highlight: false,
    },
    {
      id: 'ready',
      label: 'Ready Products',
      value: String(stats.readyListings),
      subtext: 'Validated for marketplace sync',
      highlight: true,
    },
    {
      id: 'drafts',
      label: 'Draft Listings',
      value: String(stats.draftListings),
      subtext: 'Pending attribute completion',
      highlight: false,
    },
    {
      id: 'templates',
      label: 'Reusable Templates',
      value: String(stats.totalTemplates),
      subtext: 'Saved GST, HSN & category rules',
      highlight: false,
    },
    {
      id: 'time-saved',
      label: 'Estimated Time Saved',
      value: `${stats.estimatedTimeSavedHours} hrs`,
      subtext: 'From template & autofill reuse',
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <div
          key={item.id}
          className="p-4 bg-white border border-[#E4E7EC] rounded-xl flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-medium text-[#667085] block">
              {item.label}
            </span>
            <div
              className={`text-2xl font-bold font-mono tabular-nums tracking-tight mt-1.5 ${
                item.highlight ? 'text-[#0F766E]' : 'text-[#101828]'
              }`}
            >
              {item.value}
            </div>
          </div>
          <p className="text-[11px] text-[#667085] mt-2.5 pt-2.5 border-t border-[#E4E7EC] truncate">
            {item.subtext}
          </p>
        </div>
      ))}
    </div>
  );
};
