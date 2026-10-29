import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  FileSpreadsheet,
  FileText,
  Calculator,
  Search,
  Image as ImageIcon,
  Puzzle,
  ShieldCheck,
  Package,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { ListivoLogo } from '../components/common/ListivoLogo';
import { Button } from '../components/ui/Button';

type MarketplaceKey = 'meesho' | 'flipkart' | 'amazon' | 'myntra';
type PreviewTab = 'catalog' | 'ai' | 'margin';

const HERO_MARKETPLACE_PREVIEWS: Record<
  MarketplaceKey,
  {
    label: string;
    workflowMode: string;
    templateName: string;
    categoryPath: string;
    hsn: string;
    gst: string;
    rows: Array<{
      sku: string;
      title: string;
      price: string;
      mrp: string;
      variants: string;
      status: 'Ready' | 'Draft';
    }>;
    aiTitle: string;
    aiKeywords: string[];
    costPrice: number;
    sellingPrice: number;
    commissionFee: number;
    shippingEstimate: number;
    netSettlement: number;
    netProfit: number;
  }
> = {
  meesho: {
    label: 'Meesho',
    workflowMode: 'Chrome Extension MV3 Autofill + CSV/XLSX Export',
    templateName: 'Women Ethnic Kurtis — Standard 5% GST',
    categoryPath: 'Women Ethnic · Kurtis',
    hsn: '6204',
    gst: '5%',
    rows: [
      {
        sku: 'MSH-KRT-104',
        title: 'Mustard Printed Pure Rayon Straight Kurti',
        price: '₹449',
        mrp: '₹999',
        variants: '4 Sizes (M–XXL)',
        status: 'Ready',
      },
      {
        sku: 'MSH-ANK-209',
        title: 'Maroon Embroidered Festive Anarkali Set',
        price: '₹699',
        mrp: '₹1,499',
        variants: '5 Sizes (S–XXL)',
        status: 'Ready',
      },
      {
        sku: 'MSH-JWL-088',
        title: 'Kundan Bridal Bangle Set (24 Pcs)',
        price: '₹289',
        mrp: '₹599',
        variants: '3 Sizes (2.4–2.8)',
        status: 'Draft',
      },
    ],
    aiTitle: 'Women Mustard Yellow Foil Printed Rayon Straight Kurti — Round Neck 3/4 Sleeve (M to XXL)',
    aiKeywords: ['rayon straight kurti', 'printed daily wear kurti', 'festive ethnic kurti women', 'kurti under 500'],
    costPrice: 215,
    sellingPrice: 449,
    commissionFee: 0,
    shippingEstimate: 65,
    netSettlement: 362.62,
    netProfit: 132.62,
  },
  flipkart: {
    label: 'Flipkart',
    workflowMode: 'Attribute Mapping + Validated CSV/XLSX Feed',
    templateName: 'Men Casual Footwear — Sneakers 12% GST',
    categoryPath: 'Footwear · Men Casual Shoes',
    hsn: '6404',
    gst: '12%',
    rows: [
      {
        sku: 'FLK-SNK-401',
        title: 'Lightweight Mesh Running Sneakers White',
        price: '₹849',
        mrp: '₹1,999',
        variants: '5 Sizes (UK 6–10)',
        status: 'Ready',
      },
      {
        sku: 'FLK-LFR-118',
        title: 'Textured Synthetic Formal Loafers Tan',
        price: '₹749',
        mrp: '₹1,599',
        variants: '4 Sizes (UK 7–10)',
        status: 'Ready',
      },
      {
        sku: 'FLK-SLD-052',
        title: 'Cushioned EVA Daily Sliders Olive',
        price: '₹349',
        mrp: '₹799',
        variants: '4 Sizes (UK 6–9)',
        status: 'Draft',
      },
    ],
    aiTitle: 'Men White Breathable Mesh Lace-Up Casual Sneakers with Cushioned EVA Sole (UK 6–10)',
    aiKeywords: ['white casual sneakers men', 'lightweight walking shoes', 'daily wear lace up shoes', 'eva sole sneakers'],
    costPrice: 360,
    sellingPrice: 849,
    commissionFee: 102,
    shippingEstimate: 60,
    netSettlement: 596.04,
    netProfit: 221.04,
  },
  amazon: {
    label: 'Amazon India',
    workflowMode: 'Flat-File Columns + Bullet & Search Term Builder',
    templateName: 'Home & Kitchen — Stainless Organizers 18% GST',
    categoryPath: 'Home & Kitchen · Storage Racks',
    hsn: '7323',
    gst: '18%',
    rows: [
      {
        sku: 'AMZ-KTC-310',
        title: '2-Tier Rustproof Stainless Countertop Spice Rack',
        price: '₹999',
        mrp: '₹1,899',
        variants: 'Single Pack',
        status: 'Ready',
      },
      {
        sku: 'AMZ-ORG-144',
        title: 'Airtight BPA-Free Pantry Container Set (6 Pcs)',
        price: '₹649',
        mrp: '₹1,299',
        variants: 'Pack of 6',
        status: 'Ready',
      },
      {
        sku: 'AMZ-BTL-091',
        title: 'Insulated Double-Wall Steel Flask 1000ml',
        price: '₹579',
        mrp: '₹999',
        variants: '2 Colors',
        status: 'Ready',
      },
    ],
    aiTitle: 'Heavy-Duty 2-Tier Stainless Steel Kitchen Spice Organizer Rack — Rustproof Countertop Shelf',
    aiKeywords: ['kitchen spice rack steel', 'countertop jar organizer', '2 tier kitchen stand', 'rustproof pantry shelf'],
    costPrice: 410,
    sellingPrice: 999,
    commissionFee: 150,
    shippingEstimate: 70,
    netSettlement: 626.61,
    netProfit: 196.61,
  },
  myntra: {
    label: 'Myntra',
    workflowMode: 'Style Note, Care Rules & Apparel Attribute Templates',
    templateName: 'Contemporary Women Co-Ord Sets — 5% GST',
    categoryPath: 'Apparel · Western & Fusion Wear',
    hsn: '6204',
    gst: '5%',
    rows: [
      {
        sku: 'MYN-CRD-502',
        title: 'Sage Green Linen-Blend Tunic & Trouser Co-Ord',
        price: '₹949',
        mrp: '₹2,199',
        variants: '4 Sizes (XS–L)',
        status: 'Ready',
      },
      {
        sku: 'MYN-DRS-227',
        title: 'Indigo Block-Print Cotton A-Line Midi Dress',
        price: '₹899',
        mrp: '₹1,899',
        variants: '5 Sizes (XS–XL)',
        status: 'Ready',
      },
      {
        sku: 'MYN-TOP-163',
        title: 'Ivory Pleated Georgette Workwear Blouse',
        price: '₹649',
        mrp: '₹1,399',
        variants: '4 Sizes (S–XL)',
        status: 'Draft',
      },
    ],
    aiTitle: 'Sage Green Woven Linen-Blend Collar Tunic with Relaxed Straight Trousers Co-Ord Set',
    aiKeywords: ['linen blend co ord set', 'sage green women tunic set', 'summer office wear women', 'relaxed fit co-ords'],
    costPrice: 390,
    sellingPrice: 949,
    commissionFee: 142,
    shippingEstimate: 65,
    netSettlement: 696.81,
    netProfit: 286.81,
  },
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState<MarketplaceKey>('meesho');
  const [previewTab, setPreviewTab] = useState<PreviewTab>('catalog');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const activePreview = HERO_MARKETPLACE_PREVIEWS[selectedMarketplace];

  const faqs = [
    {
      q: 'Which marketplace workflows are supported right now?',
      a: 'LISTIVO supports reusable category templates, attribute mapping, AI title/keyword generation, GST & margin modeling, and CSV/XLSX catalog export for Meesho, Flipkart, Amazon India, and Myntra. In addition, the Manifest V3 Chrome Extension provides direct 1-click field autofill on the Meesho Seller Panel.',
    },
    {
      q: 'How does the Meesho Chrome Extension protect my existing product data?',
      a: 'By default, the LISTIVO Chrome Extension runs in Empty-Only mode so existing values in your seller form are preserved. Overwriting populated fields requires explicit seller confirmation, and every filled field is verified in the DOM before reporting completion.',
    },
    {
      q: 'Can I upload raw vendor spreadsheets and fix validation errors before exporting?',
      a: 'Yes. The Bulk Catalog Engine accepts CSV, XLS, and XLSX files up to 25 MB, maps vendor headers to standardized catalog fields, flags missing HSN codes or duplicate SKUs inline, and exports clean marketplace sheets.',
    },
    {
      q: 'How is my seller catalog and pricing data secured?',
      a: 'Every seller account operates inside an isolated workspace scoped to your authenticated session. Your templates, SKUs, sourcing costs, GSTIN, and pricing rules are never shared across accounts.',
    },
    {
      q: 'Do I need a credit card to create a workspace?',
      a: 'No. You can register a Free Seller account immediately with zero payment details and start creating templates, single listings, and profit calculations right away.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#101828] font-sans antialiased">
      {/* 1. TOP BAR CONTRACT: 3 ZONES (Brand | 5 Nav Links | Primary Action) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E4E7EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <Link to="/" className="whitespace-nowrap shrink-0">
            <ListivoLogo variant="light" size="md" />
          </Link>

          {/* Zone 2: 5 Concise Single-Line Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#667085]">
            <a href="#features" className="hover:text-[#101828] transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#workflow" className="hover:text-[#101828] transition-colors whitespace-nowrap shrink-0">
              Workflow
            </a>
            <a href="#marketplaces" className="hover:text-[#101828] transition-colors whitespace-nowrap shrink-0">
              Marketplaces
            </a>
            <a href="#pricing" className="hover:text-[#101828] transition-colors whitespace-nowrap shrink-0">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#101828] transition-colors whitespace-nowrap shrink-0">
              FAQ
            </a>
          </nav>

          {/* Zone 3: Auth CTA */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="px-3 py-2 text-xs font-semibold text-[#667085] hover:text-[#101828] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Log In
            </button>
            <Button variant="primary" size="sm" onClick={() => navigate('/auth/signup')}>
              Start Free Workspace
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-[#101828] hover:bg-[#F8FAFC] border border-[#E4E7EC] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#E4E7EC] px-4 py-4 space-y-3 animate-fadeIn">
            <div className="flex flex-col space-y-2 text-sm font-medium text-[#101828]">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Features
              </a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Workflow
              </a>
              <a href="#marketplaces" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Marketplaces
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Pricing
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                FAQ
              </a>
            </div>
            <div className="pt-3 border-t border-[#E4E7EC] grid grid-cols-2 gap-2.5">
              <Button variant="outline" size="sm" onClick={() => navigate('/auth/login')}>
                Log In
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/auth/signup')}>
                Start Free
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 2. ASYMMETRIC SPLIT HERO WITH LIVE INTERACTIVE WORKSPACE PREVIEW */}
      <section className="pt-12 pb-16 lg:pt-20 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Proposition Column */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <p className="text-xs font-semibold text-[#0F766E] tracking-wide">
              Catalog &amp; Listing Operations for Indian Sellers
            </p>

            <h1
              className="text-[clamp(2.25rem,3.8vw,3.5rem)] font-extrabold text-[#101828] tracking-tight leading-[1.12]"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              Build Accurate Marketplace Listings.{' '}
              <span className="text-[#14B8A6]">Faster.</span>
            </h1>

            <p className="text-base text-[#667085] leading-relaxed max-w-xl">
              Standardize category templates, validate bulk CSV and XLSX spreadsheets, model GST and settlement margins, and run verified Meesho autofill from one structured workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                onClick={() => navigate('/auth/signup')}
              >
                Create Free Account
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore How It Works
              </Button>
            </div>

            {/* Quiet Unboxed Metadata Trust Line */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#667085] pt-2">
              <span>No credit card required</span>
              <span aria-hidden="true">·</span>
              <span>Tenant-isolated catalog</span>
              <span aria-hidden="true">·</span>
              <span>GST &amp; HSN validation built in</span>
            </div>
          </div>

          {/* Right Live Interactive Workspace Preview */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-lg overflow-hidden">
              {/* Interactive Top Control Bar */}
              <div className="bg-[#101828] px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <ListivoLogo variant="dark" size="sm" />
                  <span className="hidden sm:inline text-white/25">|</span>
                  <span className="hidden sm:inline text-[11px] text-[#98A2B3] font-medium">
                    Interactive Product Preview
                  </span>
                </div>

                {/* Live Marketplace Switcher */}
                <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-lg border border-white/10">
                  {(['meesho', 'flipkart', 'amazon', 'myntra'] as MarketplaceKey[]).map((mp) => (
                    <button
                      key={mp}
                      type="button"
                      onClick={() => setSelectedMarketplace(mp)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        selectedMarketplace === mp
                          ? 'bg-[#14B8A6] text-white'
                          : 'text-[#98A2B3] hover:text-white'
                      }`}
                    >
                      {HERO_MARKETPLACE_PREVIEWS[mp].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workspace Split Frame (Mini Deep Navy Rail + Light Canvas) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 bg-[#F8FAFC]">
                {/* Mini Deep Navy Sidebar */}
                <div className="hidden sm:flex sm:col-span-3 bg-[#101828] p-3 flex-col justify-between border-r border-[#1D2939] text-xs">
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('catalog')}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                        previewTab === 'catalog'
                          ? 'bg-[#14B8A6]/15 text-white border border-[#14B8A6]/30'
                          : 'text-[#98A2B3] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5 text-[#14B8A6] shrink-0" />
                      <span className="truncate">Catalog Grid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('ai')}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                        previewTab === 'ai'
                          ? 'bg-[#14B8A6]/15 text-white border border-[#14B8A6]/30'
                          : 'text-[#98A2B3] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#60A5FA] shrink-0" />
                      <span className="truncate">Smart Listing</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('margin')}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                        previewTab === 'margin'
                          ? 'bg-[#14B8A6]/15 text-white border border-[#14B8A6]/30'
                          : 'text-[#98A2B3] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Calculator className="w-3.5 h-3.5 text-[#14B8A6] shrink-0" />
                      <span className="truncate">Margin Check</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 mt-6">
                    <div className="text-[10px] text-[#98A2B3]">Active Template</div>
                    <div className="text-[11px] font-semibold text-white mt-0.5 line-clamp-2">
                      {activePreview.templateName}
                    </div>
                    <div className="text-[10px] font-mono text-[#2DD4BF] mt-1">
                      HSN {activePreview.hsn} · GST {activePreview.gst}
                    </div>
                  </div>
                </div>

                {/* Interactive Workspace Canvas */}
                <div className="sm:col-span-9 p-4 sm:p-5 space-y-4">
                  {/* Mobile Preview Mode Switcher */}
                  <div className="flex sm:hidden items-center gap-1 bg-white p-1 rounded-lg border border-[#E4E7EC]">
                    {[
                      { id: 'catalog', label: 'Catalog' },
                      { id: 'ai', label: 'Smart AI' },
                      { id: 'margin', label: 'Margin' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPreviewTab(t.id as PreviewTab)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                          previewTab === t.id ? 'bg-[#101828] text-white' : 'text-[#667085]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Context Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E4E7EC]">
                    <div>
                      <div className="text-xs font-semibold text-[#101828]">
                        {activePreview.label} Workspace · {activePreview.categoryPath}
                      </div>
                      <div className="text-[11px] text-[#667085] mt-0.5">
                        {activePreview.workflowMode}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-medium text-[#0F766E] bg-[#14B8A6]/10 border border-[#14B8A6]/25 px-2 py-0.5 rounded-md">
                      HSN {activePreview.hsn} · GST {activePreview.gst}
                    </span>
                  </div>

                  {/* Tab 1: Compact Catalog Table */}
                  {previewTab === 'catalog' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="bg-white rounded-lg border border-[#E4E7EC] overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[11px] font-semibold text-[#667085]">
                            <tr>
                              <th className="py-2 px-3">SKU / Product</th>
                              <th className="py-2 px-3">Variants</th>
                              <th className="py-2 px-3 text-right">Price</th>
                              <th className="py-2 px-3 text-right">State</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E4E7EC]">
                            {activePreview.rows.map((row) => (
                              <tr key={row.sku} className="hover:bg-[#F8FAFC]">
                                <td className="py-2.5 px-3">
                                  <div className="font-semibold text-[#101828] line-clamp-1">{row.title}</div>
                                  <div className="font-mono text-[10px] text-[#667085]">{row.sku}</div>
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-[#667085] whitespace-nowrap">
                                  {row.variants}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                                  <span className="font-semibold text-[#101828]">{row.price}</span>
                                  <span className="text-[10px] text-[#667085] line-through ml-1">{row.mrp}</span>
                                </td>
                                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                      row.status === 'Ready'
                                        ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]'
                                        : 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
                                    }`}
                                  >
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#667085] px-1">
                        <span>Click Smart Listing or Margin Check on the left rail to inspect tools</span>
                        <button
                          type="button"
                          onClick={() => setPreviewTab('ai')}
                          className="font-semibold text-[#0F766E] hover:underline cursor-pointer"
                        >
                          Inspect AI Output →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Smart Listing & Keyword AI */}
                  {previewTab === 'ai' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="bg-white rounded-lg border border-[#E4E7EC] p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#101828]">Generated Marketplace Title</span>
                          <span className="font-mono text-[#667085]">
                            {activePreview.aiTitle.length} chars
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[#101828] bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E4E7EC]">
                          {activePreview.aiTitle}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg border border-[#E4E7EC] p-3.5 space-y-2">
                        <div className="text-[11px] font-semibold text-[#101828]">
                          Extracted Buyer Search Terms ({activePreview.label})
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {activePreview.aiKeywords.map((kw) => (
                            <span
                              key={kw}
                              className="px-2 py-1 rounded-md bg-[#F8FAFC] border border-[#E4E7EC] text-[11px] text-[#101828] font-medium"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Net Settlement & GST Calculator */}
                  {previewTab === 'margin' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="bg-white p-3 rounded-lg border border-[#E4E7EC]">
                          <div className="text-[10px] text-[#667085] font-medium">Selling Price</div>
                          <div className="text-base font-mono font-bold text-[#101828] mt-0.5">
                            ₹{activePreview.sellingPrice}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-[#E4E7EC]">
                          <div className="text-[10px] text-[#667085] font-medium">Est. Settlement</div>
                          <div className="text-base font-mono font-bold text-[#101828] mt-0.5">
                            ₹{activePreview.netSettlement.toFixed(0)}
                          </div>
                        </div>
                        <div className="bg-[#ECFDF3] p-3 rounded-lg border border-[#ABEFC6]">
                          <div className="text-[10px] text-[#067647] font-semibold">Est. Net Profit</div>
                          <div className="text-base font-mono font-bold text-[#067647] mt-0.5">
                            +₹{activePreview.netProfit.toFixed(0)}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-[#E4E7EC] p-3 text-xs space-y-1.5">
                        <div className="flex justify-between text-[#667085]">
                          <span>Product Sourcing Cost</span>
                          <span className="font-mono text-[#101828]">₹{activePreview.costPrice}.00</span>
                        </div>
                        <div className="flex justify-between text-[#667085]">
                          <span>Commission + Shipping Estimate</span>
                          <span className="font-mono text-[#101828]">
                            ₹{(activePreview.commissionFee + activePreview.shippingEstimate).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#667085] pt-1 border-t border-[#E4E7EC]">
                          <span>Inclusive GST Slab ({activePreview.gst})</span>
                          <span className="font-mono font-semibold text-[#0F766E]">Included in Settlement</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MARKETPLACE WORKFLOWS SECTION */}
      <section id="marketplaces" className="py-16 lg:py-20 bg-white border-y border-[#E4E7EC] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold text-[#0F766E]">Marketplace Compatibility</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
              Structured Catalog Formatting Across Four Major Platforms
            </h2>
            <p className="text-sm text-[#667085] leading-relaxed">
              Maintain one clean product master with HSN codes, GST slabs, variant matrices, and hosted image slots—formatted for each marketplace&apos;s exact catalog structure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#101828]">Meesho</h3>
                  <span className="text-[11px] font-semibold text-[#0F766E]">Extension + CSV</span>
                </div>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Includes our Manifest V3 Chrome Extension for 1-click field autofill on the Meesho Seller Panel with Empty-Only safety protection, plus bulk sheet exports.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E4E7EC] text-[11px] text-[#667085]">
                Verified DOM field fill · 0% commission preset
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#101828]">Flipkart</h3>
                  <span className="text-[11px] font-semibold text-[#667085]">Templates + Export</span>
                </div>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Map mandatory category specifications, brand attributes, package dimensions, and volumetric weights into clean CSV and XLSX catalog exports.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E4E7EC] text-[11px] text-[#667085]">
                Attribute validation · Tiered fee calculator
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#101828]">Amazon India</h3>
                  <span className="text-[11px] font-semibold text-[#667085]">Templates + Export</span>
                </div>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Generate structured bullet features, search terms, SKU variant hierarchies, and flat-file ready spreadsheets with inline field checks.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E4E7EC] text-[11px] text-[#667085]">
                5-bullet builder · Backend search terms
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#101828]">Myntra</h3>
                  <span className="text-[11px] font-semibold text-[#667085]">Templates + Export</span>
                </div>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Standardize fabric composition, wash-care instructions, fit attributes, and multi-angle image slot ordering for fashion and lifestyle catalogs.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E4E7EC] text-[11px] text-[#667085]">
                Fabric &amp; care templates · Ordered image slots
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ASYMMETRIC BENTO CAPABILITIES SECTION */}
      <section id="features" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold text-[#0F766E]">Core Capabilities</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
            Every Tool Needed to Prepare, Validate, and Price Your Catalog
          </h2>
          <p className="text-sm text-[#667085] leading-relaxed">
            Built around real daily cataloging tasks instead of generic chat prompts—reducing repetitive data entry and rejected spreadsheet uploads.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Bento Card 1: Span 7 */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#E4E7EC] p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#101828] text-[#14B8A6] flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-[#101828]">
                01. Bulk CSV &amp; XLSX Spreadsheet Validator
              </h3>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                Drop raw vendor files up to 25 MB, map columns once with reusable presets, apply category template defaults to blank cells, and fix duplicate SKUs or missing HSN codes in an inline spreadsheet editor before exporting.
              </p>
            </div>

            <div className="bg-[#F8FAFC] rounded-lg border border-[#E4E7EC] p-3.5 grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-[11px] text-[#667085]">Column Presets</div>
                <div className="font-semibold text-[#101828] mt-0.5">Auto-Header Match</div>
              </div>
              <div>
                <div className="text-[11px] text-[#667085]">Inline Audit</div>
                <div className="font-semibold text-[#101828] mt-0.5">SKU, Price &amp; HSN</div>
              </div>
              <div>
                <div className="text-[11px] text-[#667085]">Clean Output</div>
                <div className="font-mono font-semibold text-[#0F766E] mt-0.5">.CSV &amp; .XLSX</div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Span 5 */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#E4E7EC] p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#14B8A6]/10 text-[#0F766E] flex items-center justify-center mb-3">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-[#101828]">
                02. Reusable Category Templates
              </h3>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                Store GST slabs, HSN codes, package dimensions, fabric/material specs, and variant size matrices once—then spin up compliant product listings in one click.
              </p>
            </div>

            <div className="bg-[#F8FAFC] rounded-lg border border-[#E4E7EC] p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#667085]">Default Tax Rule</span>
                <span className="font-mono font-semibold text-[#101828]">GST 5% · HSN 6204</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Package Dimensions</span>
                <span className="font-mono font-semibold text-[#101828]">28 × 22 × 4 cm · 250g</span>
              </div>
            </div>
          </div>

          {/* Bento Card 3: Span 4 */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E4E7EC] p-6 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#EFF8FF] text-[#175CD3] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#101828]">
              03. Smart Listing &amp; Keyword AI
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              Convert brief product notes into structured marketplace titles, 5-point feature bullets, buyer descriptions, and categorized search keywords with quality scoring.
            </p>
          </div>

          {/* Bento Card 4: Span 4 */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E4E7EC] p-6 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#14B8A6]/10 text-[#0F766E] flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#101828]">
              04. Price &amp; Settlement Calculator
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              Model inclusive GST, fixed and percentage commissions, packaging, and shipping costs to find your exact break-even price and target margin per SKU.
            </p>
          </div>

          {/* Bento Card 5: Span 4 */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E4E7EC] p-6 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#101828] text-white flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#101828]">
              05. Image Workspace &amp; Companion
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              Validate image aspect ratios, crop/resize in-browser via HTML5 Canvas, assign primary covers across listings, and sync ready products to the Meesho Chrome Extension.
            </p>
          </div>
        </div>
      </section>

      {/* 5. WORKFLOW SECTION (DEEP NAVY CONTRAST ANCHOR) */}
      <section id="workflow" className="py-16 lg:py-24 bg-[#101828] text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold text-[#2DD4BF] tracking-wide">Three-Step Seller Workflow</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              From Raw Product Notes to Validated Listings in Minutes
            </h2>
            <p className="text-sm text-[#98A2B3] leading-relaxed">
              Designed so catalog managers and store owners spend less time re-entering repetitive tax, attribute, and variant fields.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white/[0.04] border border-white/10 space-y-3">
              <span className="font-mono text-xs font-bold text-[#14B8A6]">STEP 01</span>
              <h3 className="text-base font-bold text-white tracking-wide">
                Set Up Store &amp; Category Templates
              </h3>
              <p className="text-xs text-[#98A2B3] leading-relaxed">
                Enter your business profile, GSTIN, pickup pincode, and create reusable templates for your core categories like Apparel, Footwear, Jewelry, or Home.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/[0.04] border border-white/10 space-y-3">
              <span className="font-mono text-xs font-bold text-[#60A5FA]">STEP 02</span>
              <h3 className="text-base font-bold text-white tracking-wide">
                Enrich, Price &amp; Validate SKUs
              </h3>
              <p className="text-xs text-[#98A2B3] leading-relaxed">
                Build single listings, generate SEO titles and keywords with AI, or upload vendor CSV/XLSX sheets to validate required fields and net profit margins.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/[0.04] border border-white/10 space-y-3">
              <span className="font-mono text-xs font-bold text-[#14B8A6]">STEP 03</span>
              <h3 className="text-base font-bold text-white tracking-wide">
                Export Sheets or Run Meesho Autofill
              </h3>
              <p className="text-xs text-[#98A2B3] leading-relaxed">
                Download clean CSV/XLSX catalog files for marketplace upload, or use the LISTIVO Chrome Extension to autofill verified fields inside the Meesho Seller Panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT PRICING SECTION */}
      <section id="pricing" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-xs font-semibold text-[#0F766E]">Transparent Plans</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
            Straightforward Pricing Built for Growing Sellers
          </h2>
          <p className="text-sm text-[#667085]">
            Start on the Free Seller plan with zero upfront commitment. Upgrade when your catalog volume scales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          {/* Free Tier */}
          <div className="p-7 rounded-xl bg-white border border-[#E4E7EC] flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-[#667085]">For early-stage &amp; single-store sellers</p>
                <h3 className="text-lg font-bold text-[#101828] mt-1">Free Seller Plan</h3>
                <div className="flex items-baseline gap-1.5 mt-3">
                  <span className="text-3xl font-extrabold font-mono text-[#101828]">₹0</span>
                  <span className="text-xs text-[#667085]">/ month</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-[#101828] pt-4 border-t border-[#E4E7EC]">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#14B8A6] shrink-0" />
                  <span>Up to 5 reusable category templates</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#14B8A6] shrink-0" />
                  <span>Single product listing builder &amp; validation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#14B8A6] shrink-0" />
                  <span>Single SKU GST &amp; net profit calculator</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#14B8A6] shrink-0" />
                  <span>Meesho Chrome Companion Extension sync</span>
                </li>
              </ul>
            </div>

            <Button variant="outline" size="md" className="w-full" onClick={() => navigate('/auth/signup')}>
              Get Started Free
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="p-7 rounded-xl bg-white border-2 border-[#14B8A6] flex flex-col justify-between space-y-6 relative">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[#0F766E]">For high-SKU &amp; multi-marketplace teams</p>
                  <h3 className="text-lg font-bold text-[#101828] mt-1">Pro Seller Workspace</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-[#14B8A6]/10 border border-[#14B8A6]/30 text-[#0F766E] text-[11px] font-semibold">
                  Recommended
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-mono text-[#101828]">₹499</span>
                <span className="text-xs text-[#667085]">/ month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-[#101828] pt-4 border-t border-[#E4E7EC]">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#14B8A6] shrink-0" />
                  <span>Unlimited category templates &amp; attribute presets</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#14B8A6] shrink-0" />
                  <span>Bulk CSV / XLSX validator, inline editor &amp; export</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#14B8A6] shrink-0" />
                  <span>Smart Listing AI generator &amp; Keyword Intelligence</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#14B8A6] shrink-0" />
                  <span>Multi-slot Image Workspace &amp; Bulk Price Rules</span>
                </li>
              </ul>
            </div>

            <Button variant="primary" size="md" className="w-full" onClick={() => navigate('/auth/signup')}>
              Create Pro-Ready Workspace
            </Button>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq" className="py-16 lg:py-20 bg-white border-t border-[#E4E7EC] px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold text-[#0F766E]">Frequently Asked Questions</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
              Clear Answers on Workflows, Security &amp; Setup
            </h2>
          </div>

          <div className="divide-y divide-[#E4E7EC] border border-[#E4E7EC] rounded-xl bg-[#F8FAFC] overflow-hidden">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left text-sm font-semibold text-[#101828] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#667085] shrink-0 transition-transform duration-150 ${
                        isOpen ? 'rotate-180 text-[#14B8A6]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-[#667085] leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FINAL CONVERSION BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] border-t border-[#E4E7EC]">
        <div className="max-w-5xl mx-auto bg-[#101828] rounded-xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Ready to organize your marketplace catalog in one place?
            </h2>
            <p className="text-xs sm:text-sm text-[#98A2B3]">
              Set up your seller workspace, save your first GST &amp; HSN category template, and streamline every product upload.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button variant="primary" size="md" onClick={() => navigate('/auth/signup')}>
              Start Free Workspace
            </Button>
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="px-4 py-2 text-xs font-semibold text-white border border-white/20 hover:bg-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* 9. QUIET STRUCTURED FOOTER */}
      <footer className="bg-white border-t border-[#E4E7EC] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <ListivoLogo variant="light" size="sm" />
            <p className="text-xs text-[#667085]">
              Catalog templates, bulk validation, margin modeling &amp; seller tools for Indian e-commerce.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#667085]">
            <a href="#features" className="hover:text-[#101828] transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-[#101828] transition-colors">
              Workflow
            </a>
            <a href="#marketplaces" className="hover:text-[#101828] transition-colors">
              Marketplaces
            </a>
            <a href="#pricing" className="hover:text-[#101828] transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#101828] transition-colors">
              FAQ
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#E4E7EC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667085]">
          <span>© {new Date().getFullYear()} Listivo. All rights reserved.</span>
          <span>Encrypted &amp; tenant-isolated seller workspaces.</span>
        </div>
      </footer>
    </div>
  );
};
