import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Crown,
  LogOut,
  ChevronDown,
  FileText,
  Package,
  FileSpreadsheet,
  Calculator,
  User,
  Menu,
  Puzzle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExtensionStatus } from '../../features/dashboard/hooks/useExtensionStatus';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ListivoLogo } from '../common/ListivoLogo';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/templates': 'Templates',
  '/templates/new': 'New Template',
  '/listings': 'Listings',
  '/listings/new': 'New Listing',
  '/bulk': 'Bulk Catalog',
  '/keyword-research': 'Keyword Research',
  '/smart-listings': 'Smart Listing AI',
  '/price-calculator': 'Price Calculator',
  '/image-maker': 'Image Workspace',
  '/tools': 'Seller Tools',
  '/tutorials': 'Guides & Setup',
  '/settings': 'Settings',
  '/team': 'Team',
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const { extensionInfo } = useExtensionStatus();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const quickRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.role === 'owner' || user?.plan === 'lifetime_free' || user?.isOwner;
  const isExtConnected = extensionInfo.status === 'CONNECTED';

  const currentSection =
    ROUTE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/templates/')
      ? 'Edit Template'
      : location.pathname.startsWith('/listings/')
      ? 'Edit Listing'
      : 'Workspace');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setShowQuickActions(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      navigate('/listings');
      return;
    }
    if (q.includes('template')) {
      navigate('/templates');
    } else if (q.includes('bulk') || q.includes('csv')) {
      navigate('/bulk');
    } else if (q.includes('price') || q.includes('margin') || q.includes('gst')) {
      navigate('/price-calculator');
    } else if (q.includes('keyword')) {
      navigate('/keyword-research');
    } else if (q.includes('smart') || q.includes('ai')) {
      navigate('/smart-listings');
    } else if (q.includes('image')) {
      navigate('/image-maker');
    } else {
      navigate('/listings');
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('')
    : 'SL';

  return (
    <header className="h-14 lg:h-16 bg-white border-b border-[#E4E7EC] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left Zone: Mobile Menu + Breadcrumb / Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-1 rounded-lg text-[#101828] hover:bg-[#F8FAFC] border border-transparent hover:border-[#E4E7EC] transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="lg:hidden">
          <ListivoLogo variant="light" size="sm" />
        </div>

        {/* Desktop Contextual Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 text-xs whitespace-nowrap shrink-0">
          <span className="text-[#667085] font-medium">Workspace</span>
          <span className="text-[#D0D5DD]" aria-hidden="true">/</span>
          <span className="text-[#101828] font-semibold">{currentSection}</span>
        </div>

        {/* Global Workspace Search */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:block relative flex-1 max-w-sm ml-2">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Jump to listings, templates, or tools..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg text-xs text-[#101828] placeholder:text-[#98A2B3] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] transition-colors"
          />
        </form>
      </div>

      {/* Right Zone: Extension Telemetry + Primary Action + Account Menu */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/tutorials')}
          className={`hidden xl:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            isExtConnected
              ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]'
              : 'bg-[#F8FAFC] text-[#667085] border-[#E4E7EC] hover:text-[#101828]'
          }`}
        >
          <Puzzle className="w-3.5 h-3.5" />
          <span>{isExtConnected ? 'Meesho Synced' : 'Connect Extension'}</span>
        </button>

        {/* Primary Quick Create Action */}
        <div className="relative" ref={quickRef}>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowQuickActions((prev) => !prev)}
          >
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </Button>

          {showQuickActions && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-[#E4E7EC] py-1.5 z-50 animate-fadeIn">
              <button
                type="button"
                onClick={() => {
                  navigate('/listings/new');
                  setShowQuickActions(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#101828] hover:bg-[#F8FAFC] flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <Package className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>New Product Listing</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate('/templates/new');
                  setShowQuickActions(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#101828] hover:bg-[#F8FAFC] flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>New Category Template</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate('/bulk');
                  setShowQuickActions(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#101828] hover:bg-[#F8FAFC] flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>Bulk CSV / XLSX Import</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate('/smart-listings');
                  setShowQuickActions(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#101828] hover:bg-[#F8FAFC] flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>Smart Listing AI</span>
              </button>
              <div className="my-1 border-t border-[#E4E7EC]" />
              <button
                type="button"
                onClick={() => {
                  navigate('/price-calculator');
                  setShowQuickActions(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#101828] hover:bg-[#F8FAFC] flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <Calculator className="w-3.5 h-3.5 text-[#667085]" />
                <span>Price &amp; Margin Calculator</span>
              </button>
            </div>
          )}
        </div>

        <div className="hidden sm:block h-5 w-px bg-[#E4E7EC]" />

        {/* User Account Menu */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#F8FAFC] border border-transparent hover:border-[#E4E7EC] transition-colors cursor-pointer"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || 'Seller profile'}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-lg object-cover border border-[#E4E7EC]"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center text-[11px] font-bold">
                {initials}
              </div>
            )}
            <div className="text-left hidden md:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#101828] max-w-[130px] truncate">
                  {user?.fullName || 'Seller Account'}
                </span>
                {isOwner && (
                  <Badge variant="primary" size="xs">
                    Owner
                  </Badge>
                )}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#667085]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-[#E4E7EC] py-1.5 z-50 animate-fadeIn">
              <div className="px-4 py-2.5 border-b border-[#E4E7EC]">
                <p className="text-xs font-semibold text-[#101828] truncate">{user?.fullName}</p>
                <p className="text-[11px] text-[#667085] truncate">{user?.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#667085]">
                  {isOwner ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#0F766E]">
                      <Crown className="w-3 h-3 text-[#14B8A6]" />
                      <span>Lifetime Free Owner</span>
                    </span>
                  ) : (
                    <span>Free Seller Plan</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigate('/settings');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-[#101828] hover:bg-[#F8FAFC] flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <User className="w-3.5 h-3.5 text-[#667085]" />
                <span>Business &amp; GST Profile</span>
              </button>

              <div className="my-1 border-t border-[#E4E7EC]" />

              <button
                type="button"
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                  navigate('/auth/login');
                }}
                className="w-full text-left px-4 py-2 text-xs text-[#B42318] hover:bg-[#FEF3F2] flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
