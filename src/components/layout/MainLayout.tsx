import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Package,
  FileSpreadsheet,
  Menu,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { OwnerBanner } from '../ui/OwnerBanner';

export const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mobileTabs = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Templates', path: '/templates', icon: FileText },
    { label: 'Listings', path: '/listings', icon: Package },
    { label: 'Bulk', path: '/bulk', icon: FileSpreadsheet },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#101828]">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 pb-24 lg:pb-10 max-w-7xl w-full mx-auto">
          <OwnerBanner />
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (<= 15% aggregate sticky viewport budget) */}
      <nav
        aria-label="Primary mobile navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-14 bg-white/95 backdrop-blur-md border-t border-[#E4E7EC] grid grid-cols-5 items-center px-1"
      >
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors whitespace-nowrap ${
                  isActive ? 'text-[#0F766E]' : 'text-[#667085] hover:text-[#101828]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#14B8A6]' : 'text-[#667085]'}`} />
                  <span>{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[10px] font-semibold text-[#667085] hover:text-[#101828] transition-colors cursor-pointer whitespace-nowrap"
        >
          <Menu className="w-4 h-4 text-[#667085]" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
};
