import React from 'react';
import { Link } from 'react-router-dom';
import { Puzzle, FileText, FileSpreadsheet, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const TutorialsPage: React.FC = () => {
  const workflows = [
    {
      step: '01',
      title: 'Reusable Catalog Templates',
      description:
        'Configure category-specific HSN codes, GST slabs, fabric/material defaults, and size variant matrices once so every new SKU starts compliant.',
      link: '/templates',
      linkLabel: 'Open Templates',
      icon: <FileText className="w-4 h-4 text-[#0F766E]" />,
    },
    {
      step: '02',
      title: 'Structured Listings & Validation',
      description:
        'Build complete product records with title length validation, inclusive GST margin checks, ordered image galleries, and variant-level SKUs.',
      link: '/listings',
      linkLabel: 'Open Listings',
      icon: <ShieldCheck className="w-4 h-4 text-[#0F766E]" />,
    },
    {
      step: '03',
      title: 'Bulk CSV / XLSX Spreadsheet Sync',
      description:
        'Import supplier spreadsheets, map columns to LISTIVO fields, resolve row-level validation warnings inline, and export clean marketplace sheets.',
      link: '/bulk',
      linkLabel: 'Open Bulk Catalog',
      icon: <FileSpreadsheet className="w-4 h-4 text-[#0F766E]" />,
    },
  ];

  const extensionSteps = [
    'Open Google Chrome and navigate to chrome://extensions in the address bar.',
    'Toggle "Developer mode" ON in the top-right corner of the Extensions page.',
    'Click "Load unpacked" in the top-left toolbar and select the compiled /extension/dist directory.',
    'Pin the LISTIVO Extension icon in Chrome, sign in with your seller account, and open your Meesho Seller Panel catalog form.',
    'Select a verified LISTIVO product listing and run Autofill in "Empty Only" mode (preserves any fields you already typed).',
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="border-b border-[#E4E7EC] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101828]">
          Documentation & Extension Setup
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Step-by-step reference for catalog templates, bulk spreadsheet validation, and the Manifest V3 Chrome Extension.
        </p>
      </div>

      {/* Core Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {workflows.map((wf) => (
          <Card key={wf.step} className="border-[#E4E7EC] bg-white flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] flex items-center justify-center">
                  {wf.icon}
                </div>
                <span className="font-mono text-xs font-semibold text-[#667085]">{wf.step}</span>
              </div>
              <h2 className="text-sm font-semibold text-[#101828]">{wf.title}</h2>
              <p className="text-xs text-[#667085] leading-relaxed">{wf.description}</p>
            </div>

            <Link
              to={wf.link}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:text-[#101828] transition-colors pt-2 border-t border-[#E4E7EC]"
            >
              <span>{wf.linkLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        ))}
      </div>

      {/* Chrome Extension Installation Guide */}
      <Card padding="none" className="border-[#E4E7EC] bg-white overflow-hidden">
        <div className="px-5 py-4 bg-[#101828] text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/15 border border-[#14B8A6]/30 flex items-center justify-center">
              <Puzzle className="w-4 h-4 text-[#14B8A6]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Meesho Chrome Extension — Unpacked Installation Guide
              </h2>
              <p className="text-xs text-[#98A2B3]">Manifest V3 extension output located at /extension/dist</p>
            </div>
          </div>
          <span className="font-mono text-xs text-[#14B8A6] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            chrome://extensions
          </span>
        </div>

        <div className="p-5 space-y-3">
          <ol className="space-y-2.5">
            {extensionSteps.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] text-xs text-[#101828]"
              >
                <span className="w-5 h-5 rounded bg-[#101828] text-white font-mono font-semibold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );
};
