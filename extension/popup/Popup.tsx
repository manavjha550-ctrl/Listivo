import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Crown,
  ExternalLink,
  RefreshCw,
  Power,
  LayoutDashboard,
  FileText,
  AlertCircle,
  Building2,
  CheckCircle2,
  Settings,
  Layers,
} from 'lucide-react';
import { ExtensionAuthState, ExtensionSellerProfile, ExtensionSettings } from '../shared/types';
import { extensionApi } from '../shared/api';
import { extensionStorage } from '../shared/storage';
import { DEFAULT_SERVER_URL } from '../shared/constants';

export const Popup: React.FC = () => {
  const [authState, setAuthState] = useState<ExtensionAuthState>('CONNECTING');
  const [seller, setSeller] = useState<ExtensionSellerProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState<ExtensionSettings>({
    serverUrl: DEFAULT_SERVER_URL,
    connectionStatus: 'NOT_CONNECTED',
    marketplaceDetectionEnabled: true,
    isDevMode: true,
  });
  const [activeTab, setActiveTab] = useState<'main' | 'settings'>('main');
  const [customServerInput, setCustomServerInput] = useState('');

  // Initial load
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setAuthState('CONNECTING');
    setErrorMessage(null);

    const loadedSettings = await extensionStorage.getSettings();
    setSettings(loadedSettings);
    setCustomServerInput(loadedSettings.serverUrl);

    try {
      const res = await extensionApi.getAuthStatus();
      setAuthState(res.status);
      setSeller(res.seller);
      if (res.status === 'SESSION_EXPIRED') {
        setErrorMessage(res.message || 'Your LISTIVO session has expired.');
      }
    } catch (err: any) {
      setAuthState('ERROR');
      setErrorMessage(err.message || 'Failed to connect to LISTIVO platform.');
    }
  };

  const handleConnect = () => {
    const targetUrl = settings.serverUrl || DEFAULT_SERVER_URL;
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: `${targetUrl}/login?src=extension` });
    } else {
      window.open(`${targetUrl}/login?src=extension`, '_blank');
    }
  };

  const handleOpenDashboard = () => {
    const targetUrl = settings.serverUrl || DEFAULT_SERVER_URL;
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: `${targetUrl}/dashboard` });
    } else {
      window.open(`${targetUrl}/dashboard`, '_blank');
    }
  };

  const handleOpenTemplates = () => {
    const targetUrl = settings.serverUrl || DEFAULT_SERVER_URL;
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: `${targetUrl}/templates` });
    } else {
      window.open(`${targetUrl}/templates`, '_blank');
    }
  };

  const handleDisconnect = async () => {
    await extensionApi.disconnectSession();
    setAuthState('NOT_CONNECTED');
    setSeller(null);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    let cleanedUrl = customServerInput.trim();
    if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
      cleanedUrl = `http://${cleanedUrl}`;
    }
    const updated = await extensionStorage.saveSettings({ serverUrl: cleanedUrl });
    setSettings(updated);
    setActiveTab('main');
    checkConnection();
  };

  return (
    <div className="w-[360px] min-h-[460px] bg-[#0B0F19] text-slate-100 font-sans p-5 flex flex-col justify-between selection:bg-indigo-500 selection:text-white antialiased">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-indigo-500/20">
              L
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>LISTIVO</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  EXT
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Marketplace Listing Automation</div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab(activeTab === 'main' ? 'settings' : 'main')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Extension Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Development Mode Banner */}
        {settings.isDevMode && (
          <div className="mt-3 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-[10px] font-bold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              LISTIVO Extension • Development Build
            </span>
            <span className="text-[9px] text-amber-400/80">v1.0.0</span>
          </div>
        )}

        {/* Tab View Switcher */}
        {activeTab === 'settings' ? (
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Extension Settings</h2>
              <p className="text-[11px] text-slate-400">Configure your LISTIVO backend server URL.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">LISTIVO Server URL</label>
                <input
                  type="text"
                  value={customServerInput}
                  onChange={(e) => setCustomServerInput(e.target.value)}
                  placeholder="e.g. http://localhost:3000"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Save & Reconnect
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('main')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Main States */
          <div className="mt-5 space-y-5">
            {/* A. NOT CONNECTED */}
            {authState === 'NOT_CONNECTED' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center space-y-4 shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-extrabold text-white">Not Connected</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Connect your authenticated LISTIVO seller account to autofill marketplace listing forms using your templates.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleConnect}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Power className="w-4 h-4" />
                    <span>Connect LISTIVO</span>
                  </button>

                  <button
                    onClick={handleOpenDashboard}
                    className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open LISTIVO Platform</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* B. CONNECTING */}
            {authState === 'CONNECTING' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                <div className="text-xs font-bold text-slate-300">Connecting to LISTIVO...</div>
                <div className="text-[11px] text-slate-500">Checking seller authentication handshake</div>
              </div>
            )}

            {/* C. CONNECTED */}
            {authState === 'CONNECTED' && seller && (
              <div className="space-y-4">
                {/* Seller Profile Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 relative">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Status: Connected
                      </span>
                    </div>

                    {seller.isOwner ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Crown className="w-3 h-3 text-emerald-400 fill-emerald-400" /> Owner
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-slate-400" /> Seller
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Connected as:</div>
                    <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <span>{seller.fullName}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Store:</div>
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{seller.companyName || 'Store Panel'}</span>
                    </div>
                  </div>
                </div>

                {/* Connected Action Buttons */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleOpenDashboard}
                      className="py-2.5 px-3 bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={handleOpenTemplates}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700/80 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Templates</span>
                    </button>
                  </div>

                  <button
                    onClick={handleDisconnect}
                    className="w-full py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold rounded-xl border border-rose-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Disconnect LISTIVO</span>
                  </button>
                </div>
              </div>
            )}

            {/* D. SESSION EXPIRED */}
            {authState === 'SESSION_EXPIRED' && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-center space-y-3">
                <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-rose-300">Session Expired</div>
                  <p className="text-[11px] text-slate-400">
                    Your LISTIVO session has expired. Please sign in again to restore extension access.
                  </p>
                </div>
                <button
                  onClick={handleConnect}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Sign in again
                </button>
              </div>
            )}

            {/* E. ERROR STATE */}
            {authState === 'ERROR' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
                <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-200">Connection Error</div>
                  <p className="text-[11px] text-slate-400">{errorMessage || 'Unable to communicate with LISTIVO backend.'}</p>
                </div>
                <button
                  onClick={checkConnection}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Connection</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="pt-4 mt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500 flex items-center justify-between">
        <span>Phase 8A Extension</span>
        <button
          onClick={checkConnection}
          className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      </footer>
    </div>
  );
};
