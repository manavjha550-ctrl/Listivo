import React from 'react';
import { WelcomeHeader } from '../features/dashboard/components/WelcomeHeader';
import { QuickActionsLaunchpad } from '../features/dashboard/components/QuickActionsLaunchpad';
import { StatsGrid } from '../features/dashboard/components/StatsGrid';
import { SetupChecklistCard } from '../features/dashboard/components/SetupChecklistCard';
import { ExtensionStatusCard } from '../features/dashboard/components/ExtensionStatusCard';
import { RecentActivityList } from '../features/dashboard/components/RecentActivityList';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Greeting & Store Overview */}
      <WelcomeHeader />

      {/* Live Catalog KPIs */}
      <section aria-labelledby="catalog-kpis-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="catalog-kpis-heading" className="text-sm font-semibold text-[#101828]">
            Catalog Overview
          </h2>
          <span className="text-xs text-[#667085]">Real-time workspace metrics</span>
        </div>
        <StatsGrid />
      </section>

      {/* Main Split Grid: Onboarding Checklist & Quick Actions + Companion Status & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <SetupChecklistCard />
          <QuickActionsLaunchpad />
        </div>

        <div className="space-y-6">
          <ExtensionStatusCard />
          <RecentActivityList />
        </div>
      </div>
    </div>
  );
};
