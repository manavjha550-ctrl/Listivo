import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Package,
  FileSpreadsheet,
  Search,
  Wrench,
  Image as ImageIcon,
  Calculator,
  Sparkles,
  BookOpen,
  Settings,
  Users,
  X,
  LogOut,
  Puzzle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExtensionStatus } from '../../features/dashboard/hooks/useExtensionStatus';
import { ListivoLogo } from '../common/ListivoLogo';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  featureKey: string;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { extensionInfo } = useExtensionStatus();
  const isOwner = user?.role === 'owner' || user?.plan === 'lifetime_free' || user?.isOwner;
  const isExtConnected = extensionInfo.status === 'CONNECTED';

  const mainNav: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, featureKey: 'dashboard' },
    { label: 'Templates', path: '/templates', icon: <FileText className="w-4 h-4" />, featureKey: 'templates' },
    { label: 'Listings', path: '/listings', icon: <Package className="w-4 h-4" />, featureKey: 'products' },
    { label: 'Bulk Catalog', path: '/bulk', icon: <FileSpreadsheet className="w-4 h-4" />, featureKey: 'bulk' },
  ];

  const intelligenceNav: NavItem[] = [
    { label: 'Smart Listing', path: '/smart-listings', icon: <Sparkles className="w-4 h-4" />, featureKey: 'smart_listings' },
    { label: 'Keyword Research', path: '/keyword-research', icon: <Search className="w-4 h-4" />, featureKey: 'keywords' },
    { label: 'Price Calculator', path: '/price-calculator', icon: <Calculator className="w-4 h-4" />, featureKey: 'price_calculator' },
    { label: 'Image Workspace', path: '/image-maker', icon: <ImageIcon className="w-4 h-4" />, featureKey: 'image_maker' },
  ];

  const workspaceNav: NavItem[] = [
    { label: 'Seller Tools', path: '/tools', icon: <Wrench className="w-4 h-4" />, featureKey: 'tools' },
    { label: 'Guides & Setup', path: '/tutorials', icon: <BookOpen className="w-4 h-4" />, featureKey: 'tutorials' },
    { label: 'Team', path: '/team', icon: <Users className="w-4 h-4" />, featureKey: 'team' },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" />, featureKey: 'settings' },
  ];

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('')
    : 'SL';

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-5">
      <div className="px-3 mb-1.5 text-[11px] font-semibold text-[#667085] tracking-wide">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => onCloseMobile?.()}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 group whitespace-nowrap ${
                isActive
                  ? 'bg-[#14B8A6]/15 text-white font-semibold border border-[#14B8A6]/30'
                  : 'text-[#98A2B3] hover:bg-white/5 hover:text-white border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? 'text-[#14B8A6]' : 'text-[#667085] group-hover:text-white'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#101828] text-white select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between shrink-0">
        <ListivoLogo variant="dark" size="md" />
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 rounded-lg text-[#98A2B3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Real Extension Telemetry Link */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            onCloseMobile?.();
            navigate('/tutorials');
          }}
          className="w-full p-2.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Puzzle className={`w-4 h-4 shrink-0 ${isExtConnected ? 'text-[#14B8A6]' : 'text-[#98A2B3]'}`} />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">Meesho Companion</div>
              <div className="text-[11px] text-[#98A2B3] truncate">
                {isExtConnected ? 'Extension synced' : 'Setup guide & sync'}
              </div>
            </div>
          </div>
          {isExtConnected && (
            <span className="w-2 h-2 rounded-full bg-[#14B8A6] shrink-0" title="Extension Connected" />
          )}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {renderNavGroup('Catalog', mainNav)}
        {renderNavGroup('Intelligence & Pricing', intelligenceNav)}
        {renderNavGroup('Workspace', workspaceNav)}
      </div>

      {/* Footer User Profile */}
      <div className="p-3.5 border-t border-white/10 bg-[#0C121E] shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6]/35 text-[#2DD4BF] flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="ml-2.5 min-w-0">
              <p className="text-xs font-semibold text-white leading-tight truncate">
                {user?.fullName || 'Seller Workspace'}
              </p>
              <p className="text-[11px] text-[#98A2B3] truncate">
                {isOwner ? 'Owner · Lifetime Free' : user?.companyName || 'Free Seller Plan'}
              </p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              type="button"
              onClick={() => {
                onCloseMobile();
                logout();
                navigate('/auth/login');
              }}
              aria-label="Sign out"
              className="p-1.5 rounded-lg text-[#98A2B3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Deep Navy Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col h-screen shrink-0 sticky top-0 border-r border-[#1D2939] z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Navigation Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Workspace navigation">
          <div
            className="fixed inset-0 bg-[#101828]/60 backdrop-blur-[2px] transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[82vw] h-full shadow-2xl z-10 animate-fadeIn">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
